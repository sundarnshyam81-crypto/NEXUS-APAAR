'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { DemoBadge } from './DemoBadge';

interface StitchHeaderProps {
  portalType?: 'student' | 'admin' | 'public';
  titleSuffix?: string;
  unreadCount?: number;
  onMenuClick?: () => void;
}

export function StitchHeader({ titleSuffix, onMenuClick }: StitchHeaderProps) {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="w-full z-50 bg-header border-b border-border">
      <div className="w-full bg-surface-container-low border-b border-border px-4 sm:px-8 lg:px-12 py-1 flex items-center justify-between text-[12px] text-on-surface-variant">
        <div className="flex items-center gap-2">
          <span className="font-medium text-heading">Government of India Standard</span>
          <span className="text-outline-variant hidden sm:inline">|</span>
          <span className="hidden sm:inline">National Academic Depository & APAAR Registry</span>
        </div>
        <div className="flex items-center gap-3">
          <DemoBadge />
        </div>
      </div>

      <div className="h-16 sm:h-[72px] w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden h-10 w-10 rounded-lg border border-border bg-white text-primary-container"
              aria-label="Open navigation menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          )}
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div className="flex flex-col justify-center leading-none pr-1 shrink-0">
              <span className="text-[16px] sm:text-[18px] font-semibold text-saffron">एक राष्ट्र</span>
              <span className="text-[16px] sm:text-[18px] font-semibold text-approved">एक छात्र पहचान</span>
            </div>
          </Link>
          <div className="h-9 w-px bg-outline-variant hidden md:block" />
          <div className="hidden md:flex flex-col justify-center leading-tight min-w-0">
            <span className="text-[15px] font-medium text-heading tracking-tight">NEXUS APAAR</span>
            <span className="text-[12px] text-muted truncate">
              Student Data Management Platform
              {titleSuffix ? ` · ${titleSuffix}` : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden xl:flex items-center w-72 h-11 rounded-lg border border-input-border bg-white px-3">
            <span className="material-symbols-outlined text-outline text-[20px] mr-2">search</span>
            <input
              type="text"
              placeholder="Search services"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-muted"
            />
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-nav rounded-full border border-border">
                <div className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-medium">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-xs font-medium text-heading max-w-[140px] truncate">{user.name}</span>
                  <span className="text-[11px] text-muted font-mono">{user.demo_id || user.role}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="h-9 px-3 rounded-lg border border-border bg-white text-on-surface-variant hover:text-rejected text-sm font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/student/login" className="btn-secondary h-10 px-4 text-sm">
                Student Login
              </Link>
              <Link href="/admin/login" className="btn-primary h-10 px-4 text-sm">
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default StitchHeader;
