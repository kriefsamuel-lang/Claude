import { describe, it, expect } from 'vitest';
import { computeCreditPoints, totalCreditPoints } from '../creditPoints';
import params2026 from '../params/2026';
import type { PersonalInfo } from '../types';

const p = params2026;
const YEAR = 2026;

const basePerson: PersonalInfo = {
  birthYear: 1985,
  gender: 'M',
  maritalStatus: 'single',
  spouseNoIncome: false,
  children: [],
  paysMezonot: false,
  aliyahDate: null,
  hasAcademicDegree: false,
  isDischargedSoldier: false,
};

describe('נקודות זיכוי', () => {
  it('homme célibataire : 2,25 pts', () => {
    const lines = computeCreditPoints(basePerson, YEAR, p);
    expect(totalCreditPoints(lines)).toBeCloseTo(2.25, 2);
  });

  it('femme célibataire : 2,75 pts', () => {
    const lines = computeCreditPoints({ ...basePerson, gender: 'F' }, YEAR, p);
    expect(totalCreditPoints(lines)).toBeCloseTo(2.75, 2);
  });

  it('femme mariée, conjoint sans revenu : 2,75 + 1 = 3,75 pts', () => {
    const lines = computeCreditPoints(
      { ...basePerson, gender: 'F', maritalStatus: 'married', spouseNoIncome: true },
      YEAR, p
    );
    expect(totalCreditPoints(lines)).toBeCloseTo(3.75, 2);
  });

  it('enfant né en 2026 (âge 0) : 1,5 pts', () => {
    const lines = computeCreditPoints(
      { ...basePerson, children: [{ birthYear: 2026, claiming: true }] },
      YEAR, p
    );
    const childLine = lines.find(l => l.label.includes('2026'));
    expect(childLine?.points).toBeCloseTo(1.5, 2);
  });

  it('enfant âge 1 (né 2025) : 4,5 pts', () => {
    const lines = computeCreditPoints(
      { ...basePerson, children: [{ birthYear: 2025, claiming: true }] },
      YEAR, p
    );
    const childLine = lines.find(l => l.label.includes('2025'));
    expect(childLine?.points).toBeCloseTo(4.5, 2);
  });

  it('enfant âge 10 (né 2016) : 1 pt', () => {
    const lines = computeCreditPoints(
      { ...basePerson, children: [{ birthYear: 2016, claiming: true }] },
      YEAR, p
    );
    const childLine = lines.find(l => l.label.includes('2016'));
    expect(childLine?.points).toBeCloseTo(1, 2);
  });

  it('enfant claiming = false : 0 pts ajoutés', () => {
    const lines0 = computeCreditPoints(basePerson, YEAR, p);
    const lines1 = computeCreditPoints(
      { ...basePerson, children: [{ birthYear: 2020, claiming: false }] },
      YEAR, p
    );
    expect(totalCreditPoints(lines0)).toBeCloseTo(totalCreditPoints(lines1), 2);
  });

  it('עולה חדש post-2022, 6 mois d\'ancienneté → prorata pts', () => {
    const lines = computeCreditPoints(
      { ...basePerson, aliyahDate: `${YEAR}-07-01` },
      YEAR, p
    );
    const olehLine = lines.find(l => l.label.includes('עולה'));
    expect(olehLine).toBeDefined();
    expect(olehLine!.points).toBeGreaterThan(0);
    expect(olehLine!.points).toBeLessThan(1); // moins d'un point pour 6 mois
  });

  it('diplôme académique : +1 pt', () => {
    const l0 = totalCreditPoints(computeCreditPoints(basePerson, YEAR, p));
    const l1 = totalCreditPoints(computeCreditPoints({ ...basePerson, hasAcademicDegree: true }, YEAR, p));
    expect(l1 - l0).toBeCloseTo(1, 2);
  });

  it('מזונות (divorcé) : +1 pt', () => {
    const l0 = totalCreditPoints(computeCreditPoints({ ...basePerson, maritalStatus: 'divorced' }, YEAR, p));
    const l1 = totalCreditPoints(computeCreditPoints(
      { ...basePerson, maritalStatus: 'divorced', paysMezonot: true }, YEAR, p
    ));
    expect(l1 - l0).toBeCloseTo(1, 2);
  });
});
