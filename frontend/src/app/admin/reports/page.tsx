'use client';

import React, { useState } from 'react';
import DemoBadge from '@/components/DemoBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

const ENROLMENT_DATA = [
  { dept: 'Computer Sci.', approved: 60, enrolled: 52, waitlist: 8 },
  { dept: 'Electronics', approved: 60, enrolled: 48, waitlist: 4 },
  { dept: 'Mechanical', approved: 60, enrolled: 42, waitlist: 2 },
  { dept: 'Civil Eng.', approved: 60, enrolled: 38, waitlist: 0 },
];

const CREDIT_SOURCE_DATA = [
  { name: 'Campus Core Coursework', value: 68, color: '#171258' },
  { name: 'NPTEL Proctored MOOCs', value: 16, color: '#1B7A3E' },
  { name: 'SWAYAM National Portal', value: 10, color: '#F26B2A' },
  { name: 'ABC Credit Mobility', value: 6, color: '#5A4FCF' },
];

const COMPLIANCE_REPORTS = [
  {
    id: 'REP-AISHE-2025',
    title: 'AISHE Annual Institutional Enrollment & Intake Filing',
    authority: 'Ministry of Education & AISHE Portal',
    period: 'Academic Session 2025-2026',
    format: 'PDF & JSON',
    status: 'Certified & Signed',
    date: '2025-10-15',
  },
  {
    id: 'REP-UGC-ABC-Q3',
    title: 'UGC Academic Bank of Credits Reconciliation Statement',
    authority: 'University Grants Commission (ABC Division)',
    period: 'Q3 2025-26',
    format: 'CSV & Signed Digest',
    status: 'Reconciled',
    date: '2025-10-22',
  },
  {
    id: 'REP-AICTE-CAP-04',
    title: 'AICTE Approved Seat Capacity & Quota Compliance Certificate',
    authority: 'All India Council for Technical Education',
    period: 'Cycle 1 Admissions',
    format: 'PDF',
    status: 'Certified Compliant',
    date: '2025-10-28',
  },
  {
    id: 'REP-PRIVACY-ZKP',
    title: 'Privacy Verification & Selective Disclosure Audit Log',
    authority: 'Institutional Privacy Board & SIH Reviewers',
    period: 'Live Session Run',
    format: 'Cryptographic JSON',
    status: 'Simulated Proofs',
    date: '2025-10-30',
  },
];

export default function AdminReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadReport = (rep: typeof COMPLIANCE_REPORTS[0]) => {
    setDownloading(rep.id);
    setTimeout(() => {
      const reportPayload = {
        report_id: rep.id,
        title: rep.title,
        authority: rep.authority,
        reporting_period: rep.period,
        institution: "Indian Institute of Technology, Delhi (AISHE: U-0108)",
        compliance_status: rep.status,
        timestamp: new Date().toISOString(),
        metrics_summary: {
          approved_intake: 240,
          total_enrolled: 180,
          utilization_rate: "75.0%",
          duplicate_conflict_rate: "0.0%",
          abc_credit_transfers_processed: 48,
          zkp_simulated_attestations: 10
        },
        statutory_seal: "NEXUS-APAAR-OFFICIAL-" + Math.random().toString(36).substring(2, 10).toUpperCase()
      };

      const dataUri = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportPayload, null, 2));
      const anchor = document.createElement('a');
      anchor.href = dataUri;
      anchor.download = `${rep.id}_COMPLIANCE_REPORT.json`;
      anchor.click();
      anchor.remove();
      setDownloading(null);
    }, 600);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Department,Approved_Intake,Current_Enrolled,Available_Seats,Utilization_Pct\n" +
      "Computer Science,60,52,8,86.7%\n" +
      "Electronics,60,48,12,80.0%\n" +
      "Mechanical,60,42,18,70.0%\n" +
      "Civil Engineering,60,38,22,63.3%\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "NEXUS_APAAR_SEAT_INTAKE_ANALYTICS.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#F26B2A]">
            Regulatory Analytics & Institutional Reporting &bull; SIH 2026
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#171258] mt-0.5">
            Reports & Institutional Analytics
          </h1>
          <p className="text-xs text-[#6B6590] mt-1">
            Statutory filings, ABC credit distribution ratios, and capacity reconciliation for AISHE and UGC regulatory authorities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge />
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#E3E1F0] text-[#171258] hover:bg-[#EFEEFB] text-xs font-semibold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Analytics CSV
          </button>
        </div>
      </div>

      {/* Analytics Visualization Grid (Charts from Screen 13) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Department Intake vs Enrolled */}
        <div className="stitch-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
            <h3 className="font-serif text-base font-bold text-[#171258]">
              Department Enrolment vs Approved Sanctioned Intake
            </h3>
            <span className="text-xs text-[#6B6590]">AICTE Ceiling Norms</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ENROLMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEEFB" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: '#6B6590' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6590' }} />
                <Tooltip />
                <Bar dataKey="approved" name="Approved Intake" fill="#2D2A6E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="enrolled" name="Current Enrolled" fill="#1B7A3E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-xs pt-2 border-t border-[#E3E1F0]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#2D2A6E]"></span>
              <span className="text-[#4E4870]">Approved Ceiling</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-[#1B7A3E]"></span>
              <span className="text-[#4E4870]">Active Enrolled</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Credit Source Ratios */}
        <div className="stitch-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
            <h3 className="font-serif text-base font-bold text-[#171258]">
              Academic Credit Source Breakdown (NEP 2020 Ratio)
            </h3>
            <span className="text-xs text-[#1B7A3E] font-medium bg-[#E4F4EA] px-2 py-0.5 rounded-full">
              40% Cap Compliant
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CREDIT_SOURCE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CREDIT_SOURCE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E3E1F0]">
            {CREDIT_SOURCE_DATA.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[#4E4870] truncate text-[11px]">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statutory Regulatory Filings & Downloads Table */}
      <div className="stitch-card p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E3E1F0] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#171258] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#171258]">summarize</span>
            Statutory Regulatory Filings & Certified Reports
          </h3>
          <span className="text-xs text-[#6B6590]">Official Institutional Archives</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
              <tr>
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Report Title</th>
                <th className="py-2.5 px-3">Statutory Regulatory Body</th>
                <th className="py-2.5 px-3">Reporting Cycle</th>
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3">Compliance Status</th>
                <th className="py-2.5 px-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1F0]">
              {COMPLIANCE_REPORTS.map((rep) => (
                <tr key={rep.id} className="hover:bg-[#F0EEFC]/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#171258]">{rep.id}</td>
                  <td className="py-3 px-3 font-semibold text-[#1A1A2D]">{rep.title}</td>
                  <td className="py-3 px-3 text-[#4E4870]">{rep.authority}</td>
                  <td className="py-3 px-3 text-[#6B6590]">{rep.period}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-[#EFEEFB] text-[#2D2A6E] font-medium text-[10px]">
                      {rep.format}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase bg-[#E4F4EA] text-[#1B7A3E]">
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleDownloadReport(rep)}
                      disabled={downloading === rep.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-[#E3E1F0] hover:bg-[#EFEEFB] text-xs font-semibold text-[#171258] shadow-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">download</span>
                      {downloading === rep.id ? 'Generating...' : 'Download'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
