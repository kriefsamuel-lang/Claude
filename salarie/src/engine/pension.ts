import type { SalariedYearParams } from './params/types';
import type { PensionResult } from './types';
import { round2 } from './format';

/**
 * Calcul des contributions pension pour un salarié (שכיר).
 *
 * Employé : tagmoulim (cotisation épargne) → déductible + zikuy §45א.
 * Employeur : tagmoulim (épargne) + pitsouim (indemnités de départ).
 *
 * Zikuy (§45א) : crédit d'impôt de 35 % sur la contribution employé
 * jusqu'à employeeZikuyContribRate × min(salaire, הכנסה מזכה mensuelle).
 */
export function computePension(
  monthlySalary: number,
  employeeTagmoulimRate: number,
  employerTagmoulimRate: number,
  employerPitsouimRate: number,
  p: SalariedYearParams
): PensionResult {
  const employeeContrib = round2(monthlySalary * employeeTagmoulimRate);
  const employerTagmoulim = round2(monthlySalary * employerTagmoulimRate);
  const employerPitsouim = round2(monthlySalary * employerPitsouimRate);

  // Crédit §45א : 35 % sur contribution ≤ 7 % de הכנסה מזכה
  const qualifyingBase = Math.min(monthlySalary, p.pension.qualifyingMonthlyCeiling);
  const zikuyBase = Math.min(employeeContrib, qualifyingBase * p.pension.employeeZikuyContribRate);
  const employeeZikuy = round2(zikuyBase * p.pension.employeeZikuyRate);

  return {
    employeeContrib,
    employerTagmoulim,
    employerPitsouim,
    employerTotal: round2(employerTagmoulim + employerPitsouim),
    employeeZikuy,
  };
}
