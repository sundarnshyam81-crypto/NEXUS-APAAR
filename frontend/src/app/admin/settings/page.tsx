'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';

export default function AdminSettingsPage() {
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const resetAllScenarios = async () => {
    setResetting(true);
    try {
      await Promise.all([
        api.admissions.resetScenario('A'),
        api.admissions.resetScenario('B'),
        api.admissions.resetScenario('C'),
      ]);
      setResetFeedback('All demonstration scenarios (A, B, C) have been restored to baseline demonstration state.');
      setTimeout(() => setResetFeedback(null), 5000);
    } catch (err: unknown) {
      setResetFeedback(`Error: ${(err as Error).message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#F26B2A]">
            Autonomous Institutional Node Settings &bull; AISHE U-0108
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#171258] mt-0.5">
            System Configuration & Demonstration Controls
          </h1>
          <p className="text-xs text-[#6B6590] mt-1">
            Manage Gemini AI integration adapters, Zero-Knowledge verification hooks, and reset synthetic demo databases.
          </p>
        </div>
        <DemoBadge />
      </div>

      {resetFeedback && (
        <div className="p-3.5 rounded-xl bg-[#E4F4EA] border border-[#1B7A3E]/30 text-[#1B7A3E] text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span className="font-semibold">{resetFeedback}</span>
          </div>
          <button onClick={() => setResetFeedback(null)} className="text-[#1B7A3E] hover:opacity-75">✕</button>
        </div>
      )}

      {/* Demonstration State Reset Card */}
      <div className="stitch-card p-6 md:p-8 space-y-4 border-l-4 border-l-[#F26B2A]">
        <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#F26B2A]">restart_alt</span>
            <h3 className="font-serif text-lg font-bold text-[#171258]">
              Demonstration Environment Reset
            </h3>
          </div>
          <span className="text-xs text-[#6B6590]">SIH Evaluator Utility</span>
        </div>

        <p className="text-xs text-[#4E4870] leading-relaxed">
          Restore all 10 synthetic student accounts, clear injected edge-case admissions (Scenario A conflict, Scenario B capacity overflow, Scenario C clean pass), and reset department seat rosters back to their original presentation state.
        </p>

        <button
          onClick={resetAllScenarios}
          disabled={resetting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#171258] hover:bg-[#2D2A6E] text-white text-xs font-semibold shadow-xs transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">rotate_right</span>
          {resetting ? 'Resetting Scenarios...' : 'Reset All Scenarios (A, B, C) to Baseline'}
        </button>
      </div>

      {/* AI & Credit Intelligence Integration Settings */}
      <div className="stitch-card p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E3E1F0] pb-3">
          <span className="material-symbols-outlined text-[#171258]">smart_toy</span>
          <h3 className="font-serif text-lg font-bold text-[#171258]">
            AI & Credit Intelligence Layer (LangChain & Gemini)
          </h3>
        </div>

        <div className="space-y-3 text-xs text-[#4E4870]">
          <p className="leading-relaxed">
            NEXUS APAAR features an integration bridge for Google Gemini and LangChain to assist academic committees in parsing external course syllabi and identifying curriculum equivalence percentages.
          </p>

          <div className="p-3.5 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#171258] block">Integration Engine Mode:</span>
              <span className="text-[11px] text-[#6B6590]">Operating in Deterministic Rule-Based Fallback Mode</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#E4F4EA] text-[#1B7A3E]">
              Zero-Key Standalone Active
            </span>
          </div>

          <p className="text-[11px] text-[#6B6590]">
            Per SIH 2026 problem statement guidelines, the platform functions fully autonomously without requiring an active external API key. No policy citations or AI outputs are fabricated.
          </p>
        </div>
      </div>

      {/* Cryptographic Zero-Knowledge Simulation Config */}
      <div className="stitch-card p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E3E1F0] pb-3">
          <span className="material-symbols-outlined text-[#1B7A3E]">lock</span>
          <h3 className="font-serif text-lg font-bold text-[#171258]">
            Zero-Knowledge Verifier Circuit Configuration (SnarkJS Interface)
          </h3>
        </div>

        <div className="space-y-3 text-xs text-[#4E4870]">
          <p className="leading-relaxed">
            The platform is prepared with explicit abstraction boundaries for Circom-compiled Groth16 SnarkJS verifier contracts.
          </p>

          <div className="p-3.5 bg-[#F0EEFC] rounded-xl border border-[#E3E1F0] space-y-1 font-mono text-[11px]">
            <div className="text-[#171258]">Circuit: EnrolmentConflictCircuit_v1.circom</div>
            <div className="text-[#6B6590]">Curve: BN254 &bull; Hash: Poseidon Sponge Function</div>
            <div className="text-[#1B7A3E]">Status: Transparent Simulation Layer Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}
