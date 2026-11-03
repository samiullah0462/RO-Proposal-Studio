import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Trash2,
  Check,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { db, type ComponentEntity, type ComponentSpecField } from '../../data/db.ts';

export function LibraryPage() {
  const [components, setComponents] = useState<ComponentEntity[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [compName, setCompName] = useState('');
  const [compCat, setCompCat] = useState('cat-pretreat');
  const [compCost, setCompCost] = useState<number>(0);
  const [specFields, setSpecFields] = useState<ComponentSpecField[]>([
    { label: 'Make/Brand', value: 'Imported' },
    { label: 'Material', value: 'SS 316' },
    { label: 'Quantity', value: '01' },
  ]);

  const loadComponents = async () => {
    const list = await db.components.toArray();
    setComponents(list);
  };

  useEffect(() => {
    loadComponents();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddField = () => {
    setSpecFields([...specFields, { label: '', value: '' }]);
  };

  const handleRemoveField = (index: number) => {
    setSpecFields(specFields.filter((_, i) => i !== index));
  };

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) return;

    const now = new Date().toISOString();
    const validSpecs = specFields.filter((f) => f.label.trim() && f.value.trim());

    const newComp: ComponentEntity = {
      id: `comp-${Date.now()}`,
      name: compName.trim(),
      category_id: compCat,
      specs: validSpecs,
      cost_minor: compCost > 0 ? compCost * 100 : undefined,
      created_at: now,
      client_updated_at: now,
      _dirty: 0,
    };

    await db.components.put(newComp);
    await loadComponents();
    setIsAddModalOpen(false);
    setCompName('');
    setCompCost(0);
    setSpecFields([
      { label: 'Make/Brand', value: 'Imported' },
      { label: 'Material', value: 'SS 316' },
      { label: 'Quantity', value: '01' },
    ]);
    showToast(`Component "${newComp.name}" added to library.`);
  };

  const handleDeleteComponent = async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from component library? Existing proposals retain their copy.`)) {
      await db.components.delete(id);
      await loadComponents();
      showToast('Component removed.');
    }
  };

  const categories = [
    { id: 'all', label: 'All Equipment' },
    { id: 'cat-pretreat', label: 'Pretreatment' },
    { id: 'cat-dosing', label: 'Dosing Systems' },
    { id: 'cat-pumps', label: 'Pumps' },
    { id: 'cat-ro', label: 'Membranes & Housings' },
    { id: 'cat-inst', label: 'Instrumentation' },
    { id: 'cat-electrical', label: 'Electrical & Panels' },
    { id: 'cat-skid', label: 'Skid & Piping' },
  ];

  const filteredComponents = components.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.specs.some((s) => s.value.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || c.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Component Library</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Master technical specifications of pumps, filters, membranes, tanks, and instruments.
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
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2E75B6] hover:bg-[#1F3A5F] rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Component
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search specs or component name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#0F172A] dark:text-[#E2E8F0] focus:outline-[#2E75B6]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs self-start md:self-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-[#2E75B6] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#5B6B7F] dark:text-[#94A3B8] hover:text-[#0F172A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Components List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredComponents.map((comp) => (
          <div
            key={comp.id}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs hover:border-[#2E75B6] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#1F3A5F] dark:text-[#9DC3E6] flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#E2E8F0]">{comp.name}</h3>
                </div>
                <button
                  onClick={() => handleDeleteComponent(comp.id, comp.name)}
                  className="p-1 text-slate-400 hover:text-red-600 rounded"
                  title="Delete component"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Spec fields table */}
              <div className="mt-3 space-y-1.5 text-xs">
                {comp.specs.map((s, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 border-b border-dotted border-slate-200 dark:border-slate-800">
                    <span className="text-[#5B6B7F] dark:text-[#94A3B8] font-medium">{s.label}</span>
                    <span className="text-[#0F172A] dark:text-[#E2E8F0] font-mono text-right max-w-[55%] truncate">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-2.5 flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span>{comp.specs.length} spec fields</span>
              <span className="font-mono text-[#2E75B6] font-semibold">Copyable to proposal</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Component Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
              <h3 className="font-bold text-base text-[#1F3A5F] dark:text-[#9DC3E6]">Add Component to Library</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#5B6B7F] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComponent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Component Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Chemical Dosing Pump (Antiscalant)"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Category</label>
                  <select
                    value={compCat}
                    onChange={(e) => setCompCat(e.target.value)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-2 text-xs"
                  >
                    <option value="cat-pretreat">Pretreatment</option>
                    <option value="cat-dosing">Dosing Systems</option>
                    <option value="cat-pumps">Pumps</option>
                    <option value="cat-ro">Membranes & Housings</option>
                    <option value="cat-inst">Instrumentation</option>
                    <option value="cat-electrical">Electrical & Panels</option>
                    <option value="cat-skid">Skid & Piping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Internal Cost (PKR, Optional)</label>
                  <input
                    type="number"
                    placeholder="Cost (never printed on proposal)"
                    value={compCost || ''}
                    onChange={(e) => setCompCost(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Specs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#44546A] dark:text-[#CBD5E1]">Technical Specification Rows</span>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="inline-flex items-center gap-1 text-[#2E75B6] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {specFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. Model / Head)"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...specFields];
                          updated[idx].label = e.target.value;
                          setSpecFields(updated);
                        }}
                        className="w-1/2 bg-[#F7F9FC] dark:bg-[#0F172A] border rounded px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Specification Value"
                        value={field.value}
                        onChange={(e) => {
                          const updated = [...specFields];
                          updated[idx].value = e.target.value;
                          setSpecFields(updated);
                        }}
                        className="w-1/2 bg-[#F7F9FC] dark:bg-[#0F172A] border rounded px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded text-xs font-medium text-[#5B6B7F] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E75B6] hover:bg-[#1F3A5F] text-white text-xs font-semibold rounded shadow-xs"
                >
                  Save Component
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
