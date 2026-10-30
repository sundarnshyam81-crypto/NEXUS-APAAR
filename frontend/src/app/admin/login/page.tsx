'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StitchHeader } from '@/components/StitchHeader';
import { StitchFooter } from '@/components/StitchFooter';
import { CitizenSupportFab } from '@/components/CitizenSupportFab';

export default function CollegeAdminLoginPage() {
  const { adminLogin } = useAuth();
  const [instCode, setInstCode] = useState('AISHE-U-0109');
  const [adminId, setAdminId] = useState('collegeadmin');
  const [password, setPassword] = useState('CollegeDemo@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(adminId.trim(), password.trim());
    } catch (err: unknown) {
      setError((err as Error).message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaults = () => {
    setInstCode('AISHE-U-0109');
    setAdminId('collegeadmin');
    setPassword('CollegeDemo@2026');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FCF8FF] text-[#1A1A2D] flex flex-col">
      <StitchHeader portalType="admin" titleSuffix="Administration Control" />

      <main className="w-full py-10 pb-16 flex-1 flex flex-col justify-center items-center px-4 sm:px-6">
        <div className="w-full max-w-[500px] flex flex-col gap-6">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-[#6B6B7B]">
            <Link href="/" className="hover:text-[#171258] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">home</span>
              Home
            </Link>
            <span>/</span>
            <span className="text-[#6B6B7B]">Administration</span>
            <span>/</span>
            <span className="text-[#2D2A6E] font-semibold">Admin Login</span>
          </nav>

          {/* Login Main Card */}
          <div className="w-full bg-white rounded-lg p-8 sm:p-10 border border-[#E3E1F0] shadow-[0_2px_8px_rgba(40,35,100,0.06)] flex flex-col gap-6 relative">
            {/* Top Emblem & Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E8E5FF] flex items-center justify-center text-[#2D2A6E]">
                  <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-[#474650] font-semibold">
                  Institutional Authority
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#EFECFF] px-2.5 py-1 rounded-full text-[#2D2A6E] text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[14px]">shield</span>
                <span>Registrar Console</span>
              </div>
            </div>

            {/* Title Block */}
            <div className="flex flex-col gap-1.5">
              <h1 className="font-serif text-[28px] sm:text-[32px] text-[#2D2A6E] font-normal tracking-tight">
                College Administration Login
              </h1>
              <p className="text-xs text-[#6B6B7B] leading-relaxed">
                Authorised institutional portal for admission processing, seat capacity management, and academic credit verification.
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
              {/* Institution Code Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1F1F33] flex items-center justify-between" htmlFor="inst-code">
                  <span>Institutional AISHE Code</span>
                  <span className="text-[#6B6B7B] text-[11px]">AICTE / MoE Code</span>
                </label>
                <input
                  id="inst-code"
                  type="text"
                  value={instCode}
                  onChange={(e) => setInstCode(e.target.value)}
                  placeholder="e.g. AISHE-U-0109"
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-[#B8B8C8] text-xs font-mono text-[#1A1A2D] focus:outline-none focus:border-[#2D2A6E] focus:ring-1 focus:ring-[#2D2A6E] transition"
                  required
                />
              </div>

              {/* Admin ID Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1F1F33]" htmlFor="admin-id">
                  Administrator Username
                </label>
                <input
                  id="admin-id"
                  type="text"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="collegeadmin"
                  className="w-full h-11 px-3.5 rounded-lg bg-white border border-[#B8B8C8] text-xs font-mono text-[#1A1A2D] focus:outline-none focus:border-[#2D2A6E] focus:ring-1 focus:ring-[#2D2A6E] transition"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1F1F33]" htmlFor="admin-password">
                    Security Password
                  </label>
                  <button
                    type="button"
                    onClick={loadDefaults}
                    className="text-[11px] text-[#5A4FCF] hover:underline"
                  >
                    Load Demo Credentials
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-1 rounded-lg bg-[#2D2A6E] text-white font-medium text-xs hover:bg-[#171258] transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>{loading ? 'Authenticating Officer...' : 'Login Securely as Administrator'}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-[#E3E1F0] flex items-center justify-between text-[11px] text-[#6B6B7B]">
              <Link href="/student/login" className="text-[#2D2A6E] hover:underline font-medium">
                ← Switch to Student Gateway
              </Link>
              <span>Audit Logged Session</span>
            </div>
          </div>
        </div>
      </main>

      <CitizenSupportFab />
      <StitchFooter />
    </div>
  );
}
