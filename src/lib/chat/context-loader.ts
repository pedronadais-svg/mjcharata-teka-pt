import 'server-only';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data/chatbot');

export interface ChatContext {
  systemPrompt: string;
  knowledgeBase: string;
  faqs: string;
  toneConfig: {
    personality: string;
    formality: string;
    greeting: string;
    farewell: string;
    errorMessage: string;
    escalationMessage: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  blockedTopics: string;
}

function readFile(filename: string): string {
  try {
    return fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8');
  } catch {
    return '';
  }
}

function readJson<T>(filename: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8'));
  } catch {
    return fallback;
  }
}

export function loadContext(): ChatContext {
  const systemPrompt = readFile('system-prompt.md');

  const kb = readJson<{ entries: Array<{ topic: string; content: string }> }>(
    'knowledge-base.json',
    { entries: [] }
  );
  const knowledgeBase = kb.entries.map((e) => `### ${e.topic}\n${e.content}`).join('\n\n');

  const customFaqs = readJson<{ faqs: Array<{ question: string; answer: string }> }>(
    'custom-faqs.json',
    { faqs: [] }
  );
  const faqsText = customFaqs.faqs.map((f) => `P: ${f.question}\nR: ${f.answer}`).join('\n\n');

  const toneRaw = readJson<Record<string, unknown>>('tone-config.json', {});
  const toneConfig = {
    personality: (toneRaw.personality as string) || 'profissional-acolhedor',
    formality: (toneRaw.formality as string) || 'formal',
    greeting: (toneRaw.greeting as string) || 'Olá! Sou o Assistente Teka.',
    farewell: (toneRaw.farewell as string) || 'Obrigado por contactar a Teka!',
    errorMessage: (toneRaw.errorMessage as string) || 'Peço desculpa, ocorreu um erro.',
    escalationMessage: (toneRaw.escalationMessage as string) || 'Contacte +244 933 302 752.',
    model: (toneRaw.model as string) || 'claude-sonnet-4-6',
    temperature: (toneRaw.temperature as number) || 0.7,
    maxTokens: (toneRaw.maxTokens as number) || 1024,
  };

  const blocked = readJson<{ blockedTopics: string[]; blockedResponse: string }>(
    'blocked-topics.json',
    { blockedTopics: [], blockedResponse: '' }
  );
  const blockedTopics = `Tópicos proibidos: ${blocked.blockedTopics.join(', ')}.\nSe perguntarem sobre estes temas, responde: "${blocked.blockedResponse}"`;

  return { systemPrompt, knowledgeBase, faqs: faqsText, toneConfig, blockedTopics };
}

export function buildSystemPrompt(context: ChatContext): string {
  return `${context.systemPrompt}

## BASE DE CONHECIMENTO
${context.knowledgeBase}

## PERGUNTAS FREQUENTES ADICIONAIS
${context.faqs}

## TOM E PERSONALIDADE
Personalidade: ${context.toneConfig.personality}
Formalidade: ${context.toneConfig.formality}

## REGRAS DE SEGURANÇA
${context.blockedTopics}`;
}
