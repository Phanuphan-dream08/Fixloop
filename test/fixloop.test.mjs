import test from 'node:test';
import assert from 'node:assert/strict';
import { FixLoopStore, AUTHORIZED_ADMINS } from '../src/lib/store.ts';
import { REPORT_STATUSES } from '../src/types/index.ts';

test('1. Public report submission without login', () => {
  const comms = FixLoopStore.getCommunities();
  assert.ok(comms.length > 0, 'Communities must be seeded');

  const result = FixLoopStore.createReport({
    community_id: comms[0].id,
    category: 'ถนน/ทางเท้า',
    title: 'ทดสอบหลุมบนถนนราชดำเนิน',
    description: 'หลุมลึกประมาณ 10 ซม. คนเดินสะดุดบ่อยครั้ง',
    location_text: 'ถนนราชดำเนินกลาง หน้าร้านกาแฟ',
    reporter_contact: '0812345678 (นายสมชาย - ส่วนตัว)',
  });

  assert.ok(result.report, 'Report should be created');
  assert.ok(result.tracking_token.startsWith('tk_'), 'Tracking token must be high-entropy bearer token');
  assert.equal(result.tracking_token.length > 20, true, 'Tracking token must be unguessable');
  assert.ok(result.public_tracking_id.startsWith('FIX-2025-'), 'Readable public tracking ID');
  assert.equal(result.report.status, 'รอตรวจสอบ', 'Initial status must be รอตรวจสอบ');
});

test('2. Public tracking exposes ONLY permitted public fields (Least Privilege)', () => {
  const comms = FixLoopStore.getCommunities();
  const created = FixLoopStore.createReport({
    community_id: comms[0].id,
    category: 'ไฟฟ้า/ไฟส่องสว่าง',
    title: 'ไฟทางดับ 2 ดวง',
    description: 'ทางเดินมืดมากในเวลากลางคืน',
    location_text: 'ปากซอยวัดบวรนิเวศ',
    reporter_contact: '0899999999 (ข้อมูลความลับ)',
  });

  const publicView = FixLoopStore.getPublicReportByToken(created.tracking_token);
  assert.ok(publicView, 'Public view should exist');
  assert.equal(publicView.public_tracking_id, created.public_tracking_id);
  assert.equal(publicView.title, 'ไฟทางดับ 2 ดวง');
  assert.equal(publicView.status, 'รอตรวจสอบ');
  assert.ok(publicView.history.length >= 1, 'Initial history item exists');

  // Verify privacy: reporter_contact is NEVER exposed!
  assert.equal('reporter_contact' in publicView, false, 'reporter_contact MUST NOT be in public view');
});

test('3. Invalid or unknown tracking token does not reveal data', () => {
  const res = FixLoopStore.getPublicReportByToken('tk_invalid_fake_token_12345');
  assert.equal(res, null, 'Unknown token must return null');

  const emptyRes = FixLoopStore.getPublicReportByToken('');
  assert.equal(emptyRes, null, 'Empty token must return null');
});

test('4. Canonical 5 Thai statuses and order integrity', () => {
  assert.deepEqual(REPORT_STATUSES, [
    'รอตรวจสอบ',
    'รับเรื่องแล้ว',
    'กำลังดำเนินการ',
    'รอหน่วยงานภายนอก',
    'แก้ไขแล้ว',
  ]);
});

test('5. Atomic status update with note and history tracking', () => {
  const comms = FixLoopStore.getCommunities();
  const created = FixLoopStore.createReport({
    community_id: comms[0].id, // เขตพระนคร
    category: 'ขยะ/สิ่งปฏิกูล',
    title: 'ขยะตกค้างหน้าสวน',
    description: 'มีกองขยะขนาดใหญ่ตกค้าง',
    location_text: 'หน้าสวนสันติชัยปราการ',
  });

  const adminPrn = AUTHORIZED_ADMINS.find((a) => a.id === 'admin-pranakorn-01');
  assert.ok(adminPrn, 'Admin for Pranakorn exists');

  // Update to รับเรื่องแล้ว
  const updateRes1 = FixLoopStore.updateReportStatus({
    reportId: created.report.id,
    adminId: adminPrn.id,
    newStatus: 'รับเรื่องแล้ว',
    note: 'ฝ่ายรักษาความสะอาดรับเรื่องแล้ว',
  });

  assert.equal(updateRes1.success, true);
  assert.equal(updateRes1.changed, true);
  assert.equal(updateRes1.previous_status, 'รอตรวจสอบ');
  assert.equal(updateRes1.new_status, 'รับเรื่องแล้ว');

  // Check updated report and history order (newest first)
  const detail = FixLoopStore.getAdminReportById(created.report.id, adminPrn.id);
  assert.ok(detail);
  assert.equal(detail.status, 'รับเรื่องแล้ว');
  assert.equal(detail.history[0].new_status, 'รับเรื่องแล้ว');
  assert.equal(detail.history[0].note, 'ฝ่ายรักษาความสะอาดรับเรื่องแล้ว');
});

