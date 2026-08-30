import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface InitialSplashScreenProps {
  onFinish: () => void;
}

export const InitialSplashScreen: React.FC<InitialSplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 3 seconds total duration (3000ms) with smooth progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 140);

    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 bg-[#181919] text-white flex flex-col items-center justify-center p-6 selection:bg-none">
      <div className="flex flex-col items-center text-center space-y-6 max-w-sm">
        {/* Animated Glowing Logo Frame */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#536347] via-[#8A9B79] to-[#536347] blur-lg opacity-75 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 shadow-2xl bg-[#232424] flex items-center justify-center p-1">
            <img
              src="/logo.png"
              alt="Aarush Mens PG Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 font-mono text-[10px] tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-[#A8C393]" />
            <span>Management System</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Aarush Mens Luxury PG
          </h1>
          <p className="text-xs text-white/60 font-mono">
            67 Rooms • 240 Beds • Real-time System
          </p>
        </div>

        {/* 3-second Progress Indicator Bar */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#8A9B79] to-[#536347] h-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
            <span>INITIALIZING APP...</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ScreenTransitionLoaderProps {
  screenTitle: string;
}

export const ScreenTransitionLoader: React.FC<ScreenTransitionLoaderProps> = ({ screenTitle }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
      <div className="p-6 rounded-2xl bg-white border border-[#F5F2ED] shadow-floating max-w-xs w-full flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-[#536347]/20 border-t-[#536347] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-full object-cover" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#181919]">
            Loading {screenTitle}...
          </h3>
          <p className="text-[11px] text-[#747878] mt-0.5 font-mono">
            Syncing room & resident data
          </p>
        </div>
      </div>
    </div>
  );
};
