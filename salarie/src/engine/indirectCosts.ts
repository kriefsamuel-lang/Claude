import type { SalariedYearParams } from './params/types';
import type { IndirectCostsParams, IndirectCostsResult } from './types';
import { round2 } from './format';

function getDays(seniority: number, slices: { upToYears: number | null; days: number }[]): number {
  for (const slice of slices) {
    if (slice.upToYears === null || seniority <= slice.upToYears) return slice.days;
  }
  return slices[slices.length - 1].days;
}

export function getHavaraDays(seniority: number, p: SalariedYearParams): number {
  return getDays(seniority, p.indirectCosts.havaraDays);
}

export function getHolidayDays(seniority: number, p: SalariedYearParams): number {
  return getDays(seniority, p.indirectCosts.holidayDays);
}

export function computeIndirectCosts(
  monthlySalary: number,
  employmentRate: number,
  options: IndirectCostsParams,
  p: SalariedYearParams
): IndirectCostsResult {
  const havaraMonthly = options.includeHavara
    ? round2((getHavaraDays(options.seniority, p) * p.indirectCosts.havaraValuePerDay * employmentRate) / 12)
    : 0;

  const holidaysMonthly = options.includeHolidays
    ? round2((getHolidayDays(options.seniority, p) / p.indirectCosts.workingDaysPerYear) * monthlySalary)
    : 0;

  const publicHolidaysMonthly = options.includePublicHolidays
    ? round2((p.indirectCosts.publicHolidayDays / p.indirectCosts.workingDaysPerYear) * monthlySalary)
    : 0;

  const totalMonthly = round2(havaraMonthly + holidaysMonthly + publicHolidaysMonthly);
  return { havaraMonthly, holidaysMonthly, publicHolidaysMonthly, totalMonthly };
}