test('6. Unchanged status with empty note does not create duplicate history event', () => {
  const comms = FixLoopStore.getCommunities();
  const created = FixLoopStore.createReport({
    community_id: comms[0].id,
    category: 'ถนน/ทางเท้า',
    title: 'ทางเท้าทรุด',
    description: 'กระเบื้องปูทางเท้าแตก',
    location_text: 'ถนนพระสุเมรุ',
  });

  const adminPrn = AUTHORIZED_ADMINS.find((a) => a.id === 'admin-pranakorn-01');
  const res = FixLoopStore.updateReportStatus({
    reportId: created.report.id,
    adminId: adminPrn.id,
    newStatus: 'รอตรวจสอบ',
    note: '',
  });

  assert.equal(res.changed, false, 'Unchanged state without note should not trigger change');
});

test('7. Community Isolation: Admin A CANNOT manage reports of Community B', () => {
  const commPrn = 'c1000000-0000-0000-0000-000000000001'; // พระนคร
  const commPtw = 'c1000000-0000-0000-0000-000000000002'; // ปทุมวัน

  // Create report in ปทุมวัน
  const reportPtw = FixLoopStore.createReport({
    community_id: commPtw,
    category: 'ไฟฟ้า/ไฟส่องสว่าง',
    title: 'ไฟทางสยามสแควร์ดับ',
    description: 'ไฟกิ่งดับ 1 ดวง',
    location_text: 'สยามสแควร์ ซอย 2',
  });

  // Admin of พระนคร attempts to manage report of ปทุมวัน
  const adminPrn = AUTHORIZED_ADMINS.find((a) => a.id === 'admin-pranakorn-01');

  assert.throws(
    () => {
      FixLoopStore.updateReportStatus({
        reportId: reportPtw.report.id,
        adminId: adminPrn.id,
        newStatus: 'กำลังดำเนินการ',
        note: 'พยายามแก้ไขข้ามเขต',
      });
    },
    /Forbidden/,
    'Admin should be forbidden from updating reports outside assigned community'
  );

  assert.throws(
    () => {
      FixLoopStore.getAdminReportById(reportPtw.report.id, adminPrn.id);
    },
    /Forbidden/,
    'Admin should be forbidden from accessing detail of reports outside assigned community'
  );
});

test('8. Rejection of invalid status and oversized notes (> 200 chars)', () => {
  const comms = FixLoopStore.getCommunities();
  const created = FixLoopStore.createReport({
    community_id: comms[0].id,
    category: 'อื่นๆ',
    title: 'ทดสอบวาลิเดชัน',
    description: 'ทดสอบการปฏิเสธค่าสถานะไม่ถูกต้อง',
    location_text: 'จุดทดสอบ',
  });

  const adminPrn = AUTHORIZED_ADMINS.find((a) => a.id === 'admin-pranakorn-01');

  // Invalid status
  assert.throws(() => {
    FixLoopStore.updateReportStatus({
      reportId: created.report.id,
      adminId: adminPrn.id,
      newStatus: 'สถานะที่คิดขึ้นเอง',
    });
  }, /Invalid status/);

  // Oversized note > 200 chars
  const longNote = 'ก'.repeat(201);
  assert.throws(() => {
    FixLoopStore.updateReportStatus({
      reportId: created.report.id,
      adminId: adminPrn.id,
      newStatus: 'รับเรื่องแล้ว',
      note: longNote,
    });
  }, /200/);
});
