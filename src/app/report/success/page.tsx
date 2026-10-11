'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import QRCodeDisplay from '@/components/QRCodeDisplay';

export default function ReportSuccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const id = searchParams.get('id') || 'FIX-2025-XXXXX';

  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const trackingUrl = origin && token ? `${origin}/track/${token}` : '';

  const copyUrl = async () => {
    if (!trackingUrl) return;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  if (!token) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="brutal-card p-8 bg-white">
          <span className="material-symbols-outlined text-5xl text-yellow-500 mb-3">warning</span>
          <h1 className="text-2xl font-black text-[#1c1b1b] mb-2">ไม่พบข้อมูลโทเคนการแจ้งเรื่อง</h1>
          <p className="text-sm text-[#434656] mb-6">กรุณาส่งรายงานใหม่เพื่อรับรหัสติดตาม</p>
          <Link href="/report/new" className="brutal-btn-primary">
            แจ้งปัญหาใหม่
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-8 space-y-4 sm:space-y-8">
      {/* Success Banner (Stitch Screen 2 Mobile Reference) */}
      <div className="bg-[#8fffa1] border-3 sm:border-4 border-[#1c1b1b] p-4 sm:p-8 text-center shadow-[4px_4px_0px_0px_#1c1b1b] sm:shadow-[8px_8px_0px_0px_#1c1b1b]">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#005d25] text-white border-2 sm:border-3 border-[#1c1b1b] flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_#1c1b1b] sm:shadow-[3px_3px_0px_0px_#1c1b1b]">
          <span className="material-symbols-outlined text-3xl sm:text-4xl">check_circle</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#002109] tracking-tight">
          ส่งเรื่องร้องเรียนสำเร็จแล้ว!
        </h1>
        <p className="text-sm sm:text-lg text-[#003714] font-bold mt-1 sm:mt-2">
          เซฟหน้านี้ไว้ เพื่อดูผลงานการแก้ไขของเจ้าหน้าที่เขต
        </p>
      </div>

      {/* Official Tracking Card (Preserving Stitch QR reference) */}
      <div className="bg-white border-3 sm:border-4 border-[#1c1b1b] p-4 sm:p-8 shadow-[4px_4px_0px_0px_#1c1b1b] sm:shadow-[8px_8px_0px_0px_#1c1b1b] space-y-4 sm:space-y-6">
        <div className="border-b-2 border-[#1c1b1b] pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#747687]">
              รหัสรายงานสาธารณะ
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#003ece]">{id}</div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#fed74c] border-2 border-[#1c1b1b] text-xs font-black shadow-[2px_2px_0px_0px_#1c1b1b] self-start sm:self-auto">
            <span className="material-symbols-outlined text-sm">lock</span>
            <span>ลิงก์เฉพาะคุณ (ปลอดภัย)</span>
          </div>
        </div>

        {/* QR Code and Instructions */}
        <div className="py-2">
          <QRCodeDisplay trackingUrl={trackingUrl} size={200} />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Link
            href={`/track/${token}`}
            className="w-full brutal-btn-primary text-lg py-4 justify-center shadow-[4px_4px_0px_0px_#1c1b1b]"
          >
            <span className="material-symbols-outlined text-xl">open_in_new</span>
            <span>เปิดดูหน้าติดตามสถานะตอนนี้</span>
          </Link>

          <button
            type="button"
            onClick={copyUrl}
            className="w-full brutal-btn-secondary text-base py-3 justify-center shadow-[3px_3px_0px_0px_#1c1b1b]"
          >
            <span className="material-symbols-outlined text-lg">
              {copied ? 'check' : 'share'}
            </span>
            <span>{copied ? 'คัดลอกลิงก์สำเร็จแล้ว!' : 'คัดลอกลิงก์ส่งให้เพื่อนบ้าน'}</span>
          </button>
        </div>

        <div className="bg-[#f0eded] border-2 border-[#1c1b1b] p-4 text-xs text-[#434656] space-y-1.5 font-medium">
          <p className="font-bold text-[#1c1b1b]">📌 คำแนะนำการติดตาม:</p>
          <p>1. สามารถแคปหน้าจอหน้านี้ไว้ในมือถือ เพื่อสแกน QR Code เปิดดูภายหลัง</p>
          <p>2. สามารถบันทึก (Bookmark) หน้านี้ไว้ในเบราว์เซอร์</p>
          <p>3. เจ้าหน้าที่เขตจะอัปเดตสถานะและรูปผลงานการซ่อมแซมให้ท่านเห็นที่หน้าติดตาม</p>
        </div>
      </div>
    </div>
  );
}
