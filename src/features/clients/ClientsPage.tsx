import React from 'react';
import { Users, UserPlus } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState.tsx';

export function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Clients</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Directory of companies, contact persons, site locations, and raw water lab reports.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#2E75B6] hover:bg-[#1F3A5F] rounded-md shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <EmptyState
        icon={Users}
        title="Add your first client"
        description="Save client profiles and water analyses so design parameters pre-fill automatically in proposals."
        actionLabel="Add your first client"
        onAction={() => {}}
      />
    </div>
  );
}
