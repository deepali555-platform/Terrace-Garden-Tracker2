import React from 'react';
import { Sprout, Calendar, Leaf, Sparkles, Camera } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer';
  onSelectTab: (tab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer') => void;
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d2f1c]/95 backdrop-blur-lg border-t border-emerald-900/80 px-1 py-1 safe-area-pb shadow-lg">
      <div className="grid grid-cols-5 items-center h-14">
        {/* Tab 1: My Garden */}
        <button
          onClick={() => onSelectTab('my-garden')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors relative ${
            currentTab === 'my-garden'
              ? 'text-emerald-400 font-bold'
              : 'text-emerald-200/70 hover:text-white'
          }`}
        >
          <div className="relative">
            <Leaf className={`w-5 h-5 ${currentTab === 'my-garden' ? 'stroke-[2.4] text-emerald-400' : 'stroke-[1.8]'}`} />
            {gardenPlantCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-500 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {gardenPlantCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">My Garden</span>
        </button>

        {/* Tab 2: Reference Guide */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            currentTab === 'home'
              ? 'text-emerald-300 font-bold'
              : 'text-emerald-200/70 hover:text-white'
          }`}
        >
          <Sprout className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.4] text-emerald-300' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Guide</span>
        </button>

        {/* Tab 3: Fertilizer Schedule */}
        <button
          onClick={() => onSelectTab('fertilizer')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors relative ${
            currentTab === 'fertilizer'
              ? 'text-amber-400 font-bold'
              : 'text-emerald-200/70 hover:text-white'
          }`}
        >
          <div className="relative">
            <Sparkles className={`w-5 h-5 ${currentTab === 'fertilizer' ? 'stroke-[2.4] text-amber-400' : 'stroke-[1.8]'}`} />
            {overdueFertilizerCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-400 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {overdueFertilizerCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Feed</span>
        </button>

        {/* Tab 4: Reminders Calendar */}
        <button
          onClick={() => onSelectTab('reminders')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            currentTab === 'reminders'
              ? 'text-amber-300 font-bold'
              : 'text-emerald-200/70 hover:text-white'
          }`}
        >
          <Calendar className={`w-5 h-5 ${currentTab === 'reminders' ? 'stroke-[2.4] text-amber-300' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Calendar</span>
        </button>

        {/* Tab 5: Scan Plant (Camera) */}
        <button
          onClick={onOpenScanModal}
          className="flex flex-col items-center justify-center min-h-[44px] text-amber-300 active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-md border border-amber-300">
            <Camera className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-amber-300 tracking-tight">Scan AI</span>
        </button>
      </div>
    </div>
  );
};
