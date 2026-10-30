'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StitchHeader from '@/components/StitchHeader';
import StitchFooter from '@/components/StitchFooter';
import CitizenSupportFab from '@/components/CitizenSupportFab';
import DemoBadge from '@/components/DemoBadge';
import { PortalSidebar } from '@/components/PortalSidebar';
import type { SidebarItem } from '@/components/PortalSidebar';
import { LoadingState } from '@/components/ui';
import { api } from '@/lib/api';

const AICTE_NAV: SidebarItem[] = [
  { label: 'Dashboard', href: '/aicte/dashboard', icon: 'dashboard' },
  { label: 'Institutions', href: '/aicte/institutions', icon: 'account_balance' },
  { label: 'Approval Management', href: '/aicte/approvals', icon: 'fact_check' },
  { label: 'Courses & Intake', href: '/aicte/courses', icon: 'school' },
  { label: 'Compliance', href: '/aicte/compliance', icon: 'policy' },
  { label: 'Analytics & Reports', href: '/aicte/analytics', icon: 'analytics' },
  { label: 'Notifications', href: '/aicte/notifications', icon: 'notifications' },
  { label: 'Audit Logs', href: '/aicte/audit', icon: 'receipt_long' },
];

interface AicteNotification {
  id: number;
  is_read: boolean;
}

export default function AicteLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isLoginPage = pathname === '/aicte/login';
  const authorized = role === 'aicte_admin';

  useEffect(() => {
    if (!isLoginPage && !isLoading && (!user || !authorized)) {
      router.replace('/aicte/login');
    }
  }, [authorized, isLoading, isLoginPage, router, user]);

  useEffect(() => {
    if (authorized && !isLoginPage) {
      api.aicte.notifications()
        .then((notifications: AicteNotification[]) => {
          setUnreadCount(notifications.filter((item) => !item.is_read).length);
        })
        .catch((error: Error) => console.error('Failed to load AICTE notifications', error));
    }
  }, [authorized, isLoginPage, pathname]);

  if (isLoginPage) return <>{children}</>;

  if (isLoading || !user || !authorized) {
    return <div className="min-h-screen bg-surface"><LoadingState label="Authorising AICTE administration portal..." /></div>;
  }

  const nav = AICTE_NAV.map((item) =>
    item.href === '/aicte/notifications' && unreadCount > 0
      ? { ...item, badge: unreadCount }
      : item
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <StitchHeader titleSuffix="AICTE Administration" onMenuClick={() => setMenuOpen(true)} />
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        <PortalSidebar items={nav} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-lg border border-border text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary-container">account_balance</span>
              <span className="font-medium text-heading">AICTE oversight portal</span>
              <span className="font-mono text-primary-container bg-lavender px-2 py-0.5 rounded">National view · Demo</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">{user.name || 'AICTE Administrator'}</span>
              <DemoBadge />
            </div>
          </div>
          <div className="mb-6 rounded-lg border border-pending/20 bg-pending-bg px-4 py-3 text-sm text-body">
            Synthetic demonstration data only. This portal is not connected to official AICTE systems.
          </div>
          {children}
        </main>
      </div>
      <CitizenSupportFab />
      <StitchFooter />
    </div>
  );
}
