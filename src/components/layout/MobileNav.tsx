import {
  Home,
  Grid,
  Users,
  BedDouble,
  MoreHorizontal,
  CreditCard,
  BarChart3,
  Settings,
  X,
  Plus,
  QrCode
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { usePG } from '../../context/PGContext';

interface MobileNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAddResident: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, onOpenAddResident }) => {
  const { stats, theme } = usePG();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Options Drawer Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs md:hidden" onClick={() => setShowMoreMenu(false)}>
          <div
            className="absolute bottom-20 left-0 right-0 bg-white rounded-t-2xl p-5 space-y-3 shadow-floating border-t border-[#F5F2ED]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F2ED]">
              <h3 className="font-semibold text-base text-[#181919]">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-[#747878] hover:bg-[#F5F3F3]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={() => handleNavClick('qr-scanner')}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 border text-center transition-all ${
                  activeTab === 'qr-scanner' ? 'bg-[#181919] text-white border-[#181919]' : 'bg-[#FDFBF7] border-[#F5F2ED]'
                }`}
              >
                <QrCode className="w-5 h-5 text-[#536347]" />
                <span className="text-xs font-bold">QR Collector</span>
              </button>

              <button
                onClick={() => handleNavClick('payments')}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 border text-center transition-all ${
                  activeTab === 'payments' ? 'bg-[#D4E6C2] border-[#536347] text-[#121F09]' : 'bg-[#FDFBF7] border-[#F5F2ED]'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#536347]" />
                <span className="text-xs font-medium">Payments</span>
              </button>

              <button
                onClick={() => handleNavClick('reports')}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 border text-center transition-all ${
                  activeTab === 'reports' ? 'bg-[#D4E6C2] border-[#536347] text-[#121F09]' : 'bg-[#FDFBF7] border-[#F5F2ED]'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-[#536347]" />
                <span className="text-xs font-medium">Reports</span>
              </button>

              <button
                onClick={() => handleNavClick('settings')}
                className={`p-3 rounded-xl flex flex-col items-center gap-2 border text-center transition-all ${
                  activeTab === 'settings' ? 'bg-[#D4E6C2] border-[#536347] text-[#121F09]' : 'bg-[#FDFBF7] border-[#F5F2ED]'
                }`}
              >
                <Settings className="w-5 h-5 text-[#536347]" />
                <span className="text-xs font-medium">Settings</span>
              </button>
            </div>

            {/* Floating Quick Add Button inside drawer */}
            <button
              onClick={() => {
                setShowMoreMenu(false);
                onOpenAddResident();
              }}
              className="w-full mt-3 py-3 px-4 rounded-xl bg-[#181919] text-white font-medium text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Resident</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-20 border-t pb-safe flex justify-around items-center px-2 transition-colors ${
        theme === 'atelier' ? 'bg-[#FDFBF7] border-[#F5F2ED]' : 'bg-white border-[#E4E2E2]'
      }`}>
        {/* Home */}
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
            activeTab === 'dashboard'
              ? 'bg-[#D4E6C2] text-[#121F09] font-medium scale-105'
              : 'text-[#444748] hover:text-[#181919]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-wider">Home</span>
        </button>

        {/* Rooms */}
        <button
          onClick={() => handleNavClick('floors')}
          className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
            activeTab === 'floors'
              ? 'bg-[#D4E6C2] text-[#121F09] font-medium scale-105'
              : 'text-[#444748] hover:text-[#181919]'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-wider">Rooms</span>
        </button>

        {/* Residents */}
        <button
          onClick={() => handleNavClick('residents')}
          className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all relative ${
            activeTab === 'residents'
              ? 'bg-[#D4E6C2] text-[#121F09] font-medium scale-105'
              : 'text-[#444748] hover:text-[#181919]'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-wider">Residents</span>
          {stats.occupiedBeds > 0 && (
            <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#536347]" />
          )}
        </button>

        {/* Empty */}
        <button
          onClick={() => handleNavClick('empty-beds')}
          className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
            activeTab === 'empty-beds'
              ? 'bg-[#D4E6C2] text-[#121F09] font-medium scale-105'
              : 'text-[#444748] hover:text-[#181919]'
          }`}
        >
          <BedDouble className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-wider">Empty</span>
        </button>

        {/* More */}
        <button
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center justify-center w-16 py-1.5 rounded-xl transition-all ${
            ['payments', 'reports', 'settings'].includes(activeTab) || showMoreMenu
              ? 'bg-[#D4E6C2] text-[#121F09] font-medium scale-105'
              : 'text-[#444748] hover:text-[#181919]'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-mono tracking-wider">More</span>
        </button>
      </nav>
    </>
  );
};
