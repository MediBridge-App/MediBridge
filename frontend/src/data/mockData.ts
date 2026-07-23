import type { DocumentType, DocumentStatus, DocumentPriority } from "../types";

export const MOCK_STATS = {
  documentsSent: 284,
  documentsReceived: 371,
  pendingReview: 17,
  aiProcessed: 612,
  sentChange: 12,
  receivedChange: 8,
  pendingChange: -3,
  aiChange: 24,
};

export const MOCK_ACTIVITY = [
  { day: "Mon", sent: 16, received: 14 },
  { day: "Tue", sent: 19, received: 15 },
  { day: "Wed", sent: 14, received: 16 },
  { day: "Thu", sent: 26, received: 28 },
  { day: "Fri", sent: 10, received: 8 },
  { day: "Sat", sent: 4, received: 3 },
  { day: "Sun", sent: 2, received: 1 },
];

export const MOCK_DOC_TYPES = [
  { label: "Referrals", value: 152, max: 160 },
  { label: "Lab Reports", value: 118, max: 160 },
  { label: "Discharge", value: 88, max: 160 },
  { label: "Insurance", value: 65, max: 160 },
  { label: "Imaging", value: 52, max: 160 },
];

export const MOCK_RECENT = [
  {
    id: "1",
    txRef: "TX-1001",
    documentType: "referral" as DocumentType,
    subject: "Cardiology referral for John Doe",
    senderOrgName: "City Lab Partners",
    status: "delivered" as DocumentStatus,
    priority: "normal" as DocumentPriority,
    timeAgo: "2 min ago",
  },
  {
    id: "2",
    txRef: "TX-1002",
    documentType: "lab_result" as DocumentType,
    subject: "Lipid panel results",
    senderOrgName: "Dr. Sarah Chen, MD",
    status: "routed" as DocumentStatus,
    priority: "urgent" as DocumentPriority,
    timeAgo: "18 min ago",
  },
  {
    id: "3",
    txRef: "TX-1003",
    documentType: "discharge_summary" as DocumentType,
    subject: "Discharge summary — Jane Smith",
    senderOrgName: "Riverside Medical Center",
    status: "uploaded" as DocumentStatus,
    priority: "normal" as DocumentPriority,
    timeAgo: "31 min ago",
  },
];
