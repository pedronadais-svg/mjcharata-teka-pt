/**
 * Dados técnicos dos modelos Teka AUREA Ar Condicionado
 * Valores EXACTOS do PDF de especificações técnicas.
 */

export interface TekaACModel {
  id: string;
  name: string;
  type: 'mono-split' | 'multi-split-exterior';
  modelInterior?: string;
  modelExterior: string;
  codeInterior?: string;
  codeExterior: string;
  btuCooling: number;
  btuCoolingRange: [number, number];
  kwCooling: number;
  kwCoolingRange: [number, number];
  btuHeating: number;
  btuHeatingRange: [number, number];
  kwHeating: number;
  kwHeatingRange: [number, number];
  eer: number;
  cop: number;
  seer: number;
  scop: number;
  energyClassCooling: string;
  energyClassHeatingMedium: string;
  areaRange: [number, number];
  noiseInterior: { turbo: number; alta: number; media: number; baixa: number };
  powerAbsorbed: number;
  current: number;
  refrigerant: string;
  maxInteriors?: number;
  combinations?: string[];
  slug: string;
  features: string[];
}

export const TEKA_MONO_SPLIT: TekaACModel[] = [
  {
    id: 'aurea-09k',
    name: 'AUREA 9000 BTU',
    type: 'mono-split',
    modelInterior: 'TKGPA-09HFN8',
    modelExterior: 'TKO-09HFN8',
    codeInterior: '114510001',
    codeExterior: '114510000',
    btuCooling: 9000,
    btuCoolingRange: [3500, 12000],
    kwCooling: 2.6,
    kwCoolingRange: [1.0, 3.5],
    btuHeating: 10000,
    btuHeatingRange: [2800, 12500],
    kwHeating: 2.9,
    kwHeatingRange: [0.8, 3.7],
    eer: 4.20,
    cop: 4.40,
    seer: 8.8,
    scop: 4.6,
    energyClassCooling: 'A+++',
    energyClassHeatingMedium: 'A++',
    areaRange: [12, 18],
    noiseInterior: { turbo: 39, alta: 34, media: 25, baixa: 19 },
    powerAbsorbed: 2200,
    current: 10,
    refrigerant: 'R32',
    slug: 'ar-condicionado-aurea-mono-split-9000-interior',
    features: ['DC Inverter', 'Wi-Fi', 'Ionizador', 'HEPA', 'R32', 'Golden Fin', '3D Airflow', 'Modo Sono', 'Radar'],
  },
  {
    id: 'aurea-12k',
    name: 'AUREA 12000 BTU',
    type: 'mono-split',
    modelInterior: 'TKGPB-12HFN8',
    modelExterior: 'TKO-12HFN8',
    codeInterior: '114510003',
    codeExterior: '114510002',
    btuCooling: 12000,
    btuCoolingRange: [4700, 13800],
    kwCooling: 3.5,
    kwCoolingRange: [1.4, 4.0],
    btuHeating: 13000,
    btuHeatingRange: [3640, 13900],
    kwHeating: 3.8,
    kwHeatingRange: [1.1, 4.1],
    eer: 3.40,
    cop: 3.91,
    seer: 8.5,
    scop: 4.6,
    energyClassCooling: 'A+++',
    energyClassHeatingMedium: 'A++',
    areaRange: [16, 23],
    noiseInterior: { turbo: 39, alta: 32, media: 26, baixa: 20 },
    powerAbsorbed: 2200,
    current: 10,
    refrigerant: 'R32',
    slug: 'ar-condicionado-aurea-mono-split-12000-interior',
    features: ['DC Inverter', 'Wi-Fi', 'Ionizador', 'HEPA', 'R32', 'Golden Fin', '3D Airflow', 'Modo Sono', 'Radar'],
  },
  {
    id: 'aurea-18k',
    name: 'AUREA 18000 BTU',
    type: 'mono-split',
    modelInterior: 'TKGPC-18HFN8',
    modelExterior: 'TKO-18HFN8',
    codeInterior: '114510005',
    codeExterior: '114510004',
    btuCooling: 17060,
    btuCoolingRange: [6800, 20900],
    kwCooling: 5.0,
    kwCoolingRange: [2.0, 6.1],
    btuHeating: 18425,
    btuHeatingRange: [4600, 23100],
    kwHeating: 5.4,
    kwHeatingRange: [1.4, 6.8],
    eer: 3.60,
    cop: 3.75,
    seer: 8.5,
    scop: 4.6,
    energyClassCooling: 'A+++',
    energyClassHeatingMedium: 'A++',
    areaRange: [23, 33],
    noiseInterior: { turbo: 43, alta: 36, media: 28, baixa: 21.5 },
    powerAbsorbed: 2800,
    current: 13.5,
    refrigerant: 'R32',
    slug: 'ar-condicionado-aurea-mono-split-18000-interior',
    features: ['DC Inverter', 'Wi-Fi', 'Ionizador', 'HEPA', 'R32', 'Golden Fin', '3D Airflow', 'Modo Sono', 'Radar'],
  },
  {
    id: 'aurea-24k',
    name: 'AUREA 24000 BTU',
    type: 'mono-split',
    modelInterior: 'TKGPA-24HFN8',
    modelExterior: 'TKO-24HFN8',
    codeInterior: '114510006',
    codeExterior: '114510007',
    btuCooling: 20813,
    btuCoolingRange: [7600, 30000],
    kwCooling: 6.1,
    kwCoolingRange: [2.2, 8.8],
    btuHeating: 24908,
    btuHeatingRange: [5300, 32000],
    kwHeating: 7.3,
    kwHeatingRange: [1.6, 9.4],
    eer: 3.51,
    cop: 3.71,
    seer: 8.5,
    scop: 4.6,
    energyClassCooling: 'A+++',
    energyClassHeatingMedium: 'A+',
    areaRange: [32, 47],
    noiseInterior: { turbo: 46, alta: 39.5, media: 32.5, baixa: 21.5 },
    powerAbsorbed: 3800,
    current: 19,
    refrigerant: 'R32',
    slug: 'ar-condicionado-aurea-mono-split-24000-interior',
    features: ['DC Inverter', 'Wi-Fi', 'Ionizador', 'HEPA', 'R32', 'Golden Fin', '3D Airflow', 'Modo Sono', 'Radar'],
  },
];

