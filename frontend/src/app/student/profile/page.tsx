'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';
import { LoadingState, EmptyState, PageHeader, StatusBadge, ProgressBar } from '@/components/ui';

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

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    api.student.profile()
      .then((data: StudentProfile) => setProfile(data))
      .catch((err: Error) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrintCard = () => {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 300);
  };

  if (loading) return <LoadingState label="Loading student profile..." />;
  if (!profile) return <EmptyState title="Profile unavailable" body="Student academic profile not found or the session expired." />;

  const remaining = Math.max(0, profile.credits_required - profile.credits_earned);
  const pct = profile.credits_required ? Math.min(Math.round((profile.credits_earned / profile.credits_required) * 100), 100) : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Student identity"
        title="My Profile"
        description="Academic identity, programme details and credit summary for this demonstration record."
        actions={
          <>
            <DemoBadge />
            <button onClick={handlePrintCard} disabled={printing} className="btn-secondary h-10 text-sm">
              {printing ? 'Preparing...' : 'Print profile'}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="stitch-card overflow-hidden">
          <div className="bg-primary-container p-4 text-white flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">APAAR student record</p>
              <p className="text-xs text-white/80">Ministry of Education · demo</p>
            </div>
            <span className="material-symbols-outlined">badge</span>
          </div>
          <div className="p-6 space-y-4 text-center">
            <div className="w-24 h-24 mx-auto rounded-lg bg-lavender border border-border flex items-center justify-center font-serif text-3xl text-heading">
              {profile.full_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-serif text-[22px] text-heading">{profile.full_name}</h3>
              <p className="text-sm text-muted mt-1">{profile.degree_programme}</p>
              <div className="mt-2"><StatusBadge status={profile.enrolment_status} /></div>
            </div>
            <div className="bg-lavender p-3 rounded-lg border border-border">
              <span className="text-[11px] uppercase tracking-wider text-muted">Numeric demo identifier</span>
              <p className="font-mono text-base text-heading tracking-widest mt-1">{profile.demo_id}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="stitch-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ['Institution', profile.institution],
              ['Department', profile.department],
              ['Programme', profile.degree_programme],
              ['Academic year', profile.academic_year || '2025 - 2026'],
            ].map(([label, value]) => (
              <div key={label} className="p-3 bg-lavender rounded-lg border border-border">
                <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
                <p className="font-medium text-heading mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="stitch-card p-6 space-y-4">
            <h3 className="font-serif text-[22px] text-heading">Academic credits</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-lg bg-lavender border border-border">
                <p className="text-xs text-muted">Earned</p>
                <p className="font-serif text-2xl text-heading mt-1">{profile.credits_earned}</p>
              </div>
              <div className="p-4 rounded-lg bg-white border border-border">
                <p className="text-xs text-muted">Required</p>
                <p className="font-serif text-2xl text-heading mt-1">{profile.credits_required}</p>
              </div>
              <div className="p-4 rounded-lg bg-white border border-border">
                <p className="text-xs text-muted">Remaining</p>
                <p className="font-serif text-2xl text-heading mt-1">{remaining}</p>
              </div>
            </div>
            <ProgressBar percent={pct} />
            <p className="text-sm text-muted">{pct}% of required credits recorded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
