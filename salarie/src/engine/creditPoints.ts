import type { SalariedYearParams, OlehBand } from './params/types';
import type { PersonalInfo, CreditPointLine } from './types';

function olehPoints(aliyahDate: string, fiscalYear: number, bands: OlehBand[]): number {
  const aliyah = new Date(aliyahDate);
  const aliyahYear = aliyah.getFullYear();
  const aliyahMonth = aliyah.getMonth(); // 0-indexed

  let total = 0;
  // Parcourir chaque mois de l'année fiscale
  for (let month = 0; month < 12; month++) {
    const calYear = fiscalYear;
    // Mois depuis l'alyah (1 = mois de l'alyah)
    const monthsSince =
      (calYear - aliyahYear) * 12 + month - aliyahMonth + 1;
    if (monthsSince <= 0) continue;

    for (const band of bands) {
      if (monthsSince >= band.fromMonth && monthsSince <= band.toMonth) {
        total += band.pointsPerMonth;
        break;
      }
    }
  }
  return Math.round(total * 1000) / 1000;
}

function childPoints(birthYear: number, fiscalYear: number, p: SalariedYearParams): number {
  const age = fiscalYear - birthYear;
  const cp = p.creditPoints.children;
  if (age === 0) return cp.age0;
  if (age === 1) return cp.age1;
  if (age === 2) return cp.age2;
  if (age === 3) return cp.age3;
  if (age === 4 || age === 5) return cp.age4to5;
  if (age >= 6 && age <= 17) return cp.age6to17;
  if (age === 18) return cp.age18;
  return 0;
}

/**
 * Calcul des נקודות זיכוי pour un salarié.
 * Retourne une liste de lignes détaillées + le total.
 */
export function computeCreditPoints(
  personal: PersonalInfo,
  fiscalYear: number,
  p: SalariedYearParams
): CreditPointLine[] {
  const lines: CreditPointLine[] = [];

  function add(label: string, points: number) {
    if (Math.abs(points) > 0.001) lines.push({ label, points: Math.round(points * 1000) / 1000 });
  }

  // Base résident
  const base = p.creditPoints.residentBase + (personal.gender === 'F' ? p.creditPoints.womanExtra : 0);
  add(personal.gender === 'F' ? 'Résidente israélienne (femme)' : 'Résident israélien', base);

  // Conjoint sans revenu
  if (personal.maritalStatus === 'married' && personal.spouseNoIncome) {
    add('Conjoint(e) sans revenu', p.creditPoints.spouseNoIncome);
  }

  // Enfants réclamés
  for (const child of personal.children) {
    if (!child.claiming) continue;
    const pts = childPoints(child.birthYear, fiscalYear, p);
    if (pts > 0) {
      const age = fiscalYear - child.birthYear;
      add(`Enfant né ${child.birthYear} (${age} an${age > 1 ? 's' : ''})`, pts);
    }
  }

  // מזונות
  if (personal.paysMezonot && personal.maritalStatus === 'divorced') {
    add('Paiement de מזונות', p.creditPoints.mezonot);
  }

  // עולה חדש
  if (personal.aliyahDate) {
    const aliyahYear = new Date(personal.aliyahDate).getFullYear();
    const bands = aliyahYear >= 2022
      ? p.creditPoints.olehScalePost2022
      : p.creditPoints.olehScalePre2022;
    const pts = olehPoints(personal.aliyahDate, fiscalYear, bands);
    if (pts > 0) add('עולה חדש', pts);
  }

  // Diplôme
  if (personal.hasAcademicDegree) {
    add('Diplôme académique', p.creditPoints.academicDegree);
  }

  // Soldat libéré
  if (personal.isDischargedSoldier) {
    add('חייל משוחרר', p.creditPoints.dischargedSoldier);
  }

  return lines;
}

export function totalCreditPoints(lines: CreditPointLine[]): number {
  return Math.round(lines.reduce((s, l) => s + l.points, 0) * 1000) / 1000;
}
