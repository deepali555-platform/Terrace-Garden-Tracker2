import React from 'react';
import { PlantCategory, SunlightType, WaterLevel } from '../types/plant';
import { CATEGORIES, SUNLIGHT_OPTIONS, WATER_OPTIONS, MONTHS } from '../utils/gardenHelpers';
import { Search, X, SlidersHorizontal, Flower2 } from 'lucide-react';

interface GardenFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: PlantCategory | 'all';
  onCategoryChange: (cat: PlantCategory | 'all') => void;
  selectedSunlight: SunlightType | 'all';
  onSunlightChange: (sun: SunlightType | 'all') => void;
  selectedWater: WaterLevel | 'all';
  onWaterChange: (w: WaterLevel | 'all') => void;
  onlyBloomingNow: boolean;
  onOnlyBloomingNowChange: (val: boolean) => void;
  currentMonthIndex: number;
  totalCount: number;
  filteredCount: number;
  onClearAll: () => void;
}

export const GardenFilters: React.FC<GardenFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSunlight,
  onSunlightChange,
  selectedWater,
  onWaterChange,
  onlyBloomingNow,
  onOnlyBloomingNowChange,
  currentMonthIndex,
  totalCount,
  filteredCount,
  onClearAll,
}) => {
  const currentMonthName = MONTHS[currentMonthIndex - 1]?.name || 'September';
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedSunlight !== 'all' ||
    selectedWater !== 'all' ||
    onlyBloomingNow;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by plant name (e.g. Tulsi, Rose, Hibiscus, Tamatar)..."
          className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Row 1: Categories Segmented Control */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Category
          </span>
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-medium hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onCategoryChange('all')}
            className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              selectedCategory === 'all'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'bg-[#f7f5ed] text-stone-700 hover:bg-stone-200 border border-stone-200/80'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-[#f7f5ed] text-stone-700 hover:bg-stone-200 border-stone-200/80'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Row 2: Sunlight, Water, Blooming Now */}
      <div className="pt-2 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Sunlight Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
            Sunlight Need
          </label>
          <select
            value={selectedSunlight}
            onChange={(e) => onSunlightChange(e.target.value as SunlightType | 'all')}
            className="w-full min-h-[44px] px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">All Sunlight Types</option>
            {SUNLIGHT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} ({s.desc})
              </option>
            ))}
          </select>
        </div>

        {/* Water Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
            Water Need
          </label>
          <select
            value={selectedWater}
            onChange={(e) => onWaterChange(e.target.value as WaterLevel | 'all')}
            className="w-full min-h-[44px] px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="all">All Water Levels</option>
            {WATER_OPTIONS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label} Water
              </option>
            ))}
          </select>
        </div>

        {/* Current Flowering Season Toggle Button */}
        <div>
          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
            Flowering Season
          </label>
          <button
            type="button"
            onClick={() => onOnlyBloomingNowChange(!onlyBloomingNow)}
            className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] ${
              onlyBloomingNow
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold shadow-2xs'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Flower2
              className={`w-4 h-4 ${
                onlyBloomingNow ? 'text-amber-700 fill-amber-500/20' : 'text-stone-400'
              }`}
            />
            <span>Blooming in {currentMonthName}</span>
          </button>
        </div>
      </div>

      {/* Filter status counter */}
      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
        <span>
          Showing <strong className="text-stone-800">{filteredCount}</strong> of{' '}
          <strong>{totalCount}</strong> plants in your terrace database
        </span>
        {hasActiveFilters && (
          <span className="text-emerald-800 font-medium">Filtered</span>
        )}
      </div>
    </div>
  );
};
