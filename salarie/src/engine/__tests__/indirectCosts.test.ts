import { describe, it, expect } from 'vitest';
import { computeIndirectCosts, getHavaraDays, getHolidayDays } from '../indirectCosts';
import { params2026 } from '../params/2026';

const p = params2026;

describe('Charges indirectes — 2026', () => {
  describe('getHavaraDays', () => {
    it('1 an : 10 jours', () => expect(getHavaraDays(1, p)).toBe(10));
    it('5 ans : 10 jours', () => expect(getHavaraDays(5, p)).toBe(10));
    it('6 ans : 11 jours', () => expect(getHavaraDays(6, p)).toBe(11));
    it('10 ans : 11 jours', () => expect(getHavaraDays(10, p)).toBe(11));
    it('11 ans : 12 jours', () => expect(getHavaraDays(11, p)).toBe(12));
    it('20 ans : 12 jours', () => expect(getHavaraDays(20, p)).toBe(12));
  });

  describe('getHolidayDays', () => {
    it('0 an : 12 jours', () => expect(getHolidayDays(0, p)).toBe(12));
    it('4 ans : 12 jours', () => expect(getHolidayDays(4, p)).toBe(12));
    it('5 ans : 14 jours', () => expect(getHolidayDays(5, p)).toBe(14));
    it('8 ans : 14 jours', () => expect(getHolidayDays(8, p)).toBe(14));
    it('9 ans : 20 jours', () => expect(getHolidayDays(9, p)).toBe(20));
  });

  it('הבראה mensuelle = jours × valeur ÷ 12', () => {
    const r = computeIndirectCosts(10_000, 1, { includeHavara: true, includeHolidays: false, includePublicHolidays: false, seniority: 3 }, p);
    const expected = (10 * p.indirectCosts.havaraValuePerDay) / 12;
    expect(r.havaraMonthly).toBeCloseTo(expected, 0);
  });

  it('הבראה proratée au taux d\'emploi (50 %)', () => {
    const r = computeIndirectCosts(10_000, 0.5, { includeHavara: true, includeHolidays: false, includePublicHolidays: false, seniority: 3 }, p);
    const full = (10 * p.indirectCosts.havaraValuePerDay) / 12;
    expect(r.havaraMonthly).toBeCloseTo(full * 0.5, 0);
  });

  it('congés annuels mensuel = (jours/250) × salaire', () => {
    const salary = 12_000;
    const r = computeIndirectCosts(salary, 1, { includeHavara: false, includeHolidays: true, includePublicHolidays: false, seniority: 2 }, p);
    const expected = (12 / 250) * salary;
    expect(r.holidaysMonthly).toBeCloseTo(expected, 0);
  });

  it('jours fériés mensuel = (9/250) × salaire', () => {
    const salary = 10_000;
    const r = computeIndirectCosts(salary, 1, { includeHavara: false, includeHolidays: false, includePublicHolidays: true, seniority: 0 }, p);
    expect(r.publicHolidaysMonthly).toBeCloseTo((9 / 250) * salary, 0);
  });

  it('tout désactivé : total = 0', () => {
    const r = computeIndirectCosts(10_000, 1, { includeHavara: false, includeHolidays: false, includePublicHolidays: false, seniority: 5 }, p);
    expect(r.totalMonthly).toBe(0);
  });
});
