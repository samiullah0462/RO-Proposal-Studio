import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Building,
  Calendar,
  Coins,
  Trash2,
  Check,
  X,
  Eye,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { db, type ProposalEntity, type ClientEntity, type TemplateEntity, type CompanyEntity } from '../../data/db.ts';
import { formatRefNumber } from '../../domain/refnumber.ts';
import { calculatePaymentTerms } from '../../domain/pricing.ts';

export function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalEntity[]>([]);
  const [clients, setClients] = useState<ClientEntity[]>([]);
  const [templates, setTemplates] = useState<TemplateEntity[]>([]);
  const [company, setCompany] = useState<CompanyEntity | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ProposalEntity | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // New Proposal Form
  const [selectedClientId, setSelectedClientId] = useState('');
  const [title, setTitle] = useState('10,000 GPD BWRO Plant (Semi-Automatic)');
  const [feedGpd, setFeedGpd] = useState<number>(10000);
  const [recoveryPct, setRecoveryPct] = useState<number>(50);
  const [designTds, setDesignTds] = useState<number>(5000);
  const [productTds, setProductTds] = useState<number>(300);
  const [lumpAmount, setLumpAmount] = useState<number>(735000);
  const [deliveryText, setDeliveryText] = useState('Within 02~04 weeks after receiving confirmed Purchase Order & Advance.');

  const loadData = async () => {
    const props = await db.proposals.orderBy('created_at').reverse().toArray();
    setProposals(props);

    const clis = await db.clients.toArray();
    setClients(clis);
    if (clis.length > 0 && !selectedClientId) {
      setSelectedClientId(clis[0].id);
    }

    const tpls = await db.templates.toArray();
    setTemplates(tpls);

    const co = await db.companies.toCollection().first();
    if (co) setCompany(co);
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    const now = new Date().toISOString();
    const currentYear = new Date().getFullYear();

    // Generate sequence number based on current count
    const nextSeq = proposals.length + 646;
    const refBase = formatRefNumber({
      brandCode: company?.brand_code || 'PS',
      year: currentYear,
      sequence: nextSeq,
    });

    const paymentTerms = calculatePaymentTerms(lumpAmount, [
      { label: '75% Advance for RO System at the time of Purchase Order.', percent: 75 },
      { label: '15% after delivery.', percent: 15 },
      { label: '10% after Installation and Commissioning.', percent: 10 },
    ]);

    const newProposal: ProposalEntity = {
      id: `prop-${Date.now()}`,
      company_id: company?.id || 'company-paksafe-default',
      client_id: client?.id,
      client_snapshot: {
        client_name: client ? `M/S ${client.name}` : 'M/S VALUED CLIENT',
        attention: client?.attention || 'Mr. Client',
        address: client?.address || 'Karachi, Pakistan',
        city: client?.city || 'Karachi',
        phone: client?.phone,
      },
      ref_base: refBase,
      rev: 1,
      status: 'draft',
      title: title.trim(),
      design: {
        feed_flow: feedGpd,
        feed_unit: 'GPD',
        recovery_pct: recoveryPct,
        design_tds_ppm: designTds,
        product_tds_ppm: productTds,
        inlet_pressure_bar: 16,
        temperature_c: 25,
      },
      currency: company?.default_currency || 'PKR',
      price_mode: 'lump',
      lump_amount_minor: lumpAmount,
      payment_terms: paymentTerms,
      delivery_text: deliveryText,
      validity_days: 30,
      created_at: now,
      client_updated_at: now,
      _dirty: 0,
    };

    await db.proposals.put(newProposal);
    await loadData();
    setIsNewModalOpen(false);
    showToast(`Proposal ${refBase} created for ${newProposal.client_snapshot.client_name}!`);
  };

  const handleDeleteProposal = async (id: string, ref: string) => {
    if (confirm(`Delete proposal ${ref}?`)) {
      await db.proposals.delete(id);
      await loadData();
      showToast(`Proposal ${ref} deleted.`);
    }
  };

  const handleUpdateStatus = async (prop: ProposalEntity, newStatus: any) => {
    await db.proposals.update(prop.id, { status: newStatus });
    await loadData();
    showToast(`Proposal ${prop.ref_base} marked as ${newStatus.toUpperCase()}.`);
  };

  const filteredProposals = proposals.filter((p) => {
    const matchesSearch =
      p.ref_base.toLowerCase().includes(search.toLowerCase()) ||
      p.client_snapshot.client_name.toLowerCase().includes(search.toLowerCase()) ||
      p.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Proposals Management</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Create technical & commercial quotations, track revisions, and export official documents.
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
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2E75B6] hover:bg-[#1F3A5F] rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Proposal
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by Ref # (e.g. 0646), client, or plant type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#0F172A] dark:text-[#E2E8F0] focus:outline-[#2E75B6]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Status:</span>
          {['all', 'draft', 'sent', 'won', 'lost'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded capitalize font-medium text-xs transition-colors ${
                statusFilter === st
                  ? 'bg-[#2E75B6] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-[#5B6B7F] dark:text-[#94A3B8] hover:text-[#0F172A]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F7F9FC] dark:bg-[#0F172A] text-[#44546A] dark:text-[#CBD5E1] border-b border-[#D8DFE8] dark:border-[#334155]">
              <tr>
                <th className="py-3 px-4 font-semibold">Ref Number</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Plant Scope & Capacity</th>
                <th className="py-3 px-4 font-semibold">Contract Value</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DFE8] dark:divide-[#334155]">
              {filteredProposals.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-[#1F3A5F] dark:text-[#9DC3E6]">
                    {prop.ref_base}
                    {prop.rev > 1 && <span className="text-xs text-[#2E75B6]"> (Rev-{prop.rev})</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#0F172A] dark:text-[#E2E8F0] block">
                      {prop.client_snapshot.client_name}
                    </span>
                    <span className="text-[11px] text-[#5B6B7F]">{prop.client_snapshot.city}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-[#0F172A] dark:text-[#E2E8F0] block">{prop.title}</span>
                    <span className="text-[11px] font-mono text-[#5B6B7F]">
                      {prop.design.feed_flow.toLocaleString()} GPD @ {prop.design.recovery_pct}% Recovery
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#2E75B6]">
                    {prop.currency} {prop.lump_amount_minor?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={prop.status}
                      onChange={(e) => handleUpdateStatus(prop, e.target.value)}
                      className={`text-[11px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 border cursor-pointer ${
                        prop.status === 'won'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : prop.status === 'sent'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedProposal(prop)}
                        className="p-1.5 text-[#2E75B6] hover:bg-slate-100 rounded"
                        title="View proposal details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProposal(prop.id, prop.ref_base)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="Delete proposal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Proposal Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
              <div>
                <h3 className="font-bold text-base text-[#1F3A5F] dark:text-[#9DC3E6]">Create New Proposal</h3>
                <span className="text-xs text-[#5B6B7F]">Instantiates full technical specifications and commercial terms</span>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 text-[#5B6B7F] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Select Client *</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs font-medium"
                    required
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city || 'No City'}) - Attn: {c.attention || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Proposal Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Feed Flow (GPD)</label>
                  <input
                    type="number"
                    value={feedGpd}
                    onChange={(e) => setFeedGpd(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">System Recovery (%)</label>
                  <input
                    type="number"
                    value={recoveryPct}
                    onChange={(e) => setRecoveryPct(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Raw Water TDS (ppm)</label>
                  <input
                    type="number"
                    value={designTds}
                    onChange={(e) => setDesignTds(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Target Product TDS (ppm)</label>
                  <input
                    type="number"
                    value={productTds}
                    onChange={(e) => setProductTds(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">
                    Contract Price (PKR Lump Sum)
                  </label>
                  <input
                    type="number"
                    value={lumpAmount}
                    onChange={(e) => setLumpAmount(Number(e.target.value))}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs font-mono font-bold text-[#2E75B6]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Delivery Terms</label>
                  <input
                    type="text"
                    value={deliveryText}
                    onChange={(e) => setDeliveryText(e.target.value)}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border rounded text-xs font-medium text-[#5B6B7F] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2E75B6] hover:bg-[#1F3A5F] text-white text-xs font-semibold rounded shadow-xs"
                >
                  Generate Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Proposal Detail Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
              <div>
                <span className="font-mono text-xs text-[#2E75B6] font-bold">{selectedProposal.ref_base}</span>
                <h3 className="font-bold text-base text-[#1F3A5F] dark:text-[#9DC3E6]">{selectedProposal.title}</h3>
                <span className="text-xs text-[#5B6B7F]">{selectedProposal.client_snapshot.client_name}</span>
              </div>
              <button onClick={() => setSelectedProposal(null)} className="p-1 text-[#5B6B7F] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border">
                <div>
                  <span className="text-[#5B6B7F] block">Feed Flow:</span>
                  <span className="font-mono font-bold">{selectedProposal.design.feed_flow.toLocaleString()} GPD</span>
                </div>
                <div>
                  <span className="text-[#5B6B7F] block">System Recovery:</span>
                  <span className="font-mono font-bold">{selectedProposal.design.recovery_pct}%</span>
                </div>
                <div>
                  <span className="text-[#5B6B7F] block">Contract Amount:</span>
                  <span className="font-mono font-bold text-[#2E75B6]">
                    {selectedProposal.currency} {selectedProposal.lump_amount_minor?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase text-[#1F3A5F] dark:text-[#9DC3E6] mb-2">
                  Payment Terms Breakdown (75% / 15% / 10%)
                </h4>
                <div className="space-y-1.5">
                  {selectedProposal.payment_terms?.map((term, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-dashed">
                      <span>{term.label}</span>
                      <span className="font-mono font-bold text-[#1F3A5F] dark:text-[#9DC3E6]">
                        {selectedProposal.currency} {term.amount?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#DEEBF7] dark:bg-[#1B2A3D] rounded border border-[#5B9BD5]">
                <span className="font-semibold text-[#1F3A5F] dark:text-[#9DC3E6] block">Delivery Timeline:</span>
                <p className="text-xs mt-0.5">{selectedProposal.delivery_text}</p>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedProposal(null)}
                className="px-4 py-2 border rounded text-xs font-medium text-[#5B6B7F]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
