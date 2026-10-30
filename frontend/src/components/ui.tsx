'use client';

import React from 'react';

export function LoadingState({ label = 'Loading records...' }: { label?: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-primary-container border-t-transparent animate-spin" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="stitch-card p-8 text-center">
      <p className="font-serif text-xl text-heading">{title}</p>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-border">
      <div className="space-y-1.5">
        {kicker && <p className="text-sm font-medium text-muted">{kicker}</p>}
        <h1 className="font-serif text-[28px] md:text-[32px] leading-tight text-heading">{title}</h1>
        {description && <p className="text-base text-body max-w-3xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status?: string | null }) {
  const value = (status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const cls = [
    'approved', 'enrolled', 'active', 'verified', 'completed', 'cleared', 'reconciled',
  ].includes(value)
    ? 'status-approved'
    : ['pending', 'in_progress', 'under_review', 'request_info', 'needs_info'].includes(value)
    ? 'status-pending'
    : ['rejected', 'blocked', 'failed', 'conflict'].includes(value)
    ? 'status-rejected'
    : 'status-default';

  return <span className={`status-pill ${cls}`}>{status || 'Pending'}</span>;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = 'lavender',
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: string;
  accent?: 'lavender' | 'white';
}) {
  return (
    <div className={`${accent === 'lavender' ? 'stitch-card-lavender' : 'stitch-card'} p-5 flex flex-col justify-between min-h-[148px]`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted">{label}</span>
        <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center text-primary-container">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="mt-4">
        <div className="font-serif text-[28px] leading-none text-heading">{value}</div>
        {hint && <div className="mt-2 text-sm text-muted">{hint}</div>}
      </div>
    </div>
  );
}

export function ProgressBar({ percent }: { percent: number }) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

export function SectionChips({
  items,
  activeHref,
}: {
  items: { label: string; href: string }[];
  activeHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const active = activeHref === item.href;
        return (
          <a
            key={item.href}
            href={item.href}
            className={`h-8 px-4 rounded-full text-sm font-medium inline-flex items-center ${
              active
                ? 'bg-primary-container text-white'
                : 'bg-chip text-body border border-chip-border'
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}
