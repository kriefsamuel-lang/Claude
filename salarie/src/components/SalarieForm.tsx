import { useState } from 'react';
import type { SalarieInput, ChildEntry, MaritalStatus } from '../engine/types';

interface Props {
  onCalculate: (input: SalarieInput) => void;
}

const DEFAULT_INPUT: SalarieInput = {
  mode: 'brut',
  salaryInput: 15_000,
  fiscalYear: 2026,
  employmentRate: 1,
  personal: {
    birthYear: 1985,
    gender: 'M',
    maritalStatus: 'single',
    spouseNoIncome: false,
    children: [],
    paysMezonot: false,
    aliyahDate: null,
    hasAcademicDegree: false,
    isDischargedSoldier: false,
  },
  pension: {
    productType: 'keren_pensia',
    employeeTagmoulimRate: 0.06,
    employerTagmoulimRate: 0.065,
    employerPitsouimRate: 0.06,
  },
  keren: { enabled: true, employeeRate: 0.025, employerRate: 0.075 },
  indirectCosts: { includeHavara: true, includeHolidays: false, includePublicHolidays: false, seniority: 3 },
  clientName: '',
};

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 text-left font-semibold text-sm text-navy hover:bg-gray-100 transition-colors"
      >
        <span>{title}</span>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-4 py-4 space-y-3">{children}</div>}
    </div>
  );
}

function PctInput({ value, onChange, step = 0.5 }: { value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <input
      type="number"
      min={0}
      max={100}
      step={step}
      value={(value * 100).toFixed(1)}
      onChange={e => onChange(parseFloat(e.target.value) / 100)}
      className="form-input w-24 text-right"
    />
  );
}

