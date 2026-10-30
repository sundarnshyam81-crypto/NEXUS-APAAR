'use client';
import React from 'react';

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-chip-border bg-chip text-primary-container ${className}`}
    >
      <span className="material-symbols-outlined text-[15px]">info</span>
      <span>Demo · Synthetic Data</span>
    </div>
  );
}

export default DemoBadge;
