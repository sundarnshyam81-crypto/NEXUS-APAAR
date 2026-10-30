'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import StitchHeader from '@/components/StitchHeader';
import StitchFooter from '@/components/StitchFooter';
import CitizenSupportFab from '@/components/CitizenSupportFab';
import DemoBadge from '@/components/DemoBadge';
import { PortalSidebar, STUDENT_NAV } from '@/components/PortalSidebar';
import { LoadingState } from '@/components/ui';
import { api } from '@/lib/api';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginPage = pathname === '/student/login';

  useEffect(() => {
    if (!isLoginPage && !isLoading && (!user || role !== 'student')) {
      router.push('/student/login');
    }
  }, [user, role, isLoading, isLoginPage, router]);

  useEffect(() => {
    if (user && role === 'student' && !isLoginPage) {
      api.student.notifications().then((notifs: NotificationItem[]) => {
        if (Array.isArray(notifs)) {
          setUnreadCount(notifs.filter((n) => !n.is_read).length);
        }
      }).catch(() => {});
    }
  }, [user, role, pathname, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-surface">
        <LoadingState label="Loading student session..." />
      </div>
    );
  }

  const nav = STUDENT_NAV.map((item) =>
    item.href === '/student/notifications' && unreadCount > 0
      ? { ...item, badge: unreadCount }
      : item
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <StitchHeader titleSuffix="Student Portal" unreadCount={unreadCount} onMenuClick={() => setMenuOpen(true)} />
      <div className="flex flex-1 w-full max-w-[1440px] mx-auto">
        <PortalSidebar items={nav} open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-lg border border-border text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-approved">verified</span>
              <span className="font-medium text-heading">APAAR ID</span>
              <span className="font-mono text-primary-container bg-lavender px-2 py-0.5 rounded">
                {user.demo_id || '900000000001'}
              </span>
              <span className="hidden sm:inline text-muted">| {user.name} ({user.department || 'Student'})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">ABC: <strong className="text-heading">{user.abc_account_id || 'ABC-IND-2026'}</strong></span>
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
