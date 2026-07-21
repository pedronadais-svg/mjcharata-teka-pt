import type { FilterConfig, FamilyFilterConfig } from '@/lib/types';

export const familyFilters: FamilyFilterConfig[] = [
  {
    familySlug: 'fornos',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'energy', label: 'Classe Energética', field: 'energyRating', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'width', label: 'Largura', field: 'width', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'cleaning', label: 'Sistemas de limpeza', field: 'cleaning', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Sistema de limpeza', hidden: true },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field', hidden: true },
    ],
  },
  {
    familySlug: 'micro-ondas',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'width', label: 'Largura', field: 'width', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'capacity', label: 'Capacidade', field: 'capacity', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Capacidade', hidden: true },
    ],
  },
  {
    familySlug: 'maquina-de-cafe',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
    ],
  },
  {
    familySlug: 'placas',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'width', label: 'Largura', field: 'width', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'profile', label: 'Tipo de perfil', field: 'profile', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Tipo de perfil' },
      { id: 'zones', label: 'Zonas de cozinhado', field: 'zones', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Zonas de cozinhado', hidden: true },
      { id: 'features', label: 'Características', field: 'features', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Características', hidden: true },
    ],
  },
  {
    familySlug: 'fogoes-de-instalacao-livre',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'ovenType', label: 'Tipo de Forno', field: 'ovenType', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Tipo de forno' },
      { id: 'plateType', label: 'Tipo de Placa', field: 'plateType', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Tipo de placa' },
      { id: 'zones', label: 'Zonas de cozinhado', field: 'zones', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Zonas de cozinhado', hidden: true },
    ],
  },
  {
    familySlug: 'exaustores',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'type', label: 'Tipo', field: 'subfamily', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'energy', label: 'Classe Energética', field: 'energyRating', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'width', label: 'Largura', field: 'width', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field', hidden: true },
      { id: 'aspiration', label: 'Aspiração', field: 'aspiration', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Tipo de aspiração', hidden: true },
    ],
  },
  {
    familySlug: 'frigorificos',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'fridgeType', label: 'Tipo de frigorífico', field: 'subfamily', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'energy', label: 'Classe Energética', field: 'energyRating', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'width', label: 'Largura', field: 'width', type: 'dropdown-checkbox', extractFrom: 'field', hidden: true },
      { id: 'height', label: 'Altura', field: 'height', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Altura', hidden: true },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field', hidden: true },
      { id: 'freezing', label: 'Sistema de congelação', field: 'freezing', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Sistema de congelação', hidden: true },
      { id: 'doors', label: 'Portas', field: 'doors', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Portas', hidden: true },
      { id: 'drawers', label: 'Gavetas', field: 'drawers', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Gavetas', hidden: true },
    ],
  },
  {
    familySlug: 'garrafeiras',
    filters: [
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'capacity', label: 'Capacidade', field: 'capacity', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Capacidade' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
    ],
  },
  {
    familySlug: 'lava-loucas',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'width', label: 'Largura', field: 'width', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'drainer', label: 'Escorredor', field: 'drainer', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Escorredor', hidden: true },
      { id: 'basins', label: 'Número de bacias', field: 'basins', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Número de bacias', hidden: true },
      { id: 'situation', label: 'Situação', field: 'situation', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Situação', hidden: true },
      { id: 'material', label: 'Material', field: 'material', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Material', hidden: true },
    ],
  },
  {
    familySlug: 'misturadoras-de-cozinha',
    filters: [
      { id: 'edition', label: 'Edição', field: 'edition', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'commandType', label: 'Tipo de comandos', field: 'commandType', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Tipo de comandos' },
      { id: 'spoutType', label: 'Tipo de cano', field: 'subfamily', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field', hidden: true },
    ],
  },
  {
    familySlug: 'maquinas-de-lavar-louca',
    filters: [
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'energy', label: 'Classe Energética', field: 'energyRating', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'width', label: 'Largura', field: 'width', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'services', label: 'N.º de serviços', field: 'services', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'N.º de serviços' },
      { id: 'cutlery', label: 'Porta talheres', field: 'cutlery', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Porta talheres', hidden: true },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field', hidden: true },
    ],
  },
  {
    familySlug: 'complementos-de-cozinha',
    filters: [
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
    ],
  },
  {
    familySlug: 'acessorios-de-cozinha',
    filters: [
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
    ],
  },
  // --- LAVANDARIA ---
  {
    familySlug: 'maquinas-lavar-roupa',
    filters: [
      { id: 'installation', label: 'Instalação', field: 'installation', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'energy', label: 'Classe Energética', field: 'energyRating', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'capacity', label: 'Capacidade de lavagem', field: 'capacity', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Capacidade de lavagem' },
      { id: 'spin', label: 'Velocidade de centrifugação', field: 'spin', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Velocidade de centrifugação', hidden: true },
    ],
  },
  {
    familySlug: 'maquinas-secar',
    filters: [
      { id: 'energy', label: 'Classe Energética', field: 'energyRating', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'capacity', label: 'Capacidade', field: 'capacity', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Capacidade' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
    ],
  },
  {
    familySlug: 'maquinas-lavar-secar',
    filters: [
      { id: 'energy', label: 'Classe Energética', field: 'energyRating', type: 'dropdown-checkbox', extractFrom: 'field' },
      { id: 'capacity', label: 'Capacidade de lavagem', field: 'capacity', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Capacidade de lavagem' },
      { id: 'color', label: 'Cor', field: 'color', type: 'dropdown-checkbox', extractFrom: 'field' },
    ],
  },
  // --- AR CONDICIONADO ---
  {
    familySlug: 'mono-split',
    filters: [
      { id: 'capacity', label: 'Capacidade', field: 'capacity', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Capacidade' },
    ],
  },
  {
    familySlug: 'multi-split',
    filters: [
      { id: 'capacity', label: 'Capacidade', field: 'capacity', type: 'dropdown-checkbox', extractFrom: 'specs', specLabel: 'Capacidade' },
    ],
  },
];

export function getFiltersForFamily(familySlug: string): FilterConfig[] {
  return familyFilters.find(f => f.familySlug === familySlug)?.filters ?? [];
}
