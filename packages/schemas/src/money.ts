// All DB values are in cents (integer). Convert for display only.
export const formatUSD = (cents: number): string =>
  '$' + Math.floor(cents / 100).toLocaleString('uk-UA');

export const toUSD = (cents: number): number => cents / 100;
export const toCents = (usd: number): number => Math.round(usd * 100);
