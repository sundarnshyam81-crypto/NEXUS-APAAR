'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';
import { LoadingState, PageHeader } from '@/components/ui';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  related_request_id: string | null;
  created_at: string;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = () => {
    api.student.notifications()
      .then((data: NotificationItem[]) => setNotifications(data || []))
      .catch((err: Error) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.student.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => api.student.markRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingState label="Loading notifications..." />;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Inbox"
        title="Notifications"
        description="Admission updates, credit-transfer notices, verification messages and administrative alerts."
        actions={
          <>
            <DemoBadge />
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="btn-secondary h-10 text-sm">
                Mark all as read ({unreadCount})
              </button>
            )}
          </>
        }
      />

      {/* Main Inbox Card */}
      <div className="stitch-card p-6 md:p-8 space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-[#171258] text-white shadow-sm'
                  : 'bg-[#EFEEFB] text-[#4E4870] hover:bg-[#E3E1F0]'
              }`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                filter === 'unread'
                  ? 'bg-[#171258] text-white shadow-sm'
                  : 'bg-[#EFEEFB] text-[#4E4870] hover:bg-[#E3E1F0]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <span className="text-xs text-[#6B6590]">Showing {filteredNotifications.length} items</span>
        </div>

        {/* List of Notifications */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  n.is_read
                    ? 'bg-white border-[#E3E1F0] opacity-80'
                    : 'bg-[#F0EEFC]/70 border-[#171258]/30 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E3E1F0] flex items-center justify-center shrink-0 mt-0.5 text-[#171258]">
                    <span className="material-symbols-outlined text-[20px]">
                      {n.notification_type === 'success'
                        ? 'check_circle'
                        : n.notification_type === 'error'
                        ? 'error'
                        : n.notification_type === 'warning'
                        ? 'warning'
                        : 'notifications'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-xs text-[#171258]">{n.title}</h4>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#F26B2A]"></span>
                      )}
                      {n.related_request_id && (
                        <span className="font-mono text-[10px] bg-[#EFEEFB] text-[#2D2A6E] px-1.5 py-0.5 rounded">
                          #{n.related_request_id}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#4E4870] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-[#6B6590] block pt-0.5 font-mono">
                      {n.created_at?.slice(0, 19).replace('T', ' ')}
                    </span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="self-end sm:self-auto shrink-0 px-3 py-1 rounded-md bg-white border border-[#E3E1F0] text-[11px] font-semibold text-[#171258] hover:bg-[#EFEEFB] shadow-xs transition-all"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#6B6590] space-y-2">
              <span className="material-symbols-outlined text-[36px] text-[#8B85B0]">mark_email_read</span>
              <p className="text-xs">No notifications found in this view.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