export const TEKA_MULTI_SPLIT_EXTERIOR: TekaACModel[] = [
  {
    id: 'aurea-multi-18k',
    name: 'AUREA Multi-Split 18000 BTU',
    type: 'multi-split-exterior',
    modelExterior: 'TK2O-18HFN8',
    codeExterior: '114510008',
    btuCooling: 18084,
    btuCoolingRange: [5425, 20473],
    kwCooling: 5.3,
    kwCoolingRange: [1.59, 6.0],
    btuHeating: 18767,
    btuHeatingRange: [5630, 21258],
    kwHeating: 5.5,
    kwHeatingRange: [1.65, 6.23],
    eer: 3.73,
    cop: 3.87,
    seer: 6.7,
    scop: 4.0,
    energyClassCooling: 'A++',
    energyClassHeatingMedium: 'A+',
    areaRange: [24, 36],
    noiseInterior: { turbo: 0, alta: 0, media: 0, baixa: 0 }, // exterior only
    powerAbsorbed: 3050,
    current: 13,
    refrigerant: 'R32',
    maxInteriors: 2,
    combinations: ['9+9', '9+12', '12+12'],
    slug: 'ar-condicionado-aurea-multi-split-2x1-exterior',
    features: ['DC Inverter', 'R32', 'Golden Fin'],
  },
  {
    id: 'aurea-multi-27k',
    name: 'AUREA Multi-Split 27000 BTU',
    type: 'multi-split-exterior',
    modelExterior: 'TK3O-27HFN8',
    codeExterior: '114510009',
    btuCooling: 27000,
    btuCoolingRange: [8100, 27980],
    kwCooling: 7.9,
    kwCoolingRange: [2.37, 8.2],
    btuHeating: 28000,
    btuHeatingRange: [8401, 32757],
    kwHeating: 8.2,
    kwHeatingRange: [2.46, 9.6],
    eer: 3.23,
    cop: 3.80,
    seer: 6.7,
    scop: 4.2,
    energyClassCooling: 'A++',
    energyClassHeatingMedium: 'A+',
    areaRange: [36, 54],
    noiseInterior: { turbo: 0, alta: 0, media: 0, baixa: 0 },
    powerAbsorbed: 4100,
    current: 18,
    refrigerant: 'R32',
    maxInteriors: 3,
    combinations: ['9+9+9', '9+9+12', '9+12+12', '12+12+12'],
    slug: 'ar-condicionado-aurea-multi-split-3x1-exterior',
    features: ['DC Inverter', 'R32', 'Golden Fin'],
  },
];

// Interior units for multi-split (same as mono 9k and 12k)
export const MULTI_SPLIT_INTERIORS = {
  '9k': TEKA_MONO_SPLIT[0], // TKGPA-09HFN8
  '12k': TEKA_MONO_SPLIT[1], // TKGPB-12HFN8
};

// Energy tariff in Angola (AOA per kWh) - easily updatable
export const AOA_PER_KWH = 45;
