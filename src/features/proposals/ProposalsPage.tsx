import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState.tsx';

export function ProposalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Proposals</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Manage technical & commercial quotations, revisions, and exported documents.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#2E75B6] hover:bg-[#1F3A5F] rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Proposal
        </button>
      </div>

      <EmptyState
        icon={FileText}
        title="No proposals found"
        description="Start a new proposal with plant templates (e.g. 10,000 GPD BWRO), or size equipment from scratch."
        actionLabel="Create proposal"
        onAction={() => {}}
      />
    </div>
  );
}
