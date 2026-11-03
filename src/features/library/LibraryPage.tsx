import React from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState.tsx';

export function LibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Component Library</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Master repository of pumps, membranes, vessels, dosing systems, and electrical instrumentation.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#2E75B6] hover:bg-[#1F3A5F] rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Component
        </button>
      </div>

      <EmptyState
        icon={BookOpen}
        title="Component library is ready"
        description="Write component specs once (e.g. Grundfos pumps, Filmtec membranes, PVC piping) and reuse them across proposals."
        actionLabel="Add Component"
        onAction={() => {}}
      />
    </div>
  );
}
