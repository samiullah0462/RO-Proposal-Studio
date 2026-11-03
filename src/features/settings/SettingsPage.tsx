import React, { useEffect, useState } from 'react';
import { Settings, Building2, Sliders, Database, HardDrive, Check } from 'lucide-react';
import { db, type CompanyEntity, type RuleSettingEntity } from '../../data/db.ts';

export function SettingsPage() {
  const [company, setCompany] = useState<CompanyEntity | null>(null);
  const [ruleSettings, setRuleSettings] = useState<RuleSettingEntity[]>([]);
  const [vesselCount, setVesselCount] = useState<number>(0);
  const [mediaCount, setMediaCount] = useState<number>(0);
  const [cartridgeCount, setCartridgeCount] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      const co = await db.companies.toCollection().first();
      if (co) setCompany(co);

      const rules = await db.rule_settings.toArray();
      setRuleSettings(rules);

      const vc = await db.vessel_sizes.count();
      setVesselCount(vc);

      const mc = await db.media_catalog.count();
      setMediaCount(mc);

      const cc = await db.cartridge_types.count();
      setCartridgeCount(cc);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Settings & Rules</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Manage company brand profiles, design calculation tables, and local IndexedDB storage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Card */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#1F3A5F] dark:text-[#9DC3E6] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#0F172A] dark:text-[#E2E8F0]">Company Brand Profile</h3>
              <span className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">Active proposal branding</span>
            </div>
          </div>

          {company ? (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#D8DFE8] dark:border-[#334155]">
                <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Company Name</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{company.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#D8DFE8] dark:border-[#334155]">
                <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Brand Code</span>
                <span className="font-mono font-semibold text-[#1F3A5F] dark:text-[#9DC3E6]">{company.brand_code}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#D8DFE8] dark:border-[#334155]">
                <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Ref Pattern</span>
                <span className="font-mono text-[#0F172A] dark:text-[#E2E8F0]">{company.ref_pattern}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#D8DFE8] dark:border-[#334155]">
                <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Colors</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: company.primary_color }} />
                  <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: company.accent_color }} />
                </div>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Default Currency</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{company.default_currency}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#5B6B7F]">Loading company settings...</p>
          )}
        </div>

        {/* Database & Rules Summary Card */}
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#1F3A5F] dark:text-[#9DC3E6] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-[#0F172A] dark:text-[#E2E8F0]">IndexedDB Local Tables</h3>
              <span className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">Dexie v4 Offline Schema</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#D8DFE8] dark:border-[#334155]">
              <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Standard Vessel Sizes</span>
              <span className="font-mono font-semibold text-[#2E75B6]">{vesselCount} sizes seeded</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D8DFE8] dark:border-[#334155]">
              <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Media Catalog Layers</span>
              <span className="font-mono font-semibold text-[#2E75B6]">{mediaCount} media types seeded</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#D8DFE8] dark:border-[#334155]">
              <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Cartridge Flow Rules</span>
              <span className="font-mono font-semibold text-[#2E75B6]">{cartridgeCount} rules seeded</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#5B6B7F] dark:text-[#94A3B8]">System Rule Settings</span>
              <span className="font-mono font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {ruleSettings.length} active rules
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
