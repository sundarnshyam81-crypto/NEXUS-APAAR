'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StitchHeader } from '@/components/StitchHeader';
import { StitchFooter } from '@/components/StitchFooter';
import { CitizenSupportFab } from '@/components/CitizenSupportFab';

const DEMO_STUDENTS = [
  { demo_id: '900000000001', name: 'Shyam', dept: 'AIML', year: 'II', desc: 'Scenario A: Eligible Admission' },
  { demo_id: '900000000002', name: 'Saran Kanna', dept: 'CSE', year: 'II', desc: 'Pending SWAYAM DSA Claim' },
  { demo_id: '900000000003', name: 'Sanjay Kumar', dept: 'IT', year: 'III', desc: 'Approved Enrolment' },
  { demo_id: '900000000004', name: 'Dhiya', dept: 'AIML', year: 'II', desc: 'Standard Profile' },
  { demo_id: '900000000005', name: 'Aarav Kumar', dept: 'CSE', year: 'II', desc: 'Scenario B: Enrolment Conflict' },
  { demo_id: '900000000006', name: 'Priya Sharma', dept: 'ECE', year: 'III', desc: 'Scenario C: Needs Info / ECE' },
  { demo_id: '900000000007', name: 'Karthik S', dept: 'CSE', year: 'IV', desc: 'Senior Year Enrolled (138 cr)' },
  { demo_id: '900000000008', name: 'Divya Nair', dept: 'IT', year: 'I', desc: 'Fresh 1st Year Applicant' },
  { demo_id: '900000000009', name: 'Arjun R', dept: 'EEE', year: 'III', desc: 'Approved NPTEL Transfer' },
  { demo_id: '900000000010', name: 'Meera Krishnan', dept: 'Mechanical', year: 'II', desc: 'Fresh Mechanical Applicant' },
];

