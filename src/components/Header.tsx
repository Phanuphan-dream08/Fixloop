'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [isSenior, setIsSenior] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check localStorage or document class
    const saved = localStorage.getItem('fixloop_senior_mode');
    if (saved === 'true') {
      setIsSenior(true);
      document.documentElement.classList.add('senior-mode');
    }
  }, []);

  const toggleSeniorMode = () => {
    const nextState = !isSenior;
    setIsSenior(nextState);
    localStorage.setItem('fixloop_senior_mode', String(nextState));
    if (nextState) {
      document.documentElement.classList.add('senior-mode');
    } else {
      document.documentElement.classList.remove('senior-mode');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fcf9f8] border-b-2 border-[#1c1b1b]">
      {/* Top Notice Bar */}
      <div className="bg-[#fed74c] border-b-2 border-[#1c1b1b] py-1 px-3 sm:px-4 text-[11px] sm:text-xs md:text-sm font-bold text-[#231b00] flex justify-between items-center gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <span className="material-symbols-outlined text-sm shrink-0">campaign</span>
          <span className="truncate">
            <span className="hidden sm:inline">ระบบรับเรื่องร้องเรียนและติดตามปัญหาชุมชน Fix-Loop </span>
            <span>ไม่ต้องลงทะเบียน • โทร 1555</span>
          </span>
        </div>
        <button
          onClick={toggleSeniorMode}
          type="button"
          className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-[#ffffff] hover:bg-[#1c1b1b] hover:text-white border border-[#1c1b1b] text-[10px] sm:text-xs font-bold transition-all shadow-[1px_1px_0px_0px_#1c1b1b]"
          title="สลับโหมดตัวหนังสือโตและอ่านง่ายสำหรับผู้สูงอายุ"
        >
          <span className="material-symbols-outlined text-xs sm:text-sm">elderly</span>
          <span>{isSenior ? 'ปิดโหมดสูงวัย' : 'โหมดสูงวัย'}</span>
        </button>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-decoration-none group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#003ece] border-2 border-[#1c1b1b] flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-[2px_2px_0px_0px_#1c1b1b] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform shrink-0">
              FL
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl tracking-tight text-[#1c1b1b] leading-none">FIX-LOOP</span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-[#747687]">Civic Action Network</span>
            </div>
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-3">
          <Link
            href="/"
            className={`px-3 py-1.5 font-bold text-sm transition-all border-2 ${
              pathname === '/'
                ? 'bg-[#ffffff] border-[#1c1b1b] shadow-[2px_2px_0px_0px_#1c1b1b]'
                : 'border-transparent hover:border-[#1c1b1b]'
            }`}
          >
            หน้าแรก
          </Link>

          <Link
            href="/report/new"
            className="brutal-btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">report_problem</span>
            <span>แจ้งปัญหาด่วน</span>
          </Link>

          <Link
            href="/admin/dashboard"
            className={`px-3 py-1.5 font-bold text-sm transition-all border-2 ${
              pathname.startsWith('/admin')
                ? 'bg-[#003ece] text-white border-[#1c1b1b] shadow-[2px_2px_0px_0px_#1c1b1b]'
                : 'bg-[#ffffff] text-[#1c1b1b] border-[#1c1b1b] hover:bg-[#eae7e7] shadow-[2px_2px_0px_0px_#1c1b1b]'
            }`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">badge</span>
            <span>เจ้าหน้าที่เขต</span>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/report/new"
            className="brutal-btn-primary text-xs py-1.5 px-2.5 font-bold"
          >
            แจ้งปัญหา
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 border-2 border-[#1c1b1b] bg-white text-[#1c1b1b]"
            aria-label="เมนู"
          >
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t-2 border-[#1c1b1b] bg-[#ffffff] p-4 flex flex-col gap-3">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="font-bold p-2 border-b border-gray-200"
          >
            หน้าแรก
          </Link>
          <Link
            href="/report/new"
            onClick={() => setIsMenuOpen(false)}
            className="brutal-btn-primary justify-center"
          >
            แจ้งปัญหาด่วน
          </Link>
          <Link
            href="/admin/dashboard"
            onClick={() => setIsMenuOpen(false)}
            className="brutal-btn-outline justify-center"
          >
            เข้าสู่ระบบเจ้าหน้าที่
          </Link>
          <button
            onClick={() => {
              toggleSeniorMode();
              setIsMenuOpen(false);
            }}
            className="brutal-btn-secondary justify-center text-sm"
          >
            {isSenior ? 'ปิดโหมดผู้สูงอายุ' : 'เปิดโหมดผู้สูงอายุ (ตัวโต)'}
          </button>
        </div>
      )}
    </header>
  );
}
