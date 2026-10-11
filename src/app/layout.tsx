import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Fix-Loop — ระบบรายงานและติดตามปัญหาโครงสร้างเพื่อชุมชน',
  description: 'แจ้งเรื่องร้องเรียน ปัญหาทางเท้า ไฟทาง ขยะ ท่อระบายน้ำ ในชุมชนของคุณได้ทันที ไม่ต้องสมัครสมาชิก มี QR Code ติดตามความคืบหน้าอย่างโปร่งใส',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fcf9f8] text-[#1c1b1b] antialiased pb-20 md:pb-0">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
