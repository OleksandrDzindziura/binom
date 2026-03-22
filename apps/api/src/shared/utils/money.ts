/** All DB values are in grosze (integer). Convert for display only. */
export const formatPLN = (grosze: number): string =>
  (grosze / 100).toFixed(2).replace('.', ',') + ' zł';

export const toPLN = (grosze: number): number => grosze / 100;
export const toGrosze = (pln: number): number => Math.round(pln * 100);
