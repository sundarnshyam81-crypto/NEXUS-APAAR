'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api';
import { EmptyState, LoadingState, PageHeader, StatCard, StatusBadge } from '@/components/ui';
import AicteTable from '@/components/aicte/AicteTable';

interface DashboardData {
  data_notice: string;
  metrics: {
    total_institutions: number;
    approved_institutions: number;
    pending_applications: number;
    rejected_applications: number;
    approved_courses: number;
    approved_intake: number;
    pending_compliance: number;
    overdue_compliance: number;
  };
  state_distribution: Array<{ state: string; institutions: number }>;
  recent_applications: Array<{ id: number; application_id: string; institution: { name: string; state: string }; status: string; submission_date: string }>;
  pending_requests: Array<{ id: number; application_id: string; institution: { name: string; state: string }; status: string; submission_date: string }>;
  notifications: Array<{ id: number; title: string; message: string; notification_type: string }>;
}

const CHART_COLORS = ['#2D2A6E', '#5A4FCF', '#A39CD8', '#1B7A3E', '#F26B2A'];

export default function AicteDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.aicte.dashboard()
      .then((result: DashboardData) => setData(result))
      .catch((error: Error) => console.error('Failed to load AICTE dashboard', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading AICTE oversight dashboard..." />;
  if (!data) return <EmptyState title="Dashboard unavailable" body="AICTE demo metrics could not be loaded. Check the backend connection and try again." />;

  const metrics = data.metrics;
  const applicationRows = data.pending_requests.map((application) => ({
    id: application.id,
    application: <span className="font-mono text-primary-container">{application.application_id}</span>,
    institution: application.institution.name,
    state: application.institution.state,
    submitted: application.submission_date ? new Date(application.submission_date).toLocaleDateString() : '—',
    status: <StatusBadge status={application.status} />,
    review: <Link href="/aicte/approvals" className="text-primary-container font-medium hover:underline">Review</Link>,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="National institutional oversight · synthetic demo data"
        title="AICTE Administration Dashboard"
        description="Monitor institution approvals, approved programme capacity, and institutional compliance submissions."
        actions={<Link href="/aicte/institutions" className="btn-secondary h-10 text-sm">Institution directory</Link>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Registered institutions" value={metrics.total_institutions} hint="Synthetic institutions in this demo" icon="account_balance" />
        <StatCard label="Approved institutions" value={metrics.approved_institutions} hint="Current approval status" icon="verified" />
        <StatCard label="Pending applications" value={metrics.pending_applications} hint={`${metrics.rejected_applications} rejected applications`} icon="pending_actions" />
        <StatCard label="Approved courses" value={metrics.approved_courses} hint={`${metrics.approved_intake.toLocaleString()} approved intake seats`} icon="school" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Pending compliance reports" value={metrics.pending_compliance} hint={`${metrics.overdue_compliance} overdue submissions`} icon="policy" />
        <StatCard label="Approved intake" value={metrics.approved_intake.toLocaleString()} hint="Across approved demo courses" icon="groups" accent="white" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="stitch-card p-5 space-y-4">
          <div>
            <h2 className="font-serif text-xl text-heading">State-wise institution distribution</h2>
            <p className="text-sm text-muted">Count of synthetic institutions by state.</p>
          </div>
          <div className="h-[280px]">
            {data.state_distribution.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.state_distribution} margin={{ top: 8, right: 12, bottom: 24, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E1F0" />
                  <XAxis dataKey="state" angle={-20} textAnchor="end" interval={0} height={56} tick={{ fontSize: 11, fill: '#6B6B7B' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B6B7B' }} />
                  <Tooltip />
                  <Bar dataKey="institutions" name="Institutions" fill="#2D2A6E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="py-16 text-center text-sm text-muted">No state distribution data.</p>}
          </div>
        </section>

        <section className="stitch-card p-5 space-y-4">
          <div>
            <h2 className="font-serif text-xl text-heading">Institution approval status</h2>
            <p className="text-sm text-muted">Current approval states across the demo directory.</p>
          </div>
          <div className="h-[280px]">
            {data.recent_applications.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: 'Approved', value: metrics.approved_institutions },
                    { name: 'Pending / review', value: metrics.pending_applications },
                    { name: 'Rejected', value: metrics.rejected_applications },
                  ].filter((item) => item.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={92} label>
                    {CHART_COLORS.slice(0, 3).map((color, index) => <Cell key={color} fill={color} name={String(index)} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="py-16 text-center text-sm text-muted">No approval data.</p>}
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl text-heading">Pending institutional requests</h2>
            <p className="text-sm text-muted">Applications awaiting AICTE administrator review.</p>
          </div>
          <Link href="/aicte/approvals" className="text-sm text-primary-container hover:underline">View all</Link>
        </div>
        <AicteTable columns={[
          { key: 'application', label: 'Application ID' },
          { key: 'institution', label: 'Institution' },
          { key: 'state', label: 'State' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'status', label: 'Status' },
          { key: 'review', label: 'Action' },
        ]} rows={applicationRows} rowKey="id" />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="stitch-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-heading">Recent approval activity</h2>
            <Link href="/aicte/approvals" className="text-sm text-primary-container hover:underline">Applications</Link>
          </div>
          {data.recent_applications.length ? data.recent_applications.slice(0, 4).map((application) => (
            <div key={application.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border last:border-0 pb-3 last:pb-0">
              <div>
                <p className="font-medium text-heading">{application.institution.name}</p>
                <p className="text-xs text-muted">{application.application_id} · {application.submission_date ? new Date(application.submission_date).toLocaleDateString() : 'Date unavailable'}</p>
              </div>
              <StatusBadge status={application.status} />
            </div>
          )) : <p className="text-sm text-muted">No approval activity yet.</p>}
        </section>
        <section className="stitch-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-heading">Notifications</h2>
            <Link href="/aicte/notifications" className="text-sm text-primary-container hover:underline">View all</Link>
          </div>
          {data.notifications.length ? data.notifications.map((notification) => (
            <div key={notification.id} className="rounded-lg border border-border bg-lavender p-3">
              <p className="font-medium text-heading text-sm">{notification.title}</p>
              <p className="mt-1 text-sm text-muted">{notification.message}</p>
            </div>
          )) : <p className="text-sm text-muted">No notifications.</p>}
        </section>
      </div>
    </div>
  );
}
