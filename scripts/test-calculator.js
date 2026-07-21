// Teste rápido do calculador BTU com factores corrigidos

const BTU_PER_SQM_BASE = 600;
const ROOM_TYPE_FACTOR = { 'sala': 1.0, 'quarto': 0.9, 'escritorio': 1.05, 'cozinha': 1.3, 'loja': 1.15, 'armazem': 0.85, 'open-space': 1.1 };
const SOLAR_FACTOR = { 'pouco': 1.0, 'moderado': 1.05, 'intenso': 1.10 };
const FLOOR_FACTOR = { 'rdc': 1.0, 'intermedio': 1.0, 'ultimo': 1.08 };
const INSULATION_FACTOR = { 'bom': 0.90, 'normal': 1.0, 'fraco': 1.20 };
const CLIMATE_FACTOR = { 'luanda': 1.05, 'benguela': 1.03, 'huambo': 0.92, 'namibe': 1.0, 'lubango': 0.88, 'outra': 1.0 };
const CEILING_TYPE_FACTOR = { 'sim': 0.95, 'nao': 1.0 };
const USAGE_FACTOR = { 'dia-inteiro': 1.0, 'manha-tarde': 1.0, 'noite': 0.90, 'escritorio': 0.95 };

function calcRoom(room, input) {
  const area = room.length * room.width;
  let btu = area * BTU_PER_SQM_BASE;
  btu *= room.ceilingHeight / 2.6;
  btu *= ROOM_TYPE_FACTOR[room.type] || 1.0;

  const totalArea = input.rooms.reduce((s, r) => s + r.length * r.width, 0);
  btu += input.people * (area / totalArea) * 400; // pessoas
  const equipBTU = { 'nenhum': 0, '1-2': 300, '3-5': 600, '6+': 1000 };
  btu += (equipBTU[input.equipment] || 0) * (area / totalArea);
  btu += input.windows * 200 * (area / totalArea); // janelas

  const envFactor = (SOLAR_FACTOR[input.solar] || 1.0) * (FLOOR_FACTOR[input.floor] || 1.0) * (INSULATION_FACTOR[input.insulation] || 1.0);
  btu *= envFactor;
  btu *= CLIMATE_FACTOR[input.city] || 1.0;
  btu *= CEILING_TYPE_FACTOR[input.hasFalseCeiling ? 'sim' : 'nao'];
  btu *= USAGE_FACTOR[input.usage] || 1.0;
  return Math.round(btu);
}

function test(name, input, expectedModel) {
  const totalBTU = input.rooms.reduce((sum, room) => sum + calcRoom(room, input), 0);
  const monoModels = [
    { name: 'AUREA 9000', btu: 9000, area: '12-18m²' },
    { name: 'AUREA 12000', btu: 12000, area: '16-23m²' },
    { name: 'AUREA 18000', btu: 17060, area: '23-33m²' },
    { name: 'AUREA 24000', btu: 20813, area: '32-47m²' },
  ];
  const matched = monoModels.find(m => m.btu >= totalBTU * 0.9) || monoModels[3];
  const totalArea = input.rooms.reduce((s, r) => s + r.length * r.width, 0);

  console.log(`${name}`);
  console.log(`  Área: ${totalArea}m² → ${totalBTU.toLocaleString('pt-PT')} BTU → ${matched.name} (${matched.area})`);
  console.log(`  Esperado: ${expectedModel}`);
  console.log();
}

test('Sala 20m² Luanda (padrão)', {
  rooms: [{ type: 'sala', length: 5, width: 4, ceilingHeight: 2.8 }],
  people: 2, equipment: '1-2', windows: 2, solar: 'moderado',
  floor: 'intermedio', insulation: 'normal', usage: 'dia-inteiro', hasFalseCeiling: false, city: 'luanda',
}, 'AUREA 12000 ou 18000');

test('Quarto 12m² (simples)', {
  rooms: [{ type: 'quarto', length: 4, width: 3, ceilingHeight: 2.8 }],
  people: 1, equipment: 'nenhum', windows: 1, solar: 'pouco',
  floor: 'intermedio', insulation: 'normal', usage: 'noite', hasFalseCeiling: false, city: 'luanda',
}, 'AUREA 9000');

test('Sala 40m² sol intenso + último andar + fraco isolamento', {
  rooms: [{ type: 'sala', length: 8, width: 5, ceilingHeight: 2.8 }],
  people: 4, equipment: '3-5', windows: 4, solar: 'intenso',
  floor: 'ultimo', insulation: 'fraco', usage: 'dia-inteiro', hasFalseCeiling: false, city: 'luanda',
}, 'AUREA 24000');

test('Quarto 15m² Lubango (ameno)', {
  rooms: [{ type: 'quarto', length: 5, width: 3, ceilingHeight: 2.6 }],
  people: 2, equipment: 'nenhum', windows: 1, solar: 'pouco',
  floor: 'intermedio', insulation: 'bom', usage: 'noite', hasFalseCeiling: false, city: 'lubango',
}, 'AUREA 9000');

test('Escritório 25m² Luanda', {
  rooms: [{ type: 'escritorio', length: 5, width: 5, ceilingHeight: 2.8 }],
  people: 3, equipment: '3-5', windows: 2, solar: 'moderado',
  floor: 'intermedio', insulation: 'normal', usage: 'escritorio', hasFalseCeiling: false, city: 'luanda',
}, 'AUREA 12000 ou 18000');

test('2 quartos multi (12+14m²)', {
  rooms: [
    { type: 'quarto', length: 4, width: 3, ceilingHeight: 2.8 },
    { type: 'quarto', length: 4.67, width: 3, ceilingHeight: 2.8 },
  ],
  people: 2, equipment: 'nenhum', windows: 2, solar: 'moderado',
  floor: 'intermedio', insulation: 'normal', usage: 'noite', hasFalseCeiling: false, city: 'luanda',
}, 'Multi 18k (9+9 ou 9+12)');

test('Sala + 2 quartos multi', {
  rooms: [
    { type: 'sala', length: 5, width: 4, ceilingHeight: 2.8 },
    { type: 'quarto', length: 4, width: 3, ceilingHeight: 2.8 },
    { type: 'quarto', length: 3.5, width: 3, ceilingHeight: 2.8 },
  ],
  people: 4, equipment: '1-2', windows: 3, solar: 'moderado',
  floor: 'intermedio', insulation: 'normal', usage: 'dia-inteiro', hasFalseCeiling: false, city: 'luanda',
}, 'Multi 27k');

// Regra prática: sala 20m² sem nada = ~12000 BTU base
test('Sala 20m² mínimo (sem factores)', {
  rooms: [{ type: 'sala', length: 5, width: 4, ceilingHeight: 2.6 }],
  people: 0, equipment: 'nenhum', windows: 0, solar: 'pouco',
  floor: 'intermedio', insulation: 'normal', usage: 'dia-inteiro', hasFalseCeiling: false, city: 'outra',
}, 'AUREA 12000 (puro 12000 BTU)');
