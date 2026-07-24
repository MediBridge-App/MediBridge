// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  cognitoId: string;
  email: string;
  fullName: string;
  role:
    | "provider"
    | "referral_coordinator"
    | "registered_nurse"
    | "organization_admin"
    | "medical_assistant";
  organizationId: string;
  organizationName: string;
  isActive: boolean;
}

// ─── Documents ───────────────────────────────────────────────────────────────

export type DocumentStatus =
  | "uploaded"
  | "ocr_complete"
  | "classified"
  | "routed"
  | "delivered";
export type DocumentType =
  | "referral"
  | "lab_result"
  | "discharge_summary"
  | "insurance_form"
  | "imaging";
export type DocumentPriority = "urgent" | "normal" | "routine";

export interface Document {
  id: string;
  txRef: string;
  senderOrgId: string;
  senderOrgName: string;
  recipientOrgId: string;
  recipientOrgName: string;
  uploadedByUserId: string;
  documentType: DocumentType;
  subject: string;
  priority: DocumentPriority;
  status: DocumentStatus;
  notes?: string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export type AuditEventType =
  | "document_sent"
  | "file_upload"
  | "ai_processing"
  | "document_read"
  | "user_login"
  | "auth_failure"
  | "document_received"
  | "notification_sent";

export interface AuditLog {
  id: string;
  eventId: string;
  documentId?: string;
  userId?: string;
  organizationId?: string;
  eventType: AuditEventType;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  hash?: string;
  createdAt: string;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "new_document"
  | "urgent"
  | "delivery_confirmed"
  | "ai_complete"
  | "security_alert";

export interface Notification {
  id: string;
  userId: string;
  documentId?: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────

export interface AIAnalysis {
  id: string;
  documentId: string;
  documentType: DocumentType;
  summary?: string;
  tags?: string[];
  urgencyDetected: boolean;
  confidenceScore: number;
  processingTimeMs: number;
  modelUsed: string;
  createdAt: string;
}

// ─── Organization ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  orgCode: string;
  type: string;
  createdAt: string;
}

// ─── Inbox ───────────────────────────────────────────────────────────────────

export interface InboxDocument {
  id: string;
  type: string;
  subject: string;
  from: string;
  fromOrg: string;
  to: string;
  toOrg: string;
  status: DocumentStatus;
  time: string;
  size: string;
  pages: number;
  aiSummary: string;
  aiTags: string[];
  aiCategory: string;
  documentType: DocumentType;
  priority: DocumentPriority;
  isUnread: boolean;
}
