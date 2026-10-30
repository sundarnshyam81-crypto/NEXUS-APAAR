'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EmptyState, LoadingState, PageHeader, StatusBadge } from '@/components/ui';
import AicteTable, { AicteInstitutionLink } from '@/components/aicte/AicteTable';

interface Institution {
  id: number;
  institution_id: string;
  name: string;
  state: string;
  district: string;
  institution_type: string;
  approval_status: string;
  approved_courses: number;
  approved_intake: number;
}

interface InstitutionDetail extends Institution {
  courses: Array<{
    id: number;
    course_code: string;
    department: string;
    course_name: string;
    programme_level: string;
    approved_intake: number;
    academic_year: string;
    approval_status: string;
  }>;
  applications: Array<{ application_id: string; status: string; submission_date: string; review_history: Array<{ administrator: string; previous_status: string; new_status: string; notes: string; created_at: string }> }>;
  compliance_submissions: Array<{ submission_id: string; report_type: string; academic_year: string; status: string; due_date: string }>;
}

export default function AicteInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<InstitutionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadInstitutions = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (state) params.state = state;
      if (status) params.status_filter = status;
      const result = await api.aicte.institutions(params);
      setInstitutions(result.institutions);
    } catch (loadError) {
      setError((loadError as Error).message || 'Unable to load institutions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.aicte.institutions()
      .then((result: { institutions: Institution[] }) => setInstitutions(result.institutions))
      .catch((loadError: Error) => setError(loadError.message || 'Unable to load institutions.'))
      .finally(() => setLoading(false));
  }, []);

  const viewInstitution = async (id: number) => {
    setDetailLoading(true);
    setSelected(null);
    setError('');
    try {
      setSelected(await api.aicte.institution(id));
    } catch (loadError) {
      setError((loadError as Error).message || 'Unable to load institution profile.');
    } finally {
      setDetailLoading(false);
    }
  };

  const rows = institutions.map((institution) => ({
    id: institution.id,
    name: <AicteInstitutionLink institutionId={institution.id} from="directory" className="font-medium text-left">{institution.name}</AicteInstitutionLink>,
    institution_id: <span className="font-mono">{institution.institution_id}</span>,
    location: `${institution.district}, ${institution.state}`,
    type: institution.institution_type,
    courses: institution.approved_courses,
    intake: institution.approved_intake.toLocaleString(),
    status: <StatusBadge status={institution.approval_status} />,
    profile: <button onClick={() => viewInstitution(institution.id)} className="text-primary-container hover:underline">View profile</button>,
  }));

  return (
    <div className="space-y-6">
      <PageHeader kicker="AICTE oversight" title="Institution Directory" description="Search and inspect synthetic institution profiles, approval status, approved programmes, and intake." />
      {error && <div role="alert" className="rounded-lg border border-rejected/20 bg-rejected-bg p-3 text-sm text-rejected">{error}</div>}
      <form onSubmit={(event) => { event.preventDefault(); void loadInstitutions(); }} className="stitch-card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input aria-label="Search institutions" placeholder="Search name, ID, or district" value={search} onChange={(event) => setSearch(event.target.value)} className="field-input md:col-span-2" />
        <select aria-label="Filter by state" value={state} onChange={(event) => setState(event.target.value)} className="field-input">
          <option value="">All states</option>
          {['Delhi', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Uttarakhand', 'West Bengal'].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Filter by approval status" value={status} onChange={(event) => setStatus(event.target.value)} className="field-input">
          <option value="">All statuses</option>
          {['approved', 'pending', 'under_review', 'rejected'].map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}
        </select>
        <button type="submit" className="btn-primary md:col-span-4 justify-self-start">Apply filters</button>
      </form>

      {loading ? <LoadingState label="Loading institution directory..." /> : (
        <AicteTable
          columns={[
            { key: 'name', label: 'Institution' },
            { key: 'institution_id', label: 'Institution ID' },
            { key: 'location', label: 'District / State' },
            { key: 'type', label: 'Institution type' },
            { key: 'courses', label: 'Approved courses' },
            { key: 'intake', label: 'Approved intake' },
            { key: 'status', label: 'Status' },
            { key: 'profile', label: 'Profile' },
          ]}
          rows={rows}
          rowKey="id"
          emptyMessage="No institutions match these filters."
        />
      )}
      {detailLoading && <LoadingState label="Loading institution profile..." />}
      {selected && (
        <div className="fixed inset-0 z-[60] bg-[#1a1a2d]/40 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="institution-profile-title">
          <section className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-surface p-5 sm:p-7 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Institution profile · synthetic record</p>
                <h2 id="institution-profile-title" className="font-serif text-2xl text-heading">{selected.name}</h2>
                <p className="text-sm text-muted">{selected.institution_id} · {selected.district}, {selected.state} · {selected.institution_type}</p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-secondary h-9 px-3 text-sm" aria-label="Close institution profile">Close</button>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <StatusBadge status={selected.approval_status} />
              <span className="text-sm text-body">{selected.approved_courses} approved courses · {selected.approved_intake} approved intake</span>
            </div>
            <div>
              <h3 className="font-serif text-lg text-heading mb-2">Courses & intake</h3>
              {selected.courses.length ? (
                <div className="grid gap-2 sm:grid-cols-2">{selected.courses.map((course) => (
                  <div key={course.id} className="rounded-lg border border-border bg-white p-3">
                    <p className="font-medium text-heading">{course.course_name}</p>
                    <p className="text-xs text-muted">{course.department} · {course.programme_level} · {course.academic_year}</p>
                    <p className="mt-1 text-sm text-body">{course.approved_intake} seats · {course.approval_status}</p>
                  </div>
                ))}</div>
              ) : <EmptyState title="No course records" body="This demo institution has no course records." />}
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <h3 className="font-serif text-lg text-heading mb-2">Approval history</h3>
                {selected.applications.map((application) => (
                  <div key={application.application_id} className="mb-2 rounded-lg border border-border bg-white p-3">
                    <p className="font-mono text-sm text-primary-container">{application.application_id}</p>
                    <StatusBadge status={application.status} />
                    {application.review_history.map((review, index) => <p key={`${application.application_id}-${index}`} className="mt-2 text-xs text-muted">{review.administrator}: {review.previous_status} → {review.new_status} — {review.notes}</p>)}
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-serif text-lg text-heading mb-2">Compliance submissions</h3>
                {selected.compliance_submissions.map((submission) => (
                  <div key={submission.submission_id} className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-white p-3">
                    <div><p className="text-sm font-medium text-heading">{submission.report_type}</p><p className="text-xs text-muted">{submission.academic_year} · due {new Date(submission.due_date).toLocaleDateString()}</p></div>
                    <StatusBadge status={submission.status} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
