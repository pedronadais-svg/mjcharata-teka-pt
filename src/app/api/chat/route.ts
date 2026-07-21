import { streamText, stepCountIs } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { loadContext, buildSystemPrompt } from '@/lib/chat/context-loader';
import { chatTools } from '@/lib/chat/tools';
import { saveConversation } from '@/lib/chat/conversation-store';
import { resolveModelId } from '@/lib/chat/models';
import { processMessage } from '@/lib/chat/engine';

export async function POST(request: Request) {
  const body = await request.json();

  // Se o body contém "message" (string) → modo fallback rule-based
  if (body.message) {
    const { message, state } = body;
    const { response, newState } = processMessage(
      message,
      state || { flow: 'idle', step: 0, context: {} },
    );
    return Response.json({ response, state: newState });
  }

  // Se contém "messages" (array) → Claude API com streaming e tools
  const { messages, conversationId } = body;

  if (!messages || messages.length === 0) {
    return Response.json({ error: 'Mensagem obrigatória' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'API key não configurada' }, { status: 503 });
  }

  const context = loadContext();
  const systemPrompt = buildSystemPrompt(context);
  const modelId = resolveModelId(context.toneConfig.model);

  const result = streamText({
    model: anthropic(modelId),
    system: systemPrompt,
    messages,
    tools: chatTools,
    stopWhen: stepCountIs(5),
    temperature: context.toneConfig.temperature || 0.7,
    maxOutputTokens: context.toneConfig.maxTokens || 1024,

    onFinish: async ({ text, toolCalls, usage }) => {
      try {
        const input = usage?.inputTokens ?? 0;
        const output = usage?.outputTokens ?? 0;
        await saveConversation({
          conversationId: conversationId || `conv-${Date.now().toString(36)}`,
          messages: messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
          })),
          response: text,
          toolCalls: toolCalls as unknown[],
          tokensUsed: { promptTokens: input, completionTokens: output, totalTokens: input + output },
        });
      } catch (error) {
        console.error('[CHAT] Erro ao gravar conversa:', error);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
