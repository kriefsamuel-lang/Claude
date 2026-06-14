import type { SalariedYearParams } from './params/types';
import type { KerenResult } from './types';
import { round2 } from './format';

/**
 * Calcul קרן השתלמות pour un salarié.
 *
 * La part employeur est exonérée d'IR jusqu'à employerExemptRate × min(salaire, plafond).
 * Au-delà : avantage imposable pour l'employé (flagué dans le résultat).
 * La part employé est déduite du net (non déductible fiscalement pour le salarié ordinaire).
 */
export function computeKeren(
  monthlySalary: number,
  employeeRate: number,
  employerRate: number,
  p: SalariedYearParams
): KerenResult {
  const employeeContrib = round2(monthlySalary * employeeRate);
  const employerContrib = round2(monthlySalary * employerRate);

  // Part employeur exonérée : jusqu'à employerExemptRate × min(salaire, plafond)
  const exemptBase = Math.min(monthlySalary, p.kerenHishtalmout.employerExemptMonthlyCeiling);
  const employerExempt = round2(Math.min(employerContrib, exemptBase * p.kerenHishtalmout.employerExemptRate));
  const employerTaxableExcess = round2(Math.max(0, employerContrib - employerExempt));

  return { employeeContrib, employerContrib, employerTaxableExcess };
}

export function emptyKeren(): KerenResult {
  return { employeeContrib: 0, employerContrib: 0, employerTaxableExcess: 0 };
}
