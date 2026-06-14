import type { SalariedYearParams } from './params/types';
import type { IRResult } from './types';
import { round2 } from './format';

function computeBracketTax(monthlyTaxable: number, p: SalariedYearParams): number {
  let tax = 0;
  let prev = 0;
  let remaining = monthlyTaxable;

  for (const bracket of p.incomeTax.brackets) {
    if (remaining <= 0) break;
    const ceiling = bracket.upTo ?? Infinity;
    const slice = Math.min(remaining, ceiling - prev);
    if (slice <= 0) { prev = ceiling; continue; }
    tax += slice * bracket.rate;
    remaining -= slice;
    prev = ceiling;
  }

  return round2(tax);
}

export function computeIR(
  monthlyBrut: number,
  pensionEmployeeContrib: number,
  pensionCredit: number,
  creditPointsTotal: number,
  p: SalariedYearParams
): IRResult {
  const taxableIncome = round2(Math.max(0, monthlyBrut - pensionEmployeeContrib));
  const bracketTax = computeBracketTax(taxableIncome, p);

  const surtax = taxableIncome > p.incomeTax.surtaxThresholdMonthly
    ? round2((taxableIncome - p.incomeTax.surtaxThresholdMonthly) * p.incomeTax.surtaxRate)
    : 0;

  const creditPointsValue = round2((creditPointsTotal * p.creditPointValue) / 12);
  const netTax = Math.max(0, round2(bracketTax + surtax - creditPointsValue - pensionCredit));

  return {
    taxableIncome,
    bracketTax,
    surtax,
    creditPoints: creditPointsTotal,
    creditPointsValue,
    pensionCredit,
    netTax,
  };
}
