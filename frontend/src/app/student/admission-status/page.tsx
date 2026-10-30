'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';
import { LoadingState, EmptyState, PageHeader, StatusBadge } from '@/components/ui';

interface AdmissionRequestItem {
  id: number;
  request_id: string;
  programme_name: string;
  department: string;
  status: string;
  stage1_status: string;
  stage2_status: string;
  stage3_status: string;
  stage4_status: string;
  stage5_status: string;
  stage1_submitted_at: string | null;
  stage2_verified_at: string | null;
  stage3_capacity_checked_at: string | null;
  stage4_credit_mapped_at: string | null;
  stage5_decided_at: string | null;
  decision_reason: string | null;
  has_conflicting_enrolment: boolean;
  seat_allocated: boolean;
  created_at: string;
}

export default function StudentAdmissionStatusPage() {
  const [admissions, setAdmissions] = useState<AdmissionRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.student.admissionStatus()
      .then((data: AdmissionRequestItem[]) => setAdmissions(data || []))
      .catch((err: Error) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadSlip = (adm: AdmissionRequestItem) => {
    setDownloading(true);
    setTimeout(() => {
      const slipData = {
        title: "PROVISIONAL ADMISSION ALLOCATION SLIP",
        ministry: "Ministry of Education & National Testing Agency",
        sih_hackathon: "Smart India Hackathon 2026 - SIH26263",
        application_id: adm.request_id,
        programme: adm.programme_name,
        department: adm.department,
        admission_status: adm.status,
        conflict_check: adm.has_conflicting_enrolment ? "CONCURRENT ENROLMENT DETECTED" : "CLEARED / NON-CONFLICTING",
        seat_allotment: adm.seat_allocated ? "CONFIRMED & DEDUPLICATED" : "PENDING ALLOCATION",
        statutory_declaration: "Issued under UGC Establishment and Operation of Academic Bank of Credits Regulations 2021",
        digital_seal: "NEXUS-APAAR-STAMP-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
        timestamp: new Date().toISOString()
      };
      const dataUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(slipData, null, 2));
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `ADMISSION_SLIP_${adm.request_id}.json`;
      link.click();
      link.remove();
      setDownloading(false);
    }, 500);
  };

  if (loading) {
    return <LoadingState label="Loading admission status..." />;
  }

  const primaryAdmission = admissions[0];

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Admission & enrolment"
        title="Admission Status"
        description="Application status, verification progress and pending requirements for the current demonstration record."
        actions={<DemoBadge />}
      />

      {!primaryAdmission ? (
        <EmptyState title="No active admission request" body="There is no open admission application for this student in the current academic term." />
      ) : (
        <div className="space-y-6">
          {/* Main Application Summary Banner */}
          <div className="stitch-card p-6 md:p-8 space-y-6 border-l-4 border-l-[#171258]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-[#EFEEFB] text-[#171258] px-2.5 py-0.5 rounded">
                    REQ #{primaryAdmission.request_id}
                  </span>
                  <span className="text-xs text-[#6B6590]">Submitted {primaryAdmission.created_at?.slice(0, 10)}</span>
                </div>
                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#171258] mt-2">
                  {primaryAdmission.programme_name}
                </h2>
                <p className="text-xs text-[#4E4870] mt-0.5">
                  Department: <strong>{primaryAdmission.department}</strong> &bull; Indian Institute of Technology, Delhi
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    primaryAdmission.status === 'approved'
                      ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                      : primaryAdmission.status === 'rejected' || primaryAdmission.status === 'blocked'
                      ? 'bg-[#FCE8E6] text-[#B3261E]'
                      : 'bg-[#FFF3DC] text-[#B26A00]'
                  }`}
                >
                  {primaryAdmission.status === 'approved'
                    ? '✓ Admission Approved'
                    : primaryAdmission.status === 'blocked'
                    ? '⚠ Blocked by Conflict'
                    : 'In Verification'}
                </span>

                <button
                  onClick={() => handleDownloadSlip(primaryAdmission)}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E3E1F0] text-[#171258] text-xs font-semibold hover:bg-[#EFEEFB] shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  {downloading ? 'Generating...' : 'Download Allocation Slip'}
                </button>
              </div>
            </div>

            {/* Conflict Detection Alert (Crucial for SIH 2026 Problem Statement) */}
            {primaryAdmission.has_conflicting_enrolment ? (
              <div className="p-4 rounded-xl bg-[#FCE8E6] border border-[#B3261E]/30 flex items-start gap-3 text-xs text-[#B3261E]">
                <span className="material-symbols-outlined text-[24px] mt-0.5">warning</span>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-[#B3261E]">
                    National Multi-College Enrolment Conflict Detected!
                  </h4>
                  <p className="leading-relaxed">
                    Automated APAAR deduplication discovered a simultaneous active full-time enrolment at <strong>National Institute of Technology, Trichy (Civil Eng.)</strong> under the same 12-digit student identity.
                  </p>
                  <p className="text-[11px] text-[#B3261E]/90 pt-1 font-medium">
                    Statutory Rule: Section 4 UGC Dual-Degree Guidelines prohibits dual regular degree registrations simultaneously. A formal surrender or migration certificate must be uploaded to proceed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#E4F4EA] border border-[#1B7A3E]/30 flex items-start gap-3 text-xs text-[#1B7A3E]">
                <span className="material-symbols-outlined text-[22px] mt-0.5">verified</span>
                <div>
                  <h4 className="font-bold text-sm text-[#1B7A3E]">
                    Single Regular Enrolment Verified Across 1,100+ Partner Institutes
                  </h4>
                  <p className="leading-relaxed text-[#1B7A3E]/90 mt-0.5">
                    Zero concurrent active regular full-time admissions detected nationwide. Your APAAR ID is cleared for institutional seat allocation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 5-Stage Verification Progress Pipeline Detail (Stitch Spec) */}
          <div className="stitch-card p-6 md:p-8 space-y-6">
            <div className="border-b border-[#E3E1F0] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#171258]">fact_check</span>
                5-Stage Institutional Admission Protocol
              </h3>
              <p className="text-xs text-[#6B6590] mt-0.5">
                Every stage executes automated statutory checks adhering to Ministry of Education guidelines.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  stage: 1,
                  name: 'Stage 1: Identity & APAAR Resolution',
                  desc: 'Resolution of 12-digit numeric APAAR identifier, Aadhaar vault binding check, and demographic identity match.',
                  status: primaryAdmission.stage1_status || 'completed',
                  timestamp: primaryAdmission.stage1_submitted_at || 'Automated at Submission',
                  rule: 'MoE APAAR Core Protocol'
                },
                {
                  stage: 2,
                  name: 'Stage 2: Eligibility & Document Check',
                  desc: 'Retrieval of 10+2 marksheet via Digilocker and verification of minimum 60% PCM eligibility threshold.',
                  status: primaryAdmission.stage2_status || 'completed',
                  timestamp: primaryAdmission.stage2_verified_at || 'Instant Digilocker Match',
                  rule: 'AICTE Minimum Norms'
                },
                {
                  stage: 3,
                  name: 'Stage 3: Cross-College Conflict Deduplication',
                  desc: 'Nationwide single full-time seat enforcement scan across all state, central, and private university databases.',
                  status: primaryAdmission.has_conflicting_enrolment ? 'failed' : primaryAdmission.stage3_status || 'completed',
                  timestamp: primaryAdmission.stage3_capacity_checked_at || 'APAAR Real-time Hash Scan',
                  rule: 'UGC Notification F. 1-1/2021'
                },
                {
                  stage: 4,
                  name: 'Stage 4: Department Seat & Quota Allocation',
                  desc: 'Verification against institutional intake capacity, seat reservation categories, and quota availability.',
                  status: primaryAdmission.stage4_status || (primaryAdmission.seat_allocated ? 'completed' : 'pending'),
                  timestamp: primaryAdmission.stage4_credit_mapped_at || 'Dynamic Capacity Check',
                  rule: 'Institutional Roster Allocation'
                },
                {
                  stage: 5,
                  name: 'Stage 5: Final Admission Decision & Order',
                  desc: 'Final administrative sign-off, issuance of digital admission order, and registration on ABC university registry.',
                  status: primaryAdmission.stage5_status || primaryAdmission.status,
                  timestamp: primaryAdmission.stage5_decided_at || 'Dean / Registrar Approval',
                  rule: 'Autonomous Enrolment Order'
                },
              ].map((st) => {
                const isSuccess = st.status === 'completed' || st.status === 'approved' || st.status === 'CLEARED';
                const isFail = st.status === 'failed' || st.status === 'blocked' || st.status === 'rejected';
                const isPending = st.status === 'in_progress' || st.status === 'pending';

                return (
                  <div
                    key={st.stage}
                    className={`p-4 rounded-xl border transition-all ${
                      isSuccess
                        ? 'bg-[#E4F4EA]/30 border-[#1B7A3E]/25'
                        : isFail
                        ? 'bg-[#FCE8E6]/40 border-[#B3261E]/30'
                        : isPending
                        ? 'bg-[#FFF3DC]/40 border-[#B26A00]/30'
                        : 'bg-[#F0EEFC]/30 border-[#E3E1F0]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            isSuccess
                              ? 'bg-[#1B7A3E] text-white'
                              : isFail
                              ? 'bg-[#B3261E] text-white'
                              : isPending
                              ? 'bg-[#B26A00] text-white'
                              : 'bg-[#E3E1F0] text-[#4E4870]'
                          }`}
                        >
                          {isSuccess ? '✓' : isFail ? '✕' : st.stage}
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm text-[#171258]">{st.name}</h4>
                          <p className="text-xs text-[#4E4870] mt-0.5 leading-relaxed">{st.desc}</p>
                          <div className="flex items-center gap-3 text-[10px] text-[#6B6590] mt-1.5 font-mono">
                            <span>Standard: {st.rule}</span>
                            <span>&bull;</span>
                            <span>Time: {st.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto shrink-0 ${
                          isSuccess
                            ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                            : isFail
                            ? 'bg-[#FCE8E6] text-[#B3261E]'
                            : isPending
                            ? 'bg-[#FFF3DC] text-[#B26A00]'
                            : 'bg-[#EFEEFB] text-[#6B6590]'
                        }`}
                      >
                        {isSuccess ? 'Cleared' : isFail ? 'Failed' : isPending ? 'Processing' : 'Awaiting'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {primaryAdmission.decision_reason && (
              <div className="p-4 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0] text-xs text-[#2D2A6E] space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-[#6B6590]">
                  Official Decision Explanation:
                </span>
                <p className="leading-relaxed">{primaryAdmission.decision_reason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
