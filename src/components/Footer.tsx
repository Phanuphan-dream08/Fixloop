import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-16 bg-[#1c1b1b] text-[#ffffff] border-t-4 border-[#003ece]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#fed74c] text-[#1c1b1b] font-black flex items-center justify-center border-2 border-white">
                FL
              </div>
              <span className="font-black text-xl tracking-tight text-white">FIX-LOOP</span>
            </div>
            <p className="text-gray-300 text-sm max-w-md leading-relaxed mb-4">
              แพลตฟอร์มแจ้งและติดตามปัญหาโครงสร้างพื้นฐานระดับชุมชน เพื่อความโปร่งใส ความรับผิดชอบ และคุณภาพชีวิตที่ดีของประชาชนทุกคน ไม่ต้องสมัครสมาชิก ไม่เก็บข้อมูลส่วนตัวโดยไม่จำเป็น
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#313030] border border-gray-600 text-xs text-yellow-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ระบบเปิดให้บริการและรับเรื่อง 24 ชม.</span>
            </div>
          </div>

          {/* Emergency contacts */}
          <div>
            <h4 className="font-bold text-base text-yellow-300 mb-3 uppercase tracking-wider">
              เบอร์ติดต่อฉุกเฉิน
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <span className="font-bold text-white">ศูนย์กทม. 1555</span> (ร้องเรียน 24 ชม.)
              </li>
              <li>
                <span className="font-bold text-white">การไฟฟ้านครหลวง:</span> 1130
              </li>
              <li>
                <span className="font-bold text-white">การประปานครหลวง:</span> 1125
              </li>
              <li>
                <span className="font-bold text-white">แจ้งเหตุด่วนเหตุร้าย:</span> 191
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base text-yellow-300 mb-3 uppercase tracking-wider">
              เมนูลัด
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/report/new" className="hover:text-white underline">
                  แจ้งปัญหาใหม่
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white underline">
                  ค้นหาและติดตามสถานะ
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white underline">
                  เข้าสู่ระบบเจ้าหน้าที่
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <p>© 2025 FixLoop Platform. Open Civic Tech Initiative. Built with Civic Brutalism Design System.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">ความเป็นส่วนตัวของประชาชนเป็นสิ่งสำคัญอันดับ 1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
