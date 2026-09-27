import React from 'react';
import { Plus, Leaf, Calendar, Stethoscope, RefreshCw, Sprout, Sparkles, Camera, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer';
  onSelectTab: (tab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer') => void;
  onOpenAddModal: () => void;
  onOpenScanModal?: () => void;
  overdueFertilizerCount?: number;
  gardenPlantCount?: number;
  totalPlantCount?: number;
  onResetDefaults?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenScanModal,
  overdueFertilizerCount = 0,
  gardenPlantCount = 0,
  totalPlantCount = 0,
  onResetDefaults,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0d2f1c] text-white border-b border-emerald-900/70 px-4 sm:px-8 py-3.5 shadow-md relative overflow-hidden transition-colors">
      {/* Subtle Botanical SVG Background Pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-6xl mx-auto flex items-center justify-between relative z-10 gap-3">
        {/* Zone 1: Brand title with leaf icon */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 text-left group focus:outline-none min-h-[44px] -ml-1 pl-1"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/90 text-white flex items-center justify-center font-bold shadow-xs border border-emerald-400/30 group-hover:scale-105 transition-transform shrink-0">
              <Leaf className="w-5 h-5 text-emerald-100 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors truncate block">
                Terrace Garden
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-emerald-300/80 -mt-0.5">
                Indian Balcony & Terrace
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold">
          {/* Tab 1: My Garden (Owned Plants Only) */}
          <button
            onClick={() => onSelectTab('my-garden')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              currentTab === 'my-garden'
                ? 'bg-emerald-600 text-white shadow-xs border border-emerald-400 font-bold'
                : 'text-emerald-100/90 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-300" />
            <span>My Garden</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                currentTab === 'my-garden'
                  ? 'bg-emerald-900 text-emerald-200'
                  : 'bg-emerald-800 text-emerald-300'
              }`}
            >
              {gardenPlantCount}
            </span>
          </button>

          {/* Tab 2: All Plants Guide (Full 20-Plant Reference Library) */}
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              currentTab === 'home'
                ? 'bg-emerald-800/90 text-white shadow-xs border border-emerald-600/60 font-bold'
                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Reference Guide</span>
            {totalPlantCount > 0 && (
              <span className="text-[10px] opacity-75 font-normal">
                ({totalPlantCount})
              </span>
            )}
          </button>

          {/* Tab 3: Fertilizer Schedule (Only owned plants) */}
          <button
            onClick={() => onSelectTab('fertilizer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all relative ${
              currentTab === 'fertilizer'
                ? 'bg-emerald-700 text-white shadow-xs border border-emerald-500 font-bold'
                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Fertilizer Schedule</span>
            {overdueFertilizerCount > 0 && (
              <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                {overdueFertilizerCount}
              </span>
            )}
          </button>

          {/* Tab 4: Seasonal Calendar (Only owned plants) */}
          <button
            onClick={() => onSelectTab('reminders')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              currentTab === 'reminders'
                ? 'bg-amber-600/90 text-white shadow-xs border border-amber-400/60 font-bold'
                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Seasonal Calendar</span>
          </button>

          {/* Tab 5: Disease Clinic */}
          <button
            onClick={() => onSelectTab('diagnosis')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              currentTab === 'diagnosis'
                ? 'bg-teal-700/90 text-white shadow-xs border border-teal-400/60 font-bold'
                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-teal-300" />
            <span>Disease Clinic</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenScanModal && (
            <button
              type="button"
              onClick={onOpenScanModal}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] rounded-xl shadow-md border border-amber-300 transition-all whitespace-nowrap min-h-[44px]"
              title="Scan plant with AI health camera"
            >
              <Camera className="w-4 h-4 text-stone-900 stroke-[2.4]" />
              <span>Scan</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] rounded-xl shadow-md border border-emerald-400/40 transition-all whitespace-nowrap min-h-[44px]"
            title="Add Plant to Garden Tracker"
          >
            <Plus className="w-4 h-4 stroke-[2.75]" />
            <span>Add</span>
          </button>

          {onResetDefaults && (
            <button
              type="button"
              onClick={onResetDefaults}
              title="Reset default Indian plant list"
              className="hidden xl:flex items-center justify-center gap-1.5 text-xs text-emerald-200 hover:text-white px-2.5 py-1.5 rounded-xl border border-emerald-800/80 bg-emerald-950/60 hover:bg-emerald-900 transition-colors whitespace-nowrap min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
