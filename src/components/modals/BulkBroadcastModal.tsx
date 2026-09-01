import React, { useState, useMemo } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Download,
  Copy,
  Check,
  Filter,
  Users,
  Building2,
  ExternalLink,
  Phone,
  FileSpreadsheet,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { usePG } from '../../context/PGContext';

interface BulkBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGoogleFormUrl?: string;
}

export const BulkBroadcastModal: React.FC<BulkBroadcastModalProps> = ({
  isOpen,
  onClose,
  initialGoogleFormUrl = ''
}) => {
  const { residents, floors } = usePG();

  // Custom Google Form URL state (Saved locally or pre-filled)
  const [googleFormUrl, setGoogleFormUrl] = useState<string>(() => {
    return 'https://docs.google.com/forms/d/e/1FAIpQLSebjFBcSCEg9eNE_88Ni2DZ8NLz3ELdrVmuT0WNq8vIX6_2hg/viewform?usp=publish-editor';
  });

  const [messageTemplate, setMessageTemplate] = useState<string>(() => {
    return `Hi, I am Vamsi. Please fill all the details and add your photo and aadhar photo for police verification. Do it fast and send me completed message.\n\n👉 {FORM_LINK}`;
  });

  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('ALL');
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  // Save changes to localStorage
  const handleSaveFormUrl = (val: string) => {
    setGoogleFormUrl(val);
    localStorage.setItem('aarush_custom_google_form_url', val);
  };

  const handleSaveMsgTemplate = (val: string) => {
    setMessageTemplate(val);
    localStorage.setItem('aarush_custom_broadcast_msg', val);
  };

  // Filter residents based on floor range
  const filteredResidents = useMemo(() => {
    const activeOnly = residents.filter((r) => r.status === 'ACTIVE' && r.phone);

    if (selectedFloorFilter === 'ALL') return activeOnly;
    if (selectedFloorFilter === 'G-4') {
      return activeOnly.filter((r) => {
        const floorNum = r.roomNumber.toUpperCase().startsWith('G')
          ? 0
          : parseInt(r.roomNumber.charAt(0), 10);
        return floorNum >= 0 && floorNum <= 4;
      });
    }
    if (selectedFloorFilter === '5-7') {
      return activeOnly.filter((r) => {
        const floorNum = parseInt(r.roomNumber.charAt(0), 10);
        return floorNum >= 5;
      });
    }

    // Specific floor ID filter
    return activeOnly.filter((r) => r.floorId === selectedFloorFilter || r.roomNumber.startsWith(selectedFloorFilter.replace('floor_', '')));
  }, [residents, selectedFloorFilter]);

  if (!isOpen) return null;

  // Final message with Google Form URL injected
  const getFormattedMessage = (residentName?: string, roomNumber?: string) => {
    let msg = messageTemplate.replace(/{FORM_LINK}/g, googleFormUrl.trim());
    if (residentName) msg = msg.replace(/{NAME}/g, residentName);
    if (roomNumber) msg = msg.replace(/{ROOM}/g, roomNumber);
    return msg;
  };

  // Download VCF Contact File for 1-Click WhatsApp Broadcast
  const handleDownloadVCF = () => {
    let vcfContent = '';
    filteredResidents.forEach((res) => {
      const cleanPhone = res.phone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
      const contactName = `PG R${res.roomNumber} ${res.fullName.trim()}`;

      vcfContent += `BEGIN:VCARD\nVERSION:3.0\nN:${res.fullName};PG R${res.roomNumber};;;\nFN:${contactName}\nTEL;TYPE=CELL:${formattedPhone}\nNOTE:Aarush Mens PG Room ${res.roomNumber}\nEND:VCARD\n`;
    });

    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aarush_PG_Residents_${selectedFloorFilter}_(${filteredResidents.length}).vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download CSV for Bulk WhatsApp / SMS tools
  const handleDownloadCSV = () => {
    let csvContent = 'Room,Bed,Name,Phone,GoogleFormURL\n';
    filteredResidents.forEach((res) => {
      csvContent += `"${res.roomNumber}","${res.bedNumber}","${res.fullName.replace(/"/g, '""')}","${res.phone}","${googleFormUrl}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aarush_PG_PhoneNumbers_${selectedFloorFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy all phone numbers to clipboard (Comma-separated)
  const handleCopyNumbers = () => {
    const phones = filteredResidents.map((r) => r.phone.replace(/[^0-9]/g, '')).join(', ');
    navigator.clipboard.writeText(phones);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getFormattedMessage());
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const sentCount = Object.keys(sentMap).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 border border-[#F5F2ED] shadow-floating overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#F5F2ED] bg-[#FDFBF7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#181919] text-white flex items-center justify-center shadow-subtle">
              <MessageSquare className="w-5 h-5 text-[#A8C393]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#181919] flex items-center gap-2">
                <span>Google Form Bulk WhatsApp Broadcaster</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase font-bold">
                  {filteredResidents.length} Residents
                </span>
              </h2>
              <p className="text-xs text-[#747878] font-mono">
                Admin Mobile: <strong className="text-[#181919]">+91 63028 80134 (Vamsi)</strong> • Send Google Form link to all occupants.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#747878] hover:bg-[#F5F3F3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* STEP 1: GOOGLE FORM LINK & MESSAGE CONFIGURATION */}
          <div className="p-5 rounded-2xl bg-[#FDFBF7] border border-[#F5F2ED] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-3">
              <span className="font-bold text-sm text-[#181919] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#536347]" />
                <span>1. Configure Google Form URL & Broadcast Message</span>
              </span>
              <a
                href={googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-[#536347] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Test Form Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#181919] font-bold mb-1 font-mono uppercase text-[10px]">
                  Paste Your New Google Form URL *
                </label>
                <input
                  type="url"
                  value={googleFormUrl}
                  onChange={(e) => handleSaveFormUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/e/.../viewform"
                  className="w-full p-2.5 rounded-xl border border-[#E4E2E2] bg-white text-[#181919] font-mono text-xs focus:outline-none focus:border-[#181919] shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[#181919] font-bold mb-1 font-mono uppercase text-[10px]">
                  WhatsApp Message Template
                </label>
                <textarea
                  rows={4}
                  value={messageTemplate}
                  onChange={(e) => handleSaveMsgTemplate(e.target.value)}
                  placeholder="Enter broadcast message template..."
                  className="w-full p-3 rounded-xl border border-[#E4E2E2] bg-white text-[#181919] font-sans text-xs focus:outline-none focus:border-[#181919] leading-relaxed shadow-xs"
                />
                <p className="text-[10px] text-[#747878] font-mono mt-1">
                  Tip: Use <code className="bg-[#F5F3F3] px-1 rounded text-[#181919] font-bold">&#123;FORM_LINK&#125;</code> where you want your Google Form link to appear.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: FLOOR FILTERING SELECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-xs text-[#181919] uppercase font-mono">
                2. Select Target Residents / Floor Range
              </label>
              <span className="text-xs font-mono text-[#747878]">
                Selected: <strong>{filteredResidents.length}</strong> / {residents.filter((r) => r.status === 'ACTIVE').length} Total Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <button
                type="button"
                onClick={() => setSelectedFloorFilter('ALL')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedFloorFilter === 'ALL'
                    ? 'border-[#181919] bg-[#181919] text-white shadow-subtle'
                    : 'border-[#F5F2ED] bg-white text-[#747878] hover:border-[#181919]'
                }`}
              >
                <div className="font-bold text-xs">All 192 Residents</div>
                <div className="text-[10px] opacity-80 mt-0.5">Entire PG occupants</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFloorFilter('G-4')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedFloorFilter === 'G-4'
                    ? 'border-[#181919] bg-[#181919] text-white shadow-subtle'
                    : 'border-[#F5F2ED] bg-white text-[#747878] hover:border-[#181919]'
                }`}
              >
                <div className="font-bold text-xs">Ground to 4th Floor</div>
                <div className="text-[10px] opacity-80 mt-0.5">Rooms G01 to 412</div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFloorFilter('5-7')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedFloorFilter === '5-7'
                    ? 'border-[#181919] bg-[#181919] text-white shadow-subtle'
                    : 'border-[#F5F2ED] bg-white text-[#747878] hover:border-[#181919]'
                }`}
              >
                <div className="font-bold text-xs">5th Floor & Above</div>
                <div className="text-[10px] opacity-80 mt-0.5">Rooms 501 to 712</div>
              </button>

              <div className="relative">
                <select
                  value={selectedFloorFilter.startsWith('floor_') ? selectedFloorFilter : ''}
                  onChange={(e) => setSelectedFloorFilter(e.target.value || 'ALL')}
                  className="w-full h-full p-3 rounded-xl border border-[#F5F2ED] bg-white text-[#181919] font-mono text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">Filter Specific Floor...</option>
                  {floors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.rooms ? f.rooms.length : 0} Rms)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: FAST BROADCAST METHODS (3 EFFORTLESS OPTIONS) */}
          <div className="space-y-3">
            <label className="block font-bold text-xs text-[#181919] uppercase font-mono">
              3. Choose Your Bulk Sending Method
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A: VCF Phonebook Import for WhatsApp Broadcast */}
              <div className="p-4 rounded-xl border border-[#D4E6C2] bg-[#F2F7EE] space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[#536347] font-bold text-xs mb-1">
                    <Download className="w-4 h-4" />
                    <span>⚡ Method A: VCF Broadcast File</span>
                  </div>
                  <p className="text-[11px] text-[#536347] leading-relaxed">
                    Downloads contact file. Open it on your phone to import all {filteredResidents.length} contacts into phonebook in 1 second. Then create WhatsApp Broadcast List & send ONCE!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadVCF}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#536347] text-white font-bold font-mono text-xs hover:bg-[#3E4A35] transition-all flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Download className="w-4 h-4" />
                  <span>Download VCF File ({filteredResidents.length})</span>
                </button>
              </div>

              {/* Option B: Copy Message & All Numbers */}
              <div className="p-4 rounded-xl border border-[#F5F2ED] bg-[#FDFBF7] space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[#181919] font-bold text-xs mb-1">
                    <Copy className="w-4 h-4 text-[#747878]" />
                    <span>📋 Method B: Copy Message & Numbers</span>
                  </div>
                  <p className="text-[11px] text-[#747878] leading-relaxed">
                    Copy pre-filled text or copy comma-separated phone numbers directly to send via your mobile phone SMS or WhatsApp Web.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="flex-1 py-2 px-2.5 rounded-lg border border-[#E4E2E2] bg-white text-[#181919] font-bold font-mono text-[11px] hover:bg-[#F5F3F3] transition-colors flex items-center justify-center gap-1"
                  >
                    {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedMessage ? 'Copied!' : 'Copy Msg'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyNumbers}
                    className="flex-1 py-2 px-2.5 rounded-lg border border-[#E4E2E2] bg-white text-[#181919] font-bold font-mono text-[11px] hover:bg-[#F5F3F3] transition-colors flex items-center justify-center gap-1"
                  >
                    {copiedNumbers ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Phone className="w-3.5 h-3.5" />}
                    <span>{copiedNumbers ? 'Copied!' : 'Copy Phones'}</span>
                  </button>
                </div>
              </div>

              {/* Option C: Export CSV for Bulk Software */}
              <div className="p-4 rounded-xl border border-[#F5F2ED] bg-[#FDFBF7] space-y-3 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-2 text-[#181919] font-bold text-xs mb-1">
                    <FileSpreadsheet className="w-4 h-4 text-[#747878]" />
                    <span>📊 Method C: Export Excel / CSV</span>
                  </div>
                  <p className="text-[11px] text-[#747878] leading-relaxed">
                    Download clean Excel/CSV file formatted for WhatsApp bulk tools, SMS gateways, or Google Sheets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="w-full py-2.5 px-3 rounded-lg border border-[#181919] bg-white text-[#181919] font-bold font-mono text-xs hover:bg-[#181919] hover:text-white transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download CSV ({filteredResidents.length})</span>
                </button>
              </div>
            </div>
          </div>

          {/* STEP 4: INTERACTIVE 1-CLICK WHATSAPP QUEUE LIST */}
          <div className="space-y-3 pt-2 border-t border-[#F5F2ED]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-[#181919] uppercase font-mono">
                  4. Direct 1-Click WhatsApp Sender Queue ({sentCount}/{filteredResidents.length} Sent)
                </h3>
                <p className="text-[11px] text-[#747878] font-mono">
                  Tap "Send WhatsApp" next to any resident to immediately launch WhatsApp on phone/web with pre-filled message!
                </p>
              </div>

              {sentCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSentMap({})}
                  className="text-[11px] font-mono text-[#747878] hover:underline"
                >
                  Reset Progress Tracker
                </button>
              )}
            </div>

            {/* Resident Queue List */}
            <div className="border border-[#F5F2ED] rounded-2xl overflow-hidden bg-white max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse font-mono">
                <thead className="bg-[#FDFBF7] text-[#747878] text-[10px] uppercase border-b border-[#F5F2ED] sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Room & Bed</th>
                    <th className="p-3">Resident Name</th>
                    <th className="p-3">Phone Number</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F2ED] text-xs">
                  {filteredResidents.map((res) => {
                    const cleanPhone = res.phone.replace(/[^0-9]/g, '');
                    const isSent = !!sentMap[res.id];
                    const fullMsg = getFormattedMessage(res.fullName, res.roomNumber);
                    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(fullMsg)}`;

                    return (
                      <tr
                        key={res.id}
                        className={`transition-colors ${isSent ? 'bg-emerald-50/40 opacity-70' : 'hover:bg-[#FDFBF7]'}`}
                      >
                        <td className="p-3">
                          <span className="font-bold text-[#181919] bg-[#F5F3F3] px-2 py-0.5 rounded text-[11px]">
                            Room {res.roomNumber} (Bed {res.bedNumber})
                          </span>
                        </td>
                        <td className="p-3 font-sans font-semibold text-[#181919]">{res.fullName}</td>
                        <td className="p-3 text-[#747878]">{res.phone}</td>
                        <td className="p-3 text-right">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setSentMap((prev) => ({ ...prev, [res.id]: true }))}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                              isSent
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSent ? 'Sent ✓' : 'Send WhatsApp'}</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#F5F2ED] bg-[#FDFBF7] flex items-center justify-between">
          <div className="text-[11px] font-mono text-[#747878] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#536347]" />
            <span>Targeting {filteredResidents.length} active residents with Google Form Link</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-[#181919] text-white text-xs font-bold hover:bg-black transition-colors"
          >
            Close Broadcast Center
          </button>
        </div>
      </div>
    </div>
  );
};
