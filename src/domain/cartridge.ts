/**
 * Pure domain logic for Cartridge Filter sizing and Housing selection.
 * Strictly no UI, React, or storage imports.
 */

export type CartridgeForm = 'slim' | 'jumbo';
export type CartridgeLength = 10 | 20 | 30 | 40;
export type CartridgeMicron = 1 | 5;

export interface CartridgeTypeRule {
  lengthIn: CartridgeLength;
  form: CartridgeForm;
  micron: CartridgeMicron;
  idealFlowM3h: number;
}

/** Standard ideal flow lookup based on calculation sheet */
export const DEFAULT_CARTRIDGE_RULES: CartridgeTypeRule[] = [
  { lengthIn: 10, form: 'slim', micron: 5, idealFlowM3h: 1.0 },
  { lengthIn: 10, form: 'slim', micron: 1, idealFlowM3h: 1.0 },
  { lengthIn: 20, form: 'slim', micron: 5, idealFlowM3h: 2.0 },
  { lengthIn: 20, form: 'slim', micron: 1, idealFlowM3h: 2.0 },
  { lengthIn: 20, form: 'jumbo', micron: 5, idealFlowM3h: 3.5 }, // 3 to 4 m3/hr
  { lengthIn: 20, form: 'jumbo', micron: 1, idealFlowM3h: 3.5 }, // 3 to 4 m3/hr
  { lengthIn: 30, form: 'slim', micron: 5, idealFlowM3h: 3.0 },
  { lengthIn: 30, form: 'slim', micron: 1, idealFlowM3h: 3.0 },
  { lengthIn: 40, form: 'slim', micron: 5, idealFlowM3h: 4.0 },
  { lengthIn: 40, form: 'slim', micron: 1, idealFlowM3h: 4.0 },
  { lengthIn: 10, form: 'jumbo', micron: 5, idealFlowM3h: 2.0 },
  { lengthIn: 10, form: 'jumbo', micron: 1, idealFlowM3h: 2.0 },
  { lengthIn: 30, form: 'jumbo', micron: 5, idealFlowM3h: 5.0 },
  { lengthIn: 30, form: 'jumbo', micron: 1, idealFlowM3h: 5.0 },
  { lengthIn: 40, form: 'jumbo', micron: 5, idealFlowM3h: 6.0 },
  { lengthIn: 40, form: 'jumbo', micron: 1, idealFlowM3h: 6.0 },
];

export interface HousingOption {
  form: CartridgeForm;
  lengthIn: CartridgeLength;
  slots: number; // e.g. 1, 3, 5, 7, 12, 22
  material: 'PVC' | 'SS304' | 'SS316' | 'FRP';
}

export const DEFAULT_HOUSINGS: HousingOption[] = [
  { form: 'slim', lengthIn: 10, slots: 1, material: 'PVC' },
  { form: 'slim', lengthIn: 20, slots: 1, material: 'PVC' },
  { form: 'slim', lengthIn: 20, slots: 3, material: 'SS304' },
  { form: 'slim', lengthIn: 20, slots: 5, material: 'SS304' },
  { form: 'slim', lengthIn: 30, slots: 1, material: 'PVC' },
  { form: 'slim', lengthIn: 30, slots: 5, material: 'SS304' },
  { form: 'slim', lengthIn: 40, slots: 1, material: 'PVC' },
  { form: 'slim', lengthIn: 40, slots: 5, material: 'SS304' },
  { form: 'slim', lengthIn: 40, slots: 7, material: 'SS304' },
  { form: 'jumbo', lengthIn: 10, slots: 1, material: 'PVC' },
  { form: 'jumbo', lengthIn: 20, slots: 1, material: 'PVC' },
  { form: 'jumbo', lengthIn: 20, slots: 3, material: 'SS304' },
  { form: 'jumbo', lengthIn: 20, slots: 5, material: 'SS304' },
  { form: 'jumbo', lengthIn: 20, slots: 7, material: 'SS304' },
  { form: 'jumbo', lengthIn: 30, slots: 5, material: 'SS304' },
  { form: 'jumbo', lengthIn: 40, slots: 5, material: 'SS304' },
  { form: 'jumbo', lengthIn: 40, slots: 7, material: 'SS304' },
];

export interface CartridgeInput {
  /** RO feed flow in m³/hr */
  feedM3h: number;
  /** Safety margin % (e.g. 20) */
  marginPct?: number;
  /** Stages: 1 stage (5µm) or 2 stages (5µm -> 1µm in series) */
  stages: 1 | 2;
  /** Cartridge length in inches */
  lengthIn: CartridgeLength;
  /** Cartridge form */
  form: CartridgeForm;
  /** Custom rules list */
  rules?: CartridgeTypeRule[];
  /** Custom housing list */
  housings?: HousingOption[];
  /** Optional chosen housing slots override */
  chosenHousingSlots?: number;
}

