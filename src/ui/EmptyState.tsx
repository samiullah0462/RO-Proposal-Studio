import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#D8DFE8] dark:border-[#334155] bg-white dark:bg-[#1E293B] shadow-xs my-6">
      <div className="w-14 h-14 rounded-full bg-[#DEEBF7] dark:bg-[#1B2A3D] text-[#2E75B6] dark:text-[#5B9BD5] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-semibold text-[#0F172A] dark:text-[#E2E8F0]">{title}</h3>
      <p className="text-sm text-[#5B6B7F] dark:text-[#94A3B8] max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#2E75B6] hover:bg-[#1F3A5F] dark:bg-[#5B9BD5] dark:hover:bg-[#2E75B6] rounded-md shadow-xs transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
