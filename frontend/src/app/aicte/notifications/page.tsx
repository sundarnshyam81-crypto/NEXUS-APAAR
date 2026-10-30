'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/ui';

interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export default function AicteNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readingId, setReadingId] = useState<number | null>(null);

  useEffect(() => {
    api.aicte.notifications()
      .then((result: Notification[]) => setNotifications(result))
      .catch((loadError: Error) => setError(loadError.message || 'Unable to load notifications.'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    setReadingId(id);
    setError('');
    try {
      await api.aicte.markNotificationRead(id);
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, is_read: true } : item));
    } catch (readError) {
      setError((readError as Error).message || 'Unable to update notification.');
    } finally {
      setReadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader kicker="Administrative updates" title="Notifications" description="New application activity, approval changes, compliance reminders, and demo environment notices." />
      {error && <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-3 text-sm text-rejected">{error}</div>}
      {loading ? <LoadingState label="Loading AICTE notifications..." /> : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article key={notification.id} className={`stitch-card p-5 ${notification.is_read ? '' : 'border-l-4 border-l-primary-container'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary-container">{notification.notification_type === 'compliance' ? 'policy' : notification.notification_type === 'approval' ? 'fact_check' : 'notifications'}</span>
                  <div><h2 className="font-medium text-heading">{notification.title}</h2><p className="mt-1 text-sm text-body">{notification.message}</p><p className="mt-2 text-xs text-muted">{notification.created_at ? new Date(notification.created_at).toLocaleString() : 'Date unavailable'}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={notification.is_read ? 'completed' : 'pending'} />
                  {!notification.is_read && <button onClick={() => void markRead(notification.id)} disabled={readingId === notification.id} className="btn-secondary h-9 px-3 text-xs">{readingId === notification.id ? 'Saving...' : 'Mark read'}</button>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No notifications" body="There are no administrative notifications to display." />}
    </div>
  );
}
