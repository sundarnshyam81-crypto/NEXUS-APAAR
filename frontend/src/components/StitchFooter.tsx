'use client';
import React from 'react';
import Link from 'next/link';
import { DemoBadge } from './DemoBadge';

export function StitchFooter() {
  return (
    <footer className="w-full bg-primary text-[#D8D4EE] border-t border-primary-container mt-auto">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 border-b border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div className="space-y-2">
            <h5 className="font-sans font-medium text-white uppercase tracking-wide text-xs">Central Regulatory Links</h5>
            <ul className="space-y-1.5 text-[#c8c5d2]">
              <li>Ministry of Education (MoE)</li>
              <li>University Grants Commission (UGC)</li>
              <li>All India Council for Technical Education (AICTE)</li>
              <li>National Academic Depository (NAD)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-sans font-medium text-white uppercase tracking-wide text-xs">Academic Credit Ecosystem</h5>
            <ul className="space-y-1.5 text-[#c8c5d2]">
              <li>Academic Bank of Credits (ABC)</li>
              <li>SWAYAM National Portal</li>
              <li>NPTEL Proctored MOOCs</li>
              <li>National Credit Framework (NCrF)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-sans font-medium text-white uppercase tracking-wide text-xs">Platform Scope</h5>
            <ul className="space-y-1.5 text-[#c8c5d2]">
              <li>APAAR 12-digit student identity</li>
              <li>Admission and enrolment tracking</li>
              <li>Simulated privacy verification</li>
              <li>Institutional seat capacity</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-sans font-medium text-white uppercase tracking-wide text-xs">Smart India Hackathon 2026</h5>
            <p className="text-xs leading-relaxed text-[#c8c5d2]">
              Problem ID: <strong className="text-white">SIH26263</strong><br />
              Team: <strong className="text-white">Zyvantha</strong><br />
              APAAR ID-Based Student Data Management
            </p>
            <DemoBadge />
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 lg:px-12 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A5A0CE] gap-2">
        <p>
          © 2026 NEXUS APAAR · Team Zyvantha. All academic records displayed are synthetic demonstration data.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/student/login" className="hover:text-white">Student Portal</Link>
          <Link href="/admin/login" className="hover:text-white">College Admin</Link>
          <Link href="/aicte/login" className="hover:text-white">AICTE Admin</Link>
        </div>
      </div>
    </footer>
  );
}

export default StitchFooter;
