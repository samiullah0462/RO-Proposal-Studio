import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Trash2,
  Check,
  X,
  FileText,
  ArrowRight,
  Droplet,
} from 'lucide-react';
import { db, type TemplateEntity } from '../../data/db.ts';

export function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateEntity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [plantType, setPlantType] = useState('BWRO Plant (Semi-Automatic)');
  const [capacity, setCapacity] = useState<number>(10000);
  const [intro, setIntro] = useState(
    'Technical and commercial proposal for design, manufacturing, supply, and commissioning of RO Plant.'
  );

  const loadTemplates = async () => {
    const list = await db.templates.toArray();
    setTemplates(list);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const now = new Date().toISOString();
    const newTpl: TemplateEntity = {
      id: `template-${Date.now()}`,
      name: name.trim(),
      plant_type: plantType,
      default_capacity_gpd: capacity,
      default_intro: intro.trim(),
      created_at: now,
      client_updated_at: now,
      _dirty: 0,
    };

    await db.templates.put(newTpl);
    await loadTemplates();
    setIsModalOpen(false);
    setName('');
    showToast(`Template "${newTpl.name}" created.`);
  };

  const handleDeleteTemplate = async (id: string, tplName: string) => {
    if (confirm(`Delete template "${tplName}"?`)) {
      await db.templates.delete(id);
      await loadTemplates();
      showToast('Template deleted.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Plant Templates</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Pre-assembled 15-section plant configurations for instant proposal generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toast && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              {toast}
            </div>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2E75B6] hover:bg-[#1F3A5F] rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs hover:border-[#2E75B6] transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#1F3A5F] dark:text-[#9DC3E6] flex items-center justify-center font-bold">
                    <Droplet className="w-5 h-5 text-[#2E75B6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0F172A] dark:text-[#E2E8F0]">{tpl.name}</h3>
                    <span className="text-xs text-[#2E75B6] font-semibold">{tpl.plant_type}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8] leading-relaxed">
                {tpl.default_intro || tpl.description || 'Pre-configured 15-section plant assembly.'}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#D8DFE8] dark:border-[#334155]">
                <div className="p-2 bg-[#F7F9FC] dark:bg-[#0F172A] rounded">
                  <span className="text-[10px] text-[#5B6B7F] block">Capacity Rating</span>
                  <span className="font-mono font-bold text-[#1F3A5F] dark:text-[#9DC3E6]">
                    {tpl.default_capacity_gpd?.toLocaleString()} GPD
                  </span>
                </div>
                <div className="p-2 bg-[#F7F9FC] dark:bg-[#0F172A] rounded">
                  <span className="text-[10px] text-[#5B6B7F] block">Sections Included</span>
                  <span className="font-mono font-bold text-[#1F3A5F] dark:text-[#9DC3E6]">15 Sections</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#D8DFE8] dark:border-[#334155] flex items-center justify-between">
              <span className="text-xs text-[#5B6B7F]">Ready to instantiate</span>
              <button
                onClick={() => navigate('/proposals')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#2E75B6] hover:bg-[#1F3A5F] rounded transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Create Proposal
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
              <h3 className="font-bold text-base text-[#1F3A5F] dark:text-[#9DC3E6]">Create Plant Template</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-[#5B6B7F] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Template Name *</label>
                <input
                  type="text"
                  placeholder="e.g. 5,000 GPD SWRO Sea Water Reverse Osmosis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Plant Type</label>
                  <select
                    value={plantType}
                    onChange={(e) => setPlantType(e.target.value)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-2 text-xs"
                  >
                    <option value="BWRO Plant (Semi-Automatic)">BWRO Plant (Semi-Automatic)</option>
                    <option value="BWRO Plant (Fully-Automatic)">BWRO Plant (Fully-Automatic)</option>
                    <option value="SWRO Sea Water RO Plant">SWRO Sea Water RO Plant</option>
                    <option value="Demineralizer (DM) Plant">Demineralizer (DM) Plant</option>
                    <option value="Water Softener Plant">Water Softener Plant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Default Capacity (GPD)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Technical Introduction</label>
                <textarea
                  rows={3}
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-xs font-medium text-[#5B6B7F] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E75B6] hover:bg-[#1F3A5F] text-white text-xs font-semibold rounded shadow-xs"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
