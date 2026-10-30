'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: number | string;
}

interface StitchSubNavProps {
  items?: NavItem[];
  unreadCount?: number;
}

const PUBLIC_NAV: NavItem[] = [
  { label: 'Home', href: '/', icon: 'home' },
  { label: 'Student Login', href: '/student/login', icon: 'person' },
  { label: 'College Admin', href: '/admin/login', icon: 'corporate_fare' },
  { label: 'AICTE Admin', href: '/aicte/login', icon: 'account_balance' },
];

export function StitchSubNav({ items, unreadCount }: StitchSubNavProps) {
  const pathname = usePathname();
  const navList = (items || PUBLIC_NAV).map((item) => {
    if (item.href === '/student/notifications' && unreadCount && unreadCount > 0) {
      return { ...item, badge: unreadCount };
    }
    return item;
  });

  return (
    <div className="w-full bg-nav border-b border-border">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center">
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full">
          {navList.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm whitespace-nowrap flex items-center gap-1.5 rounded-md ${
                  isActive
                    ? 'bg-white text-primary font-medium border border-border'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {item.icon && (
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-primary' : 'text-outline'}`}>
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary-container text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default StitchSubNav;
