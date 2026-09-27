import React from 'react';
import { Sprout, Calendar, Leaf, Sparkles, Stethoscope, Camera } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer' | 'admin';
  onSelectTab: (tab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer' | 'admin') => void;
  onOpenScanModal?: () => void;
  overdueFertilizerCount?: number;
  gardenPlantCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenScanModal,
  overdueFertilizerCount = 0,
  gardenPlantCount = 0,
}) => {
  return (
    <>
      {/* Floating Scan Action Button in Natural Thumb Reach Zone */}
      {onOpenScanModal && (
        <button
          type="button"
          onClick={onOpenScanModal}
          className="lg:hidden fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3.5 z-40 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs px-4 py-3 rounded-full shadow-2xl border border-amber-200/90 flex items-center gap-2 active:scale-95 transition-all min-h-[48px]"
          aria-label="Scan Plant with AI Camera"
        >
          <Camera className="w-4 h-4 text-stone-950 stroke-[2.6]" />
          <span className="tracking-tight text-[11px] font-extrabold uppercase">Scan AI</span>
        </button>
      )}

      {/* 5-Tab Fixed Bottom Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0c2e1b]/98 backdrop-blur-md border-t border-emerald-800/80 px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] safe-area-pb shadow-2xl select-none"
      >
        <div className="grid grid-cols-5 items-center h-14">
          {/* Tab 1: My Garden */}
          <button
            type="button"
            onClick={() => onSelectTab('my-garden')}
            className={`flex flex-col items-center justify-center min-h-[48px] w-full transition-colors relative active:scale-95 ${
              currentTab === 'my-garden'
                ? 'text-emerald-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <div className="relative">
              <Leaf
                className={`w-5 h-5 transition-transform ${
                  currentTab === 'my-garden' ? 'stroke-[2.5] text-emerald-300 scale-110' : 'stroke-[1.8]'
                }`}
              />
              {gardenPlantCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-emerald-400 text-stone-950 text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {gardenPlantCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight font-semibold">Garden</span>
          </button>

          {/* Tab 2: Reference Guide */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center min-h-[48px] w-full transition-colors active:scale-95 ${
              currentTab === 'home'
                ? 'text-emerald-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <Sprout
              className={`w-5 h-5 transition-transform ${
                currentTab === 'home' ? 'stroke-[2.5] text-emerald-300 scale-110' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[10px] mt-1 tracking-tight font-semibold">Guide</span>
          </button>

          {/* Tab 3: Fertilizer Schedule */}
          <button
            type="button"
            onClick={() => onSelectTab('fertilizer')}
            className={`flex flex-col items-center justify-center min-h-[48px] w-full transition-colors relative active:scale-95 ${
              currentTab === 'fertilizer'
                ? 'text-amber-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <div className="relative">
              <Sparkles
                className={`w-5 h-5 transition-transform ${
                  currentTab === 'fertilizer' ? 'stroke-[2.5] text-amber-300 scale-110' : 'stroke-[1.8]'
                }`}
              />
              {overdueFertilizerCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-amber-400 text-stone-950 text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {overdueFertilizerCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight font-semibold">Feed</span>
          </button>

          {/* Tab 4: Seasonal Reminders Calendar */}
          <button
            type="button"
            onClick={() => onSelectTab('reminders')}
            className={`flex flex-col items-center justify-center min-h-[48px] w-full transition-colors active:scale-95 ${
              currentTab === 'reminders'
                ? 'text-amber-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <Calendar
              className={`w-5 h-5 transition-transform ${
                currentTab === 'reminders' ? 'stroke-[2.5] text-amber-300 scale-110' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[10px] mt-1 tracking-tight font-semibold">Calendar</span>
          </button>

          {/* Tab 5: Disease Clinic & Remedies */}
          <button
            type="button"
            onClick={() => onSelectTab('diagnosis')}
            className={`flex flex-col items-center justify-center min-h-[48px] w-full transition-colors active:scale-95 ${
              currentTab === 'diagnosis'
                ? 'text-teal-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <Stethoscope
              className={`w-5 h-5 transition-transform ${
                currentTab === 'diagnosis' ? 'stroke-[2.5] text-teal-300 scale-110' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[10px] mt-1 tracking-tight font-semibold">Clinic</span>
          </button>
        </div>
      </nav>
    </>
  );
};
