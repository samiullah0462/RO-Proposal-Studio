/**
 * Pure domain logic for FRP vs MS material selection rules.
 * Strictly no UI, React, or storage imports.
 */

export interface RuleThresholds {
  maxFrpDiameterMm: number;
  maxFrpPressureBar: number;
  maxFrpTempC: number;
  msCoatingTypeDefault?: 'epoxy_coated' | 'rubber_lined';
}

export const DEFAULT_RULE_THRESHOLDS: RuleThresholds = {
  maxFrpDiameterMm: 1600, // 63 inches
  maxFrpPressureBar: 10.0, // 150 psi standard
  maxFrpTempC: 49.0, // 120 °F standard FRP vinyl ester/polyester resin
  msCoatingTypeDefault: 'epoxy_coated',
};

export interface MaterialEvaluationInput {
  diameterMm: number;
  operatingPressureBar: number;
  operatingTempC: number;
  waterType?: 'fresh' | 'brackish' | 'seawater' | 'industrial';
  thresholds?: RuleThresholds;
}

export interface MaterialEvaluationOutput {
  recommendedMaterial: 'frp' | 'ms';
  specification: string;
  isFrpEligible: boolean;
  passedChecks: string[];
  failedChecks: string[];
  summaryReason: string;
}

/**
 * Evaluates whether a pressure vessel should be Fiber-Reinforced Plastic (FRP)
 * or Mild Steel (MS) based on operating parameters.
 */
export function evaluateVesselMaterial(inputs: MaterialEvaluationInput): MaterialEvaluationOutput {
  const t = inputs.thresholds || DEFAULT_RULE_THRESHOLDS;
  const passedChecks: string[] = [];
  const failedChecks: string[] = [];

  // 1. Diameter check
  if (inputs.diameterMm <= t.maxFrpDiameterMm) {
    passedChecks.push(`Diameter ${inputs.diameterMm}mm ≤ ${t.maxFrpDiameterMm}mm max FRP standard`);
  } else {
    failedChecks.push(`Diameter ${inputs.diameterMm}mm exceeds ${t.maxFrpDiameterMm}mm max FRP standard size`);
  }

  // 2. Pressure check
  if (inputs.operatingPressureBar <= t.maxFrpPressureBar) {
    passedChecks.push(`Pressure ${inputs.operatingPressureBar} bar ≤ ${t.maxFrpPressureBar} bar max FRP rating`);
  } else {
    failedChecks.push(`Operating pressure ${inputs.operatingPressureBar} bar exceeds ${t.maxFrpPressureBar} bar FRP rating`);
  }

  // 3. Temperature check
  if (inputs.operatingTempC <= t.maxFrpTempC) {
    passedChecks.push(`Temperature ${inputs.operatingTempC}°C ≤ ${t.maxFrpTempC}°C max FRP rating`);
  } else {
    failedChecks.push(`Temperature ${inputs.operatingTempC}°C exceeds ${t.maxFrpTempC}°C FRP rating`);
  }

  const isFrpEligible = failedChecks.length === 0;

  if (isFrpEligible) {
    return {
      recommendedMaterial: 'frp',
      specification: 'FRP (Fiber-Reinforced Polymer)',
      isFrpEligible: true,
      passedChecks,
      failedChecks,
      summaryReason: 'FRP recommended: vessel diameter, operating pressure, and temperature are within standard FRP limits.',
    };
  }

  const msType = inputs.waterType === 'seawater' || inputs.waterType === 'industrial'
    ? 'MS (Rubber Lined)'
    : 'MS (Epoxy Coated & Primer)';

  return {
    recommendedMaterial: 'ms',
    specification: msType,
    isFrpEligible: false,
    passedChecks,
    failedChecks,
    summaryReason: `MS recommended because: ${failedChecks.join('; ')}.`,
  };
}
