/**
 * Pure domain logic for RO flow balance and membrane estimation.
 * Strictly no UI, React, or storage imports.
 */

import { gpdToM3h, m3hToGpd, m3hToGpm } from './units.ts';

export interface RoDesignInputs {
  /** Feed flow rate in GPD or m³/hr */
  feedFlow: number;
  feedFlowUnit: 'GPD' | 'm3h';
  /** Recovery rate as a percentage (e.g. 50 for 50%) */
  recoveryPct: number;
  /** Design raw water TDS in ppm (optional) */
  designTdsPpm?: number;
  /** Expected product water TDS in ppm (optional) */
  targetProductTdsPpm?: number;
  /** Inlet pressure in Bar(g) (optional) */
  inletPressureBar?: number;
  /** Water temperature in °C (optional) */
  temperatureC?: number;
  /** Rated permeate flow per membrane element in GPD (e.g. 7,500 GPD for BW30-400, or 2,500 GPD for 4040) */
  membraneRatedGpd?: number;
  /** Design safety / fouling factor (default 1.0) */
  designFactor?: number;
}

export interface RoDesignOutputs {
  feedGpd: number;
  feedM3h: number;
  feedGpm: number;

  productGpd: number;
  productM3h: number;
  productGpm: number;

  rejectGpd: number;
  rejectM3h: number;
  rejectGpm: number;

  recoveryFraction: number;
  saltRejectionEstPct?: number;

  suggestedMembranes: number;
}

/**
 * Calculates RO flow chain (Product, Reject, GPD / m³h / GPM) and estimated membrane quantity.
 */
export function calculateRoFlows(inputs: RoDesignInputs): RoDesignOutputs {
  const recoveryFraction = Math.max(0, Math.min(inputs.recoveryPct / 100, 0.95));

  let feedGpd: number;
  let feedM3h: number;

  if (inputs.feedFlowUnit === 'GPD') {
    feedGpd = Math.max(0, inputs.feedFlow);
    feedM3h = gpdToM3h(feedGpd);
  } else {
    feedM3h = Math.max(0, inputs.feedFlow);
    feedGpd = m3hToGpd(feedM3h);
  }

  const feedGpm = m3hToGpm(feedM3h);

  // Flow balance
  const productGpd = feedGpd * recoveryFraction;
  const productM3h = feedM3h * recoveryFraction;
  const productGpm = feedGpm * recoveryFraction;

  const rejectGpd = feedGpd - productGpd;
  const rejectM3h = feedM3h - productM3h;
  const rejectGpm = feedGpm - productGpm;

  // Salt rejection estimate if TDS inputs provided
  let saltRejectionEstPct: number | undefined;
  if (
    inputs.designTdsPpm !== undefined &&
    inputs.targetProductTdsPpm !== undefined &&
    inputs.designTdsPpm > 0
  ) {
    saltRejectionEstPct =
      ((inputs.designTdsPpm - inputs.targetProductTdsPpm) / inputs.designTdsPpm) * 100;
  }

  // Membrane element sizing
  const ratedPermeate = inputs.membraneRatedGpd && inputs.membraneRatedGpd > 0 ? inputs.membraneRatedGpd : 7500;
  const designFactor = inputs.designFactor && inputs.designFactor > 0 ? inputs.designFactor : 1.0;
  const suggestedMembranes = productGpd > 0 ? Math.ceil(productGpd / (ratedPermeate * designFactor)) : 1;

  return {
    feedGpd,
    feedM3h,
    feedGpm,
    productGpd,
    productM3h,
    productGpm,
    rejectGpd,
    rejectM3h,
    rejectGpm,
    recoveryFraction,
    saltRejectionEstPct,
    suggestedMembranes,
  };
}
