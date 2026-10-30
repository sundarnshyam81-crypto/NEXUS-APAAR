'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import DemoBadge from '@/components/DemoBadge';

interface AuditEventItem {
  id: number;
  event_id: string;
  timestamp: string;
  actor_role: string;
  actor_reference: string;
  event_type: string;
  related_request_id: string | null;
  related_student_demo_id: string | null;
  previous_state: string | null;
  new_state: string | null;
  explanation: string | null;
}

export default function AdminAuditPage() {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [studentFilter, setStudentFilter] = useState('');
  const [requestFilter, setRequestFilter] = useState('');

  const loadAuditEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (eventTypeFilter) params.event_type = eventTypeFilter;
      if (studentFilter) params.student_demo_id = studentFilter;
      if (requestFilter) params.request_id = requestFilter;

      const res = await api.audit.events(params);
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [eventTypeFilter, studentFilter, requestFilter]);

  useEffect(() => {
    loadAuditEvents();
  }, [loadAuditEvents]);

  const handleExportCSV = async () => {
    try {
      await api.audit.exportCSV();
    } catch {
      // Fallback manual CSV export
      const headers = "Event_ID,Timestamp,Actor_Role,Event_Type,Student_ID,Request_ID,Explanation\n";
      const rows = events.map(e =>
        `"${e.event_id}","${e.timestamp}","${e.actor_role}","${e.event_type}","${e.related_student_demo_id || ''}","${e.related_request_id || ''}","${(e.explanation || '').replace(/"/g, '""')}"`
      ).join("\n");
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `NEXUS_APAAR_AUDIT_LOGS_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E1F0] pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-[#F26B2A]">
            Tamper-Evident Administrative Audit Log &bull; Institutional Non-Repudiation
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#171258] mt-0.5">
            Administrative Audit & Event Trail
          </h1>
          <p className="text-xs text-[#6B6590] mt-1">
            Immutable log of all admission reviews, conflict resolutions, seat capacity changes, and credit transfers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge />
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#171258] hover:bg-[#2D2A6E] text-white text-xs font-semibold shadow-xs transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Audit Trail (CSV)
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Stitch Design) */}
      <div className="stitch-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#171258] mb-1">Filter by Event Type</label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] focus:ring-2 focus:ring-[#171258] focus:outline-none"
            >
              <option value="">All Event Actions</option>
              <option value="admission_approved">admission_approved</option>
              <option value="admission_rejected">admission_rejected</option>
              <option value="verification_executed">verification_executed</option>
              <option value="capacity_checked">capacity_checked</option>
              <option value="seat_allocated">seat_allocated</option>
              <option value="credit_mapping_approved">credit_mapping_approved</option>
              <option value="credit_mapping_rejected">credit_mapping_rejected</option>
              <option value="credit_transfer_request_created">credit_transfer_request_created</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#171258] mb-1">Filter by Student APAAR ID</label>
            <input
              type="text"
              placeholder="e.g. 900000000001"
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] font-mono focus:ring-2 focus:ring-[#171258] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#171258] mb-1">Filter by Request ID</label>
            <input
              type="text"
              placeholder="e.g. ADM-2026-001"
              value={requestFilter}
              onChange={(e) => setRequestFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E3E1F0] bg-[#FCF8FF] text-[#171258] font-mono focus:ring-2 focus:ring-[#171258] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#6B6590] pt-1">
          <span>Found <strong>{events.length}</strong> immutable audit entries</span>
          {(eventTypeFilter || studentFilter || requestFilter) && (
            <button
              onClick={() => { setEventTypeFilter(''); setStudentFilter(''); setRequestFilter(''); }}
              className="text-indigo-700 hover:underline font-semibold"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Immutable Audit Table */}
      <div className="stitch-card p-6 md:p-8 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EFEEFB] text-[#171258] font-semibold border-b border-[#E3E1F0]">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / Role</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Student / Request Ref</th>
                <th className="py-2.5 px-3">State Transition</th>
                <th className="py-2.5 px-3">Audit Details & Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E1F0]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6590]">
                    Loading audit trail...
                  </td>
                </tr>
              ) : events.length > 0 ? (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#F0EEFC]/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[#171258]">{ev.event_id}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-[#6B6590] whitespace-nowrap">
                      {ev.timestamp?.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#171258]">{ev.actor_role}</span>
                      <span className="text-[10px] text-[#6B6590] block">{ev.actor_reference}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#EFEEFB] text-[#2D2A6E]">
                        {ev.event_type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {ev.related_student_demo_id && (
                        <div className="font-mono text-[10px] text-[#171258] font-semibold">
                          ID: {ev.related_student_demo_id}
                        </div>
                      )}
                      {ev.related_request_id && (
                        <div className="font-mono text-[10px] text-[#6B6590]">
                          Req: #{ev.related_request_id}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {ev.previous_state || ev.new_state ? (
                        <div className="text-[10px] text-[#4E4870]">
                          <span className="text-[#6B6590]">{ev.previous_state || 'null'}</span> &rarr;{' '}
                          <span className="font-bold text-[#171258]">{ev.new_state}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#6B6590]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[#4E4870] leading-relaxed max-w-xs truncate" title={ev.explanation || ''}>
                      {ev.explanation || 'Action logged by institutional governance system.'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6B6590]">
                    No audit records match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cryptographic Tamper-Evidence Card */}
      <div className="stitch-card-lavender p-6 rounded-2xl border-l-4 border-l-[#1B7A3E] space-y-2 text-xs text-[#4E4870]">
        <div className="flex items-center gap-2 text-[#171258] font-bold">
          <span className="material-symbols-outlined text-[#1B7A3E]">verified</span>
          <span>Cryptographic Merkle Consistency & Non-Repudiation</span>
        </div>
        <p className="leading-relaxed">
          Every administrative state change produces a deterministic hash pointer chained to the previous ledger entry. This ensures admissions, capacity approvals, and credit transfers cannot be altered retroactively without breaking the institutional verification tree.
        </p>
      </div>
    </div>
  );
}
