'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LoadingState, PageHeader, StatCard, StatusBadge } from '@/components/ui';
import AicteTable, { AicteInstitutionLink } from '@/components/aicte/AicteTable';

interface Submission {
  id: number;
  submission_id: string;
  institution: string;
  institution_pk: number;
  institution_id: string;
  state: string;
  report_type: string;
  academic_year: string;
  due_date: string;
  submitted_at: string | null;
  status: string;
  review_notes: string | null;
}

interface ComplianceData {
  submissions: Submission[];
  summary: { total: number; completed: number; pending: number; overdue: number };
}

export default function AicteCompliancePage() {
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [data, setData] = useState<ComplianceData | null>(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadCompliance = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (filter) params.status_filter = filter;
      if (search.trim()) params.search = search.trim();
      if (institutionFilter) params.institution_id = institutionFilter;
      setData(await api.aicte.compliance(params));
    } catch (loadError) {
      setError((loadError as Error).message || 'Unable to load compliance submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filterId = new URLSearchParams(window.location.search).get('institution_id') || '';
    api.aicte.compliance(filterId ? { institution_id: filterId } : undefined)
      .then((result: ComplianceData) => {
        setInstitutionFilter(filterId);
        setData(result);
      })
      .catch((loadError: Error) => setError(loadError.message || 'Unable to load compliance submissions.'))
      .finally(() => setLoading(false));
  }, []);

  const review = async (event: React.FormEvent<HTMLFormElement>, submission: Submission) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const status = String(formData.get('status') || 'under_review');
    const notes = String(formData.get('notes') || '').trim();
    if (notes.length < 5) {
      setError('Review notes must contain at least 5 characters.');
      return;
    }
    setSavingId(submission.id);
    setError('');
    try {
      await api.aicte.reviewCompliance(submission.id, { status, notes });
      await loadCompliance();
    } catch (reviewError) {
      setError((reviewError as Error).message || 'Unable to update compliance review.');
    } finally {
      setSavingId(null);
    }
  };

  const rows = (data?.submissions || []).map((submission) => ({
    id: submission.id,
    submission: <span className="font-mono text-primary-container">{submission.submission_id}</span>,
    institution: <div><p className="font-medium text-heading"><AicteInstitutionLink institutionId={submission.institution_pk} from="compliance">{submission.institution}</AicteInstitutionLink></p><p className="text-xs text-muted">{submission.institution_id} · {submission.state}</p></div>,
    report: submission.report_type,
    year: submission.academic_year,
    due: submission.due_date ? new Date(submission.due_date).toLocaleDateString() : '—',
    submitted: submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'Not submitted',
    status: <StatusBadge status={submission.status} />,
    review: <details><summary className="cursor-pointer text-primary-container hover:underline">Review submission</summary><form onSubmit={(event) => void review(event, submission)} className="mt-2 min-w-[220px] space-y-2">
      <select name="status" defaultValue={submission.status === 'overdue' ? 'under_review' : submission.status} className="field-input h-9 text-xs">
        <option value="under_review">Under review</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="overdue">Overdue</option>
      </select>
      <textarea name="notes" placeholder="Review notes (required)" minLength={5} maxLength={2000} defaultValue={submission.review_notes || ''} required className="field-input h-20 py-2 text-xs" />
      <button type="submit" disabled={savingId === submission.id} className="btn-primary h-9 px-3 text-xs">{savingId === submission.id ? 'Saving...' : 'Save review'}</button>
    </form></details>,
  }));

  return (
    <div className="space-y-6">
      <PageHeader kicker="Institutional returns" title="Compliance Monitoring" description="Track required submissions and record review outcomes for synthetic institution records." />
      {institutionFilter && <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm text-body">
        <span>Showing compliance records for institution ID {institutionFilter}.</span>
        <a href="/aicte/compliance" className="text-primary-container hover:underline">Clear institution filter</a>
      </div>}
      {error && <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-3 text-sm text-rejected">{error}</div>}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total submissions" value={data.summary.total} icon="description" />
          <StatCard label="Completed submissions" value={data.summary.completed} icon="task_alt" />
          <StatCard label="Pending submissions" value={data.summary.pending} icon="pending_actions" />
          <StatCard label="Overdue submissions" value={data.summary.overdue} icon="event_busy" />
        </div>
      )}
      <form onSubmit={(event) => { event.preventDefault(); void loadCompliance(); }} className="stitch-card p-4 flex flex-wrap gap-3">
        <input aria-label="Search compliance submissions" placeholder="Search institution, report, or submission ID" value={search} onChange={(event) => setSearch(event.target.value)} className="field-input min-w-[240px] flex-1" />
        <select aria-label="Filter compliance status" value={filter} onChange={(event) => setFilter(event.target.value)} className="field-input max-w-xs">
          <option value="">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="under_review">Under review</option><option value="overdue">Overdue</option>
        </select>
        <button className="btn-secondary h-11">Apply filters</button>
      </form>
      {loading ? <LoadingState label="Loading compliance submissions..." /> : (
        <AicteTable columns={[
          { key: 'submission', label: 'Submission ID' },
          { key: 'institution', label: 'Institution' },
          { key: 'report', label: 'Report type' },
          { key: 'year', label: 'Academic year' },
          { key: 'due', label: 'Due date' },
          { key: 'submitted', label: 'Submitted' },
          { key: 'status', label: 'Status' },
          { key: 'review', label: 'Review' },
        ]} rows={rows} rowKey="id" emptyMessage="No compliance submissions match these filters." />
      )}
    </div>
  );
}
