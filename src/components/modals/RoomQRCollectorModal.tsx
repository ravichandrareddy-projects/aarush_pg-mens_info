import React, { useState } from 'react';
import { X, QrCode, Share2, Copy, Check, ShieldCheck, Clock, ExternalLink, FileText } from 'lucide-react';
import { QRCodeSVG } from '../common/QRCodeSVG';
import { Bed } from '../../types/pg';
import { usePG } from '../../context/PGContext';

interface RoomQRCollectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  floorName: string;
  roomNumber: string;
  beds: Bed[];
}

export const RoomQRCollectorModal: React.FC<RoomQRCollectorModalProps> = ({
  isOpen,
  onClose,
  floorName,
  roomNumber,
  beds
}) => {
  const { getResidentById } = usePG();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build public submission URL for Room
  const getPublicBaseUrl = () => {
    const customPublic = import.meta.env.VITE_PUBLIC_WEB_URL;
    if (customPublic) return customPublic.replace(/\/$/, '');
    const origin = window.location.origin;
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.startsWith('file:') ||
      origin.startsWith('capacitor:')
    ) {
      return 'https://aarush-pg-mens-info.vercel.app';
    }
    return origin;
  };

  const baseOrigin = getPublicBaseUrl();
  const submissionUrl = `${baseOrigin}${window.location.pathname}?collectRoom=${encodeURIComponent(roomNumber)}`;

  // WhatsApp share link formatted message
  const whatsappMessage = encodeURIComponent(
    `🏢 *Aarush Mens Luxury PG - Document Submission*\n\n` +
    `Hi Room ${roomNumber} residents,\n` +
    `Please upload your Aadhaar Card copy and profile photo for official records using the secure link below:\n\n` +
    `👉 ${submissionUrl}\n\n` +
    `Thank you!\nPG Management`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(submissionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full my-8 border border-[#F5F2ED] shadow-floating overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#F5F2ED] flex items-center justify-between bg-[#FDFBF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#181919] text-white flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5 text-[#A8C393]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#181919]">
                Room {roomNumber} Aadhaar Collector
              </h2>
              <p className="text-xs text-[#747878] font-mono">{floorName} • Self-Submission QR</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#747878] hover:bg-[#F5F3F3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* QR Code Card */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 p-4 bg-[#FDFBF7] rounded-2xl border border-[#F5F2ED]">
            <QRCodeSVG value={submissionUrl} size={210} />

            <div className="pt-1">
              <h3 className="text-sm font-bold text-[#181919]">
                Scan to Upload Aadhaar for Room {roomNumber}
              </h3>
              <p className="text-xs text-[#747878] max-w-xs mt-0.5">
                Residents in Room {roomNumber} scan this QR code on their phone to submit Aadhaar & photo.
              </p>
            </div>
          </div>

          {/* Quick Action Share Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to WhatsApp Group</span>
            </a>

            <button
              onClick={handleCopyLink}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                copied
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-[#F5F3F3] text-[#181919] border-[#E4E2E2] hover:bg-[#EFECE8]'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#747878]" />
                  <span>Copy Direct Link</span>
                </>
              )}
            </button>
          </div>

          {/* Live Room Occupants Document Status Checklist */}
          <div className="space-y-3 pt-2 border-t border-[#F5F2ED]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono tracking-wider text-[#747878] uppercase font-semibold">
                ROOM {roomNumber} OCCUPANT STATUS
              </h4>
              <span className="text-[11px] font-mono text-[#536347]">
                {beds.filter((b) => {
                  const res = b.residentId ? getResidentById(b.residentId) : null;
                  return res && res.aadhaarDocumentUrl;
                }).length} / {beds.filter((b) => b.status === 'OCCUPIED').length} Uploaded
              </span>
            </div>

            <div className="space-y-2">
              {beds.map((bed) => {
                const resident = bed.residentId ? getResidentById(bed.residentId) : null;
                const hasUploadedAadhaar = Boolean(resident?.aadhaarDocumentUrl);

                return (
                  <div
                    key={bed.id}
                    className="p-3 rounded-xl bg-[#FDFBF7] border border-[#F5F2ED] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#F5F2ED] flex items-center justify-center font-mono font-bold text-[11px] text-[#181919]">
                        B{bed.bedNumber}
                      </div>
                      <div>
                        <p className="font-bold text-[#181919]">
                          {resident ? resident.fullName : 'Bed Empty'}
                        </p>
                        <p className="text-[10px] text-[#747878] font-mono">
                          {resident ? resident.phone : 'Available for onboarding'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {bed.status === 'OCCUPIED' ? (
                        hasUploadedAadhaar ? (
                          <div className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Uploaded ✓</span>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-mono text-[10px] font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending ⏳</span>
                          </div>
                        )
                      ) : (
                        <span className="text-[10px] text-[#747878] font-mono">Empty</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
