import React, { useState, useMemo } from 'react';
import { Plant } from '../types/plant';
import { PlantImage } from './PlantImage';
import {
  calculateFertilizerStatus,
  formatReadableDate,
  toISODateString,
} from '../utils/fertilizerHelpers';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Check,
  RotateCw,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

interface FertilizerScheduleViewProps {
  plants: Plant[];
  onMarkFertilized: (plantId: string, dateStr?: string) => void;
  onSelectPlant: (plant: Plant) => void;
  onBrowseReference?: () => void;
}

export const FertilizerScheduleView: React.FC<FertilizerScheduleViewProps> = ({
  plants,
  onMarkFertilized,
  onSelectPlant,
  onBrowseReference,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'overdue' | 'due_soon' | 'healthy'>('all');
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [customDate, setCustomDate] = useState<string>(toISODateString(new Date()));
  const [justMarkedId, setJustMarkedId] = useState<string | null>(null);

  // Calculate schedule for every plant
  const plantsWithSchedule = useMemo(() => {
    return plants.map((plant) => {
      const schedule = calculateFertilizerStatus(plant);
      return {
        plant,
        schedule,
      };
    });
  }, [plants]);

  // Overall counts for summary cards
  const counts = useMemo(() => {
    let overdue = 0;
    let dueSoon = 0;
    let healthy = 0;

    plantsWithSchedule.forEach(({ schedule }) => {
      if (schedule.status === 'overdue' || schedule.status === 'not_set' || schedule.status === 'due_today') {
        overdue++;
      } else if (schedule.status === 'due_soon') {
        dueSoon++;
      } else {
        healthy++;
      }
    });

    return { overdue, dueSoon, healthy, total: plants.length };
  }, [plantsWithSchedule, plants.length]);

  // Sort: Due soonest (or overdue first) to due latest
  const sortedAndFiltered = useMemo(() => {
    let list = [...plantsWithSchedule];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(({ plant }) => {
        return (
          plant.name.toLowerCase().includes(q) ||
          plant.category.toLowerCase().includes(q) ||
          plant.botanicalName?.toLowerCase().includes(q) ||
          plant.hindiName?.toLowerCase().includes(q)
        );
      });
    }

    // Filter by tab
    if (filterTab === 'overdue') {
      list = list.filter(
        ({ schedule }) =>
          schedule.status === 'overdue' || schedule.status === 'not_set' || schedule.status === 'due_today'
      );
    } else if (filterTab === 'due_soon') {
      list = list.filter(({ schedule }) => schedule.status === 'due_soon');
    } else if (filterTab === 'healthy') {
      list = list.filter(({ schedule }) => schedule.status === 'healthy');
    }

    // Sorting rule:
    // 1. Overdue & Due today (lowest daysUntilDue first)
    // 2. Due soon
    // 3. Healthy
    return list.sort((a, b) => {
      // not_set first among overdue
      if (a.schedule.status === 'not_set' && b.schedule.status !== 'not_set') return -1;
      if (b.schedule.status === 'not_set' && a.schedule.status !== 'not_set') return 1;
      return a.schedule.daysUntilDue - b.schedule.daysUntilDue;
    });
  }, [plantsWithSchedule, searchQuery, filterTab]);

  const handleMarkToday = (plantId: string) => {
    const today = toISODateString(new Date());
    onMarkFertilized(plantId, today);
    setJustMarkedId(plantId);
    setTimeout(() => {
      setJustMarkedId(null);
    }, 1800);
  };

  const handleSaveCustomDate = (plantId: string) => {
    if (customDate) {
      onMarkFertilized(plantId, customDate);
      setEditingPlantId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#0e3b20] via-[#16502c] to-[#1c5f34] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md border border-emerald-700/50">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-300">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Organic Feeding & Nourishment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Fertilizer Schedule Tracker
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
            Keep your container soil rich and aerated. Automatically calculates the next feed due date based on each plant's organic frequency, and alerts you before plants starve.
          </p>
        </div>

        {/* Decorative circle graphic */}
        <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none text-emerald-100">
          <Sparkles className="w-48 h-48" />
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Overdue */}
        <div
          onClick={() => setFilterTab('overdue')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'overdue'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
              : 'bg-white border-stone-200 hover:border-amber-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Needs Feeding</span>
            </span>
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">
              {counts.overdue}
            </span>
          </div>
          <p className="text-2xl font-black text-amber-950 mt-2">{counts.overdue}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Overdue or due today</p>
        </div>

        {/* Card 2: Due Soon */}
        <div
          onClick={() => setFilterTab('due_soon')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'due_soon'
              ? 'bg-sky-500/10 border-sky-500 ring-2 ring-sky-400/40 shadow-sm'
              : 'bg-white border-stone-200 hover:border-sky-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-sky-900">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>Due This Week</span>
            </span>
            <span className="text-xs bg-sky-100 text-sky-900 px-2 py-0.5 rounded-full font-extrabold">
              {counts.dueSoon}
            </span>
          </div>
          <p className="text-2xl font-black text-sky-950 mt-2">{counts.dueSoon}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Within 3 days</p>
        </div>

        {/* Card 3: Healthy */}
        <div
          onClick={() => setFilterTab('healthy')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'healthy'
              ? 'bg-emerald-500/10 border-emerald-600 ring-2 ring-emerald-400/40 shadow-sm'
              : 'bg-white border-stone-200 hover:border-emerald-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Recently Fed</span>
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-extrabold">
              {counts.healthy}
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-950 mt-2">{counts.healthy}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Good for now</p>
        </div>

        {/* Card 4: Total */}
        <div
          onClick={() => setFilterTab('all')}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterTab === 'all'
              ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
              : 'bg-white border-stone-200 hover:border-stone-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span>All Plants</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                filterTab === 'all' ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {counts.total}
            </span>
          </div>
          <p className={`text-2xl font-black mt-2 ${filterTab === 'all' ? 'text-white' : 'text-stone-900'}`}>
            {counts.total}
          </p>
          <p className={`text-[11px] mt-0.5 ${filterTab === 'all' ? 'text-stone-300' : 'text-stone-500'}`}>
            Tracked in garden
          </p>
        </div>
      </div>

      {/* Overdue Warning Alert Box (if any) */}
      {counts.overdue > 0 && filterTab !== 'healthy' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 space-y-1">
            <h4 className="text-sm font-bold text-amber-900">
              {counts.overdue} {counts.overdue === 1 ? 'plant needs' : 'plants need'} fertilizing
            </h4>
            <p className="leading-relaxed">
              Terrace container plants have limited soil volume; nutrients leach out quickly during watering. Top dress with vermicompost, cow dung manure, or liquid mustard cake tea and mark as fed below.
            </p>
          </div>
        </div>
      )}

      {plants.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200/80">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-stone-900">
              No Plants in My Garden Yet
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              The Fertilizer Schedule Tracker calculates organic feeding countdowns and sends overdue alerts exclusively for plants marked as &quot;In My Garden&quot; so reference entries don&apos;t clutter your schedule.
            </p>
          </div>
          {onBrowseReference && (
            <div className="pt-2">
              <button
                onClick={onBrowseReference}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <span>Browse Reference Guide to Add Plants</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search plant by name, category, or variety..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-9 pr-4 py-2.5 text-base sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:bg-white transition-all text-stone-800"
          />
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterTab('all')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors active:scale-95 ${
              filterTab === 'all'
                ? 'bg-emerald-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All ({plants.length})
          </button>
          <button
            onClick={() => setFilterTab('overdue')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 active:scale-95 ${
              filterTab === 'overdue'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Overdue ({counts.overdue})</span>
          </button>
          <button
            onClick={() => setFilterTab('due_soon')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors active:scale-95 ${
              filterTab === 'due_soon'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            Due Soon ({counts.dueSoon})
          </button>
          <button
            onClick={() => setFilterTab('healthy')}
            className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors active:scale-95 ${
              filterTab === 'healthy'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Up to Date ({counts.healthy})
          </button>
        </div>
      </div>

      {/* Plants Fertilizer List */}
      {sortedAndFiltered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-2">
          <Sparkles className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-800">No plants match this schedule view</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try switching filter tabs or clearing your search query.
          </p>
          <button
            onClick={() => {
              setFilterTab('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAndFiltered.map(({ plant, schedule }) => {
            const isOverdue =
              schedule.status === 'overdue' ||
              schedule.status === 'not_set' ||
              schedule.status === 'due_today';
            const isDueSoon = schedule.status === 'due_soon';
            const isEditingThis = editingPlantId === plant.id;
            const isJustMarked = justMarkedId === plant.id;

            return (
              <div
                key={plant.id}
                className={`bg-white rounded-3xl border transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                  isOverdue
                    ? 'border-amber-300/90 bg-gradient-to-r from-amber-50/40 via-white to-white'
                    : isDueSoon
                    ? 'border-sky-200'
                    : 'border-stone-200 hover:border-emerald-300'
                }`}
              >
                {/* Left: Plant Photo + Name + Fertilizer Specs */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    onClick={() => onSelectPlant(plant)}
                    className="relative shrink-0 cursor-pointer group"
                    title="Click to view plant care guide"
                  >
                    <PlantImage
                      plant={plant}
                      aspectRatio="thumb"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-xs border border-stone-200 object-cover group-hover:opacity-90"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                        {plant.category}
                      </span>

                      {/* Status Pill Badge */}
                      {schedule.status === 'not_set' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-700 bg-stone-100 border border-stone-300 px-2.5 py-0.5 rounded-full">
                          <Info className="w-3 h-3 text-stone-500" />
                          <span>Not Recorded</span>
                        </span>
                      )}
                      {schedule.status === 'overdue' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{schedule.statusLabel}</span>
                        </span>
                      )}
                      {schedule.status === 'due_today' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          <span>Due Today!</span>
                        </span>
                      )}
                      {schedule.status === 'due_soon' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-100 border border-sky-300 px-2.5 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-sky-600" />
                          <span>{schedule.statusLabel}</span>
                        </span>
                      )}
                      {schedule.status === 'healthy' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{schedule.statusLabel}</span>
                        </span>
                      )}
                    </div>

                    {/* Plant Common Name */}
                    <div className="flex items-center gap-2 mt-0.5">
                      <h3
                        onClick={() => onSelectPlant(plant)}
                        className="text-base sm:text-lg font-bold text-stone-900 hover:text-emerald-800 cursor-pointer truncate"
                      >
                        {plant.name}
                      </h3>
                      {plant.hindiName && (
                        <span className="hidden sm:inline text-xs font-semibold text-emerald-800/80">
                          ({plant.hindiName})
                        </span>
                      )}
                    </div>

                    {/* Fertilizer Formula & Frequency Requirement */}
                    <div className="mt-1 text-xs text-stone-600 space-y-0.5">
                      <p className="line-clamp-1">
                        <strong className="text-stone-800 font-semibold">Feed: </strong>
                        {plant.fertilizerRequirement.type}
                      </p>
                      <p className="text-stone-500 text-[11px]">
                        Formula: {plant.fertilizerRequirement.npkOrOrganic} ·{' '}
                        <strong className="text-stone-700">{plant.fertilizerRequirement.frequency}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Middle: Schedule Dates (Last Fertilized & Next Due) */}
                <div className="bg-stone-50/80 border border-stone-200/70 rounded-2xl p-3 sm:p-3.5 min-w-[200px] text-xs space-y-2">
                  {/* Last Fertilized Date */}
                  <div>
                    <div className="flex items-center justify-between text-stone-500 text-[11px]">
                      <span>Last Fertilized:</span>
                      <button
                        onClick={() => {
                          setEditingPlantId(isEditingThis ? null : plant.id);
                          setCustomDate(plant.lastFertilizedDate || toISODateString(new Date()));
                        }}
                        className="min-h-[36px] flex items-center text-emerald-800 hover:underline font-semibold"
                      >
                        {isEditingThis ? 'Cancel' : 'Change date'}
                      </button>
                    </div>

                    {isEditingThis ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="min-h-[44px] px-2.5 py-1.5 bg-white border border-stone-300 rounded-xl text-base sm:text-xs w-full text-stone-800"
                        />
                        <button
                          onClick={() => handleSaveCustomDate(plant.id)}
                          className="min-h-[44px] px-3.5 py-1.5 bg-emerald-800 text-white rounded-xl font-bold text-xs shrink-0 active:scale-95"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p className="font-bold text-stone-800 mt-0.5">
                        {formatReadableDate(plant.lastFertilizedDate)}
                      </p>
                    )}
                  </div>

                  {/* Next Due Date */}
                  <div className="pt-1.5 border-t border-stone-200/60">
                    <span className="text-stone-500 text-[11px]">Next Due:</span>
                    <p
                      className={`font-bold mt-0.5 ${
                        isOverdue ? 'text-amber-900 font-extrabold' : 'text-emerald-900'
                      }`}
                    >
                      {formatReadableDate(schedule.nextDueDate)}
                    </p>
                  </div>
                </div>

                {/* Right: One-Tap "Fertilized Today" Action */}
                <div className="flex flex-col sm:items-end justify-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleMarkToday(plant.id)}
                    className={`w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap ${
                      isJustMarked
                        ? 'bg-emerald-600 text-white'
                        : isOverdue
                        ? 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-500'
                        : 'bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-700'
                    }`}
                  >
                    {isJustMarked ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Fertilized!</span>
                      </>
                    ) : (
                      <>
                        <RotateCw className="w-4 h-4" />
                        <span>Fertilized Today</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectPlant(plant)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1 text-xs font-semibold text-stone-600 hover:text-emerald-800 transition-colors py-1.5 min-h-[44px]"
                  >
                    <span>View Care Guide</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
};
