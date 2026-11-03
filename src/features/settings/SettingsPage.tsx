import React, { useEffect, useState } from 'react';
import {
  Building2,
  Sliders,
  Database,
  Layers,
  Filter,
  Check,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  Download,
  AlertCircle,
} from 'lucide-react';
import {
  db,
  initAndSeedDatabase,
  type CompanyEntity,
  type RuleSettingEntity,
  type VesselSizeEntity,
  type MediaCatalogEntity,
  type CartridgeTypeEntity,
} from '../../data/db.ts';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'rules' | 'vessels' | 'media' | 'cartridges' | 'backup'>('company');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Company State
  const [company, setCompany] = useState<CompanyEntity | null>(null);

  // Rule settings state
  const [ruleSettings, setRuleSettings] = useState<Record<string, any>>({});

  // Tables state
  const [vessels, setVessels] = useState<VesselSizeEntity[]>([]);
  const [mediaList, setMediaList] = useState<MediaCatalogEntity[]>([]);
  const [cartridges, setCartridges] = useState<CartridgeTypeEntity[]>([]);

  // New row helpers
  const [newVessel, setNewVessel] = useState<Partial<VesselSizeEntity>>({
    diameter_in: 20,
    diameter_mm: 500,
    default_height_mm: 1650,
    max_pressure_bar: 10,
    type: 'frp',
  });
  const [newMedia, setNewMedia] = useState<Partial<MediaCatalogEntity>>({
    name: '',
    bulk_density_kg_m3: 1000,
    default_depth_mm: 100,
    rate_minor_per_kg: 50,
  });

  const loadAll = async () => {
    const co = await db.companies.toCollection().first();
    if (co) setCompany(co);

    const rules = await db.rule_settings.toArray();
    const rulesMap: Record<string, any> = {};
    for (const r of rules) {
      rulesMap[r.key] = r.value;
    }
    setRuleSettings(rulesMap);

    const vs = await db.vessel_sizes.toArray();
    setVessels(vs);

    const ms = await db.media_catalog.orderBy('sort_order').toArray();
    setMediaList(ms);

    const cs = await db.cartridge_types.toArray();
    setCartridges(cs);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  // Save Company
  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    const now = new Date().toISOString();
    await db.companies.put({
      ...company,
      client_updated_at: now,
    });
    showToast('Company branding & profile saved successfully!');
  };

  // Save Rule Settings
  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    for (const [key, value] of Object.entries(ruleSettings)) {
      await db.rule_settings.put({
        key,
        value: Number(value),
        updated_at: now,
      });
    }
    showToast('Engineering rule thresholds updated!');
  };

  // Vessel management
  const handleUpdateVessel = async (id: string, updates: Partial<VesselSizeEntity>) => {
    await db.vessel_sizes.update(id, updates);
    setVessels((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    showToast('Vessel size updated.');
  };

  const handleDeleteVessel = async (id: string) => {
    await db.vessel_sizes.delete(id);
    setVessels((prev) => prev.filter((v) => v.id !== id));
    showToast('Vessel size removed.');
  };

  const handleAddVessel = async () => {
    if (!newVessel.diameter_in || !newVessel.diameter_mm) return;
    const item: VesselSizeEntity = {
      id: `v-custom-${Date.now()}`,
      diameter_in: Number(newVessel.diameter_in),
      diameter_mm: Number(newVessel.diameter_mm),
      default_height_mm: Number(newVessel.default_height_mm || 1500),
      max_pressure_bar: Number(newVessel.max_pressure_bar || 10),
      type: (newVessel.type as any) || 'frp',
    };
    await db.vessel_sizes.put(item);
    setVessels((prev) => [...prev, item]);
    showToast('New standard vessel size added.');
  };

  // Media management
  const handleUpdateMedia = async (id: string, updates: Partial<MediaCatalogEntity>) => {
    await db.media_catalog.update(id, updates);
    setMediaList((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    showToast('Media entry updated.');
  };

  const handleDeleteMedia = async (id: string) => {
    await db.media_catalog.delete(id);
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    showToast('Media removed.');
  };

  const handleAddMedia = async () => {
    if (!newMedia.name) return;
    const item: MediaCatalogEntity = {
      id: `m-custom-${Date.now()}`,
      name: newMedia.name,
      bulk_density_kg_m3: Number(newMedia.bulk_density_kg_m3 || 1000),
      default_depth_mm: Number(newMedia.default_depth_mm || 100),
      rate_minor_per_kg: Number(newMedia.rate_minor_per_kg || 0),
      sort_order: mediaList.length + 1,
    };
    await db.media_catalog.put(item);
    setMediaList((prev) => [...prev, item]);
    setNewMedia({ name: '', bulk_density_kg_m3: 1000, default_depth_mm: 100, rate_minor_per_kg: 50 });
    showToast('New media added.');
  };

  // Cartridge flow updates
  const handleUpdateCartridge = async (id: string, idealFlow: number) => {
    await db.cartridge_types.update(id, { ideal_flow_m3h: idealFlow });
    setCartridges((prev) => prev.map((c) => (c.id === id ? { ...c, ideal_flow_m3h: idealFlow } : c)));
    showToast('Cartridge ideal flow updated.');
  };

  // Export JSON Backup
  const handleExportJSON = async () => {
    const backup = {
      format: 'ro-proposal-studio',
      version: 1,
      exportedAt: new Date().toISOString(),
      tables: {
        companies: await db.companies.toArray(),
        clients: await db.clients.toArray(),
        components: await db.components.toArray(),
        templates: await db.templates.toArray(),
        proposals: await db.proposals.toArray(),
        rule_settings: await db.rule_settings.toArray(),
        vessel_sizes: await db.vessel_sizes.toArray(),
        media_catalog: await db.media_catalog.toArray(),
        cartridge_types: await db.cartridge_types.toArray(),
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ro-proposal-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Database exported successfully as JSON.');
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    if (confirm('Are you sure you want to restore default rule tables and sample data?')) {
      await db.vessel_sizes.clear();
      await db.media_catalog.clear();
      await db.cartridge_types.clear();
      await db.rule_settings.clear();
      await initAndSeedDatabase();
      await loadAll();
      showToast('Restored default tables and rule settings.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Settings & Rules</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Configure company branding, engineering calculation limits, vessel catalogs, and local data.
          </p>
        </div>

        {savedNotice && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium rounded-lg">
            <Check className="w-4 h-4 text-emerald-600" />
            {savedNotice}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-[#D8DFE8] dark:border-[#334155] gap-2">
        {[
          { id: 'company', label: 'Company Profile', icon: Building2 },
          { id: 'rules', label: 'Design Thresholds', icon: Sliders },
          { id: 'vessels', label: 'Vessel Sizes', icon: Database },
          { id: 'media', label: 'Media Catalog', icon: Layers },
          { id: 'cartridges', label: 'Cartridge Rules', icon: Filter },
          { id: 'backup', label: 'Backup & Reset', icon: Download },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 -mb-[2px] ${
                active
                  ? 'border-[#2E75B6] text-[#2E75B6] dark:text-[#5B9BD5] bg-white dark:bg-[#1E293B]'
                  : 'border-transparent text-[#5B6B7F] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Company Profile */}
      {activeTab === 'company' && company && (
        <form onSubmit={handleSaveCompany} className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
            <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Company Brand & Proposal Information</h3>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2E75B6] hover:bg-[#1F3A5F] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Company Settings
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0] focus:outline-[#2E75B6]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Brand Code (Prefix)</label>
              <input
                type="text"
                value={company.brand_code}
                onChange={(e) => setCompany({ ...company, brand_code: e.target.value.toUpperCase() })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs font-mono text-[#0F172A] dark:text-[#E2E8F0] focus:outline-[#2E75B6]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Reference Number Pattern</label>
              <input
                type="text"
                value={company.ref_pattern}
                onChange={(e) => setCompany({ ...company, ref_pattern: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs font-mono text-[#0F172A] dark:text-[#E2E8F0] focus:outline-[#2E75B6]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Primary Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={company.primary_color}
                  onChange={(e) => setCompany({ ...company, primary_color: e.target.value })}
                  className="w-9 h-9 rounded cursor-pointer border border-[#D8DFE8]"
                />
                <input
                  type="text"
                  value={company.primary_color}
                  onChange={(e) => setCompany({ ...company, primary_color: e.target.value })}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs font-mono text-[#0F172A] dark:text-[#E2E8F0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={company.accent_color}
                  onChange={(e) => setCompany({ ...company, accent_color: e.target.value })}
                  className="w-9 h-9 rounded cursor-pointer border border-[#D8DFE8]"
                />
                <input
                  type="text"
                  value={company.accent_color}
                  onChange={(e) => setCompany({ ...company, accent_color: e.target.value })}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs font-mono text-[#0F172A] dark:text-[#E2E8F0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Default Currency</label>
              <input
                type="text"
                value={company.default_currency}
                onChange={(e) => setCompany({ ...company, default_currency: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs font-semibold text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Proposal Watermark Text</label>
              <input
                type="text"
                value={company.watermark_text || ''}
                onChange={(e) => setCompany({ ...company, watermark_text: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Signatory Name</label>
              <input
                type="text"
                value={company.signatory_name || ''}
                onChange={(e) => setCompany({ ...company, signatory_name: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Header Wordmark / Subtitle</label>
              <input
                type="text"
                value={company.header_text || ''}
                onChange={(e) => setCompany({ ...company, header_text: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Signatory Title</label>
              <input
                type="text"
                value={company.signatory_title || ''}
                onChange={(e) => setCompany({ ...company, signatory_title: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Contact Phone</label>
              <input
                type="text"
                value={company.phone || ''}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Email Address</label>
              <input
                type="email"
                value={company.email || ''}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Office / Factory Address</label>
              <input
                type="text"
                value={company.address || ''}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Design Thresholds */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveRules} className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
            <div>
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Engineering Sizing Thresholds</h3>
              <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">Controls automatic calculations and FRP vs Mild Steel recommendation rules.</p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2E75B6] hover:bg-[#1F3A5F] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Rules
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Max FRP Diameter (mm)</label>
              <input
                type="number"
                value={ruleSettings['max_frp_diameter_mm'] ?? 1600}
                onChange={(e) => setRuleSettings({ ...ruleSettings, max_frp_diameter_mm: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
              <span className="text-[10px] text-[#5B6B7F] dark:text-[#94A3B8]">Default: 1600 mm (63")</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Max FRP Operating Pressure (bar)</label>
              <input
                type="number"
                step="0.5"
                value={ruleSettings['max_frp_pressure_bar'] ?? 10}
                onChange={(e) => setRuleSettings({ ...ruleSettings, max_frp_pressure_bar: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
              <span className="text-[10px] text-[#5B6B7F] dark:text-[#94A3B8]">Default: 10.0 Bar(g)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Max FRP Operating Temp (°C)</label>
              <input
                type="number"
                value={ruleSettings['max_frp_temp_c'] ?? 49}
                onChange={(e) => setRuleSettings({ ...ruleSettings, max_frp_temp_c: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
              <span className="text-[10px] text-[#5B6B7F] dark:text-[#94A3B8]">Default: 49 °C (120 °F)</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Design Filtration Velocity (m/hr)</label>
              <input
                type="number"
                step="0.5"
                value={ruleSettings['default_velocity_m_h'] ?? 16}
                onChange={(e) => setRuleSettings({ ...ruleSettings, default_velocity_m_h: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
              <span className="text-[10px] text-[#5B6B7F] dark:text-[#94A3B8]">Excel standard: 16.0 m/hr</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Min Freeboard Height (%)</label>
              <input
                type="number"
                value={ruleSettings['min_freeboard_pct'] ?? 40}
                onChange={(e) => setRuleSettings({ ...ruleSettings, min_freeboard_pct: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
              <span className="text-[10px] text-[#5B6B7F] dark:text-[#94A3B8]">Recommended: ≥ 40%</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#44546A] dark:text-[#CBD5E1] mb-1">Cartridge Safety Margin (%)</label>
              <input
                type="number"
                value={ruleSettings['cartridge_safety_margin_pct'] ?? 20}
                onChange={(e) => setRuleSettings({ ...ruleSettings, cartridge_safety_margin_pct: e.target.value })}
                className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md px-3 py-2 text-xs text-[#0F172A] dark:text-[#E2E8F0]"
              />
              <span className="text-[10px] text-[#5B6B7F] dark:text-[#94A3B8]">Default: 20%</span>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: Standard Vessel Sizes */}
      {activeTab === 'vessels' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
            <div>
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Standard Pressure Vessel Catalog</h3>
              <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">All calculations pick the next available size from this table.</p>
            </div>
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D8DFE8] dark:border-[#334155] text-xs font-medium text-[#5B6B7F] dark:text-[#94A3B8] rounded hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Standard Defaults
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9FC] dark:bg-[#0F172A] text-[#44546A] dark:text-[#CBD5E1] border-b border-[#D8DFE8] dark:border-[#334155]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Diameter (in)</th>
                  <th className="py-2.5 px-3 font-semibold">Diameter (mm)</th>
                  <th className="py-2.5 px-3 font-semibold">Default Shell H (mm)</th>
                  <th className="py-2.5 px-3 font-semibold">Max Press. (bar)</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DFE8] dark:divide-[#334155]">
                {vessels.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-medium">{v.diameter_in}"</td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={v.diameter_mm}
                        onChange={(e) => handleUpdateVessel(v.id, { diameter_mm: Number(e.target.value) })}
                        className="w-20 bg-transparent border border-[#D8DFE8] dark:border-[#334155] rounded px-1.5 py-0.5 text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={v.default_height_mm}
                        onChange={(e) => handleUpdateVessel(v.id, { default_height_mm: Number(e.target.value) })}
                        className="w-24 bg-transparent border border-[#D8DFE8] dark:border-[#334155] rounded px-1.5 py-0.5 text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={v.max_pressure_bar}
                        onChange={(e) => handleUpdateVessel(v.id, { max_pressure_bar: Number(e.target.value) })}
                        className="w-16 bg-transparent border border-[#D8DFE8] dark:border-[#334155] rounded px-1.5 py-0.5 text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3 uppercase text-[11px] font-semibold text-[#2E75B6]">{v.type}</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleDeleteVessel(v.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete vessel size"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add vessel row */}
          <div className="pt-3 border-t border-[#D8DFE8] dark:border-[#334155] flex flex-wrap items-center gap-3">
            <input
              type="number"
              placeholder="Dia in"
              value={newVessel.diameter_in || ''}
              onChange={(e) => setNewVessel({ ...newVessel, diameter_in: Number(e.target.value) })}
              className="w-20 border border-[#D8DFE8] dark:border-[#334155] rounded px-2 py-1 text-xs"
            />
            <input
              type="number"
              placeholder="Dia mm"
              value={newVessel.diameter_mm || ''}
              onChange={(e) => setNewVessel({ ...newVessel, diameter_mm: Number(e.target.value) })}
              className="w-24 border border-[#D8DFE8] dark:border-[#334155] rounded px-2 py-1 text-xs"
            />
            <input
              type="number"
              placeholder="Height mm"
              value={newVessel.default_height_mm || ''}
              onChange={(e) => setNewVessel({ ...newVessel, default_height_mm: Number(e.target.value) })}
              className="w-24 border border-[#D8DFE8] dark:border-[#334155] rounded px-2 py-1 text-xs"
            />
            <button
              onClick={handleAddVessel}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#2E75B6] text-white text-xs font-medium rounded hover:bg-[#1F3A5F]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Size
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: Media Catalog */}
      {activeTab === 'media' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
            <div>
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Media Layer Catalog & Bulk Densities</h3>
              <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">Bulk densities (kg/m³) used to calculate total media weight in Multimedia filters.</p>
            </div>
            <button
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#D8DFE8] dark:border-[#334155] text-xs font-medium text-[#5B6B7F] dark:text-[#94A3B8] rounded hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Catalog
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9FC] dark:bg-[#0F172A] text-[#44546A] dark:text-[#CBD5E1] border-b border-[#D8DFE8] dark:border-[#334155]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Media Name</th>
                  <th className="py-2.5 px-3 font-semibold">Bulk Density (kg/m³)</th>
                  <th className="py-2.5 px-3 font-semibold">Default Depth (mm)</th>
                  <th className="py-2.5 px-3 font-semibold">Rate (PKR/kg)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DFE8] dark:divide-[#334155]">
                {mediaList.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-[#0F172A] dark:text-[#E2E8F0]">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleUpdateMedia(m.id, { name: e.target.value })}
                        className="w-full bg-transparent border border-[#D8DFE8] dark:border-[#334155] rounded px-1.5 py-0.5 text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={m.bulk_density_kg_m3}
                        onChange={(e) => handleUpdateMedia(m.id, { bulk_density_kg_m3: Number(e.target.value) })}
                        className="w-24 bg-transparent border border-[#D8DFE8] dark:border-[#334155] rounded px-1.5 py-0.5 text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={m.default_depth_mm}
                        onChange={(e) => handleUpdateMedia(m.id, { default_depth_mm: Number(e.target.value) })}
                        className="w-20 bg-transparent border border-[#D8DFE8] dark:border-[#334155] rounded px-1.5 py-0.5 text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        value={m.rate_minor_per_kg}
                        onChange={(e) => handleUpdateMedia(m.id, { rate_minor_per_kg: Number(e.target.value) })}
                        className="w-20 bg-transparent border border-[#D8DFE8] dark:border-[#334155] rounded px-1.5 py-0.5 text-xs font-mono"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleDeleteMedia(m.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete media"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add media form */}
          <div className="pt-3 border-t border-[#D8DFE8] dark:border-[#334155] flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Media name (e.g. Garnet)"
              value={newMedia.name || ''}
              onChange={(e) => setNewMedia({ ...newMedia, name: e.target.value })}
              className="w-48 border border-[#D8DFE8] dark:border-[#334155] rounded px-2 py-1 text-xs"
            />
            <input
              type="number"
              placeholder="Density kg/m³"
              value={newMedia.bulk_density_kg_m3 || ''}
              onChange={(e) => setNewMedia({ ...newMedia, bulk_density_kg_m3: Number(e.target.value) })}
              className="w-28 border border-[#D8DFE8] dark:border-[#334155] rounded px-2 py-1 text-xs"
            />
            <input
              type="number"
              placeholder="Depth mm"
              value={newMedia.default_depth_mm || ''}
              onChange={(e) => setNewMedia({ ...newMedia, default_depth_mm: Number(e.target.value) })}
              className="w-24 border border-[#D8DFE8] dark:border-[#334155] rounded px-2 py-1 text-xs"
            />
            <button
              onClick={handleAddMedia}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#2E75B6] text-white text-xs font-medium rounded hover:bg-[#1F3A5F]"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Media
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Cartridge Rules */}
      {activeTab === 'cartridges' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
            <div>
              <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Cartridge Filter Flow Ratings</h3>
              <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">Ideal flow (m³/hr) per cartridge element based on length and form (slim vs jumbo).</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F7F9FC] dark:bg-[#0F172A] text-[#44546A] dark:text-[#CBD5E1] border-b border-[#D8DFE8] dark:border-[#334155]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Length (in)</th>
                  <th className="py-2.5 px-3 font-semibold">Form</th>
                  <th className="py-2.5 px-3 font-semibold">Micron Rating</th>
                  <th className="py-2.5 px-3 font-semibold">Ideal Flow (m³/hr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DFE8] dark:divide-[#334155]">
                {cartridges.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-medium">{c.length_in}"</td>
                    <td className="py-2 px-3 uppercase text-[11px] font-semibold text-[#1F3A5F] dark:text-[#9DC3E6]">{c.form}</td>
                    <td className="py-2 px-3 font-mono">{c.micron} µm</td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.1"
                        value={c.ideal_flow_m3h}
                        onChange={(e) => handleUpdateCartridge(c.id, Number(e.target.value))}
                        className="w-20 bg-transparent border border-[#D8DFE8] dark:border-[#334155] rounded px-1.5 py-0.5 text-xs font-mono font-bold text-[#2E75B6]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: Backup & Reset */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Database Backup & Reset</h3>
            <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">All data is stored locally inside your browser's IndexedDB storage.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-[#D8DFE8] dark:border-[#334155] rounded-lg bg-slate-50 dark:bg-slate-800/40 space-y-3">
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#E2E8F0]">Export Full Data Backup</h4>
              <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8]">Download a complete JSON export of all proposals, clients, components, and rule tables.</p>
              <button
                onClick={handleExportJSON}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#2E75B6] text-white text-xs font-semibold rounded hover:bg-[#1F3A5F] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export Database (JSON)
              </button>
            </div>

            <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50/50 dark:bg-red-950/20 space-y-3">
              <h4 className="text-xs font-bold text-red-800 dark:text-red-300">Restore Factory Defaults</h4>
              <p className="text-xs text-red-600 dark:text-red-400">Resets all rule settings, vessel sizes, and media catalog entries to initial defaults.</p>
              <button
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Rule Tables
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
