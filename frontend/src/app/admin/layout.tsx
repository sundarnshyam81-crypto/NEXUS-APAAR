'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StitchHeader from '@/components/StitchHeader';
import StitchFooter from '@/components/StitchFooter';
import CitizenSupportFab from '@/components/CitizenSupportFab';
import DemoBadge from '@/components/DemoBadge';
import { PortalSidebar, ADMIN_NAV } from '@/components/PortalSidebar';
import { LoadingState } from '@/components/ui';
import { api } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scenarioRunning, setScenarioRunning] = useState<string | null>(null);
  const [scenarioMsg, setScenarioMsg] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isLoading && (!user || role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, role, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-surface">
        <LoadingState label="Authorising college administration portal..." />
      </div>
    );
  }

  const triggerScenario = async (s: 'A' | 'B' | 'C') => {
    setScenarioRunning(s);
    setScenarioMsg(null);
    try {
      const res = await api.admissions.runScenario(s);
      setScenarioMsg(`Triggered Scenario ${s}: ${res.message}`);
      setTimeout(() => setScenarioMsg(null), 6000);
      window.dispatchEvent(new Event('refreshAdminData'));
    } catch (err: unknown) {
      setScenarioMsg(`Error running Scenario ${s}: ${(err as Error).message}`);
    } finally {
      setScenarioRunning(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <StitchHeader titleSuffix="College Administration" onMenuClick={() => setMenuOpen(true)} />
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        <PortalSidebar items={ADMIN_NAV} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {scenarioMsg && (
            <div className="mb-4 p-3 rounded-lg bg-approved-bg border border-approved/20 text-approved text-sm flex items-center justify-between">
              <span>{scenarioMsg}</span>
              <button onClick={() => setScenarioMsg(null)} aria-label="Dismiss">✕</button>
            </div>
          )}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-lg border border-border text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-container">account_balance</span>
              <span className="font-medium text-heading">Institutional node</span>
              <span className="font-mono text-primary-container bg-lavender px-2 py-0.5 rounded">
                AISHE: U-0108 · IIT Delhi (demo)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">Demo triggers:</span>
              {(['A', 'B', 'C'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => triggerScenario(s)}
                  disabled={Boolean(scenarioRunning)}
                  className="px-2 py-1 rounded text-xs font-medium bg-white border border-border text-heading"
                >
                  {s === 'A' ? 'A: Conflict' : s === 'B' ? 'B: Capacity' : 'C: Clean pass'}
                </button>
              ))}
              <DemoBadge />
            </div>
          </div>
          {children}
        </div>
      </div>
      <CitizenSupportFab />
      <StitchFooter />
    </div>
  );
}
