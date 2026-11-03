/**
 * Pure domain logic for Multimedia Filter (MMF) vessel sizing, media layers, and velocities.
 * Strictly no UI, React, or storage imports.
 */

import { inchToMm, mmToInch, roundTo } from './units.ts';

export interface StandardVesselSize {
  diameterIn: number;
  diameterMm: number;
  defaultHeightMm: number;
  maxPressureBar: number;
  type: 'frp' | 'ms';
}

/** Standard commercial FRP vessel sizes */
export const DEFAULT_VESSEL_SIZES: StandardVesselSize[] = [
  { diameterIn: 8, diameterMm: 200, defaultHeightMm: 1100, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 9, diameterMm: 225, defaultHeightMm: 1200, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 10, diameterMm: 250, defaultHeightMm: 1375, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 12, diameterMm: 300, defaultHeightMm: 1320, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 13, diameterMm: 325, defaultHeightMm: 1375, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 14, diameterMm: 350, defaultHeightMm: 1650, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 16, diameterMm: 400, defaultHeightMm: 1650, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 18, diameterMm: 450, defaultHeightMm: 1650, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 21, diameterMm: 525, defaultHeightMm: 1575, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 24, diameterMm: 600, defaultHeightMm: 1825, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 30, diameterMm: 700, defaultHeightMm: 1500, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 36, diameterMm: 900, defaultHeightMm: 1825, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 42, diameterMm: 1050, defaultHeightMm: 1825, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 48, diameterMm: 1200, defaultHeightMm: 1825, maxPressureBar: 10, type: 'frp' },
  { diameterIn: 63, diameterMm: 1600, defaultHeightMm: 2180, maxPressureBar: 10, type: 'frp' },
];

export interface MmfMediaLayerInput {
  name: string;
  depthMm: number;
  bulkDensityKgM3: number;
  ratePerKgMinor?: number; // Minor currency units (e.g. paisa/cents) or unit cost
}

export interface MmfMediaLayerOutput {
  name: string;
  depthMm: number;
  volumeM3: number;
  weightKg: number;
  costMinor?: number;
}

export interface MmfInput {
  /** Raw plant flow Q in m³/hr */
  qM3h: number;
  /** Service operating hours per day (e.g. 23.5 or 24) */
  serviceH: number;
  /** Backwash duration hours per day (e.g. 0.5) */
  backwashH?: number;
  /** Design filtration velocity in m/hr (e.g. 12 - 16 m/hr) */
  velocityMh: number;
  /** Safety margin % (e.g. 0 to 20%) */
  marginPct?: number;
  /** Filter media layers top-to-bottom */
  layers: MmfMediaLayerInput[];
  /** Operating pressure in Bar(g) (default 3 - 4) */
  operatingPressureBar?: number;
  /** Operating temperature in °C (default 25) */
  operatingTempC?: number;
  /** Vessel type preference: 'auto', 'frp', or 'ms' */
  vesselTypePref?: 'auto' | 'frp' | 'ms';
  /** Max allowable single FRP vessel diameter (mm, default 1600) */
  maxSingleVesselDiameterMm?: number;
  /** Minimum required freeboard % (default 40%) */
  minFreeboardPct?: number;
  /** Custom vessel size list if overriding defaults */
  vesselSizes?: StandardVesselSize[];
}

export interface MmfOutput {
  ifrM3h: number;
  areaM2: number;
  calcDiameterMm: number;
  calcDiameterIn: number;

  chosenVessel: {
    type: 'frp' | 'ms';
    diameterIn: number;
    diameterMm: number;
    heightMm: number;
    count: number;
    actualAreaM2: number;
  };

  actualVelocityMh: number;
  ratedFlowM3h: number;

  layers: MmfMediaLayerOutput[];
  totalBedDepthMm: number;
  totalWeightKg: number;
  totalCostMinor?: number;

  freeboardPct: number;
  freeboardOk: boolean;

  vesselTypeReason: string;
  warnings: string[];
}

/**
 * Calculates filtration velocity given flow in m³/hr and vessel diameter in mm.
 */
export function calculateVelocity(flowM3h: number, diameterMm: number, vesselCount = 1): number {
  if (diameterMm <= 0 || vesselCount <= 0) return 0;
  const dMeters = diameterMm / 1000;
  const areaPerVessel = (Math.PI * Math.pow(dMeters, 2)) / 4;
  const totalArea = areaPerVessel * vesselCount;
  return flowM3h / totalArea;
}

