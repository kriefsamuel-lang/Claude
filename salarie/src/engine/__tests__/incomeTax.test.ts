import { describe, it, expect } from 'vitest';
import { computeIR } from '../incomeTax';
import params2026 from '../params/2026';

const p = params2026;

describe('computeIR mensuel 2026', () => {
  it('salaire dans la 1re tranche (10 %)', () => {
    const r = computeIR(5_000, 0, 0, 0, p);
    expect(r.netTax).toBeCloseTo(5_000 * 0.10, 0);
  });

  it('salaire à la borne de la 1re tranche (7 010 ₪)', () => {
    const r = computeIR(7_010, 0, 0, 0, p);
    expect(r.netTax).toBeCloseTo(7_010 * 0.10, 0);
  });

  it('salaire à cheval sur deux tranches (8 000 ₪)', () => {
    const r = computeIR(8_000, 0, 0, 0, p);
    // 7 010 × 10 % + (8 000 − 7 010) × 14 %
    const expected = 7_010 * 0.10 + (8_000 - 7_010) * 0.14;
    expect(r.netTax).toBeCloseTo(expected, 0);
  });

  it('points de crédit réduisent l\'impôt', () => {
    const r0 = computeIR(10_000, 0, 0, 0, p);
    const r1 = computeIR(10_000, 0, 0, 2.25, p);
    const creditValue = (2.25 * p.creditPointValue) / 12;
    expect(r0.netTax - r1.netTax).toBeCloseTo(creditValue, 0);
  });

  it('impôt net plancher à 0 (beaucoup de points)', () => {
    const r = computeIR(5_000, 0, 0, 20, p);
    expect(r.netTax).toBe(0);
  });

  it('pension employé réduit le revenu imposable', () => {
    const r0 = computeIR(10_000, 0, 0, 0, p);
    const r1 = computeIR(10_000, 600, 0, 0, p);
    expect(r1.taxableIncome).toBe(9_400);
    expect(r1.netTax).toBeLessThan(r0.netTax);
  });

  it('surtax (מס יסף) s\'applique au-dessus du seuil', () => {
    const above = p.incomeTax.surtaxThresholdMonthly + 1_000;
    const r = computeIR(above, 0, 0, 0, p);
    expect(r.surtax).toBeCloseTo(1_000 * 0.03, 1);
  });

  it('pension credit réduit l\'impôt net', () => {
    const r = computeIR(10_000, 0, 500, 0, p);
    const r0 = computeIR(10_000, 0, 0, 0, p);
    expect(r.netTax).toBeCloseTo(Math.max(0, r0.netTax - 500), 0);
  });
});
