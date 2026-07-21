import { TEKA_MONO_SPLIT, TEKA_MULTI_SPLIT_EXTERIOR, AOA_PER_KWH, type TekaACModel } from '@/data/ac-products';

// ============================================================
// Tipos
// ============================================================

export interface RoomInput {
  type: string;
  length: number;
  width: number;
  ceilingHeight: number;
}

export interface SimulatorInput {
  installationType: 'mono-split' | 'multi-split';
  rooms: RoomInput[];
  people: number;
  equipment: string;
  windows: number;
  solar: string;
  floor: string;
  insulation: string;
  mode: string;
  usage: string;
  hasFalseCeiling: boolean;
  city: string;
}

export interface RoomResult {
  room: RoomInput;
  area: number;
  volume: number;
  btuRequired: number;
}

export interface RecommendedSetup {
  type: 'mono-split' | 'multi-split';
  exterior: TekaACModel;
  interiors: TekaACModel[];
  totalCapacityBTU: number;
  totalCapacityKW: number;
  coveragePercent: number;
  energyClass: string;
}

export interface SimulatorResult {
  totalBTU: number;
  totalKW: number;
  rooms: RoomResult[];
  recommendedSetup: RecommendedSetup;
  alternativeSetup?: RecommendedSetup;
  estimatedConsumption: {
    wattsNominal: number;
    kwhPerMonth: number;
    costPerMonthAOA: number;
  };
  calculationBreakdown: CalculationStep[];
}

export interface CalculationStep {
  label: string;
  value: string;
}

// ============================================================
// Factores de cálculo (valores exactos do prompt)
// ============================================================

const BTU_PER_SQM_BASE = 600;

function ceilingFactor(height: number): number {
  return height / 2.6;
}

const ROOM_TYPE_FACTOR: Record<string, number> = {
  'sala': 1.0,
  'quarto': 0.9,
  'escritorio': 1.05,
  'cozinha': 1.3,
  'loja': 1.15,
  'armazem': 0.85,
  'open-space': 1.1,
};

const EQUIPMENT_FACTOR: Record<string, number> = {
  'nenhum': 1.0,
  '1-2': 1.05,
  '3-5': 1.10,
  '6+': 1.20,
};

const SOLAR_FACTOR: Record<string, number> = {
  'pouco': 1.0,
  'moderado': 1.05,
  'intenso': 1.10,
};

const FLOOR_FACTOR: Record<string, number> = {
  'rdc': 1.0,
  'intermedio': 1.0,
  'ultimo': 1.08,
};

const INSULATION_FACTOR: Record<string, number> = {
  'bom': 0.90,
  'normal': 1.0,
  'fraco': 1.20,
};

const CLIMATE_FACTOR: Record<string, number> = {
  'luanda': 1.05,
  'benguela': 1.03,
  'huambo': 0.92,
  'namibe': 1.0,
  'lubango': 0.88,
  'outra': 1.0,
};

const CEILING_TYPE_FACTOR: Record<string, number> = {
  'sim': 0.95,
  'nao': 1.0,
};

const USAGE_FACTOR: Record<string, number> = {
  'dia-inteiro': 1.0,
  'manha-tarde': 1.0,
  'noite': 0.90,
  'escritorio': 0.95,
};

// ============================================================
// Cálculo de BTU por divisão
// ============================================================

