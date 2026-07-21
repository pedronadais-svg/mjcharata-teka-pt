'use client';

import { useState } from 'react';
import { Calculator, RotateCcw, ChevronDown, ChevronUp, Zap, Volume2, Thermometer, Leaf, Wifi, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateSimulation, type SimulatorInput, type SimulatorResult, type RoomInput } from '@/lib/ac-simulator/calculator';
import Link from 'next/link';

// ============================================================
// Options
// ============================================================

const ROOM_TYPES = [
  { value: 'sala', label: 'Sala' },
  { value: 'quarto', label: 'Quarto' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'cozinha', label: 'Cozinha' },
  { value: 'loja', label: 'Loja' },
  { value: 'armazem', label: 'Armazém' },
  { value: 'open-space', label: 'Open-space' },
];

const CEILING_HEIGHTS = [2.4, 2.6, 2.8, 3.0, 3.5, 4.0];
const PEOPLE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10];

const CITIES = [
  { value: 'luanda', label: 'Luanda' },
  { value: 'benguela', label: 'Benguela' },
  { value: 'huambo', label: 'Huambo' },
  { value: 'namibe', label: 'Namibe' },
  { value: 'lubango', label: 'Lubango' },
  { value: 'outra', label: 'Outra' },
];

// ============================================================
// Reusable UI
// ============================================================

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-2 border-2 rounded text-sm transition-all ${
      selected ? 'border-teka-red bg-teka-red/5 text-teka-red font-semibold' : 'border-teka-border text-teka-dark hover:border-teka-gray'
    }`}>
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-bold text-teka-dark mb-3 mt-0">{children}</h3>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-medium text-teka-gray block mb-1">{children}</label>;
}

// ============================================================
// Room Form
// ============================================================

function RoomForm({ room, index, onChange }: { room: RoomInput; index: number; onChange: (r: RoomInput) => void }) {
  const area = room.length * room.width;
  return (
    <div className="border border-teka-border rounded p-4 space-y-3">
      {index >= 0 && <p className="text-sm font-semibold text-teka-dark">Divisão {index + 1}</p>}
      <div>
        <FieldLabel>Tipo de divisão</FieldLabel>
        <select value={room.type} onChange={e => onChange({ ...room, type: e.target.value })}
          className="w-full h-9 px-3 text-sm border border-teka-border rounded bg-white">
          {ROOM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel>Comprimento (m)</FieldLabel>
          <input type="number" step="0.1" min="1" max="50" value={room.length || ''}
            onChange={e => onChange({ ...room, length: parseFloat(e.target.value) || 0 })}
            className="w-full h-9 px-3 text-sm border border-teka-border rounded" placeholder="5.0" />
        </div>
        <div>
          <FieldLabel>Largura (m)</FieldLabel>
          <input type="number" step="0.1" min="1" max="50" value={room.width || ''}
            onChange={e => onChange({ ...room, width: parseFloat(e.target.value) || 0 })}
            className="w-full h-9 px-3 text-sm border border-teka-border rounded" placeholder="4.0" />
        </div>
        <div>
          <FieldLabel>Pé-direito (m)</FieldLabel>
          <select value={room.ceilingHeight} onChange={e => onChange({ ...room, ceilingHeight: parseFloat(e.target.value) })}
            className="w-full h-9 px-3 text-sm border border-teka-border rounded bg-white">
            {CEILING_HEIGHTS.map(h => <option key={h} value={h}>{h} m</option>)}
          </select>
        </div>
      </div>
      {area > 0 && (
        <p className="text-xs text-teka-gray-medium">
          Área: <span className="font-semibold text-teka-dark">{area.toFixed(1)} m²</span>
          {' · '}Volume: <span className="font-semibold text-teka-dark">{(area * room.ceilingHeight).toFixed(1)} m³</span>
        </p>
      )}
    </div>
  );
}

// ============================================================
// Coverage Bar
// ============================================================

function CoverageBar({ percent }: { percent: number }) {
  const color = percent >= 100 ? 'bg-teka-success' : percent >= 80 ? 'bg-teka-warning' : 'bg-teka-error';
  return (
    <div className="w-full h-2 bg-teka-gray-bg rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${Math.min(percent, 100)}%` }} />
    </div>
  );
}

// ============================================================
// Result Display
// ============================================================

