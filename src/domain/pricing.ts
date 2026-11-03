/**
 * Pure domain logic for pricing, tax, payment terms splits, and currency formatting.
 * Strictly no UI, React, or storage imports.
 */

export interface TaxLineInput {
  name: string;
  percent: number;
  appliesTo: 'all' | 'equipment' | 'services';
}

export interface TaxLineOutput {
  name: string;
  percent: number;
  appliesTo: 'all' | 'equipment' | 'services';
  taxableAmount: number;
  taxAmount: number;
}

export interface PaymentTermInput {
  label: string;
  percent: number;
}

export interface PaymentTermOutput {
  label: string;
  percent: number;
  amount: number;
}

export interface PriceSummaryInput {
  priceMode: 'lump' | 'grouped' | 'itemized';
  /** Lump sum amount */
  lumpAmount?: number;
  /** Grouped category totals */
  equipmentTotal?: number;
  servicesTotal?: number;
  transportTotal?: number;
  /** Itemized line items */
  items?: { qty: number; unitPrice: number; category?: 'equipment' | 'services' }[];
  taxes?: TaxLineInput[];
  paymentTerms?: PaymentTermInput[];
  currency?: string;
}

export interface PriceSummaryOutput {
  currency: string;
  subtotal: number;
  equipmentSubtotal: number;
  servicesSubtotal: number;
  transportSubtotal: number;
  taxLines: TaxLineOutput[];
  totalTax: number;
  grandTotal: number;
  paymentTerms: PaymentTermOutput[];
  paymentTermsSum: number;
  isTermsBalanced: boolean;
}

/**
 * Calculates payment split across terms ensuring the sum strictly equals the grand total.
 * The final term absorbs any remainder from integer rounding.
 */
export function calculatePaymentTerms(total: number, terms: PaymentTermInput[]): PaymentTermOutput[] {
  if (!terms || terms.length === 0) return [];

  let accumulated = 0;
  const result: PaymentTermOutput[] = [];

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (i === terms.length - 1) {
      // Final term absorbs the exact difference
      const finalAmount = total - accumulated;
      result.push({
        label: term.label,
        percent: term.percent,
        amount: finalAmount,
      });
      accumulated += finalAmount;
    } else {
      const calculatedAmount = Math.round((total * term.percent) / 100);
      result.push({
        label: term.label,
        percent: term.percent,
        amount: calculatedAmount,
      });
      accumulated += calculatedAmount;
    }
  }

  return result;
}

/**
 * Calculates proposal pricing summary, taxes, and payment terms breakdown.
 */
export function calculatePriceSummary(inputs: PriceSummaryInput): PriceSummaryOutput {
  const currency = inputs.currency || 'PKR';
  let equipmentSubtotal = 0;
  let servicesSubtotal = 0;
  let transportSubtotal = 0;
  let subtotal = 0;

  if (inputs.priceMode === 'lump') {
    subtotal = Math.max(0, inputs.lumpAmount ?? 0);
    equipmentSubtotal = subtotal;
  } else if (inputs.priceMode === 'grouped') {
    equipmentSubtotal = Math.max(0, inputs.equipmentTotal ?? 0);
    servicesSubtotal = Math.max(0, inputs.servicesTotal ?? 0);
    transportSubtotal = Math.max(0, inputs.transportTotal ?? 0);
    subtotal = equipmentSubtotal + servicesSubtotal + transportSubtotal;
  } else {
    // Itemized
    if (inputs.items) {
      for (const item of inputs.items) {
        const lineTotal = Math.max(0, item.qty) * Math.max(0, item.unitPrice);
        if (item.category === 'services') {
          servicesSubtotal += lineTotal;
        } else {
          equipmentSubtotal += lineTotal;
        }
      }
    }
    subtotal = equipmentSubtotal + servicesSubtotal + transportSubtotal;
  }

  // Calculate taxes
  const taxLines: TaxLineOutput[] = [];
  let totalTax = 0;

  if (inputs.taxes && inputs.taxes.length > 0) {
    for (const tax of inputs.taxes) {
      let taxableAmount = subtotal;
      if (tax.appliesTo === 'equipment') taxableAmount = equipmentSubtotal;
      if (tax.appliesTo === 'services') taxableAmount = servicesSubtotal;

      const taxAmount = Math.round((taxableAmount * tax.percent) / 100);
      totalTax += taxAmount;

      taxLines.push({
        name: tax.name,
        percent: tax.percent,
        appliesTo: tax.appliesTo,
        taxableAmount,
        taxAmount,
      });
    }
  }

  const grandTotal = subtotal + totalTax;

  // Payment terms
  const rawTerms = inputs.paymentTerms && inputs.paymentTerms.length > 0
    ? inputs.paymentTerms
    : [
        { label: 'Advance with Purchase Order', percent: 75 },
        { label: 'After delivery of equipment at site', percent: 15 },
        { label: 'After Installation and Commissioning', percent: 10 },
      ];

  const calculatedTerms = calculatePaymentTerms(grandTotal, rawTerms);
  const paymentTermsSum = calculatedTerms.reduce((acc, t) => acc + t.amount, 0);
  const isTermsBalanced = paymentTermsSum === grandTotal;

  return {
    currency,
    subtotal,
    equipmentSubtotal,
    servicesSubtotal,
    transportSubtotal,
    taxLines,
    totalTax,
    grandTotal,
    paymentTerms: calculatedTerms,
    paymentTermsSum,
    isTermsBalanced,
  };
}

/**
 * Formats a number into a full English currency words description.
 */
export function numberToWords(num: number, currencyName = 'Pakistani Rupees'): string {
  if (num === 0) return `Zero ${currencyName} Only`;
  if (num < 0) return `Minus ${numberToWords(Math.abs(num), currencyName)}`;

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n: number): string {
    let str = '';
    if (n >= 100) {
      str += `${ones[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n >= 20) {
      str += `${tens[Math.floor(n / 10)]} `;
      n %= 10;
    } else if (n >= 10) {
      str += `${teens[n - 10]} `;
      n = 0;
    }
    if (n > 0) {
      str += `${ones[n]} `;
    }
    return str.trim();
  }

  const scales = [
    { value: 1000000000, name: 'Billion' },
    { value: 1000000, name: 'Million' },
    { value: 1000, name: 'Thousand' },
  ];

  let remaining = Math.floor(num);
  let words = '';

  for (const scale of scales) {
    if (remaining >= scale.value) {
      const chunk = Math.floor(remaining / scale.value);
      words += `${convertChunk(chunk)} ${scale.name} `;
      remaining %= scale.value;
    }
  }

  if (remaining > 0) {
    words += convertChunk(remaining);
  }

  return `${words.trim()} ${currencyName} Only`;
}
