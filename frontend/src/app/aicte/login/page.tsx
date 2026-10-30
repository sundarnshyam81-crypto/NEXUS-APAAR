'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import StitchHeader from '@/components/StitchHeader';
import StitchFooter from '@/components/StitchFooter';
import CitizenSupportFab from '@/components/CitizenSupportFab';

export default function AicteLoginPage() {
  const { aicteAdminLogin } = useAuth();
  const [adminId, setAdminId] = useState('aicteadmin');
  const [password, setPassword] = useState('AICTEDemo@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await aicteAdminLogin(adminId.trim(), password);
    } catch (loginError) {
      setError((loginError as Error).message || 'Unable to authenticate AICTE administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <StitchHeader titleSuffix="AICTE Administration" />
      <main className="w-full py-10 pb-16 flex-1 flex flex-col justify-center items-center px-4 sm:px-6">
        <div className="w-full max-w-[500px] flex flex-col gap-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="text-primary-container hover:underline">Home</Link>
            <span>/</span>
            <span className="font-semibold text-heading">AICTE Administrator Login</span>
          </nav>
          <section className="w-full stitch-card p-8 sm:p-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-lavender flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <span className="text-xs uppercase tracking-wider font-semibold text-muted">AICTE Oversight Portal</span>
              </div>
              <span className="status-pill status-default">Demo access</span>
            </div>
            <div>
              <h1 className="font-serif text-[28px] sm:text-[32px] text-heading">AICTE Administrator Login</h1>
              <p className="text-sm text-muted mt-2">Review synthetic institution approvals, courses, intake, and compliance submissions.</p>
            </div>
            {error && <div role="alert" className="p-3 rounded-lg bg-rejected-bg border border-rejected/20 text-rejected text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="aicte-admin-id" className="field-label">Administrator ID</label>
                <input id="aicte-admin-id" value={adminId} onChange={(event) => setAdminId(event.target.value)} className="field-input" autoComplete="username" required />
              </div>
              <div>
                <label htmlFor="aicte-admin-password" className="field-label">Password</label>
                <input id="aicte-admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field-input" autoComplete="current-password" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
                {loading ? 'Authenticating...' : 'Login to AICTE Portal'}
              </button>
            </form>
            <div className="border-t border-border pt-4 flex flex-wrap gap-4 text-sm">
              <Link href="/student/login" className="text-primary-container hover:underline">Student login</Link>
              <Link href="/admin/login" className="text-primary-container hover:underline">College Admin login</Link>
            </div>
            <p className="text-xs text-muted">Demo credentials are configurable with AICTE_ADMIN_ID and AICTE_ADMIN_PASSWORD backend environment variables.</p>
          </section>
        </div>
      </main>
      <CitizenSupportFab />
      <StitchFooter />
    </div>
  );
}
