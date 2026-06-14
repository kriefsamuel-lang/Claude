import type { SalarieResult, SalarieInput } from '../engine/types';
import { formatILS, formatPct } from '../engine/format';
import { PdfButton } from '../pdf/PdfButton';

interface Props {
  result: SalarieResult;
  input: SalarieInput;
  year: number;
}

function Row({ label, value, indent = false, note }: { label: string; value: string; indent?: boolean; note?: string }) {
  return (
    <div className={`result-row ${indent ? 'pl-4' : ''}`}>
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
    <div className="result-row-total border-t border-gray-200 pt-2 mt-1">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function Block({ title, color = 'navy', children }: { title: string; color?: string; children: React.ReactNode }) {
  const border = color === 'gold' ? 'border-gold' : 'border-navy';
  const text = color === 'gold' ? 'text-gold-dark' : 'text-navy';
  return (
    <div className={`card border-l-4 ${border}`}>
      <h3 className={`section-title ${text} mb-3`}>{title}</h3>
      {children}
    </div>
  );
}

export default function ResultsPanel({ result, input, year }: Props) {
  const { brut, net, bl, ir, pension, keren, creditPointLines, indirect } = result;

  return (
    <div className="space-y-4">
      {/* Alerte solveur */}
      {input.mode === 'net' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
          Mode NET → BRUT : solveur bisection, {result.solverIterations} itération{result.solverIterations > 1 ? 's' : ''},
          {result.solverConverged ? ' convergé ✓' : ' non convergé ⚠️'}
        </div>
      )}

      {/* Bloc 1 : Côté employé */}
      <Block title="Côté employé — du brut au net">
        <Row label="Salaire brut" value={formatILS(brut)} />
        <div className="divider" />
        <Row label="ביטוח לאומי (BL)" value={`− ${formatILS(bl.employeeLeumi)}`} indent />
        <Row label="ביטוח בריאות (Santé)" value={`− ${formatILS(bl.employeeHealth)}`} indent />
        <Row label="Pension (tagmoulim employé)" value={`− ${formatILS(pension.employeeContrib)}`} indent
          note={`${(input.pension.employeeTagmoulimRate * 100).toFixed(1)} %`} />
        {keren.employeeContrib > 0 && (
          <Row label="קרן השתלמות (employé)" value={`− ${formatILS(keren.employeeContrib)}`} indent
            note={`${(input.keren.employeeRate * 100).toFixed(1)} %`} />
        )}
        <div className="divider" />
        <div className="bg-gray-50 rounded p-3 mb-1">
          <p className="text-xs font-semibold text-gray-500 mb-1">Impôt sur le revenu (מס הכנסה)</p>
          <Row label="Revenu imposable" value={formatILS(ir.taxableIncome)} indent />
          {ir.bracketLines.map((line, i) => (
            <Row key={i} label={`Tranche ${(line.rate * 100).toFixed(0)} % × ${formatILS(line.base)}`}
              value={formatILS(line.tax)} indent />
          ))}
          {ir.surtax > 0 && <Row label="מס יסף (3 %)" value={formatILS(ir.surtax)} indent />}
          <Row label="Impôt brut" value={formatILS(ir.grossTax)} indent />
          <div className="divider" />
          <p className="text-xs text-gray-500 mb-1">
            Crédits : {creditPointLines.map(l => `${l.label} (${l.points} pts)`).join(' · ')}
          </p>
          <Row label={`נקודות זיכוי (${ir.creditPointsTotal.toFixed(2)} pts × ${formatILS(242)}/mois)`}
            value={`− ${formatILS(ir.creditPointsValue)}`} indent />
          {ir.pensionCredit > 0 && (
            <Row label="זיכוי pension §45א (35 %)" value={`− ${formatILS(ir.pensionCredit)}`} indent />
          )}
        </div>
        <Row label="Impôt sur le revenu NET" value={`− ${formatILS(ir.netTax)}`} />
        <RowTotal label="NET À PAYER" value={formatILS(net)} />
      </Block>

      {/* Bloc 2 : Charges employeur directes */}
      <Block title="Charges employeur directes (עלות ישירה)">
        <Row label="Salaire brut" value={formatILS(brut)} />
        <div className="divider" />
        <Row label="ביטוח לאומי employeur" value={`+ ${formatILS(bl.employerBL)}`} indent />
        <Row label="Pension tagmoulim employeur" value={`+ ${formatILS(pension.employerTagmoulim)}`} indent
          note={`${(input.pension.employerTagmoulimRate * 100).toFixed(1)} %`} />
        <Row label="Pitsouim employeur (פיצויים)" value={`+ ${formatILS(pension.employerPitsouim)}`} indent
          note={`${(input.pension.employerPitsouimRate * 100).toFixed(1)} %`} />
        {keren.employerContrib > 0 && (
          <Row label="קרן השתלמות employeur" value={`+ ${formatILS(keren.employerContrib)}`} indent
            note={`${(input.keren.employerRate * 100).toFixed(1)} %`} />
        )}
        {keren.employerTaxableExcess > 0 && (
          <Row label="⚠️ Keren employeur au-delà plafond (avantage imposable)" value={formatILS(keren.employerTaxableExcess)} indent />
        )}
        <RowTotal label="Coût direct employeur" value={formatILS(result.totalEmployerDirectCosts)} />
      </Block>

      {/* Bloc 3 : Charges indirectes */}
      {(indirect.havaraMonthly > 0 || indirect.holidaysMonthly > 0 || indirect.publicHolidaysMonthly > 0) && (
        <Block title="Charges indirectes — provisions estimatives" color="gold">
          <div className="tag-validate mb-3">Provision indicative — non contractuelle</div>
          {indirect.havaraMonthly > 0 && (
            <Row label={`דמי הבראה (${input.indirectCosts.seniority} ans → jours/12)`}
              value={`+ ${formatILS(indirect.havaraMonthly)}`} />
          )}
          {indirect.holidaysMonthly > 0 && (
            <Row label="Congés annuels (provision mensuelle)" value={`+ ${formatILS(indirect.holidaysMonthly)}`} />
          )}
          {indirect.publicHolidaysMonthly > 0 && (
            <Row label="Jours fériés — חגים (provision)" value={`+ ${formatILS(indirect.publicHolidaysMonthly)}`} />
          )}
          <RowTotal label="Total provisions mensuelles" value={formatILS(indirect.totalMonthly)} />
        </Block>
      )}

      {/* Synthèse */}
      <div className="bg-navy text-white rounded-xl p-6">
        <h3 className="text-gold font-bold text-sm uppercase tracking-wide mb-4">
          Synthèse — עלות מעביד מלאה
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Salaire brut</p>
            <p className="text-lg font-bold tabular-nums">{formatILS(brut)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Net perçu</p>
            <p className="text-lg font-bold tabular-nums">{formatILS(net)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Charges employeur directes</p>
            <p className="text-base font-semibold tabular-nums">{formatILS(result.totalEmployerDirectCosts)}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs text-white/60 mb-1">Provisions indirectes</p>
            <p className="text-base font-semibold tabular-nums">{formatILS(result.totalEmployerIndirect)}</p>
          </div>
        </div>
        <div className="bg-gold/20 border border-gold/40 rounded-xl p-4 text-center mb-4">
          <p className="text-gold text-xs font-semibold uppercase tracking-wide mb-1">
            Coût total employeur (עלות מעביד מלאה)
          </p>
          <p className="text-3xl font-bold tabular-nums">{formatILS(result.totalEmployerCost)}</p>
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-white/60 text-xs">Ratio Net / Coût total</p>
            <p className="font-bold text-gold">{formatPct(result.netToCostRatio)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs">Charges salarié / Brut</p>
            <p className="font-bold text-gold">{formatPct(result.totalEmployeeDeductions / brut)}</p>
          </div>
        </div>
      </div>

      {/* Export PDF */}
      <div className="text-right">
        <PdfButton result={result} input={input} year={year} />
      </div>

      {/* Avertissement taux À VALIDER */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
        <strong>⚠️ Taux fiscaux {year} :</strong> plusieurs paramètres sont marqués "À VALIDER"
        (BL employé/employeur, bornes IR, הבראה, plafond keren). Contrôler contre
        אגרת מעסיקים 651, חוזר BTL {year}, לוח עזר רשות המסים avant usage en production.
      </div>
    </div>
  );
}
