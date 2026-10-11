// ==============================================================================
// FIX-LOOP CORE TYPES & DOMAIN MODELS
// ==============================================================================

// Non-negotiable 5 Canonical Thai Report Statuses (Strictly in order)
export const REPORT_STATUSES = [
  'รอตรวจสอบ',
  'รับเรื่องแล้ว',
  'กำลังดำเนินการ',
  'รอหน่วยงานภายนอก',
  'แก้ไขแล้ว',
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_CATEGORIES = [
  'ถนน/ทางเท้า',
  'ไฟฟ้า/ไฟส่องสว่าง',
  'ขยะ/สิ่งปฏิกูล',
  'ท่อระบายน้ำ/น้ำท่วม',
  'อื่นๆ',
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export interface Community {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface AdminAssignment {
  user_id: string;
  community_id: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

export interface ReportStatusHistoryItem {
  id: string;
  report_id: string;
  previous_status: ReportStatus | null;
  new_status: ReportStatus;
  note: string | null; // Limited to 200 characters max
  changed_by?: string | null;
  created_at: string;
}

export interface PublicStatusHistoryItem {
  previous_status: ReportStatus | null;
  new_status: ReportStatus;
  note: string | null;
  created_at: string;
}

export interface Report {
  id: string;
  public_tracking_id: string; // e.g., 'FIX-2025-08492'
  tracking_token: string;     // Cryptographically secure, unguessable high-entropy bearer token
  community_id: string;
  category: ReportCategory;
  title: string;
  description: string;
  location_text: string;      // Free-form text location (no GPS required)
  image_url?: string | null;  // Max 1 optional image
  status: ReportStatus;
  reporter_contact?: string | null; // PRIVATE. Never exposed publicly.
  created_at: string;
  updated_at: string;
}

// Sanitized public tracking view — strictly least privilege, zero sensitive data
export interface PublicReportView {
  public_tracking_id: string;
  tracking_token: string;
  category: ReportCategory;
  title: string;
  description: string;
  location_text: string;
  image_url?: string | null;
  status: ReportStatus;
  community_name: string;
  created_at: string;
  updated_at: string;
  history: PublicStatusHistoryItem[];
}

export interface ReportSubmissionInput {
  community_id: string;
  category: ReportCategory;
  title: string;
  description: string;
  location_text: string;
  image_url?: string | null;
  reporter_contact?: string | null;
}

export interface StatusUpdateInput {
  report_id: string;
  new_status: ReportStatus;
  note?: string; // Max 200 chars
}
