import { describe, it, expect } from 'vitest';
import { computeBL } from '../bituachLeumi';
import { params2026 } from '../params/2026';

const p = params2026;

describe('computeBL — שכיר 2026', () => {
  it('sous le seuil : uniquement taux réduit', () => {
    const r = computeBL(5_000, p);
    const expectedLeumi = Math.round(5_000 * p.bituachLeumi.employee.reduced.leumi * 100) / 100;
    const expectedHealth = Math.round(5_000 * p.bituachLeumi.employee.reduced.health * 100) / 100;
    expect(r.employeeLeumi).toBeCloseTo(expectedLeumi, 1);
    expect(r.employeeHealth).toBeCloseTo(expectedHealth, 1);
    expect(r.employeeTotal).toBeCloseTo(expectedLeumi + expectedHealth, 1);
    expect(r.employerBL).toBeCloseTo(5_000 * p.bituachLeumi.employer.reduced, 1);
  });

  it('au seuil exact (7 703 ₪)', () => {
    const r = computeBL(p.bituachLeumi.reducedMonthlyCeiling, p);
    // tout en medraga réduite
    expect(r.employeeLeumi).toBeCloseTo(
      p.bituachLeumi.reducedMonthlyCeiling * p.bituachLeumi.employee.reduced.leumi, 1
    );
  });

  it('au-dessus du seuil : medraga mixte', () => {
    const salary = 10_000;
    const reducedPart = p.bituachLeumi.reducedMonthlyCeiling;
    const fullPart = salary - reducedPart;
    const r = computeBL(salary, p);
    const expectedLeumi =
      reducedPart * p.bituachLeumi.employee.reduced.leumi +
      fullPart    * p.bituachLeumi.employee.full.leumi;
    expect(r.employeeLeumi).toBeCloseTo(expectedLeumi, 1);
    const expectedEmployer =
      reducedPart * p.bituachLeumi.employer.reduced +
      fullPart    * p.bituachLeumi.employer.full;
    expect(r.employerBL).toBeCloseTo(expectedEmployer, 1);
  });

  it('au plafond (51 910 ₪) : partie plafonnée', () => {
    const r = computeBL(p.bituachLeumi.maxMonthlyIncome, p);
    const r2 = computeBL(p.bituachLeumi.maxMonthlyIncome + 5_000, p);
    // au-delà du plafond, les cotisations ne bougent plus
    expect(r.employeeTotal).toBeCloseTo(r2.employeeTotal, 0);
    expect(r.employerBL).toBeCloseTo(r2.employerBL, 0);
  });

  it('employeur = BL uniquement (pas de santé)', () => {
    const r = computeBL(15_000, p);
    // vérification que l'employeur ne paie pas de cotisation santé séparée
    expect(r.employerBL).toBeGreaterThan(0);
    // l'employé paie leumi + health
    expect(r.employeeTotal).toBeCloseTo(r.employeeLeumi + r.employeeHealth, 2);
  });
});
