'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import { api } from '@/lib/api';
import { EmptyState, PageHeader, ProgressBar, StatusBadge, StatCard } from '@/components/ui';

interface InstitutionOverview {
  profile: {
    institution_id: string;
    display_name: string;
    institution_type: string;
    ownership: string;
    affiliating_body: string;
    approval_status: string;
  };
  location: {
    address_line: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    region: string;
    latitude: number | null;
    longitude: number | null;
  };
  key_dates: {
    established_year: number;
    registered_with_aicte_date: string;
    approval_valid_from: string;
    approval_valid_until: string;
    last_inspection_date: string;
  };
  study_model: {
    study_modes: string[];
    medium_of_instruction: string;
    academic_structure: string;
    programme_levels: string[];
    abc_integration: boolean;
    facilities_summary: string;
  };
  limits: {
    total_approved_intake: number;
    maximum_permitted_intake: number;
    current_enrolled: number;
    utilisation_pct: number;
    programme_intakes: Array<{
      programme: string;
      department: string;
      programme_level: string;
      approved_intake: number;
    }>;
    approval_conditions: string;
  };
  departments: Array<{
    department_name: string;
    programmes: string[];
    hod_role_label: string;
    approved_intake: number;
    enrolled: number;
    faculty_count: number;
    established_year: number;
  }>;
  outcomes: Array<{
    academic_year: string;
    graduates: number;
    pass_percentage: number;
    placement_percentage: number;
  }>;
  passouts_last_year: number;
  ranking: {
    year: number;
    demo_rank: number;
    category: string;
    score: number;
    previous_year_rank: number | null;
    rank_change: number | null;
  } | null;
  compliance_snapshot: { pending: number; submitted: number; overdue: number };
  recent_decisions: Array<{
    activity: string;
    administrator: string;
    action: string;
    timestamp: string;
  }>;
  synthetic_notice: string;
}

type DepartmentSortKey = 'department_name' | 'approved_intake' | 'enrolled' | 'faculty_count';

const dateLabel = (value: string) => new Date(`${value}T00:00:00`).toLocaleDateString();

function OverviewSkeleton() {
  return (
    <div aria-label="Loading institution overview" className="space-y-6 animate-pulse">
      <div className="h-24 rounded-xl bg-lavender" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-28 rounded-xl bg-lavender" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-64 rounded-xl bg-lavender" />)}
      </div>
    </div>
  );
}

