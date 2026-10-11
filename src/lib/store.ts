import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type {
  Community,
  Report,
  ReportStatus,
  ReportCategory,
  ReportStatusHistoryItem,
  PublicReportView,
} from '../types/index.ts';
import { REPORT_STATUSES } from '../types/index.ts';

// Default initial communities
const DEFAULT_COMMUNITIES: Community[] = [
  {
    id: 'c1000000-0000-0000-0000-000000000001',
    name: 'เขตพระนคร (กรุงเทพฯ)',
    code: 'BKK-PRN',
    description: 'ครอบคลุมพื้นที่เขตพระนครและเกาะรัตนโกสินทร์',
    created_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000002',
    name: 'เขตปทุมวัน (กรุงเทพฯ)',
    code: 'BKK-PTW',
    description: 'ย่านศูนย์กลางเศรษฐกิจและชุมชนปทุมวัน',
    created_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000003',
    name: 'เขตจตุจักร (กรุงเทพฯ)',
    code: 'BKK-CJC',
    description: 'พื้นที่ชุมชนและการขนส่งจตุจักร',
    created_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000004',
    name: 'เทศบาลนครเชียงใหม่',
    code: 'CNX-CITY',
    description: 'พื้นที่ตัวเมืองและชุมชนรอบคูเมืองเชียงใหม่',
    created_at: new Date('2025-01-01').toISOString(),
  },
  {
    id: 'c1000000-0000-0000-0000-000000000005',
    name: 'เทศบาลนครสมุทรปราการ',
    code: 'SPK-CITY',
    description: 'ครอบคลุมพื้นที่เทศบาลนครสมุทรปราการ ถ.สายลวด ทรัพย์บุญชัย',
    created_at: new Date('2025-01-01').toISOString(),
  },
];

// Pre-seeded Demo Reports to match Stitch exports
const INITIAL_DEMO_REPORTS: Report[] = [
  {
    id: 'r1000000-0000-0000-0000-000000000005',
    public_tracking_id: 'SPK-2026-114',
    tracking_token: 'tk_spk2026114a8b9c0d1e2f3456789abcdef0123',
    community_id: 'c1000000-0000-0000-0000-000000000005',
    category: 'ไฟฟ้า/ไฟส่องสว่าง',
    title: 'เสาไฟส่องสว่างดับบริเวณปากซอย 4 ทรัพย์บุญชัย',
    description: 'เสาไฟส่องสว่างดับบริเวณปากซอย 4 ทรัพย์บุญชัย ถ.สายลวด สายไฟเมนชำรุด อยู่ระหว่างตัดแต่งกิ่งไม้และรอต่อสายเมนใหม่ คาดว่าจะแล้วเสร็จภายในบ่ายวันนี้',
    location_text: 'ใกล้ปากซอย 4 ทรัพย์บุญชัย ถ.สายลวด เทศบาลนครสมุทรปราการ',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    status: 'กำลังดำเนินการ',
    reporter_contact: '082-345-6789 (ประชาชนในพื้นที่)',
    created_at: new Date('2026-10-18T09:15:00Z').toISOString(),
    updated_at: new Date('2026-10-18T14:30:00Z').toISOString(),
  },
  {
    id: 'r1000000-0000-0000-0000-000000000001',
    public_tracking_id: 'FIX-2025-08492',
    tracking_token: 'tk_b8492fa790d84a1e9c2b9a78120d5e1683401fa9b',
    community_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'ถนน/ทางเท้า',
    title: 'ฝาท่อชำรุดและทรุดตัวหน้าตลาดเสาชิงช้า',
    description: 'ฝาท่อระบายน้ำเหล็กมีรอยแตกและทรุดตัวลงไปประมาณ 10 ซม. คนเดินเท้าและจักรยานยนต์สะดุดล้มบ่อยครั้ง',
    location_text: 'ถนนดินสอ ตรงข้ามร้านขนมปังนมสด หน้าเสาชิงช้า เขตพระนคร',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    status: 'กำลังดำเนินการ',
    reporter_contact: '081-234-5678 (นายสมชาย)',
    created_at: new Date('2025-10-09T08:30:00Z').toISOString(),
    updated_at: new Date('2025-10-10T11:15:00Z').toISOString(),
  },
  {
    id: 'r1000000-0000-0000-0000-000000000002',
    public_tracking_id: 'FIX-2025-08493',
    tracking_token: 'tk_94a7e28b120c4fa98d2b3c10aef51648a9b23cd71',
    community_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'ไฟฟ้า/ไฟส่องสว่าง',
    title: 'ไฟกิ่งทางเท้าดับตลอดแนวซอยราชดำเนินกลางใต้',
    description: 'ไฟส่องสว่างดับ 4 ดวงติดต่อกัน ทำให้ซอยมืดมากในเวลากลางคืน ประชาชนไม่ปลอดภัย',
    location_text: 'ซอยดำเนินกลางใต้ ทางลัดไปถนนตะนาว',
    image_url: null,
    status: 'รับเรื่องแล้ว',
    reporter_contact: '089-987-6543 (ป้าสมศรี)',
    created_at: new Date('2025-10-10T14:20:00Z').toISOString(),
    updated_at: new Date('2025-10-10T15:00:00Z').toISOString(),
  },
  {
    id: 'r1000000-0000-0000-0000-000000000003',
    public_tracking_id: 'FIX-2025-08494',
    tracking_token: 'tk_e7c91238fb012a9c34d8ef01923847261a8c9b20d',
    community_id: 'c1000000-0000-0000-0000-000000000002',
    category: 'ท่อระบายน้ำ/น้ำท่วม',
    title: 'น้ำระบายไม่ทันเมื่อฝนตกหน้าหอศิลป์ปทุมวัน',
    description: 'มีเศษขยะและดินอุดตันทางน้ำไหล ทำให้เกิดน้ำท่วมขังบนทางเท้าสูงถึงข้อเท้า',
    location_text: 'สี่แยกปทุมวัน หน้าร้านสะดวกซื้อฝั่งตรงข้าม MBK',
    image_url: null,
    status: 'รอตรวจสอบ',
    reporter_contact: null,
    created_at: new Date('2025-10-11T02:10:00Z').toISOString(),
    updated_at: new Date('2025-10-11T02:10:00Z').toISOString(),
  },
  {
    id: 'r1000000-0000-0000-0000-000000000004',
    public_tracking_id: 'FIX-2025-08490',
    tracking_token: 'tk_fa819203948571829384756102938475610293847',
    community_id: 'c1000000-0000-0000-0000-000000000001',
    category: 'ขยะ/สิ่งปฏิกูล',
    title: 'กองกิ่งไม้ขวางทางสัญจรในซอยศาลเจ้าพ่อเสือ',
    description: 'กิ่งไม้ตัดแต่งถูกนำมากองทิ้งขวางทางเดิน เจ้าหน้าที่เขตส่งรถเก็บขยะมาขนย้ายเรียบร้อยแล้ว',
    location_text: 'ซอยศาลเจ้าพ่อเสือ ข้างโรงเรียน',
    image_url: null,
    status: 'แก้ไขแล้ว',
    reporter_contact: null,
    created_at: new Date('2025-10-08T09:00:00Z').toISOString(),
    updated_at: new Date('2025-10-09T16:30:00Z').toISOString(),
  },
];

