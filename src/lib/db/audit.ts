import { readStore, writeStore } from './json-store';
import { nanoid } from 'nanoid';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'status_change';
  entity: 'product' | 'article' | 'faq' | 'banner' | 'user' | 'order' | 'settings' | 'page' | 'category';
  entityId: string;
  entityName: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
}

export async function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const log = await readStore<AuditEntry[]>('audit-log.json');
    log.unshift({
      id: nanoid(),
      timestamp: new Date().toISOString(),
      ...entry,
    });
    // Keep only last 500 entries
    if (log.length > 500) log.length = 500;
    await writeStore('audit-log.json', log);
  } catch (error) {
    console.error('[AUDIT] Erro ao registar:', error);
  }
}