function calculateRoomBTU(
  room: RoomInput,
  input: SimulatorInput,
): { btu: number; steps: CalculationStep[] } {
  const area = room.length * room.width;
  const steps: CalculationStep[] = [];
  const totalArea = input.rooms.reduce((sum, r) => sum + r.length * r.width, 0);

  // --- FASE 1: Carga base (área × BTU/m²) ---
  let btu = area * BTU_PER_SQM_BASE;
  steps.push({ label: `Área base: ${area.toFixed(1)} m² × ${BTU_PER_SQM_BASE} BTU/m²`, value: `${Math.round(btu)} BTU` });

  // Pé-direito (ajuste volumétrico vs standard 2.6m)
  const cf = ceilingFactor(room.ceilingHeight);
  if (cf !== 1) {
    btu *= cf;
    steps.push({ label: `Pé-direito ${room.ceilingHeight}m: ×${cf.toFixed(2)}`, value: `${Math.round(btu)} BTU` });
  }

  // Tipo de divisão
  const rtf = ROOM_TYPE_FACTOR[room.type] ?? 1.0;
  if (rtf !== 1) {
    btu *= rtf;
    steps.push({ label: `Tipo ${room.type}: ×${rtf}`, value: `${Math.round(btu)} BTU` });
  }

  // --- FASE 2: Cargas adicionais (aditivas, antes do factor envolvente) ---

  // Pessoas (~400 BTU por pessoa, distribuído por área)
  const roomPeopleShare = input.people * (area / totalArea);
  const peopleBTU = roomPeopleShare * 400;
  if (peopleBTU > 0) {
    btu += peopleBTU;
    steps.push({ label: `+${roomPeopleShare.toFixed(1)} pessoas × 400 BTU`, value: `+${Math.round(peopleBTU)} BTU` });
  }

  // Equipamentos electrónicos
  const equipBTU: Record<string, number> = { 'nenhum': 0, '1-2': 300, '3-5': 600, '6+': 1000 };
  const eqBTU = (equipBTU[input.equipment] ?? 0) * (area / totalArea);
  if (eqBTU > 0) {
    btu += eqBTU;
    steps.push({ label: `+Equipamentos (${input.equipment})`, value: `+${Math.round(eqBTU)} BTU` });
  }

  // Janelas (~200 BTU por janela, distribuído por área)
  const windowBTU = input.windows * 200 * (area / totalArea);
  if (windowBTU > 0) {
    btu += windowBTU;
    steps.push({ label: `+${input.windows} janelas × 200 BTU`, value: `+${Math.round(windowBTU)} BTU` });
  }

  // --- FASE 3: Factor envolvente combinado (multiplicativo, limitado) ---
  // Combina sol, andar, isolamento num único factor para evitar sobre-multiplicação
  const sf = SOLAR_FACTOR[input.solar] ?? 1.0;
  const ff = FLOOR_FACTOR[input.floor] ?? 1.0;
  const inf = INSULATION_FACTOR[input.insulation] ?? 1.0;
  const envFactor = sf * ff * inf;

  if (envFactor !== 1) {
    btu *= envFactor;
    const parts = [];
    if (sf !== 1) parts.push(`sol ${input.solar} ×${sf}`);
    if (ff !== 1) parts.push(`andar ${input.floor} ×${ff}`);
    if (inf !== 1) parts.push(`isolamento ${input.insulation} ×${inf}`);
    steps.push({ label: `Envolvente (${parts.join(', ')}): ×${envFactor.toFixed(2)}`, value: `${Math.round(btu)} BTU` });
  }

  // --- FASE 4: Factor climático (Angola) ---
  const clf = CLIMATE_FACTOR[input.city] ?? 1.05;
  if (clf !== 1) {
    btu *= clf;
    steps.push({ label: `Cidade (${input.city}): ×${clf}`, value: `${Math.round(btu)} BTU` });
  }

  // --- FASE 5: Ajustes finais (redutores) ---
  const ctf = CEILING_TYPE_FACTOR[input.hasFalseCeiling ? 'sim' : 'nao'];
  if (ctf !== 1) {
    btu *= ctf;
    steps.push({ label: `Tecto falso: ×${ctf}`, value: `${Math.round(btu)} BTU` });
  }

  const uf = USAGE_FACTOR[input.usage] ?? 1.0;
  if (uf !== 1) {
    btu *= uf;
    steps.push({ label: `Uso (${input.usage}): ×${uf}`, value: `${Math.round(btu)} BTU` });
  }

  return { btu: Math.round(btu), steps };
}

// ============================================================
// Matching com modelos Teka
// ============================================================

function matchMonoSplit(btuRequired: number): { recommended: TekaACModel; alternative?: TekaACModel } {
  const sorted = [...TEKA_MONO_SPLIT].sort((a, b) => a.btuCooling - b.btuCooling);

  // Choose model where capacity >= 90% of requirement (slight over-dimensioning is OK)
  const recommended = sorted.find(m => m.btuCooling >= btuRequired * 0.9) || sorted[sorted.length - 1];

  // Alternative: one step down (if available and covers >= 80%)
  const idx = sorted.indexOf(recommended);
  const alternative = idx > 0 ? sorted[idx - 1] : undefined;

  return { recommended, alternative };
}

