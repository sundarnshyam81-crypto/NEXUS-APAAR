'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';

interface StudentRow {
  id: number;
  demo_id: string;
  full_name: string;
  department: string;
  academic_year: string;
  enrolment_status: string;
  admission_status: string;
  credit_status: string;
  credits_earned: number;
  degree_programme: string;
  institution: string;
}

interface StudentDetail {
  student: StudentRow & { credits_required: number };
  admission_requests: Array<{
    request_id: string;
    status: string;
    created_at: string;
    decision_reason?: string;
    has_conflicting_enrolment: boolean;
    seat_allocated: boolean;
  }>;
  credit_requests: Array<{
    request_id: string;
    course_name: string;
    credit_source: string;
    credits_claimed: number;
    status: string;
    approved_credits: number;
    admin_explanation?: string;
  }>;
  verifications: Array<{
    verification_id: string;
    request_type: string;
    status: string;
    result: string;
    is_simulated: boolean;
    explanation?: string;
  }>;
  audit_events: Array<{
    event_id: string;
    timestamp: string;
    actor_role: string;
    event_type: string;
    explanation?: string;
  }>;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [admissionStatus, setAdmissionStatus] = useState('');

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (department) params.department = department;
      if (admissionStatus) params.admission_status = admissionStatus;

      const res = await api.admin.students(params);
      setStudents(res.students || []);
    } catch (err) {
      console.error('Failed to fetch students', err);
    } finally {
      setLoading(false);
    }
  }, [search, department, admissionStatus]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenDetail = async (demoId: string) => {
    setDetailLoading(true);
    try {
      const detail = await api.admin.studentDetail(demoId);
      setSelectedStudent(detail);
    } catch (err) {
      console.error('Failed to fetch student detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#F26B2A]">
            National Student Master Database &bull; APAAR Integrated Directory
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#171258] mt-0.5">
            Student Records Management
          </h1>
          <p className="text-xs text-[#6B6590] mt-1">
            Searchable institutional registry of 10 synthetic student records with verified ABC credit ledgers and single-seat status.
          </p>
        </div>
        <DemoBadge />
      </div>

      {/* Filter and Search Bar (Stitch Design) */}
      <div className="stitch-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search by Name / ID */}
          <div className="sm:col-span-5 relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6B6590] text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by student legal name or 12-digit APAAR ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
            />
          </div>

          {/* Department Filter */}
          <div className="sm:col-span-4">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
            >
              <option value="">All Departments (IIT Delhi)</option>
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Electronics">Electronics & Communication</option>
              <option value="Mechanical">Mechanical Engineering</option>
              <option value="Civil">Civil Engineering</option>
              <option value="Information Tech">Information Technology</option>
            </select>
          </div>

          {/* Admission Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={admissionStatus}
              onChange={(e) => setAdmissionStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-xs text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
            >
              <option value="">All Enrolment States</option>
              <option value="approved">Enrolled (Approved)</option>
              <option value="pending">Pending Verification</option>
              <option value="blocked">Flagged Conflict</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6B6590] pt-1">
          <span>Found <strong>{students.length}</strong> student records matching current filters</span>
          {(search || department || admissionStatus) && (
            <button
              onClick={() => { setSearch(''); setDepartment(''); setAdmissionStatus(''); }}
              className="text-indigo-700 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Master Students Table */}
      <div className="stitch-card p-6 md:p-8 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
              <tr>
                <th className="py-2.5 px-3">APAAR ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Department & Programme</th>
                <th className="py-2.5 px-3 text-center">ABC Credits</th>
                <th className="py-2.5 px-3">Enrolment Standing</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1F0]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B6590]">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F0EEFC]/40 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#171258] bg-[#EFEEFB] px-2 py-0.5 rounded border border-[#E3E1F0]">
                        {s.demo_id}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#1A1A2D]">{s.full_name}</div>
                      <span className="text-[10px] text-[#6B6590]">ABC-IND-{s.demo_id.slice(-4)}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#171258]">{s.department}</div>
                      <span className="text-[10px] text-[#6B6590]">{s.degree_programme}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-sm text-[#171258]">{s.credits_earned}</span>
                      <span className="text-[10px] text-[#6B6590] block">/ 160 req</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                          s.enrolment_status.toLowerCase().includes('active') || s.enrolment_status.toLowerCase().includes('enrolled')
                            ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                            : s.enrolment_status.toLowerCase().includes('conflict') || s.enrolment_status.toLowerCase().includes('review')
                            ? 'bg-[#FCE8E6] text-[#B3261E]'
                            : 'bg-[#FFF3DC] text-[#B26A00]'
                        }`}
                      >
                        {s.enrolment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenDetail(s.demo_id)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white border border-[#E3E1F0] text-xs font-semibold text-[#171258] hover:bg-[#EFEEFB] shadow-xs transition-all"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        Inspect Record
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#6B6590]">
                    No students found matching current search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E3E1F0] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-[#E3E1F0] pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-[#F26B2A]">
                  Student Identity Record Inspection
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#171258] mt-0.5">
                  {selectedStudent.student.full_name}
                </h3>
                <p className="text-xs text-[#6B6590]">
                  APAAR ID: <span className="font-mono font-bold text-[#171258]">{selectedStudent.student.demo_id}</span> &bull; {selectedStudent.student.institution}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-[#EFEEFB] hover:bg-[#E3E1F0] flex items-center justify-center text-[#171258] font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0]">
                <span className="text-[#6B6590] text-[10px] uppercase font-bold">Department</span>
                <p className="font-semibold text-[#171258] mt-0.5">{selectedStudent.student.department}</p>
              </div>
              <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0]">
                <span className="text-[#6B6590] text-[10px] uppercase font-bold">Academic Year</span>
                <p className="font-semibold text-[#171258] mt-0.5">{selectedStudent.student.academic_year || '2025-26'}</p>
              </div>
              <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0]">
                <span className="text-[#6B6590] text-[10px] uppercase font-bold">Credits Earned</span>
                <p className="font-serif font-bold text-base text-[#171258] mt-0.5">{selectedStudent.student.credits_earned} / 160</p>
              </div>
              <div className="p-3 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0]">
                <span className="text-[#6B6590] text-[10px] uppercase font-bold">Enrolment Status</span>
                <p className="font-semibold text-[#1B7A3E] mt-0.5">{selectedStudent.student.enrolment_status}</p>
              </div>
            </div>

            {/* Admissions Pipeline Status for this Student */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#171258] border-b border-[#E3E1F0] pb-2">
                Admission History & Deduplication Audit
              </h4>
              {selectedStudent.admission_requests.length > 0 ? (
                selectedStudent.admission_requests.map((adm, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#F0EEFC]/50 border border-[#E3E1F0] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#171258]">Request #{adm.request_id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E4F4EA] text-[#1B7A3E]">
                        {adm.status}
                      </span>
                    </div>
                    <p className="text-[#4E4870]">{adm.decision_reason || 'Admission processed and verified.'}</p>
                    {adm.has_conflicting_enrolment && (
                      <p className="text-[#B3261E] font-bold">⚠ Flagged: Dual regular full-time enrolment detected.</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B6590]">No admission history found.</p>
              )}
            </div>

            {/* Credit Transfer Claims */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-sm text-[#171258] border-b border-[#E3E1F0] pb-2">
                External Credit Mapping Claims
              </h4>
              {selectedStudent.credit_requests.length > 0 ? (
                selectedStudent.credit_requests.map((cr, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#F0EEFC]/50 border border-[#E3E1F0] text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#171258]">{cr.course_name}</span>
                      <span className="text-[10px] text-[#6B6590] block">{cr.credit_source} &bull; Claimed: {cr.credits_claimed} Cr</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#EFEEFB] text-[#2D2A6E]">
                      {cr.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B6590]">No external credit claims recorded.</p>
              )}
            </div>

            <div className="pt-2 border-t border-[#E3E1F0] flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 rounded-lg bg-[#171258] text-white text-xs font-semibold hover:bg-[#2D2A6E]"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
