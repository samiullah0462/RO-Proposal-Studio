import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Check,
  X,
  Building,
} from 'lucide-react';
import { db, type ClientEntity } from '../../data/db.ts';

export function ClientsPage() {
  const [clients, setClients] = useState<ClientEntity[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    attention: '',
    phone: '',
    email: '',
    address: '',
    city: 'Karachi',
    industry: 'Commercial / Industrial',
    status: 'lead' as 'lead' | 'customer' | 'inactive',
  });

  const loadClients = async () => {
    const list = await db.clients.toArray();
    setClients(list);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const now = new Date().toISOString();
    const newClient: ClientEntity = {
      id: `client-${Date.now()}`,
      name: formData.name.trim(),
      attention: formData.attention.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      industry: formData.industry.trim() || undefined,
      status: formData.status,
      created_at: now,
      client_updated_at: now,
      _dirty: 0,
    };

    await db.clients.put(newClient);
    await loadClients();
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      attention: '',
      phone: '',
      email: '',
      address: '',
      city: 'Karachi',
      industry: 'Commercial / Industrial',
      status: 'lead',
    });
    showToast(`Client "${newClient.name}" created.`);
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (confirm(`Delete client "${name}"? This will not affect past proposals.`)) {
      await db.clients.delete(id);
      await loadClients();
      showToast(`Client deleted.`);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase())) ||
      (c.attention && c.attention.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Clients Directory</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Manage client profiles, contacts, and water treatment site locations.
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
            <UserPlus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by client or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded-md pl-9 pr-3 py-1.5 text-xs text-[#0F172A] dark:text-[#E2E8F0] focus:outline-[#2E75B6]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-[#5B6B7F] dark:text-[#94A3B8]">Filter:</span>
          {['all', 'customer', 'lead', 'inactive'].map((st) => (
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

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-[#D8DFE8] dark:border-[#334155] shadow-xs hover:border-[#2E75B6] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#1F3A5F] dark:text-[#9DC3E6] flex items-center justify-center font-bold text-xs shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#E2E8F0]">{client.name}</h3>
                      {client.attention && (
                        <span className="text-[11px] text-[#5B6B7F] dark:text-[#94A3B8] block">
                          Attn: {client.attention}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      client.status === 'customer'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : client.status === 'lead'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-[#5B6B7F] dark:text-[#94A3B8]">
                  {client.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                      <span className="truncate">{client.address || client.city}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#D8DFE8] dark:border-[#334155] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#94A3B8]">{client.industry || 'Water Treatment'}</span>
                <button
                  onClick={() => handleDeleteClient(client.id, client.name)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                  title="Delete client"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-[#1E293B] rounded-xl border border-dashed border-[#D8DFE8] dark:border-[#334155]">
          <Users className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
          <h4 className="font-semibold text-sm text-[#0F172A] dark:text-[#E2E8F0]">No clients match your filter</h4>
          <p className="text-xs text-[#5B6B7F] dark:text-[#94A3B8] mt-1">Add a new client profile or clear your search query.</p>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DFE8] dark:border-[#334155]">
              <h3 className="font-bold text-base text-[#1F3A5F] dark:text-[#9DC3E6]">Add New Client</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-[#5B6B7F] hover:text-[#0F172A]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Company / Client Name *</label>
                <input
                  type="text"
                  placeholder="e.g. M/S AL-MADINA BEVERAGES"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Attention (Contact Person)</label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Tariq"
                    value={formData.attention}
                    onChange={(e) => setFormData({ ...formData, attention: e.target.value })}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Address / Plant Site Location</label>
                <input
                  type="text"
                  placeholder="Plot #, Industrial Zone, Site Area"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-2.5 py-2 text-xs"
                  >
                    <option value="lead">Lead</option>
                    <option value="customer">Customer</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#44546A] dark:text-[#CBD5E1] font-semibold mb-1">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-[#F7F9FC] dark:bg-[#0F172A] border border-[#D8DFE8] dark:border-[#334155] rounded px-3 py-2 text-xs"
                  />
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
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
