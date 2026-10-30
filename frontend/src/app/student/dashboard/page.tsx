'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LoadingState, PageHeader, StatusBadge, StatCard, ProgressBar } from '@/components/ui';

interface StudentProfile {
  id: number;
  demo_id: string;
  full_name: string;
  institution: string;
  department: string;
  degree_programme: string;
  academic_year: string;
  enrolment_status: string;
  credits_earned: number;
  credits_required: number;
}

interface AdmissionItem {
  id: number;
  request_id: string;
  programme_name: string;
  status: string;
  stage1_status: string;
  stage2_status: string;
  stage3_status: string;
  stage4_status: string;
  stage5_status: string;
  decision_reason: string;
}

interface CreditSummary {
  credits_earned: number;
  credits_required: number;
  credits_remaining: number;
  external_credits_approved: number;
  credits_under_review: number;
  total_effective_credits: number;
  credit_requests: Array<{
    id: number;
    request_id: string;
    course_name: string;
    credit_source: string;
    credits_claimed: number;
    status: string;
  }>;
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [admissions, setAdmissions] = useState<AdmissionItem[]>([]);
  const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, adm, cred, notif] = await Promise.all([
          api.student.profile(),
          api.student.admissionStatus(),
          api.student.credits(),
          api.student.notifications(),
        ]);
        setProfile(prof);
        setAdmissions(adm || []);
        setCreditSummary(cred);
        setNotifications((notif || []).slice(0, 4));
      } catch (err) {
        console.error('Failed to load student dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const latestAdmission = admissions[0] || null;

  const handleDownloadTranscript = () => {
    setDownloading(true);
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        report: "OFFICIAL ACADEMIC SUMMARY (SYNTHETIC RECORD)",
        apaar_id: profile?.demo_id,
        student_name: profile?.full_name,
        institution: profile?.institution,
        department: profile?.department,
        credits_earned: profile?.credits_earned,
        credits_required: profile?.credits_required,
        enrolment_status: profile?.enrolment_status,
        compliance: "NEP 2020 UGC ABC Framework",
        timestamp: new Date().toISOString()
      }, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `APAAR_${profile?.demo_id || 'STUDENT'}_SUMMARY.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloading(false);
    }, 600);
  };

  if (loading) {
    return <LoadingState label="Loading student academic records..." />;
  }

  const earned = creditSummary?.credits_earned || profile?.credits_earned || 0;
  const required = creditSummary?.credits_required || profile?.credits_required || 160;
  const progressPct = required ? Math.min(Math.round((earned / required) * 100), 100) : 0;
  const pendingTransfers = creditSummary?.credits_under_review || 0;

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Student portal"
        title={`Welcome, ${profile?.full_name || user?.name || 'Student'}`}
        description={`${profile?.degree_programme || 'Programme'} · ${profile?.department || 'Department'} · ${profile?.academic_year || 'Academic year'}`}
        actions={
          <>
            <button onClick={handleDownloadTranscript} disabled={downloading} className="btn-secondary h-10 text-sm">
              {downloading ? 'Preparing...' : 'Download summary'}
            </button>
            <Link href="/student/credit-transfer" className="btn-primary h-10 text-sm">
              Request credit transfer
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {[
          { href: '/student/dashboard', label: 'Overview' },
          { href: '/student/admission-status', label: 'Admission' },
          { href: '/student/credits', label: 'Credits' },
          { href: '/student/verification', label: 'Verification' },
          { href: '/student/notifications', label: 'Notifications' },
        ].map((chip, i) => (
          <Link
            key={chip.href}
            href={chip.href}
            className={`h-8 px-4 rounded-full text-sm font-medium ${i === 0 ? 'bg-primary-container text-white' : 'bg-chip text-body border border-chip-border'}`}
          >
            {chip.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Credits earned"
          value={`${earned} / ${required}`}
          icon="school"
          hint={
            <div className="space-y-1.5">
              <ProgressBar percent={progressPct} />
              <span>{progressPct}% complete · {Math.max(0, required - earned)} remaining</span>
            </div>
          }
        />
        <StatCard
          label="Admission status"
          value={<StatusBadge status={latestAdmission?.status || profile?.enrolment_status || 'Pending'} />}
          icon="assignment_turned_in"
          hint={profile?.institution || 'Institution on record'}
        />
        <StatCard
          label="Credit transfers"
          value={pendingTransfers}
          icon="pending_actions"
          hint={`${creditSummary?.credit_requests?.length || 0} request(s) on record`}
        />
        <StatCard
          label="Privacy verification"
          value="Simulated"
          icon="verified_user"
          hint="Demonstration workflow — not live ZKP"
        />
      </div>

      <div className="stitch-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-[22px] text-heading">Admission verification progress</h2>
            <p className="text-sm text-muted mt-1">Five-stage review recorded against the latest application.</p>
          </div>
          {latestAdmission && <StatusBadge status={latestAdmission.status} />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { num: 1, title: 'Identity', desc: 'APAAR identifier check', status: latestAdmission?.stage1_status },
            { num: 2, title: 'Eligibility', desc: 'Academic credit check', status: latestAdmission?.stage2_status },
            { num: 3, title: 'Conflict review', desc: 'Duplicate enrolment check', status: latestAdmission?.stage3_status },
            { num: 4, title: 'Seat allocation', desc: 'Programme capacity', status: latestAdmission?.stage4_status },
            { num: 5, title: 'Decision', desc: 'Admission outcome', status: latestAdmission?.stage5_status },
          ].map((stage) => {
            const raw = (stage.status || 'pending').toLowerCase();
            const done = ['completed', 'cleared', 'approved'].includes(raw);
            const pending = ['in_progress', 'pending'].includes(raw);
            return (
              <div key={stage.num} className="p-4 rounded-lg border border-border bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${done ? 'bg-approved text-white' : pending ? 'bg-pending text-white' : 'bg-nav text-muted'}`}>
                    {done ? '✓' : stage.num}
                  </span>
                </div>
                <h4 className="font-sans font-medium text-sm text-heading">{stage.title}</h4>
                <p className="text-xs text-muted mt-1">{stage.desc}</p>
              </div>
            );
          })}
        </div>
        {latestAdmission?.decision_reason && (
          <div className="p-3 bg-lavender rounded-lg border border-border text-sm text-body">
            {latestAdmission.decision_reason}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="stitch-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-[22px] text-heading">Notifications</h3>
            <Link href="/student/notifications" className="text-sm text-primary-container">View all</Link>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted py-4">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-lg bg-lavender border border-border">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-heading">{n.title}</span>
                    <span className="text-xs text-muted">{n.created_at?.slice(0, 10)}</span>
                  </div>
                  <p className="text-sm text-muted mt-1 line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="stitch-card p-6 space-y-4 lg:col-span-2 overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-[22px] text-heading">Recent credit transfers</h3>
            <Link href="/student/credit-transfer" className="text-sm text-primary-container">New request</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Course</th>
                <th>Source</th>
                <th>Credits</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {creditSummary?.credit_requests && creditSummary.credit_requests.length > 0 ? (
                creditSummary.credit_requests.map((req) => (
                  <tr key={req.id}>
                    <td className="font-mono">{req.request_id}</td>
                    <td>{req.course_name}</td>
                    <td>{req.credit_source}</td>
                    <td>{req.credits_claimed}</td>
                    <td><StatusBadge status={req.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-muted">No credit-transfer requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
