import type { SalariedYearParams } from './types';

/**
 * Paramètres fiscaux 2025 — simulateur charges salariales (שכיר).
 *
 * NB : תיקון 252 est entré en vigueur le 1er février 2025.
 * Ce fichier applique les taux post-תיקון 252 à toute l'année 2025
 * (simplification documentée — écart janvier 2025 non matérialisé).
 *
 * ⚠️ Valeurs marquées "À VALIDER" à contrôler contre les circulaires 2025.
 */
const params2025: SalariedYearParams = {
  year: 2025,

  creditPointValue: 2_904, // même valeur 2025

  incomeTax: {
    // Barème 2025 (tranches annuelles 2025 ÷ 12). À VALIDER לוח עזר 2025.
    brackets: [
      { upTo: 7_010,  rate: 0.10 },
      { upTo: 10_060, rate: 0.14 },
      { upTo: 16_150, rate: 0.20 }, // À VALIDER borne 2025
      { upTo: 22_440, rate: 0.31 }, // À VALIDER
      { upTo: 46_690, rate: 0.35 }, // À VALIDER
      { upTo: null,   rate: 0.47 },
    ],
    surtaxThresholdMonthly: 60_130, // À VALIDER
    surtaxRate: 0.03,
  },

  bituachLeumi: {
    reducedMonthlyCeiling: 7_522,  // À VALIDER — btl.gov.il 2025
    maxMonthlyIncome: 49_030,      // À VALIDER — btl.gov.il 2025

    employee: {
      // Post-תיקון 252 (applicable dès fév 2025). À VALIDER — חוזר BTL 2025.
      reduced: { leumi: 0.0104, health: 0.0323 },
      full:    { leumi: 0.0700, health: 0.0517 },
    },
    employer: {
      // À VALIDER — חוזר BTL 2025.
      reduced: 0.0345,
      full:    0.0760,
    },
  },

  pension: {
    qualifyingMonthlyCeiling: 9_200, // À VALIDER — רשות המסים 2025
    employeeZikuyContribRate: 0.07,
    employeeZikuyRate: 0.35,
  },

  kerenHishtalmout: {
    // À VALIDER — רשות המסים 2025
    employerExemptMonthlyCeiling: 15_712,
    employerExemptRate: 0.075,
    employeeExemptMonthlyCeiling: 15_712,
    employeeExemptRate: 0.025,
  },

  indirectCosts: {
    havaraValuePerDay: 470, // À VALIDER — צו הרחבה 2025
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
      age18:   0.5,
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
    'Taux BL employé 2025 (post-תיקון 252) : À VALIDER — אגרת מעסיקים 651 2025 (btl.gov.il).',
    'Taux BL employeur 2025 (réduit 3,45%) : À VALIDER — btl.gov.il 2025.',
    'Seuil medraga réduite 7 522 ₪ et plafond 49 030 ₪ : À VALIDER.',
    'Bornes IR 2025 (20% à 16 150 ; 31% à 22 440) : À VALIDER — לוח עזר 2025.',
    'הכנסה מזכה pension 9 200 ₪/mois et plafond keren 15 712 ₪/mois : À VALIDER.',
    'Valeur jour הבראה 470 ₪ : À VALIDER — צו הרחבה 2025.',
    'תיקון 252 effectif 1er fév 2025 : taux de janvier non pris en compte (simplification).',
  ],
};

export default params2025;
