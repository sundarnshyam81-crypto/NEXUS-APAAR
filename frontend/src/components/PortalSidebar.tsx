'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export const STUDENT_NAV: SidebarItem[] = [
  { label: 'Dashboard', href: '/student/dashboard', icon: 'dashboard' },
  { label: 'My Profile', href: '/student/profile', icon: 'person' },
  { label: 'Admission Status', href: '/student/admission-status', icon: 'assignment_turned_in' },
  { label: 'Academic Credits', href: '/student/credits', icon: 'school' },
  { label: 'Credit Transfer', href: '/student/credit-transfer', icon: 'swap_horiz' },
  { label: 'Privacy Verification', href: '/student/verification', icon: 'verified_user' },
  { label: 'Notifications', href: '/student/notifications', icon: 'notifications' },
];

export const ADMIN_NAV: SidebarItem[] = [
  { label: 'Overview', href: '/admin/overview', icon: 'dashboard' },
  { label: 'Student Directory', href: '/admin/students', icon: 'groups' },
  { label: 'Admission Management', href: '/admin/admissions', icon: 'how_to_reg' },
  { label: 'Privacy Verification', href: '/admin/verification', icon: 'verified_user' },
  { label: 'Seat Capacity', href: '/admin/capacity', icon: 'pie_chart' },
  { label: 'Credit Management', href: '/admin/credits', icon: 'swap_horiz' },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: 'analytics' },
  { label: 'Audit Logs', href: '/admin/audit', icon: 'receipt_long' },
  { label: 'Settings', href: '/admin/settings', icon: 'tune' },
];

export function PortalSidebar({
  items,
  open,
  onClose,
}: {
  items: SidebarItem[];
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#1a1a2d]/30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 lg:top-0 z-50 lg:z-20 h-full lg:h-[calc(100vh-4.5rem)] w-64 shrink-0 bg-white border-r border-border overflow-y-auto transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } left-0`}
      >
        <nav className="p-4 space-y-1" aria-label="Portal navigation">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                  active
                    ? 'bg-white text-primary border border-border font-medium shadow-[0_1px_2px_rgba(45,42,110,0.06)]'
                    : 'text-on-surface-variant hover:bg-nav hover:text-primary'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${active ? 'text-primary-container' : 'text-outline'}`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary-container text-white text-[11px] font-semibold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
