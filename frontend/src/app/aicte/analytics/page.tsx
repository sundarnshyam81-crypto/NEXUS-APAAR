'use client';

import React, { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '@/lib/api';
import { EmptyState, LoadingState, PageHeader } from '@/components/ui';
import AicteTable from '@/components/aicte/AicteTable';

interface AnalyticsData {
  state_distribution: Array<{ state: string; institutions: number }>;
  institution_status: Array<{ status: string; count: number }>;
  course_distribution: Array<{ programme_level: string; courses: number }>;
  approved_intake_by_state: Array<{ state: string; intake: number }>;
  approval_trend: Array<{ month: string; applications: number }>;
}

const COLORS = ['#2D2A6E', '#5A4FCF', '#A39CD8', '#1B7A3E', '#F26B2A'];

export default function AicteAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.aicte.analytics()
      .then((result: AnalyticsData) => setData(result))
      .catch((loadError: Error) => setError(loadError.message || 'Unable to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading AICTE analytics..." />;
  if (error) return <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-3 text-sm text-rejected">{error}</div>;
  if (!data) return <EmptyState title="Analytics unavailable" body="Analytics data could not be loaded." />;

  const statusRows = data.institution_status.map((item) => ({
    status: item.status.replace('_', ' '),
    institutions: item.count,
  }));
  const intakeRows = data.approved_intake_by_state.map((item) => ({
    state: item.state,
    approved_intake: item.intake,
  }));

  return (
    <div className="space-y-6">
      <PageHeader kicker="Synthetic aggregate reporting" title="Analytics & Reports" description="Explore institution distribution, approval outcomes, approved course capacity, and application trends." />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="stitch-card p-5 space-y-4">
          <div><h2 className="font-serif text-xl text-heading">State-wise institution distribution</h2><p className="text-sm text-muted">Registered demo institutions by state.</p></div>
          <div className="h-[300px]">
            {data.state_distribution.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data.state_distribution} margin={{ bottom: 24, left: 0, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E1F0" /><XAxis dataKey="state" angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 11, fill: '#6B6B7B' }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="institutions" name="Institutions" fill="#2D2A6E" radius={[4, 4, 0, 0]} />
            </BarChart></ResponsiveContainer> : <p className="pt-20 text-center text-sm text-muted">No state distribution data.</p>}
          </div>
        </section>
        <section className="stitch-card p-5 space-y-4">
          <div><h2 className="font-serif text-xl text-heading">Approved vs pending institutions</h2><p className="text-sm text-muted">Institution totals grouped by approval status.</p></div>
          <div className="h-[300px]">
            {statusRows.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={statusRows} dataKey="institutions" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
              {statusRows.map((entry, index) => <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />)}
            </Pie><Tooltip /></PieChart></ResponsiveContainer> : <p className="pt-20 text-center text-sm text-muted">No institution status data.</p>}
          </div>
        </section>
        <section className="stitch-card p-5 space-y-4">
          <div><h2 className="font-serif text-xl text-heading">Course distribution</h2><p className="text-sm text-muted">Approved course records by programme level.</p></div>
          <div className="h-[280px]">
            {data.course_distribution.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data.course_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E1F0" /><XAxis dataKey="programme_level" tick={{ fontSize: 12, fill: '#6B6B7B' }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="courses" name="Courses" fill="#5A4FCF" radius={[4, 4, 0, 0]} />
            </BarChart></ResponsiveContainer> : <p className="pt-20 text-center text-sm text-muted">No course distribution data.</p>}
          </div>
        </section>
        <section className="stitch-card p-5 space-y-4">
          <div><h2 className="font-serif text-xl text-heading">Approved intake by state</h2><p className="text-sm text-muted">Sum of approved seats in demo course records.</p></div>
          <div className="h-[280px]">
            {intakeRows.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={intakeRows} margin={{ bottom: 24, left: 0, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E1F0" /><XAxis dataKey="state" angle={-20} textAnchor="end" interval={0} height={60} tick={{ fontSize: 11, fill: '#6B6B7B' }} /><YAxis /><Tooltip /><Bar dataKey="approved_intake" name="Approved intake" fill="#1B7A3E" radius={[4, 4, 0, 0]} />
            </BarChart></ResponsiveContainer> : <p className="pt-20 text-center text-sm text-muted">No intake records.</p>}
          </div>
        </section>
      </div>
      <section className="stitch-card p-5 space-y-4">
        <div><h2 className="font-serif text-xl text-heading">Institution approval trend</h2><p className="text-sm text-muted">Applications grouped by submission month.</p></div>
        <div className="h-[280px]">
          {data.approval_trend.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data.approval_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E1F0" /><XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6B7B' }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="applications" name="Applications" fill="#2D2A6E" radius={[4, 4, 0, 0]} />
          </BarChart></ResponsiveContainer> : <p className="pt-20 text-center text-sm text-muted">No application trend data.</p>}
        </div>
        <AicteTable columns={[{ key: 'month', label: 'Submission month' }, { key: 'applications', label: 'Applications' }]} rows={data.approval_trend.map((item) => ({ ...item }))} rowKey="month" />
      </section>
    </div>
  );
}
