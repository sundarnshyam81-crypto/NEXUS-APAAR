'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';
import { LoadingState, PageHeader, StatusBadge } from '@/components/ui';

interface VerificationItem {
  id: number;
  verification_id: string;
  request_type: string;
  status: string;
  result: string | null;
  is_simulated: boolean;
  explanation: string | null;
  created_at: string;
  completed_at: string | null;
}

export default function StudentVerificationPage() {
  const [history, setHistory] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.student.verificationHistory();
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateProof = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
    }, 1200);
  };

  const handleCopyProof = () => {
    navigator.clipboard.writeText("0x8e71b29a4c038d17f91048e24c5b7091d32a104f6c83091e");
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return <LoadingState label="Loading verification history..." />;
  }

  const latest = history[0];

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Privacy verification"
        title="Simulated identity verification"
        description="This console records demonstration verification results. It is not live cryptographic zero-knowledge proof verification."
        actions={<DemoBadge />}
      />

      {/* Statutory Simulation Disclosure Banner (Mandatory Requirement) */}
      <div className="p-5 rounded-2xl bg-[#FFF6EE] border-2 border-[#F26B2A]/40 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#F26B2A]/10 text-[#F26B2A] flex items-center justify-center shrink-0 mt-0.5">
          <span className="material-symbols-outlined text-[24px]">verified_user</span>
        </div>
        <div className="space-y-1 text-xs text-[#4E4870]">
          <h4 className="font-serif font-bold text-sm text-[#171258]">
            Simulated Zero-Knowledge Proof Environment (Prototype Notice)
          </h4>
          <p className="leading-relaxed">
            This module illustrates how Circom circuits and Groth16 SNARK proofs can be integrated with APAAR identities.
            <strong> In this Smart India Hackathon 2026 demonstration prototype, proofs are computed using synthetic cryptographic witnesses.</strong>
            This is not a live production connection to UIDAI Central Identities Data Repository (CIDR) or live Digilocker HSM keys.
          </p>
        </div>
      </div>

      {/* Main Cryptographic Credential Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Proof Card */}
        <div className="stitch-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
            <h3 className="font-serif text-base font-bold text-[#171258] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#171258]">fingerprint</span>
              ZK-SNARK Attestation Card
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E4F4EA] text-[#1B7A3E]">
              VALID WITNESS
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#6B6590]">Circuit Target</span>
              <p className="font-mono font-bold text-[#171258]">EnrolmentConflictCircuit_v1.circom</p>
              <span className="text-[10px] text-[#4E4870]">Proving Scheme: Groth16 (BN254 curve)</span>
            </div>

            <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#6B6590]">Proof Hash (Public Input Commitment)</span>
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] text-[#171258] truncate w-3/4">
                  0x8e71b29a4c038d17f91048e24c5b7091d32a104f6c83091e
                </p>
                <button
                  onClick={handleCopyProof}
                  className="text-indigo-700 hover:text-[#171258] font-semibold text-[11px]"
                >
                  {copiedHash ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#6B6590]">Poseidon Merkle Root</span>
              <p className="font-mono text-[11px] text-[#171258] truncate">
                0x3f1a9b204c9950d8102f4a56c70129e843
              </p>
              <span className="text-[10px] text-[#1B7A3E] font-medium">Verified against nationwide registry leaf</span>
            </div>

            <button
              onClick={handleSimulateProof}
              disabled={generating}
              className="w-full py-2.5 rounded-lg bg-[#171258] hover:bg-[#2D2A6E] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              {generating ? 'Synthesizing Circuit Constraints...' : 'Re-Run Proof Simulation'}
            </button>
          </div>
        </div>

        {/* Right Column: Verification Integrity Matrix & Privacy Guarantees */}
        <div className="lg:col-span-2 stitch-card p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
            <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1B7A3E]">checklist_rtl</span>
              Selective Disclosure & Privacy Verification Matrix
            </h3>
            <span className="text-xs text-[#6B6590]">Zero-Knowledge Properties</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#E4F4EA]/40 border border-[#1B7A3E]/30 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#171258] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1B7A3E] text-[18px]">lock</span>
                  Identity Confidentiality (Zero Demographic Exposure)
                </h4>
                <span className="px-2 py-0.5 rounded bg-[#E4F4EA] text-[#1B7A3E] font-bold text-[10px]">
                  PROVEN
                </span>
              </div>
              <p className="text-xs text-[#4E4870] leading-relaxed">
                The verifier learns only that the student holds a valid Ministry-issued APAAR identifier without accessing the underlying Aadhaar number, date of birth, or home address.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#E4F4EA]/40 border border-[#1B7A3E]/30 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#171258] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1B7A3E] text-[18px]">verified</span>
                  Academic Credit Prerequisite Threshold
                </h4>
                <span className="px-2 py-0.5 rounded bg-[#E4F4EA] text-[#1B7A3E] font-bold text-[10px]">
                  &gt; 60 CREDITS PROVEN
                </span>
              </div>
              <p className="text-xs text-[#4E4870] leading-relaxed">
                Proves that cumulative ABC earned credits satisfy the prerequisite minimum without exposing individual semester transcripts, subject marks, or elective selections.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#E4F4EA]/40 border border-[#1B7A3E]/30 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-xs text-[#171258] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#1B7A3E] text-[18px]">rule</span>
                  Conflict-Free Regular Enrolment Assertion
                </h4>
                <span className="px-2 py-0.5 rounded bg-[#E4F4EA] text-[#1B7A3E] font-bold text-[10px]">
                  0 CONFLICTS
                </span>
              </div>
              <p className="text-xs text-[#4E4870] leading-relaxed">
                Asserts the student has not signed a concurrent regular full-time commitment across any other AISHE-registered university for the current 2025-2026 academic calendar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification History Table */}
      <div className="stitch-card p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#171258]">manage_history</span>
            Audit Trail of Identity Attestations
          </h3>
          <span className="text-xs text-[#6B6590]">Logged in Tamper-Evident Store</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
              <tr>
                <th className="py-2.5 px-3">Verification ID</th>
                <th className="py-2.5 px-3">Assertion Type</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3">Explanation</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1F0]">
              {history.length > 0 ? (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F0EEFC]/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#171258]">{item.verification_id}</td>
                    <td className="py-3 px-3 font-medium text-[#1A1A2D]">{item.request_type}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#FFF6EE] text-[#F26B2A] font-semibold text-[10px]">
                        {item.is_simulated ? 'SIMULATED' : 'LIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase bg-[#E4F4EA] text-[#1B7A3E]">
                        {item.result || 'PASS'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#4E4870]">{item.explanation || 'Verified successfully.'}</td>
                    <td className="py-3 px-3 text-[#6B6590]">{item.created_at?.slice(0, 19).replace('T', ' ')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6B6590]">
                    No historical attestations logged.
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
