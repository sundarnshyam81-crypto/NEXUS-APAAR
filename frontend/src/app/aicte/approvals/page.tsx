'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LoadingState, PageHeader, StatusBadge } from '@/components/ui';
import AicteTable, { AicteInstitutionLink } from '@/components/aicte/AicteTable';

interface Review {
  id: number;
  administrator: string;
  previous_status: string;
  new_status: string;
  notes: string;
  created_at: string;
}

interface Application {
  id: number;
  application_id: string;
  institution: { id: number; name: string; institution_id: string; state: string; district: string; institution_type: string; approved_courses: number; approved_intake: number };
  submission_date: string;
  status: string;
  submitted_by: string;
  review_history: Review[];
}

export default function AicteApprovalsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (status) params.status_filter = status;
      if (search.trim()) params.search = search.trim();
      const result = await api.aicte.applications(params);
      setApplications(result.applications);
    } catch (loadError) {
      setError((loadError as Error).message || 'Unable to load approval applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.aicte.applications()
      .then((result: { applications: Application[] }) => setApplications(result.applications))
      .catch((loadError: Error) => setError(loadError.message || 'Unable to load approval applications.'))
      .finally(() => setLoading(false));
  }, []);

  const submitReview = async (event: React.FormEvent<HTMLFormElement>, application: Application) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextStatus = String(form.get('status') || 'under_review');
    const notes = String(form.get('notes') || '').trim();
    if (notes.length < 5) {
      setError('Review notes must contain at least 5 characters.');
      return;
    }
    setSavingId(application.id);
    setError('');
    try {
      await api.aicte.reviewApplication(application.id, { status: nextStatus, notes });
      await loadApplications();
    } catch (reviewError) {
      setError((reviewError as Error).message || 'Unable to save application review.');
    } finally {
      setSavingId(null);
    }
  };

  const rows = applications.map((application) => ({
    id: application.id,
    application_id: <span className="font-mono text-primary-container">{application.application_id}</span>,
    institution: <div><p className="font-medium text-heading"><AicteInstitutionLink institutionId={application.institution.id} from="approvals">{application.institution.name}</AicteInstitutionLink></p><p className="text-xs text-muted">{application.institution.institution_id}</p></div>,
    location: `${application.institution.district}, ${application.institution.state}`,
    submitted: application.submission_date ? new Date(application.submission_date).toLocaleDateString() : '—',
    status: <StatusBadge status={application.status} />,
    history: <details><summary className="cursor-pointer text-primary-container hover:underline">Review history ({application.review_history.length})</summary><div className="mt-2 min-w-[220px] space-y-2">{application.review_history.length ? application.review_history.map((review) => <div key={review.id} className="text-xs text-muted">{review.administrator} · {review.previous_status} → {review.new_status}<p>{review.notes}</p><p>{new Date(review.created_at).toLocaleString()}</p></div>) : <p className="text-xs text-muted">No review actions recorded.</p>}</div></details>,
    action: <details><summary className="cursor-pointer text-primary-container hover:underline">Review</summary><form onSubmit={(event) => void submitReview(event, application)} className="mt-2 min-w-[220px] space-y-2">
      <select name="status" defaultValue={application.status === 'pending' ? 'under_review' : application.status} className="field-input h-9 text-xs">
        <option value="under_review">Under review</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
      </select>
      <textarea name="notes" placeholder="Decision rationale (required)" minLength={5} maxLength={2000} required className="field-input h-20 py-2 text-xs" />
      <button type="submit" disabled={savingId === application.id} className="btn-primary h-9 px-3 text-xs">{savingId === application.id ? 'Saving...' : 'Save decision'}</button>
    </form></details>,
  }));

  return (
    <div className="space-y-6">
      <PageHeader kicker="Decision history recorded" title="Approval Management" description="Review institution applications, record a decision rationale, and track each status change." />
      {error && <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-3 text-sm text-rejected">{error}</div>}
      <form onSubmit={(event) => { event.preventDefault(); void loadApplications(); }} className="stitch-card p-4 flex flex-wrap gap-3">
        <input aria-label="Search applications" placeholder="Search application or institution" value={search} onChange={(event) => setSearch(event.target.value)} className="field-input min-w-[240px] flex-1" />
        <select aria-label="Filter application status" value={status} onChange={(event) => setStatus(event.target.value)} className="field-input max-w-xs">
          <option value="">All statuses</option><option value="pending">Pending</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
        <button className="btn-secondary h-11">Filter applications</button>
      </form>
      {loading ? <LoadingState label="Loading approval applications..." /> : (
        <AicteTable
          columns={[
            { key: 'application_id', label: 'Application ID' },
            { key: 'institution', label: 'Institution' },
            { key: 'location', label: 'Location' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'status', label: 'Status' },
            { key: 'history', label: 'Review history' },
            { key: 'action', label: 'Decision' },
          ]}
          rows={rows}
          rowKey="id"
          emptyMessage="No approval applications match these filters."
        />
      )}
    </div>
  );
}
