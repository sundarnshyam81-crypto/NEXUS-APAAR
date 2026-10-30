'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';
import { PageHeader, StatusBadge } from '@/components/ui';

interface CreditRequest {
  id: number;
  request_id: string;
  course_name: string;
  credit_source: string;
  course_identifier: string;
  credits_claimed: number;
  status: string;
  approved_credits: number;
  proposed_mapping?: string;
  admin_explanation?: string;
  created_at: string;
}

export default function StudentCreditTransferPage() {
  const [courseName, setCourseName] = useState('');
  const [creditSource, setCreditSource] = useState('NPTEL');
  const [courseIdentifier, setCourseIdentifier] = useState('');
  const [creditsClaimed, setCreditsClaimed] = useState<number>(4);
  const [completionInfo, setCompletionInfo] = useState('');
  const [docRef, setDocRef] = useState('');
  const [proposedMapping, setProposedMapping] = useState('Discipline Elective');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<CreditRequest[]>([]);

  const loadHistory = async () => {
    try {
      const creds = await api.student.credits();
      if (creds && creds.credit_requests) {
        setHistory(creds.credit_requests);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handlePreFill = (preset: 'nptel' | 'swayam' | 'abc') => {
    if (preset === 'nptel') {
      setCourseName('Deep Learning & Optimization in Python');
      setCreditSource('NPTEL');
      setCourseIdentifier('noc25-cs89-s49102');
      setCreditsClaimed(4);
      setCompletionInfo('Completed Jan-Apr 2025, 87% Elite Certificate');
      setDocRef('https://nptel.ac.in/certificates/noc25-cs89-s49102');
      setProposedMapping('Professional Elective V');
    } else if (preset === 'swayam') {
      setCourseName('Artificial Intelligence for Robotic Systems');
      setCreditSource('SWAYAM');
      setCourseIdentifier('swy-ai-2025-m04');
      setCreditsClaimed(3);
      setCompletionInfo('Passed with Distinction, IIT Kharagpur Offering');
      setDocRef('https://swayam.gov.in/verify/swy-ai-2025-m04');
      setProposedMapping('Open Elective II');
    } else {
      setCourseName('Quantum Computing Algorithms');
      setCreditSource('ABC_TRANSFER');
      setCourseIdentifier('ABC-IITM-QC401');
      setCreditsClaimed(3);
      setCompletionInfo('IIT Madras Summer Term 2025, Grade A');
      setDocRef('digilocker://edu.iitm/cert/2025/qc401');
      setProposedMapping('Advanced Core Elective');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!courseName.trim() || !courseIdentifier.trim()) {
      setErrorMsg('Course Name and Course Identifier are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.student.submitCreditTransfer({
        course_name: courseName.trim(),
        credit_source: creditSource,
        course_identifier: courseIdentifier.trim(),
        credits_claimed: Number(creditsClaimed),
        completion_info: completionInfo.trim() || undefined,
        document_reference: docRef.trim() || undefined,
      });

      setSuccessMsg(`Credit Transfer Request #${res.request_id} submitted! Sent to Dean Academic Affairs.`);
      setCourseName('');
      setCourseIdentifier('');
      setCreditsClaimed(4);
      setCompletionInfo('');
      setDocRef('');
      await loadHistory();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to submit credit transfer request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Credit mobility"
        title="Credit Transfer"
        description="Submit a transfer request, review course details and track the status of existing claims."
        actions={<DemoBadge />}
      />

      {/* Main 2-Column Interface: Application Form & Regulatory Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Credit Submission Form */}
        <div className="lg:col-span-2 stitch-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F26B2A]">edit_document</span>
              New Course Equivalence & Credit Claim Form
            </h3>
            <span className="text-xs text-[#6B6590]">Step 1 of 2</span>
          </div>

          {/* Preset Buttons for Easy Demo Evaluation */}
          <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#171258] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#171258]">bolt</span>
                SIH Evaluator Demo Presets (1-Click Auto-Fill)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePreFill('nptel')}
                className="px-3 py-1 rounded-lg bg-white border border-[#E3E1F0] text-xs font-semibold text-[#171258] hover:bg-[#EFEEFB] shadow-sm transition-all"
              >
                + NPTEL Deep Learning (4 Cr)
              </button>
              <button
                type="button"
                onClick={() => handlePreFill('swayam')}
                className="px-3 py-1 rounded-lg bg-white border border-[#E3E1F0] text-xs font-semibold text-[#171258] hover:bg-[#EFEEFB] shadow-sm transition-all"
              >
                + SWAYAM AI Robotics (3 Cr)
              </button>
              <button
                type="button"
                onClick={() => handlePreFill('abc')}
                className="px-3 py-1 rounded-lg bg-white border border-[#E3E1F0] text-xs font-semibold text-[#171258] hover:bg-[#EFEEFB] shadow-sm transition-all"
              >
                + IIT Madras Quantum (3 Cr)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-[#FCE8E6] border border-[#B3261E]/30 text-[#B3261E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-[#E4F4EA] border border-[#1B7A3E]/30 text-[#1B7A3E] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{successMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#171258] mb-1">Credit Source Body *</label>
                <select
                  value={creditSource}
                  onChange={(e) => setCreditSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
                >
                  <option value="NPTEL">NPTEL (SWAYAM MOOCs)</option>
                  <option value="SWAYAM">SWAYAM National Portal</option>
                  <option value="ABC_TRANSFER">Academic Bank Partner University</option>
                  <option value="INTERNSHIP_CREDIT">AICTE Approved Internship</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#171258] mb-1">Course Roll / Serial Identifier *</label>
                <input
                  type="text"
                  placeholder="e.g. noc25-cs89-s49102"
                  value={courseIdentifier}
                  onChange={(e) => setCourseIdentifier(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#171258] mb-1">Official External Course Title *</label>
              <input
                type="text"
                placeholder="e.g. Introduction to Machine Learning in Healthcare"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#171258] mb-1">Credits Claimed (1 to 20) *</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={creditsClaimed}
                  onChange={(e) => setCreditsClaimed(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none font-bold text-center"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#171258] mb-1">Proposed Home Department Category</label>
                <select
                  value={proposedMapping}
                  onChange={(e) => setProposedMapping(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
                >
                  <option value="Discipline Elective">Discipline / Program Elective</option>
                  <option value="Open Elective">Open / Interdisciplinary Elective</option>
                  <option value="Core Equivalence">Core Program Equivalence</option>
                  <option value="Value Added Course">Skill Enhancement / Value Added</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#171258] mb-1">Score, Grade & Exam Details</label>
              <input
                type="text"
                placeholder="e.g. Score: 88%, Exam Date: April 2025, Proctored Offline"
                value={completionInfo}
                onChange={(e) => setCompletionInfo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#171258] mb-1">Certificate Public URL / Digilocker URI</label>
              <input
                type="text"
                placeholder="https://... or digilocker://..."
                value={docRef}
                onChange={(e) => setDocRef(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                {loading ? 'Submitting to Academic Registry...' : 'Submit Claim for Institutional Approval'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (1 Col): UGC Guidelines & Policies */}
        <div className="space-y-6">
          <div className="stitch-card p-6 space-y-4">
            <h3 className="font-serif text-base font-bold text-[#171258] flex items-center gap-2 border-b border-[#E3E1F0] pb-3">
              <span className="material-symbols-outlined text-[#F26B2A]">gavel</span>
              Statutory Transfer Directives
            </h3>

            <div className="space-y-3 text-xs text-[#4E4870]">
              <div className="p-3 bg-[#F0EEFC] rounded-lg border border-[#E3E1F0] space-y-1">
                <strong className="text-[#171258]">40% Maximum MOOC Cap</strong>
                <p className="text-[11px] leading-relaxed">
                  Per UGC Regulations (Credit Framework for Online Learning), students can acquire a maximum of 40% of their total program credits through SWAYAM courses.
                </p>
              </div>

              <div className="p-3 bg-[#F0EEFC] rounded-lg border border-[#E3E1F0] space-y-1">
                <strong className="text-[#171258]">Curriculum Overlap Norms</strong>
                <p className="text-[11px] leading-relaxed">
                  At least 70% syllabus match is required for core course substitution. For open electives, standard completion certificates suffice.
                </p>
              </div>

              <div className="p-3 bg-[#F0EEFC] rounded-lg border border-[#E3E1F0] space-y-1">
                <strong className="text-[#171258]">Proctored Exam Requirement</strong>
                <p className="text-[11px] leading-relaxed">
                  Courses must culminate in an invigilated proctored examination. Certificates with internal-only assessments are not recognized for ABC transfers.
                </p>
              </div>
            </div>
          </div>

          <div className="stitch-card-lavender p-5 space-y-2 text-xs text-[#4E4870]">
            <div className="flex items-center gap-2 text-[#171258] font-bold">
              <span className="material-symbols-outlined text-[#1B7A3E]">verified</span>
              <span>Audit Logging Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Every submitted request is hashed and recorded in the college administrative audit logs. Department committees verify credentials against the national ABC ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Table: Past & Ongoing Transfer Requests */}
      <div className="stitch-card p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#171258]">history</span>
            Submitted Credit Transfer Claims History
          </h3>
          <span className="text-xs text-[#6B6590]">Total Records: {history.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
              <tr>
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">External Course</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Course Serial</th>
                <th className="py-2.5 px-3 text-center">Claimed</th>
                <th className="py-2.5 px-3 text-center">Approved</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1F0]">
              {history.length > 0 ? (
                history.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F0EEFC]/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#171258]">{req.request_id}</td>
                    <td className="py-3 px-3 font-semibold text-[#1A1A2D]">{req.course_name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#EFEEFB] text-[#2D2A6E]">
                        {req.credit_source}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#6B6590]">{req.course_identifier}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#171258]">{req.credits_claimed}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#1B7A3E]">{req.approved_credits || '-'}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
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
                    <td className="py-3 px-3 text-[11px] text-[#4E4870]">
                      {req.admin_explanation || 'Pending department committee review'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#6B6590]">
                    No past credit transfer claims registered. Use the form above to submit your first claim.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
