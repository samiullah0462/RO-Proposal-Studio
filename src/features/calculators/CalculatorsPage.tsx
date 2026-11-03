import React from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState.tsx';

export function CalculatorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Engineering Calculators</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Instant hydraulic and filtration calculations for multimedia vessels, cartridge filters, and RO flows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white dark:bg-[#1E293B] rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs hover:border-[#2E75B6] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#2E75B6] dark:text-[#5B9BD5] flex items-center justify-center mb-3">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-[#0F172A] dark:text-[#E2E8F0]">Multimedia Filter (MMF)</h3>
          <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8] mt-1.5 leading-relaxed">
            Determine standard FRP/MS vessel sizes, filtration velocities, layer depths, bulk densities, and freeboard margin.
          </p>
          <div className="mt-4 pt-3 border-t border-[#D8DFE8] dark:border-[#334155] flex items-center justify-between text-xs font-medium text-[#2E75B6] dark:text-[#5B9BD5]">
            <span>Verified against Excel sheet</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#1E293B] rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs hover:border-[#2E75B6] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#2E75B6] dark:text-[#5B9BD5] flex items-center justify-center mb-3">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-[#0F172A] dark:text-[#E2E8F0]">Cartridge Filters & Housings</h3>
          <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8] mt-1.5 leading-relaxed">
            Size 5µm and 1µm elements in series, select slim/jumbo housings, and validate slot capacity against element counts.
          </p>
          <div className="mt-4 pt-3 border-t border-[#D8DFE8] dark:border-[#334155] flex items-center justify-between text-xs font-medium text-[#2E75B6] dark:text-[#5B9BD5]">
            <span>PPY/PPF Ideal flow lookup</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#1E293B] rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs hover:border-[#2E75B6] transition-colors">
          <div className="w-10 h-10 rounded-lg bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#2E75B6] dark:text-[#5B9BD5] flex items-center justify-center mb-3">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-base text-[#0F172A] dark:text-[#E2E8F0]">RO Flow Chain & Balance</h3>
          <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8] mt-1.5 leading-relaxed">
            GPD ↔ m³/hr ↔ GPM conversions, recovery rates, permeate & brine balance, and standard membrane quantity estimates.
          </p>
          <div className="mt-4 pt-3 border-t border-[#D8DFE8] dark:border-[#334155] flex items-center justify-between text-xs font-medium text-[#2E75B6] dark:text-[#5B9BD5]">
            <span>BW30-400 / 4040 sizing</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