export default function SalarieForm({ onCalculate }: Props) {
  const [input, setInput] = useState<SalarieInput>(DEFAULT_INPUT);

  const set = <K extends keyof SalarieInput>(key: K, val: SalarieInput[K]) =>
    setInput(prev => ({ ...prev, [key]: val }));

  const setPersonal = <K extends keyof SalarieInput['personal']>(key: K, val: SalarieInput['personal'][K]) =>
    setInput(prev => ({ ...prev, personal: { ...prev.personal, [key]: val } }));

  const setPension = <K extends keyof SalarieInput['pension']>(key: K, val: SalarieInput['pension'][K]) =>
    setInput(prev => ({ ...prev, pension: { ...prev.pension, [key]: val } }));

  const setKeren = <K extends keyof SalarieInput['keren']>(key: K, val: SalarieInput['keren'][K]) =>
    setInput(prev => ({ ...prev, keren: { ...prev.keren, [key]: val } }));

  const setIndirect = <K extends keyof SalarieInput['indirectCosts']>(key: K, val: SalarieInput['indirectCosts'][K]) =>
    setInput(prev => ({ ...prev, indirectCosts: { ...prev.indirectCosts, [key]: val } }));

  const addChild = () =>
    setPersonal('children', [...input.personal.children, { birthYear: 2020, claiming: true }]);

  const updateChild = (i: number, child: ChildEntry) =>
    setPersonal('children', input.personal.children.map((c, idx) => idx === i ? child : c));

  const removeChild = (i: number) =>
    setPersonal('children', input.personal.children.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate(input);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode + Salaire */}
      <div className="card space-y-4">
        <div>
          <p className="form-label">Mode de saisie</p>
          <div className="flex gap-3">
            {(['brut', 'net'] as const).map(m => (
              <label key={m} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={input.mode === m}
                  onChange={() => set('mode', m)}
                  className="accent-navy"
                />
                <span className="text-sm font-medium">
                  {m === 'brut' ? 'Je connais le BRUT' : 'Je connais le NET'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              Salaire {input.mode === 'brut' ? 'BRUT' : 'NET'} mensuel (₪)
            </label>
            <input
              type="number"
              min={1}
              value={input.salaryInput}
              onChange={e => set('salaryInput', parseFloat(e.target.value))}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Année fiscale</label>
            <select
              value={input.fiscalYear}
              onChange={e => set('fiscalYear', parseInt(e.target.value) as 2025 | 2026)}
              className="form-select"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Taux d'emploi (היקף משרה) : {Math.round(input.employmentRate * 100)} %</label>
          <input
            type="range"
            min={10}
            max={100}
            step={10}
            value={Math.round(input.employmentRate * 100)}
            onChange={e => set('employmentRate', parseInt(e.target.value) / 100)}
            className="w-full accent-navy"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10 %</span><span>50 %</span><span>100 %</span>
          </div>
        </div>

        <div>
          <label className="form-label">Nom du client / salarié (pour le PDF)</label>
          <input
            type="text"
            value={input.clientName}
            onChange={e => set('clientName', e.target.value)}
            placeholder="Ex. : M. Cohen David"
            className="form-input"
          />
        </div>
      </div>

      {/* Situation personnelle */}
      <Section title="Situation personnelle (נקודות זיכוי)" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Année de naissance</label>
            <input
              type="number"
              min={1930}
              max={2008}
              value={input.personal.birthYear}
              onChange={e => setPersonal('birthYear', parseInt(e.target.value))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Sexe</label>
            <select
              value={input.personal.gender}
              onChange={e => setPersonal('gender', e.target.value as 'M' | 'F')}
              className="form-select"
            >
              <option value="M">Homme (2,25 pts base)</option>
              <option value="F">Femme (2,75 pts base)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Situation maritale</label>
          <select
            value={input.personal.maritalStatus}
            onChange={e => setPersonal('maritalStatus', e.target.value as MaritalStatus)}
            className="form-select"
          >
            <option value="single">Célibataire</option>
            <option value="married">Marié(e)</option>
            <option value="divorced">Divorcé(e)</option>
            <option value="widowed">Veuf/Veuve</option>
          </select>
        </div>

        {input.personal.maritalStatus === 'married' && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={input.personal.spouseNoIncome}
              onChange={e => setPersonal('spouseNoIncome', e.target.checked)}
              className="accent-navy"
            />
            Conjoint(e) sans revenu (+1 pt — conditions §37)
          </label>
        )}

        {input.personal.maritalStatus === 'divorced' && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={input.personal.paysMezonot}
              onChange={e => setPersonal('paysMezonot', e.target.checked)}
              className="accent-navy"
            />
            Paie des מזונות (+1 pt)
          </label>
        )}

        {/* Enfants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="form-label mb-0">Enfants</span>
            <button type="button" onClick={addChild} className="text-xs text-navy underline">+ Ajouter</button>
          </div>
          {input.personal.children.map((child, i) => (
            <div key={i} className="flex gap-2 items-center mb-2">
              <div>
                <label className="text-xs text-gray-500">Naissance</label>
                <input
                  type="number"
                  min={1980}
                  max={2026}
                  value={child.birthYear}
                  onChange={e => updateChild(i, { ...child, birthYear: parseInt(e.target.value) })}
                  className="form-input w-24"
                />
              </div>
              <label className="flex items-center gap-1 text-xs mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={child.claiming}
                  onChange={e => updateChild(i, { ...child, claiming: e.target.checked })}
                  className="accent-navy"
                />
                Je réclame
              </label>
              <button type="button" onClick={() => removeChild(i)} className="text-red-400 mt-4 text-xs">✕</button>
            </div>
          ))}
        </div>

        <div>
          <label className="form-label">Date d'alyah (si עולה חדש)</label>
          <input
            type="date"
            value={input.personal.aliyahDate ?? ''}
            onChange={e => setPersonal('aliyahDate', e.target.value || null)}
            className="form-input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={input.personal.hasAcademicDegree}
              onChange={e => setPersonal('hasAcademicDegree', e.target.checked)}
              className="accent-navy"
            />
            Diplôme académique récent (+1 pt)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={input.personal.isDischargedSoldier}
              onChange={e => setPersonal('isDischargedSoldier', e.target.checked)}
              className="accent-navy"
            />
            חייל משוחרר (service militaire complet, +2 pts)
          </label>
        </div>
      </Section>

      {/* Pension */}
      <Section title="Pension / Épargne (פנסיה וקרן)" defaultOpen={false}>
        <div>
          <label className="form-label">Type de produit</label>
          <select
            value={input.pension.productType}
            onChange={e => setPension('productType', e.target.value as 'keren_pensia' | 'bituach_menahalim')}
            className="form-select"
          >
            <option value="keren_pensia">קרן פנסיה</option>
            <option value="bituach_menahalim">ביטוח מנהלים</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Tagmoulim employé (תגמולים עובד)</span>
            <div className="flex items-center gap-1">
              <PctInput value={input.pension.employeeTagmoulimRate} onChange={v => setPension('employeeTagmoulimRate', v)} />
              <span className="text-xs text-gray-500">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Tagmoulim employeur (תגמולים מעביד)</span>
            <div className="flex items-center gap-1">
              <PctInput value={input.pension.employerTagmoulimRate} onChange={v => setPension('employerTagmoulimRate', v)} />
              <span className="text-xs text-gray-500">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>
              Pitsouim employeur (פיצויים מעביד)
              <span className="text-xs text-gray-400 ml-1">6 % légal · 8,33 % §14</span>
            </span>
            <div className="flex items-center gap-1">
              <PctInput value={input.pension.employerPitsouimRate} onChange={v => setPension('employerPitsouimRate', v)} />
              <span className="text-xs text-gray-500">%</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-3">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={input.keren.enabled}
              onChange={e => setKeren('enabled', e.target.checked)}
              className="accent-navy"
            />
            קרן השתלמות
          </label>
          {input.keren.enabled && (
            <div className="space-y-2 pl-4">
              <div className="flex items-center justify-between text-sm">
                <span>Taux employé</span>
                <div className="flex items-center gap-1">
                  <PctInput value={input.keren.employeeRate} onChange={v => setKeren('employeeRate', v)} />
                  <span className="text-xs text-gray-500">%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Taux employeur</span>
                <div className="flex items-center gap-1">
                  <PctInput value={input.keren.employerRate} onChange={v => setKeren('employerRate', v)} />
                  <span className="text-xs text-gray-500">%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Charges indirectes */}
      <Section title="Charges indirectes (estimations)" defaultOpen={false}>
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
          Ces provisions sont des estimations indicatives — voir avertissement dans les résultats.
        </p>
        <div>
          <label className="form-label">Ancienneté (années)</label>
          <input
            type="number"
            min={0}
            max={50}
            value={input.indirectCosts.seniority}
            onChange={e => setIndirect('seniority', parseInt(e.target.value) || 0)}
            className="form-input w-24"
          />
        </div>
        <div className="space-y-2">
          {[
            { key: 'includeHavara' as const, label: 'דמי הבראה' },
            { key: 'includeHolidays' as const, label: 'Congés annuels (חופשה שנתית)' },
            { key: 'includePublicHolidays' as const, label: 'Jours fériés (חגים)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={input.indirectCosts[key]}
                onChange={e => setIndirect(key, e.target.checked)}
                className="accent-navy"
              />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <button type="submit" className="w-full btn-primary text-center py-4 text-base">
        Calculer les charges
      </button>
    </form>
  );
}
