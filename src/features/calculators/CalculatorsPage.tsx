import React, { useState } from 'react';
import {
  Calculator,
  Layers,
  Filter,
  Droplet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { calculateMultimediaFilter, type MmfMediaLayerInput } from '../../domain/multimedia.ts';
import { calculateCartridgeFilters, type CartridgeLength, type CartridgeForm } from '../../domain/cartridge.ts';
import { calculateRoFlows } from '../../domain/ro.ts';
import { gpdToM3h, m3hToGpd, roundTo } from '../../domain/units.ts';

export function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState<'mmf' | 'cartridge' | 'ro'>('mmf');

  // --- MMF STATE ---
  const [mmfFlow, setMmfFlow] = useState<number>(6.0);
  const [mmfServiceH, setMmfServiceH] = useState<number>(23.5);
  const [mmfBackwashH, setMmfBackwashH] = useState<number>(0.5);
  const [mmfVelocity, setMmfVelocity] = useState<number>(16.0);
  const [mmfMargin, setMmfMargin] = useState<number>(0);
  const [mmfVesselPref, setMmfVesselPref] = useState<'auto' | 'frp' | 'ms'>('auto');
  const [mmfPressure, setMmfPressure] = useState<number>(4.0);
  const [mmfTemp, setMmfTemp] = useState<number>(25.0);

  const [mmfLayers, setMmfLayers] = useState<MmfMediaLayerInput[]>([
    { name: 'Gravel Support Media', depthMm: 200, bulkDensityKgM3: 2500, ratePerKgMinor: 8 },
    { name: 'Silica Sand Filter Media', depthMm: 500, bulkDensityKgM3: 1650, ratePerKgMinor: 8 },
    { name: 'Anthracite Filter Media', depthMm: 75, bulkDensityKgM3: 850, ratePerKgMinor: 100 },
    { name: 'Granular Activated Carbon', depthMm: 100, bulkDensityKgM3: 529, ratePerKgMinor: 160 },
  ]);

  // Run MMF calculation
  const mmfOutput = calculateMultimediaFilter({
    qM3h: mmfFlow,
    serviceH: mmfServiceH,
    backwashH: mmfBackwashH,
    velocityMh: mmfVelocity,
    marginPct: mmfMargin,
    layers: mmfLayers,
    operatingPressureBar: mmfPressure,
    operatingTempC: mmfTemp,
    vesselTypePref: mmfVesselPref,
  });

  // --- CARTRIDGE STATE ---
  const [cartFeed, setCartFeed] = useState<number>(1.58);
  const [cartMargin, setCartMargin] = useState<number>(20);
  const [cartStages, setCartStages] = useState<1 | 2>(1);
  const [cartLength, setCartLength] = useState<CartridgeLength>(20);
  const [cartForm, setCartForm] = useState<CartridgeForm>('slim');

  const cartOutput = calculateCartridgeFilters({
    feedM3h: cartFeed,
    marginPct: cartMargin,
    stages: cartStages,
    lengthIn: cartLength,
    form: cartForm,
  });

  // --- RO FLOW STATE ---
  const [roFeed, setRoFeed] = useState<number>(10000);
  const [roUnit, setRoUnit] = useState<'GPD' | 'm3h'>('GPD');
  const [roRecovery, setRoRecovery] = useState<number>(50);
  const [roDesignTds, setRoDesignTds] = useState<number>(5000);
  const [roTargetTds, setRoTargetTds] = useState<number>(300);
  const [roMembraneRating, setRoMembraneRating] = useState<number>(7500);

  const roOutput = calculateRoFlows({
    feedFlow: roFeed,
    feedFlowUnit: roUnit,
    recoveryPct: roRecovery,
    designTdsPpm: roDesignTds,
    targetProductTdsPpm: roTargetTds,
    membraneRatedGpd: roMembraneRating,
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Engineering Sizing Calculators</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Pure hydraulic calculations for multimedia filters, cartridge housings, and RO membrane projections.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D8DFE8] dark:border-[#334155] gap-2">
        <button
          onClick={() => setActiveTab('mmf')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'mmf'
              ? 'border-[#2E75B6] text-[#2E75B6] dark:text-[#5B9BD5] bg-white dark:bg-[#1E293B]'
              : 'border-transparent text-[#5B6B7F] dark:text-[#94A3B8] hover:text-[#0F172A]'
          }`}
        >
          <Layers className="w-4 h-4" />
          Multimedia Filter (MMF)
        </button>

        <button
          onClick={() => setActiveTab('cartridge')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'cartridge'
              ? 'border-[#2E75B6] text-[#2E75B6] dark:text-[#5B9BD5] bg-white dark:bg-[#1E293B]'
              : 'border-transparent text-[#5B6B7F] dark:text-[#94A3B8] hover:text-[#0F172A]'
          }`}
        >
          <Filter className="w-4 h-4" />
          Cartridge Filter & Housing
        </button>

        <button
          onClick={() => setActiveTab('ro')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-[2px] ${
            activeTab === 'ro'
              ? 'border-[#2E75B6] text-[#2E75B6] dark:text-[#5B9BD5] bg-white dark:bg-[#1E293B]'
              : 'border-transparent text-[#5B6B7F] dark:text-[#94A3B8] hover:text-[#0F172A]'
          }`}
        >
          <Droplet className="w-4 h-4" />
          RO Flow Chain & Balance
        </button>
      </div>

      {/* --- MMF CALCULATOR --- */}
      {activeTab === 'mmf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1F3A5F] dark:text-[#9DC3E6] uppercase tracking-wider pb-2 border-b border-[#D8DFE8] dark:border-[#334155]">
              Filter Design Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Flow Q (m³/hr)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mmfFlow}
                  onChange={(e) => setMmfFlow(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Velocity (m/hr)</label>
                <input
                  type="number"
                  step="0.5"
                  value={mmfVelocity}
                  onChange={(e) => setMmfVelocity(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Service Time (hrs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mmfServiceH}
                  onChange={(e) => setMmfServiceH(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Backwash Time (hrs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mmfBackwashH}
                  onChange={(e) => setMmfBackwashH(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Safety Margin (%)</label>
                <input
                  type="number"
                  value={mmfMargin}
                  onChange={(e) => setMmfMargin(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Vessel Type</label>
                <select
                  value={mmfVesselPref}
                  onChange={(e) => setMmfVesselPref(e.target.value as any)}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2 py-1.5 text-xs"
                >
                  <option value="auto">Auto (Rule Engine)</option>
                  <option value="frp">Force FRP</option>
                  <option value="ms">Force Mild Steel</option>
                </select>
              </div>
            </div>

            {/* Media Layers list */}
            <div className="pt-3 border-t border-[#D8DFE8] dark:border-[#334155]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1F3A5F] dark:text-[#9DC3E6]">Filter Media Layers</span>
                <button
                  onClick={() =>
                    setMmfLayers([
                      ...mmfLayers,
                      { name: 'Custom Layer', depthMm: 100, bulkDensityKgM3: 1000, ratePerKgMinor: 50 },
                    ])
                  }
                  className="inline-flex items-center gap-1 text-[11px] text-[#2E75B6] hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add Layer
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {mmfLayers.map((l, i) => (
                  <div key={i} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-[#D8DFE8] dark:border-[#334155] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={l.name}
                        onChange={(e) => {
                          const updated = [...mmfLayers];
                          updated[i].name = e.target.value;
                          setMmfLayers(updated);
                        }}
                        className="font-medium bg-transparent text-[#0F172A] dark:text-[#E2E8F0] border-b border-transparent focus:border-[#2E75B6] w-48 text-xs"
                      />
                      <button
                        onClick={() => setMmfLayers(mmfLayers.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5B6B7F]">
                      <div>
                        <span>Depth: </span>
                        <input
                          type="number"
                          value={l.depthMm}
                          onChange={(e) => {
                            const updated = [...mmfLayers];
                            updated[i].depthMm = Number(e.target.value);
                            setMmfLayers(updated);
                          }}
                          className="w-16 bg-white dark:bg-[#0F172A] border rounded px-1 py-0.5 font-mono text-xs"
                        />
                        <span> mm</span>
                      </div>
                      <div>
                        <span>Density: </span>
                        <input
                          type="number"
                          value={l.bulkDensityKgM3}
                          onChange={(e) => {
                            const updated = [...mmfLayers];
                            updated[i].bulkDensityKgM3 = Number(e.target.value);
                            setMmfLayers(updated);
                          }}
                          className="w-16 bg-white dark:bg-[#0F172A] border rounded px-1 py-0.5 font-mono text-xs"
                        />
                        <span> kg/m³</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sizing Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top result tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-[#1E293B] p-3.5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#5B6B7F] dark:text-[#94A3B8]">IFR Flow</span>
                <div className="text-xl font-bold font-mono text-[#1F3A5F] dark:text-[#9DC3E6] mt-0.5">
                  {mmfOutput.ifrM3h} <span className="text-xs font-normal text-[#5B6B7F]">m³/hr</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-3.5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#5B6B7F] dark:text-[#94A3B8]">Req. Area</span>
                <div className="text-xl font-bold font-mono text-[#1F3A5F] dark:text-[#9DC3E6] mt-0.5">
                  {mmfOutput.areaM2} <span className="text-xs font-normal text-[#5B6B7F]">m²</span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] p-3.5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#5B6B7F] dark:text-[#94A3B8]">Calculated Ø</span>
                <div className="text-xl font-bold font-mono text-[#1F3A5F] dark:text-[#9DC3E6] mt-0.5">
                  {mmfOutput.calcDiameterMm} <span className="text-xs font-normal text-[#5B6B7F]">mm</span>
                </div>
              </div>

              <div className="bg-[#DEEBF7] dark:bg-[#1B2A3D] p-3.5 rounded-xl border border-[#5B9BD5] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#1F3A5F] dark:text-[#9DC3E6]">Chosen Size</span>
                <div className="text-xl font-bold font-mono text-[#2E75B6] dark:text-[#5B9BD5] mt-0.5">
                  {mmfOutput.chosenVessel.diameterMm} mm
                  <span className="text-xs block font-sans font-semibold text-[#1F3A5F] dark:text-[#9DC3E6]">
                    {mmfOutput.chosenVessel.diameterIn}" Vessel ({mmfOutput.chosenVessel.type.toUpperCase()})
                  </span>
                </div>
              </div>
            </div>

            {/* Vessel Recommendation & Freeboard Check */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Material Recommendation:</span>
                <span className="font-mono font-bold uppercase text-[#2E75B6]">
                  {mmfOutput.chosenVessel.type} ({mmfOutput.chosenVessel.count} Vessel)
                </span>
              </div>
              <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">{mmfOutput.vesselTypeReason}</p>

              <div className="pt-2 border-t border-[#D8DFE8] dark:border-[#334155] flex items-center justify-between">
                <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">
                  Actual Velocity at {mmfOutput.chosenVessel.diameterMm}mm:
                </span>
                <span className="font-mono font-bold text-[#1F3A5F] dark:text-[#9DC3E6]">
                  {mmfOutput.actualVelocityMh} m/hr (Rated: {mmfOutput.ratedFlowM3h} m³/hr)
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Freeboard Check:</span>
                <span className={`font-semibold flex items-center gap-1 ${mmfOutput.freeboardOk ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {mmfOutput.freeboardOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {mmfOutput.freeboardPct}% freeboard (Shell {mmfOutput.chosenVessel.heightMm}mm vs Bed {mmfOutput.totalBedDepthMm}mm)
                </span>
              </div>
            </div>

            {/* Media weight summary table */}
            <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
              <h4 className="text-xs font-bold text-[#1F3A5F] dark:text-[#9DC3E6] uppercase tracking-wider mb-2">
                Calculated Media Weight Breakdown
              </h4>
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F7F9FC] dark:bg-[#0F172A] text-[#5B6B7F] border-b border-[#D8DFE8]">
                  <tr>
                    <th className="py-2 px-2.5">Layer</th>
                    <th className="py-2 px-2.5">Depth</th>
                    <th className="py-2 px-2.5">Volume</th>
                    <th className="py-2 px-2.5 font-bold text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8DFE8]">
                  {mmfOutput.layers.map((l, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-2.5 font-medium">{l.name}</td>
                      <td className="py-1.5 px-2.5 font-mono">{l.depthMm} mm</td>
                      <td className="py-1.5 px-2.5 font-mono">{l.volumeM3} m³</td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-right">{l.weightKg} kg</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold">
                    <td className="py-2 px-2.5">Total Media</td>
                    <td className="py-2 px-2.5 font-mono">{mmfOutput.totalBedDepthMm} mm</td>
                    <td className="py-2 px-2.5">—</td>
                    <td className="py-2 px-2.5 font-mono text-[#2E75B6] text-right">{mmfOutput.totalWeightKg} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- CARTRIDGE CALCULATOR --- */}
      {activeTab === 'cartridge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1F3A5F] dark:text-[#9DC3E6] uppercase tracking-wider pb-2 border-b border-[#D8DFE8] dark:border-[#334155]">
              Cartridge Filter Inputs
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">RO Feed Flow (m³/hr)</label>
                <input
                  type="number"
                  step="0.05"
                  value={cartFeed}
                  onChange={(e) => setCartFeed(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Safety Margin (%)</label>
                <input
                  type="number"
                  value={cartMargin}
                  onChange={(e) => setCartMargin(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Filtration Stages</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="stages"
                      checked={cartStages === 1}
                      onChange={() => setCartStages(1)}
                    />
                    <span>1 Stage (5 µm)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="stages"
                      checked={cartStages === 2}
                      onChange={() => setCartStages(2)}
                    />
                    <span>2 Stages (5 µm → 1 µm in series)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Cartridge Length</label>
                  <select
                    value={cartLength}
                    onChange={(e) => setCartLength(Number(e.target.value) as any)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value={10}>10 inch</option>
                    <option value={20}>20 inch</option>
                    <option value={30}>30 inch</option>
                    <option value={40}>40 inch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Cartridge Form</label>
                  <select
                    value={cartForm}
                    onChange={(e) => setCartForm(e.target.value as any)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="slim">Slim (2.5" OD)</option>
                    <option value="jumbo">Jumbo (4.5" OD)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#DEEBF7] dark:bg-[#1B2A3D] p-4 rounded-xl border border-[#5B9BD5] shadow-xs">
              <span className="text-[10px] font-bold uppercase text-[#1F3A5F] dark:text-[#9DC3E6]">Design Flow With Margin</span>
              <div className="text-2xl font-bold font-mono text-[#2E75B6] dark:text-[#5B9BD5] mt-1">
                {cartOutput.designFlowM3h.toFixed(3)} <span className="text-xs font-normal">m³/hr</span>
              </div>
            </div>

            {cartOutput.stages.map((stage) => (
              <div
                key={stage.stageNumber}
                className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#E2E8F0]">
                    Stage {stage.stageNumber}: {stage.micron} Micron Filtration
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#DEEBF7] text-[#1F3A5F]">
                    {stage.elementsRequired} x {cartLength}" {cartForm.toUpperCase()} Element(s)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                    <span className="text-[#5B6B7F] block">Ideal Flow / Element</span>
                    <span className="font-mono font-bold text-[#1F3A5F]">{stage.idealFlowPerElementM3h} m³/hr</span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                    <span className="text-[#5B6B7F] block">Housing Selected</span>
                    <span className="font-mono font-bold text-[#1F3A5F]">
                      {stage.housingQty} x {stage.housingSlots}-Slot ({stage.housingMaterial})
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded">
                    <span className="text-[#5B6B7F] block">Slot Consistency</span>
                    <span className={`font-semibold flex items-center gap-1 ${stage.isConsistent ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {stage.isConsistent ? 'Consistent' : 'Mismatch'}
                    </span>
                  </div>
                </div>

                {stage.validationWarning && (
                  <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{stage.validationWarning}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- RO FLOW CALCULATOR --- */}
      {activeTab === 'ro' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1F3A5F] dark:text-[#9DC3E6] uppercase tracking-wider pb-2 border-b border-[#D8DFE8] dark:border-[#334155]">
              RO Flow Balance Inputs
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Feed Flow</label>
                  <input
                    type="number"
                    value={roFeed}
                    onChange={(e) => setRoFeed(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Units</label>
                  <select
                    value={roUnit}
                    onChange={(e) => setRoUnit(e.target.value as any)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2 py-1.5 text-xs font-semibold"
                  >
                    <option value="GPD">Gallons / Day (GPD)</option>
                    <option value="m3h">Cubic Meters / Hr (m³/hr)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">System Recovery (%)</label>
                <input
                  type="number"
                  value={roRecovery}
                  onChange={(e) => setRoRecovery(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-1.5 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Raw TDS (ppm)</label>
                  <input
                    type="number"
                    value={roDesignTds}
                    onChange={(e) => setRoDesignTds(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Product TDS (ppm)</label>
                  <input
                    type="number"
                    value={roTargetTds}
                    onChange={(e) => setRoTargetTds(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-medium mb-1">Membrane Rating (GPD / element)</label>
                <select
                  value={roMembraneRating}
                  onChange={(e) => setRoMembraneRating(Number(e.target.value))}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-1.5 text-xs"
                >
                  <option value={7500}>BW30-400 (8" x 40") - 7,500 GPD</option>
                  <option value={2500}>BW30-4040 (4" x 40") - 2,500 GPD</option>
                  <option value={10500}>BW30-440 (8" x 40") - 10,500 GPD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-[#1E293B] p-4 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
                <span className="text-[10px] font-bold uppercase text-[#5B6B7F]">Feed Flow</span>
                <div className="text-xl font-bold font-mono text-[#0F172A] dark:text-[#E2E8F0] mt-1">
                  {roOutput.feedGpd.toLocaleString()} <span className="text-xs font-normal">GPD</span>
                </div>
                <span className="text-xs text-[#5B6B7F] font-mono block mt-0.5">
                  {roOutput.feedM3h.toFixed(3)} m³/hr ({roOutput.feedGpm.toFixed(1)} GPM)
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Permeate (Product)</span>
                <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                  {roOutput.productGpd.toLocaleString()} <span className="text-xs font-normal">GPD</span>
                </div>
                <span className="text-xs text-emerald-800 dark:text-emerald-400 font-mono block mt-0.5">
                  {roOutput.productM3h.toFixed(3)} m³/hr ({roOutput.productGpm.toFixed(1)} GPM)
                </span>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-300 dark:border-amber-800 shadow-xs">
                <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">Brine (Reject)</span>
                <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
                  {roOutput.rejectGpd.toLocaleString()} <span className="text-xs font-normal">GPD</span>
                </div>
                <span className="text-xs text-amber-800 dark:text-amber-400 font-mono block mt-0.5">
                  {roOutput.rejectM3h.toFixed(3)} m³/hr ({roOutput.rejectGpm.toFixed(1)} GPM)
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-sm text-[#1F3A5F] dark:text-[#9DC3E6]">Membrane Element Requirements</h4>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Suggested Membrane Elements:</span>
                <span className="text-base font-bold font-mono text-[#2E75B6]">
                  {roOutput.suggestedMembranes} Element(s)
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Salt Rejection Estimate:</span>
                <span className="font-bold font-mono text-emerald-600">
                  {roOutput.saltRejectionEstPct?.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Recovery Fraction:</span>
                <span className="font-bold font-mono text-[#1F3A5F]">
                  {(roOutput.recoveryFraction * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
