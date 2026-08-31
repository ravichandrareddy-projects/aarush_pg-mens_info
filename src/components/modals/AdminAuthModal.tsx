import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, Building2, RefreshCw } from 'lucide-react';
import { verifyAdminPin, setAdminSession } from '../../utils/securityUtils';
import { triggerGlobalHardReset } from '../../lib/supabaseStorage';

interface AdminAuthModalProps {
  isOpen: boolean;
  onAuthenticated: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pin)) {
      setAdminSession(true);
      setError(false);
      onAuthenticated();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleHardResetAll = async () => {
    if (window.confirm('⚡ Are you sure you want to perform a HARD RESET across ALL open screens and devices? This will lock all open sessions.')) {
      setIsResetting(true);
      await triggerGlobalHardReset();
      setAdminSession(false);
      setPin('');
      setIsResetting(false);
      alert('🔒 Global Hard Reset triggered! All open screens across devices have been locked.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 selection:bg-none animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#F5F2ED] shadow-floating overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#F5F2ED] bg-[#FDFBF7] text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#181919] text-white flex items-center justify-center mx-auto shadow-subtle mb-1">
            <ShieldCheck className="w-6 h-6 text-[#A8C393]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181919] text-white text-[10px] font-mono uppercase">
            <Building2 className="w-3 h-3 text-[#A8C393]" />
            <span>Admin Authentication</span>
          </div>
          <h2 className="text-xl font-bold text-[#181919] tracking-tight">
            Aarush Mens PG Secure Portal
          </h2>
          <p className="text-xs text-[#747878] font-mono">
            Enter Admin Security PIN to access resident records and dashboard.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-[#747878] mb-1.5">
              Enter Admin Security PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#747878] absolute left-3.5 top-3.5" />
              <input
                type="password"
                maxLength={8}
                placeholder="Enter Admin PIN (Default: 1234)"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                autoFocus
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#F5F2ED] bg-[#FDFBF7] text-sm font-mono font-bold text-[#181919] focus:outline-none focus:border-[#181919] tracking-widest"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-mono text-red-700 flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Incorrect Admin PIN. Please try again.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#181919] text-white font-bold text-xs hover:bg-black transition-all flex items-center justify-center gap-2 shadow-subtle cursor-pointer"
          >
            <span>Unlock Admin Access</span>
            <ArrowRight className="w-4 h-4 text-[#A8C393]" />
          </button>
        </form>

        <div className="p-4 bg-[#FDFBF7] border-t border-[#F5F2ED] flex items-center justify-between text-[10px] text-[#747878] font-mono">
          <span>🔒 256-bit RLS Protected</span>
          <button
            type="button"
            onClick={handleHardResetAll}
            disabled={isResetting}
            className="px-2.5 py-1 rounded bg-red-50 text-red-700 font-bold border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>⚡ Hard Reset All Screens</span>
          </button>
        </div>
      </div>
    </div>
  );
};
