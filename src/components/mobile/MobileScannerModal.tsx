import React, { useState } from 'react';
import { Camera, X, Check, RefreshCw, FileText, Image as ImageIcon } from 'lucide-react';

interface MobileScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photoUrl: string, docName: string) => void;
}

export const MobileScannerModal: React.FC<MobileScannerModalProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const [activeTab, setActiveTab] = useState<'PHOTO' | 'AADHAAR'>('PHOTO');
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedSample, setCapturedSample] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTakeSnap = () => {
    setIsCaptured(true);
    // Generated realistic SVG data URI avatar/doc for camera capture simulation
    if (activeTab === 'PHOTO') {
      setCapturedSample('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
    } else {
      setCapturedSample('aadhaar_card_scanned_doc.pdf');
    }
  };

  const handleUseSnap = () => {
    onCapture(
      capturedSample || 'photo_snap.jpg',
      activeTab === 'AADHAAR' ? 'scanned_aadhaar.pdf' : 'resident_photo.jpg'
    );
    setIsCaptured(false);
    setCapturedSample(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-between p-4 text-white">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#D4E6C2]" />
          <span className="font-semibold text-sm">Mobile Scanner</span>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex justify-center gap-2 py-2">
        <button
          onClick={() => {
            setActiveTab('PHOTO');
            setIsCaptured(false);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
            activeTab === 'PHOTO' ? 'bg-[#536347] text-white' : 'bg-white/10 text-white/70'
          }`}
        >
          Resident Photo
        </button>
        <button
          onClick={() => {
            setActiveTab('AADHAAR');
            setIsCaptured(false);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
            activeTab === 'AADHAAR' ? 'bg-[#536347] text-white' : 'bg-white/10 text-white/70'
          }`}
        >
          Aadhaar Card Document
        </button>
      </div>

      {/* Camera Viewfinder Box */}
      <div className="flex-1 my-4 border-2 border-dashed border-[#D4E6C2]/60 rounded-2xl relative overflow-hidden bg-black/40 flex items-center justify-center">
        {isCaptured ? (
          <div className="text-center p-4">
            <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-[#536347] flex items-center justify-center text-white">
              {activeTab === 'PHOTO' ? <ImageIcon className="w-10 h-10" /> : <FileText className="w-10 h-10" />}
            </div>
            <p className="text-sm font-semibold text-emerald-400 mb-1">Captured Successfully!</p>
            <p className="text-xs text-white/70 font-mono">Ready to attach to resident onboarding</p>
          </div>
        ) : (
          <div className="text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto animate-pulse">
              <Camera className="w-8 h-8 text-[#D4E6C2]" />
            </div>
            <p className="text-xs text-white/80 font-mono">
              Position {activeTab === 'PHOTO' ? "Resident's face" : 'Aadhaar Card'} within frame
            </p>
          </div>
        )}
      </div>

      {/* Camera Shutter Actions */}
      <div className="pb-6 pt-2 flex items-center justify-center gap-6">
        {isCaptured ? (
          <>
            <button
              onClick={() => setIsCaptured(false)}
              className="py-3 px-6 rounded-full bg-white/10 text-white text-xs font-medium flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake</span>
            </button>
            <button
              onClick={handleUseSnap}
              className="py-3 px-6 rounded-full bg-[#536347] text-white text-xs font-semibold flex items-center gap-2 shadow-floating"
            >
              <Check className="w-4 h-4" />
              <span>Attach Photo/Doc</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleTakeSnap}
            className="w-16 h-16 rounded-full bg-white text-[#181919] flex items-center justify-center shadow-floating active:scale-95 transition-transform border-4 border-[#D4E6C2]"
          >
            <div className="w-12 h-12 rounded-full bg-[#181919]" />
          </button>
        )}
      </div>
    </div>
  );
};
