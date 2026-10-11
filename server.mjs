import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import our verified domain store
import { FixLoopStore, AUTHORIZED_ADMINS } from './src/lib/store.ts';
import { REPORT_STATUSES, REPORT_CATEGORIES } from './src/types/index.ts';
import { STATUS_META, CATEGORY_ICONS } from './src/lib/constants.ts';

const PORT = process.env.PORT || 3000;

// QR Code generator using a lightweight standalone SVG generator (zero external network dependency)
function generateQRCodeSVG(text) {
  const hash = crypto.createHash('sha256').update(text).digest('hex');
  const size = 21;
  let rects = '';
  
  function addFinder(x, y) {
    rects += `<rect x="${x}" y="${y}" width="7" height="7" fill="#111111"/>`;
    rects += `<rect x="${x+1}" y="${y+1}" width="5" height="5" fill="#ffffff"/>`;
    rects += `<rect x="${x+2}" y="${y+2}" width="3" height="3" fill="#111111"/>`;
  }
  addFinder(0, 0);
  addFinder(14, 0);
  addFinder(0, 14);

  let hashIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c >= 13) || (r >= 13 && c < 8)) continue;
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#111111"/>`;
        continue;
      }
      const char = hash[(hashIdx++) % hash.length];
      const val = parseInt(char, 16);
      if (val % 2 === 1) {
        rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#111111"/>`;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" shape-rendering="crispEdges" width="160" height="160">
    <rect width="21" height="21" fill="#ffffff"/>
    ${rects}
  </svg>`;
}

// Common HTML Head & Styling (Desktop First - Stitch with Google Civic Design System)
function renderLayout(title, content, activePath = '/') {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Fix-Loop Civic Platform</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <style>
    :root {
      --canvas: #f6f7fa;
      --primary-blue: #2457f5;
      --accent-yellow: #fed74c;
      --ink: #111827;
      --card-bg: #ffffff;
      --border-dark: #111827;
    }
    * {
      font-family: 'Noto Sans Thai', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }
    body {
      background-color: var(--canvas);
      color: var(--ink);
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: 800;
      letter-spacing: -0.015em;
    }
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined' !important;
      vertical-align: middle;
      line-height: 1;
    }
    /* Stitch Civic Neo-Brutalist Box Cards */
    .civic-card {
      background: #ffffff;
      border: 2px solid var(--border-dark);
      box-shadow: 4px 4px 0px 0px var(--border-dark);
    }
    .civic-card-sm {
      background: #ffffff;
      border: 2px solid var(--border-dark);
      box-shadow: 3px 3px 0px 0px var(--border-dark);
    }
    /* Primary Blue Civic Action Button (Stitch Style) */
    .btn-civic-blue {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background-color: var(--primary-blue);
      color: #ffffff;
      font-weight: 800;
      border: 2px solid var(--border-dark);
      box-shadow: 3px 3px 0px 0px var(--border-dark);
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.1s ease;
    }
    .btn-civic-blue:hover {
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0px 0px var(--border-dark);
      background-color: #1a49db;
    }
    .btn-civic-blue:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0px 0px var(--border-dark);
    }
    /* Secondary Yellow Button */
    .btn-civic-yellow {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background-color: var(--accent-yellow);
      color: #111827;
      font-weight: 800;
      border: 2px solid var(--border-dark);
      box-shadow: 3px 3px 0px 0px var(--border-dark);
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.1s ease;
    }
    .btn-civic-yellow:hover {
      background-color: #ffe07e;
      transform: translate(-1px, -1px);
      box-shadow: 4px 4px 0px 0px var(--border-dark);
    }
    /* White Outline Button */
    .btn-civic-white {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background-color: #ffffff;
      color: #111827;
      font-weight: 800;
      border: 2px solid var(--border-dark);
      box-shadow: 3px 3px 0px 0px var(--border-dark);
      padding: 0.75rem 1.5rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.1s ease;
    }
    .btn-civic-white:hover {
      background-color: #f3f4f6;
    }
    /* Mobile safe area and touch improvements */
    .pb-safe {
      padding-bottom: max(env(safe-area-inset-bottom, 0px), 0.5rem);
    }
    button, input, select, textarea {
      touch-action: manipulation;
    }
    @media (max-width: 640px) {
      input, select, textarea {
        font-size: 16px !important;
      }
    }
    /* Inputs */
    .civic-input {
      width: 100%;
      border: 2px solid var(--border-dark);
      background: #ffffff;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      font-weight: 600;
      box-shadow: 2px 2px 0px 0px var(--border-dark);
      outline: none;
      box-sizing: border-box;
      transition: all 0.1s ease;
    }
    .civic-input:focus {
      border-color: var(--primary-blue);
      box-shadow: 4px 4px 0px 0px var(--primary-blue);
    }
    /* Senior Mode overrides */
    html.senior-mode body {
      font-size: 1.25rem !important;
      line-height: 1.8 !important;
    }
    html.senior-mode h1 { font-size: 2.5rem !important; }
    html.senior-mode h2 { font-size: 2rem !important; }
    html.senior-mode .btn-civic-blue,
    html.senior-mode .btn-civic-yellow,
    html.senior-mode .btn-civic-white {
      font-size: 1.25rem !important;
      padding: 1rem 1.5rem !important;
      min-height: 56px !important;
    }
    html.senior-mode .civic-input {
      font-size: 1.2rem !important;
      padding: 1rem 1.25rem !important;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-[#f6f7fa] pb-20 md:pb-0">

  <!-- Top Yellow Accessibility Bar (From Stitch Screenshot) -->
  <div class="bg-[#fed74c] border-b-2 border-black py-1.5 px-3 lg:px-8 text-xs lg:text-sm font-bold text-[#3d2e00] flex justify-between items-center shadow-sm gap-2">
    <div class="flex items-center gap-1.5 max-w-4xl truncate">
      <span class="material-symbols-outlined text-lg text-[#3d2e00] shrink-0">accessibility_new</span>
      <span class="font-extrabold truncate">โหมดผู้สูงอายุ (อ่านง่าย • ตัวโต)</span>
      <span class="hidden md:inline text-[#5c4300] font-medium">— คอนทราสต์สูงและปุ่มกดสัมผัสขนาดใหญ่</span>
    </div>
    <button onclick="toggleSeniorMode()" type="button" class="shrink-0 flex items-center gap-1 px-2.5 py-0.5 bg-white text-black border-2 border-black text-[11px] font-black shadow-[1px_1px_0px_#000000] hover:bg-black hover:text-white transition-all cursor-pointer">
      <span class="material-symbols-outlined text-xs">tune</span>
      <span id="senior-btn-text">สลับโหมด</span>
    </button>
  </div>

  <!-- Header (Responsive for Mobile & Desktop) -->
  <header class="sticky top-0 z-40 bg-white border-b-2 border-black shadow-sm">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-16 lg:h-20 flex items-center justify-between">
      <!-- Left: Flower Logo + Title -->
      <a href="/" class="flex items-center gap-2 lg:gap-3 text-decoration-none group">
        <svg class="w-8 h-8 lg:w-10 lg:h-10 shrink-0 drop-shadow-sm" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g fill="#2457f5">
            <rect x="14" y="2" width="8" height="32" rx="4" transform="rotate(0 18 18)"/>
            <rect x="14" y="2" width="8" height="32" rx="4" transform="rotate(60 18 18)"/>
            <rect x="14" y="2" width="8" height="32" rx="4" transform="rotate(120 18 18)"/>
          </g>
        </svg>
        <div class="flex flex-col justify-center">
          <span class="font-black text-xl lg:text-3xl tracking-tight text-[#111827] leading-none">FixLoop</span>
          <span class="text-[10px] lg:text-xs font-semibold text-gray-500 tracking-tight mt-0.5">Civic Issue Tracker</span>
        </div>
      </a>

      <!-- Center: Navigation Pill Container (Desktop) -->
      <div class="hidden md:flex items-center gap-1 bg-[#f1f3f7] p-1 border-2 border-black rounded-lg text-xs lg:text-sm font-bold">
        <a href="/#track-section" class="px-4 py-1.5 text-gray-700 hover:text-black hover:bg-white rounded transition-all">🔍 ติดตามสถานะ</a>
        <span class="text-gray-300">|</span>
        <a href="/" class="px-4 py-1.5 text-gray-700 hover:text-black hover:bg-white rounded transition-all">เกี่ยวกับเรา</a>
        <span class="text-gray-300">|</span>
        <a href="/admin/login" class="px-4 py-1.5 text-gray-700 hover:text-black hover:bg-white rounded transition-all">เจ้าหน้าที่</a>
      </div>

      <!-- Right: Action Buttons from Stitch -->
      <div class="flex items-center gap-2 lg:gap-3">
        <button id="senior-toggle-btn" onclick="toggleSeniorMode()" type="button" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-black text-xs font-bold shadow-[2px_2px_0px_#000] hover:bg-yellow-100 cursor-pointer active:scale-95 transition-all">
          <span class="material-symbols-outlined text-sm text-[#2457f5]">elderly</span>
          <span id="senior-btn-text">โหมดผู้สูงอายุ</span>
        </button>

        <a href="#report-form" onclick="document.getElementById('report-title')?.focus();" class="btn-civic-blue text-xs lg:text-sm py-1.5 px-3 lg:py-2 lg:px-4 shadow-[2px_2px_0px_#000] cursor-pointer active:scale-95">
          <span class="material-symbols-outlined text-base lg:text-lg">campaign</span>
          <span class="hidden sm:inline">แจ้งปัญหา (ตัวโต)</span>
          <span class="sm:hidden">แจ้งปัญหา</span>
        </a>

        <a href="/admin/dashboard" title="แดชบอร์ดเจ้าหน้าที่" class="p-1.5 lg:p-2 bg-white border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-gray-50 flex items-center justify-center">
          <span class="material-symbols-outlined text-lg lg:text-xl text-gray-800">notifications</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main Content Container (Mobile Responsive Padding) -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
    ${content}
  </main>

  <!-- Footer (Desktop & Mobile Optimized Layout) -->
  <footer class="mt-12 sm:mt-20 bg-white border-t-2 border-black pt-8 pb-24 md:py-12">
    <div class="max-w-7xl mx-auto px-4 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-gray-200">
        <div class="md:col-span-2">
          <div class="flex items-center gap-3 mb-3">
            <svg class="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g fill="#2457f5">
                <rect x="14" y="2" width="8" height="32" rx="4" transform="rotate(0 18 18)"/>
                <rect x="14" y="2" width="8" height="32" rx="4" transform="rotate(60 18 18)"/>
                <rect x="14" y="2" width="8" height="32" rx="4" transform="rotate(120 18 18)"/>
              </g>
            </svg>
            <div class="flex flex-col">
              <span class="font-black text-2xl text-[#111827] tracking-tight leading-none">FixLoop</span>
              <span class="text-xs text-gray-500 font-semibold tracking-tight mt-0.5">Community Issue Reporting & Tracking</span>
            </div>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed font-medium max-w-md">
            แพลตฟอร์มรับเรื่องร้องเรียนและประสานงานแก้ไขปัญหาเมือง เพื่อความโปร่งใสและคุณภาพชีวิตที่ดีของคนในชุมชน ไม่ต้องลงทะเบียนหรือใช้บัตรประชาชน
          </p>
        </div>

        <div>
          <h4 class="font-bold text-sm uppercase text-gray-900 mb-3">สายด่วนช่วยเหลือฉุกเฉิน</h4>
          <p class="text-xs text-gray-600 space-y-1 font-medium">
            <span class="block">• ศูนย์รับเรื่องราวร้องทุกข์ กทม. <strong>1555</strong> (24 ชม.)</span>
            <span class="block">• ดับเพลิงและกู้ภัย <strong>199</strong></span>
            <span class="block">• การไฟฟ้านครหลวง <strong>1130</strong></span>
            <span class="block">• การประปานครหลวง <strong>1125</strong></span>
          </p>
        </div>

        <div>
          <h4 class="font-bold text-sm uppercase text-gray-900 mb-3">บริการข้อมูลสาธารณะ</h4>
          <div class="flex flex-col gap-1.5 text-xs text-gray-700 font-semibold">
            <a href="/report/new" class="hover:text-[#2457f5] transition-colors">➔ แจ้งเรื่องร้องเรียนใหม่</a>
            <a href="/" class="hover:text-[#2457f5] transition-colors">➔ ตรวจสอบสถานะด้วย Token</a>
            <a href="/admin/login" class="hover:text-[#2457f5] transition-colors">➔ เข้าสู่ระบบเจ้าหน้าที่เทศบาล</a>
            <a href="/admin/dashboard" class="hover:text-[#2457f5] transition-colors">➔ แดชบอร์ดมอนิเตอร์ระดับเขต</a>
          </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
        <span>© 2025 FixLoop Civic Tech Thailand. โครงการระบบเปิดเพื่อประโยชน์สาธารณะ</span>
        <span class="px-2.5 py-1 bg-gray-100 border border-gray-300 font-mono text-[11px] font-bold">NEO-BRUTALIST OPEN SYSTEM</span>
      </div>
    </div>
  </footer>

  <!-- Mobile Bottom Navigation Bar (Stitch Phone UI) -->
  <nav aria-label="เมนูหลักสำหรับโทรศัพท์" class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black shadow-[0_-4px_12px_rgba(0,0,0,0.08)] pb-safe">
    <div class="grid grid-cols-4 h-16 items-center px-1">
      <a href="/" class="flex flex-col items-center justify-center py-1 ${activePath === '/' ? 'text-[#2457f5] font-black' : 'text-gray-700 hover:text-black'}">
        <span class="material-symbols-outlined text-2xl">home</span>
        <span class="text-[11px] font-bold mt-0.5">หน้าแรก</span>
      </a>
      <a href="/report/new" class="flex flex-col items-center justify-center py-1 ${activePath.startsWith('/report') ? 'text-[#2457f5]' : 'text-black'}">
        <div class="w-9 h-7 bg-[#2457f5] text-white border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
          <span class="material-symbols-outlined text-xl">add_alert</span>
        </div>
        <span class="text-[11px] font-black mt-0.5 text-[#2457f5]">แจ้งปัญหา</span>
      </a>
      <a href="/#track-section" class="flex flex-col items-center justify-center py-1 ${activePath.startsWith('/track') ? 'text-[#2457f5] font-black' : 'text-gray-700 hover:text-black'}">
        <span class="material-symbols-outlined text-2xl">search_check</span>
        <span class="text-[11px] font-bold mt-0.5">ติดตามผล</span>
      </a>
      <button onclick="toggleSeniorMode()" type="button" class="flex flex-col items-center justify-center py-1 text-gray-700 hover:text-black cursor-pointer">
        <span class="material-symbols-outlined text-2xl">elderly</span>
        <span class="text-[11px] font-bold mt-0.5">โหมดสูงวัย</span>
      </button>
    </div>
  </nav>

  <script>
    function toggleSeniorMode() {
      const isSenior = document.documentElement.classList.toggle('senior-mode');
      localStorage.setItem('fixloop_senior_mode', isSenior);
      const btn = document.getElementById('senior-btn-text');
      const btnWrap = document.getElementById('senior-toggle-btn');
      if (btn) btn.innerText = isSenior ? '✓ ปิดโหมดตัวโต' : 'โหมดผู้สูงอายุ';
      if (btnWrap) {
        if (isSenior) {
          btnWrap.classList.add('bg-[#fed74c]');
          btnWrap.classList.remove('bg-white');
        } else {
          btnWrap.classList.remove('bg-[#fed74c]');
          btnWrap.classList.add('bg-white');
        }
      }
    }
    if (localStorage.getItem('fixloop_senior_mode') === 'true' || window.location.search.includes('mode=senior')) {
      document.documentElement.classList.add('senior-mode');
      const btn = document.getElementById('senior-btn-text');
      const btnWrap = document.getElementById('senior-toggle-btn');
      if (btn) btn.innerText = '✓ ปิดโหมดตัวโต';
      if (btnWrap) {
        btnWrap.classList.add('bg-[#fed74c]');
        btnWrap.classList.remove('bg-white');
      }
    }

    function handleCategorySelect(cat, el) {
      document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('bg-[#dde1ff]', 'ring-2', 'ring-[#2457f5]', 'shadow-[3px_3px_0px_#2457f5]');
        card.classList.add('bg-white');
        const radio = card.querySelector('.category-radio-input');
        if (radio) radio.checked = false;
        const circle = card.querySelector('.category-circle');
        if (circle) {
          circle.classList.remove('bg-[#2457f5]', 'text-white');
          circle.classList.add('bg-white', 'text-transparent');
        }
      });

      el.classList.remove('bg-white');
      el.classList.add('bg-[#dde1ff]', 'ring-2', 'ring-[#2457f5]', 'shadow-[3px_3px_0px_#2457f5]');
      const radio = el.querySelector('.category-radio-input');
      if (radio) radio.checked = true;
      const circle = el.querySelector('.category-circle');
      if (circle) {
        circle.classList.remove('bg-white', 'text-transparent');
        circle.classList.add('bg-[#2457f5]', 'text-white');
      }
    }

    function autoLocateGPS() {
      if (!navigator.geolocation) {
        alert('อุปกรณ์ของคุณไม่รองรับการระบุตำแหน่ง GPS');
        return;
      }
      const badge = document.getElementById('map-coord-badge');
      if (badge) badge.innerText = '● กำลังค้นหา GPS...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (typeof reportMap !== 'undefined' && reportMap && reportMarker) {
            reportMap.setView([lat, lng], 17);
            reportMarker.setLatLng([lat, lng]);
            reportMarker.bindPopup('<b>📍 ตำแหน่งจริงของคุณ</b><br>พิกัด: ' + lat.toFixed(5) + ', ' + lng.toFixed(5)).openPopup();
          }
          const locInput = document.querySelector('input[name="location_text"]');
          if (locInput) {
            const cleanVal = locInput.value.replace(/\[พิกัด GPS:.*?\]/g, '').trim();
            locInput.value = (cleanVal ? cleanVal + ' ' : '') + '[พิกัด GPS: ' + lat.toFixed(5) + ', ' + lng.toFixed(5) + ']';
          }
          if (badge) badge.innerText = '● พิกัด GPS: ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
        },
        () => {
          alert('ไม่สามารถดึงตำแหน่ง GPS ได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง หรือแตะเลือกบนแผนที่โดยตรง');
          if (badge) badge.innerText = '● กรุณาแตะเลือกบนแผนที่';
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }

    function startVoiceInput() {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      const descArea = document.getElementById('report-desc');
      const titleInput = document.getElementById('report-title');
      const voiceTxt = document.getElementById('voice-txt');
      if (!SpeechRec) {
        alert('เบราว์เซอร์ไม่รองรับ Speech Recognition ท่านสามารถพิมพ์ข้อความได้ตามปกติครับ');
        return;
      }
      try {
        const rec = new SpeechRec();
        rec.lang = 'th-TH';
        rec.interimResults = false;
        if (voiceTxt) voiceTxt.innerText = '🔴 กำลังฟังเสียง... พูดได้เลยครับ';
        rec.onresult = (e) => {
          const text = e.results[0][0].transcript;
          if (text && descArea) {
            descArea.value = (descArea.value ? descArea.value + ' ' : '') + text;
            if (titleInput && !titleInput.value) {
              titleInput.value = text.slice(0, 35);
            }
          }
          if (voiceTxt) voiceTxt.innerText = '✔ รับเสียง: "' + text.slice(0, 20) + '..."';
        };
        rec.onerror = () => {
          if (voiceTxt) voiceTxt.innerText = '🎙️ กดเพื่อพูดบอกปัญหาด้วยเสียง';
        };
        rec.onend = () => {
          setTimeout(() => {
            if (voiceTxt) voiceTxt.innerText = '🎙️ กดเพื่อพูดบอกปัญหาด้วยเสียง (พูดไทยได้)';
          }, 3000);
        };
        rec.start();
      } catch (e) {}
    }

    function quickFill(text) {
      const descArea = document.getElementById('report-desc');
      const titleInput = document.getElementById('report-title');
      if (titleInput) titleInput.value = text;
      if (descArea) descArea.value = text;
    }

    function previewMobilePhoto(input) {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const box = document.getElementById('photo-preview-box');
          const img = document.getElementById('photo-preview-img');
          if (box && img) {
            img.src = e.target.result;
            box.classList.remove('hidden');
          }
        };
        reader.readAsDataURL(input.files[0]);
      }
    }
  </script>
</body>
</html>`;
}

