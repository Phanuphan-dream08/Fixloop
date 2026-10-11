'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PublicReportView, REPORT_STATUSES } from '@/types';
import { STATUS_META } from '@/lib/constants';
import StatusBadge from '@/components/StatusBadge';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { getPublicReportAction } from '@/lib/actions';

export default function TrackReportPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = String(params.token || '');
  const isSeniorParam = searchParams.get('mode') === 'senior';

  const [report, setReport] = useState<PublicReportView | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSeniorMode, setIsSeniorMode] = useState(isSeniorParam);
  const [origin, setOrigin] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      if (isSeniorParam || localStorage.getItem('fixloop_senior_mode') === 'true') {
        setIsSeniorMode(true);
        document.documentElement.classList.add('senior-mode');
      }
    }

    if (!token) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    getPublicReportAction(token)
      .then((data) => {
        if (!data) {
          setNotFound(true);
        } else {
          setReport(data);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token, isSeniorParam]);

  const toggleSenior = () => {
    const next = !isSeniorMode;
    setIsSeniorMode(next);
    localStorage.setItem('fixloop_senior_mode', String(next));
    if (next) {
      document.documentElement.classList.add('senior-mode');
    } else {
      document.documentElement.classList.remove('senior-mode');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim();
    if (!clean) return;
    if (clean.includes('/track/')) {
      const parts = clean.split('/track/');
      router.push(`/track/${parts[1]}`);
      return;
    }
    router.push(`/track/${clean}`);
  };

  const handleCopyLink = async () => {
    if (!currentUrl) return;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // 1. Loading State (Matching Stitch fixloop_states)
  if (loading) {
    return (
      <div className="max-w-md mx-auto py-12 px-2 text-center">
        <div className="bg-white border-3 border-[#1c1b1b] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1c1b1b]">
          <div className="w-10 h-10 border-4 border-[#1c1b1b] border-t-[#003ece] rounded-full animate-spin mx-auto mb-3"></div>
          <h2 className="text-xl font-black text-[#1c1b1b]">กำลังโหลดข้อมูล...</h2>
          <p className="text-xs text-[#747687] mt-1 font-medium">
            ระบบกำลังดึงข้อมูลความคืบหน้าล่าสุด กรุณารอสักครู่
          </p>
        </div>
      </div>
    );
  }

  // 2. Not Found / Invalid Token State (Matching Stitch fixloop_states)
  if (notFound || !report) {
    return (
      <div className="max-w-md mx-auto py-8 px-2 text-center">
        <div className="bg-[#ffdad6] border-3 sm:border-4 border-[#ba1a1a] p-6 shadow-[4px_4px_0px_0px_#ba1a1a] space-y-3">
          <span className="material-symbols-outlined text-5xl text-[#93000a]">search_off</span>
          <h1 className="text-xl sm:text-2xl font-black text-[#93000a]">
            ไม่พบเรื่องร้องเรียนในระบบ
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#ba1a1a] leading-relaxed">
            รหัสติดตามอาจไม่ถูกต้อง หรือเรื่องนี้ไม่มีอยู่ในระบบ
          </p>
          <div className="pt-3 flex flex-col gap-2">
            <Link href="/track" className="brutal-btn-outline text-xs py-2 justify-center">
              ค้นหาด้วยรหัสอื่น
            </Link>
            <Link href="/report/new" className="brutal-btn-primary text-xs py-2 justify-center">
              แจ้งปัญหาใหม่
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentMeta = STATUS_META[report.status];
  const currentStepNum = currentMeta.step;
  const currentUrl = origin ? `${origin}/track/${report.tracking_token}` : '';

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 space-y-4 sm:space-y-8">
      {/* Quick Search Header (Stitch Screen 4 Reference) */}
      <div className="bg-[#fed74c] border-2 sm:border-3 border-[#1c1b1b] p-3 sm:p-4 shadow-[3px_3px_0px_0px_#1c1b1b]">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเรื่องอื่นด้วย Token หรือรหัส..."
            className="brutal-input text-xs sm:text-sm py-2 px-3 flex-1 bg-white"
          />
          <button
            type="submit"
            className="brutal-btn-primary text-xs py-2 px-3 sm:px-4 whitespace-nowrap active:scale-95"
          >
            <span className="material-symbols-outlined text-base">search</span>
            <span className="hidden sm:inline">ค้นหา</span>
          </button>
        </form>
      </div>

      {/* Top Header Card */}
      <div className="bg-white border-3 sm:border-4 border-[#1c1b1b] p-4 sm:p-8 shadow-[4px_4px_0px_0px_#1c1b1b] sm:shadow-[8px_8px_0px_0px_#1c1b1b] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#1c1b1b] pb-3 sm:pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#747687]">
                รายงานหมายเลข
              </span>
              <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 bg-gray-100 border border-[#1c1b1b]">
                {report.community_name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#003ece] tracking-tight">
              #{report.public_tracking_id}
            </h1>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2">
            <button
              onClick={toggleSenior}
              type="button"
              className="brutal-btn-secondary text-[11px] sm:text-xs py-1.5 px-2.5 flex items-center gap-1 shadow-[2px_2px_0px_0px_#1c1b1b]"
            >
              <span className="material-symbols-outlined text-sm">elderly</span>
              <span>{isSeniorMode ? 'โหมดปกติ' : 'โหมดสูงวัย'}</span>
            </button>
            <StatusBadge status={report.status} size="md" />
          </div>
        </div>

        {/* Current status explanation banner (Stitch Screen 4) */}
        <div
          style={{ backgroundColor: currentMeta.bgColor }}
          className="border-2 border-[#1c1b1b] p-3 sm:p-4 text-[#1c1b1b] shadow-[3px_3px_0px_0px_#1c1b1b]"
        >
          <div className="flex items-center gap-2 font-black text-base sm:text-lg mb-1">
            <span className="material-symbols-outlined text-xl">{currentMeta.icon}</span>
            <span>สถานะ: {report.status}</span>
          </div>
          <p className="text-xs sm:text-sm font-bold">
            {isSeniorMode ? currentMeta.seniorDescription : currentMeta.description}
          </p>
        </div>

        {/* Main Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-1 sm:pt-2">
          <div className="md:col-span-2 space-y-3">
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-[#747687]">ประเภทปัญหา</span>
              <p className="text-sm sm:text-base font-black text-[#1c1b1b]">{report.category}</p>
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-[#747687]">หัวข้อเรื่อง</span>
              <p className="text-base sm:text-lg font-black text-[#1c1b1b]">{report.title}</p>
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-[#747687]">สถานที่ / จุดสังเกต</span>
              <p className="text-xs sm:text-sm font-bold text-[#1c1b1b] flex items-center gap-1.5 bg-[#f6f3f2] p-2 sm:p-2.5 border border-[#1c1b1b]">
                <span className="material-symbols-outlined text-base text-[#003ece] shrink-0">location_on</span>
                <span className="break-words">{report.location_text}</span>
              </p>
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-[#747687]">รายละเอียด</span>
              <p className="text-xs sm:text-sm text-[#434656] whitespace-pre-wrap leading-relaxed">
                {report.description}
              </p>
            </div>
          </div>

          {/* Photo if present */}
          <div className="space-y-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-[#747687]">รูปภาพสถานที่เกิดเหตุ</span>
            {report.image_url ? (
              <div className="border-2 border-[#1c1b1b] overflow-hidden bg-gray-50 shadow-[3px_3px_0px_0px_#1c1b1b]">
                <img
                  src={report.image_url}
                  alt={report.title}
                  className="w-full h-44 sm:h-48 object-cover"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#1c1b1b] p-4 text-center text-xs text-[#747687] bg-gray-50">
                ไม่มีภาพแนบมากับรายงานนี้
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5-Stage Status Pipeline (Optimized for Mobile Phone Screens) */}
      <div className="bg-white border-3 sm:border-4 border-[#1c1b1b] p-4 sm:p-8 shadow-[4px_4px_0px_0px_#1c1b1b] sm:shadow-[8px_8px_0px_0px_#1c1b1b] space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-2xl font-black text-[#1c1b1b] flex items-center gap-2">
          <span className="material-symbols-outlined text-xl sm:text-2xl text-[#003ece]">timeline</span>
          <span>ขั้นตอนการดำเนินงาน (5 ขั้นตอน)</span>
        </h2>

        {/* Mobile-friendly Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {REPORT_STATUSES.map((statusName, idx) => {
            const stepNum = idx + 1;
            const meta = STATUS_META[statusName];
            const isCompleted = stepNum < currentStepNum;
            const isCurrent = stepNum === currentStepNum;

            return (
              <div
                key={statusName}
                className={`p-3 border-2 border-[#1c1b1b] flex sm:flex-col justify-between items-center sm:items-start transition-all gap-2 ${
                  isCurrent
                    ? 'bg-[#fed74c] shadow-[3px_3px_0px_0px_#1c1b1b] translate-y-[-1px]'
                    : isCompleted
                    ? 'bg-[#e4e6ff] text-[#001453]'
                    : 'bg-gray-50 opacity-60 text-gray-400'
                }`}
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-2.5 sm:gap-0 w-full">
                  <div className="flex items-center justify-between w-full mb-0 sm:mb-2">
                    <span className="w-6 h-6 border border-[#1c1b1b] bg-white text-[#1c1b1b] font-black text-xs flex items-center justify-center shrink-0">
                      {stepNum}
                    </span>
                    <span className="material-symbols-outlined text-base hidden sm:inline">
                      {isCompleted ? 'check_circle' : isCurrent ? 'hourglass_top' : 'radio_button_unchecked'}
                    </span>
                  </div>
                  <div className="font-black text-xs sm:text-sm text-[#1c1b1b] truncate">
                    {statusName}
                  </div>
                </div>

                <div className="text-[10px] sm:text-[11px] text-[#434656] font-medium hidden sm:block mt-1">
                  {meta.description}
                </div>

                <span className="material-symbols-outlined text-lg sm:hidden shrink-0">
                  {isCompleted ? 'check_circle' : isCurrent ? 'hourglass_top' : 'radio_button_unchecked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Public Audit Trail */}
      <div className="bg-white border-3 sm:border-4 border-[#1c1b1b] p-4 sm:p-8 shadow-[4px_4px_0px_0px_#1c1b1b] sm:shadow-[8px_8px_0px_0px_#1c1b1b] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-black text-[#1c1b1b] flex items-center gap-2">
            <span className="material-symbols-outlined text-xl sm:text-2xl text-[#003ece]">history_edu</span>
            <span>บันทึกความคืบหน้า</span>
          </h2>
          <span className="text-[10px] sm:text-xs font-bold text-[#747687]">เรียงล่าสุดก่อน</span>
        </div>

        {report.history && report.history.length > 0 ? (
          <div className="space-y-2.5 sm:space-y-4">
            {report.history.map((item, idx) => (
              <div
                key={idx}
                className="border-2 border-[#1c1b1b] p-3 sm:p-4 bg-[#fcf9f8] shadow-[2px_2px_0px_0px_#1c1b1b] flex flex-col sm:flex-row sm:items-start justify-between gap-2"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.new_status} size="sm" />
                    {item.previous_status && (
                      <span className="text-[10px] sm:text-xs text-[#747687]">
                        (จาก: {item.previous_status})
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#1c1b1b]">
                    {item.note || 'อัปเดตสถานะการทำงาน'}
                  </p>
                </div>
                <div className="text-[10px] sm:text-xs text-[#747687] font-mono whitespace-nowrap">
                  {new Date(item.created_at).toLocaleString('th-TH', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-[#747687]">ยังไม่มีบันทึกประวัติเพิ่มเติม</p>
        )}
      </div>

      {/* Share / Save QR Code Card */}
      <div className="bg-[#fed74c] border-3 sm:border-4 border-[#1c1b1b] p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1c1b1b] sm:shadow-[8px_8px_0px_0px_#1c1b1b] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2 text-center sm:text-left w-full sm:w-auto">
          <h3 className="text-lg sm:text-xl font-black text-[#1c1b1b]">
            ต้องการแชร์หรือส่งต่อให้เพื่อนบ้าน?
          </h3>
          <p className="text-xs sm:text-sm font-bold text-[#564500]">
            สแกน QR Code นี้ หรือคัดลอกลิงก์เพื่อส่งต่อในกลุ่ม LINE
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="brutal-btn-primary text-xs py-2 px-4 shadow-[2px_2px_0px_0px_#1c1b1b]"
            >
              <span className="material-symbols-outlined text-base">
                {copied ? 'check' : 'content_copy'}
              </span>
              <span>{copied ? 'คัดลอกสำเร็จแล้ว!' : 'คัดลอกลิงก์เรื่องนี้'}</span>
            </button>
          </div>
        </div>
        <div className="w-full sm:w-auto flex justify-center">
          <QRCodeDisplay trackingUrl={currentUrl} size={140} />
        </div>
      </div>
    </div>
  );
}
