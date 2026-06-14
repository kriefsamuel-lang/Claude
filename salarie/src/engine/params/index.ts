import type { SalariedYearParams } from './types';
import params2025 from './2025';
import params2026 from './2026';

const PARAMS: Record<number, SalariedYearParams> = {
  2025: params2025,
  2026: params2026,
};

export function getParams(year: number): SalariedYearParams {
  const p = PARAMS[year];
  if (!p) throw new Error(`Paramètres non disponibles pour l'année ${year}`);
  return p;
}

export const availableYears = Object.keys(PARAMS).map(Number).sort() as number[];