/**
 * Calculates filtration velocity given flow in m³/hr and vessel diameter in inches.
 */
export function calculateVelocityFromInches(flowM3h: number, diameterInches: number, vesselCount = 1): number {
  return calculateVelocity(flowM3h, inchToMm(diameterInches), vesselCount);
}

/**
 * Sizing calculation for Multimedia Filter.
 * Adheres to TRD §6.2 and matches the Excel reference sheet.
 */
export function calculateMultimediaFilter(inputs: MmfInput): MmfOutput {
  const warnings: string[] = [];
  const marginFraction = 1 + (inputs.marginPct || 0) / 100;
  const serviceH = inputs.serviceH > 0 ? inputs.serviceH : 24;

  // 1. Instantaneous Filtration Rate (IFR)
  // Formula: IFR = Q * (1 + margin) * 24 / serviceH
  const ifrM3h = (inputs.qM3h * marginFraction * 24) / serviceH;

  // 2. Filtration Area
  // Area = IFR / velocity
  const velocityMh = inputs.velocityMh > 0 ? inputs.velocityMh : 16;
  const areaM2 = ifrM3h / velocityMh;

  // 3. Calculated diameter
  // Diameter = sqrt(4 * Area / PI)
  const calcDiameterM = Math.sqrt((4 * areaM2) / Math.PI);
  const calcDiameterMm = calcDiameterM * 1000;
  const calcDiameterIn = mmToInch(calcDiameterMm);

  // 4. Vessel selection
  const standardSizes = inputs.vesselSizes || DEFAULT_VESSEL_SIZES;
  const maxSingleDiameter = inputs.maxSingleVesselDiameterMm || 1600;

  let chosenSize: StandardVesselSize | undefined;
  let vesselCount = 1;

  if (calcDiameterMm <= maxSingleDiameter) {
    // Find smallest standard size with diameter >= calcDiameterMm
    // allow a 1% tolerance for standard sizes like 700 mm vs 698.3 mm
    chosenSize = standardSizes.find((s) => s.diameterMm >= calcDiameterMm - 1);
    if (!chosenSize) {
      chosenSize = standardSizes[standardSizes.length - 1];
    }
  } else {
    // Multi-vessel required
    for (let n = 2; n <= 6; n++) {
      const splitFlow = ifrM3h / n;
      const splitArea = splitFlow / velocityMh;
      const splitDiamMm = Math.sqrt((4 * splitArea) / Math.PI) * 1000;
      if (splitDiamMm <= maxSingleDiameter) {
        vesselCount = n;
        chosenSize = standardSizes.find((s) => s.diameterMm >= splitDiamMm - 1) || standardSizes[standardSizes.length - 1];
        break;
      }
    }
    if (!chosenSize) {
      chosenSize = standardSizes[standardSizes.length - 1];
      vesselCount = Math.ceil(calcDiameterMm / maxSingleDiameter);
    }
    warnings.push(`Design flow exceeds single vessel limit; split into ${vesselCount} vessels in parallel.`);
  }

  // Chosen dimensions
  const chosenDiameterMm = chosenSize.diameterMm;
  const chosenDiameterIn = chosenSize.diameterIn;
  const chosenHeightMm = chosenSize.defaultHeightMm;
  const dMeters = chosenDiameterMm / 1000;
  const singleVesselAreaM2 = (Math.PI * Math.pow(dMeters, 2)) / 4;
  const totalActualAreaM2 = singleVesselAreaM2 * vesselCount;

  // 5. Actual velocity & rated flow
  const actualVelocityMh = ifrM3h / totalActualAreaM2;
  const ratedFlowM3h = totalActualAreaM2 * velocityMh;

  if (actualVelocityMh > velocityMh * 1.05) {
    warnings.push(`Actual velocity (${roundTo(actualVelocityMh, 1)} m/hr) exceeds design velocity limit (${velocityMh} m/hr).`);
  }

  // 6. Media layer calculations per vessel
  let totalBedDepthMm = 0;
  let totalWeightKg = 0;
  let totalCostMinor = 0;

  const layersOutput: MmfMediaLayerOutput[] = inputs.layers.map((layer) => {
    const depthM = layer.depthMm / 1000;
    // Volume per vessel = singleVesselArea * depth
    const volumeM3Single = singleVesselAreaM2 * depthM;
    const weightKgSingle = volumeM3Single * layer.bulkDensityKgM3;
    const totalWeightKgAllVessels = weightKgSingle * vesselCount;

    totalBedDepthMm += layer.depthMm;
    totalWeightKg += totalWeightKgAllVessels;

    let layerCostMinor: number | undefined;
    if (layer.ratePerKgMinor !== undefined) {
      layerCostMinor = Math.round(totalWeightKgAllVessels * layer.ratePerKgMinor);
      totalCostMinor += layerCostMinor;
    }

    return {
      name: layer.name,
      depthMm: layer.depthMm,
      volumeM3: roundTo(volumeM3Single * vesselCount, 4),
      weightKg: Math.round(totalWeightKgAllVessels),
      costMinor: layerCostMinor,
    };
  });

  // Sum total weight from layer weights
  const totalWeightKgCalculated = layersOutput.reduce((acc, l) => acc + l.weightKg, 0);

  // 7. Freeboard check
  // Freeboard height = Shell height - Total bed depth
  const minFreeboardPct = inputs.minFreeboardPct ?? 40;
  const freeboardHeightMm = chosenHeightMm - totalBedDepthMm;
  const freeboardPct = totalBedDepthMm > 0 ? (freeboardHeightMm / totalBedDepthMm) * 100 : 100;
  const freeboardOk = freeboardPct >= minFreeboardPct;

  if (!freeboardOk) {
    warnings.push(
      `Freeboard (${roundTo(freeboardPct, 1)}%) is below recommended ${minFreeboardPct}%. Shell height ${chosenHeightMm}mm may be too short for ${totalBedDepthMm}mm bed depth.`
    );
  }

  // 8. FRP vs MS rule recommendation
  const opPressure = inputs.operatingPressureBar ?? 3.5;
  const opTemp = inputs.operatingTempC ?? 25;
  let recommendedType: 'frp' | 'ms' = 'frp';
  let vesselTypeReason = '';

  if (inputs.vesselTypePref && inputs.vesselTypePref !== 'auto') {
    recommendedType = inputs.vesselTypePref;
    vesselTypeReason = `User explicitly selected ${recommendedType.toUpperCase()}.`;
  } else {
    const reasons: string[] = [];
    let passedFrp = true;

    if (chosenDiameterMm > 1600) {
      passedFrp = false;
      reasons.push(`Diameter (${chosenDiameterMm}mm) exceeds max FRP standard size (1600mm)`);
    }
    if (opPressure > 10) {
      passedFrp = false;
      reasons.push(`Operating pressure (${opPressure} bar) exceeds FRP 10 bar rating`);
    }
    if (opTemp > 49) {
      passedFrp = false;
      reasons.push(`Operating temperature (${opTemp}°C) exceeds FRP 49°C rating`);
    }

    if (passedFrp) {
      recommendedType = 'frp';
      vesselTypeReason = 'FRP recommended: diameter, pressure, and temperature are within standard FRP thresholds.';
    } else {
      recommendedType = 'ms';
      vesselTypeReason = `Mild Steel (MS) recommended: ${reasons.join(', ')}.`;
    }
  }

  return {
    ifrM3h: roundTo(ifrM3h, 3),
    areaM2: roundTo(areaM2, 3),
    calcDiameterMm: roundTo(calcDiameterMm, 1),
    calcDiameterIn: roundTo(calcDiameterIn, 1),

    chosenVessel: {
      type: recommendedType,
      diameterIn: chosenDiameterIn,
      diameterMm: chosenDiameterMm,
      heightMm: chosenHeightMm,
      count: vesselCount,
      actualAreaM2: roundTo(totalActualAreaM2, 4),
    },

    actualVelocityMh: roundTo(actualVelocityMh, 2),
    ratedFlowM3h: roundTo(ratedFlowM3h, 2),

    layers: layersOutput,
    totalBedDepthMm,
    totalWeightKg: totalWeightKgCalculated,
    totalCostMinor: totalCostMinor > 0 ? totalCostMinor : undefined,

    freeboardPct: roundTo(freeboardPct, 1),
    freeboardOk,

    vesselTypeReason,
    warnings,
  };
}
