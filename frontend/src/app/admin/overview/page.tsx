'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';
import { LoadingState, PageHeader, StatCard, StatusBadge, ProgressBar } from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardMetrics {
  total_students: number;
  total_admission_requests: number;
  approved_applications: number;
  pending_applications: number;
  blocked_rejected_applications: number;
  pending_credit_requests: number;
  total_approved_seats: number;
  total_occupied_seats: number;
  total_available_seats: number;
  verification_passed: number;
  verification_failed: number;
  verification_pending: number;
}

interface ProgrammeItem {
  id: number;
  name: string;
  department: string;
  approved_intake: number;
  current_enrolled: number;
  available_seats: number;
  utilisation_pct: number;
}

interface AdmissionItem {
  id: number;
  request_id: string;
  student_demo_id: string;
  student_name: string;
  programme_name: string;
  department: string;
  status: string;
  has_conflicting_enrolment: boolean;
  created_at: string;
}

const PIE_COLORS = ['#1B7A3E', '#F26B2A', '#B3261E'];

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([]);
  const [pendingAdmissions, setPendingAdmissions] = useState<AdmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scenarioRunning, setScenarioRunning] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [m, p, adm] = await Promise.all([
        api.admin.dashboard(),
        api.capacity.programmes(),
        api.admissions.list(),
      ]);
      setMetrics(m);
      setProgrammes(p || []);
      setPendingAdmissions((adm || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    const handleRefresh = () => loadDashboard();
    window.addEventListener('refreshAdminData', handleRefresh);
    return () => window.removeEventListener('refreshAdminData', handleRefresh);
  }, [loadDashboard]);

  const runScenario = async (s: 'A' | 'B' | 'C') => {
    setScenarioRunning(s);
    setFeedback(null);
    try {
      const res = await api.admissions.runScenario(s);
      setFeedback(`Scenario ${s} Executed: ${res.message}`);
      await loadDashboard();
    } catch (err: unknown) {
      setFeedback(`Scenario Error: ${(err as Error).message}`);
    } finally {
      setScenarioRunning(null);
    }
  };

  const handleDecision = async (id: number, decision: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      await api.admissions.updateStatus(id, {
        status: decision,
        decision_reason: decision === 'approved'
          ? 'Approved by Academic Registrar following verification of non-conflict status.'
          : 'Rejected by Admission Committee due to quota limits or documentation gap.',
      });
      await loadDashboard();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <LoadingState label="Loading college administration overview..." />;
  }

  const pieData = metrics ? [
    { name: 'Approved', value: metrics.approved_applications || 0 },
    { name: 'Pending Review', value: metrics.pending_applications || 0 },
    { name: 'Blocked / Conflict', value: metrics.blocked_rejected_applications || 0 },
  ] : [];

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="College administration"
        title="Overview"
        description="Institutional summary of demo students, admissions, credit transfers and programme seats."
        actions={
          <>
            <Link href="/admin/admissions" className="btn-primary h-10 text-sm">
              Review admissions ({metrics?.pending_applications || 0})
            </Link>
            <Link href="/admin/capacity" className="btn-secondary h-10 text-sm">Seat capacity</Link>
          </>
        }
      />

      {feedback && (
        <div className="p-3.5 rounded-xl bg-[#E4F4EA] border border-[#1B7A3E]/30 text-[#1B7A3E] text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-semibold">{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-[#1B7A3E] hover:opacity-75">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total demo students" value={metrics?.total_students || 10} icon="group" hint="Existing synthetic records" />
        <StatCard label="Admission requests" value={metrics?.total_admission_requests || 0} icon="assignment" hint={`${metrics?.pending_applications || 0} pending · ${metrics?.approved_applications || 0} approved`} />
        <StatCard
          label="Programme seats"
          value={`${metrics?.total_occupied_seats || 0} / ${metrics?.total_approved_seats || 0}`}
          icon="chair"
          hint={<ProgressBar percent={Math.round(((metrics?.total_occupied_seats || 0) / (metrics?.total_approved_seats || 1)) * 100)} />}
        />
        <StatCard label="Credit-transfer queue" value={metrics?.pending_credit_requests || 0} icon="swap_horiz" hint="Awaiting review" />
      </div>
      <div className="hidden">
        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Active Students</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0EEFC] flex items-center justify-center text-[#171258]">
              <span className="material-symbols-outlined text-[20px]">group</span>
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#171258]">
            {metrics?.total_students || 10}
          </div>
          <p className="text-[11px] text-[#4E4870]">10 synthetic demo profiles initialized</p>
        </div>

        {/* KPI 2: Admissions in Pipeline */}
        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Admission Queue</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFF6EE] flex items-center justify-center text-[#F26B2A]">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#171258]">
              {metrics?.total_admission_requests || 0}
            </span>
            <span className="text-xs text-[#B26A00] font-semibold">
              ({metrics?.pending_applications || 0} pending)
            </span>
          </div>
          <p className="text-[11px] text-[#1B7A3E] font-medium">
            {metrics?.approved_applications || 0} approved &bull; {metrics?.blocked_rejected_applications || 0} blocked
          </p>
        </div>

        {/* KPI 3: Seat Capacity */}
        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Seat Utilization</span>
            <div className="w-8 h-8 rounded-lg bg-[#E4F4EA] flex items-center justify-center text-[#1B7A3E]">
              <span className="material-symbols-outlined text-[20px]">chair</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-[#171258]">
              {metrics?.total_occupied_seats || 0}
            </span>
            <span className="text-xs text-[#6B6590]">/ {metrics?.total_approved_seats || 0}</span>
          </div>
          <div className="w-full bg-[#EFEEFB] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#171258] h-full rounded-full"
              style={{
                width: `${Math.round(((metrics?.total_occupied_seats || 0) / (metrics?.total_approved_seats || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* KPI 4: Credit Requests */}
        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Pending Credit Reviews</span>
            <div className="w-8 h-8 rounded-lg bg-[#F0EEFC] flex items-center justify-center text-[#171258]">
              <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#171258]">
            {metrics?.pending_credit_requests || 0}
          </div>
          <p className="text-[11px] text-[#4E4870]">External SWAYAM/NPTEL claims</p>
        </div>
      </div>

      {/* Interactive Scenario Trigger Panel (SIH 2026 Evaluation Suite) */}
      <div className="stitch-card p-6 md:p-8 space-y-4 border-l-4 border-l-[#F26B2A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3E1F0] pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#F26B2A]">play_circle</span>
              Smart India Hackathon Live Demonstration Triggers
            </h3>
            <p className="text-xs text-[#6B6590] mt-0.5">
              Click any scenario to simulate live edge cases and test automated policy enforcement in real-time.
            </p>
          </div>
          <DemoBadge />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <button
            onClick={() => runScenario('A')}
            disabled={Boolean(scenarioRunning)}
            className="p-4 rounded-xl border border-red-200 bg-red-50/40 hover:bg-red-50 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B3261E] text-white">
                  SCENARIO A
                </span>
                <span className="material-symbols-outlined text-[#B3261E] text-[18px]">warning</span>
              </div>
              <h4 className="font-semibold text-xs text-[#B3261E]">Dual Enrolment Conflict Alert</h4>
              <p className="text-[11px] text-[#4E4870] mt-1 leading-relaxed">
                Injects an applicant flagged with an active regular registration at an external university. Demonstrates automatic blocking.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#B3261E] mt-3 group-hover:underline">
              {scenarioRunning === 'A' ? 'Executing...' : 'Trigger Conflict Case &rarr;'}
            </span>
          </button>

          <button
            onClick={() => runScenario('B')}
            disabled={Boolean(scenarioRunning)}
            className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B26A00] text-white">
                  SCENARIO B
                </span>
                <span className="material-symbols-outlined text-[#B26A00] text-[18px]">inventory</span>
              </div>
              <h4 className="font-semibold text-xs text-[#B26A00]">Seat Capacity Limit Overflow</h4>
              <p className="text-[11px] text-[#4E4870] mt-1 leading-relaxed">
                Applies to a saturated department at 100% intake. Tests automated waitlisting and quota overflow rejection.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#B26A00] mt-3 group-hover:underline">
              {scenarioRunning === 'B' ? 'Executing...' : 'Trigger Capacity Overflow &rarr;'}
            </span>
          </button>

          <button
            onClick={() => runScenario('C')}
            disabled={Boolean(scenarioRunning)}
            className="p-4 rounded-xl border border-green-200 bg-green-50/40 hover:bg-green-50 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B7A3E] text-white">
                  SCENARIO C
                </span>
                <span className="material-symbols-outlined text-[#1B7A3E] text-[18px]">verified</span>
              </div>
              <h4 className="font-semibold text-xs text-[#1B7A3E]">Clean Standard Admission</h4>
              <p className="text-[11px] text-[#4E4870] mt-1 leading-relaxed">
                Submits an applicant with verified credentials, zero conflicts, and open quota availability. Tests end-to-end approval.
              </p>
            </div>
            <span className="text-[10px] font-bold text-[#1B7A3E] mt-3 group-hover:underline">
              {scenarioRunning === 'C' ? 'Executing...' : 'Trigger Clean Admission &rarr;'}
            </span>
          </button>
        </div>
      </div>

      {/* Visual Charts & Department Capacity Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admission Pipeline Breakdown Chart */}
        <div className="stitch-card p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#171258] border-b border-[#E3E1F0] pb-3">
            Admissions Status Breakdown
          </h3>

          <div className="h-52 w-full flex items-center justify-center">
            {pieData.reduce((acc, curr) => acc + curr.value, 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-[#6B6590]">No admissions data recorded.</p>
            )}
          </div>

          <div className="flex justify-around text-xs pt-2 border-t border-[#E3E1F0]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B7A3E]"></span>
              <span className="text-[#4E4870]">Approved ({metrics?.approved_applications || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F26B2A]"></span>
              <span className="text-[#4E4870]">Pending ({metrics?.pending_applications || 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B3261E]"></span>
              <span className="text-[#4E4870]">Blocked ({metrics?.blocked_rejected_applications || 0})</span>
            </div>
          </div>
        </div>

        {/* Programme Seat Capacity Utilization */}
        <div className="lg:col-span-2 stitch-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
            <h3 className="font-serif text-base font-bold text-[#171258]">
              Department Seat Capacity Utilization
            </h3>
            <Link href="/admin/capacity" className="text-xs text-indigo-700 hover:underline">
              Manage Quotas &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {programmes.slice(0, 4).map((prog) => {
              const utilPct = Math.round((prog.current_enrolled / prog.approved_intake) * 100);
              return (
                <div key={prog.id} className="p-3 rounded-xl bg-[#F0EEFC]/50 border border-[#E3E1F0] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#171258]">{prog.name}</span>
                    <span className="font-mono text-[#6B6590]">
                      {prog.current_enrolled} / {prog.approved_intake} ({utilPct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EFEEFB] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        utilPct >= 95 ? 'bg-[#B3261E]' : utilPct >= 75 ? 'bg-[#F26B2A]' : 'bg-[#1B7A3E]'
                      }`}
                      style={{ width: `${Math.min(utilPct, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#6B6590]">
                    <span>Department: {prog.department}</span>
                    <span className={prog.available_seats > 0 ? 'text-[#1B7A3E] font-medium' : 'text-[#B3261E] font-bold'}>
                      {prog.available_seats > 0 ? `${prog.available_seats} seats remaining` : 'INTAKE FULL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actionable Admissions Queue Table (Instant 1-Click Decisions) */}
      <div className="stitch-card p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#171258]">pending_actions</span>
            Admissions Review & Conflict Queue
          </h3>
          <Link href="/admin/admissions" className="text-xs text-indigo-700 hover:underline">
            View All ({metrics?.total_admission_requests || 0})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
              <tr>
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Applicant Name</th>
                <th className="py-2.5 px-3">APAAR ID</th>
                <th className="py-2.5 px-3">Programme</th>
                <th className="py-2.5 px-3">Conflict Status</th>
                <th className="py-2.5 px-3">Current Status</th>
                <th className="py-2.5 px-3 text-right">Quick Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1F0]">
              {pendingAdmissions.length > 0 ? (
                pendingAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-[#F0EEFC]/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#171258]">{adm.request_id}</td>
                    <td className="py-3 px-3 font-semibold text-[#1A1A2D]">{adm.student_name}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-[#6B6590]">{adm.student_demo_id}</td>
                    <td className="py-3 px-3 text-[#4E4870]">{adm.programme_name}</td>
                    <td className="py-3 px-3">
                      {adm.has_conflicting_enrolment ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FCE8E6] text-[#B3261E]">
                          ⚠ DUAL ENROLLED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E4F4EA] text-[#1B7A3E]">
                          ✓ CLEARED
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                          adm.status === 'approved'
                            ? 'bg-[#E4F4EA] text-[#1B7A3E]'
                            : adm.status === 'rejected' || adm.status === 'blocked'
                            ? 'bg-[#FCE8E6] text-[#B3261E]'
                            : 'bg-[#FFF3DC] text-[#B26A00]'
                        }`}
                      >
                        {adm.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {adm.status === 'pending_review' || adm.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleDecision(adm.id, 'approved')}
                            disabled={actionLoading === adm.id}
                            className="px-2.5 py-1 rounded bg-[#1B7A3E] text-white text-[11px] font-semibold hover:bg-[#146030] shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDecision(adm.id, 'rejected')}
                            disabled={actionLoading === adm.id}
                            className="px-2.5 py-1 rounded bg-white border border-[#B3261E]/40 text-[#B3261E] text-[11px] font-semibold hover:bg-red-50 shadow-xs"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#6B6590]">Decided</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#6B6590]">
                    No admission requests pending in queue.
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
