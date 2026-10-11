'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdminAction } from '@/lib/actions';
import { AUTHORIZED_ADMINS } from '@/lib/store';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin.prn@fixloop.org');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdminAction(email);
      if (!res.success) {
        setError(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
        setLoading(false);
        return;
      }
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="bg-white border-4 border-[#1c1b1b] p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1c1b1b]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#003ece] text-white border-2 border-[#1c1b1b] flex items-center justify-center font-black">
            ADM
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1c1b1b]">เข้าสู่ระบบเจ้าหน้าที่</h1>
            <p className="text-xs text-[#747687] font-bold">FixLoop Municipal Administration</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-[#ffdad6] border-2 border-[#ba1a1a] p-3 text-xs font-bold text-[#93000a]">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#1c1b1b] mb-1">
              อีเมลเจ้าหน้าที่ที่ได้รับสิทธิ์
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin.prn@fixloop.org"
              className="brutal-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#1c1b1b] mb-1">
              รหัสผ่าน (สำหรับการทดสอบ MVP)
            </label>
            <input
              type="password"
              defaultValue="password123"
              className="brutal-input text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full brutal-btn-primary text-base py-3 justify-center shadow-[4px_4px_0px_0px_#1c1b1b]"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบเจ้าหน้าที่'}</span>
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="mt-8 pt-6 border-t-2 border-[#1c1b1b] space-y-3">
          <p className="text-xs font-black text-[#747687] uppercase tracking-wider">
            ทดสอบสิทธิ์ชุมชนแยกตามเขต (Community Isolation):
          </p>
          <div className="space-y-2">
            {AUTHORIZED_ADMINS.map((adm) => (
              <button
                key={adm.id}
                type="button"
                onClick={() => setEmail(adm.email)}
                className={`w-full text-left p-2 border-2 border-[#1c1b1b] text-xs font-bold transition-all ${
                  email === adm.email
                    ? 'bg-[#fed74c] shadow-[2px_2px_0px_0px_#1c1b1b]'
                    : 'bg-gray-50 hover:bg-white'
                }`}
              >
                <div className="text-[#1c1b1b]">{adm.name}</div>
                <div className="text-[11px] text-[#747687] font-mono">{adm.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
