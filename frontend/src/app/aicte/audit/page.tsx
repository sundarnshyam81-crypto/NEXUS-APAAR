'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EmptyState, LoadingState, PageHeader } from '@/components/ui';
import AicteTable from '@/components/aicte/AicteTable';

interface AuditEvent {
  id: number;
  administrator: string;
  activity: string;
  institution: string | null;
  action: string;
  timestamp: string;
}

export default function AicteAuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.aicte.audit()
      .then((result: { events: AuditEvent[]; total: number }) => {
        setEvents(result.events);
        setTotal(result.total);
      })
      .catch((loadError: Error) => setError(loadError.message || 'Unable to load audit history.'))
      .finally(() => setLoading(false));
  }, []);

  const rows = events.map((event) => ({
    id: event.id,
    administrator: event.administrator,
    activity: event.activity.replaceAll('_', ' '),
    institution: event.institution || '—',
    action: event.action,
    timestamp: event.timestamp ? new Date(event.timestamp).toLocaleString() : '—',
  }));

  return (
    <div className="space-y-6">
      <PageHeader kicker={`${total} recorded administrative action(s)`} title="AICTE Audit Logs" description="Decision and compliance review events recorded with administrator identity, institution, action, and timestamp." />
      <div className="rounded-lg border border-border bg-lavender p-4 text-sm text-body">
        Actions performed in the AICTE portal are recorded separately from college-portal audit history.
      </div>
      {error && <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-3 text-sm text-rejected">{error}</div>}
      {loading ? <LoadingState label="Loading AICTE audit logs..." /> : events.length ? (
        <AicteTable columns={[
          { key: 'timestamp', label: 'Timestamp' },
          { key: 'administrator', label: 'Administrator' },
          { key: 'activity', label: 'Activity' },
          { key: 'institution', label: 'Institution' },
          { key: 'action', label: 'Action performed' },
        ]} rows={rows} rowKey="id" />
      ) : <EmptyState title="No audit events yet" body="Recorded AICTE application and compliance decisions will appear here." />}
    </div>
  );
}
