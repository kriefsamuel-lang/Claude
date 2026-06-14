import type { SalariedYearParams } from './types';

/**
 * Paramètres fiscaux 2026 — simulateur charges salariales (שכיר).
 *
 * Sources :
 * - IR mensuel : לוח עזר לחישוב מס הכנסה ינואר 2026 (רשות המסים / gov.il)
 * - Taux BL שכיר : אגרת מעסיקים 651 + חוזר ביטוח לאומי 2026 (btl.gov.il)
 *   Post-תיקון 252 (entré en vigueur février 2025, intégral en 2026).
 * - Pension : צו הרחבה פנסיה מקיפה (2008, mis à jour).
 * - Keren hishtalmout : רשות המסים, הוראת ביצוע.
 * - הבראה : צו הרחבה דמי הבראה / כל-זכות.
 *
 * ⚠️ Les valeurs marquées "À VALIDER" doivent être contrôlées contre les
 * circulaires officielles avant usage en production.
 */
const params2026: SalariedYearParams = {
  year: 2026,

  // 242 ₪/mois — confirmé 2026 (2 904 ₪/an).
  creditPointValue: 2_904,

  incomeTax: {
    // Tranches MENSUELLES (barème annuel ÷ 12).
    // Confirmées לוח עזר ינואר 2026.
    brackets: [
      { upTo: 7_010,  rate: 0.10 },
      { upTo: 10_060, rate: 0.14 },
      { upTo: 19_000, rate: 0.20 }, // palier élargi 2026
      { upTo: 25_100, rate: 0.31 }, // À VALIDER — borne exacte לוח עזר 2026
      { upTo: 46_690, rate: 0.35 }, // À VALIDER
      { upTo: null,   rate: 0.47 },
    ],
    surtaxThresholdMonthly: 60_130, // 721 560 ₪/an ÷ 12 — À VALIDER indexation 2026
    surtaxRate: 0.03,
  },

  bituachLeumi: {
    reducedMonthlyCeiling: 7_703,  // À VALIDER — btl.gov.il 2026 (60 % salaire moyen)
    maxMonthlyIncome: 51_910,      // À VALIDER — btl.gov.il 2026

    employee: {
      // Post-תיקון 252. À VALIDER contre אגרת מעסיקים 651 / חוזר BTL 2026.
      reduced: { leumi: 0.0104, health: 0.0323 },
      full:    { leumi: 0.0700, health: 0.0517 },
    },
    employer: {
      // BL uniquement (pas de part santé côté employeur). À VALIDER — חוזר BTL 2026.
      reduced: 0.0451,
      full:    0.0760,
    },
  },

  pension: {
    // À VALIDER — רשות המסים / הוראת ביצוע pension 2026.
    qualifyingMonthlyCeiling: 9_400,
    employeeZikuyContribRate: 0.07, // jusqu'à 7 % de הכנסה מזכה → crédit 35 %
    employeeZikuyRate: 0.35,
  },

  kerenHishtalmout: {
    // À VALIDER — רשות המסים 2026. Plafond habituel ~15 712 ₪/mois.
    employerExemptMonthlyCeiling: 15_712,
    employerExemptRate: 0.075,
    employeeExemptMonthlyCeiling: 15_712,
    employeeExemptRate: 0.025,
  },

  indirectCosts: {
    havaraValuePerDay: 484,   // À VALIDER — צו הרחבה הבראה 2026 / כל-זכות
    havaraDays: [
      { upToYears: 5,    days: 10 },
      { upToYears: 10,   days: 11 },
      { upToYears: null, days: 12 },
    ],
    holidayDays: [
      { upToYears: 4,    days: 12 },
      { upToYears: 8,    days: 14 },
      { upToYears: null, days: 20 },
    ],
    publicHolidayDays: 9,
    workingDaysPerYear: 250,
  },

  creditPoints: {
    residentBase: 2.25,
    womanExtra: 0.5,
    spouseNoIncome: 1,
    mezonot: 1,
    academicDegree: 1,
    dischargedSoldier: 2,
    children: {
      age0:    1.5,
      age1:    4.5,
      age2:    4.5,
      age3:    3.5,
      age4to5: 2.5,
      age6to17: 1,
      age18:   0.5, // À VALIDER — demi-point l'année des 18 ans
    },
    olehScalePost2022: [
      { fromMonth: 1,  toMonth: 12, pointsPerMonth: 1 / 12 },
      { fromMonth: 13, toMonth: 30, pointsPerMonth: 1 / 4  },
      { fromMonth: 31, toMonth: 42, pointsPerMonth: 1 / 6  },
      { fromMonth: 43, toMonth: 54, pointsPerMonth: 1 / 12 },
    ],
    olehScalePre2022: [
      { fromMonth: 1,  toMonth: 18, pointsPerMonth: 1 / 4  },
      { fromMonth: 19, toMonth: 30, pointsPerMonth: 1 / 6  },
      { fromMonth: 31, toMonth: 42, pointsPerMonth: 1 / 12 },
    ],
  },

  validationNotes: [
    'Taux BL employé 2026 (réduit 1,04%+3,23% ; plein 7%+5,17%) : À VALIDER — אגרת מעסיקים 651 + חוזר BTL 2026 (btl.gov.il).',
    'Taux BL employeur 2026 (réduit 4,51% ; plein 7,60%) : À VALIDER — même source.',
    'Seuil medraga réduite 7 703 ₪ et plafond 51 910 ₪ : À VALIDER — btl.gov.il 2026.',
    'Bornes IR 31% (25 100) et 35% (46 690) et surtax (60 130/mois) : À VALIDER — לוח עזר ינואר 2026.',
    'הכנסה מזכה pension 9 400 ₪/mois : À VALIDER — רשות המסים 2026.',
    'Plafond keren hishtalmout 15 712 ₪/mois : À VALIDER — רשות המסים 2026.',
    'Valeur jour הבראה 484 ₪ : À VALIDER — צו הרחבה הבראה / כל-זכות 2026.',
    'Points enfants 1–3 ans (4,5 / 3,5) : reconduction des suppléments temporaires à valider pour 2026.',
  ],
};

export default params2026;
