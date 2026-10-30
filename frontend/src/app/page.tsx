'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StitchHeader from '@/components/StitchHeader';
import StitchSubNav from '@/components/StitchSubNav';
import StitchFooter from '@/components/StitchFooter';
import CitizenSupportFab from '@/components/CitizenSupportFab';
import DemoBadge from '@/components/DemoBadge';
import { useAuth } from '@/context/AuthContext';

const DEMO_STUDENTS = [
  { id: '900000000001', name: 'Shyam', dept: 'AIML', credits: 78, tag: 'Eligible admission' },
  { id: '900000000002', name: 'Saran Kanna', dept: 'CSE', credits: 84, tag: 'Pending SWAYAM claim' },
  { id: '900000000003', name: 'Sanjay Kumar', dept: 'IT', credits: 90, tag: 'Approved enrolment' },
  { id: '900000000004', name: 'Dhiya', dept: 'AIML', credits: 72, tag: 'Standard profile' },
  { id: '900000000005', name: 'Aarav Kumar', dept: 'CSE', credits: 48, tag: 'Enrolment conflict' },
  { id: '900000000006', name: 'Priya Sharma', dept: 'ECE', credits: 62, tag: 'Needs information' },
  { id: '900000000007', name: 'Karthik S', dept: 'CSE', credits: 138, tag: 'Senior year' },
  { id: '900000000008', name: 'Divya Nair', dept: 'IT', credits: 24, tag: 'First-year applicant' },
  { id: '900000000009', name: 'Arjun R', dept: 'EEE', credits: 66, tag: 'NPTEL transfer' },
  { id: '900000000010', name: 'Meera Krishnan', dept: 'Mechanical', credits: 40, tag: 'Fresh applicant' },
];

export default function LandingPage() {
  const router = useRouter();
  const { studentLogin, adminLogin } = useAuth();
  const [loadingStudent, setLoadingStudent] = useState<string | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  const quickLaunchStudent = async (demoId: string) => {
    setLoadingStudent(demoId);
    try {
      await studentLogin(demoId, '2026');
      router.push('/student/dashboard');
    } catch {
      router.push(`/student/login?id=${demoId}`);
    } finally {
      setLoadingStudent(null);
    }
  };

  const quickLaunchAdmin = async () => {
    setLoadingAdmin(true);
    try {
      await adminLogin('collegeadmin', 'CollegeDemo@2026');
      router.push('/admin/overview');
    } catch {
      router.push('/admin/login');
    } finally {
      setLoadingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <StitchHeader />
      <StitchSubNav />

      <main className="flex-1 w-full relative isolate">
        <div className="pointer-events-none absolute z-0 top-0 right-0 w-[420px] h-[280px] bg-[#FFF6EE] rounded-bl-[140px]" />
        <div className="relative z-10 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted">
            <span className="material-symbols-outlined text-[18px] text-primary">home</span>
            <span className="text-primary font-medium">Home</span>
          </nav>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col items-start gap-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary text-sm font-medium border border-outline-variant/40">
                <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                National Academic Registry Standard
              </span>
              <h1 className="font-serif text-[36px] sm:text-[48px] leading-[1.15] text-primary">
                NEXUS APAAR
              </h1>
              <h2 className="font-serif text-[22px] sm:text-[28px] text-heading leading-snug">
                Intelligent Student Data Management Platform
              </h2>
              <p className="text-base text-body leading-relaxed max-w-[620px]">
                A unified digital framework for verifiable student identities, credit mobility, and multi-institution duplicate enrolment prevention.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/student/login" className="btn-primary">
                  Student Login
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
                <Link href="/admin/login" className="btn-secondary">
                  College Admin Login
                  <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
                </Link>
                <button onClick={quickLaunchAdmin} disabled={loadingAdmin} className="btn-ghost text-sm">
                  {loadingAdmin ? 'Opening...' : 'Open admin demo'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-approved">verified</span>
                  NEP 2020 aligned
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-primary">lock</span>
                  Simulated privacy verification
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 w-full">
              <div className="w-full stitch-card-lavender p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-medium text-sm">
                    <span className="material-symbols-outlined">badge</span>
                    Verifiable credential
                  </div>
                  <span className="status-pill status-approved">Validated</span>
                </div>
                <div className="bg-white rounded-lg p-5 border border-border flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">account_balance</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">900000000001</p>
                        <p className="text-sm text-muted">Numeric demo APAAR ID</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-chip-border bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted block text-[11px] uppercase tracking-wider">Institution</span>
                      <span className="font-medium text-body">IIT Delhi (demo)</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px] uppercase tracking-wider">ABC credits</span>
                      <span className="font-medium text-body">78 recorded</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px] uppercase tracking-wider">Programme</span>
                      <span className="font-medium text-body">B.Tech AIML</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px] uppercase tracking-wider">Registry state</span>
                      <span className="font-medium text-approved">Active</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted">De-duplication status: <strong className="text-body">Zero collisions on this demo record</strong></p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-serif text-[22px] text-heading">In this section</h3>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {['Student registration', 'Admission tracking', 'Credit transfer', 'Seat capacity', 'Identity verification', 'Reports'].map((chip) => (
                <span key={chip} className="h-10 px-4 rounded-full bg-chip border border-chip-border text-body text-sm flex items-center whitespace-nowrap">
                  {chip}
                </span>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: 'difference', title: 'Duplicate enrolment checks', body: 'Helps colleges review whether a student already holds a conflicting full-time enrolment before confirming admission.' },
              { icon: 'swap_horiz', title: 'Credit transfer workflow', body: 'Students submit SWAYAM, NPTEL or ABC claims. Administrators review mapping, credits and supporting information.' },
              { icon: 'verified_user', title: 'Simulated privacy verification', body: 'Identity checks are recorded as demonstration workflow results. They are not live cryptographic proofs.' },
            ].map((card) => (
              <div key={card.title} className="stitch-card-lavender p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-md bg-white border border-border flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{card.icon}</span>
                </div>
                <h3 className="font-serif text-[22px] text-heading">{card.title}</h3>
                <p className="text-sm text-body">{card.body}</p>
              </div>
            ))}
          </section>

          <section className="stitch-card p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="font-serif text-[22px] text-heading">Demonstration student accounts</h2>
                <p className="text-sm text-muted mt-1">
                  These are the existing 10 synthetic records. PIN: <code className="bg-nav px-1.5 py-0.5 rounded font-mono text-heading">2026</code>
                </p>
              </div>
              <DemoBadge />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {DEMO_STUDENTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => quickLaunchStudent(s.id)}
                  disabled={loadingStudent === s.id}
                  className="stitch-card-lavender p-4 text-left stitch-card-hover"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-medium text-heading bg-white px-2 py-0.5 rounded border border-border">
                      {s.id}
                    </span>
                  </div>
                  <h4 className="font-sans font-medium text-sm text-heading">{s.name}</h4>
                  <p className="text-xs text-muted mt-0.5">{s.dept} · {s.credits} credits</p>
                  <p className="mt-3 text-[11px] text-primary-container">{s.tag}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="stitch-card-lavender p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <h3 className="font-serif text-[22px] text-heading">Smart India Hackathon 2026 · SIH26263</h3>
              <p className="text-sm text-body">
                Developed by Team Zyvantha. This prototype demonstrates APAAR-based student records, admission review, credit transfer and simulated verification without changing existing backend behaviour.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/login" className="btn-primary">Institutional login</Link>
              <Link href="/student/login" className="btn-secondary">Student login</Link>
            </div>
          </section>
        </div>
      </main>

      <CitizenSupportFab />
      <StitchFooter />
    </div>
  );
}
