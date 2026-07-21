// Mapeamento de nomes de configuração para model IDs da Anthropic
// Os IDs seguem o formato oficial: claude-{family}-{version}

const models: Record<string, string> = {
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5-20251001',
  opus: 'claude-opus-4-6',
};

export function resolveModelId(configName: string): string {
  // Aceita nomes curtos (sonnet, haiku, opus) ou completos
  if (configName in models) return models[configName];
  // Aceita o ID completo directamente
  if (configName.startsWith('claude-')) return configName;
  // Fallback
  return models.sonnet;
}
