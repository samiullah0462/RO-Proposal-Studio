import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Play } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState.tsx';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8DFE8] dark:border-[#334155]">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-[#E2E8F0]">Dashboard</h1>
          <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8]">
            Overview of technical proposals, follow-ups, and quotation pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dev/self-test')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1F3A5F] dark:text-[#9DC3E6] bg-[#DEEBF7] dark:bg-[#1B2A3D] rounded-md hover:bg-[#c9e0f5] transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Domain Self-Test
          </button>
          <button
            onClick={() => navigate('/proposals')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#2E75B6] hover:bg-[#1F3A5F] rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Proposal
          </button>
        </div>
      </div>

      <EmptyState
        icon={LayoutDashboard}
        title="No proposal activity yet"
        description="Produce complete, branded RO proposals in minutes with automatic hydraulic sizing and zero manual layout work."
        actionLabel="Create your first proposal"
        onAction={() => navigate('/proposals')}
      />
    </div>
  );
}
