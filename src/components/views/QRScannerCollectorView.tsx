import React, { useState, useEffect } from 'react';
import { QrCode, Search, Share2, Copy, Check, ShieldCheck, Clock, FileText, User, ExternalLink, Building2, RefreshCw } from 'lucide-react';
import { QRCodeSVG } from '../common/QRCodeSVG';
import { usePG } from '../../context/PGContext';
import { getRemoteSubmissionsFromSupabase, RemoteSubmissionRecord } from '../../lib/supabaseStorage';

interface QRScannerCollectorViewProps {
  initialRoomNumber?: string;
  onClose?: () => void;
}

export const QRScannerCollectorView: React.FC<QRScannerCollectorViewProps> = ({
  initialRoomNumber = '101',
  onClose
}) => {
  const { floors, getResidentById } = usePG();
  const [searchQuery, setSearchQuery] = useState(initialRoomNumber);
  const [copied, setCopied] = useState(false);
  const [remoteSubmissions, setRemoteSubmissions] = useState<RemoteSubmissionRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRemote = async () => {
    setIsRefreshing(true);
    const subs = await getRemoteSubmissionsFromSupabase();
    setRemoteSubmissions(subs);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchRemote();
    const interval = setInterval(fetchRemote, 5000);
    return () => clearInterval(interval);
  }, []);

  // Flatten all rooms across all floors
  const allRooms = floors.flatMap((floor) =>
    floor.rooms.map((room) => ({
      ...room,
      floorName: floor.name
    }))
  );

  // Filter room matching search query (e.g. "101", "102", "501", "G01")
  const currentRoom =
    allRooms.find(
      (r) =>
        r.roomNumber.toLowerCase() === searchQuery.trim().toLowerCase() ||
        r.id.toLowerCase() === searchQuery.trim().toLowerCase()
    ) || allRooms[0];

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
  const roomNumber = currentRoom ? currentRoom.roomNumber : '101';
  const submissionUrl = `${baseOrigin}${window.location.pathname}?collectRoom=${encodeURIComponent(roomNumber)}`;

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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#F5F2ED] shadow-subtle">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181919] text-white text-[10px] font-mono uppercase mb-2">
            <QrCode className="w-3.5 h-3.5 text-[#A8C393]" />
            <span>Admin QR Collector Tool</span>
          </div>
          <h1 className="text-2xl font-bold text-[#181919] tracking-tight">
            Room Aadhaar QR Scanner & Submissions
          </h1>
          <p className="text-xs text-[#747878] mt-1 font-mono">
            Type any room number to view resident Aadhaar uploads or generate scannable QR codes.
          </p>
        </div>

        {/* Room Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-[#747878] absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Type Room Number (e.g. 101, 102, 501)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#F5F2ED] bg-[#FDFBF7] text-xs font-mono font-bold text-[#181919] focus:outline-none focus:border-[#181919]"
          />
        </div>
      </div>

      {/* Quick Room Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs font-mono scrollbar-none">
        <span className="text-[#747878] shrink-0 font-semibold px-1">Quick Select:</span>
        {['101', '102', '103', '201', '301', '501', '502', '601'].map((rm) => (
          <button
            key={rm}
            onClick={() => setSearchQuery(rm)}
            className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
              roomNumber === rm
                ? 'bg-[#181919] text-white font-bold border-[#181919]'
                : 'bg-white text-[#181919] border-[#F5F2ED] hover:bg-[#F5F3F3]'
            }`}
          >
            Room {rm}
          </button>
        ))}
      </div>

      {currentRoom && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Scannable QR Code & WhatsApp Share */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-[#F5F2ED] shadow-subtle flex flex-col items-center text-center space-y-4">
              <QRCodeSVG value={submissionUrl} size={190} />

              <div>
                <h3 className="font-bold text-base text-[#181919]">
                  ROOM {currentRoom.roomNumber} QR CODE
                </h3>
                <p className="text-xs text-[#747878] font-mono mt-0.5">
                  {currentRoom.floorName} • {currentRoom.sharingCapacity} Sharing
                </p>
              </div>

              <div className="w-full space-y-2 text-xs font-semibold pt-2 border-t border-[#F5F2ED]">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share to WhatsApp</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className={`w-full py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                    copied
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-[#FDFBF7] text-[#181919] border-[#E4E2E2] hover:bg-[#F5F3F3]'
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
                      <span>Copy Scanner Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Room Residents Aadhaar Submissions List */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-[#F5F2ED] shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-3">
                <div>
                  <h2 className="font-bold text-lg text-[#181919]">
                    Room {currentRoom.roomNumber} Submissions & Aadhaar Copies
                  </h2>
                  <p className="text-xs text-[#747878] font-mono">
                    All residents in Room {currentRoom.roomNumber} and their submitted documents
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-[#F2F7EE] text-[#536347] border border-[#D4E6C2] font-mono text-xs font-bold">
                  {currentRoom.beds.filter((b) => {
                    const r = b.residentId ? getResidentById(b.residentId) : null;
                    return r && r.aadhaarDocumentUrl;
                  }).length} / {currentRoom.beds.filter((b) => b.status === 'OCCUPIED').length} Uploaded
                </div>
              </div>

              <div className="space-y-3">
                {currentRoom.beds.map((bed) => {
                  const resident = bed.residentId ? getResidentById(bed.residentId) : null;
                  const remoteSub = remoteSubmissions.find(
                    (s) =>
                      s.roomNumber === currentRoom.roomNumber &&
                      (s.bedId === bed.id || (resident && (s.residentId === resident.id || s.residentName.trim().toLowerCase() === resident.fullName.trim().toLowerCase())))
                  );

                  const aadhaarDocUrl = resident?.aadhaarDocumentUrl || remoteSub?.aadhaarDocumentUrl;
                  const residentPhotoUrl = resident?.photoUrl || remoteSub?.photoUrl;
                  const aadhaarNum = resident?.aadhaarNumber || remoteSub?.aadhaarNumber;
                  const resName = resident ? resident.fullName : (remoteSub ? remoteSub.residentName : 'Bed Empty');
                  const resPhone = resident ? resident.phone : (remoteSub ? remoteSub.phone : 'Unassigned Bed');
                  const hasAadhaarDoc = Boolean(aadhaarDocUrl);

                  return (
                    <div
                      key={bed.id}
                      className="p-4 rounded-xl bg-[#FDFBF7] border border-[#F5F2ED] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {residentPhotoUrl ? (
                            <img src={residentPhotoUrl} alt={resName} className="w-9 h-9 rounded-xl object-cover border border-[#181919]" />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-[#181919] text-white font-mono font-bold text-xs flex items-center justify-center">
                              B{bed.bedNumber}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-[#181919]">
                              {resName}
                            </h4>
                            <p className="text-xs text-[#747878] font-mono">
                              Phone: {resPhone}
                            </p>
                          </div>
                        </div>

                        {bed.status === 'OCCUPIED' || remoteSub ? (
                          hasAadhaarDoc ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Uploaded ✓</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-mono font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Pending ⏳</span>
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-[#747878] font-mono">Empty Bed</span>
                        )}
                      </div>

                      {/* Resident Aadhaar & Photo Details Card */}
                      {(resident || remoteSub) && (
                        <div className="pt-3 border-t border-[#F5F2ED] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2.5 rounded-lg bg-white border border-[#F5F2ED] flex items-center justify-between">
                            <span className="text-[#747878]">Aadhaar No:</span>
                            <span className="font-bold text-[#181919]">
                              {aadhaarNum || 'Not provided'}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-[#F5F2ED] flex items-center justify-between">
                            <span className="text-[#747878]">Aadhaar Document:</span>
                            {hasAadhaarDoc ? (
                              <a
                                href={aadhaarDocUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 hover:underline font-bold flex items-center gap-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>View Document ↗</span>
                              </a>
                            ) : (
                              <span className="text-amber-700">Not Uploaded</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
