import React, { useState, useEffect, useRef } from 'react';
import { PGProvider, usePG } from './context/PGContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Header } from './components/layout/Header';

import { DashboardView } from './components/views/DashboardView';
import { FloorsRoomsView } from './components/views/FloorsRoomsView';
import { ResidentsView } from './components/views/ResidentsView';
import { EmptyBedsView } from './components/views/EmptyBedsView';
import { PaymentsView } from './components/views/PaymentsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

import { App as CapApp } from '@capacitor/app';

import { AddResidentModal } from './components/modals/AddResidentModal';
import { ResidentProfileModal } from './components/modals/ResidentProfileModal';
import { MoveResidentModal } from './components/modals/MoveResidentModal';
import { MarkLeftModal } from './components/modals/MarkLeftModal';
import { RecordPaymentModal } from './components/modals/RecordPaymentModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';

import { InitialSplashScreen, ScreenTransitionLoader } from './components/layout/LoadingScreens';
import { ResidentSubmissionView } from './components/views/ResidentSubmissionView';
import { QRScannerCollectorView } from './components/views/QRScannerCollectorView';
import { AdminAuthModal } from './components/modals/AdminAuthModal';
import { isAdminSessionActive, setAdminSession, resolveRoomNumberFromToken } from './utils/securityUtils';
import { useSecurityDeterrents } from './hooks/useSecurityDeterrents';
import { getGlobalResetTimestamp } from './lib/supabaseStorage';

const tabTitles: Record<NavTab, string> = {
  dashboard: 'Dashboard',
  floors: 'Floors & Rooms',
  residents: 'Residents Directory',
  'empty-beds': 'Empty Beds Explorer',
  payments: 'Payments & Revenue',
  'qr-scanner': 'QR Aadhaar Collector',
  reports: 'Analytics & Reports',
  settings: 'Settings'
};

