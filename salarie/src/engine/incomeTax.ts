import type { SalariedYearParams } from './params/types';
import type { IRResult, IRBracketLine } from './types';
import { round2 } from './format';

function computeBracketTax(
  monthlyTaxable: number,
  p: SalariedYearParams
): { lines: IRBracketLine[]; total: number } {
  const lines: IRBracketLine[] = [];
  let remaining = monthlyTaxable;
  let prev = 0;

  for (const bracket of p.incomeTax.brackets) {
    if (remaining <= 0) break;
    const ceiling = bracket.upTo ?? Infinity;
    const slice = Math.min(remaining, ceiling - prev);
    if (slice <= 0) { prev = ceiling; continue; }
    const tax = round2(slice * bracket.rate);
    lines.push({ rate: bracket.rate, base: round2(slice), tax });
    remaining -= slice;
    prev = ceiling;
  }

  return { lines, total: round2(lines.reduce((s, l) => s + l.tax, 0)) };
}

/**
 * Calcul mensuel de l'impôt sur le revenu pour un salarié.
 *
 * revenu imposable = brut − contribution pension employé (dans la limite de la quote-part déductible).
 * La contribution pension employé réduit le revenu imposable et génère aussi un זיכוי (§45א).
 */
export function computeIR(
  monthlyBrut: number,
  pensionEmployeeContrib: number,
  pensionCredit: number,
  creditPointsTotal: number,
  p: SalariedYearParams
): IRResult {
  // La contribution pension employé est déductible du revenu imposable
  const taxableIncome = round2(Math.max(0, monthlyBrut - pensionEmployeeContrib));

  const { lines, total: bracketTax } = computeBracketTax(taxableIncome, p);

  const surtax = taxableIncome > p.incomeTax.surtaxThresholdMonthly
    ? round2((taxableIncome - p.incomeTax.surtaxThresholdMonthly) * p.incomeTax.surtaxRate)
    : 0;

  const grossTax = round2(bracketTax + surtax);
  const creditPointsValue = round2((creditPointsTotal * p.creditPointValue) / 12);
  const netTax = Math.max(0, round2(grossTax - creditPointsValue - pensionCredit));

  return {
    taxableIncome,
    bracketLines: lines,
    bracketTax,
    surtax,
    creditPointsTotal,
    creditPointsValue,
    pensionCredit,
    grossTax,
    netTax,
  };
}