export interface StageSizingResult {
  stageNumber: number;
  micron: CartridgeMicron;
  designFlowM3h: number;
  idealFlowPerElementM3h: number;
  elementsRequired: number;
  housingSlots: number;
  housingQty: number;
  totalCartridges: number;
  housingMaterial: string;
  isConsistent: boolean;
  validationWarning?: string;
}

export interface CartridgeOutput {
  feedM3h: number;
  designFlowM3h: number;
  stages: StageSizingResult[];
  overallConsistent: boolean;
  warnings: string[];
}

export function getIdealCartridgeFlow(
  lengthIn: CartridgeLength,
  form: CartridgeForm,
  micron: CartridgeMicron,
  rules = DEFAULT_CARTRIDGE_RULES
): number {
  const match = rules.find((r) => r.lengthIn === lengthIn && r.form === form && r.micron === micron);
  if (match) return match.idealFlowM3h;

  // Fallbacks based on TRD §6.3 / PRD R-4
  if (lengthIn === 10) return form === 'slim' ? 1.0 : 2.0;
  if (lengthIn === 20) return form === 'slim' ? 2.0 : 3.5;
  if (lengthIn === 30) return form === 'slim' ? 3.0 : 5.0;
  if (lengthIn === 40) return form === 'slim' ? 4.0 : 6.0;
  return 2.0;
}

/**
 * Calculates Cartridge Filters sizing and housing selection.
 */
export function calculateCartridgeFilters(inputs: CartridgeInput): CartridgeOutput {
  const warnings: string[] = [];
  const marginPct = inputs.marginPct ?? 20;
  const designFlowM3h = inputs.feedM3h * (1 + marginPct / 100);

  const housings = inputs.housings || DEFAULT_HOUSINGS;
  const stageMicrons: CartridgeMicron[] = inputs.stages === 2 ? [5, 1] : [5];

  const stagesResults: StageSizingResult[] = stageMicrons.map((micron, idx) => {
    const idealFlow = getIdealCartridgeFlow(inputs.lengthIn, inputs.form, micron, inputs.rules);
    const elementsRequired = Math.max(1, Math.ceil(designFlowM3h / idealFlow));

    // Choose suitable housing
    let suitableHousing: HousingOption | undefined;
    if (inputs.chosenHousingSlots) {
      suitableHousing = housings.find(
        (h) => h.form === inputs.form && h.lengthIn === inputs.lengthIn && h.slots === inputs.chosenHousingSlots
      ) || {
        form: inputs.form,
        lengthIn: inputs.lengthIn,
        slots: inputs.chosenHousingSlots,
        material: 'PVC',
      };
    } else {
      // Find smallest housing where slots >= elementsRequired
      const candidates = housings
        .filter((h) => h.form === inputs.form && h.lengthIn === inputs.lengthIn && h.slots >= elementsRequired)
        .sort((a, b) => a.slots - b.slots);

      suitableHousing = candidates[0];
      if (!suitableHousing) {
        // Fallback: pick largest housing and multiple housings
        const maxCandidate = housings
          .filter((h) => h.form === inputs.form && h.lengthIn === inputs.lengthIn)
          .sort((a, b) => b.slots - a.slots)[0];
        suitableHousing = maxCandidate || {
          form: inputs.form,
          lengthIn: inputs.lengthIn,
          slots: elementsRequired,
          material: 'SS304',
        };
      }
    }

    const housingSlots = suitableHousing.slots;
    const housingQty = Math.max(1, Math.ceil(elementsRequired / housingSlots));
    const totalCartridges = elementsRequired; // Quantity of replacement filters

    const isConsistent = housingSlots * housingQty === elementsRequired || housingSlots === elementsRequired;
    let validationWarning: string | undefined;

    if (!isConsistent) {
      validationWarning = `Cartridge quantity (${elementsRequired}) does not match housing slot capacity (${housingSlots * housingQty} slots across ${housingQty} housing(s)). Adjust cartridge quantity or housing model.`;
      warnings.push(`Stage ${idx + 1}: ${validationWarning}`);
    }

    return {
      stageNumber: idx + 1,
      micron,
      designFlowM3h,
      idealFlowPerElementM3h: idealFlow,
      elementsRequired,
      housingSlots,
      housingQty,
      totalCartridges,
      housingMaterial: suitableHousing.material,
      isConsistent,
      validationWarning,
    };
  });

  const overallConsistent = stagesResults.every((s) => s.isConsistent);

  return {
    feedM3h: inputs.feedM3h,
    designFlowM3h,
    stages: stagesResults,
    overallConsistent,
    warnings,
  };
}