const MainAppContent: React.FC = () => {
  const { theme } = usePG();

  // URL Query param check for resident QR self-submission
  const searchParams = new URLSearchParams(window.location.search);
  const rawRoomParam = searchParams.get('collectRoomToken') || searchParams.get('collectRoom') || searchParams.get('token') || searchParams.get('room');
  const collectRoomParam = resolveRoomNumberFromToken(rawRoomParam || '');

  // Admin Auth Session State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => isAdminSessionActive());
  const { isDevToolsOpen, showDeniedToast } = useSecurityDeterrents(isAdminAuthenticated);
  const [sessionStartTime] = useState<number>(() => Date.now());

  // Listen to Global Emergency Hard Reset from Supabase (Resets ALL open screens across all devices)
  useEffect(() => {
    const checkReset = async () => {
      const resetTs = await getGlobalResetTimestamp();
      if (resetTs && resetTs > sessionStartTime) {
        setAdminSession(false);
        setIsAdminAuthenticated(false);
      }
    };
    checkReset();
    const interval = setInterval(checkReset, 3000);
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // App Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [loadingTabTitle, setLoadingTabTitle] = useState('Dashboard');

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Controlled Floors & Rooms drill-down state for back navigation
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Tab change handler with 1 second screen transition loader
  const handleSetActiveTab = (newTab: NavTab) => {
    if (newTab !== activeTab) {
      setLoadingTabTitle(tabTitles[newTab] || 'Screen');
      setIsTabLoading(true);
      setActiveTab(newTab);
      setTimeout(() => {
        setIsTabLoading(false);
      }, 1000);
    }
  };

  // Modals state
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const [addResidentPreselect, setAddResidentPreselect] = useState<{
    floorId?: string;
    roomId?: string;
    bedId?: string;
  }>({});

  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null);
  const [moveResidentId, setMoveResidentId] = useState<string | null>(null);
  const [markLeftResidentId, setMarkLeftResidentId] = useState<string | null>(null);

  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [recordPaymentResidentId, setRecordPaymentResidentId] = useState<string | undefined>();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Track if current state change was triggered by back navigation
  const isBackActionRef = useRef(false);

  // Push history state whenever navigating deeper (without loop)
  useEffect(() => {
    if (isBackActionRef.current) {
      isBackActionRef.current = false;
      return;
    }

    const isDeep =
      isSearchOpen ||
      Boolean(selectedResidentId) ||
      Boolean(moveResidentId) ||
      Boolean(markLeftResidentId) ||
      isRecordPaymentOpen ||
      isAddResidentOpen ||
      selectedRoomId !== null ||
      selectedFloorId !== null ||
      activeTab !== 'dashboard';

    if (isDeep) {
      window.history.pushState({ appNavStep: true }, '');
    }
  }, [
    activeTab,
    selectedFloorId,
    selectedRoomId,
    isSearchOpen,
    selectedResidentId,
    moveResidentId,
    markLeftResidentId,
    isRecordPaymentOpen,
    isAddResidentOpen
  ]);

  // Android Hardware Back Button & Browser PopState Navigation Handler
  useEffect(() => {
    const handleBackStep = (): boolean => {
      isBackActionRef.current = true;

      // 1. Close Open Modals
      if (isSearchOpen) {
        setIsSearchOpen(false);
        return true;
      }
      if (selectedResidentId) {
        setSelectedResidentId(null);
        return true;
      }
      if (moveResidentId) {
        setMoveResidentId(null);
        return true;
      }
      if (markLeftResidentId) {
        setMarkLeftResidentId(null);
        return true;
      }
      if (isRecordPaymentOpen) {
        setIsRecordPaymentOpen(false);
        return true;
      }
      if (isAddResidentOpen) {
        setIsAddResidentOpen(false);
        return true;
      }

      // 2. Room Detail -> Floor Rooms List
      if (activeTab === 'floors' && selectedRoomId !== null) {
        setSelectedRoomId(null);
        return true;
      }

      // 3. Floor Rooms List -> All Floors Grid
      if (activeTab === 'floors' && selectedFloorId !== null) {
        setSelectedFloorId(null);
        return true;
      }

      // 4. Any tab other than Home Screen -> Return to Home Screen
      if (activeTab !== 'dashboard') {
        handleSetActiveTab('dashboard');
        return true;
      }

      isBackActionRef.current = false;
      return false;
    };

    const backListener = CapApp.addListener('backButton', () => {
      const handled = handleBackStep();
      if (!handled) {
        CapApp.exitApp();
      }
    });

    const handlePopState = (e: PopStateEvent) => {
      handleBackStep();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      backListener.then((h) => h.remove());
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    isSearchOpen,
    selectedResidentId,
    moveResidentId,
    markLeftResidentId,
    isRecordPaymentOpen,
    isAddResidentOpen,
    activeTab,
    selectedFloorId,
    selectedRoomId,
    handleSetActiveTab
  ]);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAddResident = () => {
    setAddResidentPreselect({});
    setIsAddResidentOpen(true);
  };

  const handleOpenAddResidentForBed = (floorId: string, roomId: string, bedId: string) => {
    setAddResidentPreselect({ floorId, roomId, bedId });
    setIsAddResidentOpen(true);
  };

  const handleOpenRecordPayment = (resId?: string) => {
    setRecordPaymentResidentId(resId);
    setIsRecordPaymentOpen(true);
  };

  if (collectRoomParam) {
    return (
      <ResidentSubmissionView
        roomNumber={collectRoomParam}
        onFinished={() => {
          window.location.href = window.location.pathname;
        }}
      />
    );
  }

  if (isInitialLoading) {
    return <InitialSplashScreen onFinish={() => setIsInitialLoading(false)} />;
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${
      theme === 'atelier' ? 'bg-[#FDFBF7] text-[#181919]' : 'bg-[#F8F9FA] text-[#181919]'
    }`}>
      {/* Desktop Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onOpenAddResident={handleOpenAddResident}
      />

      {/* Right Main Application Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAddResident={handleOpenAddResident}
          onOpenQRScanner={() => handleSetActiveTab('qr-scanner')}
          onAdminLogout={() => {
            setAdminSession(false);
            setIsAdminAuthenticated(false);
          }}
        />

        {/* Content Canvas */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {isTabLoading ? (
            <ScreenTransitionLoader screenTitle={loadingTabTitle} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenAddResident={handleOpenAddResident}
                  setActiveTab={handleSetActiveTab}
                />
              )}

              {activeTab === 'floors' && (
                <FloorsRoomsView
                  onOpenAddResidentForBed={handleOpenAddResidentForBed}
                  onViewResident={(resId) => setSelectedResidentId(resId)}
                  selectedFloorId={selectedFloorId}
                  setSelectedFloorId={setSelectedFloorId}
                  selectedRoomId={selectedRoomId}
                  setSelectedRoomId={setSelectedRoomId}
                />
              )}

              {activeTab === 'residents' && (
                <ResidentsView
                  onOpenAddResident={handleOpenAddResident}
                  onSelectResident={(resId) => setSelectedResidentId(resId)}
                />
              )}

              {activeTab === 'empty-beds' && (
                <EmptyBedsView
                  onOpenAddResidentForBed={handleOpenAddResidentForBed}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentsView
                  onOpenRecordPayment={handleOpenRecordPayment}
                  onViewResident={(resId) => setSelectedResidentId(resId)}
                />
              )}

              {activeTab === 'qr-scanner' && <QRScannerCollectorView />}

              {activeTab === 'reports' && <ReportsView />}

              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed on mobile < 768px) */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onOpenAddResident={handleOpenAddResident}
      />

      {/* Access Denied Warning Toast */}
      {showDeniedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] bg-[#181919] text-white px-5 py-3 rounded-2xl shadow-floating border border-red-500/50 flex items-center gap-3 animate-bounce select-none">
          <span className="text-2xl">🖕</span>
          <div>
            <div className="font-bold text-xs text-red-400 font-mono tracking-wider">ACCESS DENIED!</div>
            <div className="text-[10px] font-mono text-gray-300">Developer Tools & Code Inspect are permanently blocked for Resident Privacy.</div>
          </div>
        </div>
      )}

      {/* Admin Authentication Guard Modal */}
      <AdminAuthModal
        isOpen={!isAdminAuthenticated && !collectRoomParam}
        onAuthenticated={() => setIsAdminAuthenticated(true)}
      />

      {/* Application Modals */}
      <AddResidentModal
        isOpen={isAddResidentOpen}
        onClose={() => setIsAddResidentOpen(false)}
        initialFloorId={addResidentPreselect.floorId}
        initialRoomId={addResidentPreselect.roomId}
        initialBedId={addResidentPreselect.bedId}
      />

      <ResidentProfileModal
        residentId={selectedResidentId}
        onClose={() => setSelectedResidentId(null)}
        onOpenMoveModal={(id) => setMoveResidentId(id)}
        onOpenMarkLeftModal={(id) => setMarkLeftResidentId(id)}
        onOpenRecordPayment={(id) => handleOpenRecordPayment(id)}
      />

      <MoveResidentModal
        residentId={moveResidentId}
        onClose={() => setMoveResidentId(null)}
      />

      <MarkLeftModal
        residentId={markLeftResidentId}
        onClose={() => setMarkLeftResidentId(null)}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        initialResidentId={recordPaymentResidentId}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        setActiveTab={handleSetActiveTab}
        onSelectResident={(id) => setSelectedResidentId(id)}
      />
    </div>
  );
};

function AppWrapper() {
  const { showDeniedToast } = useSecurityDeterrents(true);

  return (
    <>
      {/* Access Denied Warning Toast (Unconditional Root Level) */}
      {showDeniedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] bg-[#181919] text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-red-500 flex items-center gap-3 animate-bounce select-none pointer-events-none">
          <span className="text-2xl">🖕</span>
          <div>
            <div className="font-bold text-xs text-red-400 font-mono tracking-wider uppercase">ACCESS DENIED!</div>
            <div className="text-[10px] font-mono text-gray-200">Developer Tools & Code Inspect are permanently blocked for Resident Privacy.</div>
          </div>
        </div>
      )}
      <MainAppContent />
    </>
  );
}

export default function App() {
  return (
    <PGProvider>
      <AppWrapper />
    </PGProvider>
  );
}