const INITIAL_HISTORY: ReportStatusHistoryItem[] = [
  {
    id: 'h-spk-1',
    report_id: 'r1000000-0000-0000-0000-000000000005',
    previous_status: 'รับเรื่องแล้ว',
    new_status: 'กำลังดำเนินการ',
    note: 'ทีมช่างเทศบาลลงพื้นที่ตรวจสอบจุดเสาไฟส่องสว่างดับบริเวณปากซอย 4 พบว่าสายไฟเมนชำรุด อยู่ระหว่างตัดแต่งกิ่งไม้และรอต่อสายเมนใหม่ คาดว่าจะแล้วเสร็จภายในบ่ายวันนี้',
    changed_by: 'admin-spk',
    created_at: new Date('2026-10-18T14:30:00Z').toISOString(),
  },
  {
    id: 'h-spk-2',
    report_id: 'r1000000-0000-0000-0000-000000000005',
    previous_status: 'รอตรวจสอบ',
    new_status: 'รับเรื่องแล้ว',
    note: 'หัวหน้าฝ่ายได้จ่ายงานให้ทีมช่าง A รับผิดชอบ SPK-2026-114 พร้อมประสานสำนักการช่างเทศบาลเพื่อจัดสรรรถกระเช้า',
    changed_by: 'admin-spk',
    created_at: new Date('2026-10-18T11:30:00Z').toISOString(),
  },
  {
    id: 'h-spk-3',
    report_id: 'r1000000-0000-0000-0000-000000000005',
    previous_status: null,
    new_status: 'รอตรวจสอบ',
    note: 'ประชาชนแจ้งผ่านระบบ FixLoop พิกัดใกล้ปากซอย 4 ทรัพย์บุญชัย ถ.สายลวด ส่งข้อมูลไปยังสำนักงานเขต/เทศบาลนครสมุทรปราการแล้ว',
    changed_by: null,
    created_at: new Date('2026-10-18T09:15:00Z').toISOString(),
  },
  {
    id: 'h1',
    report_id: 'r1000000-0000-0000-0000-000000000001',
    previous_status: 'รับเรื่องแล้ว',
    new_status: 'กำลังดำเนินการ',
    note: 'ฝ่ายโยธาจัดส่งทีมช่างเข้าซ่อมแซมและเทปูนปรับระดับฝาท่อแล้ว',
    changed_by: 'admin-pranakorn',
    created_at: new Date('2025-10-10T11:15:00Z').toISOString(),
  },
  {
    id: 'h2',
    report_id: 'r1000000-0000-0000-0000-000000000001',
    previous_status: 'รอตรวจสอบ',
    new_status: 'รับเรื่องแล้ว',
    note: 'เจ้าหน้าที่รับเรื่องและประสานฝ่ายโยธาเพื่อเตรียมกำลังพล',
    changed_by: 'admin-pranakorn',
    created_at: new Date('2025-10-09T09:30:00Z').toISOString(),
  },
  {
    id: 'h3',
    report_id: 'r1000000-0000-0000-0000-000000000001',
    previous_status: null,
    new_status: 'รอตรวจสอบ',
    note: 'ประชาชนส่งรายงานปัญหาเข้ามาทางเว็บไซต์',
    changed_by: null,
    created_at: new Date('2025-10-09T08:30:00Z').toISOString(),
  },
  {
    id: 'h4',
    report_id: 'r1000000-0000-0000-0000-000000000002',
    previous_status: 'รอตรวจสอบ',
    new_status: 'รับเรื่องแล้ว',
    note: 'ตรวจสอบพิกัดและส่งต่อการไฟฟ้านครหลวงเพื่อดำเนินการ',
    changed_by: 'admin-pranakorn',
    created_at: new Date('2025-10-10T15:00:00Z').toISOString(),
  },
  {
    id: 'h5',
    report_id: 'r1000000-0000-0000-0000-000000000002',
    previous_status: null,
    new_status: 'รอตรวจสอบ',
    note: 'ประชาชนส่งรายงานปัญหาเข้ามาทางเว็บไซต์',
    changed_by: null,
    created_at: new Date('2025-10-10T14:20:00Z').toISOString(),
  },
  {
    id: 'h6',
    report_id: 'r1000000-0000-0000-0000-000000000003',
    previous_status: null,
    new_status: 'รอตรวจสอบ',
    note: 'ประชาชนส่งรายงานปัญหาเข้ามาทางเว็บไซต์',
    changed_by: null,
    created_at: new Date('2025-10-11T02:10:00Z').toISOString(),
  },
  {
    id: 'h7',
    report_id: 'r1000000-0000-0000-0000-000000000004',
    previous_status: 'กำลังดำเนินการ',
    new_status: 'แก้ไขแล้ว',
    note: 'เจ้าหน้าที่ฝ่ายรักษาความสะอาดขนย้ายขยะและทำความสะอาดพื้นที่เรียบร้อย',
    changed_by: 'admin-pranakorn',
    created_at: new Date('2025-10-09T16:30:00Z').toISOString(),
  },
  {
    id: 'h8',
    report_id: 'r1000000-0000-0000-0000-000000000004',
    previous_status: null,
    new_status: 'รอตรวจสอบ',
    note: 'ประชาชนส่งรายงานปัญหาเข้ามาทางเว็บไซต์',
    changed_by: null,
    created_at: new Date('2025-10-08T09:00:00Z').toISOString(),
  },
];

