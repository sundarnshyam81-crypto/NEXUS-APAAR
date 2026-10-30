'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';
import { LoadingState, PageHeader, StatusBadge } from '@/components/ui';

interface CreditSummaryData {
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
    course_identifier: string;
    credits_claimed: number;
    completion_info: string;
    document_reference: string;
    status: string;
    proposed_mapping: string;
    evaluation_result: string;
    admin_explanation: string;
    approved_credits: number;
    created_at: string;
  }>;
}

const SAMPLE_COURSES = [
  { term: 'Sem 1', code: 'CS101', name: 'Programming & Data Structures', source: 'Campus Core', credits: 4, grade: 'A', status: 'Reconciled' },
  { term: 'Sem 1', code: 'MA101', name: 'Calculus & Linear Algebra', source: 'Campus Core', credits: 4, grade: 'A-', status: 'Reconciled' },
  { term: 'Sem 2', code: 'CS201', name: 'Discrete Mathematics', source: 'Campus Core', credits: 4, grade: 'B+', status: 'Reconciled' },
  { term: 'Sem 2', code: 'CS202', name: 'Digital Logic & Computer Architecture', source: 'Campus Core', credits: 4, grade: 'A', status: 'Reconciled' },
  { term: 'Sem 3', code: 'CS301', name: 'Algorithms & Complexity', source: 'Campus Core', credits: 4, grade: 'A', status: 'Reconciled' },
  { term: 'Sem 3', code: 'NPTEL-CS12', name: 'Introduction to Operating Systems', source: 'NPTEL (SWAYAM)', credits: 3, grade: 'Elite (84%)', status: 'Reconciled' },
  { term: 'Sem 4', code: 'CS401', name: 'Database Management Systems', source: 'Campus Core', credits: 4, grade: 'A-', status: 'Reconciled' },
  { term: 'Sem 4', code: 'SWY-AI04', name: 'Deep Learning & Neural Networks', source: 'SWAYAM', credits: 4, grade: 'Elite+Gold', status: 'Reconciled' },
  { term: 'Sem 5', code: 'CS501', name: 'Computer Networks', source: 'Campus Core', credits: 4, grade: 'A', status: 'Reconciled' },
  { term: 'Sem 5', code: 'ABC-EXT-09', name: 'Cloud Computing Fundamentals', source: 'IIT Madras (ABC)', credits: 3, grade: 'Pass', status: 'Reconciled' },
];

