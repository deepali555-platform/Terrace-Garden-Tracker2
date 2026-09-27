import React, { useState } from 'react';
import { PlantCategory, SunlightType, WaterLevel } from '../types/plant';
import { CATEGORIES, SUNLIGHT_OPTIONS, WATER_OPTIONS, MONTHS } from '../utils/gardenHelpers';
import { Search, X, SlidersHorizontal, Flower2, Sparkles } from 'lucide-react';

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const currentMonthName = MONTHS[currentMonthIndex - 1]?.name || 'September';
  const isSearching = searchQuery.trim() !== '';

  const secondaryFiltersActive =
    selectedCategory !== 'all' ||
    selectedSunlight !== 'all' ||
    selectedWater !== 'all' ||
    onlyBloomingNow;

  const hasActiveFilters = isSearching || secondaryFiltersActive;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/80 p-3 sm:p-5 shadow-xs space-y-3">
      {/* Search Input Bar - High Priority, Instant Typing */}
      <div className="relative">
        <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search plants by name, Hindi name, or category (e.g. Tulsi, Rose, Mogra)..."
          className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700 transition-all shadow-2xs"
          aria-label="Search plants"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="w-7 h-7 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100 transition-colors"
            title="Clear search"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Search Results Banner (When typing, keeps UI direct and compact) */}
      {isSearching && (
        <div className="flex items-center justify-between gap-2 p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">
              {filteredCount === 0 ? (
                <span>No plants found matching &quot;<strong>{searchQuery}</strong>&quot;</span>
              ) : filteredCount === 1 ? (
                <span><strong>1 match found</strong> for &quot;{searchQuery}&quot; (scrolled into view)</span>
              ) : (
                <span><strong>{filteredCount} matching plants</strong> for &quot;{searchQuery}&quot;</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{showAdvancedFilters ? 'Hide Filters' : 'Filters'}</span>
              {secondaryFiltersActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
              )}
            </button>
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-[11px] font-bold text-stone-500 hover:text-stone-900 underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Categories & Filter Rows (Always shown when not searching; Collapsible while searching to keep cards directly visible) */}
      {(!isSearching || showAdvancedFilters) && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-150">
          {/* Filter Row 1: Categories Segmented Control */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Category
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-medium hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => onCategoryChange('all')}
                className={`min-h-[38px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
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
                    type="button"
                    onClick={() => onCategoryChange(cat.id)}
                    className={`min-h-[38px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border active:scale-95 cursor-pointer ${
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
                className="w-full min-h-[40px] px-3 py-1.5 sm:py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                className="w-full min-h-[40px] px-3 py-1.5 sm:py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                className={`w-full min-h-[40px] px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] cursor-pointer ${
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
        </div>
      )}

      {/* Filter status counter (when not searching) */}
      {!isSearching && (
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-stone-500 pt-0.5">
          <span>
            Showing <strong className="text-stone-800">{filteredCount}</strong> of{' '}
            <strong>{totalCount}</strong> plants
          </span>
          {hasActiveFilters && (
            <span className="text-emerald-800 font-medium">Filtered</span>
          )}
        </div>
      )}
    </div>
  );
};