// Pre-configured authorized admin accounts with assigned communities
export interface AuthorizedAdmin {
  id: string;
  email: string;
  name: string;
  assigned_community_ids: string[];
}

export const AUTHORIZED_ADMINS: AuthorizedAdmin[] = [
  {
    id: 'admin-pranakorn-01',
    email: 'admin.prn@fixloop.org',
    name: 'นายอดิศร วงศ์ไทย (เจ้าหน้าที่เขตพระนคร)',
    assigned_community_ids: ['c1000000-0000-0000-0000-000000000001'],
  },
  {
    id: 'admin-pathumwan-01',
    email: 'admin.ptw@fixloop.org',
    name: 'นางสาวสุดารัตน์ พงษ์ศิริ (เจ้าหน้าที่เขตปทุมวัน)',
    assigned_community_ids: ['c1000000-0000-0000-0000-000000000002'],
  },
  {
    id: 'admin-chatuchak-01',
    email: 'admin.cjc@fixloop.org',
    name: 'นายกิตติคุณ นรินทร์ (เจ้าหน้าที่เขตจตุจักร)',
    assigned_community_ids: ['c1000000-0000-0000-0000-000000000003'],
  },
  {
    id: 'super-admin-01',
    email: 'superadmin@fixloop.org',
    name: 'ผู้ดูแลระบบส่วนกลาง (กรุงเทพมหานครและส่วนภูมิภาค)',
    assigned_community_ids: [
      'c1000000-0000-0000-0000-000000000001',
      'c1000000-0000-0000-0000-000000000002',
      'c1000000-0000-0000-0000-000000000003',
      'c1000000-0000-0000-0000-000000000004',
    ],
  },
];