export default function StudentLoginPage() {
  const { studentLogin } = useAuth();
  const [demoId, setDemoId] = useState('900000000001');
  const [demoPin, setDemoPin] = useState('2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await studentLogin(demoId.trim(), demoPin.trim());
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid synthetic demonstration credentials');
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (id: string) => {
    setDemoId(id);
    setDemoPin('2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] text-[#1A1A2D] flex flex-col">
      <StitchHeader portalType="student" titleSuffix="Student Gateway" />

      <main className="w-full py-10 pb-16 flex-1 flex flex-col justify-center items-center px-4 sm:px-6">
        <div className="w-full max-w-[960px] flex flex-col gap-6">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-[#6B6B7B]">
            <Link href="/" className="hover:text-[#171258] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Home
            </Link>
            <span>/</span>
            <span className="text-[#2D2A6E] font-semibold">Student Login</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Login Card */}
            <div className="lg:col-span-6 w-full bg-white rounded-lg p-8 sm:p-10 border border-[#E3E1F0] shadow-[0_2px_8px_rgba(40,35,100,0.06)] flex flex-col gap-6">
              {/* Top Emblem & Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8E5FF] flex items-center justify-center text-[#2D2A6E]">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider text-[#474650] font-semibold">
                    National Academic Depository
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#EFECFF] px-2.5 py-1 rounded-full text-[#2D2A6E] text-[11px] font-semibold">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  <span>Secure Gateway</span>
                </div>
              </div>

              {/* Title and Subtitle Block */}
              <div className="flex flex-col gap-1.5">
                <h1 className="font-serif text-[28px] sm:text-[32px] text-[#2D2A6E] font-normal tracking-tight">
                  Student Login
                </h1>
                <p className="text-xs text-[#6B6B7B] leading-relaxed">
                  Access your verified academic credentials and transfer records using your 12-digit synthetic APAAR ID.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-lg bg-[#FCE8E6] border border-[#BA1A1A]/30 text-[#B3261E] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Identifier Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1F1F33] flex items-center justify-between" htmlFor="student-identifier">
                    <span>12-Digit Demo APAAR ID</span>
                    <span className="text-[#6B6B7B] text-[11px] font-mono">Numeric String</span>
                  </label>
                  <input
                    id="student-identifier"
                    type="text"
                    maxLength={12}
                    value={demoId}
                    onChange={(e) => setDemoId(e.target.value)}
                    placeholder="e.g. 900000000001"
                    className="w-full h-11 px-3.5 rounded-lg bg-white border border-[#B8B8C8] text-xs font-mono text-[#1A1A2D] focus:outline-none focus:border-[#2D2A6E] focus:ring-1 focus:ring-[#2D2A6E] transition"
                    required
                  />
                </div>

                {/* Password / PIN Field */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#1F1F33]" htmlFor="student-password">
                      Demo PIN
                    </label>
                    <span className="text-[11px] text-[#5A4FCF] font-mono">Default: 2026</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="student-password"
                      type={showPassword ? 'text' : 'password'}
                      value={demoPin}
                      onChange={(e) => setDemoPin(e.target.value)}
                      placeholder="2026"
                      className="w-full h-11 pl-3.5 pr-10 rounded-lg bg-white border border-[#B8B8C8] text-xs font-mono text-[#1A1A2D] focus:outline-none focus:border-[#2D2A6E] focus:ring-1 focus:ring-[#2D2A6E] transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#787681] hover:text-[#171258]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#474650]">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#2D2A6E]" />
                    <span>Remember this session</span>
                  </label>
                  <span className="text-[#5A4FCF] text-[11px]">Demo Mode Active</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-1 rounded-lg bg-[#2D2A6E] text-white font-medium text-xs hover:bg-[#171258] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <span>{loading ? 'Verifying Credentials...' : 'Sign In as Student'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>

              {/* Security info */}
              <div className="pt-2 border-t border-[#E3E1F0] text-[11px] text-[#6B6B7B] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#1B7A3E]">lock</span>
                <span>Protected by SHA-256 Auth & JWT Role-Based Access Control</span>
              </div>
            </div>

            {/* Right: Predefined Synthetic Accounts Quick-Picker */}
            <div className="lg:col-span-6 w-full bg-[#F0EEFC] rounded-lg p-6 sm:p-8 border border-[#E3E1F0] flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E3E1F0]">
                <div>
                  <h3 className="font-serif text-base font-semibold text-[#2B2568]">
                    Predefined Synthetic Accounts
                  </h3>
                  <p className="text-xs text-[#6B6B7B]">
                    Click any student account to test their unique scenario
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-white text-[#2D2A6E] font-mono font-bold border border-[#E3E1F0]">
                  10 Accounts
                </span>
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {DEMO_STUDENTS.map((s) => {
                  const isSelected = demoId === s.demo_id;
                  return (
                    <button
                      key={s.demo_id}
                      type="button"
                      onClick={() => selectStudent(s.demo_id)}
                      className={`w-full text-left p-3 rounded-lg border transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-white border-[#2D2A6E] shadow-xs'
                          : 'bg-[#FBFAFF] border-[#E3E1F0] hover:bg-white hover:border-[#A39CD8]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#171258]">{s.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EFECFF] text-[#2D2A6E] font-mono font-semibold">
                            {s.dept} • Year {s.year}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#6B6B7B] block mt-0.5">{s.demo_id}</span>
                        <span className="text-[10px] text-[#5A4FCF] font-medium block mt-0.5">{s.desc}</span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-[#787681]">
                        {isSelected ? 'check_circle' : 'chevron_right'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#E3E1F0] text-[11px] text-[#474650]">
                <strong className="text-[#171258]">Judges Note:</strong> Selecting an account auto-fills the 12-digit APAAR ID and default PIN (<strong>2026</strong>).
              </div>
            </div>
          </div>
        </div>
      </main>

      <CitizenSupportFab />
      <StitchFooter />
    </div>
  );
}
