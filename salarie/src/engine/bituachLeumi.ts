import type { SalariedYearParams } from './params/types';
import type { BLResult } from './types';
import { round2 } from './format';

/**
 * Calcul des cotisations ביטוח לאומי pour un salarié (שכיר).
 * Deux medragot : réduite (sous le seuil) et pleine (au-dessus).
 * L'employeur ne cotise que pour la part BL (pas de part santé).
 */
export function computeBL(monthlySalary: number, p: SalariedYearParams): BLResult {
  const capped = Math.min(monthlySalary, p.bituachLeumi.maxMonthlyIncome);
  const reducedPart = Math.min(capped, p.bituachLeumi.reducedMonthlyCeiling);
  const fullPart = Math.max(0, capped - p.bituachLeumi.reducedMonthlyCeiling);

  const employeeLeumi = round2(
    reducedPart * p.bituachLeumi.employee.reduced.leumi +
    fullPart    * p.bituachLeumi.employee.full.leumi
  );
  const employeeHealth = round2(
    reducedPart * p.bituachLeumi.employee.reduced.health +
    fullPart    * p.bituachLeumi.employee.full.health
  );
  const employerBL = round2(
    reducedPart * p.bituachLeumi.employer.reduced +
    fullPart    * p.bituachLeumi.employer.full
  );

  return {
    employeeLeumi,
    employeeHealth,
    employeeTotal: round2(employeeLeumi + employeeHealth),
    employerBL,
  };
}