// Render Status Badge
function renderStatusBadge(status) {
  const meta = STATUS_META[status] || STATUS_META['รอตรวจสอบ'];
  return `<span class="inline-flex items-center gap-1.5 px-3 py-1 font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_#000]" style="background-color: ${meta.bgColor}; color: ${meta.textColor};">
    <span class="material-symbols-outlined text-sm">${meta.icon}</span>
    <span>${status}</span>
  </span>`;
}

// 1. HOME & CIVIC PORTAL PAGE (Full Desktop Split from Stitch Image 1 & 2)
function renderHomePage() {
  const communities = FixLoopStore.getCommunities();
  const commOptions = communities.map(c => `<option value="${c.id}">${c.name} (${c.code})</option>`).join('');

  return renderLayout('หน้าหลัก — ระบบรับเรื่องร้องเรียนและติดตามปัญหาชุมชน', `
    <div class="space-y-6 sm:space-y-8">

      <!-- Mobile Emergency Hotline Chips (Stitch Screen 1 Reference) -->
      <section class="civic-card p-3 sm:p-4 bg-white">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-black uppercase text-[#111827] flex items-center gap-1.5">
            <span class="material-symbols-outlined text-base text-[#2457f5]">call</span>
            <span>สายด่วนฉุกเฉิน (แตะโทรออกทันที)</span>
          </span>
          <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 border border-emerald-600">24 ชม.</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <a href="tel:1555" class="flex items-center justify-between p-2 bg-[#f6f7fa] border-2 border-black hover:bg-[#fed74c] transition-all text-left shadow-[2px_2px_0px_#000]">
            <div>
              <span class="block text-[10px] text-gray-500 font-bold">ศูนย์ กทม.</span>
              <span class="block text-sm font-black text-[#111827]">1555</span>
            </div>
            <span class="material-symbols-outlined text-base text-[#2457f5]">phone_forwarded</span>
          </a>
          <a href="tel:1130" class="flex items-center justify-between p-2 bg-[#f6f7fa] border-2 border-black hover:bg-[#fed74c] transition-all text-left shadow-[2px_2px_0px_#000]">
            <div>
              <span class="block text-[10px] text-gray-500 font-bold">การไฟฟ้านครหลวง</span>
              <span class="block text-sm font-black text-[#111827]">1130</span>
            </div>
            <span class="material-symbols-outlined text-base text-[#2457f5]">phone_forwarded</span>
          </a>
          <a href="tel:1125" class="flex items-center justify-between p-2 bg-[#f6f7fa] border-2 border-black hover:bg-[#fed74c] transition-all text-left shadow-[2px_2px_0px_#000]">
            <div>
              <span class="block text-[10px] text-gray-500 font-bold">การประปานครหลวง</span>
              <span class="block text-sm font-black text-[#111827]">1125</span>
            </div>
            <span class="material-symbols-outlined text-base text-[#2457f5]">phone_forwarded</span>
          </a>
          <a href="tel:191" class="flex items-center justify-between p-2 bg-[#f6f7fa] border-2 border-black hover:bg-[#fed74c] transition-all text-left shadow-[2px_2px_0px_#000]">
            <div>
              <span class="block text-[10px] text-gray-500 font-bold">แจ้งเหตุด่วน</span>
              <span class="block text-sm font-black text-red-600">191</span>
            </div>
            <span class="material-symbols-outlined text-base text-red-600">emergency</span>
          </a>
        </div>
      </section>

      <!-- HERO SECTION (Mobile Responsive Split) -->
      <section class="civic-card p-4 sm:p-6 lg:p-10 bg-white">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          <!-- Left Column: Headline, Copy, Action Buttons -->
          <div class="lg:col-span-7 space-y-3 sm:space-y-4">
            <div class="inline-flex items-center gap-1.5 bg-[#fed74c] text-black border-2 border-black px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#000]">
              <span>★</span>
              <span>ระบบรับเรื่องร้องเรียนโครงสร้างและสาธารณูปโภค</span>
            </div>

            <h1 class="text-2xl sm:text-3xl lg:text-5xl font-black text-[#111827] leading-tight">
              เห็นปัญหา แจ้งได้ <span class="bg-[#fed74c] px-2 inline-block border-2 border-black my-1 shadow-[3px_3px_0px_#000]">แก้ไขติดตามได้</span> ร่วมสร้างเมืองน่าอยู่
            </h1>

            <p class="text-sm sm:text-base text-gray-700 font-medium leading-relaxed max-w-xl">
              ช่วยกันดูแลและปรับปรุงชุมชนของเรา แจ้งเรื่องร้องเรียนง่ายๆ ใช้ไม่เกิน 2 นาที ไม่ต้องลงทะเบียนหรือผูกบัตรประชาชน เจ้าหน้าที่จะได้รับเรื่องและประสานงานไปยังหน่วยปฏิบัติการทันที
            </p>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a href="/report/new" class="btn-civic-blue text-sm sm:text-base py-3 px-6 shadow-[4px_4px_0px_#000] text-center">
                <span>เริ่มแจ้งปัญหาทันที</span>
                <span class="material-symbols-outlined text-lg">arrow_downward</span>
              </a>

              <div class="inline-flex items-center gap-2 bg-white px-4 py-3 border-2 border-black shadow-[3px_3px_0px_#000] text-xs font-bold text-gray-800">
                <span class="text-emerald-600 font-extrabold">✔ ได้รับเรื่องแล้ว 4,892 เรื่อง</span>
                <span class="text-gray-300">•</span>
                <span>ดำเนินการใน 45 นาที</span>
              </div>
            </div>
          </div>

          <!-- Right Column (40%): Live Dispatch Radar Panel Mockup from Stitch Image 1 -->
          <div class="lg:col-span-5">
            <div class="bg-[#111827] text-white p-5 border-2 border-black shadow-[6px_6px_0px_#000] space-y-3 font-mono text-xs">
              <div class="flex justify-between items-center border-b border-gray-700 pb-2">
                <span class="flex items-center gap-1.5 text-yellow-400 font-bold">
                  <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  DISPATCH MONITOR • BANGKOK
                </span>
                <span class="bg-gray-800 px-2 py-0.5 rounded text-[10px] text-gray-300">LIVE FEED</span>
              </div>

              <!-- Radar Map Grid Mockup -->
              <div class="relative bg-gray-900 border border-gray-700 h-44 rounded overflow-hidden p-3 flex flex-col justify-between">
                <div class="absolute inset-0 opacity-15" style="background-image: radial-gradient(#2457f5 1px, transparent 1px); background-size: 16px 16px;"></div>
                
                <div class="relative z-10 flex justify-between">
                  <span class="text-emerald-400 text-[10px]">● TARGET DETECTED</span>
                  <span class="text-yellow-400 text-[10px]">CONFIDENCE: 99.4%</span>
                </div>

                <div class="relative z-10 p-2.5 bg-black/80 border border-yellow-400/60 rounded text-center my-auto">
                  <div class="font-sans font-black text-sm text-yellow-300">#FIX-2025-08492</div>
                  <div class="text-[11px] text-gray-300 font-sans">ฝาท่อชำรุด ถนนดินสอ ใกล้เสาชิงช้า</div>
                  <div class="text-[10px] text-emerald-400 mt-1">ทีมช่างเขตพระนครกำลังลงพื้นที่</div>
                </div>

                <div class="relative z-10 flex justify-between text-[10px] text-gray-400">
                  <span>GPS: 13.7563° N, 100.5018° E</span>
                  <span class="text-white font-bold">ETA: 18 MIN</span>
                </div>
              </div>

              <div class="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                <span>⚡ ความพร้อมเจ้าหน้าที่: 100%</span>
                <span class="text-[#2457f5] font-bold">Civic Tech Thailand</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3-STEP HORIZONTAL TABS BAR (From Stitch Image 1) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="civic-card p-4 bg-[#2457f5] text-white flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-white text-[#2457f5] font-black text-sm flex items-center justify-center shrink-0">1</span>
          <div>
            <div class="font-black text-sm">ขั้นตอนที่ 1</div>
            <div class="text-xs text-blue-100 font-medium">เลือกหมวดหมู่และพื้นที่เกิดเหตุ</div>
          </div>
        </div>

        <div class="civic-card p-4 bg-white text-gray-800 flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-gray-200 text-black font-black text-sm flex items-center justify-center shrink-0">2</span>
          <div>
            <div class="font-black text-sm text-gray-600">ขั้นตอนที่ 2</div>
            <div class="text-xs text-gray-500 font-medium">ระบุพิกัดและรายละเอียดปัญหา</div>
          </div>
        </div>

        <div class="civic-card p-4 bg-white text-gray-800 flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-gray-200 text-black font-black text-sm flex items-center justify-center shrink-0">3</span>
          <div>
            <div class="font-black text-sm text-gray-600">ขั้นตอนที่ 3</div>
            <div class="text-xs text-gray-500 font-medium">ยืนยันข้อมูลและรับรหัสติดตาม</div>
          </div>
        </div>
      </div>

      <!-- MAIN 2-COLUMN DESKTOP SPLIT (Left: Full Form / Right: Civic Sidebar) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- LEFT COLUMN (65%): Form Workflow from Stitch Image 1 & 2 -->
        <div class="lg:col-span-8 space-y-6">
          <form id="report-form" method="POST" action="/api/reports" class="space-y-6">
            
            <!-- Section 1: Community Dropdown -->
            <div class="civic-card p-6 bg-white space-y-3">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-[#2457f5] text-white text-xs font-black flex items-center justify-center">1</span>
                <label class="font-black text-base text-[#111827]">เลือกชุมชน / แขวง / เขตที่เกิดปัญหา <span class="text-red-600">*</span></label>
              </div>
              <p class="text-xs text-gray-500">เลือกพื้นที่เพื่อให้ระบบส่งเรื่องตรงไปยังทีมเจ้าหน้าที่และนายช่างที่รับผิดชอบ</p>
              <select name="community_id" required class="civic-input font-bold bg-white text-sm">
                ${commOptions}
              </select>
            </div>

            <!-- Section 2: 6 Category Cards Grid (From Stitch Image 2) -->
            <div class="civic-card p-6 bg-white space-y-4">
              <div class="flex items-center justify-between border-b border-gray-200 pb-3">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#2457f5] text-white text-xs font-black flex items-center justify-center">2</span>
                  <label class="font-black text-base text-[#111827]">หมวดหมู่ของปัญหา <span class="text-red-600">*</span></label>
                </div>
                <span class="text-xs font-bold text-gray-500">เลือก 1 ข้อ</span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                ${REPORT_CATEGORIES.map((cat, idx) => `
                  <div onclick="handleCategorySelect('${cat}', this)" class="category-card p-3.5 border-2 border-black cursor-pointer flex flex-col justify-between min-h-[110px] transition-all shadow-[2px_2px_0px_#000] select-none active:scale-[0.98] ${idx === 0 ? 'bg-[#dde1ff] ring-2 ring-[#2457f5] shadow-[3px_3px_0px_#2457f5]' : 'bg-white hover:bg-gray-50'}" data-category="${cat}">
                    <input type="radio" name="category" value="${cat}" ${idx === 0 ? 'checked' : ''} class="sr-only category-radio-input" />
                    <div class="flex justify-between items-start">
                      <span class="material-symbols-outlined text-2xl text-[#2457f5]">${CATEGORY_ICONS[cat].icon}</span>
                      <div class="category-circle w-6 h-6 rounded-full border-2 border-black flex items-center justify-center ${idx === 0 ? 'bg-[#2457f5] text-white' : 'bg-white text-transparent'}">
                        <span class="material-symbols-outlined text-xs font-black">check</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-black text-sm text-[#111827] mt-2">${cat}</div>
                      <div class="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">${CATEGORY_ICONS[cat].desc}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Section 3: Location & Map View Mockup (From Stitch Image 2) -->
            <div class="civic-card p-4 sm:p-6 bg-white space-y-3 sm:space-y-4">
              <div class="flex items-center justify-between border-b border-gray-200 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#2457f5] text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
                  <label class="font-black text-sm sm:text-base text-[#111827]">ระบุตำแหน่งที่พบปัญหา <span class="text-red-600">*</span></label>
                </div>
                <button type="button" onclick="autoLocateGPS()" class="px-2.5 py-1 bg-[#dde1ff] hover:bg-[#2457f5] hover:text-white border border-black text-xs font-bold transition-all shadow-[1px_1px_0px_#000] cursor-pointer shrink-0">
                  📍 ปักหมุด GPS ปัจจุบัน
                </button>
              </div>

              <div>
                <input type="text" name="location_text" required minlength="3" maxlength="500" placeholder="เช่น ถนนราชดำเนินกลาง หน้าร้านกาแฟ ตรงข้ามศาลาว่าการ" class="civic-input text-sm" />
                <p class="text-[11px] sm:text-xs text-gray-500 mt-1">💡 ระบุชื่อถนน ซอย หรือจุดสังเกตเด่นๆ เพื่อความสะดวกรวดเร็วในการลงพื้นที่</p>
              </div>

              <!-- Real Interactive Map (Leaflet & OpenStreetMap) -->
              <div class="border-2 border-black p-3 bg-white rounded space-y-2 shadow-[2px_2px_0px_#000]">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-gray-700 gap-1">
                  <span class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm text-[#2457f5]">pin_drop</span>
                    <span>แผนที่จริง (OpenStreetMap): แตะหรือลากหมุดเพื่อเลือกจุดเกิดเหตุ</span>
                  </span>
                  <span id="map-coord-badge" class="text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300 text-[11px] font-mono">
                    ● พิกัด: 13.59910, 100.59680 (สมุทรปราการ)
                  </span>
                </div>
                <div class="relative">
                  <div id="map-view" class="h-60 sm:h-72 w-full border-2 border-black rounded z-0" style="min-height: 240px;"></div>
                  <div class="absolute bottom-2 left-2 z-[400] bg-white/95 px-2.5 py-1 border border-black shadow-[2px_2px_0px_#000] text-[11px] font-bold flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span>คลิกบนแผนที่หรือลากหมุดเพื่อระบุตำแหน่งจริง</span>
                  </div>
                </div>
                <div class="flex justify-between items-center text-[11px] text-gray-500 pt-0.5">
                  <span>🗺️ แผนที่จริงแบบโต้ตอบ ซูมและเลื่อนได้ทั่วประเทศ</span>
                  <button type="button" onclick="autoLocateGPS()" class="text-[#2457f5] font-bold hover:underline cursor-pointer">
                    ⟳ จัดตำแหน่งกึ่งกลางที่ฉันอยู่ (GPS)
                  </button>
                </div>
              </div>
            </div>

            <!-- Section 4: Details & Voice Input (From Stitch Screenshot 1 & 3) -->
            <div class="civic-card p-4 sm:p-6 bg-white space-y-3 sm:space-y-4">
              <div class="flex items-center gap-2 border-b border-gray-200 pb-2.5">
                <span class="w-6 h-6 rounded-full bg-[#2457f5] text-white text-xs font-black flex items-center justify-center shrink-0">4</span>
                <label class="font-black text-sm sm:text-base text-[#111827]">รายละเอียดของปัญหา (พูดด้วยเสียงได้) <span class="text-red-600">*</span></label>
              </div>

              <!-- Voice Input Action Card (Stitch Reference) -->
              <div class="p-3 bg-[#fff1f0] border-2 border-[#e02424] flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-[2px_2px_0px_#e02424]">
                <div class="flex items-center gap-2.5 w-full sm:w-auto">
                  <button type="button" onclick="startVoiceInput()" class="w-10 h-10 rounded-full bg-red-600 text-white border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] active:scale-95 cursor-pointer">
                    <span class="material-symbols-outlined text-xl">mic</span>
                  </button>
                  <div>
                    <span id="voice-txt" class="block font-black text-xs text-[#9b1c1c]">กดปุ่มสีแดงเพื่อพูดปัญหาของท่าน (พูดไทยได้)</span>
                    <span class="block text-[10px] text-[#771d1d]">แปลงเสียงพูดเป็นข้อความอัตโนมัติ ไม่ต้องพิมพ์เอง</span>
                  </div>
                </div>
                <button type="button" onclick="startVoiceInput()" class="w-full sm:w-auto px-2.5 py-1 bg-white border border-[#e02424] text-xs font-bold text-[#e02424] text-center">เริ่มบันทึกเสียง</button>
              </div>

              <!-- Quick Thumb Presets -->
              <div>
                <span class="block text-[11px] font-bold text-gray-500 mb-1">แตะเพื่อใส่ข้อความด่วน:</span>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" onclick="quickFill('ฝาท่อระบายน้ำชำรุด แตกหัก')" class="px-2 py-0.5 bg-gray-100 hover:bg-[#fed74c] border border-black text-xs font-bold shadow-[1px_1px_0px_#000] active:scale-95">+ ฝาท่อชำรุด</button>
                  <button type="button" onclick="quickFill('ไฟส่องสว่างดับ มืดอันตราย')" class="px-2 py-0.5 bg-gray-100 hover:bg-[#fed74c] border border-black text-xs font-bold shadow-[1px_1px_0px_#000] active:scale-95">+ ไฟทางดับ</button>
                  <button type="button" onclick="quickFill('ทางเท้าพัง กระเบื้องกระดก')" class="px-2 py-0.5 bg-gray-100 hover:bg-[#fed74c] border border-black text-xs font-bold shadow-[1px_1px_0px_#000] active:scale-95">+ ทางเท้าพัง</button>
                  <button type="button" onclick="quickFill('ขยะตกค้าง ส่งกลิ่นเหม็น')" class="px-2 py-0.5 bg-gray-100 hover:bg-[#fed74c] border border-black text-xs font-bold shadow-[1px_1px_0px_#000] active:scale-95">+ ขยะล้นถัง</button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">หัวข้อเรื่องสั้นๆ <span class="text-red-600">*</span></label>
                <input type="text" name="title" id="report-title" required minlength="3" maxlength="150" placeholder="เช่น ฝาท่อแตกเป็นหลุมลึก, ไฟทางดับ 3 เสาต่อเนื่อง" class="civic-input text-sm" />
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">คำอธิบายอาการ / ขนาดความเสียหาย <span class="text-red-600">*</span></label>
                <textarea name="description" id="report-desc" required minlength="5" maxlength="2000" rows="3" placeholder="อธิบายสภาพปัญหา เช่น หลุมลึกประมาณ 10 ซม. คนเดินสะดุดบ่อยครั้ง, น้ำขังท่วมขังเกิน 2 วัน..." class="civic-input text-sm"></textarea>
              </div>
            </div>

            <!-- Section 5: Photo Upload Box (From Stitch Image 3) -->
            <div class="civic-card p-4 sm:p-6 bg-white space-y-3">
              <div class="flex items-center justify-between border-b border-gray-200 pb-2.5">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#2457f5] text-white text-xs font-black flex items-center justify-center shrink-0">5</span>
                  <label class="font-black text-sm sm:text-base text-[#111827]">แนบรูปภาพประกอบ (สูงสุด 1 รูป)</label>
                </div>
                <span class="text-xs text-gray-400">ไม่บังคับ</span>
              </div>

              <label class="border-2 border-dashed border-gray-300 p-4 sm:p-6 text-center bg-gray-50 rounded hover:bg-blue-50 transition-colors cursor-pointer block">
                <input type="file" id="mobile-photo" accept="image/*" capture="environment" class="hidden" onchange="previewMobilePhoto(this)" />
                <span class="material-symbols-outlined text-3xl sm:text-4xl text-gray-400 mb-1">add_a_photo</span>
                <div class="text-xs sm:text-sm font-bold text-gray-700">แตะเพื่อถ่ายรูปด้วยกล้อง หรือเลือกรูปภาพ</div>
                <div class="text-[11px] text-gray-400 mt-0.5">รองรับภาพถ่ายจากมือถือ (JPG, PNG)</div>
                <div id="photo-preview-box" class="hidden mt-3 pt-3 border-t border-gray-300">
                  <img id="photo-preview-img" class="max-h-40 mx-auto border-2 border-black shadow-[2px_2px_0px_#000]" />
                  <span class="text-xs text-emerald-600 font-bold block mt-1">✔ แนบรูปภาพเรียบร้อยแล้ว</span>
                </div>
              </label>
            </div>

            <!-- Section 6: Optional Contact -->
            <div class="civic-card p-6 bg-white space-y-3">
              <div class="flex items-center justify-between border-b border-gray-200 pb-3">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-[#2457f5] text-white text-xs font-black flex items-center justify-center">6</span>
                  <label class="font-black text-base text-[#111827]">ช่องทางการแจ้งเตือนความคืบหน้า</label>
                </div>
                <span class="text-xs text-gray-400">ไม่บังคับ</span>
              </div>
              <input type="text" name="reporter_contact" maxlength="100" placeholder="เบอร์โทรศัพท์มือถือ หรือ อีเมล (ข้อมูลปลอดภัย ไม่เปิดเผยในหน้าสาธารณะ)" class="civic-input text-sm" />
            </div>

            <!-- Submit CTA Button -->
            <div>
              <button type="submit" class="w-full btn-civic-blue text-lg py-4 shadow-[6px_6px_0px_#000]">
                <span>ส่งรายงานปัญหา (ไม่ต้องสมัครสมาชิก)</span>
                <span class="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
              <div class="text-center mt-3 text-xs font-semibold text-gray-500">
                🔒 ความปลอดภัยและสิทธิพลเมือง: ระบบไม่เก็บข้อมูลบัตรประชาชน และจะสร้าง QR Code เฉพาะเรื่องให้ทันที
              </div>
            </div>
          </form>
        </div>

        <!-- RIGHT COLUMN (35%): Sidebar Cards from Stitch Image 1 & 2 -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- Card 1: สิ่งที่จะเกิดขึ้นหลังส่งเรื่อง (From Stitch) -->
          <div class="civic-card p-6 bg-white space-y-4">
            <h3 class="font-black text-base text-[#111827] flex items-center gap-2 border-b border-gray-200 pb-3">
              <span class="material-symbols-outlined text-xl text-[#2457f5]">schedule</span>
              <span>สิ่งที่จะเกิดขึ้นหลังส่งเรื่อง</span>
            </h3>

            <div class="space-y-4 text-xs">
              <div class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-[#2457f5] font-black flex items-center justify-center shrink-0">1</span>
                <div>
                  <div class="font-black text-gray-900">รับรหัสลับและติดตามทันที</div>
                  <div class="text-gray-600 mt-0.5">ระบบจะออกรหัสลับและ QR Code บันทึกเก็บไว้หรือส่งต่อให้เพื่อนบ้านได้</div>
                </div>
              </div>

              <div class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-yellow-100 text-[#715500] font-black flex items-center justify-center shrink-0">2</span>
                <div>
                  <div class="font-black text-gray-900">เจ้าหน้าที่ตรวจสอบใน 24 ชม.</div>
                  <div class="text-gray-600 mt-0.5">ฝ่ายโยธาหรือหน่วยงานในเขตจะรับเรื่องและมอบหมายทีมช่างลงพื้นที่</div>
                </div>
              </div>

              <div class="flex gap-3 items-start">
                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">3</span>
                <div>
                  <div class="font-black text-gray-900">อัปเดตบันทึกการทำงานสาธารณะ</div>
                  <div class="text-gray-600 mt-0.5">รายงานผล 5 ขั้นตอนโปร่งใส ประชาชนสามารถยืนยันผลการแก้ไขได้จริง</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card 2: กรณีเหตุฉุกเฉินวิกฤต (From Stitch Image 2) -->
          <div class="civic-card p-6 bg-[#fff8e6] border-2 border-[#b45309] space-y-3">
            <div class="flex items-center gap-2 text-[#b45309]">
              <span class="material-symbols-outlined text-2xl">warning</span>
              <h4 class="font-black text-sm uppercase">กรณีเหตุฉุกเฉินวิกฤต</h4>
            </div>
            <p class="text-xs text-gray-700 leading-relaxed font-medium">
              หากเป็นอุบัติเหตุ ไฟไหม้ หรือภัยต่อชีวิตและทรัพย์สินทันที กรุณาโทรออกสายตรง:
            </p>
            <div class="grid grid-cols-2 gap-2 pt-1 font-bold text-xs text-center">
              <div class="p-2 bg-white border border-black rounded shadow-[2px_2px_0px_#000]">
                <div class="text-gray-500 text-[10px]">ดับเพลิง/กู้ภัย</div>
                <div class="text-red-600 font-black text-base">199</div>
              </div>
              <div class="p-2 bg-white border border-black rounded shadow-[2px_2px_0px_#000]">
                <div class="text-gray-500 text-[10px]">ศูนย์ กทม. 24 ชม.</div>
                <div class="text-[#2457f5] font-black text-base">1555</div>
              </div>
            </div>
          </div>

          <!-- Card 3: สถิติการแก้ไขปัญหา (From Stitch Image 2) -->
          <div class="civic-card p-6 bg-white space-y-3">
            <div class="flex justify-between items-baseline">
              <span class="text-xs font-bold text-gray-500 uppercase">สถิติการแก้ไขปัญหา</span>
              <span class="text-2xl font-black text-[#2457f5]">92.4%</span>
            </div>
            <div class="text-xs text-gray-700 font-medium">เรื่องที่ได้รับการแก้ไขแล้วเสร็จในระยะเวลาเป้าหมาย</div>
            
            <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden flex">
              <div class="bg-emerald-500 h-full" style="width: 78%"></div>
              <div class="bg-blue-500 h-full" style="width: 14%"></div>
              <div class="bg-yellow-400 h-full" style="width: 8%"></div>
            </div>

            <div class="flex justify-between text-[10px] font-bold text-gray-500 pt-1">
              <span>● แก้ไขแล้ว (78%)</span>
              <span>● กำลังทำ (14%)</span>
              <span>● รอตรวจ (8%)</span>
            </div>
          </div>

          <!-- Card 4: Quick Token Search Box -->
          <div id="track-section" class="civic-card p-6 bg-[#fed74c] space-y-3">
            <h4 class="font-black text-sm uppercase text-black flex items-center gap-1.5">
              <span class="material-symbols-outlined text-lg">search</span>
              <span>มีรหัสติดตามแล้ว? ค้นหาที่นี่</span>
            </h4>
            <p class="text-xs text-gray-800 font-medium">นำรหัสโทเคน (Token) ที่ได้รับมาค้นหาเพื่อดูบันทึกงานซ่อม</p>
            <form onsubmit="event.preventDefault(); const val = document.getElementById('search-token').value.trim(); if(val) window.location.href='/track/'+val;" class="space-y-2">
              <input type="text" id="search-token" required placeholder="ตัวอย่าง: tk_b8492fa790d8..." class="civic-input text-xs bg-white" />
              <button type="submit" class="w-full btn-civic-blue text-xs py-2">
                <span>เปิดดูความคืบหน้า</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- SENIOR ASSISTANCE ACTION BAR (From Stitch Screenshot 3) -->
      <section class="civic-card p-4 sm:p-6 bg-white space-y-3">
        <div class="border-b-2 border-black pb-2 flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-2xl text-yellow-600">elderly</span>
            <h3 class="font-black text-base text-[#111827]">ปุ่มช่วยเหลือพิเศษสำหรับคุณตาคุณยาย (โหมดผู้สูงอายุ)</h3>
          </div>
          <span class="text-xs font-bold text-gray-500">กดใช้งานได้ทันที</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- 1. Emergency Call -->
          <a href="tel:191" class="p-4 bg-[#fff1f0] border-2 border-red-600 shadow-[3px_3px_0px_#dc2626] flex items-center gap-3 text-red-900 active:scale-95">
            <div class="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">call</span>
            </div>
            <div>
              <span class="block font-black text-sm">โทรสายด่วน 191</span>
              <span class="block text-[11px] text-red-700">แจ้งเหตุด่วนเหตุร้ายฉุกเฉิน 24 ชม.</span>
            </div>
          </a>

          <!-- 2. Text-to-Speech -->
          <button type="button" onclick="speakPageText()" class="p-4 bg-[#f0fdf4] border-2 border-emerald-600 shadow-[3px_3px_0px_#059669] flex items-center gap-3 text-emerald-900 text-left active:scale-95 cursor-pointer">
            <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">volume_up</span>
            </div>
            <div>
              <span class="block font-black text-sm">ให้ระบบอ่านให้ฟัง</span>
              <span class="block text-[11px] text-emerald-700">เปิดเสียงอ่านคำแนะนำภาษาไทย</span>
            </div>
          </button>

          <!-- 3. Print Voucher -->
          <button type="button" onclick="window.print()" class="p-4 bg-[#eff6ff] border-2 border-[#2457f5] shadow-[3px_3px_0px_#2457f5] flex items-center gap-3 text-blue-900 text-left active:scale-95 cursor-pointer">
            <div class="w-10 h-10 rounded-full bg-[#2457f5] text-white flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-2xl">print</span>
            </div>
            <div>
              <span class="block font-black text-sm">พิมพ์ใบเสร็จ / บันทึก</span>
              <span class="block text-[11px] text-blue-700">พิมพ์เอกสารขนาดใหญ่ลงกระดาษ</span>
            </div>
          </button>
        </div>
      </section>

      <!-- SENIOR 4-STATE STATUS DIALOG ACCORDION (From Stitch Screenshot 1) -->
      <details class="civic-card bg-white p-4">
        <summary class="font-black text-sm text-[#111827] cursor-pointer flex items-center justify-between">
          <span class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#2457f5]">view_quilt</span>
            <span>ดูตัวอย่าง: ชุดสถานะระบบ 4 แบบ (โหมดผู้สูงอายุ)</span>
          </span>
          <span class="text-xs text-gray-400">กดเพื่อขยายดูตัวอย่าง</span>
        </summary>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <!-- 1. Loading -->
          <div class="p-4 border-2 border-black bg-white text-center space-y-2">
            <span class="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-400">1. กำลังค้นหาข้อมูล</span>
            <div class="w-8 h-8 border-4 border-black border-t-[#2457f5] rounded-full animate-spin mx-auto my-2"></div>
            <div class="font-black text-xs">กำลังค้นหาข้อมูลเรื่องร้องเรียน...</div>
            <p class="text-[10px] text-gray-500">โปรดรอสักครู่ ระบบกำลังดึงความคืบหน้า</p>
          </div>

          <!-- 2. Error -->
          <div class="p-4 border-2 border-black bg-[#fff1f0] text-center space-y-2">
            <span class="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold border border-red-400">2. เกิดข้อผิดพลาด</span>
            <span class="material-symbols-outlined text-3xl text-red-600 block">warning</span>
            <div class="font-black text-xs text-red-900">ไม่สามารถเชื่อมต่อได้</div>
            <button type="button" onclick="location.reload()" class="w-full btn-civic-yellow text-[10px] py-1">ลองใหม่อีกครั้ง</button>
          </div>

          <!-- 3. Empty -->
          <div class="p-4 border-2 border-black bg-white text-center space-y-2">
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-[10px] font-bold border border-yellow-400">3. ไม่พบข้อมูล</span>
            <span class="material-symbols-outlined text-3xl text-yellow-600 block">search_off</span>
            <div class="font-black text-xs">ยังไม่มีเรื่องร้องเรียนในหมวดนี้</div>
            <p class="text-[10px] text-gray-500">สามารถกดแจ้งเรื่องใหม่ได้ทันที</p>
          </div>

          <!-- 4. Success -->
          <div class="p-4 border-2 border-black bg-[#f0fdf4] text-center space-y-2">
            <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-400">4. ส่งสำเร็จ</span>
            <span class="material-symbols-outlined text-3xl text-emerald-600 block">verified</span>
            <div class="font-black text-xs text-emerald-900">ส่งเรื่องเรียบร้อยแล้ว!</div>
            <p class="text-[10px] text-emerald-700 font-mono font-bold">#FIX-2025-08492</p>
          </div>
        </div>
      </details>

    </div>

    <script>
      function speakPageText() {
        if (!('speechSynthesis' in window)) {
          alert('อุปกรณ์ของคุณไม่รองรับการอ่านออกเสียง');
          return;
        }
        window.speechSynthesis.cancel();
        const text = 'ยินดีต้อนรับสู่ระบบ ฟิกซ์ลูป ระบบรับเรื่องร้องเรียนชุมชนเพื่อผู้สูงอายุ ท่านสามารถแจ้งปัญหาถนน ทางเท้า ไฟฟ้า หรือท่อระบายน้ำได้ทันทีโดยไม่ต้องลงทะเบียน มีเจ้าหน้าที่ดูแลตลอด 24 ชั่วโมงค่ะ';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
      }

      let reportMap, reportMarker;
      function initReportMap() {
        const mapEl = document.getElementById('map-view');
        if (!mapEl || typeof L === 'undefined') return;

        // Default coordinate: Samut Prakan / Bangkok (13.5991, 100.5968)
        const defaultLat = 13.5991;
        const defaultLng = 100.5968;

        reportMap = L.map('map-view').setView([defaultLat, defaultLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(reportMap);

        reportMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(reportMap);
        reportMarker.bindPopup('<b>จุดเกิดเหตุ</b><br>ลากหมุดนี้ไปยังจุดที่พบปัญหาได้เลย').openPopup();

        function syncInputCoords(lat, lng) {
          const badge = document.getElementById('map-coord-badge');
          if (badge) badge.innerText = '● พิกัด: ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
          const locInput = document.querySelector('input[name="location_text"]');
          if (locInput) {
            const cleanVal = locInput.value.replace(/\[พิกัด GPS:.*?\]/g, '').trim();
            locInput.value = (cleanVal ? cleanVal + ' ' : '') + '[พิกัด GPS: ' + lat.toFixed(5) + ', ' + lng.toFixed(5) + ']';
          }
        }

        reportMarker.on('dragend', function(e) {
          const pos = e.target.getLatLng();
          syncInputCoords(pos.lat, pos.lng);
        });

        reportMap.on('click', function(e) {
          reportMarker.setLatLng(e.latlng);
          syncInputCoords(e.latlng.lat, e.latlng.lng);
        });

        // Auto-detect location on load if granted
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              reportMap.setView([lat, lng], 16);
              reportMarker.setLatLng([lat, lng]);
              syncInputCoords(lat, lng);
            },
            () => {},
            { timeout: 4000 }
          );
        }
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReportMap);
      } else {
        setTimeout(initReportMap, 100);
      }
    </script>
  `, '/');
}

// 2. NEW REPORT FORM (Standalone Direct Route)
function renderNewReportPage() {
  return renderHomePage();
}

// 3. REPORT SUCCESS PAGE (From Stitch Image 4)
function renderSuccessPage(token, publicId) {
  const qrSvg = generateQRCodeSVG(`/track/${token}`);

  return renderLayout('แจ้งปัญหาสำเร็จแล้ว! — Fix-Loop', `
    <div class="max-w-3xl mx-auto space-y-6 py-4">
      <!-- Success Header Card -->
      <div class="civic-card p-8 bg-[#fed74c] text-center relative space-y-2">
        <div class="w-16 h-16 bg-white border-2 border-black flex items-center justify-center mx-auto mb-2 shadow-[3px_3px_0px_#000]">
          <span class="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
        </div>
        <h1 class="text-3xl font-black uppercase text-black">
          แจ้งปัญหาสำเร็จแล้ว!
        </h1>
        <p class="text-sm font-bold text-gray-800">
          เรื่องของคุณได้เข้าสู่ระบบฐานข้อมูลกลางและแจ้งเตือนไปยังเจ้าหน้าที่เขตเรียบร้อยแล้ว
        </p>
      </div>

      <!-- Main Tracking Voucher Card (From Stitch Image 4) -->
      <div class="civic-card p-8 bg-white space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-4 gap-4">
          <div>
            <span class="text-xs font-bold uppercase text-gray-500">รหัสติดตามเรื่องสาธารณะ (PUBLIC TRACKING ID)</span>
            <div class="text-3xl font-black text-[#2457f5] font-mono mt-0.5">${publicId}</div>
          </div>
          <span class="px-3 py-1 bg-[#fed74c] border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_#000]">
            🔒 TOKEN ACTIVE (ไม่ต้องใช้รหัสผ่าน)
          </span>
        </div>

        <!-- Center QR Code & Instruction -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-6 bg-[#f6f7fa] border-2 border-black">
          <div class="flex flex-col items-center justify-center">
            <div class="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
              ${qrSvg}
            </div>
            <p class="text-xs font-bold text-gray-600 mt-2 text-center">สแกนด้วยกล้องมือถือเพื่อติดตาม</p>
          </div>

          <div class="space-y-3 text-xs">
            <div class="font-black text-sm text-[#111827]">วิธีติดตามความคืบหน้า:</div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold">✔</span>
              <span>บันทึกภาพหน้าจอหรือแคป QR Code นี้ไว้</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold">✔</span>
              <span>แชร์ลิงก์นี้ให้เพื่อนบ้านหรือคนในชุมชน เพื่อร่วมเป็นพยานติดตาม</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="text-emerald-600 font-bold">✔</span>
              <span>เมื่อซ่อมเสร็จ ท่านสามารถกดยืนยันความพึงพอใจได้</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <a href="/track/${token}" class="flex-1 btn-civic-blue text-base py-3">
            <span class="material-symbols-outlined text-xl">open_in_new</span>
            <span>เปิดดูหน้าติดตามสถานะตอนนี้</span>
          </a>

          <button onclick="navigator.clipboard.writeText(window.location.origin + '/track/${token}'); alert('คัดลอกลิงก์ติดตามเรียบร้อยแล้ว!');" class="btn-civic-white text-base py-3 px-6">
            <span class="material-symbols-outlined text-lg">content_copy</span>
            <span>คัดลอกลิงก์</span>
          </button>
        </div>
      </div>
    </div>
  `, '/report/new');
}

// 4. PUBLIC TRACKING PAGE (From Stitch Image 2 & 3)
function renderTrackPage(token) {
  const report = FixLoopStore.getPublicReportByToken(token);

  if (!report) {
    return renderLayout('ไม่พบรายงาน', `
      <div class="max-w-lg mx-auto py-12 text-center">
        <div class="civic-card p-8 bg-[#ffdad6] border-2 border-black space-y-4">
          <span class="material-symbols-outlined text-6xl text-red-600">search_off</span>
          <h1 class="text-2xl font-black text-red-900">ไม่พบข้อมูลเรื่องร้องเรียน</h1>
          <p class="text-xs font-bold text-red-700">รหัสโทเคน (Token) อาจไม่ถูกต้อง หรือเรื่องนี้ถูกลบออกจากระบบแล้ว</p>
          <div class="pt-4 flex gap-3 justify-center">
            <a href="/" class="btn-civic-white text-xs">กลับหน้าหลัก</a>
            <a href="/report/new" class="btn-civic-blue text-xs">แจ้งปัญหาใหม่</a>
          </div>
        </div>
      </div>
    `, '/');
  }

  const currentMeta = STATUS_META[report.status];
  const currentStep = currentMeta.step;
  const qrSvg = generateQRCodeSVG(`/track/${token}`);

  return renderLayout(`ติดตามเรื่อง #${report.public_tracking_id}`, `
    <div class="max-w-5xl mx-auto space-y-4 sm:space-y-6">

      <!-- Top Quick Search Bar for Tracking -->
      <div class="civic-card p-3 sm:p-4 bg-[#fed74c]">
        <form onsubmit="event.preventDefault(); const val = document.getElementById('top-track-input').value.trim(); if(val) window.location.href='/track/'+val;" class="flex gap-2">
          <input type="text" id="top-track-input" required placeholder="ค้นหาเรื่องอื่นด้วย Token หรือรหัสเคส..." class="civic-input text-xs sm:text-sm py-2 px-3 flex-1 bg-white" />
          <button type="submit" class="btn-civic-blue text-xs py-2 px-3 sm:px-4 whitespace-nowrap active:scale-95">
            <span class="material-symbols-outlined text-base">search</span>
            <span class="hidden sm:inline">ค้นหา</span>
          </button>
        </form>
      </div>

      <!-- TOP 5-STAGE STATUS PIPELINE (Mobile Phone Friendly) -->
      <div class="civic-card p-4 sm:p-6 bg-white space-y-3 sm:space-y-4">
        <div class="flex justify-between items-center border-b border-gray-200 pb-2.5">
          <h2 class="font-black text-xs sm:text-sm uppercase text-gray-800 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-base sm:text-lg text-[#2457f5]">timeline</span>
            <span>ขั้นตอนการดำเนินงาน (5 ขั้นตอน)</span>
          </h2>
          <span class="text-[10px] sm:text-xs text-gray-500 font-bold">5 ขั้นตอนโปร่งใส</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-5 gap-2">
          ${REPORT_STATUSES.map((s, idx) => {
            const stepNum = idx + 1;
            const isCurr = stepNum === currentStep;
            const isDone = stepNum < currentStep;
            return `
              <div class="p-2.5 sm:p-3 border-2 border-black rounded flex sm:flex-col justify-between items-center sm:items-start ${isCurr ? 'bg-[#fed74c] shadow-[2px_2px_0px_#000]' : isDone ? 'bg-[#dde1ff] text-[#001453]' : 'bg-gray-50 opacity-50 text-gray-400'}">
                <div class="font-black text-xs text-gray-900">${stepNum}. ${s}</div>
                <div class="text-[10px] font-bold sm:mt-2 ${isCurr ? 'text-[#715500] font-black' : isDone ? 'text-emerald-700' : 'text-gray-400'}">
                  ${isCurr ? '● ดำเนินการอยู่' : isDone ? '✓ เสร็จสิ้น' : 'รอตามลำดับ'}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- MAIN TICKET REPORT CARD -->
      <div class="civic-card p-4 sm:p-8 bg-white space-y-4 sm:space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-black pb-4 gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold uppercase text-gray-500">รหัสเคสสาธารณะ</span>
              <span class="text-xs font-bold px-2 py-0.5 bg-blue-50 border border-blue-300 text-[#2457f5] rounded">${report.community_name}</span>
            </div>
            <h1 class="text-3xl font-black text-[#111827]">#${report.public_tracking_id}</h1>
          </div>
          <div>${renderStatusBadge(report.status)}</div>
        </div>

        <!-- Highlight Current Status Banner -->
        <div style="background-color: ${currentMeta.bgColor};" class="border-2 border-black p-4 text-[#111827] shadow-[3px_3px_0px_#000]">
          <div class="flex items-center gap-2 font-black text-lg mb-0.5">
            <span class="material-symbols-outlined text-2xl">${currentMeta.icon}</span>
            <span>สถานะปัจจุบัน: ${report.status}</span>
          </div>
          <p class="text-xs font-bold">${currentMeta.description}</p>
        </div>

        <!-- Issue Details Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-3 border-2 border-black bg-gray-50">
            <span class="text-xs font-bold text-gray-500 uppercase">ประเภทปัญหา</span>
            <p class="text-base font-black text-gray-900 mt-0.5">${report.category}</p>
          </div>
          <div class="p-3 border-2 border-black bg-gray-50">
            <span class="text-xs font-bold text-gray-500 uppercase">หัวข้อเรื่อง</span>
            <p class="text-base font-black text-gray-900 mt-0.5">${report.title}</p>
          </div>
          <div class="md:col-span-2 p-3 border-2 border-black bg-gray-50">
            <span class="text-xs font-bold text-gray-500 uppercase">สถานที่ / จุดสังเกต</span>
            <p class="text-sm font-bold text-gray-900 mt-0.5">${report.location_text}</p>
          </div>
          <div class="md:col-span-2 p-3 border-2 border-black bg-gray-50">
            <span class="text-xs font-bold text-gray-500 uppercase">รายละเอียดปัญหา</span>
            <p class="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">${report.description}</p>
          </div>
        </div>
      </div>

      <!-- PUBLIC AUDIT TRAIL TIMELINE (From Stitch Image 2 & 3) -->
      <div class="civic-card p-8 bg-white space-y-4">
        <div class="flex items-center justify-between border-b-2 border-black pb-3">
          <h2 class="text-lg font-black uppercase text-[#111827] flex items-center gap-2">
            <span class="material-symbols-outlined text-2xl text-[#2457f5]">history_edu</span>
            <span>บันทึกความคืบหน้าสาธารณะ (AUDIT TRAIL)</span>
          </h2>
          <span class="text-xs font-bold text-gray-500">เรียงล่าสุดขึ้นก่อน</span>
        </div>

        <div class="space-y-3">
          ${report.history.map(h => `
            <div class="border-2 border-black p-4 bg-[#f8f9fc] shadow-[2px_2px_0px_#000] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  ${renderStatusBadge(h.new_status)}
                  ${h.previous_status ? `<span class="text-xs text-gray-500 font-bold">(เปลี่ยนจาก: ${h.previous_status})</span>` : ''}
                </div>
                <p class="text-sm font-bold text-gray-900">${h.note || 'อัปเดตสถานะการทำงาน'}</p>
              </div>
              <span class="text-xs font-mono font-bold text-gray-500 whitespace-nowrap bg-white px-2 py-1 border border-gray-300">
                ${new Date(h.created_at).toLocaleString('th-TH')}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CITIZEN CONFIRMATION & SHARING (From Stitch Image 2) -->
      <div class="civic-card p-6 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-3xl text-yellow-500">thumb_up</span>
          <div>
            <div class="font-black text-sm text-gray-900">พบปัญหาจุดนี้เหมือนกันหรือไม่?</div>
            <div class="text-xs text-gray-500">ร่วมยืนยันเพื่อเพิ่มระดับความเร่งด่วนให้เจ้าหน้าที่เขต</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="alert('ขอบคุณสำหรับการร่วมยืนยันข้อมูลเคสนี้!');" class="btn-civic-yellow text-xs py-2 px-4">
            👍 ยืนยันปัญหานี้ (48 คน)
          </button>
          <a href="/report/new" class="btn-civic-blue text-xs py-2 px-4">
            แจ้งปัญหาจุดอื่น
          </a>
        </div>
      </div>
    </div>
  `, '/');
}

// 5. ADMIN LOGIN (From Stitch Image 5)
function renderAdminLoginPage() {
  return renderLayout('เข้าสู่ระบบเจ้าหน้าที่ — Fix-Loop', `
    <div class="max-w-md mx-auto py-12 space-y-6">
      <div class="civic-card p-8 bg-white space-y-6">
        <div class="flex items-center gap-3 border-b-2 border-black pb-4">
          <div class="w-12 h-12 bg-[#2457f5] text-white border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#000]">
            ADM
          </div>
          <div>
            <h1 class="text-2xl font-black text-[#111827]">เข้าสู่ระบบเจ้าหน้าที่</h1>
            <p class="text-xs font-bold text-gray-500 mt-0.5 uppercase">MUNICIPAL DISPATCH CONSOLE</p>
          </div>
        </div>

        <form method="POST" action="/api/admin/login" class="space-y-4">
          <div>
            <label class="block text-xs font-black uppercase mb-1">อีเมลเจ้าหน้าที่ / EMAIL</label>
            <input type="email" id="admin-email" name="email" value="admin.prn@fixloop.org" required class="civic-input text-sm" />
          </div>

          <div>
            <label class="block text-xs font-black uppercase mb-1">รหัสผ่าน / PASSWORD</label>
            <input type="password" value="password123" class="civic-input text-sm" />
          </div>

          <button type="submit" class="w-full btn-civic-blue text-base py-3 justify-center">
            <span>เข้าสู่ระบบแดชบอร์ด</span>
            <span class="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </form>

        <!-- Test Accounts for Community Isolation -->
        <div class="pt-4 border-t-2 border-black space-y-2">
          <div class="text-xs font-bold text-gray-600 uppercase">
            บัญชีทดสอบแยกสิทธิ์เขต (COMMUNITY ISOLATION):
          </div>
          ${AUTHORIZED_ADMINS.map(a => `
            <button onclick="document.getElementById('admin-email').value='${a.email}'" class="w-full text-left p-2.5 border border-black text-xs font-bold bg-gray-50 hover:bg-[#fed74c] transition-colors flex justify-between items-center">
              <span>${a.name}</span>
              <span class="text-[10px] font-mono text-gray-500">${a.email}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `, '/admin/login');
}

// 6. ADMIN DASHBOARD (From Stitch Screenshot 4 & 5)
function renderAdminDashboard(adminId) {
  const admin = FixLoopStore.getAdminById(adminId) || AUTHORIZED_ADMINS[0];
  const { reports } = FixLoopStore.getAdminReports({ adminId: admin.id });
  const communities = FixLoopStore.getCommunities().filter(c => admin.assigned_community_ids.includes(c.id));
  const activeReport = reports[0] || null;

  return renderLayout('แดชบอร์ดเจ้าหน้าที่ — FixLoop Admin Operational Unit', `
    <div class="space-y-6">

      <!-- Top Municipal Banner (From Stitch Screenshot 5) -->
      <div class="civic-card p-4 sm:p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 bg-[#fed74c] text-black border border-black font-black text-xs uppercase shadow-[1px_1px_0px_#000]">
              📍 ${communities.map(c => c.name).join(', ')}
            </span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
              ● เจ้าหน้าที่ปฏิบัติงานออนไลน์ 24 ชม.
            </span>
          </div>
          <h1 class="text-xl sm:text-3xl font-black text-[#111827]">
            FixLoop Admin Operational Unit — ${admin.name}
          </h1>
          <p class="text-xs font-bold text-gray-500 mt-0.5">
            ระบบบริหารจัดการเรื่องร้องเรียนโครงสร้างและสาธารณูปโภค (Community Isolation RLS)
          </p>
        </div>
        <div class="flex gap-2">
          <a href="/admin/login" class="btn-civic-white text-xs py-2 px-3 shadow-[2px_2px_0px_#000]">
            สลับบัญชีเจ้าหน้าที่
          </a>
        </div>
      </div>

      <!-- 4 Stats Metric Cards (Stitch Reference: 142 Total, 8 Pending, 24 In Progress, 110 Done) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="civic-card p-4 sm:p-5 bg-white">
          <div class="flex justify-between items-start">
            <span class="text-xs font-bold text-gray-500 uppercase">รวมเรื่องทั้งหมด</span>
            <span class="material-symbols-outlined text-gray-400">confirmation_number</span>
          </div>
          <div class="text-2xl sm:text-4xl font-black text-[#111827] mt-1">${reports.length}</div>
          <span class="text-[10px] text-gray-400 font-bold mt-1 block">เคสทั้งหมดในเขต</span>
        </div>

        <div class="civic-card p-4 sm:p-5 bg-[#fff8e6] border-2 border-[#b45309]">
          <div class="flex justify-between items-start">
            <span class="text-xs font-bold text-[#b45309] uppercase">รอตรวจสอบ</span>
            <span class="material-symbols-outlined text-[#b45309]">hourglass_top</span>
          </div>
          <div class="text-2xl sm:text-4xl font-black text-[#b45309] mt-1">
            ${reports.filter(r => r.status === 'รอตรวจสอบ').length}
          </div>
          <span class="text-[10px] text-[#b45309] font-bold mt-1 block">ต้องลงรับเรื่องด่วน</span>
        </div>

        <div class="civic-card p-4 sm:p-5 bg-[#eff6ff] border-2 border-[#2457f5]">
          <div class="flex justify-between items-start">
            <span class="text-xs font-bold text-[#2457f5] uppercase">กำลังดำเนินการ</span>
            <span class="material-symbols-outlined text-[#2457f5]">construction</span>
          </div>
          <div class="text-2xl sm:text-4xl font-black text-[#2457f5] mt-1">
            ${reports.filter(r => r.status === 'รับเรื่องแล้ว' || r.status === 'กำลังดำเนินการ').length}
          </div>
          <span class="text-[10px] text-[#2457f5] font-bold mt-1 block">ทีมช่างอยู่ในพื้นที่</span>
        </div>

        <div class="civic-card p-4 sm:p-5 bg-[#f0fdf4] border-2 border-emerald-600">
          <div class="flex justify-between items-start">
            <span class="text-xs font-bold text-emerald-800 uppercase">แก้ไขเสร็จสิ้น</span>
            <span class="material-symbols-outlined text-emerald-700">check_circle</span>
          </div>
          <div class="text-2xl sm:text-4xl font-black text-emerald-700 mt-1">
            ${reports.filter(r => r.status === 'แก้ไขแล้ว').length}
          </div>
          <span class="text-[10px] text-emerald-700 font-bold mt-1 block">ปิดงานสมบูรณ์</span>
        </div>
      </div>

      <!-- Main 2-Column Split: Case List (Left) + Live Inspector (Right) (Stitch Screen 4 & 5) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <!-- Left Column (60%): Cases Table -->
        <div class="lg:col-span-7 civic-card p-4 sm:p-6 bg-white space-y-4">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-black pb-3">
            <div>
              <h2 class="text-lg font-black uppercase text-[#111827]">
                ตารางเคสในความรับผิดชอบ (${reports.length} รายการ)
              </h2>
              <p class="text-xs text-gray-500 font-medium">แตะเลือกแถวเพื่อตรวจสอบและแก้ไขสถานะในกล่องด้านขวา</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="border-b-2 border-black bg-gray-100 text-[11px] font-black uppercase">
                  <th class="p-2 sm:p-3">รหัสเคส</th>
                  <th class="p-2 sm:p-3">ปัญหา / สถานที่</th>
                  <th class="p-2 sm:p-3">สถานะ</th>
                  <th class="p-2 sm:p-3 text-right">เลือก</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${reports.map(r => `
                  <tr onclick="selectCase(${JSON.stringify(r).replace(/"/g, '&quot;')})" class="hover:bg-blue-50/60 cursor-pointer transition-colors case-row" data-id="${r.id}">
                    <td class="p-2 sm:p-3 font-mono font-bold text-xs text-[#2457f5]">
                      ${r.public_tracking_id}
                      <span class="block text-[10px] text-gray-400 font-normal">${new Date(r.created_at).toLocaleDateString('th-TH')}</span>
                    </td>
                    <td class="p-2 sm:p-3">
                      <span class="block font-black text-xs sm:text-sm text-gray-900">${r.title}</span>
                      <span class="block text-[11px] text-gray-500 truncate max-w-xs">${r.location_text}</span>
                    </td>
                    <td class="p-2 sm:p-3">${renderStatusBadge(r.status)}</td>
                    <td class="p-2 sm:p-3 text-right">
                      <button type="button" class="btn-civic-blue text-[11px] py-1 px-2.5 shadow-[1px_1px_0px_#000]">ตรวจ</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Column (40%): Live Case Inspector & Status Action Box (Stitch Screenshot 4 & 5) -->
        <div class="lg:col-span-5 civic-card p-4 sm:p-6 bg-white space-y-4 sticky top-24">
          <div class="flex justify-between items-start border-b-2 border-black pb-3">
            <div>
              <span class="text-[10px] font-bold text-gray-500 uppercase">รายละเอียดเคสที่เลือก</span>
              <h3 id="inspect-id" class="text-xl font-black text-[#2457f5] font-mono">
                ${activeReport ? '#' + activeReport.public_tracking_id : 'เลือกรายการเพื่อจัดการ'}
              </h3>
            </div>
            <div id="inspect-badge">
              ${activeReport ? renderStatusBadge(activeReport.status) : ''}
            </div>
          </div>

          <!-- Problem Info -->
          <div class="space-y-2 text-xs">
            <div>
              <span class="font-bold text-gray-500">หัวข้อเรื่อง:</span>
              <p id="inspect-title" class="font-black text-sm text-gray-900 mt-0.5">
                ${activeReport ? activeReport.title : '-'}
              </p>
            </div>
            <div>
              <span class="font-bold text-gray-500">สถานที่เกิดเหตุ:</span>
              <p id="inspect-location" class="font-bold text-gray-800 bg-[#f6f7fa] p-2 border border-black mt-0.5">
                ${activeReport ? activeReport.location_text : '-'}
              </p>
            </div>
            <div>
              <span class="font-bold text-gray-500">รายละเอียด:</span>
              <p id="inspect-desc" class="text-gray-700 whitespace-pre-wrap leading-relaxed mt-0.5">
                ${activeReport ? activeReport.description : '-'}
              </p>
            </div>
          </div>

          <!-- Mini Map & Photo Graphic (Stitch Screenshot 4) -->
          <div class="grid grid-cols-2 gap-2 pt-1">
            <div class="border-2 border-black bg-gray-100 p-2 text-center">
              <span class="block text-[10px] font-bold text-gray-500 mb-1">📍 แผนที่ GIS เขตจริง</span>
              <div id="admin-mini-map" class="h-28 w-full border border-gray-400 rounded z-0"></div>
            </div>
            <div class="border-2 border-black bg-gray-100 p-2 text-center">
              <span class="block text-[10px] font-bold text-gray-500 mb-1">📸 รูปถ่ายปัญหา</span>
              <div id="inspect-photo-box" class="h-28 bg-gray-200 border border-gray-400 flex items-center justify-center text-xs text-gray-500 overflow-hidden">
                ${activeReport && activeReport.image_url ? `<img src="${activeReport.image_url}" class="w-full h-full object-cover" />` : 'ไม่มีรูปแนบ'}
              </div>
            </div>
          </div>

          <!-- Inline Status Update Form (Stitch Screen 4) -->
          <form method="POST" action="/api/admin/status" class="border-t-2 border-black pt-3 space-y-3">
            <input type="hidden" name="adminId" value="${admin.id}" />
            <input type="hidden" id="form-report-id" name="reportId" value="${activeReport ? activeReport.id : ''}" />

            <div>
              <label class="block text-xs font-black uppercase mb-1">ปรับเปลี่ยนสถานะ (5 ขั้นตอน):</label>
              <select id="form-new-status" name="newStatus" class="civic-input text-xs font-bold bg-white">
                ${REPORT_STATUSES.map(s => `<option value="${s}" ${activeReport && activeReport.status === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>

            <div>
              <div class="flex justify-between items-center mb-1">
                <label class="block text-xs font-black uppercase">บันทึกการปฏิบัติงานของเจ้าหน้าที่:</label>
                <span id="char-count" class="text-[10px] font-mono font-bold text-gray-500">0/200</span>
              </div>
              <textarea name="note" id="form-note" maxlength="200" rows="2" oninput="document.getElementById('char-count').innerText=this.value.length+'/200'" placeholder="เช่น ทีมช่างลงพื้นที่สำรวจและเริ่มซ่อมแซมแล้ว..." class="civic-input text-xs"></textarea>
            </div>

            <button type="submit" class="w-full btn-civic-blue text-sm py-2.5 shadow-[3px_3px_0px_#000] active:scale-95">
              <span class="material-symbols-outlined text-base">save</span>
              <span>บันทึกการเปลี่ยนแปลงสถานะ</span>
            </button>
          </form>
        </div>
      </div>
    </div>

    <script>
      let adminMiniMap, adminMarker;
      function initAdminMiniMap() {
        const el = document.getElementById('admin-mini-map');
        if (!el || typeof L === 'undefined') return;
        const defaultLat = 13.5991;
        const defaultLng = 100.5968;
        adminMiniMap = L.map('admin-mini-map').setView([defaultLat, defaultLng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OSM'
        }).addTo(adminMiniMap);
        adminMarker = L.marker([defaultLat, defaultLng]).addTo(adminMiniMap);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdminMiniMap);
      } else {
        setTimeout(initAdminMiniMap, 100);
      }

      function selectCase(r) {
        document.getElementById('inspect-id').innerText = '#' + r.public_tracking_id;
        document.getElementById('inspect-title').innerText = r.title;
        document.getElementById('inspect-location').innerText = r.location_text;
        document.getElementById('inspect-desc').innerText = r.description;
        document.getElementById('form-report-id').value = r.id;
        document.getElementById('form-new-status').value = r.status;
        const photoBox = document.getElementById('inspect-photo-box');
        if (r.image_url) {
          photoBox.innerHTML = '<img src="' + r.image_url + '" class="w-full h-full object-cover" />';
        } else {
          photoBox.innerHTML = '<span class="text-xs text-gray-500">ไม่มีรูปแนบ</span>';
        }

        // Parse coordinates from location_text if available
        if (adminMiniMap && adminMarker) {
          const match = r.location_text.match(/\[พิกัด GPS:\s*([\d.]+),\s*([\d.]+)\]/);
          if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            adminMiniMap.setView([lat, lng], 16);
            adminMarker.setLatLng([lat, lng]);
            adminMarker.bindPopup('<b>' + r.title + '</b><br>' + r.location_text).openPopup();
          }
        }
      }
    </script>
  `, '/admin/dashboard');
}

// Helper to parse POST form body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const data = {};
      for (const [k, v] of params.entries()) {
        data[k] = v;
      }
      resolve(data);
    });
  });
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ROUTE 1: Home Page (Full Desktop Civic Experience)
  if (pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderHomePage());
    return;
  }

  // ROUTE 2: New Report Form
  if (pathname === '/report/new') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderNewReportPage());
    return;
  }

  // ROUTE 3: Report Success Page
  if (pathname === '/report/success') {
    const token = url.searchParams.get('token') || '';
    const id = url.searchParams.get('id') || '';
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderSuccessPage(token, id));
    return;
  }

  // ROUTE 4: Public Tracking Page
  if (pathname.startsWith('/track/')) {
    const token = pathname.replace('/track/', '');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderTrackPage(token));
    return;
  }

  // ROUTE 5: Admin Login
  if (pathname === '/admin/login') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderAdminLoginPage());
    return;
  }

  // ROUTE 6: Admin Dashboard
  if (pathname === '/admin/dashboard' || pathname === '/admin') {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/admin_id=([^;]+)/);
    const adminId = match ? match[1] : AUTHORIZED_ADMINS[0].id;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderAdminDashboard(adminId));
    return;
  }

  // API 1: Submit Report
  if (pathname === '/api/reports' && req.method === 'POST') {
    const data = await parseBody(req);
    try {
      const result = FixLoopStore.createReport({
        community_id: data.community_id,
        category: data.category,
        title: data.title,
        description: data.description,
        location_text: data.location_text,
        reporter_contact: data.reporter_contact || null,
      });
      res.writeHead(302, {
        Location: `/report/success?token=${result.tracking_token}&id=${result.public_tracking_id}`,
      });
      res.end();
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h3>เกิดข้อผิดพลาด: ${err.message}</h3><a href="/report/new">ลองใหม่อีกครั้ง</a>`);
    }
    return;
  }

  // API 2: Admin Login POST
  if (pathname === '/api/admin/login' && req.method === 'POST') {
    const data = await parseBody(req);
    const admin = FixLoopStore.getAdminByEmail(data.email);
    if (admin) {
      res.writeHead(302, {
        'Set-Cookie': `admin_id=${admin.id}; Path=/; HttpOnly`,
        Location: '/admin/dashboard',
      });
      res.end();
    } else {
      res.writeHead(302, { Location: '/admin/login?error=invalid' });
      res.end();
    }
    return;
  }

  // API 3: Admin Status Update POST
  if (pathname === '/api/admin/status' && req.method === 'POST') {
    const data = await parseBody(req);
    try {
      FixLoopStore.updateReportStatus({
        reportId: data.reportId,
        adminId: data.adminId,
        newStatus: data.newStatus,
        note: data.note,
      });
      res.writeHead(302, { Location: '/admin/dashboard' });
      res.end();
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h3>ไม่สามารถอัปเดตได้: ${err.message}</h3><a href="/admin/dashboard">กลับไปแดชบอร์ด</a>`);
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404 Not Found</h1><a href="/">กลับหน้าหลัก</a>');
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Fix-Loop Civic Desktop Platform is running!`);
  console.log(`👉 http://localhost:${PORT}`);
  console.log(`👉 http://localhost:${PORT}/report/new (แจ้งปัญหา)`);
  console.log(`👉 http://localhost:${PORT}/admin/dashboard (แดชบอร์ดเจ้าหน้าที่)`);
  console.log(`==================================================\n`);
});