export default function StudentCreditsPage() {
  const [data, setData] = useState<CreditSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'campus' | 'mooc' | 'claims'>('all');

  useEffect(() => {
    api.student.credits()
      .then((res: CreditSummaryData) => setData(res))
      .catch((err: Error) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading academic credit records..." />;
  }

  const earned = data?.credits_earned || 78;
  const externalApproved = data?.external_credits_approved || 12;
  const underReview = data?.credits_under_review || 4;
  const totalEffective = earned + externalApproved;
  const required = data?.credits_required || 160;
  const remaining = Math.max(0, required - totalEffective);
  const percentComplete = Math.min(Math.round((totalEffective / required) * 100), 100);

  // Filter courses based on active tab
  const filteredCourses = SAMPLE_COURSES.filter((c) => {
    if (activeTab === 'campus') return c.source.includes('Campus');
    if (activeTab === 'mooc') return c.source.includes('SWAYAM') || c.source.includes('NPTEL') || c.source.includes('ABC');
    return true;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Academic Bank of Credits"
        title="Academic Credits"
        description="Credits earned, approved external credits, and pending transfer claims for this demonstration record."
        actions={
          <>
            <DemoBadge />
            <Link href="/student/credit-transfer" className="btn-primary h-10 text-sm">Request transfer</Link>
          </>
        }
      />

      {/* 4 Metric Cards (Stitch Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Campus Coursework</span>
            <span className="material-symbols-outlined text-[#171258] text-[20px]">account_balance</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#171258]">{earned}</div>
          <p className="text-[11px] text-[#4E4870]">Earned directly through home institution</p>
        </div>

        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">ABC / SWAYAM Approved</span>
            <span className="material-symbols-outlined text-[#1B7A3E] text-[20px]">verified</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1B7A3E]">{externalApproved}</div>
          <p className="text-[11px] text-[#4E4870]">Transferred & approved via equivalence</p>
        </div>

        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Under Committee Review</span>
            <span className="material-symbols-outlined text-[#F26B2A] text-[20px]">pending</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#F26B2A]">{underReview}</div>
          <p className="text-[11px] text-[#4E4870]">Awaiting Dean / Academic Council decision</p>
        </div>

        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Degree Requirement</span>
            <span className="material-symbols-outlined text-indigo-700 text-[20px]">flag</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#171258]">{totalEffective}</span>
            <span className="text-xs text-[#6B6590]">/ {required}</span>
          </div>
          <p className="text-[11px] text-[#1B7A3E] font-medium">{percentComplete}% credits fulfilled</p>
        </div>
      </div>

      {/* Credit Progress & NEP 2020 Cap Directive */}
      <div className="stitch-card p-6 md:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3E1F0] pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#171258]">
              Degree Credit Accumulation Progress
            </h3>
            <p className="text-xs text-[#6B6590]">
              Total Effective: <strong>{totalEffective}</strong> credits | Remaining: <strong>{remaining}</strong> credits required
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E4F4EA] text-[#1B7A3E]">
            {percentComplete}% of 160 Required
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="space-y-2">
          <div className="w-full bg-[#EFEEFB] h-4 rounded-full overflow-hidden flex">
            <div
              className="bg-[#171258] h-full transition-all"
              style={{ width: `${Math.round((earned / required) * 100)}%` }}
              title="Campus Core Credits"
            />
            <div
              className="bg-[#1B7A3E] h-full transition-all"
              style={{ width: `${Math.round((externalApproved / required) * 100)}%` }}
              title="External Approved Credits"
            />
            <div
              className="bg-[#F26B2A] h-full transition-all"
              style={{ width: `${Math.round((underReview / required) * 100)}%` }}
              title="Credits Under Review"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[11px] text-[#4E4870] pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#171258]"></span>
              <span>Campus Core ({earned} cr)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#1B7A3E]"></span>
              <span>External Approved ({externalApproved} cr)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#F26B2A]"></span>
              <span>Under Review ({underReview} cr)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#EFEEFB] border border-[#E3E1F0]"></span>
              <span>Remaining ({remaining} cr)</span>
            </div>
          </div>
        </div>

        {/* NEP 2020 Compliance Note */}
        <div className="p-4 rounded-xl bg-[#FFF6EE] border border-[#F26B2A]/30 flex items-start gap-3 text-xs text-[#4E4870]">
          <span className="material-symbols-outlined text-[#F26B2A] text-[20px] mt-0.5">policy</span>
          <div>
            <strong className="text-[#171258]">NEP 2020 40% Online Credit Ceiling Guideline:</strong>
            <p className="mt-0.5 leading-relaxed">
              Under UGC regulations, up to 40% of total degree credits (64 of 160 credits) may be earned via approved online platforms (SWAYAM, NPTEL, ABC partners). Your current online credit utilization is at {externalApproved} credits (7.5%), comfortably within regulatory boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Academic Ledger & Coursework Records */}
      <div className="stitch-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
          <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#171258]">format_list_bulleted</span>
            Academic Bank of Credits Itemized Ledger
          </h3>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#EFEEFB] p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'all' ? 'bg-white text-[#171258] shadow-sm font-semibold' : 'text-[#6B6590]'
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setActiveTab('campus')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'campus' ? 'bg-white text-[#171258] shadow-sm font-semibold' : 'text-[#6B6590]'
              }`}
            >
              Campus Core
            </button>
            <button
              onClick={() => setActiveTab('mooc')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'mooc' ? 'bg-white text-[#171258] shadow-sm font-semibold' : 'text-[#6B6590]'
              }`}
            >
              SWAYAM / NPTEL
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'claims' ? 'bg-white text-[#171258] shadow-sm font-semibold' : 'text-[#6B6590]'
              }`}
            >
              Active Claims ({data?.credit_requests?.length || 0})
            </button>
          </div>
        </div>

        {/* Tab 1, 2, 3: Course Table */}
        {activeTab !== 'claims' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
                <tr>
                  <th className="py-2.5 px-3">Term</th>
                  <th className="py-2.5 px-3">Course Code</th>
                  <th className="py-2.5 px-3">Subject / Module Title</th>
                  <th className="py-2.5 px-3">Accredited Source</th>
                  <th className="py-2.5 px-3 text-center">Credits</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-right">ABC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E1F0]">
                {filteredCourses.map((c, i) => (
                  <tr key={i} className="hover:bg-[#F0EEFC]/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-[#4E4870]">{c.term}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#171258]">{c.code}</td>
                    <td className="py-3 px-3 font-semibold text-[#1A1A2D]">{c.name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#EFEEFB] text-[#2D2A6E] font-medium text-[11px]">
                        {c.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#171258]">{c.credits}</td>
                    <td className="py-3 px-3 text-center font-semibold text-[#171258]">{c.grade}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E4F4EA] text-[#1B7A3E]">
                        <span className="w-1 h-1 rounded-full bg-[#1B7A3E]"></span>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab 4: Active Transfer Claims */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
                <tr>
                  <th className="py-2.5 px-3">Claim ID</th>
                  <th className="py-2.5 px-3">External Course</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Credits</th>
                  <th className="py-2.5 px-3">Proposed Mapping</th>
                  <th className="py-2.5 px-3">Review Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E1F0]">
                {data?.credit_requests && data.credit_requests.length > 0 ? (
                  data.credit_requests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#F0EEFC]/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#171258]">{req.request_id}</td>
                      <td className="py-3 px-3 font-semibold text-[#1A1A2D]">{req.course_name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#EFEEFB] text-[#2D2A6E]">
                          {req.credit_source}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#171258]">{req.credits_claimed}</td>
                      <td className="py-3 px-3 text-[#4E4870]">{req.proposed_mapping || 'Open Elective'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                            req.status === 'approved'
                              ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                              : req.status === 'rejected'
                              ? 'bg-[#FCE8E6] text-[#B3261E]'
                              : 'bg-[#FFF3DC] text-[#B26A00]'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-[#6B6590]">
                      No active credit claims recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
