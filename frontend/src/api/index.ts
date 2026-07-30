import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

// ─── Axios Instance ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Attach Cognito token to every request
api.interceptors.request.use(async (req) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // not authenticated
  }
  return req;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ─── Dashboard ───────────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats").then((r) => r.data),
  getActivity: (range: "7d" | "30d") =>
    api.get("/dashboard/activity", { params: { range } }).then((r) => r.data),
  getDocumentTypes: () =>
    api.get("/dashboard/document-types").then((r) => r.data),
  getRecent: () => api.get("/dashboard/recent").then((r) => r.data),
};

// ─── Documents ───────────────────────────────────────────────────────────────

export const documentsApi = {
  getInbox: (params?: { status?: string; type?: string; search?: string }) =>
    api.get("/documents/inbox", { params }).then((r) => r.data),
  getSent: () => api.get("/documents/sent").then((r) => r.data),
  getById: (id: string) => api.get(`/documents/${id}`).then((r) => r.data),
  send: (data: object) => api.post("/documents/send", data).then((r) => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/documents/${id}/status`, { status }).then((r) => r.data),
  getUploadUrl: (data: object) =>
    api.post("/documents/upload-url", data).then((r) => r.data),
  search: (q: string) =>
    api.get("/documents/search", { params: { q } }).then((r) => r.data),
};

// ─── Audit ───────────────────────────────────────────────────────────────────

export const auditApi = {
  getLogs: (params?: { search?: string; event_type?: string }) =>
    api.get("/audit", { params }).then((r) => r.data),
  getEvent: (eventId: string) =>
    api.get(`/audit/${eventId}`).then((r) => r.data),
  export: () =>
    api.get("/audit/export", { responseType: "blob" }).then((r) => r.data),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: () => api.get("/notifications").then((r) => r.data),
  markRead: (id: string) =>
    api.put(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.put("/notifications/read-all").then((r) => r.data),
  dismiss: (id: string) =>
    api.delete(`/notifications/${id}`).then((r) => r.data),
};

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export const aiApi = {
  getStats: () => api.get("/ai/stats").then((r) => r.data),
  getCategories: () => api.get("/ai/categories").then((r) => r.data),
  getAnalyses: () => api.get("/ai/analyses").then((r) => r.data),
  getAnalysis: (docId: string) =>
    api.get(`/ai/analyses/${docId}`).then((r) => r.data),
};

// ─── Organizations ────────────────────────────────────────────────────────────

export const organizationsApi = {
  getAll: (search?: string) =>
    api.get("/organizations", { params: { search } }).then((r) => r.data),
  getById: (id: string) => api.get(`/organizations/${id}`).then((r) => r.data),
};

// ─── Users ───────────────────────────────────────────────────────────────────

export const usersApi = {
  getAll: () => api.get("/users").then((r) => r.data),
  updateRole: (id: string, role: string) =>
    api.put(`/users/${id}/role`, { role }).then((r) => r.data),
  updateStatus: (id: string, isActive: boolean) =>
    api.put(`/users/${id}/status`, { is_active: isActive }).then((r) => r.data),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  me: () => api.get("/auth/me").then((r) => r.data),
};

// ─── Security ─────────────────────────────────────────────────────────────────

export const securityApi = {
  getSettings: () => api.get("/security/settings").then((r) => r.data),
  updateSettings: (data: object) =>
    api.put("/security/settings", data).then((r) => r.data),
};

export default api;
