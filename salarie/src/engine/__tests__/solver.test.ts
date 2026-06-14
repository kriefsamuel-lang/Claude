import { describe, it, expect } from 'vitest';
import { grossFromNet } from '../solver';
import { simulate } from '../simulate';
import { getParams } from '../params';
import type { SalarieInput } from '../types';

const p = getParams(2026);

const baseInput: SalarieInput = {
  mode: 'brut',
  salaryInput: 10_000,
  fiscalYear: 2026,
  employmentRate: 1,
  personal: {
    birthYear: 1985,
    gender: 'M',
    maritalStatus: 'single',
    spouseNoIncome: false,
    children: [],
    paysMezonot: false,
    aliyahDate: null,
    hasAcademicDegree: false,
    isDischargedSoldier: false,
  },
  pension: {
    productType: 'keren_pensia',
    employeeTagmoulimRate: 0.06,
    employerTagmoulimRate: 0.065,
    employerPitsouimRate: 0.06,
  },
  keren: { enabled: false, employeeRate: 0.025, employerRate: 0.075 },
  indirectCosts: { includeHavara: false, includeHolidays: false, includePublicHolidays: false, seniority: 5 },
  clientName: '',
};

function netForBrut(brut: number): number {
  const result = simulate({ ...baseInput, mode: 'brut', salaryInput: brut }, p);
  return result.net;
}

describe('Solveur Net → Brut', () => {
  it('brut 10 000 : round-trip net→brut converge à ±1 ₪', () => {
    const target = netForBrut(10_000);
    const { brut, converged } = grossFromNet(target, netForBrut);
    expect(converged).toBe(true);
    expect(Math.abs(brut - 10_000)).toBeLessThan(1);
  });

  it('brut 20 000 : round-trip converge', () => {
    const target = netForBrut(20_000);
    const { brut, converged } = grossFromNet(target, netForBrut);
    expect(converged).toBe(true);
    expect(Math.abs(brut - 20_000)).toBeLessThan(1);
  });

  it('brut 50 000 (haut salaire, surtax) : converge', () => {
    const target = netForBrut(50_000);
    const { brut, converged } = grossFromNet(target, netForBrut);
    expect(converged).toBe(true);
    expect(Math.abs(brut - 50_000)).toBeLessThan(1);
  });

  it('mode NET produit le même résultat que le round-trip', () => {
    const brutResult = simulate({ ...baseInput, mode: 'brut', salaryInput: 15_000 }, p);
    const targetNet = brutResult.net;
    const netResult = simulate({ ...baseInput, mode: 'net', salaryInput: targetNet }, p);
    expect(Math.abs(netResult.brut - 15_000)).toBeLessThan(2);
    expect(Math.abs(netResult.net - targetNet)).toBeLessThan(1);
  });

  it('nombre d\'itérations < 30', () => {
    const target = netForBrut(30_000);
    const { iterations } = grossFromNet(target, netForBrut);
    expect(iterations).toBeLessThan(30);
  });
});
