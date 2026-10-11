'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const [isSenior, setIsSenior] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('fixloop_senior_mode');
    if (saved === 'true') {
      setIsSenior(true);
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

  const isHome = pathname === '/';
  const isReport = pathname.startsWith('/report');
  const isTrack = pathname.startsWith('/track');

  return (
    <nav
      aria-label="เมนูหลักสำหรับโทรศัพท์"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#ffffff] border-t-3 border-[#1c1b1b] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] pb-safe"
    >
      <div className="grid grid-cols-4 h-16 items-center px-1">
        {/* 1. หน้าแรก */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isHome
              ? 'text-[#003ece] font-black'
              : 'text-[#434656] hover:text-[#1c1b1b] font-bold'
          }`}
        >
          <div
            className={`w-10 h-7 flex items-center justify-center rounded-none transition-all ${
              isHome ? 'bg-[#dde1ff] border border-[#003ece]' : ''
            }`}
          >
            <span className="material-symbols-outlined text-2xl">home</span>
          </div>
          <span className="text-[11px] mt-0.5 leading-tight">หน้าแรก</span>
        </Link>

        {/* 2. แจ้งปัญหา (Highlighted Center-Left) */}
        <Link
          href="/report/new"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isReport
              ? 'text-[#003ece] font-black'
              : 'text-[#1c1b1b] font-black'
          }`}
        >
          <div
            className={`w-10 h-7 flex items-center justify-center border-2 border-[#1c1b1b] shadow-[2px_2px_0px_0px_#1c1b1b] ${
              isReport ? 'bg-[#fed74c]' : 'bg-[#003ece] text-white'
            }`}
          >
            <span className={`material-symbols-outlined text-xl ${isReport ? 'text-[#1c1b1b]' : 'text-white'}`}>
              add_alert
            </span>
          </div>
          <span className="text-[11px] mt-0.5 leading-tight font-black">แจ้งปัญหา</span>
        </Link>

        {/* 3. ติดตามผล */}
        <Link
          href="/track"
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isTrack
              ? 'text-[#003ece] font-black'
              : 'text-[#434656] hover:text-[#1c1b1b] font-bold'
          }`}
        >
          <div
            className={`w-10 h-7 flex items-center justify-center rounded-none transition-all ${
              isTrack ? 'bg-[#dde1ff] border border-[#003ece]' : ''
            }`}
          >
            <span className="material-symbols-outlined text-2xl">search_check</span>
          </div>
          <span className="text-[11px] mt-0.5 leading-tight">ติดตามผล</span>
        </Link>

        {/* 4. โหมดสูงวัย */}
        <button
          type="button"
          onClick={toggleSeniorMode}
          className={`flex flex-col items-center justify-center py-1 transition-all ${
            isSenior
              ? 'text-[#93000a] font-black'
              : 'text-[#434656] hover:text-[#1c1b1b] font-bold'
          }`}
          title="สลับโหมดตัวหนังสือโตสำหรับผู้สูงอายุ"
        >
          <div
            className={`w-10 h-7 flex items-center justify-center transition-all ${
              isSenior ? 'bg-[#ffdad6] border border-[#ba1a1a]' : ''
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {isSenior ? 'accessibility_new' : 'elderly'}
            </span>
          </div>
          <span className="text-[11px] mt-0.5 leading-tight">
            {isSenior ? 'โหมดโต (เปิด)' : 'โหมดสูงวัย'}
          </span>
        </button>
      </div>
    </nav>
  );
}
