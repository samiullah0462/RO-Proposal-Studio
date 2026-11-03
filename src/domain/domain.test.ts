import { describe, it, expect } from 'vitest';
import { gpdToM3h, m3hToGpd, inchToMm, roundTo } from './units.ts';
import { calculateRoFlows } from './ro.ts';
import {
  calculateMultimediaFilter,
  calculateVelocity,
  calculateVelocityFromInches,
} from './multimedia.ts';
import { calculateCartridgeFilters, getIdealCartridgeFlow } from './cartridge.ts';
import { evaluateVesselMaterial } from './rules.ts';
import { calculatePaymentTerms, calculatePriceSummary } from './pricing.ts';
import { formatRefNumber, formatWithRevision } from './refnumber.ts';

describe('TRD Section 6 Pure Domain Verification', () => {
  // Case 1: Excel Sand Filter Test Case
  it('Case 1: Q=6, service 23.5, backwash 0.5, velocity 16 → IFR 6.128, area 0.383, diameter about 698 mm', () => {
    const res = calculateMultimediaFilter({
      qM3h: 6,
      serviceH: 23.5,
      backwashH: 0.5,
      velocityMh: 16,
      marginPct: 0,
      layers: [
        { name: 'Gravel', depthMm: 200, bulkDensityKgM3: 2500, ratePerKgMinor: 8 },
        { name: 'Sand', depthMm: 500, bulkDensityKgM3: 1650, ratePerKgMinor: 8 },
        { name: 'Anthracite', depthMm: 75, bulkDensityKgM3: 850, ratePerKgMinor: 100 },
        { name: 'Activated Carbon', depthMm: 100, bulkDensityKgM3: 529, ratePerKgMinor: 160 },
      ],
    });

    // Verify IFR: 6 * 24 / 23.5 = 6.1276... -> 6.128 m³/hr
    expect(res.ifrM3h).toBeCloseTo(6.128, 2);

    // Verify Filtration Area: 6.128 / 16 = 0.383 m²
    expect(res.areaM2).toBeCloseTo(0.383, 3);

    // Verify Calculated Diameter: ~698 mm (698.3 mm)
    expect(res.calcDiameterMm).toBeGreaterThanOrEqual(697);
    expect(res.calcDiameterMm).toBeLessThanOrEqual(700);

    // Verify chosen standard vessel (700 mm / 30" vessel)
    expect(res.chosenVessel.diameterMm).toBe(700);

    // Verify media weights matching Excel sheet:
    // Gravel: ~192 kg, Sand: ~317 kg, Anthracite: ~25 kg, Carbon: ~20 kg
    const gravel = res.layers.find((l) => l.name === 'Gravel')!;
    const sand = res.layers.find((l) => l.name === 'Sand')!;
    const anth = res.layers.find((l) => l.name === 'Anthracite')!;
    const carbon = res.layers.find((l) => l.name === 'Activated Carbon')!;

    expect(gravel.weightKg).toBe(192);
    expect(sand.weightKg).toBe(317);
    expect(anth.weightKg).toBe(25);
    expect(carbon.weightKg).toBe(20);
    expect(res.totalWeightKg).toBe(554);

    // Shell height 1500mm vs total bed 875mm -> Freeboard is ample and passes
    expect(res.totalBedDepthMm).toBe(875);
    expect(res.freeboardOk).toBe(true);
  });

  // Case 2: 10,000 GPD BWRO Flow and 16-inch Vessel Velocity
  it('Case 2: 10,000 GPD → 1.577 m3/hr; 16-inch vessel → about 12.4 m/hr', () => {
    // 10,000 GPD conversion
    const m3h = gpdToM3h(10000);
    expect(m3h).toBeCloseTo(1.577, 3);

    // Velocity in 16-inch vessel (nominal 400mm or exact 16" = 406.4mm)
    // 400mm: 1.577 / (pi * 0.2^2) = 12.55 m/hr
    // 406.4mm: 1.577 / (pi * 0.2032^2) = 12.16 m/hr
    const velocityNominal400 = calculateVelocity(m3h, 400);
    const velocityExact16Inch = calculateVelocityFromInches(m3h, 16);

    // Both are around 12.4 m/hr (within 0.3 m/hr of 12.4)
    expect(velocityNominal400).toBeCloseTo(12.55, 1);
    expect(velocityExact16Inch).toBeCloseTo(12.16, 1);

    const avgVelocity = (velocityNominal400 + velocityExact16Inch) / 2;
    expect(avgVelocity).toBeCloseTo(12.35, 1);
  });

  // Case 3: Cartridge Filter Sizing
  it('Case 3: Cartridge: 1.58 m3/hr, 20% margin, 20-inch slim → 1 element', () => {
    const res = calculateCartridgeFilters({
      feedM3h: 1.58,
      marginPct: 20,
      stages: 1,
      lengthIn: 20,
      form: 'slim',
    });

    // Design flow = 1.58 * 1.2 = 1.896 m³/hr
    // Ideal flow for 20" slim is 2.0 m³/hr
    // ceil(1.896 / 2.0) = 1 element
    expect(res.stages[0].idealFlowPerElementM3h).toBe(2.0);
    expect(res.stages[0].elementsRequired).toBe(1);
    expect(res.stages[0].totalCartridges).toBe(1);
  });

  // Case 4: Payment Split Integrity
  it('Case 4: 75/15/10 split of 735,000 sums exactly', () => {
    const total = 735000;
    const terms = [
      { label: 'Advance with Purchase Order', percent: 75 },
      { label: 'After delivery of equipment at site', percent: 15 },
      { label: 'After Installation and Commissioning', percent: 10 },
    ];

    const split = calculatePaymentTerms(total, terms);

    expect(split[0].amount).toBe(551250); // 75% of 735,000
    expect(split[1].amount).toBe(110250); // 15% of 735,000
    expect(split[2].amount).toBe(73500);  // 10% of 735,000

    const sum = split.reduce((acc, t) => acc + t.amount, 0);
    expect(sum).toBe(total);

    // Also test odd number that would create decimal fractions (e.g. 735,001 with 75/15/10)
    const oddSplit = calculatePaymentTerms(735001, terms);
    const oddSum = oddSplit.reduce((acc, t) => acc + t.amount, 0);
    expect(oddSum).toBe(735001);
  });

  // Additional pure domain verification
  it('RO Flow Balance: 10,000 GPD feed at 50% recovery yields 5,000 GPD product and reject', () => {
    const ro = calculateRoFlows({
      feedFlow: 10000,
      feedFlowUnit: 'GPD',
      recoveryPct: 50,
      designTdsPpm: 5000,
      targetProductTdsPpm: 300,
      membraneRatedGpd: 7500,
    });

    expect(ro.productGpd).toBe(5000);
    expect(ro.rejectGpd).toBe(5000);
    expect(ro.productM3h).toBeCloseTo(0.7886, 3);
    expect(ro.rejectM3h).toBeCloseTo(0.7886, 3);
    expect(ro.suggestedMembranes).toBe(1); // 5,000 <= 7,500 rated
    expect(ro.saltRejectionEstPct).toBe(94); // (5000-300)/5000 = 94%
  });

  it('Material Selection: FRP vs MS', () => {
    // Standard FRP case
    const frpEval = evaluateVesselMaterial({
      diameterMm: 400,
      operatingPressureBar: 4,
      operatingTempC: 25,
    });
    expect(frpEval.recommendedMaterial).toBe('frp');
    expect(frpEval.isFrpEligible).toBe(true);

    // Over-pressure case exceeding FRP limit (e.g. 15 bar)
    const msEval = evaluateVesselMaterial({
      diameterMm: 1200,
      operatingPressureBar: 15,
      operatingTempC: 25,
    });
    expect(msEval.recommendedMaterial).toBe('ms');
    expect(msEval.isFrpEligible).toBe(false);
  });

  it('Reference Number Formatting & Revision', () => {
    const ref = formatRefNumber({
      brandCode: 'PS',
      year: 2026,
      sequence: 646,
    });
    expect(ref).toBe('PS/PRO/26/0646');

    const rev2 = formatWithRevision(ref, 2);
    expect(rev2).toBe('PS/PRO/26/0646-Rev-02');
  });
});
