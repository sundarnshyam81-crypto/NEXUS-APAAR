'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ProgrammeData {
  id: number;
  name: string;
  department: string;
  approved_intake: number;
  current_enrolled: number;
  institution: string;
  available_seats: number;
  utilisation_pct: number;
  pending_requests: number;
}

export default function AdminCapacityPage() {
  const [programmes, setProgrammes] = useState<ProgrammeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadProgrammes = useCallback(async () => {
    try {
      const data = await api.capacity.programmes();
      setProgrammes(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProgrammes();
  }, [loadProgrammes]);

  const handleSimulateAdmission = async (progId: number) => {
    setActionLoading(progId);
    setFeedback(null);
    try {
      const res = await api.capacity.simulate(progId);
      setFeedback(`Simulated admission for ${res.programme}: 1 seat allocated. Available: ${res.available_seats}`);
      await loadProgrammes();
    } catch (err: unknown) {
      setFeedback(`Simulation Error: ${(err as Error).message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetProgramme = async (progId: number) => {
    try {
      await api.capacity.reset(progId, 30);
      setFeedback('Programme reset to default 30 enrolled seats.');
      await loadProgrammes();
    } catch (err: unknown) {
      setFeedback(`Reset Error: ${(err as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#171258] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-[#6B6590]">Polling Seat Capacity Roster...</p>
      </div>
    );
  }

  const totalIntake = programmes.reduce((acc, p) => acc + p.approved_intake, 0);
  const totalEnrolled = programmes.reduce((acc, p) => acc + p.current_enrolled, 0);
  const totalAvailable = programmes.reduce((acc, p) => acc + p.available_seats, 0);
  const overallUtil = totalIntake > 0 ? Math.round((totalEnrolled / totalIntake) * 100) : 0;

  const chartData = programmes.map((p) => ({
    name: p.department.slice(0, 14),
    Enrolled: p.current_enrolled,
    Available: p.available_seats,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#F26B2A]">
            AICTE / UGC Approved Intake Management &bull; Digital Capacity Twin
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#171258] mt-0.5">
            Department Seat Capacity & Quota Roster
          </h1>
          <p className="text-xs text-[#6B6590] mt-1">
            Real-time monitoring of approved institutional ceiling, category quotas, and automatic waitlist cutoff triggers.
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

      {/* 4 Summary Cards (Stitch Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Total Approved Intake</span>
            <span className="material-symbols-outlined text-[#171258] text-[20px]">account_balance</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#171258]">{totalIntake}</div>
          <p className="text-[11px] text-[#4E4870]">Sanctioned across {programmes.length} departments</p>
        </div>

        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Confirmed Enrolled</span>
            <span className="material-symbols-outlined text-[#1B7A3E] text-[20px]">how_to_reg</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#1B7A3E]">{totalEnrolled}</div>
          <p className="text-[11px] text-[#4E4870]">Single-seat verified admissions</p>
        </div>

        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Available Vacancies</span>
            <span className="material-symbols-outlined text-[#F26B2A] text-[20px]">event_seat</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#F26B2A]">{totalAvailable}</div>
          <p className="text-[11px] text-[#4E4870]">Open for active counselling rounds</p>
        </div>

        <div className="stitch-card p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6B6590] uppercase tracking-wider">Capacity Utilization</span>
            <span className="material-symbols-outlined text-indigo-700 text-[20px]">donut_large</span>
          </div>
          <div className="text-3xl font-serif font-bold text-[#171258]">{overallUtil}%</div>
          <div className="w-full bg-[#EFEEFB] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#171258] h-full rounded-full" style={{ width: `${overallUtil}%` }} />
          </div>
        </div>
      </div>

      {/* Programme Cards Grid with Live 1-Click Simulation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programmes.map((prog) => {
          const util = Math.round((prog.current_enrolled / prog.approved_intake) * 100);
          const isFull = prog.available_seats <= 0;

          return (
            <div key={prog.id} className="stitch-card p-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-[#E3E1F0] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F26B2A]">
                      {prog.department}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#171258] mt-0.5">
                      {prog.name}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isFull
                        ? 'bg-[#FCE8E6] text-[#B3261E]'
                        : util >= 80
                        ? 'bg-[#FFF3DC] text-[#B26A00]'
                        : 'bg-[#E4F4EA] text-[#1B7A3E]'
                    }`}
                  >
                    {isFull ? 'INTAKE FULL' : `${prog.available_seats} SEATS LEFT`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#4E4870]">
                    <span>Intake Utilization: <strong>{prog.current_enrolled} / {prog.approved_intake}</strong></span>
                    <span className="font-bold text-[#171258]">{util}%</span>
                  </div>
                  <div className="w-full bg-[#EFEEFB] h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFull ? 'bg-[#B3261E]' : util >= 80 ? 'bg-[#F26B2A]' : 'bg-[#1B7A3E]'
                      }`}
                      style={{ width: `${Math.min(util, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Statutory Quota Breakdown Representation */}
                <div className="p-3 bg-[#F0EEFC]/50 rounded-xl border border-[#E3E1F0] space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-semibold text-[#6B6590]">Statutory Quota Distribution</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="p-1.5 rounded bg-white border border-[#E3E1F0]">
                      <span className="block text-[#6B6590] text-[9px]">OPEN (50%)</span>
                      <strong className="text-[#171258]">{Math.round(prog.approved_intake * 0.5)}</strong>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#E3E1F0]">
                      <span className="block text-[#6B6590] text-[9px]">OBC (27%)</span>
                      <strong className="text-[#171258]">{Math.round(prog.approved_intake * 0.27)}</strong>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#E3E1F0]">
                      <span className="block text-[#6B6590] text-[9px]">SC/ST (22.5%)</span>
                      <strong className="text-[#171258]">{Math.round(prog.approved_intake * 0.225)}</strong>
                    </div>
                    <div className="p-1.5 rounded bg-white border border-[#E3E1F0]">
                      <span className="block text-[#6B6590] text-[9px]">EWS (10%)</span>
                      <strong className="text-[#171258]">{Math.round(prog.approved_intake * 0.1)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for SIH Hackathon live testing */}
              <div className="pt-3 border-t border-[#E3E1F0] flex items-center justify-between gap-3">
                <button
                  onClick={() => handleSimulateAdmission(prog.id)}
                  disabled={actionLoading === prog.id || isFull}
                  className="px-3.5 py-1.5 rounded-lg bg-[#171258] hover:bg-[#2D2A6E] disabled:bg-[#8B85B0] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  {actionLoading === prog.id ? 'Allocating...' : 'Simulate Admission (+1)'}
                </button>

                <button
                  onClick={() => handleResetProgramme(prog.id)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E3E1F0] hover:bg-[#EFEEFB] text-xs font-semibold text-[#4E4870] transition-all"
                >
                  Reset Capacity
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statutory Reservation Policy Notice */}
      <div className="stitch-card-lavender p-6 rounded-2xl border-l-4 border-l-[#171258] space-y-2 text-xs text-[#4E4870]">
        <h4 className="font-serif font-bold text-sm text-[#171258] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#171258]">policy</span>
          Statutory Compliance Notice: Central Educational Institutions (Reservation in Admission) Act
        </h4>
        <p className="leading-relaxed">
          Seat allocations are strictly governed by AICTE approved intake thresholds and the CEI Act 2006. Any admission request attempting to breach the 100% sanctioned ceiling is automatically halted by the NEXUS APAAR validation gate and directed to an emergency waitlist queue.
        </p>
      </div>
    </div>
  );
}
