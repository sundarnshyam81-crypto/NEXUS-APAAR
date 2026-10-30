// API client for NEXUS APAAR backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type UserRole = 'student' | 'admin' | 'aicte_admin';

export interface AuthToken {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: number;
  demo_id?: string;
  full_name?: string;
  name?: string;
  department?: string;
  abc_account_id?: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nexus_token');
}

export function saveAuth(auth: AuthToken) {
  localStorage.setItem('nexus_token', auth.access_token);
  localStorage.setItem('nexus_role', auth.role);
  localStorage.setItem('nexus_user', JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('nexus_role');
  localStorage.removeItem('nexus_user');
}

export function getStoredUser(): AuthToken | null {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('nexus_user');
  return u ? JSON.parse(u) : null;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res;
}

async function apiJSON(path: string, options: RequestInit = {}) {
  const res = await apiFetch(path, options);
  return res.json();
}

// Auth
export const api = {
  auth: {
    studentLogin: (demo_id: string, demo_pin: string) =>
      apiJSON('/api/auth/student/login', { method: 'POST', body: JSON.stringify({ demo_id, demo_pin }) }),
    adminLogin: (admin_id: string, password: string) =>
      apiJSON('/api/auth/admin/login', { method: 'POST', body: JSON.stringify({ admin_id, password }) }),
    aicteAdminLogin: (admin_id: string, password: string) =>
      apiJSON('/api/auth/aicte-admin/login', { method: 'POST', body: JSON.stringify({ admin_id, password }) }),
    me: () => apiJSON('/api/auth/me'),
    logout: () => apiJSON('/api/auth/logout', { method: 'POST' }),
  },

  // Student endpoints
  student: {
    profile: () => apiJSON('/api/student/profile'),
    admissionStatus: () => apiJSON('/api/student/admission-status'),
    credits: () => apiJSON('/api/student/credits'),
    submitCreditTransfer: (data: Record<string, unknown>) =>
      apiJSON('/api/student/credit-transfer', { method: 'POST', body: JSON.stringify(data) }),
    notifications: () => apiJSON('/api/student/notifications'),
    markRead: (id: number) =>
      apiJSON(`/api/student/notifications/${id}/read`, { method: 'POST' }),
    verificationHistory: () => apiJSON('/api/student/verification-history'),
    downloadReport: async () => {
      const res = await apiFetch('/api/student/report');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'nexusapaar_report.txt'; a.click();
      URL.revokeObjectURL(url);
    },
  },

  // Admin endpoints
  admin: {
    dashboard: () => apiJSON('/api/admin/dashboard'),
    students: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiJSON(`/api/admin/students${q}`);
    },
    studentDetail: (id: number | string) => apiJSON(`/api/admin/students/${id}`),
    exportReport: async () => {
      const res = await apiFetch('/api/admin/export-report');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'nexusapaar_demo_export.csv'; a.click();
      URL.revokeObjectURL(url);
    },
  },

  aicte: {
    dashboard: () => apiJSON('/api/aicte/dashboard'),
    institutions: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiJSON(`/api/aicte/institutions${q}`);
    },
    institution: (id: number) => apiJSON(`/api/aicte/institutions/${id}`),
    institutionOverview: (id: number) => apiJSON(`/api/aicte/institutions/${id}/overview`),
    applications: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiJSON(`/api/aicte/applications${q}`);
    },
    reviewApplication: (id: number, data: { status: string; notes: string }) =>
      apiJSON(`/api/aicte/applications/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
    courses: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiJSON(`/api/aicte/courses${q}`);
    },
    compliance: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiJSON(`/api/aicte/compliance${q}`);
    },
    reviewCompliance: (id: number, data: { status: string; notes: string }) =>
      apiJSON(`/api/aicte/compliance/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),
    analytics: () => apiJSON('/api/aicte/analytics'),
    notifications: () => apiJSON('/api/aicte/notifications'),
    markNotificationRead: (id: number) => apiJSON(`/api/aicte/notifications/${id}/read`, { method: 'POST' }),
    audit: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiJSON(`/api/aicte/audit${q}`);
    },
  },

  // Admissions
  admissions: {
    list: (status?: string) => {
      const q = status ? `?status_filter=${status}` : '';
      return apiJSON(`/api/admissions/${q}`);
    },
    action: (requestId: string, action: string, reason?: string) =>
      apiJSON(`/api/admissions/${requestId}/action`, { method: 'POST', body: JSON.stringify({ action, reason }) }),
    updateStatus: (id: number | string, data: { status: string; decision_reason?: string }) =>
      apiJSON(`/api/admissions/${id}/action`, { method: 'POST', body: JSON.stringify({ action: data.status, reason: data.decision_reason }) }),
    runScenario: (s: 'A' | 'B' | 'C') =>
      apiJSON(`/api/admissions/demo-scenarios/${s}`, { method: 'POST' }),
    resetScenario: (s: 'A' | 'B' | 'C') =>
      apiJSON(`/api/admissions/reset-scenario/${s}`, { method: 'POST' }),
  },

  // Credits
  credits: {
    list: (status?: string) => {
      const q = status ? `?status_filter=${status}` : '';
      return apiJSON(`/api/credits/${q}`);
    },
    review: (requestId: string, data: Record<string, unknown>) =>
      apiJSON(`/api/credits/${requestId}/review`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Verification
  verification: {
    list: () => apiJSON('/api/verification/'),
    records: () => apiJSON('/api/verification/'),
    run: (studentId: number) =>
      apiJSON(`/api/verification/run/${studentId}`, { method: 'POST' }),
    execute: (data: { student_id: number; request_type?: string; parameters?: Record<string, unknown> }) =>
      apiJSON(`/api/verification/run/${data.student_id}`, { method: 'POST' }),
  },

  // Capacity
  capacity: {
    programmes: () => apiJSON('/api/capacity/programmes'),
    simulate: (programmeId: number) =>
      apiJSON(`/api/capacity/simulate-admission/${programmeId}`, { method: 'POST' }),
    reset: (programmeId: number, enrolledCount: number) =>
      apiJSON(`/api/capacity/reset-programme/${programmeId}?enrolled_count=${enrolledCount}`, { method: 'POST' }),
  },

  // Audit
  audit: {
    events: (params?: Record<string, string>) => {
      const q = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiJSON(`/api/audit/events${q}`);
    },
    exportCSV: async () => {
      const res = await apiFetch('/api/audit/export-csv');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'nexusapaar_audit_log.csv'; a.click();
      URL.revokeObjectURL(url);
    },
  },
};
