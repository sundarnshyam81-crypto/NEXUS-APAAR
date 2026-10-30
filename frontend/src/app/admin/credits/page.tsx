'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';

interface CreditRequestItem {
  id: number;
  request_id: string;
  student_id: number;
  student_name: string;
  student_demo_id: string;
  course_name: string;
  credit_source: string;
  course_identifier: string;
  credits_claimed: number;
  status: string;
  proposed_mapping: string | null;
  evaluation_result: string | null;
  admin_explanation: string | null;
  approved_credits: number;
  completion_info?: string;
  document_reference?: string;
  created_at: string;
}

export default function AdminCreditsPage() {
  const [requests, setRequests] = useState<CreditRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReq, setSelectedReq] = useState<CreditRequestItem | null>(null);

  // Review form states
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [approvedCredits, setApprovedCredits] = useState<number>(4);
  const [proposedMapping, setProposedMapping] = useState('');
  const [adminExplanation, setAdminExplanation] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.credits.list(statusFilter || undefined);
      setRequests(data || []);
      if (selectedReq) {
        const updated = (data || []).find((d: CreditRequestItem) => d.request_id === selectedReq.request_id);
        if (updated) setSelectedReq(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, selectedReq]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const openReview = (req: CreditRequestItem) => {
    setSelectedReq(req);
    setApprovedCredits(req.credits_claimed);
    setProposedMapping(req.proposed_mapping || 'Discipline Elective / Professional Elective');
    setAdminExplanation(req.admin_explanation || 'Curriculum verified against NCrF Level 6 guidelines.');
    setFeedback(null);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setActionLoading(true);
    setFeedback(null);
    try {
      await api.credits.review(selectedReq.request_id, {
        action: reviewAction,
        approved_credits: reviewAction === 'approve' ? approvedCredits : 0,
        proposed_mapping: proposedMapping,
        admin_explanation: adminExplanation.trim() || 'Reviewed and approved by Academic Council.',
      });
      setFeedback(`Credit request #${selectedReq.request_id} processed: ${reviewAction.toUpperCase()}`);
      await loadRequests();
    } catch (err: unknown) {
      setFeedback(`Review Error: ${(err as Error).message}`);
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
            UGC Academic Bank of Credits Desk &bull; Curriculum Equivalence Committee
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#171258] mt-0.5">
            Credit Transfer & Equivalence Review
          </h1>
          <p className="text-xs text-[#6B6590] mt-1">
            Review external MOOCs from SWAYAM, NPTEL, and accredited ABC partner institutions for degree credit substitution.
          </p>
        </div>
        <DemoBadge />
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-[#E4F4EA] border border-[#1B7A3E]/30 text-[#1B7A3E] text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-semibold">{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[#1B7A3E] hover:opacity-75">✕</button>
        </div>
      )}

      {/* 2-Column Interface: Queue List + Detailed Review Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="stitch-card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#171258]">Filter Claims:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs text-[#171258] focus:outline-none"
              >
                <option value="">All Claims</option>
                <option value="pending">Pending Evaluation</option>
                <option value="approved">Approved & Reconciled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <span className="text-xs text-[#6B6590]">Total: {requests.length} claims</span>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="stitch-card p-12 text-center text-[#6B6590]">
                Loading credit transfer queue...
              </div>
            ) : requests.length > 0 ? (
              requests.map((req) => {
                const isSelected = selectedReq?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => openReview(req)}
                    className={`stitch-card p-5 cursor-pointer transition-all border-l-4 ${
                      isSelected
                        ? 'border-l-[#171258] ring-2 ring-[#171258]/10 shadow-md'
                        : 'border-l-[#E3E1F0] hover:border-l-[#2D2A6E]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#171258] bg-[#EFEEFB] px-2 py-0.5 rounded">
                            {req.request_id}
                          </span>
                          <span className="text-xs text-[#6B6590]">{req.credit_source}</span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#171258] mt-1">
                          {req.course_name}
                        </h4>
                        <p className="text-xs text-[#4E4870]">
                          Student: <strong>{req.student_name}</strong> &bull; <span className="font-mono">{req.student_demo_id}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            req.status === 'approved'
                              ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                              : req.status === 'rejected'
                              ? 'bg-[#FCE8E6] text-[#B3261E]'
                              : 'bg-[#FFF3DC] text-[#B26A00]'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs font-bold text-[#171258]">
                          {req.credits_claimed} Credits Claimed
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="stitch-card p-12 text-center text-[#6B6590]">
                No credit transfer claims in this view.
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
                    Equivalence Committee Review
                  </span>
                  <h3 className="font-serif text-lg font-bold text-[#171258] mt-0.5">
                    {selectedReq.course_name}
                  </h3>
                  <p className="font-mono text-xs text-[#6B6590]">Serial: {selectedReq.course_identifier}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                    selectedReq.status === 'approved'
                      ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                      : selectedReq.status === 'rejected'
                      ? 'bg-[#FCE8E6] text-[#B3261E]'
                      : 'bg-[#FFF3DC] text-[#B26A00]'
                  }`}
                >
                  {selectedReq.status}
                </span>
              </div>

              {/* Student and Course Credentials */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0] space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-[#6B6590]">Applicant Student</span>
                  <p className="font-semibold text-[#171258]">{selectedReq.student_name} ({selectedReq.student_demo_id})</p>
                  <p className="text-[11px] text-[#4E4870]">Source: <strong>{selectedReq.credit_source}</strong> &bull; Claimed: <strong>{selectedReq.credits_claimed} credits</strong></p>
                </div>

                {selectedReq.document_reference && (
                  <div className="p-3 bg-white rounded-xl border border-[#E3E1F0] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#6B6590]">Certificate Evidence Reference</span>
                    <p className="font-mono text-[11px] text-indigo-700 truncate">{selectedReq.document_reference}</p>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#171258] mb-1">Administrative Decision</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewAction('approve')}
                      className={`py-2 rounded-lg font-semibold text-center transition-all ${
                        reviewAction === 'approve'
                          ? 'bg-[#1B7A3E] text-white shadow-xs'
                          : 'bg-[#EFEEFB] text-[#4E4870] hover:bg-[#E3E1F0]'
                      }`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('reject')}
                      className={`py-2 rounded-lg font-semibold text-center transition-all ${
                        reviewAction === 'reject'
                          ? 'bg-[#B3261E] text-white shadow-xs'
                          : 'bg-[#EFEEFB] text-[#4E4870] hover:bg-[#E3E1F0]'
                      }`}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewAction('request_info')}
                      className={`py-2 rounded-lg font-semibold text-center transition-all ${
                        reviewAction === 'request_info'
                          ? 'bg-[#B26A00] text-white shadow-xs'
                          : 'bg-[#EFEEFB] text-[#4E4870] hover:bg-[#E3E1F0]'
                      }`}
                    >
                      More Info
                    </button>
                  </div>
                </div>

                {reviewAction === 'approve' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#171258] mb-1">Approved Credits</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={approvedCredits}
                        onChange={(e) => setApprovedCredits(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs font-bold text-center text-[#171258]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#171258] mb-1">Mapped Category</label>
                      <input
                        type="text"
                        value={proposedMapping}
                        onChange={(e) => setProposedMapping(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs text-[#171258]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#171258] mb-1">Committee Audit Explanation *</label>
                  <textarea
                    rows={2}
                    value={adminExplanation}
                    onChange={(e) => setAdminExplanation(e.target.value)}
                    required
                    placeholder="Enter equivalence notes to record in national ABC ledger..."
                    className="w-full p-2.5 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-lg bg-[#171258] hover:bg-[#2D2A6E] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  {actionLoading ? 'Recording in Ledger...' : 'Commit Equivalence Decision'}
                </button>
              </form>
            </div>
          ) : (
            <div className="stitch-card p-12 text-center text-[#6B6590] space-y-2">
              <span className="material-symbols-outlined text-[36px] text-[#8B85B0]">fact_check</span>
              <p className="text-xs">Select any credit claim from the queue to inspect syllabus details and record approval.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
