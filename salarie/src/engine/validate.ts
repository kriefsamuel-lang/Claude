import type { SalarieInput } from './types';

export interface ValidationError {
  field: string;
  message: string;
}

export function validate(input: SalarieInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.salaryInput || input.salaryInput <= 0) {
    errors.push({ field: 'salaryInput', message: 'Le salaire doit être supérieur à 0 ₪.' });
  }

  if (input.employmentRate <= 0 || input.employmentRate > 1) {
    errors.push({ field: 'employmentRate', message: 'Le taux d\'emploi doit être entre 1 % et 100 %.' });
  }

  const currentYear = new Date().getFullYear();
  const { personal } = input;

  if (personal.birthYear < 1920 || personal.birthYear > currentYear - 16) {
    errors.push({ field: 'birthYear', message: 'Année de naissance invalide (âge minimum 16 ans).' });
  }

  if (personal.aliyahDate) {
    const aliyah = new Date(personal.aliyahDate);
    if (isNaN(aliyah.getTime())) {
      errors.push({ field: 'aliyahDate', message: 'Date d\'alyah invalide.' });
    } else if (aliyah.getFullYear() < personal.birthYear + 16) {
      errors.push({ field: 'aliyahDate', message: 'Date d\'alyah antérieure à l\'âge de 16 ans.' });
    } else if (aliyah.getFullYear() > input.fiscalYear) {
      errors.push({ field: 'aliyahDate', message: 'Date d\'alyah postérieure à l\'année fiscale.' });
    }
  }

  for (const child of personal.children) {
    if (child.birthYear < 1980 || child.birthYear > input.fiscalYear) {
      errors.push({ field: 'children', message: `Année de naissance enfant invalide : ${child.birthYear}.` });
    }
  }

  if (input.indirectCosts.seniority < 0) {
    errors.push({ field: 'seniority', message: 'L\'ancienneté ne peut pas être négative.' });
  }

  return errors;
}
