/**
 * Paramètres fiscaux annuels — simulateur charges salariales (שכיר).
 * RÈGLE D'OR : tout chiffre fiscal vit ici. Aucun taux/plafond/seuil en dur
 * ailleurs dans le code.
 */

export interface TaxBracket {
  /** Borne supérieure MENSUELLE en ₪ (null = dernière tranche). */
  upTo: number | null;
  rate: number;
}

export interface OlehBand {
  fromMonth: number;
  toMonth: number;
  pointsPerMonth: number;
}

export interface HavaraSlice {
  /** Ancienneté max en années (null = sans limite). */
  upToYears: number | null;
  days: number;
}

export interface SalariedYearParams {
  year: number;

  /** Valeur annuelle d'une נקודת זיכוי (divisée par 12 pour le mensuel). */
  creditPointValue: number;

  incomeTax: {
    /** Barème progressif MENSUEL. */
    brackets: TaxBracket[];
    /** Seuil mensuel du מס יסף. */
    surtaxThresholdMonthly: number;
    surtaxRate: number;
  };

  bituachLeumi: {
    /** Plafond mensuel de la tranche réduite (~60 % salaire moyen). */
    reducedMonthlyCeiling: number;
    /** Plafond mensuel assujetti (max). */
    maxMonthlyIncome: number;
    employee: {
      reduced: { leumi: number; health: number };
      full: { leumi: number; health: number };
    };
    /** Employeur : BL seulement (pas de part santé employeur). */
    employer: {
      reduced: number;
      full: number;
    };
  };

  pension: {
    /** הכנסה מזכה plafond mensuel pour calcul du זיכוי employé. */
    qualifyingMonthlyCeiling: number;
    /** Taux de contribution employé éligible au זיכוי (§45א). */
    employeeZikuyContribRate: number;
    /** Taux du crédit d'impôt sur dépôt éligible (35 %). */
    employeeZikuyRate: number;
  };

  kerenHishtalmout: {
    /** Plafond de salaire mensuel pour l'exonération employeur. */
    employerExemptMonthlyCeiling: number;
    /** Taux employeur exonéré (standard 7,5 %). */
    employerExemptRate: number;
    /** Plafond de salaire mensuel pour l'exonération employé. */
    employeeExemptMonthlyCeiling: number;
    /** Taux employé exonéré (standard 2,5 %). */
    employeeExemptRate: number;
  };

  indirectCosts: {
    /** Valeur jour דמי הבראה (secteur privé). */
    havaraValuePerDay: number;
    /** Barème jours הבראה par tranche d'ancienneté. */
    havaraDays: HavaraSlice[];
    /** Barème jours de congés légaux (חופשה שנתית). */
    holidayDays: HavaraSlice[];
    /** Jours fériés annuels (חגים), secteur privé. */
    publicHolidayDays: number;
    /** Jours ouvrés annuels (pour calcul de la provision). */
    workingDaysPerYear: number;
  };

  creditPoints: {
    residentBase: number;
    womanExtra: number;
    spouseNoIncome: number;
    mezonot: number;
    academicDegree: number;
    dischargedSoldier: number;
    children: {
      age0: number;
      age1: number;
      age2: number;
      age3: number;
      age4to5: number;
      age6to17: number;
      age18: number;
    };
    olehScalePost2022: OlehBand[];
    olehScalePre2022: OlehBand[];
  };

  validationNotes: string[];
}
