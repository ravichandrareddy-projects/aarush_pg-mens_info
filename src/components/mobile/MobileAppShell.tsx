import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Home,
  Grid,
  Users,
  BedDouble,
  MoreHorizontal,
  Smartphone,
  Monitor
} from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { NavTab } from '../layout/Sidebar';
import { MobileScannerModal } from './MobileScannerModal';

interface MobileAppShellProps {
  children: React.ReactNode;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
  onOpenAddResident: () => void;
}

export const MobileAppShell: React.FC<MobileAppShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenAddResident
}) => {
  const { stats, theme } = usePG();
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col items-center transition-colors ${
      theme === 'atelier' ? 'bg-[#F5F2ED]' : 'bg-[#E4E2E2]'
    }`}>
      {/* Device Mode Switcher Top Ribbon */}
      <div className="w-full bg-[#181919] text-white py-2 px-4 flex items-center justify-between text-xs font-mono border-b border-white/10 z-50">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#D4E6C2]" />
          <span className="font-semibold text-white">Aarush PG Mobile App</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] flex items-center gap-1.5 transition-colors"
          >
            {deviceFrameMode ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Full Web View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#D4E6C2]" />
                <span>Smartphone Mockup</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container Wrapper (Optionally framed inside Smartphone device preview) */}
      <div
        className={`w-full flex-1 flex flex-col transition-all duration-300 ${
          deviceFrameMode
            ? 'max-w-[410px] my-6 rounded-[48px] border-[12px] border-[#181919] shadow-floating overflow-hidden relative min-h-[820px] bg-[#FDFBF7]'
            : 'max-w-md bg-[#FDFBF7] min-h-screen shadow-subtle'
        }`}
      >
        {/* Native Mobile Top Bar (Visual Reference Image 1) */}
        <header className="sticky top-0 z-40 bg-[#FDFBF7] border-b border-[#F5F2ED] px-4 h-16 flex items-center justify-between shadow-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#181919] text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-[#181919] tracking-tight">
                Aarush Mens Luxury PG
              </h1>
              <p className="text-[10px] font-mono text-[#747878] uppercase">
                {stats.emptyBeds} Beds Vacant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-full text-[#181919] hover:bg-[#F5F3F3] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="p-2 rounded-full bg-[#F2F7EE] text-[#536347] hover:bg-[#D4E6C2] transition-colors"
              title="Camera Document Scanner"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile Main Screen Content */}
        <main className="flex-1 px-4 py-4 pb-24">{children}</main>

        {/* Mobile Bottom Navigation Bar (Visual Reference Image 1) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 h-20 bg-[#FDFBF7] border-t border-[#F5F2ED] flex justify-around items-center px-2 pb-safe max-w-md mx-auto">
          {/* Home */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#D4E6C2] text-[#121F09] font-semibold scale-105'
                : 'text-[#747878] hover:text-[#181919]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider">Home</span>
          </button>

          {/* Rooms */}
          <button
            onClick={() => setActiveTab('floors')}
            className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
              activeTab === 'floors'
                ? 'bg-[#D4E6C2] text-[#121F09] font-semibold scale-105'
                : 'text-[#747878] hover:text-[#181919]'
            }`}
          >
            <Grid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider">Rooms</span>
          </button>

          {/* Floating Add Resident CTA */}
          <button
            onClick={onOpenAddResident}
            className="w-12 h-12 rounded-full bg-[#181919] text-white flex items-center justify-center shadow-floating active:scale-95 transition-transform -mt-5 border-2 border-white"
            title="Add Resident"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Residents */}
          <button
            onClick={() => setActiveTab('residents')}
            className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
              activeTab === 'residents'
                ? 'bg-[#D4E6C2] text-[#121F09] font-semibold scale-105'
                : 'text-[#747878] hover:text-[#181919]'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider">Residents</span>
          </button>

          {/* Empty */}
          <button
            onClick={() => setActiveTab('empty-beds')}
            className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
              activeTab === 'empty-beds'
                ? 'bg-[#D4E6C2] text-[#121F09] font-semibold scale-105'
                : 'text-[#747878] hover:text-[#181919]'
            }`}
          >
            <BedDouble className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-mono tracking-wider">Empty</span>
          </button>
        </nav>

        {/* Mobile Camera Scanner Modal */}
        <MobileScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onCapture={(photoUrl, docName) => {
            onOpenAddResident();
          }}
        />
      </div>
    </div>
  );
};