export default function AicteInstitutionOverviewPage() {
  const params = useParams<{ id: string }>();
  const institutionId = Number(params.id);
  const [overview, setOverview] = useState<InstitutionOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [backHref, setBackHref] = useState('/aicte/institutions');
  const [sortKey, setSortKey] = useState<DepartmentSortKey>('department_name');
  const [sortAscending, setSortAscending] = useState(true);
  const invalidInstitutionId = !Number.isInteger(institutionId) || institutionId < 1;

  useEffect(() => {
    const origin = new URLSearchParams(window.location.search).get('from');
    const backRoutes: Record<string, string> = {
      dashboard: '/aicte/dashboard',
      approvals: '/aicte/approvals',
      courses: '/aicte/courses',
      compliance: '/aicte/compliance',
      directory: '/aicte/institutions',
    };
    if (origin && backRoutes[origin]) {
      const timer = window.setTimeout(() => setBackHref(backRoutes[origin]), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (invalidInstitutionId) return;
    api.aicte.institutionOverview(institutionId)
      .then((result: InstitutionOverview) => setOverview(result))
      .catch((loadError: Error) => setError(loadError.message || 'Unable to load institution overview.'))
      .finally(() => setLoading(false));
  }, [institutionId, invalidInstitutionId]);

  const sortedDepartments = useMemo(() => {
    const rows = [...(overview?.departments || [])];
    return rows.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const comparison = typeof left === 'string'
        ? left.localeCompare(String(right))
        : left - Number(right);
      return sortAscending ? comparison : -comparison;
    });
  }, [overview?.departments, sortAscending, sortKey]);

  const sortBy = (key: DepartmentSortKey) => {
    if (key === sortKey) setSortAscending((current) => !current);
    else {
      setSortKey(key);
      setSortAscending(true);
    }
  };

  if (invalidInstitutionId) {
    return (
      <div className="space-y-5">
        <PageHeader kicker="AICTE institution overview" title="Institution not found" />
        <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-4 text-sm text-rejected">Institution not found.</div>
        <Link href="/aicte/institutions" className="btn-secondary inline-flex h-10 items-center px-4 text-sm">Back to directory</Link>
      </div>
    );
  }
  if (loading) return <OverviewSkeleton />;
  if (error || !overview) {
    const notFound = /not found/i.test(error);
    return (
      <div className="space-y-5">
        <PageHeader kicker="AICTE institution overview" title={notFound ? 'Institution not found' : 'Overview unavailable'} />
        <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-4 text-sm text-rejected">
          {error || 'Institution overview could not be loaded.'}
        </div>
        <Link href="/aicte/institutions" className="btn-secondary inline-flex h-10 items-center px-4 text-sm">Back to directory</Link>
      </div>
    );
  }

  const { profile, location, key_dates: dates, study_model: study, limits, ranking, compliance_snapshot: compliance } = overview;
  const statusLabel = profile.approval_status.replaceAll('_', ' ');
  const factItems = [
    { label: 'Established', value: dates.established_year },
    { label: 'Registered with AICTE', value: dateLabel(dates.registered_with_aicte_date) },
    { label: 'Approval valid until', value: dateLabel(dates.approval_valid_until) },
    { label: 'Location', value: `${location.city}, ${location.state}` },
    { label: 'Departments', value: overview.departments.length },
    { label: 'Approved intake', value: limits.total_approved_intake.toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/aicte/dashboard" className="rounded-sm text-primary-container hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container">Dashboard</Link>
        <span className="px-2">›</span>
        <Link href="/aicte/institutions" className="rounded-sm text-primary-container hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container">Institution directory</Link>
        <span className="px-2">›</span>
        <span aria-current="page" className="text-heading">{profile.display_name}</span>
      </p>

      <div className="rounded-lg border border-pending/20 bg-pending-bg px-4 py-3 text-sm font-medium text-body">
        {overview.synthetic_notice}
      </div>

      <PageHeader
        kicker={`Institution ID · ${profile.institution_id}`}
        title={profile.display_name}
        description={`${profile.institution_type} · ${profile.ownership} · Affiliating body: ${profile.affiliating_body}`}
        actions={<>
          <StatusBadge status={statusLabel} />
          <span className="rounded-full border border-border bg-lavender px-3 py-1 text-xs font-medium text-heading">{profile.institution_type}</span>
          <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-body">{profile.ownership}</span>
          {ranking && <span className="rounded-full border border-border bg-lavender px-3 py-1 text-xs font-medium text-primary-container">Demo ranking (synthetic) · #{ranking.demo_rank}</span>}
          <Link href={backHref} className="btn-secondary inline-flex h-10 items-center px-4 text-sm">Back</Link>
          <Link href="/aicte/institutions" className="btn-secondary inline-flex h-10 items-center px-4 text-sm">Back to directory</Link>
        </>}
      />

      <section aria-label="Institution key facts" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {factItems.map((item) => (
          <div key={item.label} className="stitch-card min-w-0 p-4">
            <p className="text-xs font-medium text-muted">{item.label}</p>
            <p className="mt-2 break-words font-serif text-lg text-heading">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="stitch-card p-5">
          <h2 className="font-serif text-xl text-heading">Location</h2>
          <div className="mt-4 flex gap-3 rounded-lg border border-border bg-lavender p-4">
            <span className="material-symbols-outlined text-primary-container" aria-hidden="true">location_on</span>
            <div className="min-w-0">
              <p className="font-medium text-heading">{location.address_line}</p>
              <p className="mt-1 text-sm text-body">{location.city}, {location.district}, {location.state} {location.pincode}</p>
              <p className="mt-2 text-sm text-muted">{location.region} region</p>
              {location.latitude !== null && location.longitude !== null && (
                <p className="mt-2 text-xs text-muted">Map pin: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <p><span className="text-muted">Approval valid from: </span>{dateLabel(dates.approval_valid_from)}</p>
            <p><span className="text-muted">Last inspection: </span>{dateLabel(dates.last_inspection_date)}</p>
          </div>
        </section>

        <section className="stitch-card p-5">
          <h2 className="font-serif text-xl text-heading">How students study</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {study.study_modes.map((mode) => <span key={mode} className="rounded-full border border-border bg-lavender px-3 py-1 text-sm text-body">{mode}</span>)}
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">Medium of instruction</dt><dd className="mt-1 font-medium text-heading">{study.medium_of_instruction}</dd></div>
            <div><dt className="text-muted">Academic structure</dt><dd className="mt-1 font-medium text-heading">{study.academic_structure}</dd></div>
            <div><dt className="text-muted">Programme levels</dt><dd className="mt-1 font-medium text-heading">{study.programme_levels.join(', ') || 'Not reported'}</dd></div>
            <div><dt className="text-muted">ABC integration</dt><dd className="mt-1 font-medium text-heading">{study.abc_integration ? 'Supported' : 'Not reported'}</dd></div>
          </dl>
          <p className="mt-4 rounded-lg border border-border bg-white p-3 text-sm leading-6 text-body"><span className="font-medium text-heading">Facilities: </span>{study.facilities_summary || 'Facilities summary not reported.'}</p>
        </section>
      </div>

      <section className="stitch-card p-5 space-y-4">
        <div>
          <h2 className="font-serif text-xl text-heading">Limits and capacity</h2>
          <p className="mt-1 text-sm text-muted">Institution-level approved capacity and current aggregate enrolment.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Approved intake" value={limits.total_approved_intake.toLocaleString()} icon="groups" />
          <StatCard label="Currently enrolled" value={limits.current_enrolled.toLocaleString()} icon="school" />
          <StatCard label="Maximum permitted" value={limits.maximum_permitted_intake.toLocaleString()} icon="rule" />
        </div>
        <div>
          <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm"><span className="font-medium text-heading">Utilisation</span><span className="text-muted">{limits.utilisation_pct}%</span></div>
          <ProgressBar percent={limits.utilisation_pct} />
        </div>
        <h3 className="font-medium text-heading">Approved intake per programme</h3>
        {limits.programme_intakes.length ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="data-table min-w-[560px]">
              <thead><tr><th>Programme</th><th>Department</th><th>Level</th><th>Approved intake</th></tr></thead>
              <tbody>{limits.programme_intakes.map((item) => (
                <tr key={`${item.department}-${item.programme}`}><td>{item.programme}</td><td>{item.department}</td><td>{item.programme_level}</td><td>{item.approved_intake}</td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState title="No programme intake records" body="Programme-level approved intake has not been reported." />}
        <div className="rounded-lg border border-pending/30 bg-pending-bg p-4 text-sm text-body">
          <p className="font-medium text-heading">Approval conditions and restrictions</p>
          <p className="mt-1">{limits.approval_conditions || 'No conditions have been recorded in this synthetic profile.'}</p>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-serif text-xl text-heading">Departments</h2>
          <p className="text-sm text-muted">Select a column heading to sort. Department and programme totals are institution-level aggregates.</p>
        </div>
        <div className="stitch-card overflow-x-auto">
          <table className="data-table min-w-[760px]">
            <thead><tr>
              {([
                ['department_name', 'Department'],
                ['approved_intake', 'Approved intake'],
                ['enrolled', 'Enrolled'],
                ['faculty_count', 'Faculty count'],
              ] as Array<[DepartmentSortKey, string]>).map(([key, label]) => (
                <th key={key} aria-sort={sortKey === key ? (sortAscending ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" onClick={() => sortBy(key)} className="rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container">
                    {label}{sortKey === key ? (sortAscending ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
              ))}
              <th>Programme(s)</th><th>HoD role</th>
            </tr></thead>
            <tbody>{sortedDepartments.length ? sortedDepartments.map((department) => (
              <tr key={department.department_name}>
                <td>{department.department_name}<span className="block text-xs text-muted">Established {department.established_year}</span></td>
                <td>{department.approved_intake}</td><td>{department.enrolled}</td><td>{department.faculty_count}</td>
                <td>{department.programmes.join(', ')}</td><td>{department.hod_role_label}</td>
              </tr>
            )) : <tr><td colSpan={6} className="py-8 text-center text-muted">No department records reported.</td></tr>}</tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="stitch-card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="font-serif text-xl text-heading">Institution outcomes</h2><p className="text-sm text-muted">Synthetic passouts, pass percentage, and placement percentage.</p></div>
            <div className="w-full sm:w-56"><StatCard label="Passouts last year" value={overview.passouts_last_year.toLocaleString()} hint={overview.outcomes[overview.outcomes.length - 1]?.academic_year || 'Latest completed year'} icon="school" /></div>
          </div>
          {overview.outcomes.length ? (
            <div className="mt-4 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={overview.outcomes} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E1F0" />
                  <XAxis dataKey="academic_year" tick={{ fontSize: 12, fill: '#6B6B7B' }} />
                  <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 12, fill: '#6B6B7B' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#6B6B7B' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="graduates" name="Passouts" fill="#2D2A6E" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="pass_percentage" name="Pass %" stroke="#5A4FCF" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="placement_percentage" name="Placement %" stroke="#1B7A3E" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState title="No outcome history" body="Yearly outcome data is not available for this institution." />}
        </section>

        <section className="stitch-card p-5">
          <h2 className="font-serif text-xl text-heading">Demo ranking</h2>
          <p className="mt-1 text-sm text-muted">Synthetic comparison only; not an official ranking.</p>
          {ranking ? (
            <div className="mt-4 space-y-3">
              <p className="font-serif text-3xl text-heading">#{ranking.demo_rank}</p>
              <p className="text-sm text-body">{ranking.category} · {ranking.year}</p>
              <p className="text-sm text-muted">Synthetic score: {ranking.score.toFixed(1)}</p>
              <p className="rounded-lg border border-border bg-lavender p-3 text-sm text-heading">
                {ranking.rank_change === null ? 'No previous-year comparison.' : ranking.rank_change > 0
                  ? `↑ Improved by ${ranking.rank_change} places since ${ranking.year - 1}`
                  : ranking.rank_change < 0
                    ? `↓ Moved down ${Math.abs(ranking.rank_change)} places since ${ranking.year - 1}`
                    : `→ No change since ${ranking.year - 1}`}
                {ranking.previous_year_rank !== null && <span className="block text-xs text-muted">Previous demo rank: #{ranking.previous_year_rank}</span>}
              </p>
            </div>
          ) : <EmptyState title="No demo ranking" body="A synthetic ranking has not been recorded." />}
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="stitch-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-serif text-xl text-heading">Compliance snapshot</h2><p className="text-sm text-muted">Counts are sourced from this institution’s compliance submissions.</p></div>
            <Link href={`/aicte/compliance?institution_id=${institutionId}`} className="rounded-sm text-sm font-medium text-primary-container hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container">View reports</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Pending" value={compliance.pending} icon="pending_actions" />
            <StatCard label="Submitted" value={compliance.submitted} icon="task_alt" />
            <StatCard label="Overdue" value={compliance.overdue} icon="event_busy" />
          </div>
        </section>

        <section className="stitch-card p-5">
          <h2 className="font-serif text-xl text-heading">Recent decisions</h2>
          <p className="mt-1 text-sm text-muted">AICTE application and compliance review activity.</p>
          {overview.recent_decisions.length ? (
            <ol className="mt-4 space-y-4">
              {overview.recent_decisions.map((decision, index) => (
                <li key={`${decision.timestamp}-${index}`} className="relative border-l-2 border-border pb-1 pl-4">
                  <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-primary-container" />
                  <p className="text-sm font-medium text-heading">{decision.activity.replaceAll('_', ' ')}</p>
                  <p className="mt-1 text-sm text-body">{decision.action}</p>
                  <p className="mt-1 text-xs text-muted">{decision.administrator} · {new Date(decision.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ol>
          ) : <div className="mt-4"><EmptyState title="No decisions recorded" body="Review decisions for this institution will appear here." /></div>}
        </section>
      </div>
    </div>
  );
}
