'use server';

import { cookies } from 'next/headers';
import {
  ReportCategory,
  ReportStatus,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  PublicReportView,
  Report,
  ReportStatusHistoryItem,
} from '@/types';
import { FixLoopStore, AUTHORIZED_ADMINS, AuthorizedAdmin } from './store';
import { getSupabaseServer } from './supabase/server';

const ADMIN_SESSION_COOKIE = 'fixloop_admin_session';

/**
 * Public report submission - No login required.
 * Validates inputs strictly on the server.
 */
export async function submitReportAction(formData: FormData) {
  try {
    const community_id = String(formData.get('community_id') || '').trim();
    const category = String(formData.get('category') || '').trim() as ReportCategory;
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const location_text = String(formData.get('location_text') || '').trim();
    const image_url = (formData.get('image_url') as string) || null;
    const reporter_contact = (formData.get('reporter_contact') as string) || null;

    // Strict Server-side Validation
    if (!community_id) {
      return { success: false, error: 'กรุณาเลือกเขตหรือชุมชนที่พบปัญหา' };
    }

    if (!REPORT_CATEGORIES.includes(category)) {
      return { success: false, error: 'ประเภทปัญหาไม่ถูกต้อง' };
    }

    if (!title || title.length < 3) {
      return { success: false, error: 'กรุณาระบุหัวข้อเรื่องอย่างน้อย 3 ตัวอักษร' };
    }
    if (title.length > 150) {
      return { success: false, error: 'หัวข้อเรื่องต้องไม่เกิน 150 ตัวอักษร' };
    }

    if (!description || description.length < 5) {
      return { success: false, error: 'กรุณาระบุรายละเอียดปัญหาให้ชัดเจน' };
    }
    if (description.length > 2000) {
      return { success: false, error: 'รายละเอียดต้องไม่เกิน 2,000 ตัวอักษร' };
    }

    if (!location_text || location_text.length < 3) {
      return { success: false, error: 'กรุณาระบุสถานที่หรือจุดสังเกต' };
    }
    if (location_text.length > 500) {
      return { success: false, error: 'สถานที่ต้องไม่เกิน 500 ตัวอักษร' };
    }

    if (reporter_contact && reporter_contact.length > 100) {
      return { success: false, error: 'ข้อมูลติดต่อต้องไม่เกิน 100 ตัวอักษร' };
    }

    // Try Supabase if server is connected and configured
    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        const crypto = await import('crypto');
        const tracking_token = 'tk_' + crypto.randomBytes(24).toString('hex');
        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
        const public_tracking_id = `FIX-2025-${randomSuffix}`;

        const { data: insertedReport, error: insertError } = await supabase
          .from('reports')
          .insert({
            public_tracking_id,
            tracking_token,
            community_id,
            category,
            title,
            description,
            location_text,
            image_url,
            status: 'รอตรวจสอบ',
            reporter_contact: reporter_contact ? reporter_contact.trim() : null,
          })
          .select()
          .single();

        if (insertError) {
          console.warn('Supabase insert failed, falling back to local store:', insertError.message);
        } else if (insertedReport) {
          // Insert initial history
          await supabase.from('report_status_history').insert({
            report_id: insertedReport.id,
            previous_status: null,
            new_status: 'รอตรวจสอบ',
            note: 'ประชาชนส่งรายงานปัญหาเข้าระบบ',
          });

          return {
            success: true,
            trackingToken: tracking_token,
            publicTrackingId: public_tracking_id,
          };
        }
      } catch (sbErr) {
        console.warn('Supabase operation encountered exception, continuing with local store:', sbErr);
      }
    }

    // Standard Store Persistence
    const result = FixLoopStore.createReport({
      community_id,
      category,
      title,
      description,
      location_text,
      image_url,
      reporter_contact,
    });

    return {
      success: true,
      trackingToken: result.tracking_token,
      publicTrackingId: result.public_tracking_id,
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}

/**
 * Public tracking lookup: strictly sanitized public view
 */
export async function getPublicReportAction(token: string): Promise<PublicReportView | null> {
  if (!token || typeof token !== 'string') return null;

  // Supabase if available
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_public_report_by_token', {
        p_token: token,
      });
      if (!error && data) {
        return {
          ...data,
          tracking_token: token,
        } as PublicReportView;
      }
    } catch {
      // fallback
    }
  }

  return FixLoopStore.getPublicReportByToken(token);
}

/**
 * Fetch available communities for the report form dropdown
 */
export async function getCommunitiesAction() {
  return FixLoopStore.getCommunities();
}

/**
 * Administrator Authentication
 */
export async function loginAdminAction(email: string) {
  const admin = FixLoopStore.getAdminByEmail(email);
  if (!admin) {
    return { success: false, error: 'อีเมลหรือข้อมูลเจ้าหน้าที่ไม่ถูกต้องในระบบ' };
  }

  // Set session cookie
  const cookieStore = cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, admin.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return { success: true, admin: { id: admin.id, name: admin.name, email: admin.email } };
}

export async function logoutAdminAction() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return { success: true };
}

export async function getAdminSessionAction(): Promise<AuthorizedAdmin | null> {
  const cookieStore = cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  if (!session?.value) return null;

  const admin = FixLoopStore.getAdminById(session.value);
  return admin || null;
}

/**
 * Admin Reports Listing with strict community scoping
 */
export async function getAdminReportsAction(params: {
  communityId?: string;
  status?: ReportStatus;
  search?: string;
}) {
  const admin = await getAdminSessionAction();
  if (!admin) {
    throw new Error('Unauthorized: กรุณาเข้าสู่ระบบเจ้าหน้าที่ก่อน');
  }

  return FixLoopStore.getAdminReports({
    adminId: admin.id,
    communityId: params.communityId,
    status: params.status,
    search: params.search,
  });
}

/**
 * Admin single report details
 */
export async function getAdminReportDetailAction(reportId: string) {
  const admin = await getAdminSessionAction();
  if (!admin) {
    throw new Error('Unauthorized');
  }

  return FixLoopStore.getAdminReportById(reportId, admin.id);
}

/**
 * Atomic Status Update with validation and community isolation
 */
export async function updateReportStatusAction(input: {
  reportId: string;
  newStatus: ReportStatus;
  note?: string;
}) {
  const admin = await getAdminSessionAction();
  if (!admin) {
    return { success: false, error: 'Unauthorized: กรุณาเข้าสู่ระบบเจ้าหน้าที่ก่อน' };
  }

  if (!REPORT_STATUSES.includes(input.newStatus)) {
    return { success: false, error: `สถานะไม่ถูกต้องตามระบบ (${input.newStatus})` };
  }

  if (input.note && input.note.length > 200) {
    return { success: false, error: 'บันทึกความคืบหน้าต้องไม่เกิน 200 ตัวอักษร' };
  }

  // Supabase if available
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('update_report_status_atomic', {
        p_report_id: input.reportId,
        p_new_status: input.newStatus,
        p_note: input.note ? input.note.trim() : null,
      });
      if (!error && data) {
        return { success: true, data };
      }
    } catch {
      // fallback
    }
  }

  try {
    const result = FixLoopStore.updateReportStatus({
      reportId: input.reportId,
      adminId: admin.id,
      newStatus: input.newStatus,
      note: input.note,
    });
    return { success: true, ...result };
  } catch (err: any) {
    return { success: false, error: err.message || 'ไม่สามารถอัปเดตสถานะได้' };
  }
}
