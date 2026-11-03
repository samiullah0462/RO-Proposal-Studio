/**
 * Pure domain unit conversion utilities.
 * Strictly no UI, React, or storage imports.
 */

// 1 US gallon = 3.785411784 liters
export const GALLONS_TO_LITERS = 3.78541;
export const MM_PER_INCH = 25.4;
export const GPM_PER_M3H = 4.40286754;

/**
 * Converts Gallons Per Day (GPD) to cubic meters per hour (m³/hr).
 * formula: GPD * 3.78541 / 1000 / 24
 */
export function gpdToM3h(gpd: number): number {
  if (gpd <= 0 || !Number.isFinite(gpd)) return 0;
  return (gpd * GALLONS_TO_LITERS) / 1000 / 24;
}

/**
 * Converts cubic meters per hour (m³/hr) to Gallons Per Day (GPD).
 * formula: m3h * 24 * 1000 / 3.78541
 */
export function m3hToGpd(m3h: number): number {
  if (m3h <= 0 || !Number.isFinite(m3h)) return 0;
  return (m3h * 24 * 1000) / GALLONS_TO_LITERS;
}

/**
 * Converts m³/hr to US Gallons Per Minute (GPM).
 */
export function m3hToGpm(m3h: number): number {
  if (!Number.isFinite(m3h)) return 0;
  return m3h * GPM_PER_M3H;
}

/**
 * Converts US Gallons Per Minute (GPM) to m³/hr.
 */
export function gpmToM3h(gpm: number): number {
  if (!Number.isFinite(gpm)) return 0;
  return gpm / GPM_PER_M3H;
}

/**
 * Converts inches to millimeters (mm).
 */
export function inchToMm(inches: number): number {
  return inches * MM_PER_INCH;
}

/**
 * Converts millimeters (mm) to inches.
 */
export function mmToInch(mm: number): number {
  return mm / MM_PER_INCH;
}

/**
 * Rounding utility with precision.
 */
export function roundTo(val: number, decimals = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * factor) / factor;
}
