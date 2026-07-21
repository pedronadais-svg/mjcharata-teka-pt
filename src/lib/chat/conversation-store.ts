// Gestão de histórico de conversas — Postgres via Drizzle.

import 'server-only';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { conversations } from '@/lib/db/schema';

const MAX_CONVERSATIONS = 100;

export interface ConversationRecord {
  id: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  totalTokens: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    toolCalls?: unknown[];
  }>;
}

async function loadStore(): Promise<ConversationRecord[]> {
  const rows = await db
    .select({ data: conversations.data })
    .from(conversations)
    .orderBy(sql`${conversations.data}->>'lastMessageAt' desc`)
    .limit(MAX_CONVERSATIONS);
  return rows.map((r) => r.data as ConversationRecord);
}

export async function saveConversation(data: {
  conversationId: string;
  messages: Array<{ role: string; content: string }>;
  response: string;
  toolCalls?: unknown[];
  tokensUsed?: { promptTokens: number; completionTokens: number; totalTokens: number };
}): Promise<void> {
  const [existingRow] = await db
    .select({ data: conversations.data })
    .from(conversations)
    .where(eq(conversations.id, data.conversationId))
    .limit(1);

  const now = new Date().toISOString();
  const existing = existingRow?.data as ConversationRecord | undefined;

  let record: ConversationRecord;

  if (existing) {
    record = {
      ...existing,
      lastMessageAt: now,
      messageCount: data.messages.length + 1,
      totalTokens: existing.totalTokens + (data.tokensUsed?.totalTokens || 0),
      messages: [
        ...existing.messages,
        ...data.messages.slice(-2).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: now,
        })),
        ...(data.response
          ? [{ role: 'assistant' as const, content: data.response, timestamp: now, toolCalls: data.toolCalls }]
          : []),
      ],
    };
  } else {
    record = {
      id: data.conversationId,
      startedAt: now,
      lastMessageAt: now,
      messageCount: data.messages.length + 1,
      totalTokens: data.tokensUsed?.totalTokens || 0,
      messages: [
        ...data.messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: now,
        })),
        ...(data.response
          ? [{ role: 'assistant' as const, content: data.response, timestamp: now, toolCalls: data.toolCalls }]
          : []),
      ],
    };
  }

  await db
    .insert(conversations)
    .values({ id: record.id, data: record as object, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: conversations.id,
      set: { data: record as object, updatedAt: new Date() },
    });

  // Mantém só as MAX_CONVERSATIONS mais recentes (mesmo limite do store antigo).
  await db.execute(sql`
    delete from ${conversations}
    where ${conversations.id} not in (
      select id from ${conversations}
      order by data->>'lastMessageAt' desc
      limit ${MAX_CONVERSATIONS}
    )
  `);
}

export async function getAllConversations(): Promise<ConversationRecord[]> {
  return loadStore();
}

export async function getConversation(id: string): Promise<ConversationRecord | undefined> {
  const [row] = await db
    .select({ data: conversations.data })
    .from(conversations)
    .where(eq(conversations.id, id))
    .limit(1);
  return row?.data as ConversationRecord | undefined;
}

export async function getConversationStats() {
  const records = await loadStore();
  const totalConversations = records.length;
  const totalMessages = records.reduce((s, r) => s + r.messageCount, 0);
  const totalTokens = records.reduce((s, r) => s + r.totalTokens, 0);
  const costEstimate = (totalTokens / 1_000_000) * 18; // ~$18/M tokens average for Sonnet
  return { totalConversations, totalMessages, totalTokens, costEstimate };
}
