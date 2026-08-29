import React from 'react';
import { Search, Building2, Plus, Sparkles } from 'lucide-react';
import { usePG } from '../../context/PGContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  onOpenSearch: () => void;
  onOpenAddResident: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onOpenSearch, onOpenAddResident }) => {
  const { theme, setTheme, stats } = usePG();

  const titleMap: Record<NavTab, string> = {
    dashboard: 'Dashboard',
    floors: 'Floors & Rooms',
    residents: 'Residents',
    'empty-beds': 'Empty Beds Explorer',
    payments: 'Payments & Revenue',
    reports: 'Analytics & Reports',
    settings: 'Building Settings',
  };

  return (
    <header className={`sticky top-0 z-30 border-b px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors ${
      theme === 'atelier' ? 'bg-[#FDFBF7]/90 backdrop-blur-md border-[#F5F2ED]' : 'bg-white/90 backdrop-blur-md border-[#E4E2E2]'
    }`}>
      {/* Left Title / Mobile Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2">
          <img src="/logo.png" alt="Aarush PG Logo" className="w-8 h-8 rounded-full object-cover border border-black/10 shadow-subtle" />
          <span className="font-mono font-semibold text-xs tracking-wider uppercase text-[#181919]">
            AARUSH LUXURY PG
          </span>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden md:block">
          <h2 className="text-xl font-semibold text-[#181919] tracking-tight">
            {titleMap[activeTab]}
          </h2>
        </div>
      </div>

      {/* Global Search Trigger */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="w-full py-2 px-3.5 rounded-lg border border-[#F5F2ED] bg-white text-left text-sm text-[#747878] flex items-center justify-between hover:border-[#181919] transition-colors shadow-subtle"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#747878]" />
            <span>Search rooms (e.g. 410), residents, beds...</span>
          </div>
          <kbd className="hidden sm:inline-block font-mono text-[10px] bg-[#F5F3F3] text-[#444748] px-1.5 py-0.5 rounded border border-[#E4E2E2]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-full text-[#181919] hover:bg-[#F5F3F3] transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle (Mobile) */}
        <button
          onClick={() => setTheme(theme === 'atelier' ? 'vision' : 'atelier')}
          className="md:hidden p-2 rounded-full text-[#536347] hover:bg-[#F2F7EE] transition-colors"
          title="Switch Demo Theme"
        >
          <Sparkles className="w-5 h-5" />
        </button>

        {/* Occupancy Badge (Desktop Header) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F3F3] border border-[#E4E2E2] text-xs font-medium text-[#444748]">
          <span className="w-2 h-2 rounded-full bg-[#536347]" />
          <span>{stats.emptyBeds} Empty Beds</span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onOpenAddResident}
          className={`py-2 px-3.5 rounded-lg font-medium text-xs md:text-sm flex items-center gap-1.5 transition-all ${
            theme === 'atelier'
              ? 'bg-[#181919] text-white hover:bg-[#2D2D2D]'
              : 'bg-[#536347] text-white hover:bg-[#3C4B31]'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Resident</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
