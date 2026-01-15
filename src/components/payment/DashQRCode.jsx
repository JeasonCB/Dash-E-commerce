'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function DashQRCode({ address, amount }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Formato: dash:address?amount=X
        const dashURI = `dash:${address}?amount=${amount}`;
        const dataUrl = await QRCode.toDataURL(dashURI, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error('QR generation error:', error);
      }
    };

    if (address && amount) {
      generateQR();
    }
  }, [address, amount]);

  if (!qrDataUrl) {
    return (
      <div className="flex h-[300px] w-[300px] items-center justify-center rounded-2xl bg-slate-900/40">
        <div className="loading loading-spinner loading-lg text-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-4 border-white bg-white p-4 shadow-lg">
      <img
        src={qrDataUrl}
        alt="QR Code para pago"
        className="h-[300px] w-[300px]"
      />
    </div>
  );
}
