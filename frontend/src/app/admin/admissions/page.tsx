'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';

interface AdmissionRequestItem {
  id: number;
  request_id: string;
  student_id: number;
  student_name: string;
  student_demo_id: string;
  programme_id: number;
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

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<AdmissionRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReq, setSelectedReq] = useState<AdmissionRequestItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.admissions.list(statusFilter || undefined);
      setAdmissions(data || []);
      if (selectedReq) {
        const updated = data.find((d: AdmissionRequestItem) => d.request_id === selectedReq.request_id);
        if (updated) setSelectedReq(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedReq]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const handleAction = async (action: string) => {
    if (!selectedReq) return;
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await api.admissions.action(selectedReq.request_id, action, actionReason);
      setActionFeedback(`Action '${action}' successful. New Status: ${res.new_status}`);
      setActionReason('');
      await fetchAdmissions();
    } catch (err: unknown) {
      setActionFeedback(`Action Error: ${(err as Error).message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#F26B2A]">
            Single-Seat Admission Governance &bull; 5-Stage Verification Engine
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#171258] mt-0.5">
            Admissions Review & Conflict Queue
          </h1>
          <p className="text-xs text-[#6B6590] mt-1">
            Real-time evaluation of student eligibility, cross-university conflict de-duplication, and approved capacity quotas.
          </p>
        </div>
        <DemoBadge />
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-[#E4F4EA] border border-[#1B7A3E]/30 text-[#1B7A3E] text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-semibold">{actionFeedback}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="text-[#1B7A3E] hover:opacity-75">✕</button>
        </div>
      )}

      {/* 2-Column Interface: Queue List + Detailed Review Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="stitch-card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#171258]">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs text-[#171258] focus:outline-none"
              >
                <option value="">All Applications</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="blocked">Blocked (Conflict)</option>
              </select>
            </div>
            <span className="text-xs text-[#6B6590]">Total: {admissions.length} requests</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="stitch-card p-12 text-center text-[#6B6590]">
                Loading admissions pipeline...
              </div>
            ) : admissions.length > 0 ? (
              admissions.map((adm) => {
                const isSelected = selectedReq?.id === adm.id;
                return (
                  <div
                    key={adm.id}
                    onClick={() => setSelectedReq(adm)}
                    className={`stitch-card p-5 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'border-l-[#171258] ring-2 ring-[#171258]/10 shadow-md'
                        : adm.has_conflicting_enrolment
                        ? 'border-l-[#B3261E]'
                        : 'border-l-[#E3E1F0] hover:border-l-[#2D2A6E]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#171258] bg-[#EFEEFB] px-2 py-0.5 rounded">
                            {adm.request_id}
                          </span>
                          <span className="text-xs text-[#6B6590]">{adm.created_at?.slice(0, 10)}</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#171258] mt-1">
                          {adm.student_name}
                        </h4>
                        <p className="text-xs text-[#4E4870]">
                          {adm.programme_name} &bull; <span className="font-mono">{adm.student_demo_id}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            adm.status === 'approved'
                              ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                              : adm.status === 'rejected' || adm.status === 'blocked'
                              ? 'bg-[#FCE8E6] text-[#B3261E]'
                              : 'bg-[#FFF3DC] text-[#B26A00]'
                          }`}
                        >
                          {adm.status}
                        </span>

                        {adm.has_conflicting_enrolment ? (
                          <span className="text-[10px] font-bold text-[#B3261E] bg-[#FCE8E6] px-2 py-0.5 rounded">
                            ⚠ DUAL ENROLLED
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[#1B7A3E]">
                            ✓ Single Seat Cleared
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="stitch-card p-12 text-center text-[#6B6590]">
                No admission requests match this filter.
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Review & Action Pane (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedReq ? (
            <div className="stitch-card p-6 space-y-6 sticky top-20">
              <div className="flex items-start justify-between border-b border-[#E3E1F0] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26B2A]">
                    Admission Evaluation Inspector
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#171258] mt-0.5">
                    {selectedReq.student_name}
                  </h3>
                  <p className="font-mono text-xs text-[#6B6590]">APAAR ID: {selectedReq.student_demo_id}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedReq.status === 'approved'
                      ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                      : selectedReq.status === 'rejected' || selectedReq.status === 'blocked'
                      ? 'bg-[#FCE8E6] text-[#B3261E]'
                      : 'bg-[#FFF3DC] text-[#B26A00]'
                  }`}
                >
                  {selectedReq.status}
                </span>
              </div>

              {/* Conflict Status Banner */}
              {selectedReq.has_conflicting_enrolment ? (
                <div className="p-3.5 rounded-xl bg-[#FCE8E6] border border-[#B3261E]/30 text-xs text-[#B3261E] space-y-1">
                  <strong className="block font-bold">⚠ Statutory Dual Enrolment Detected</strong>
                  <p className="text-[11px] leading-relaxed">
                    Student has concurrent active full-time enrolment in an external AISHE university. Dual degree policy requires submission of a surrender deed.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#E4F4EA] border border-[#1B7A3E]/30 text-xs text-[#1B7A3E] space-y-1">
                  <strong className="block font-bold">✓ Single Seat Non-Conflict Verified</strong>
                  <p className="text-[11px] leading-relaxed">
                    Zero concurrent active regular full-time enrolments found. Valid for seat allocation.
                  </p>
                </div>
              )}

              {/* 5-Stage Checklist */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-[#171258] text-[11px] uppercase tracking-wider block">
                  Stage-by-Stage Verification Roster
                </span>
                {[
                  { name: '1. Identity Resolution', status: selectedReq.stage1_status },
                  { name: '2. Eligibility & Documents', status: selectedReq.stage2_status },
                  { name: '3. Enrolment Conflict Check', status: selectedReq.has_conflicting_enrolment ? 'failed' : selectedReq.stage3_status },
                  { name: '4. Seat Capacity Check', status: selectedReq.stage4_status },
                  { name: '5. Final Admission Order', status: selectedReq.stage5_status },
                ].map((st, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#F0EEFC]/50 border border-[#E3E1F0]">
                    <span className="text-[#4E4870] font-medium">{st.name}</span>
                    <span
                      className={`font-mono text-[10px] font-bold uppercase ${
                        st.status === 'completed' || st.status === 'approved'
                          ? 'text-[#1B7A3E]'
                          : st.status === 'failed' || st.status === 'rejected'
                          ? 'text-[#B3261E]'
                          : 'text-[#B26A00]'
                      }`}
                    >
                      {st.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Decision Explanation Input */}
              <div className="space-y-2 text-xs">
                <label className="block font-semibold text-[#171258]">Administrative Order Notes / Reason</label>
                <textarea
                  rows={2}
                  placeholder="State rationale for approval, rejection, or request for more documentation..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#E3E1F0] flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#1B7A3E] hover:bg-[#146030] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  Approve Admission
                </button>
                <button
                  onClick={() => handleAction('reject')}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#B3261E] hover:bg-[#901e18] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => handleAction('request_info')}
                  disabled={actionLoading}
                  className="w-full py-2 px-3 rounded-lg bg-white border border-[#E3E1F0] hover:bg-[#EFEEFB] text-[#171258] text-xs font-semibold transition-all"
                >
                  Request Clarification / Surrender Certificate
                </button>
              </div>
            </div>
          ) : (
            <div className="stitch-card p-12 text-center text-[#6B6590] space-y-2">
              <span className="material-symbols-outlined text-[36px] text-[#8B85B0]">touch_app</span>
              <p className="text-xs">Select any application from the queue to inspect details and execute administrative actions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
