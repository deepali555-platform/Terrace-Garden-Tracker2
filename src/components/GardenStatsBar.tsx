import React from 'react';
import { Plant } from '../types/plant';
import { isPlantBloomingMonth } from '../utils/gardenHelpers';
import { calculateFertilizerStatus } from '../utils/fertilizerHelpers';
import { Sprout, Flower2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';

interface GardenStatsBarProps {
  plants: Plant[];
  currentMonthIndex: number;
  onOpenFertilizer?: () => void;
}

export const GardenStatsBar: React.FC<GardenStatsBarProps> = ({
  plants,
  currentMonthIndex,
  onOpenFertilizer,
}) => {
  const totalPlants = plants.length;
  const bloomingCount = plants.filter((p) => isPlantBloomingMonth(p, currentMonthIndex)).length;
  const overdueFeedCount = plants.filter((p) => calculateFertilizerStatus(p).isOverdue).length;
  const remedyCount = plants.reduce((acc, p) => acc + p.diseasesAndPests.length, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Stat 1: Total Plants */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-500 text-xs">
          <Sprout className="w-3.5 h-3.5 text-emerald-800" />
          <span>Tracked Plants</span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-stone-900 mt-1 tabular-nums">
          {totalPlants}
        </div>
        <div className="text-[11px] text-stone-500 mt-0.5">Balcony & terrace</div>
      </div>

      {/* Stat 2: Blooming this Month */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-500 text-xs">
          <Flower2 className="w-3.5 h-3.5 text-amber-600" />
          <span>Blooming Now</span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-amber-900 mt-1 tabular-nums">
          {bloomingCount}
        </div>
        <div className="text-[11px] text-stone-500 mt-0.5">Active flower flushes</div>
      </div>

      {/* Stat 3: Feed Overdue (Interactive) */}
      <div
        onClick={onOpenFertilizer}
        role={onOpenFertilizer ? 'button' : undefined}
        tabIndex={onOpenFertilizer ? 0 : undefined}
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
          overdueFeedCount > 0
            ? 'bg-amber-50/70 border-amber-300 hover:border-amber-500 cursor-pointer shadow-2xs active:scale-[0.98]'
            : 'bg-white border-stone-200/80 cursor-pointer active:scale-[0.98]'
        }`}
        title={onOpenFertilizer ? 'Click to open Fertilizer Schedule' : undefined}
      >
        <div className="flex items-center gap-2 text-xs font-semibold">
          {overdueFeedCount > 0 ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-amber-950 font-bold">Feed Overdue</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="text-stone-500">All Fed</span>
            </>
          )}
        </div>
        <div
          className={`text-2xl font-bold tracking-tight mt-1 tabular-nums ${
            overdueFeedCount > 0 ? 'text-amber-950' : 'text-emerald-950'
          }`}
        >
          {overdueFeedCount}
        </div>
        <div className="text-[11px] text-stone-500 mt-0.5">
          {overdueFeedCount > 0 ? 'Tap to view schedule →' : 'Schedule up to date'}
        </div>
      </div>

      {/* Stat 4: Indian Remedies Database */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-500 text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Home Remedies</span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-teal-900 mt-1 tabular-nums">
          {remedyCount}
        </div>
        <div className="text-[11px] text-stone-500 mt-0.5">Tested kitchen recipes</div>
      </div>
    </div>
  );
};
