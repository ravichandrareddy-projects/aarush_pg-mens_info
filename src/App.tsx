import React, { useState, useEffect } from 'react';
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

const tabTitles: Record<NavTab, string> = {
  dashboard: 'Dashboard',
  floors: 'Floors & Rooms',
  residents: 'Residents Directory',
  'empty-beds': 'Empty Beds Explorer',
  payments: 'Payments & Revenue',
  reports: 'Analytics & Reports',
  settings: 'Settings'
};

const MainAppContent: React.FC = () => {
  const { theme } = usePG();

  // App Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [loadingTabTitle, setLoadingTabTitle] = useState('Dashboard');

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Controlled Floors & Rooms drill-down state for back navigation
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Tab change handler with 2 seconds screen transition loader
  const handleSetActiveTab = (newTab: NavTab) => {
    if (newTab !== activeTab) {
      setLoadingTabTitle(tabTitles[newTab] || 'Screen');
      setIsTabLoading(true);
      setActiveTab(newTab);
      setTimeout(() => {
        setIsTabLoading(false);
      }, 2000);
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

  // Android Hardware Back Button & Browser PopState Navigation Handler
  useEffect(() => {
    window.history.pushState({ appState: true }, '');

    const handleBack = (): boolean => {
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

      // 2. Room Detail (e.g. 101) -> Floor Rooms List (e.g. 1st Floor) -> All Floors
      if (activeTab === 'floors') {
        if (selectedRoomId !== null) {
          setSelectedRoomId(null);
          return true;
        }
        if (selectedFloorId !== null) {
          setSelectedFloorId(null);
          return true;
        }
        // If at top of floors view, return to Home screen
        setActiveTab('dashboard');
        return true;
      }

      // 3. Any non-dashboard tab -> return to Home Screen (Dashboard)
      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
        return true;
      }

      // 4. On Home screen with no modals or drilldowns open -> exit/minimize app
      return false;
    };

    const backListener = CapApp.addListener('backButton', () => {
      const handled = handleBack();
      if (!handled) {
        CapApp.exitApp();
      }
    });

    const handlePopState = () => {
      const handled = handleBack();
      if (handled) {
        window.history.pushState({ appState: true }, '');
      }
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
    selectedRoomId
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

export default function App() {
  return (
    <PGProvider>
      <MainAppContent />
    </PGProvider>
  );
}
