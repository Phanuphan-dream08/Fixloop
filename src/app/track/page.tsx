'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TrackLandingPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) {
      setError('กรุณากรอกรหัสติดตามหรือโทเคน');
      return;
    }
    if (clean.includes('/track/')) {
      const parts = clean.split('/track/');
      router.push(`/track/${parts[1]}`);
      return;
    }
    router.push(`/track/${clean}`);
  };

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-8 space-y-6">
      {/* Title */}
      <div className="bg-white border-3 sm:border-4 border-[#1c1b1b] p-4 sm:p-8 shadow-[4px_4px_0px_0px_#1c1b1b] sm:shadow-[6px_6px_0px_0px_#1c1b1b]">
        <div className="inline-block bg-[#fed74c] text-[#231b00] border-2 border-[#1c1b1b] px-2.5 py-0.5 sm:py-1 font-black text-xs uppercase mb-2 sm:mb-3 shadow-[2px_2px_0px_0px_#1c1b1b]">
          ★ ตรวจสอบความคืบหน้าเรื่องร้องเรียน
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#1c1b1b] tracking-tight">
          ติดตามสถานะการแก้ไข
        </h1>
        <p className="text-xs sm:text-base text-[#434656] mt-1 sm:mt-2 font-medium">
          นำรหัสโทเคน (Token) หรือลิงก์เฉพาะเรื่องที่ท่านได้รับหลังส่งรายงานมากรอกที่นี่
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-[#fed74c] border-3 border-[#1c1b1b] p-4 sm:p-6 shadow-[4px_4px_0px_0px_#1c1b1b]">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-sm font-black text-[#1c1b1b]">
            ใส่รหัสติดตาม (Tracking Token):
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setError('');
              }}
              placeholder="ตัวอย่าง: tk_b8492fa7... หรือ ลิงก์ที่เซฟไว้"
              className="brutal-input flex-1 text-sm bg-white"
            />
            <button
              type="submit"
              className="brutal-btn-primary py-3 sm:py-2.5 px-6 whitespace-nowrap active:translate-x-0.5 active:translate-y-0.5"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              <span>ตรวจสอบ</span>
            </button>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-800 bg-red-100 p-2 border border-red-800">
              {error}
            </p>
          )}
        </form>

        <div className="mt-4 pt-3 border-t-2 border-[#1c1b1b] text-xs text-[#564500]">
          💡 ลองดูตัวอย่างรายงานจริงในระบบ:{' '}
          <Link
            href="/track/tk_b8492fa790d84a1e9c2b9a78120d5e1683401fa9b"
            className="font-black underline text-[#003ece]"
          >
            #FIX-2025-08492 (ฝาท่อชำรุด)
          </Link>
        </div>
      </div>

      {/* Quick Guide Card */}
      <div className="bg-white border-2 border-[#1c1b1b] p-4 shadow-[3px_3px_0px_0px_#1c1b1b] space-y-2">
        <h3 className="font-black text-sm text-[#1c1b1b] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-[#003ece]">info</span>
          <span>ไม่พบรหัสติดตาม?</span>
        </h3>
        <p className="text-xs text-[#434656] leading-relaxed">
          หากท่านพึ่งแจ้งเรื่องไปเมื่อสักครู่ รหัสติดตามจะแสดงอยู่ที่หน้าผลลัพธ์พร้อม QR Code
          หรือหากยังไม่ได้แจ้ง สามารถกดแจ้งปัญหาใหม่ได้ทันทีโดยไม่ต้องสมัครสมาชิก
        </p>
        <div className="pt-2">
          <Link href="/report/new" className="brutal-btn-secondary w-full text-xs py-2 justify-center">
            + แจ้งปัญหาใหม่ทันที
          </Link>
        </div>
      </div>
    </div>
  );
}
