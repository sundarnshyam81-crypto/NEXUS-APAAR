'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';

interface VerificationRecordItem {
  id: number;
  verification_id: string;
  student_id: number;
  student_name: string;
  student_demo_id: string;
  request_type: string;
  status: string;
  result: string | null;
  is_simulated: boolean;
  explanation: string | null;
  created_at: string;
  completed_at: string | null;
}

interface StudentOption {
  id: number;
  demo_id: string;
  full_name: string;
  department: string;
}

export default function AdminVerificationPage() {
  const [records, setRecords] = useState<VerificationRecordItem[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runFeedback, setRunFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [verifs, studs] = await Promise.all([
        api.verification.records(),
        api.admin.students(),
      ]);
      setRecords(verifs || []);
      if (studs && studs.students) {
        setStudents(studs.students);
        if (studs.students.length > 0) setSelectedStudentId(studs.students[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteVerification = async () => {
    setRunning(true);
    setRunFeedback(null);
    try {
      const res = await api.verification.execute({
        student_id: selectedStudentId,
        request_type: 'enrolment_conflict_and_prerequisites',
        parameters: { simulated_environment: true, check_all_partners: true },
      });
      setRunFeedback(`Verification ${res.verification_id} executed: ${res.result.toUpperCase()} - ${res.explanation}`);
      await loadData();
    } catch (err: unknown) {
      setRunFeedback(`Verification Error: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#F26B2A]">
            Cryptographic Integrity Audit Desk &bull; SnarkJS Interface
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#171258] mt-0.5">
            Privacy Verification Monitoring
          </h1>
          <p className="text-xs text-[#6B6590] mt-1">
            Simulated Zero-Knowledge proof execution testing non-conflict status without exposing private student records.
          </p>
        </div>
        <DemoBadge />
      </div>

      {runFeedback && (
        <div className="p-3.5 rounded-xl bg-[#E4F4EA] border border-[#1B7A3E]/30 text-[#1B7A3E] text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-semibold">{runFeedback}</span>
          </div>
          <button onClick={() => setRunFeedback(null)} className="text-[#1B7A3E] hover:opacity-75">✕</button>
        </div>
      )}

      {/* Verification Simulation Launcher Card */}
      <div className="stitch-card p-6 md:p-8 space-y-4">
        <div className="border-b border-[#E3E1F0] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#171258]">lock_open</span>
            Run Privacy-Preserving Attestation Simulation
          </h3>
          <p className="text-xs text-[#6B6590] mt-0.5">
            Select a student to run the simulated Groth16 circuit and test admission prerequisite compliance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs">
          <div className="w-full sm:w-80">
            <label className="block font-semibold text-[#171258] mb-1">Select Candidate Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.demo_id}) - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div className="self-end sm:self-auto pt-5 sm:pt-6">
            <button
              onClick={handleExecuteVerification}
              disabled={running}
              className="px-5 py-2.5 rounded-lg bg-[#171258] hover:bg-[#2D2A6E] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              {running ? 'Synthesizing Circuit Proof...' : 'Execute Attestation Check'}
            </button>
          </div>
        </div>
      </div>

      {/* Verification Records Table */}
      <div className="stitch-card p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#171258]">history</span>
            Verification Records & Attestation History
          </h3>
          <span className="text-xs text-[#6B6590]">Total: {records.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
              <tr>
                <th className="py-2.5 px-3">Verification ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">APAAR ID</th>
                <th className="py-2.5 px-3">Assertion Type</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1F0]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6590]">
                    Loading verification records...
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#F0EEFC]/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#171258]">{rec.verification_id}</td>
                    <td className="py-3 px-3 font-semibold text-[#1A1A2D]">{rec.student_name}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#6B6590]">{rec.student_demo_id}</td>
                    <td className="py-3 px-3 text-[#4E4870]">{rec.request_type}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF6EE] text-[#F26B2A]">
                        {rec.is_simulated ? 'SIMULATED' : 'LIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          rec.result === 'passed' || rec.result === 'simulated_pass'
                            ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                            : 'bg-[#FCE8E6] text-[#B3261E]'
                        }`}
                      >
                        {rec.result || rec.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#4E4870] leading-relaxed max-w-xs truncate" title={rec.explanation || ''}>
                      {rec.explanation || 'Proof verified successfully.'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6590]">
                    No verification records logged.
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