function matchMultiSplit(roomResults: RoomResult[]): { recommended: RecommendedSetup; alternative?: RecommendedSetup } {
  // For each room, choose 9k or 12k interior
  const interiorAssignments = roomResults.map(rr => {
    if (rr.btuRequired <= 10000) return { model: TEKA_MONO_SPLIT[0], btu: 9000 }; // 9k
    return { model: TEKA_MONO_SPLIT[1], btu: 12000 }; // 12k
  });

  const totalBTU = roomResults.reduce((sum, rr) => sum + rr.btuRequired, 0);
  const numRooms = roomResults.length;

  // Build combination string (e.g. "9+12")
  const combo = interiorAssignments
    .map(a => a.btu === 9000 ? '9' : '12')
    .sort()
    .join('+');

  // Find matching exterior
  let exterior: TekaACModel | undefined;
  for (const ext of TEKA_MULTI_SPLIT_EXTERIOR) {
    if (ext.maxInteriors && ext.maxInteriors >= numRooms) {
      if (ext.combinations?.some(c => {
        const sorted1 = c.split('+').sort().join('+');
        return sorted1 === combo;
      })) {
        exterior = ext;
        break;
      }
    }
  }

  // Fallback: pick exterior with enough capacity
  if (!exterior) {
    exterior = TEKA_MULTI_SPLIT_EXTERIOR.find(e => e.btuCooling >= totalBTU * 0.85)
      || TEKA_MULTI_SPLIT_EXTERIOR[TEKA_MULTI_SPLIT_EXTERIOR.length - 1];
  }

  const totalCapacity = interiorAssignments.reduce((sum, a) => sum + a.btu, 0);
  const coveragePercent = Math.round((totalCapacity / totalBTU) * 100);

  const recommended: RecommendedSetup = {
    type: 'multi-split',
    exterior,
    interiors: interiorAssignments.map(a => a.model),
    totalCapacityBTU: totalCapacity,
    totalCapacityKW: Math.round(totalCapacity / 3412 * 10) / 10,
    coveragePercent,
    energyClass: exterior.energyClassCooling,
  };

  return { recommended };
}

// ============================================================
// Função principal
// ============================================================

export function calculateSimulation(input: SimulatorInput): SimulatorResult {
  const allSteps: CalculationStep[] = [];

  // Calculate BTU for each room
  const roomResults: RoomResult[] = input.rooms.map((room, i) => {
    const { btu, steps } = calculateRoomBTU(room, input);
    if (input.rooms.length > 1) {
      allSteps.push({ label: `── Divisão ${i + 1}: ${room.type} ──`, value: '' });
    }
    allSteps.push(...steps);
    const area = room.length * room.width;
    return {
      room,
      area,
      volume: area * room.ceilingHeight,
      btuRequired: btu,
    };
  });

  const totalBTU = roomResults.reduce((sum, rr) => sum + rr.btuRequired, 0);
  const totalKW = Math.round(totalBTU / 3412 * 10) / 10;

  allSteps.push({ label: '───────────────────', value: '' });
  allSteps.push({ label: 'Total', value: `${totalBTU.toLocaleString('pt-PT')} BTU/h (${totalKW} kW)` });

  // Match with Teka products
  let recommendedSetup: RecommendedSetup;
  let alternativeSetup: RecommendedSetup | undefined;

  if (input.installationType === 'mono-split') {
    const { recommended, alternative } = matchMonoSplit(totalBTU);
    recommendedSetup = {
      type: 'mono-split',
      exterior: recommended,
      interiors: [recommended],
      totalCapacityBTU: recommended.btuCooling,
      totalCapacityKW: recommended.kwCooling,
      coveragePercent: Math.round((recommended.btuCooling / totalBTU) * 100),
      energyClass: recommended.energyClassCooling,
    };
    if (alternative && alternative.btuCooling >= totalBTU * 0.8) {
      alternativeSetup = {
        type: 'mono-split',
        exterior: alternative,
        interiors: [alternative],
        totalCapacityBTU: alternative.btuCooling,
        totalCapacityKW: alternative.kwCooling,
        coveragePercent: Math.round((alternative.btuCooling / totalBTU) * 100),
        energyClass: alternative.energyClassCooling,
      };
    }
  } else {
    const result = matchMultiSplit(roomResults);
    recommendedSetup = result.recommended;
    alternativeSetup = result.alternative;
  }

  // Consumption estimate (8h/day, 30 days)
  const wattsNominal = recommendedSetup.exterior.powerAbsorbed;
  const hoursPerDay = input.usage === 'escritorio' ? 8 : input.usage === 'noite' ? 8 : 10;
  const kwhPerMonth = Math.round((wattsNominal / 1000) * hoursPerDay * 30);
  const costPerMonthAOA = kwhPerMonth * AOA_PER_KWH;

  return {
    totalBTU,
    totalKW,
    rooms: roomResults,
    recommendedSetup,
    alternativeSetup,
    estimatedConsumption: {
      wattsNominal,
      kwhPerMonth,
      costPerMonthAOA,
    },
    calculationBreakdown: allSteps,
  };
}