const DATA_FILE_PATH = path.join(process.cwd(), '.fixloop_data.json');

interface StoredData {
  communities: Community[];
  reports: Report[];
  history: ReportStatusHistoryItem[];
}

function loadData(): StoredData {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // fallback to defaults
  }
  return {
    communities: DEFAULT_COMMUNITIES,
    reports: INITIAL_DEMO_REPORTS,
    history: INITIAL_HISTORY,
  };
}

function saveData(data: StoredData): void {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist FixLoop data file:', err);
  }
}

// Memory cache initialized with disk persistence
let memoryData: StoredData = loadData();

export const FixLoopStore = {
  getCommunities(): Community[] {
    return memoryData.communities;
  },

  getCommunityById(id: string): Community | undefined {
    return memoryData.communities.find((c) => c.id === id);
  },

  getAdminByEmail(email: string): AuthorizedAdmin | undefined {
    return AUTHORIZED_ADMINS.find((a) => a.email.toLowerCase() === email.toLowerCase());
  },

  getAdminById(id: string): AuthorizedAdmin | undefined {
    return AUTHORIZED_ADMINS.find((a) => a.id === id);
  },

  /**
   * Submit a new public report without requiring login
   */
  createReport(input: {
    community_id: string;
    category: ReportCategory;
    title: string;
    description: string;
    location_text: string;
    image_url?: string | null;
    reporter_contact?: string | null;
  }): { report: Report; tracking_token: string; public_tracking_id: string } {
    const community = this.getCommunityById(input.community_id);
    if (!community) {
      throw new Error('ไม่พบข้อมูลชุมชนหรือเขตที่เลือก');
    }

    // High-entropy cryptographically unguessable tracking bearer token (48 chars hex)
    const tracking_token = 'tk_' + crypto.randomBytes(24).toString('hex');

    // Human-friendly public tracking ID (e.g., FIX-2025-09142)
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const public_tracking_id = `FIX-2025-${randomSuffix}`;

    const newReport: Report = {
      id: crypto.randomUUID(),
      public_tracking_id,
      tracking_token,
      community_id: input.community_id,
      category: input.category,
      title: input.title.trim(),
      description: input.description.trim(),
      location_text: input.location_text.trim(),
      image_url: input.image_url || null,
      status: 'รอตรวจสอบ',
      reporter_contact: input.reporter_contact ? input.reporter_contact.trim() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const initialHistory: ReportStatusHistoryItem = {
      id: crypto.randomUUID(),
      report_id: newReport.id,
      previous_status: null,
      new_status: 'รอตรวจสอบ',
      note: 'ประชาชนส่งรายงานปัญหาเข้าระบบ',
      changed_by: null,
      created_at: newReport.created_at,
    };

    memoryData.reports.unshift(newReport);
    memoryData.history.unshift(initialHistory);
    saveData(memoryData);

    return { report: newReport, tracking_token, public_tracking_id };
  },

  /**
   * Public tracking lookup: strictly sanitized and least-privilege.
   * Returns ONLY approved public fields. Zero internal secrets or private contact details.
   */
  getPublicReportByToken(token: string): PublicReportView | null {
    if (!token || typeof token !== 'string') return null;

    const normalized = token.trim().toLowerCase();
    const report = memoryData.reports.find(
      (r) => r.tracking_token.toLowerCase() === normalized || r.public_tracking_id.toLowerCase() === normalized
    );
    if (!report) return null;

    const community = this.getCommunityById(report.community_id);
    const historyItems = memoryData.history
      .filter((h) => h.report_id === report.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((h) => ({
        previous_status: h.previous_status,
        new_status: h.new_status,
        note: h.note,
        created_at: h.created_at,
      }));

    return {
      public_tracking_id: report.public_tracking_id,
      tracking_token: report.tracking_token,
      category: report.category,
      title: report.title,
      description: report.description,
      location_text: report.location_text,
      image_url: report.image_url,
      status: report.status,
      community_name: community ? community.name : 'ส่วนกลาง',
      created_at: report.created_at,
      updated_at: report.updated_at,
      history: historyItems,
    };
  },

  /**
   * Admin-scoped report listing: Enforces community-level isolation!
   */
  getAdminReports(params: {
    adminId: string;
    communityId?: string;
    status?: ReportStatus;
    search?: string;
  }): { reports: (Report & { community_name: string })[]; authorizedCommunityIds: string[] } {
    const admin = this.getAdminById(params.adminId);
    if (!admin) {
      throw new Error('Unauthorized: Admin account not found');
    }

    // Community Isolation Rule: Admin can ONLY access assigned communities
    let allowedCommunities = admin.assigned_community_ids;
    if (params.communityId) {
      if (!allowedCommunities.includes(params.communityId)) {
        throw new Error('Forbidden: Unauthorized to access reports in this community');
      }
      allowedCommunities = [params.communityId];
    }

    let list = memoryData.reports.filter((r) => allowedCommunities.includes(r.community_id));

    if (params.status && REPORT_STATUSES.includes(params.status)) {
      list = list.filter((r) => r.status === params.status);
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.public_tracking_id.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.location_text.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const result = list.map((r) => {
      const comm = this.getCommunityById(r.community_id);
      return {
        ...r,
        community_name: comm ? comm.name : 'ส่วนกลาง',
      };
    });

    return { reports: result, authorizedCommunityIds: admin.assigned_community_ids };
  },

  /**
   * Get single report for admin with full details and audit history
   */
  getAdminReportById(reportId: string, adminId: string): (Report & { community_name: string; history: ReportStatusHistoryItem[] }) | null {
    const admin = this.getAdminById(adminId);
    if (!admin) throw new Error('Unauthorized');

    const report = memoryData.reports.find((r) => r.id === reportId);
    if (!report) return null;

    if (!admin.assigned_community_ids.includes(report.community_id)) {
      throw new Error('Forbidden: Community access denied');
    }

    const comm = this.getCommunityById(report.community_id);
    const history = memoryData.history
      .filter((h) => h.report_id === report.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      ...report,
      community_name: comm ? comm.name : 'ส่วนกลาง',
      history,
    };
  },

  /**
   * Atomic Status Update:
   * - Enforces authorized admin & community isolation
   * - Strictly 5 canonical statuses
   * - Max 200 characters note
   * - If status unchanged & no note, do not create duplicate event
   * - Newest first history order
   */
  updateReportStatus(params: {
    reportId: string;
    adminId: string;
    newStatus: ReportStatus;
    note?: string;
  }): { success: boolean; changed: boolean; previous_status: ReportStatus; new_status: ReportStatus } {
    const admin = this.getAdminById(params.adminId);
    if (!admin) {
      throw new Error('Unauthorized: Admin account not found');
    }

    if (!REPORT_STATUSES.includes(params.newStatus)) {
      throw new Error(`Invalid status: ${params.newStatus}`);
    }

    if (params.note && params.note.length > 200) {
      throw new Error('บันทึกข้อความต้องไม่เกิน 200 ตัวอักษร');
    }

    const reportIndex = memoryData.reports.findIndex((r) => r.id === params.reportId);
    if (reportIndex === -1) {
      throw new Error('ไม่พบรายงานที่ระบุ');
    }

    const report = memoryData.reports[reportIndex];

    // Enforce community isolation
    if (!admin.assigned_community_ids.includes(report.community_id)) {
      throw new Error('Forbidden: เจ้าหน้าที่ไม่มีสิทธิ์จัดการรายงานของชุมชนนี้');
    }

    const currentStatus = report.status;
    const cleanNote = params.note ? params.note.trim() : '';

    // If unchanged and no note, do not create event
    if (currentStatus === params.newStatus && cleanNote === '') {
      return {
        success: true,
        changed: false,
        previous_status: currentStatus,
        new_status: params.newStatus,
      };
    }

    // Atomic update
    report.status = params.newStatus;
    report.updated_at = new Date().toISOString();

    const historyItem: ReportStatusHistoryItem = {
      id: crypto.randomUUID(),
      report_id: report.id,
      previous_status: currentStatus,
      new_status: params.newStatus,
      note: cleanNote || null,
      changed_by: admin.id,
      created_at: report.updated_at,
    };

    memoryData.history.unshift(historyItem);
    saveData(memoryData);

    return {
      success: true,
      changed: true,
      previous_status: currentStatus,
      new_status: params.newStatus,
    };
  },
};
