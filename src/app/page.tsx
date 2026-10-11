'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) {
      setSearchError('กรุณากรอกรหัสติดตามหรือโทเคน');
      return;
    }
    // If user pasted a full URL
    if (clean.includes('/track/')) {
      const parts = clean.split('/track/');
      router.push(`/track/${parts[1]}`);
      return;
    }
    router.push(`/track/${clean}`);
  };

  return (
    <div className="space-y-6 sm:space-y-12 py-2 sm:py-4">
      {/* Mobile Emergency Hotline Chips (Stitch Screen 1 Reference) */}
      <section className="bg-white border-2 sm:border-3 border-[#1c1b1b] p-3 sm:p-4 shadow-[3px_3px_0px_0px_#1c1b1b]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black uppercase text-[#1c1b1b] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-[#003ece]">call</span>
            <span>สายด่วนฉุกเฉิน (แตะเพื่อโทรออก)</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 border border-emerald-600">
            24 ชม.
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a
            href="tel:1555"
            className="flex items-center justify-between p-2 bg-[#fcf9f8] border-2 border-[#1c1b1b] hover:bg-[#fed74c] transition-all text-left shadow-[2px_2px_0px_0px_#1c1b1b] active:translate-x-0.5 active:translate-y-0.5"
          >
            <div>
              <span className="block text-[10px] text-[#747687] font-bold">ศูนย์ กทม.</span>
              <span className="block text-sm font-black text-[#1c1b1b]">1555</span>
            </div>
            <span className="material-symbols-outlined text-base text-[#003ece]">phone_forwarded</span>
          </a>
          <a
            href="tel:1130"
            className="flex items-center justify-between p-2 bg-[#fcf9f8] border-2 border-[#1c1b1b] hover:bg-[#fed74c] transition-all text-left shadow-[2px_2px_0px_0px_#1c1b1b] active:translate-x-0.5 active:translate-y-0.5"
          >
            <div>
              <span className="block text-[10px] text-[#747687] font-bold">การไฟฟ้านครหลวง</span>
              <span className="block text-sm font-black text-[#1c1b1b]">1130</span>
            </div>
            <span className="material-symbols-outlined text-base text-[#003ece]">phone_forwarded</span>
          </a>
          <a
            href="tel:1125"
            className="flex items-center justify-between p-2 bg-[#fcf9f8] border-2 border-[#1c1b1b] hover:bg-[#fed74c] transition-all text-left shadow-[2px_2px_0px_0px_#1c1b1b] active:translate-x-0.5 active:translate-y-0.5"
          >
            <div>
              <span className="block text-[10px] text-[#747687] font-bold">การประปานครหลวง</span>
              <span className="block text-sm font-black text-[#1c1b1b]">1125</span>
            </div>
            <span className="material-symbols-outlined text-base text-[#003ece]">phone_forwarded</span>
          </a>
          <a
            href="tel:191"
            className="flex items-center justify-between p-2 bg-[#fcf9f8] border-2 border-[#1c1b1b] hover:bg-[#fed74c] transition-all text-left shadow-[2px_2px_0px_0px_#1c1b1b] active:translate-x-0.5 active:translate-y-0.5"
          >
            <div>
              <span className="block text-[10px] text-[#747687] font-bold">แจ้งเหตุด่วน</span>
              <span className="block text-sm font-black text-red-700">191</span>
            </div>
            <span className="material-symbols-outlined text-base text-red-700">emergency</span>
          </a>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-[#ffffff] border-3 sm:border-4 border-[#1c1b1b] p-4 sm:p-10 shadow-[6px_6px_0px_0px_#1c1b1b] sm:shadow-[8px_8px_0px_0px_#1c1b1b]">
        <div className="max-w-3xl">
          <div className="inline-block bg-[#fed74c] text-[#231b00] border-2 border-[#1c1b1b] px-2.5 py-1 font-black text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 shadow-[2px_2px_0px_0px_#1c1b1b]">
            ★ ระบบร้องเรียนปัญหาชุมชนโดยตรงถึงเขต
          </div>

          <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-[#1c1b1b] tracking-tight leading-tight mb-4 sm:mb-6">
            เห็นปัญหา แจ้งได้
            <br />
            <span className="text-[#003ece] underline decoration-[#fed74c] decoration-4 sm:decoration-8">
              แก้ไขติดตามได้
            </span>
            <br />
            ร่วมสร้างเมืองน่าอยู่
          </h1>

          <p className="text-sm sm:text-xl text-[#434656] font-medium leading-relaxed mb-6 sm:mb-8">
            ประชาชนทุกคนสามารถรายงานปัญหาทางเท้า ไฟฟ้า ขยะ ท่อระบายน้ำ ได้ทันทีโดย{' '}
            <strong className="text-[#1c1b1b] bg-[#dde1ff] px-1">ไม่ต้องสร้างบัญชี</strong>{' '}
            รับรหัสลับและ QR Code เฉพาะเรื่อง เพื่อติดตามการทำงานของเจ้าหน้าที่ได้อย่างโปร่งใส
          </p>

          {/* Civic Live Metrics (Stitch Screen 1) */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#f6f3f2] border-2 border-[#1c1b1b] mb-6 shadow-[2px_2px_0px_0px_#1c1b1b]">
            <div className="text-center">
              <span className="block text-lg sm:text-2xl font-black text-[#003ece]">1,748</span>
              <span className="block text-[10px] sm:text-xs font-bold text-[#434656]">รับเรื่องแล้ว</span>
            </div>
            <div className="text-center border-x-2 border-[#1c1b1b]">
              <span className="block text-lg sm:text-2xl font-black text-emerald-700">1,315</span>
              <span className="block text-[10px] sm:text-xs font-bold text-[#434656]">แก้ไขเสร็จสิ้น</span>
            </div>
            <div className="text-center">
              <span className="block text-lg sm:text-2xl font-black text-[#b7791f]">48 ชม.</span>
              <span className="block text-[10px] sm:text-xs font-bold text-[#434656]">ระยะเวลาเฉลี่ย</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5">
            <Link
              href="/report/new"
              className="brutal-btn-primary text-base sm:text-lg py-3.5 sm:py-4 px-6 sm:px-8 justify-center shadow-[4px_4px_0px_0px_#1c1b1b] sm:shadow-[6px_6px_0px_0px_#1c1b1b]"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">campaign</span>
              <span>แจ้งปัญหาใหม่ทันที (1 นาที)</span>
            </Link>

            <a
              href="#track-section"
              className="brutal-btn-secondary text-sm sm:text-base py-3 sm:py-4 px-5 sm:px-6 justify-center"
            >
              <span className="material-symbols-outlined text-lg sm:text-xl">qr_code_scanner</span>
              <span>มีรหัสแล้ว? ตรวจสอบสถานะ</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 text-[11px] sm:text-xs font-bold text-[#747687]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-base sm:text-lg">verified</span>
              ไม่ต้องเข้าสู่ระบบ
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-base sm:text-lg">verified</span>
              รักษาความเป็นส่วนตัว
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-emerald-600 text-base sm:text-lg">verified</span>
              ติดตาม 5 ขั้นตอน
            </span>
          </div>
        </div>
      </section>

      {/* Quick Track Input Section */}
      <section
        id="track-section"
        className="bg-[#fed74c] border-3 border-[#1c1b1b] p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1c1b1b]"
      >
        <div className="max-w-2xl">
          <h2 className="text-2xl font-black text-[#1c1b1b] mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">find_in_page</span>
            <span>ตรวจสอบสถานะเรื่องร้องเรียนของคุณ</span>
          </h2>
          <p className="text-sm font-bold text-[#564500] mb-4">
            นำโทเคน (Token) หรือลิงก์ติดตามที่คุณได้รับหลังส่งเรื่องมาใส่ที่นี่
          </p>

          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setSearchError('');
              }}
              placeholder="ตัวอย่าง: tk_b8492fa790d8... หรือ ลิงก์ที่เซฟไว้"
              className="brutal-input flex-1 text-sm bg-white"
            />
            <button type="submit" className="brutal-btn-primary whitespace-nowrap">
              <span className="material-symbols-outlined text-lg">search</span>
              <span>ดูความคืบหน้า</span>
            </button>
          </form>

          {searchError && (
            <p className="mt-2 text-xs font-bold text-red-700 bg-red-100 p-2 border border-red-700">
              {searchError}
            </p>
          )}

          <div className="mt-3 text-xs text-[#564500]">
            💡 ลองดูตัวอย่างรายงานที่มีในระบบ:{' '}
            <Link
              href="/track/tk_b8492fa790d84a1e9c2b9a78120d5e1683401fa9b"
              className="font-bold underline text-[#003ece]"
            >
              #FIX-2025-08492 (ฝาท่อชำรุด)
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Steps Explainer */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-black text-[#1c1b1b] tracking-tight">
            สิ่งที่จะเกิดขึ้นหลังส่งเรื่อง
          </h2>
          <p className="text-sm font-medium text-[#747687] mt-1">
            กระบวนการทำงานที่ชัดเจน โปร่งใส ตรวจสอบได้ทุกนาที
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="brutal-card p-6 bg-white relative">
            <div className="w-10 h-10 bg-[#fed74c] border-2 border-[#1c1b1b] flex items-center justify-center font-black text-lg mb-4 shadow-[2px_2px_0px_0px_#1c1b1b]">
              1
            </div>
            <h3 className="font-black text-xl text-[#1c1b1b] mb-2">แจ้งเรื่องใน 1 นาที</h3>
            <p className="text-sm text-[#434656] leading-relaxed">
              ระบุประเภทปัญหา พิมพ์สถานที่สังเกตง่ายๆ และแนบรูปถ่าย 1 รูป (มีหรือไม่มีก็ได้) ไม่ต้องดาวน์โหลดแอปพลิเคชัน
            </p>
          </div>

          <div className="brutal-card p-6 bg-white relative">
            <div className="w-10 h-10 bg-[#003ece] text-white border-2 border-[#1c1b1b] flex items-center justify-center font-black text-lg mb-4 shadow-[2px_2px_0px_0px_#1c1b1b]">
              2
            </div>
            <h3 className="font-black text-xl text-[#1c1b1b] mb-2">รับ QR Code ทันที</h3>
            <p className="text-sm text-[#434656] leading-relaxed">
              ระบบออกรหัสลับและภาพ QR Code บันทึกลงในเครื่องหรือส่งต่อให้เพื่อนบ้านร่วมติดตามความคืบหน้าได้พร้อมกัน
            </p>
          </div>

          <div className="brutal-card p-6 bg-white relative">
            <div className="w-10 h-10 bg-[#8fffa1] text-[#002109] border-2 border-[#1c1b1b] flex items-center justify-center font-black text-lg mb-4 shadow-[2px_2px_0px_0px_#1c1b1b]">
              3
            </div>
            <h3 className="font-black text-xl text-[#1c1b1b] mb-2">เขตลงพื้นที่แก้ไข</h3>
            <p className="text-sm text-[#434656] leading-relaxed">
              เจ้าหน้าที่ในเขตรับเรื่อง ลงพื้นที่ซ่อมแซม และอัปเดตบันทึกการทำงานสาธารณะจนกว่าปัญหาจะเสร็จสมบูรณ์
            </p>
          </div>
        </div>
      </section>

      {/* Senior Mode Callout Card */}
      <section className="bg-[#f0eded] border-3 border-[#1c1b1b] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1c1b1b] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#1c1b1b] text-xs font-black">
            <span className="material-symbols-outlined text-sm">elderly</span>
            <span>เพื่อผู้สูงอายุและครอบครัว</span>
          </div>
          <h3 className="text-2xl font-black text-[#1c1b1b]">
            โหมดผู้สูงอายุ (Senior Mode) อ่านสบายตา ตัวหนังสือโต
          </h3>
          <p className="text-sm text-[#434656] max-w-xl">
            ออกแบบปุ่มกดขนาดใหญ่ คอนทราสต์สูงพิเศษ และใช้ภาษาอธิบายที่เข้าใจง่าย เพื่อให้คุณตาคุณยายแจ้งปัญหาได้ด้วยตนเองอย่างสะดวก
          </p>
        </div>

        <Link
          href="/report/new?mode=senior"
          className="brutal-btn-secondary whitespace-nowrap text-base py-3 px-6 shadow-[4px_4px_0px_0px_#1c1b1b]"
        >
          <span className="material-symbols-outlined text-xl">touch_app</span>
          <span>เข้าสู่โหมดผู้สูงอายุ</span>
        </Link>
      </section>
    </div>
  );
}
