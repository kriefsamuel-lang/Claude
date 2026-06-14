import type { SalarieResult, SalarieInput } from '../engine/types';
import { formatCurrency, formatPercent } from '../engine/format';
import { PdfButton } from '../pdf/PdfButton';

interface Props {
  result: SalarieResult;
  input: SalarieInput;
  year: number;
}

function Row({ label, value, indent = false, note }: { label: string; value: string; indent?: boolean; note?: string }) {
  return (
    <div className={`flex justify-between items-center py-1.5 text-sm ${indent ? 'pl-4' : ''}`}>
      <span className="text-gray-600">
        {label}
        {note && <span className="ml-1 text-xs text-gray-400">({note})</span>}
      </span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function RowTotal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 font-semibold text-navy border-t border-gray-200 mt-1">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Block({ title, borderColor = 'border-navy', children }: { title: string; borderColor?: string; children: React.ReactNode }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 border-l-4 ${borderColor}`}>
      <h3 className="text-xs font-semibold text-navy uppercase tracking-wide mb-3">{title}</h3>
      {children}
    </div>
  );
}

export default function ResultsPanel({ result, input, year }: Props) {
  const { brut, net, bl, ir, pension, keren, creditPointLines, indirect } = result;

  return (
    <div className="space-y-4">
      {input.mode === 'net' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
          Mode NET → BRUT : solveur bisection — {result.solverIterations} itération{result.solverIterations > 1 ? 's' : ''},
          {result.solverConverged ? ' convergé ✓' : ' ⚠️ non convergé'}
        </div>
      )}

      {/* Bloc 1 : Côté employé */}
      <Block title="Côté employé — du brut au net">
        <Row label="Salaire brut" value={formatCurrency(brut)} />
        <div className="border-t border-gray-100 my-2" />
        <Row label="ביטוח לאומי (BL)" value={`− ${formatCurrency(bl.employeeLeumi)}`} indent />
        <Row label="ביטוח בריאות (Santé)" value={`− ${formatCurrency(bl.employeeHealth)}`} indent />
        <Row label="Pension (tagmoulim employé)" value={`− ${formatCurrency(pension.employeeContrib)}`} indent
          note={`${(input.pension.employeeTagmoulimRate * 100).toFixed(1)} %`} />
        {keren.employeeContrib > 0 && (
          <Row label="קרן השתלמות (employé)" value={`− ${formatCurrency(keren.employeeContrib)}`} indent
            note={`${(input.keren.employeeRate * 100).toFixed(1)} %`} />
        )}
        <div className="border-t border-gray-100 my-2" />
        <div className="bg-gray-50 rounded p-3 mb-1">
          <p className="text-xs font-semibold text-gray-500 mb-2">Impôt sur le revenu (מס הכנסה)</p>
          <Row label="Revenu imposable" value={formatCurrency(ir.taxableIncome)} indent />
          <Row label="Impôt par tranches progressives" value={formatCurrency(ir.bracketTax)} indent />
          {ir.surtax > 0 && <Row label="מס יסף (3 %)" value={formatCurrency(ir.surtax)} indent />}
          <div className="border-t border-gray-200 my-1" />
          <p className="text-xs text-gray-500 mb-1">
            {creditPointLines.map(l => `${l.label} (${l.points} pts)`).join(' · ')}
          </p>
          <Row label={`נקודות זיכוי (${ir.creditPoints.toFixed(2)} pts × ${formatCurrency(242)}/mois)`}
            value={`− ${formatCurrency(ir.creditPointsValue)}`} indent />
          {ir.pensionCredit > 0 && (
            <Row label="זיכוי pension §45א (35 %)" value={`− ${formatCurrency(ir.pensionCredit)}`} indent />
          )}
        </div>
        <Row label="Impôt sur le revenu NET" value={`− ${formatCurrency(ir.netTax)}`} />
        <RowTotal label="NET À PAYER" value={formatCurrency(net)} />
      </Block>

      {/* Bloc 2 : Charges employeur directes */}
      <Block title="Charges employeur directes (עלות ישירה)">
        <Row label="Salaire brut" value={formatCurrency(brut)} />
        <div className="border-t border-gray-100 my-2" />
        <Row label="ביטוח לאומי employeur" value={`+ ${formatCurrency(bl.employerBL)}`} indent />
        <Row label="Pension tagmoulim employeur" value={`+ ${formatCurrency(pension.employerTagmoulim)}`} indent
          note={`${(input.pension.employerTagmoulimRate * 100).toFixed(1)} %`} />
        <Row label="Pitsouim employeur (פיצויים)" value={`+ ${formatCurrency(pension.employerPitsouim)}`} indent
          note={`${(input.pension.employerPitsouimRate * 100).toFixed(1)} %`} />
        {keren.employerContrib > 0 && (
          <Row label="קרן השתלמות employeur" value={`+ ${formatCurrency(keren.employerContrib)}`} indent
            note={`${(input.keren.employerRate * 100).toFixed(1)} %`} />
        )}
        {keren.employerTaxable > 0 && (
          <Row label="⚠️ Keren employeur hors plafond (avantage imposable)" value={formatCurrency(keren.employerTaxable)} indent />
        )}
        <RowTotal label="Coût direct employeur" value={formatCurrency(result.totalEmployerDirectCosts)} />
      </Block>

      {/* Bloc 3 : Charges indirectes */}
      {indirect.totalMonthly > 0 && (
        <Block title="Charges indirectes — provisions estimatives" borderColor="border-gold">
          <div className="inline-block text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium mb-3">
            Provision indicative — non contractuelle
          </div>
          {indirect.havaraMonthly > 0 && (
            <Row label={`דמי הבראה (ancienneté ${input.indirectCosts.seniority} ans)`}
              value={`+ ${formatCurrency(indirect.havaraMonthly)}`} />
          )}
          {indirect.holidaysMonthly > 0 && (
            <Row label="Congés annuels (provision mensuelle)" value={`+ ${formatCurrency(indirect.holidaysMonthly)}`} />
          )}
          {indirect.publicHolidaysMonthly > 0 && (
            <Row label="Jours fériés — חגים (provision)" value={`+ ${formatCurrency(indirect.publicHolidaysMonthly)}`} />
          )}
          <RowTotal label="Total provisions mensuelles" value={formatCurrency(indirect.totalMonthly)} />
        </Block>
      )}

      {/* Synthèse */}
      <div className="bg-navy text-white rounded-xl p-6">
        <h3 className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: '#C9A24B' }}>
          Synthèse — עלות מעביד מלאה
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Salaire brut', val: formatCurrency(brut) },
            { label: 'Net perçu', val: formatCurrency(net) },
            { label: 'Charges directes employeur', val: formatCurrency(result.totalEmployerDirectCosts) },
            { label: 'Provisions indirectes', val: formatCurrency(result.totalEmployerIndirect) },
          ].map(({ label, val }) => (
            <div key={label} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</p>
              <p className="text-base font-bold tabular-nums">{val}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 text-center mb-4" style={{ background: 'rgba(201,162,75,0.2)', border: '1px solid rgba(201,162,75,0.4)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#C9A24B' }}>
            Coût total employeur (עלות מעביד מלאה)
          </p>
          <p className="text-3xl font-bold tabular-nums">{formatCurrency(result.totalEmployerCost)}</p>
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Ratio Net / Coût total</p>
            <p className="font-bold" style={{ color: '#C9A24B' }}>{formatPercent(result.netToCostRatio)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Charges salarié / Brut</p>
            <p className="font-bold" style={{ color: '#C9A24B' }}>{formatPercent(result.totalEmployeeDeductions / brut)}</p>
          </div>
        </div>
      </div>

      <div className="text-right">
        <PdfButton result={result} input={input} year={year} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
        <strong>⚠️ Taux fiscaux {year} :</strong> plusieurs paramètres sont marqués "À VALIDER"
        (BL employé/employeur, bornes IR, הבראה, plafond keren). Contrôler contre
        אגרת מעסיקים 651, חוזר BTL {year}, לוח עזר רשות המסים avant usage en production.
      </div>
    </div>
  );
}