function ResultDisplay({ result, onReset }: { result: SimulatorResult; onReset: () => void }) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { recommendedSetup: rec, alternativeSetup: alt } = result;

  return (
    <div className="space-y-6 mt-8 pt-8 border-t-2 border-teka-red">
      <div className="bg-teka-light rounded p-6">
        <h3 className="text-lg font-bold text-teka-dark flex items-center gap-2">
          <Thermometer className="h-5 w-5 text-teka-red" />
          Resultado da Simulação
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-teka-gray">Potência necessária</p>
            <p className="text-2xl font-bold text-teka-dark">{result.totalBTU.toLocaleString('pt-PT')} <span className="text-sm font-normal">BTU/h</span></p>
            <p className="text-sm text-teka-gray">{result.totalKW} kW</p>
          </div>
          <div>
            <p className="text-xs text-teka-gray">Área total</p>
            <p className="text-2xl font-bold text-teka-dark">{result.rooms.reduce((s, r) => s + r.area, 0).toFixed(1)} <span className="text-sm font-normal">m²</span></p>
          </div>
        </div>
      </div>

      {/* Recommended Model */}
      <div className="bg-white border border-teka-border rounded p-6">
        <p className="text-xs font-semibold text-teka-red uppercase tracking-wider">Modelo Recomendado</p>
        <h4 className="text-xl font-bold text-teka-dark mt-1">TEKA {rec.exterior.name}</h4>
        <p className="text-sm text-teka-gray mt-1">
          {rec.type === 'mono-split'
            ? `${rec.exterior.modelInterior} + ${rec.exterior.modelExterior}`
            : `${rec.interiors.map(i => i.modelInterior).join(' + ')} + ${rec.exterior.modelExterior}`
          }
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-teka-red" /><span>{rec.totalCapacityBTU.toLocaleString('pt-PT')} BTU ({rec.totalCapacityKW} kW)</span></div>
          <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-teka-success" /><span>Classe {rec.energyClass}</span></div>
          <div className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-teka-gray" /><span>Desde {rec.exterior.noiseInterior.baixa} dB(A)</span></div>
          <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-teka-success" /><span>{rec.exterior.refrigerant}</span></div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-teka-gray">Cobertura</span>
            <span className={`font-semibold ${rec.coveragePercent >= 100 ? 'text-teka-success' : rec.coveragePercent >= 80 ? 'text-teka-warning' : 'text-teka-error'}`}>
              {rec.coveragePercent}%
            </span>
          </div>
          <CoverageBar percent={rec.coveragePercent} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {rec.exterior.features.slice(0, 6).map(f => (
            <span key={f} className="text-[11px] px-2 py-1 bg-teka-gray-bg rounded text-teka-gray">✓ {f}</span>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <Link href={`/produto/${rec.exterior.slug}`}><Button size="lg">Ver Ficha Completa</Button></Link>
          <Link href="/suporte/contacto"><Button variant="outline" size="lg">Pedir Orçamento</Button></Link>
        </div>
      </div>

      {/* Multi-split room breakdown */}
      {result.rooms.length > 1 && (
        <div className="bg-white border border-teka-border rounded p-6">
          <p className="text-xs font-semibold text-teka-gray uppercase tracking-wider mb-3">Detalhe por Divisão</p>
          {result.rooms.map((rr, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-teka-gray-bg last:border-0">
              <div>
                <span className="text-sm font-medium text-teka-dark capitalize">{rr.room.type}</span>
                <span className="text-xs text-teka-gray ml-2">({rr.area.toFixed(1)} m²)</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-teka-dark">{rr.btuRequired.toLocaleString('pt-PT')} BTU</span>
                <span className="text-xs text-teka-gray ml-2">→ {rec.interiors[i]?.name ?? '—'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consumption */}
      <div className="bg-white border border-teka-border rounded p-6">
        <p className="text-xs font-semibold text-teka-gray uppercase tracking-wider mb-3">Consumo Estimado</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-teka-gray">Potência</p>
            <p className="text-lg font-bold text-teka-dark">{result.estimatedConsumption.wattsNominal.toLocaleString('pt-PT')} W</p>
          </div>
          <div>
            <p className="text-xs text-teka-gray">Mensal</p>
            <p className="text-lg font-bold text-teka-dark">~{result.estimatedConsumption.kwhPerMonth} kWh</p>
          </div>
          <div>
            <p className="text-xs text-teka-gray">Custo est.</p>
            <p className="text-lg font-bold text-teka-dark">~{result.estimatedConsumption.costPerMonthAOA.toLocaleString('pt-PT')} Kz</p>
          </div>
        </div>
        <p className="text-[11px] text-teka-gray-medium mt-3">Baseado em tarifa 45 AOA/kWh. Valor meramente indicativo.</p>
      </div>

      {/* Alternative */}
      {alt && (
        <div className="bg-teka-gray-bg rounded p-5">
          <p className="text-xs font-semibold text-teka-gray uppercase tracking-wider">Alternativa</p>
          <p className="text-sm font-semibold text-teka-dark mt-1">TEKA {alt.exterior.name}</p>
          <p className="text-xs text-teka-gray mt-1">Cobertura {alt.coveragePercent}% — adequado se o isolamento for bom.</p>
          <Link href={`/produto/${alt.exterior.slug}`} className="text-xs text-teka-red font-medium mt-2 inline-block hover:underline">Ver detalhes →</Link>
        </div>
      )}

      {/* Calculation breakdown */}
      <div className="border border-teka-border rounded">
        <button onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full p-4 flex items-center justify-between text-sm font-medium text-teka-dark hover:bg-teka-gray-bg transition-colors">
          <span>Detalhe do cálculo</span>
          {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        {showBreakdown && (
          <div className="px-4 pb-4 space-y-1">
            {result.calculationBreakdown.map((step, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-teka-gray">{step.label}</span>
                <span className="font-medium text-teka-dark">{step.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-teka-gray-medium leading-relaxed">
        Este resultado é uma estimativa. Para um dimensionamento exacto, contacte a nossa equipa técnica.
      </p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onReset} className="gap-2"><RotateCcw className="h-4 w-4" /> Nova Simulação</Button>
        <Link href="/suporte/contacto"><Button className="gap-2"><Wifi className="h-4 w-4" /> Falar com a Equipa</Button></Link>
      </div>
    </div>
  );
}

// ============================================================
// Main Component — Single Page Form
// ============================================================

export function ACSimulator() {
  const [result, setResult] = useState<SimulatorResult | null>(null);

  // Form state
  const [installationType, setInstallationType] = useState<'mono-split' | 'multi-split'>('mono-split');
  const [rooms, setRooms] = useState<RoomInput[]>([
    { type: 'sala', length: 0, width: 0, ceilingHeight: 2.8 },
    { type: 'quarto', length: 0, width: 0, ceilingHeight: 2.8 },
    { type: 'quarto', length: 0, width: 0, ceilingHeight: 2.8 },
  ]);
  const [numRooms, setNumRooms] = useState(2);
  const [people, setPeople] = useState(2);
  const [equipment, setEquipment] = useState('1-2');
  const [windows, setWindows] = useState(2);
  const [solar, setSolar] = useState('moderado');
  const [floor, setFloor] = useState('intermedio');
  const [insulation, setInsulation] = useState('normal');
  const [mode, setMode] = useState('arrefecimento');
  const [usage, setUsage] = useState('dia-inteiro');
  const [hasFalseCeiling, setHasFalseCeiling] = useState(false);
  const [city, setCity] = useState('luanda');

  const canCalculate = () => {
    const activeRooms = installationType === 'mono-split' ? rooms.slice(0, 1) : rooms.slice(0, numRooms);
    return activeRooms.every(r => r.length > 0 && r.width > 0);
  };

  const handleCalculate = () => {
    const activeRooms = installationType === 'mono-split' ? rooms.slice(0, 1) : rooms.slice(0, numRooms);
    const input: SimulatorInput = {
      installationType, rooms: activeRooms, people, equipment, windows, solar,
      floor, insulation, mode, usage, hasFalseCeiling, city,
    };
    setResult(calculateSimulation(input));
  };

  const handleReset = () => setResult(null);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-teka-border rounded p-6 lg:p-8 space-y-8">

        {/* SECÇÃO 1 — Tipo de Instalação */}
        <div>
          <SectionTitle>1. Tipo de instalação</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setInstallationType('mono-split')}
              className={`p-5 border-2 rounded text-left transition-all ${installationType === 'mono-split' ? 'border-teka-red bg-teka-red/5' : 'border-teka-border hover:border-teka-gray'}`}>
              <span className="text-2xl">🏠</span>
              <p className="text-sm font-bold text-teka-dark mt-2">Uma divisão</p>
              <p className="text-xs text-teka-gray mt-0.5">Mono-Split (1 int. + 1 ext.)</p>
            </button>
            <button onClick={() => setInstallationType('multi-split')}
              className={`p-5 border-2 rounded text-left transition-all ${installationType === 'multi-split' ? 'border-teka-red bg-teka-red/5' : 'border-teka-border hover:border-teka-gray'}`}>
              <span className="text-2xl">🏢</span>
              <p className="text-sm font-bold text-teka-dark mt-2">Várias divisões</p>
              <p className="text-xs text-teka-gray mt-0.5">Multi-Split (2-3 int. + 1 ext.)</p>
            </button>
          </div>
        </div>

        {/* SECÇÃO 2 — Dimensões */}
        <div>
          <SectionTitle>2. Dimensões do espaço</SectionTitle>
          {installationType === 'mono-split' ? (
            <RoomForm room={rooms[0]} index={-1} onChange={r => { const u = [...rooms]; u[0] = r; setRooms(u); }} />
          ) : (
            <>
              <div className="flex gap-3 mb-4">
                {[2, 3].map(n => (
                  <OptionButton key={n} selected={numRooms === n} onClick={() => setNumRooms(n)}>
                    {n} divisões
                  </OptionButton>
                ))}
              </div>
              <div className="space-y-3">
                {rooms.slice(0, numRooms).map((room, i) => (
                  <RoomForm key={i} room={room} index={i} onChange={r => { const u = [...rooms]; u[i] = r; setRooms(u); }} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* SECÇÃO 3 — Factores Ambientais */}
        <div>
          <SectionTitle>3. Factores ambientais</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>N.º de pessoas</FieldLabel>
              <select value={people} onChange={e => setPeople(parseInt(e.target.value))}
                className="w-full h-9 px-3 text-sm border border-teka-border rounded bg-white">
                {PEOPLE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <FieldLabel>Aparelhos electrónicos</FieldLabel>
              <select value={equipment} onChange={e => setEquipment(e.target.value)}
                className="w-full h-9 px-3 text-sm border border-teka-border rounded bg-white">
                <option value="nenhum">Nenhum</option>
                <option value="1-2">1-2 (normal)</option>
                <option value="3-5">3-5</option>
                <option value="6+">6+</option>
              </select>
            </div>
            <div>
              <FieldLabel>N.º de janelas</FieldLabel>
              <select value={windows} onChange={e => setWindows(parseInt(e.target.value))}
                className="w-full h-9 px-3 text-sm border border-teka-border rounded bg-white">
                {[0, 1, 2, 3, 4].map(w => <option key={w} value={w}>{w}{w === 4 ? '+' : ''}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <FieldLabel>Exposição solar</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {[{ v: 'pouco', l: '☁️ Pouco' }, { v: 'moderado', l: '🌤️ Moderado' }, { v: 'intenso', l: '☀️ Intenso' }].map(o => (
                  <OptionButton key={o.v} selected={solar === o.v} onClick={() => setSolar(o.v)}>{o.l}</OptionButton>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Andar</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {[{ v: 'rdc', l: 'Rés-do-chão' }, { v: 'intermedio', l: 'Intermédio' }, { v: 'ultimo', l: 'Último' }].map(o => (
                  <OptionButton key={o.v} selected={floor === o.v} onClick={() => setFloor(o.v)}>{o.l}</OptionButton>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Isolamento térmico</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {[{ v: 'bom', l: 'Bom' }, { v: 'normal', l: 'Normal' }, { v: 'fraco', l: 'Fraco' }].map(o => (
                  <OptionButton key={o.v} selected={insulation === o.v} onClick={() => setInsulation(o.v)}>{o.l}</OptionButton>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECÇÃO 4 — Utilização */}
        <div>
          <SectionTitle>4. Utilização</SectionTitle>
          <div className="space-y-3">
            <div>
              <FieldLabel>Modo principal</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {[{ v: 'arrefecimento', l: '❄️ Arrefecimento' }, { v: 'aquecimento', l: '🔥 Aquecimento' }, { v: 'ambos', l: '♻️ Ambos' }].map(o => (
                  <OptionButton key={o.v} selected={mode === o.v} onClick={() => setMode(o.v)}>{o.l}</OptionButton>
                ))}
              </div>
            </div>
            <div>
              <FieldLabel>Horário de utilização</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {[{ v: 'dia-inteiro', l: 'Dia inteiro' }, { v: 'manha-tarde', l: 'Manhã+Tarde' }, { v: 'noite', l: 'Noite' }, { v: 'escritorio', l: 'Escritório (8h)' }].map(o => (
                  <OptionButton key={o.v} selected={usage === o.v} onClick={() => setUsage(o.v)}>{o.l}</OptionButton>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Tecto falso?</FieldLabel>
                <div className="flex gap-2">
                  <OptionButton selected={hasFalseCeiling} onClick={() => setHasFalseCeiling(true)}>Sim</OptionButton>
                  <OptionButton selected={!hasFalseCeiling} onClick={() => setHasFalseCeiling(false)}>Não</OptionButton>
                </div>
              </div>
              <div>
                <FieldLabel>Cidade</FieldLabel>
                <select value={city} onChange={e => setCity(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-teka-border rounded bg-white">
                  {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÃO CALCULAR */}
        <div className="pt-4 border-t border-teka-gray-bg">
          <Button onClick={handleCalculate} disabled={!canCalculate()} size="lg" className="w-full gap-2 h-12 text-sm">
            <Calculator className="h-5 w-5" /> Calcular Potência
          </Button>
          {!canCalculate() && (
            <p className="text-xs text-teka-gray-medium mt-2 text-center">Preencha as dimensões de todas as divisões para calcular.</p>
          )}
        </div>

        {/* RESULTADO */}
        {result && <ResultDisplay result={result} onReset={handleReset} />}
      </div>
    </div>
  );
}
