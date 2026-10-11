'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  trackingUrl: string;
  size?: number;
}

export default function QRCodeDisplay({ trackingUrl, size = 180 }: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!trackingUrl) return;

    QRCode.toDataURL(trackingUrl, {
      width: size * 2,
      margin: 2,
      color: {
        dark: '#1c1b1b',
        light: '#ffffff',
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [trackingUrl, size]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white border-2 border-[#1c1b1b] shadow-[4px_4px_0px_0px_#1c1b1b] max-w-xs mx-auto text-center">
      <div className="p-2 border-2 border-[#1c1b1b] bg-white mb-3">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="QR Code สำหรับติดตามสถานะรายงาน"
            width={size}
            height={size}
            className="block"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold"
          >
            กำลังสร้าง QR Code...
          </div>
        )}
      </div>

      <p className="text-xs font-bold text-[#434656] mb-3">
        สแกนด้วยกล้องมือถือเพื่อเปิดหน้านี้ได้ทุกเมื่อ
      </p>

      <button
        type="button"
        onClick={copyUrl}
        className="w-full brutal-btn-outline text-xs py-2 px-3 flex items-center justify-center gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">
          {copied ? 'check' : 'content_copy'}
        </span>
        <span>{copied ? 'คัดลอกลิงก์สำเร็จแล้ว!' : 'คัดลอกลิงก์ติดตาม'}</span>
      </button>
    </div>
  );
}
