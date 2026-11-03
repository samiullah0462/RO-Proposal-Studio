/**
 * Pure domain logic for proposal reference numbers and revision formatting.
 * Strictly no UI, React, or storage imports.
 */

export interface RefNumberParams {
  brandCode: string; // e.g. 'PS'
  year: number; // e.g. 2026
  sequence: number; // e.g. 646
  pattern?: string; // e.g. '{BRAND}/PRO/{YY}/{SEQ:4}'
  isProvisional?: boolean;
}

/**
 * Formats a proposal reference number.
 * Supported tokens: {BRAND}, {YYYY}, {YY}, {SEQ}, {SEQ:N} (padded with zeros)
 */
export function formatRefNumber(params: RefNumberParams): string {
  if (params.isProvisional) {
    const paddedSeq = String(params.sequence).padStart(4, '0');
    return `${params.brandCode}/TEMP/${String(params.year).slice(-2)}/${paddedSeq}`;
  }

  const pattern = params.pattern || '{BRAND}/PRO/{YY}/{SEQ:4}';
  const yyyy = String(params.year);
  const yy = yyyy.slice(-2);

  let formatted = pattern
    .replace(/\{BRAND\}/g, params.brandCode.toUpperCase())
    .replace(/\{YYYY\}/g, yyyy)
    .replace(/\{YY\}/g, yy);

  // Match {SEQ:N} or {SEQ}
  formatted = formatted.replace(/\{SEQ(?::(\d+))?\}/g, (_match, padLen) => {
    if (padLen) {
      return String(params.sequence).padStart(parseInt(padLen, 10), '0');
    }
    return String(params.sequence);
  });

  return formatted;
}

/**
 * Appends a revision suffix to a base reference number.
 * e.g. PS/PRO/26/0646 with rev 2 -> PS/PRO/26/0646-Rev-02
 */
export function formatWithRevision(baseRef: string, rev: number): string {
  if (rev <= 1) return baseRef;
  const padRev = String(rev).padStart(2, '0');
  return `${baseRef}-Rev-${padRev}`;
}

/**
 * Parses a reference string to extract parts if valid.
 */
export function parseRefNumber(ref: string): {
  baseRef: string;
  revision: number;
} {
  const revMatch = ref.match(/-Rev-(\d+)$/i);
  if (revMatch) {
    const revision = parseInt(revMatch[1], 10);
    const baseRef = ref.slice(0, revMatch.index);
    return { baseRef, revision };
  }
  return { baseRef: ref, revision: 1 };
}
