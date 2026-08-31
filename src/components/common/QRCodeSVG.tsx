import React from 'react';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({ value, size = 200, className = '' }) => {
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=10`;

  return (
    <div className={`relative flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-[#F5F2ED] shadow-subtle ${className}`}>
      <img
        src={qrApiUrl}
        alt={`QR Code for ${value}`}
        width={size}
        height={size}
        className="rounded-lg object-contain shadow-xs"
      />
      <span className="text-[10px] text-[#747878] font-mono mt-2">Scan with any phone camera</span>
    </div>
  );
};
