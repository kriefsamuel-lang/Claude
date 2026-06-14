const ILS = new Intl.NumberFormat('fr-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const ILS_DECIMAL = new Intl.NumberFormat('fr-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const PCT = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  maximumFractionDigits: 1,
});

export function formatILS(n: number): string {
  return ILS.format(n);
}

export function formatILSDecimal(n: number): string {
  return ILS_DECIMAL.format(n);
}

export function formatPct(n: number): string {
  return PCT.format(n);
}

export function formatPctInput(n: number): string {
  return (n * 100).toFixed(1).replace('.', ',') + ' %';
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
