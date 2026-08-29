import React from 'react';
import {
  LayoutDashboard,
  Grid,
  Users,
  BedDouble,
  CreditCard,
  BarChart3,
  Settings,
  PlusCircle,
  Building2,
  Sparkles
} from 'lucide-react';
import { usePG } from '../../context/PGContext';

export type NavTab = 'dashboard' | 'floors' | 'residents' | 'empty-beds' | 'payments' | 'reports' | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAddResident: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenAddResident }) => {
  const { stats, theme, setTheme } = usePG();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'floors' as NavTab, label: 'Floors & Rooms', icon: Grid },
    { id: 'residents' as NavTab, label: 'Residents', icon: Users, badge: stats.occupiedBeds },
    { id: 'empty-beds' as NavTab, label: 'Empty Beds', icon: BedDouble, badge: stats.emptyBeds, badgeVariant: 'olive' },
    { id: 'payments' as NavTab, label: 'Payments', icon: CreditCard, badge: stats.pendingResidents > 0 ? stats.pendingResidents : undefined, badgeVariant: 'pending' },
    { id: 'reports' as NavTab, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`hidden md:flex flex-col w-64 min-h-screen border-r transition-colors ${
      theme === 'atelier' ? 'bg-[#FDFBF7] border-[#F5F2ED]' : 'bg-white border-[#E4E2E2]'
    }`}>
      {/* Brand Header */}
      <div className="p-6 border-b border-inherit flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Aarush PG Logo" className="w-10 h-10 rounded-lg object-cover border border-black/10 shadow-subtle" />
          <div>
            <h1 className="font-semibold text-base tracking-tight text-[#181919]">
              {theme === 'atelier' ? 'Aarush Mens Luxury PG' : 'Aarush Executive'}
            </h1>
            <p className="text-[11px] font-mono tracking-widest text-[#747878] uppercase">AARUSH LUXURY PG SYSTEM</p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={onOpenAddResident}
          className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            theme === 'atelier'
              ? 'bg-[#181919] text-white hover:bg-[#2D2D2D]'
              : 'bg-[#536347] text-white hover:bg-[#3C4B31] shadow-sm'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Resident</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? theme === 'atelier'
                    ? 'bg-[#181919] text-white shadow-subtle'
                    : 'bg-[#D4E6C2] text-[#121F09] font-semibold'
                  : theme === 'atelier'
                  ? 'text-[#181919] hover:bg-[#F3F0EA]'
                  : 'text-[#444748] hover:bg-[#F5F3F3]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? (theme === 'atelier' ? 'text-white' : 'text-[#3C4B31]') : 'text-[#747878]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive
                      ? theme === 'atelier'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#3C4B31] text-white'
                      : item.badgeVariant === 'olive'
                      ? 'bg-[#F2F7EE] text-[#536347] border border-[#D4E6C2]'
                      : item.badgeVariant === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#E4E2E2] text-[#444748]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Switcher & Stats Footer */}
      <div className="p-4 border-t border-inherit space-y-3">
        {/* Live System Capacity indicator */}
        <div className="p-3 rounded-lg bg-[#F5F3F3]/80 border border-black/5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#747878] font-medium">Occupancy</span>
            <span className="font-mono font-semibold text-[#181919]">{stats.occupancyPercentage}% ({stats.occupiedBeds}/240)</span>
          </div>
          <div className="w-full bg-[#E4E2E2] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#536347] h-full transition-all duration-300"
              style={{ width: `${stats.occupancyPercentage}%` }}
            />
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(theme === 'atelier' ? 'vision' : 'atelier')}
          className="w-full py-2 px-3 rounded-lg border border-black/10 text-xs font-medium flex items-center justify-between text-[#444748] hover:bg-black/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#536347]" />
            <span>Theme: {theme === 'atelier' ? 'Atelier Warm' : 'Vision SaaS'}</span>
          </div>
          <span className="text-[10px] font-mono bg-black/5 px-1.5 py-0.5 rounded">Switch</span>
        </button>
      </div>
    </aside>
  );
};
