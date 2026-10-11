'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Report,
  ReportStatus,
  REPORT_STATUSES,
  ReportStatusHistoryItem,
  Community,
} from '@/types';
import { STATUS_META } from '@/lib/constants';
import StatusBadge from '@/components/StatusBadge';
import {
  getAdminSessionAction,
  getAdminReportsAction,
  getCommunitiesAction,
  updateReportStatusAction,
  logoutAdminAction,
} from '@/lib/actions';
import { AuthorizedAdmin } from '@/lib/store';

export default function AdminDashboardPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<AuthorizedAdmin | null>(null);
  const [reports, setReports] = useState<(Report & { community_name: string })[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<
    (Report & { community_name: string; history?: ReportStatusHistoryItem[] }) | null
  >(null);

  // Status update form states
  const [newStatus, setNewStatus] = useState<ReportStatus>('รับเรื่องแล้ว');
  const [note, setNote] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadData = useCallback(async () => {
    try {
      const currentAdmin = await getAdminSessionAction();
      if (!currentAdmin) {
        router.push('/admin/login');
        return;
      }
      setAdmin(currentAdmin);

      const allComms = await getCommunitiesAction();
      // Filter communities to only those assigned to the current admin
      const assignedComms = allComms.filter((c) =>
        currentAdmin.assigned_community_ids.includes(c.id)
      );
      setCommunities(assignedComms);

      const res = await getAdminReportsAction({
        communityId: selectedCommunityId || undefined,
        status: (selectedStatus as ReportStatus) || undefined,
        search: searchQuery || undefined,
      });

      setReports(res.reports);
    } catch (err: any) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [router, selectedCommunityId, selectedStatus, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectReport = (r: Report & { community_name: string }) => {
    setActiveReport(r);
    setNewStatus(r.status);
    setNote('');
    setUpdateMessage(null);
  };

  const handleStatusUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    if (note.length > 200) {
      setUpdateMessage({ type: 'error', text: 'บันทึกข้อความต้องไม่เกิน 200 ตัวอักษร' });
      return;
    }

    setUpdating(true);
    setUpdateMessage(null);

    try {
      const res = await updateReportStatusAction({
        reportId: activeReport.id,
        newStatus,
        note,
      });

      if (!res.success) {
        setUpdateMessage({ type: 'error', text: res.error || 'อัปเดตไม่สำเร็จ' });
        setUpdating(false);
        return;
      }

      setUpdateMessage({
        type: 'success',
        text: res.changed ? 'อัปเดตสถานะและบันทึกประวัติเรียบร้อยแล้ว' : 'ข้อมูลไม่มีการเปลี่ยนแปลง',
      });

      // Reload list and update current active report
      await loadData();
      setActiveReport((prev) => (prev ? { ...prev, status: newStatus } : null));
      setNote('');
    } catch (err: any) {
      setUpdateMessage({ type: 'error', text: err.message || 'เกิดข้อผิดพลาดในการอัปเดต' });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdminAction();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block brutal-card p-8 bg-white">
          <div className="w-10 h-10 border-4 border-[#1c1b1b] border-t-[#003ece] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-bold text-sm">กำลังโหลดข้อมูลศูนย์จัดการปัญหาเมือง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Top Banner (Matching fixloop_5) */}
      <div className="bg-white border-4 border-[#1c1b1b] p-6 shadow-[8px_8px_0px_0px_#1c1b1b] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#dde1ff] text-[#001453] border-2 border-[#1c1b1b] font-black text-xs uppercase mb-2 shadow-[2px_2px_0px_0px_#1c1b1b]">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span>ศูนย์ประสานงานและจัดการปัญหาเมือง (Civic Command)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1c1b1b] tracking-tight">
            {admin?.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#434656] font-medium">
            สิทธิ์การจัดการ:{' '}
            <strong className="text-[#003ece]">
              {communities.map((c) => c.name).join(', ') || 'ไม่มีเขตที่ได้รับมอบหมาย'}
            </strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            type="button"
            className="brutal-btn-outline text-xs py-2 px-3"
            title="รีเฟรชข้อมูล"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>รีเฟรช</span>
          </button>
          <button
            onClick={handleLogout}
            type="button"
            className="brutal-btn-secondary text-xs py-2 px-3 text-red-900"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="brutal-card p-4 bg-white">
          <span className="text-xs font-bold text-[#747687]">รายงานทั้งหมดในเขต</span>
          <div className="text-3xl font-black text-[#1c1b1b] mt-1">{reports.length}</div>
        </div>
        <div className="brutal-card p-4 bg-[#dde1ff]">
          <span className="text-xs font-bold text-[#001453]">รับเรื่อง / ดำเนินการ</span>
          <div className="text-3xl font-black text-[#003ece] mt-1">
            {reports.filter((r) => r.status === 'รับเรื่องแล้ว' || r.status === 'กำลังดำเนินการ').length}
          </div>
        </div>
        <div className="brutal-card p-4 bg-[#fed74c]">
          <span className="text-xs font-bold text-[#735d00]">รอตรวจสอบ</span>
          <div className="text-3xl font-black text-[#725c00] mt-1">
            {reports.filter((r) => r.status === 'รอตรวจสอบ').length}
          </div>
        </div>
        <div className="brutal-card p-4 bg-[#8fffa1]">
          <span className="text-xs font-bold text-[#002109]">แก้ไขแล้วเสร็จ</span>
          <div className="text-3xl font-black text-[#005d25] mt-1">
            {reports.filter((r) => r.status === 'แก้ไขแล้ว').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-3 border-[#1c1b1b] p-4 shadow-[4px_4px_0px_0px_#1c1b1b] flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาด้วยรหัสรายงาน, สถานที่, หรือคำอธิบาย..."
            className="brutal-input text-xs sm:text-sm py-2"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="brutal-input text-xs sm:text-sm py-2 bg-white font-bold"
          >
            <option value="">ทุกสถานะ (5 สถานะ)</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {communities.length > 1 && (
          <div className="w-full md:w-56">
            <select
              value={selectedCommunityId}
              onChange={(e) => setSelectedCommunityId(e.target.value)}
              className="brutal-input text-xs sm:text-sm py-2 bg-white font-bold"
            >
              <option value="">ทุกเขตที่รับผิดชอบ</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Table and Drawer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports Table (2 Cols on desktop) */}
        <div className="lg:col-span-2 bg-white border-4 border-[#1c1b1b] p-4 sm:p-6 shadow-[8px_8px_0px_0px_#1c1b1b]">
          <h2 className="text-xl font-black text-[#1c1b1b] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-[#003ece]">table_chart</span>
            <span>ตารางเคสในความรับผิดชอบ ({reports.length} รายการ)</span>
          </h2>

          {reports.length === 0 ? (
            <div className="text-center py-12 text-[#747687] font-bold">
              ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#1c1b1b] bg-[#f0eded] text-[#1c1b1b] font-black text-xs uppercase">
                    <th className="p-3">รหัส / วันที่</th>
                    <th className="p-3">ประเภท / หัวข้อ</th>
                    <th className="p-3">สถานที่</th>
                    <th className="p-3">สถานะ</th>
                    <th className="p-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reports.map((r) => {
                    const isSelected = activeReport?.id === r.id;
                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-[#f6f3f2] transition-colors ${
                          isSelected ? 'bg-[#dde1ff]' : ''
                        }`}
                      >
                        <td className="p-3 font-mono">
                          <span className="font-bold text-[#003ece] block">{r.public_tracking_id}</span>
                          <span className="text-[11px] text-[#747687]">
                            {new Date(r.created_at).toLocaleDateString('th-TH')}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs font-bold text-[#747687] block">{r.category}</span>
                          <span className="font-bold text-[#1c1b1b] line-clamp-1">{r.title}</span>
                        </td>
                        <td className="p-3 text-xs text-[#434656] max-w-[150px] truncate">
                          {r.location_text}
                        </td>
                        <td className="p-3">
                          <StatusBadge status={r.status} size="sm" />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectReport(r)}
                            className="brutal-btn-outline text-xs py-1 px-2.5 shadow-[2px_2px_0px_0px_#1c1b1b]"
                          >
                            จัดการ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Detail & Status Management Drawer (1 Col) */}
        <div className="bg-white border-4 border-[#1c1b1b] p-6 shadow-[8px_8px_0px_0px_#1c1b1b] space-y-6">
          {activeReport ? (
            <>
              <div className="border-b-2 border-[#1c1b1b] pb-3">
                <span className="text-xs font-bold uppercase text-[#747687]">
                  รายละเอียดรายงาน
                </span>
                <h3 className="text-2xl font-black text-[#003ece]">
                  #{activeReport.public_tracking_id}
                </h3>
                <span className="text-xs font-bold text-[#1c1b1b] block mt-1">
                  สังกัด: {activeReport.community_name}
                </span>
              </div>

              {/* Status Update Form (Atomic commit, Canonical 5 statuses) */}
              <form onSubmit={handleStatusUpdateSubmit} className="space-y-4 bg-[#fcf9f8] p-4 border-2 border-[#1c1b1b]">
                <h4 className="font-black text-sm text-[#1c1b1b] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-[#003ece]">published_with_changes</span>
                  <span>อัปเดตสถานะ (5 สถานะทางการ)</span>
                </h4>

                {updateMessage && (
                  <div
                    className={`p-2.5 text-xs font-bold border-2 border-[#1c1b1b] ${
                      updateMessage.type === 'success'
                        ? 'bg-[#8fffa1] text-[#002109]'
                        : 'bg-[#ffdad6] text-[#93000a]'
                    }`}
                  >
                    {updateMessage.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-[#1c1b1b] mb-1">
                    เปลี่ยนเป็นสถานะ:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    className="brutal-input text-xs font-bold bg-white"
                  >
                    {REPORT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-black text-[#1c1b1b]">
                      บันทึกความคืบหน้าสาธารณะ:
                    </label>
                    <span className="text-[11px] font-mono text-[#747687]">
                      {note.length}/200 ตัวอักษร
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เช่น จัดส่งทีมช่างเข้าเทปูน, ประสาน กฟน. เรียบร้อย (ไม่เกิน 200 ตัวอักษร)"
                    className="brutal-input text-xs resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full brutal-btn-primary text-xs py-2.5 justify-center shadow-[3px_3px_0px_0px_#1c1b1b]"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{updating ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                </button>
              </form>

              {/* Private Reporter Contact (Authorized Access Only) */}
              <div className="bg-[#fff9e6] border-2 border-[#fed74c] p-3 text-xs space-y-1">
                <span className="font-black text-[#735d00] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>ข้อมูลติดต่อผู้แจ้ง (สำหรับเจ้าหน้าที่เท่านั้น):</span>
                </span>
                <p className="font-bold text-[#1c1b1b]">
                  {activeReport.reporter_contact || 'ผู้แจ้งไม่ได้ระบุข้อมูลติดต่อ'}
                </p>
              </div>

              {/* Report Full Summary */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[#747687]">สถานที่:</span>
                  <p className="font-bold text-[#1c1b1b] mt-0.5">{activeReport.location_text}</p>
                </div>
                <div>
                  <span className="font-bold text-[#747687]">รายละเอียด:</span>
                  <p className="text-[#434656] mt-0.5 leading-relaxed">{activeReport.description}</p>
                </div>
                {activeReport.image_url && (
                  <div>
                    <span className="font-bold text-[#747687]">ภาพถ่าย:</span>
                    <img
                      src={activeReport.image_url}
                      alt={activeReport.title}
                      className="mt-1 w-full max-h-40 object-cover border border-[#1c1b1b]"
                    />
                  </div>
                )}
                <div className="pt-2">
                  <a
                    href={`/track/${activeReport.tracking_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#003ece] underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    <span>เปิดดูหน้าติดตามสาธารณะของประชาชน</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-[#747687] space-y-2">
              <span className="material-symbols-outlined text-4xl">touch_app</span>
              <p className="font-bold text-sm">กรุณาเลือกรายการจากตารางเพื่อดูรายละเอียดและอัปเดตสถานะ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
