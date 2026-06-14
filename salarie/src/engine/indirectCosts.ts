import type { SalariedYearParams, HavaraSlice } from './params/types';
import type { IndirectCostsParams, IndirectCostsResult } from './types';
import { round2 } from './format';

function getDaysFromSlices(seniority: number, slices: HavaraSlice[]): number {
  for (const slice of slices) {
    if (slice.upToYears === null || seniority <= slice.upToYears) {
      return slice.days;
    }
  }
  return slices[slices.length - 1].days;
}

export function getHavaraDays(seniority: number, p: SalariedYearParams): number {
  return getDaysFromSlices(seniority, p.indirectCosts.havaraDays);
}

export function getHolidayDays(seniority: number, p: SalariedYearParams): number {
  return getDaysFromSlices(seniority, p.indirectCosts.holidayDays);
}

/**
 * Calcul des charges indirectes (provisions estimatives mensuelles).
 *
 * ⚠️ Ces montants sont des provisions indicatives.
 * Congés et jours fériés : provision = (jours ÷ jours ouvrés annuels) × salaire mensuel.
 * הבראה : (jours × valeur jour × taux d'emploi) ÷ 12.
 */
export function computeIndirectCosts(
  monthlySalary: number,
  employmentRate: number,
  options: IndirectCostsParams,
  p: SalariedYearParams
): IndirectCostsResult {
  const havaraMonthly = options.includeHavara
    ? round2(
        (getHavaraDays(options.seniority, p) * p.indirectCosts.havaraValuePerDay * employmentRate) / 12
      )
    : 0;

  const holidayDays = getHolidayDays(options.seniority, p);
  const holidaysMonthly = options.includeHolidays
    ? round2((holidayDays / p.indirectCosts.workingDaysPerYear) * monthlySalary)
    : 0;

  const publicHolidaysMonthly = options.includePublicHolidays
    ? round2((p.indirectCosts.publicHolidayDays / p.indirectCosts.workingDaysPerYear) * monthlySalary)
    : 0;

  const totalMonthly = round2(havaraMonthly + holidaysMonthly + publicHolidaysMonthly);

  return { havaraMonthly, holidaysMonthly, publicHolidaysMonthly, totalMonthly };
}
