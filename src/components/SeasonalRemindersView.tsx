import React, { useState, useMemo } from 'react';
import { Plant } from '../types/plant';
import {
  MONTHS,
  isPlantSowingMonth,
  isPlantPruningMonth,
  isPlantRepottingMonth,
  isPlantBloomingMonth,
  getPlantCategoryAccent,
} from '../utils/gardenHelpers';
import { PlantImage } from './PlantImage';
import {
  Calendar,
  Scissors,
  Box,
  Flower2,
  ChevronRight,
  Info,
  CalendarCheck,
  Sun,
  Leaf,
} from 'lucide-react';

interface SeasonalRemindersViewProps {
  plants: Plant[];
  currentMonthIndex: number;
  onSelectPlant: (plant: Plant) => void;
  onOpenMyGarden?: () => void;
}

export const SeasonalRemindersView: React.FC<SeasonalRemindersViewProps> = ({
  plants,
  currentMonthIndex,
  onSelectPlant,
  onOpenMyGarden,
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(currentMonthIndex);
  const [activeFilter, setActiveFilter] = useState<'all' | 'sowing' | 'pruning' | 'repotting' | 'blooming'>('all');
  const [scope, setScope] = useState<'garden' | 'all'>('garden');

  const gardenPlantsCount = useMemo(() => plants.filter((p) => Boolean(p.inMyGarden)).length, [plants]);

  // Determine active plant list based on scope
  const scopedPlants = useMemo(() => {
    if (scope === 'garden') {
      return plants.filter((p) => Boolean(p.inMyGarden));
    }
    return plants;
  }, [plants, scope]);

  const selectedMonthInfo = MONTHS.find((m) => m.index === selectedMonthIndex) || MONTHS[currentMonthIndex - 1];

  const sowingPlants = scopedPlants.filter((p) => isPlantSowingMonth(p, selectedMonthIndex));
  const pruningPlants = scopedPlants.filter((p) => isPlantPruningMonth(p, selectedMonthIndex));
  const repottingPlants = scopedPlants.filter((p) => isPlantRepottingMonth(p, selectedMonthIndex));
  const bloomingPlants = scopedPlants.filter((p) => isPlantBloomingMonth(p, selectedMonthIndex));

  const isCurrentMonth = selectedMonthIndex === currentMonthIndex;

  return (
    <div className="space-y-6">
      {/* DISTINCT ACCENT HERO: Warm Amber & Deep Forest Seasonal Calendar Theme */}
      <div className="bg-gradient-to-br from-[#1c3e27] via-[#244b30] to-[#3a2e1c] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-500/30 relative overflow-hidden">
        {/* Subtle decorative seasonal leaf sunburst */}
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none text-amber-300">
          <Calendar className="w-56 h-56 stroke-[1]" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
              <span>Indian Seasonal Terrace Calendar</span>
              {isCurrentMonth && (
                <span className="bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm">
                  Active Month
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              {selectedMonthInfo.name} Gardening Schedule
            </h1>
            <p className="text-xs sm:text-sm font-medium text-emerald-100/90 mt-1 max-w-xl">
              <span className="text-amber-200 font-semibold">{selectedMonthInfo.indianSeason}:</span>{' '}
              {selectedMonthInfo.seasonSummary}
            </p>
          </div>

          {!isCurrentMonth && (
            <button
              onClick={() => setSelectedMonthIndex(currentMonthIndex)}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm self-start sm:self-center flex items-center justify-center active:scale-95"
            >
              Back to Current Month ({MONTHS[currentMonthIndex - 1].shortName})
            </button>
          )}
        </div>

        {/* 12-Month Horizontal Selector Bar */}
        <div className="pt-5 relative z-10">
          <p className="text-xs text-emerald-200/90 mb-2 font-semibold flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Select a month to inspect terrace tasks:</span>
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-1.5">
            {MONTHS.map((m) => {
              const isSelected = m.index === selectedMonthIndex;
              const isToday = m.index === currentMonthIndex;
              return (
                <button
                  key={m.index}
                  type="button"
                  onClick={() => setSelectedMonthIndex(m.index)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition-all min-h-[46px] flex flex-col items-center justify-center active:scale-95 ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 font-extrabold shadow-md scale-102 ring-2 ring-amber-300'
                      : isToday
                      ? 'bg-emerald-900/90 text-amber-300 border border-amber-400/80 font-bold'
                      : 'bg-black/25 text-emerald-100 hover:bg-black/40 border border-white/10'
                  }`}
                >
                  <div className="text-[12px]">{m.shortName}</div>
                  {isToday && (
                    <div className="text-[8px] uppercase tracking-tighter opacity-90 font-bold">Now</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Indian Terrace Climate Advice for Selected Month */}
        <div className="mt-5 p-4 bg-black/25 backdrop-blur-md rounded-2xl border border-white/15 relative z-10">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs text-emerald-100">
              <span className="font-bold text-amber-200 text-sm block">
                {selectedMonthInfo.name} Terrace Checklist:
              </span>
              <ul className="list-disc list-inside space-y-1 text-emerald-100/90 leading-relaxed">
                {selectedMonthInfo.generalTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Selector: My Garden vs All Reference */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
              <span>Reminders Filter:</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                {scope === 'garden' ? 'My Garden Plants' : `All ${plants.length} Reference Plants`}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {scope === 'garden'
                ? `Showing tasks only for the ${gardenPlantsCount} plants in your terrace garden.`
                : `Showing care tasks across all ${plants.length} reference plants.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl w-full sm:w-auto self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => setScope('garden')}
            className={`flex-1 sm:flex-none min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              scope === 'garden'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>My Garden ({gardenPlantsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setScope('all')}
            className={`flex-1 sm:flex-none min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
              scope === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>All Reference ({plants.length})</span>
          </button>
        </div>
      </div>

      {/* Task Category Filter Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shadow-xs active:scale-95 ${
            activeFilter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Tasks ({sowingPlants.length + pruningPlants.length + repottingPlants.length + bloomingPlants.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('sowing')}
          className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs active:scale-95 ${
            activeFilter === 'sowing'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Sowing Time ({sowingPlants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('pruning')}
          className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs active:scale-95 ${
            activeFilter === 'pruning'
              ? 'bg-teal-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Scissors className="w-3.5 h-3.5 text-teal-600" />
          <span>Pruning / Cutting ({pruningPlants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('repotting')}
          className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs active:scale-95 ${
            activeFilter === 'repotting'
              ? 'bg-amber-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-amber-600" />
          <span>Repotting ({repottingPlants.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('blooming')}
          className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-xs active:scale-95 ${
            activeFilter === 'blooming'
              ? 'bg-rose-700 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Flower2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Blooming Now ({bloomingPlants.length})</span>
        </button>
      </div>

      {/* Grid of Reminders Sections */}
      <div className="space-y-6">
        {/* 1. SOWING SECTION */}
        {(activeFilter === 'all' || activeFilter === 'sowing') && (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">
                    Sow Seeds or Propagate in {selectedMonthInfo.name}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Optimal germination conditions in Indian terrace climate
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                {sowingPlants.length} Plants
              </span>
            </div>

            {sowingPlants.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                No plants in your tracker have scheduled sowing in {selectedMonthInfo.name}.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {sowingPlants.map((plant) => {
                  const accent = getPlantCategoryAccent(plant.category);
                  return (
                    <div
                      key={plant.id}
                      onClick={() => onSelectPlant(plant)}
                      className="p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-600/60 hover:bg-stone-50/70 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <PlantImage
                          plant={plant}
                          aspectRatio="thumb"
                          className="w-14 h-14 rounded-xl shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${accent.pillBadge}`}>
                              {plant.category}
                            </span>
                          </div>
                          <div className="font-bold text-stone-900 group-hover:text-emerald-900 transition-colors text-sm truncate">
                            {plant.name}
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                            {plant.sowingTime.seasonText}
                          </p>
                          {plant.sowingTime.method && (
                            <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                              Method: {plant.sowingTime.method}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-800 shrink-0 mt-2 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. PRUNING SECTION */}
        {(activeFilter === 'all' || activeFilter === 'pruning') && (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center border border-teal-200">
                  <Scissors className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">
                    Pruning & Trimming in {selectedMonthInfo.name}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Shape bushes, deadhead spent flowers, and trigger bushy growth
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-900 bg-teal-100 px-3 py-1 rounded-full border border-teal-200">
                {pruningPlants.length} Plants
              </span>
            </div>

            {pruningPlants.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                No plants require major pruning in {selectedMonthInfo.name}.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {pruningPlants.map((plant) => {
                  const accent = getPlantCategoryAccent(plant.category);
                  return (
                    <div
                      key={plant.id}
                      onClick={() => onSelectPlant(plant)}
                      className="p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-600/60 hover:bg-stone-50/70 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <PlantImage
                          plant={plant}
                          aspectRatio="thumb"
                          className="w-14 h-14 rounded-xl shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${accent.pillBadge}`}>
                              {plant.category}
                            </span>
                          </div>
                          <div className="font-bold text-stone-900 group-hover:text-emerald-900 transition-colors text-sm truncate">
                            {plant.name}
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                            {plant.pruningTime.seasonText}
                          </p>
                          <p className="text-[11px] text-teal-800 font-semibold mt-0.5">
                            Tips: {plant.pruningTime.tips}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-800 shrink-0 mt-2 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. REPOTTING SECTION */}
        {(activeFilter === 'all' || activeFilter === 'repotting') && (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-200">
                  <Box className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">
                    Repotting & Soil Refresh in {selectedMonthInfo.name}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Upgrade pot size, trim root bounds, and refresh potting mix
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                {repottingPlants.length} Plants
              </span>
            </div>

            {repottingPlants.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                No plants recommended for repotting in {selectedMonthInfo.name}.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {repottingPlants.map((plant) => {
                  const accent = getPlantCategoryAccent(plant.category);
                  return (
                    <div
                      key={plant.id}
                      onClick={() => onSelectPlant(plant)}
                      className="p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-600/60 hover:bg-stone-50/70 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <PlantImage
                          plant={plant}
                          aspectRatio="thumb"
                          className="w-14 h-14 rounded-xl shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${accent.pillBadge}`}>
                              {plant.category}
                            </span>
                          </div>
                          <div className="font-bold text-stone-900 group-hover:text-emerald-900 transition-colors text-sm truncate">
                            {plant.name}
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                            {plant.repottingTime.seasonText} ({plant.repottingTime.frequency})
                          </p>
                          <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                            Target pot: {plant.potSizeRequired.sizeInches}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-800 shrink-0 mt-2 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. BLOOMING NOW SECTION */}
        {(activeFilter === 'all' || activeFilter === 'blooming') && (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center border border-rose-200">
                  <Flower2 className="w-4 h-4 text-rose-700" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">
                    Blooming in {selectedMonthInfo.name}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Active flowers on Indian terrace gardens this month
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-900 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                {bloomingPlants.length} Blooming
              </span>
            </div>

            {bloomingPlants.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-2">
                No active blooming plants recorded for {selectedMonthInfo.name}.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {bloomingPlants.map((plant) => {
                  const accent = getPlantCategoryAccent(plant.category);
                  return (
                    <div
                      key={plant.id}
                      onClick={() => onSelectPlant(plant)}
                      className="p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-600/60 hover:bg-stone-50/70 hover:shadow-md cursor-pointer transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <PlantImage
                          plant={plant}
                          aspectRatio="thumb"
                          className="w-14 h-14 rounded-xl shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${accent.pillBadge}`}>
                              {plant.category}
                            </span>
                          </div>
                          <div className="font-bold text-stone-900 group-hover:text-emerald-900 transition-colors text-sm truncate">
                            {plant.name}
                          </div>
                          <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                            {plant.floweringSeason.seasonText}
                          </p>
                          <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                            Feed with banana peel tea / mustard cake for extra blooms
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-800 shrink-0 mt-2 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
