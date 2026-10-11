import type { ReportStatus, ReportCategory } from '../types/index.ts';

export const STATUS_META: Record<
  ReportStatus,
  {
    step: number;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    badgeClass: string;
    icon: string;
    description: string;
    seniorDescription: string;
  }
> = {
  'รอตรวจสอบ': {
    step: 1,
    color: '#725c00',
    bgColor: '#fed74c',
    borderColor: '#1c1b1b',
    textColor: '#735d00',
    badgeClass: 'bg-[#fed74c] text-[#735d00] border-2 border-[#1c1b1b]',
    icon: 'hourglass_empty',
    description: 'เจ้าหน้าที่กำลังตรวจเช็กข้อมูลและสถานที่เกิดเหตุ',
    seniorDescription: 'รอเจ้าหน้าที่เปิดดูเอกสาร (ใจเย็นๆ นะครับ)',
  },
  'รับเรื่องแล้ว': {
    step: 2,
    color: '#003ece',
    bgColor: '#dde1ff',
    borderColor: '#1c1b1b',
    textColor: '#001453',
    badgeClass: 'bg-[#dde1ff] text-[#001453] border-2 border-[#1c1b1b]',
    icon: 'mark_email_read',
    description: 'ฝ่ายปกครองรับเรื่องและส่งต่อฝ่ายช่างเรียบร้อยแล้ว',
    seniorDescription: 'เขตได้รับเรื่องของท่านเรียบร้อยแล้ว',
  },
  'กำลังดำเนินการ': {
    step: 3,
    color: '#0f4ceb',
    bgColor: '#2457f5',
    borderColor: '#1c1b1b',
    textColor: '#ffffff',
    badgeClass: 'bg-[#2457f5] text-white border-2 border-[#1c1b1b]',
    icon: 'build',
    description: 'ทีมช่างและเจ้าหน้าที่ลงพื้นที่กำลังแก้ไขปัญหา',
    seniorDescription: 'ทีมช่างกำลังลงมือซ่อมแซมให้อยู่',
  },
  'รอหน่วยงานภายนอก': {
    step: 4,
    color: '#ba1a1a',
    bgColor: '#ffdad6',
    borderColor: '#1c1b1b',
    textColor: '#93000a',
    badgeClass: 'bg-[#ffdad6] text-[#93000a] border-2 border-[#1c1b1b]',
    icon: 'swap_horiz',
    description: 'ส่งเรื่องประสานงานต่อการไฟฟ้านครหลวง/การประปา/หน่วยงานที่เกี่ยวข้อง',
    seniorDescription: 'รอประสานงานกับหน่วยงานพิเศษ',
  },
  'แก้ไขแล้ว': {
    step: 5,
    color: '#005d25',
    bgColor: '#8fffa1',
    borderColor: '#1c1b1b',
    textColor: '#002109',
    badgeClass: 'bg-[#8fffa1] text-[#002109] border-2 border-[#1c1b1b]',
    icon: 'check_circle',
    description: 'งานซ่อมแซมเสร็จสิ้น ตรวจสอบความปลอดภัยเรียบร้อยแล้ว',
    seniorDescription: 'ซ่อมแซมเสร็จเรียบร้อยแล้ว ปลอดภัยแล้ว!',
  },
};

export const CATEGORY_ICONS: Record<ReportCategory, { icon: string; label: string; desc: string }> = {
  'ถนน/ทางเท้า': {
    icon: 'add_road',
    label: 'ถนน / ทางเท้า',
    desc: 'หลุมบ่อ ทางเท้าพัง ฝาท่อชำรุด',
  },
  'ไฟฟ้า/ไฟส่องสว่าง': {
    icon: 'lightbulb',
    label: 'ไฟฟ้า / ไฟส่องสว่าง',
    desc: 'ไฟทางดับ สายไฟห้อย เสาไฟเอียง',
  },
  'ขยะ/สิ่งปฏิกูล': {
    icon: 'delete',
    label: 'ขยะ / สิ่งปฏิกูล',
    desc: 'ขยะล้นถัง กิ่งไม้ขวางทาง ส่งกลิ่นเหม็น',
  },
  'ท่อระบายน้ำ/น้ำท่วม': {
    icon: 'water_damage',
    label: 'ท่อระบายน้ำ / น้ำท่วม',
    desc: 'ท่อตัน น้ำท่วมขัง น้ำเสีย',
  },
  'อื่นๆ': {
    icon: 'help_outline',
    label: 'ปัญหาอื่นๆ',
    desc: 'สิ่งก่อสร้าง ความปลอดภัย ความเดือดร้อน',
  },
};
