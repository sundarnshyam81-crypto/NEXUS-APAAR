'use client';
import React, { useState } from 'react';

export function CitizenSupportFab() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-lg border border-border overflow-hidden text-on-surface">
          <div className="bg-primary-container p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              <h4 className="font-sans font-medium text-sm text-white">Citizen Support</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white" aria-label="Close support">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div className="p-3 bg-lavender rounded-lg border border-border">
              <strong className="text-heading block">What is an APAAR ID?</strong>
              <p className="text-on-surface-variant mt-1">
                APAAR is a 12-digit academic identity used to organise student records across admissions, credits and verification.
              </p>
            </div>
            <div className="p-3 bg-lavender rounded-lg border border-border">
              <strong className="text-heading block">Is verification cryptographic?</strong>
              <p className="text-on-surface-variant mt-1">
                Privacy checks in this demonstration are simulated workflow results. They are not live zero-knowledge proofs.
              </p>
            </div>
            <p className="text-center text-muted text-xs">Helpdesk (demo): 1800-111-2026</p>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 px-4 rounded-full bg-primary-container text-white font-medium text-sm flex items-center gap-2"
        aria-label="Open citizen assistance"
      >
        <span className="material-symbols-outlined text-[20px]">help</span>
        <span className="hidden sm:inline">Support</span>
      </button>
    </div>
  );
}

export default CitizenSupportFab;
