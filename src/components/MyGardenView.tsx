import React, { useState, useMemo } from 'react';
import { Plant, PlantCategory, SunlightType, WaterLevel } from '../types/plant';
import { PlantCard } from './PlantCard';
import { GardenFilters } from './GardenFilters';
import { calculateFertilizerStatus } from '../utils/fertilizerHelpers';
import { isPlantBloomingMonth, MONTHS } from '../utils/gardenHelpers';
import {
  Leaf,
  Sprout,
  Plus,
  Sparkles,
  Camera,
  Calendar,
  AlertTriangle,
  Flower2,
  Droplets,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface MyGardenViewProps {
  plants: Plant[];
  currentMonthIndex: number;
  onSelectPlant: (plant: Plant) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleGarden: (id: string, e?: React.MouseEvent) => void;
  onBrowseReference: () => void;
  onOpenScanModal: (plant?: Plant) => void;
  onOpenAddModal: () => void;
  onOpenFertilizer: () => void;
  onOpenReminders: () => void;
}

export const MyGardenView: React.FC<MyGardenViewProps> = ({
  plants,
  currentMonthIndex,
  onSelectPlant,
  onToggleFavorite,
  onToggleGarden,
  onBrowseReference,
  onOpenScanModal,
  onOpenAddModal,
  onOpenFertilizer,
  onOpenReminders,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'all'>('all');
  const [selectedSunlight, setSelectedSunlight] = useState<SunlightType | 'all'>('all');
  const [selectedWater, setSelectedWater] = useState<WaterLevel | 'all'>('all');
  const [onlyBloomingNow, setOnlyBloomingNow] = useState(false);

  // Filter only owned plants
  const ownedPlants = useMemo(() => {
    return plants.filter((p) => Boolean(p.inMyGarden));
  }, [plants]);

  // Key stats for My Garden
  const stats = useMemo(() => {
    let overdueCount = 0;
    let bloomingCount = 0;
    let highWaterCount = 0;

    ownedPlants.forEach((p) => {
      const status = calculateFertilizerStatus(p);
      if (status.isOverdue) overdueCount++;
      if (isPlantBloomingMonth(p, currentMonthIndex)) bloomingCount++;
      if (p.waterRequirement.level === 'High') highWaterCount++;
    });

    return {
      totalOwned: ownedPlants.length,
      overdueCount,
      bloomingCount,
      highWaterCount,
    };
  }, [ownedPlants, currentMonthIndex]);

  // Filtered owned plants
  const filteredOwnedPlants = useMemo(() => {
    return ownedPlants.filter((plant) => {
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = plant.name.toLowerCase().includes(query);
        const matchesBotanical = plant.botanicalName?.toLowerCase().includes(query);
        const matchesHindi = plant.hindiName?.toLowerCase().includes(query);
        const matchesCategory = plant.category.toLowerCase().includes(query);
        if (!matchesName && !matchesBotanical && !matchesHindi && !matchesCategory) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && plant.category !== selectedCategory) {
        return false;
      }
      if (selectedSunlight !== 'all' && plant.sunlightRequirement.type !== selectedSunlight) {
        return false;
      }
      if (selectedWater !== 'all' && plant.waterRequirement.level !== selectedWater) {
        return false;
      }
      if (onlyBloomingNow && !isPlantBloomingMonth(plant, currentMonthIndex)) {
        return false;
      }

      return true;
    });
  }, [
    ownedPlants,
    searchQuery,
    selectedCategory,
    selectedSunlight,
    selectedWater,
    onlyBloomingNow,
    currentMonthIndex,
  ]);

  const currentMonthName = MONTHS[currentMonthIndex - 1]?.name || 'Current Month';

  // Popular Indian plants to recommend if garden is empty
  const recommendedIndianPlants = useMemo(() => {
    const unowned = plants.filter((p) => !p.inMyGarden);
    const popularKeys = ['tulsi', 'hibiscus', 'curry-leaf', 'spider-plant', 'desi-rose', 'money-plant', 'mogra'];
    return unowned.filter((p) => popularKeys.includes(p.id)).slice(0, 4);
  }, [plants]);

  return (
    <div className="space-y-6">
      {/* My Garden Hero Banner */}
      <div className="bg-gradient-to-br from-[#0c2e1b] via-[#124227] to-[#1e5835] text-stone-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md border border-emerald-600/40">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-300">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span>Personal Balcony & Terrace Collection</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
              My Terrace Garden
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl mt-1">
              Active care tracking for the plants you actually own. Feeding countdowns, seasonal task alerts, and photo diagnosis logs only include plants in this list.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={onBrowseReference}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Browse Full Reference ({plants.length})</span>
            </button>

            <button
              onClick={() => onOpenScanModal()}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Camera className="w-4 h-4 stroke-[2.2]" />
              <span>Scan My Plant</span>
            </button>

            <button
              onClick={onOpenFertilizer}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900 text-xs font-bold text-emerald-100 rounded-xl border border-emerald-500/40 shadow-xs transition-all relative"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Feed Schedule</span>
              {stats.overdueCount > 0 && (
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {stats.overdueCount} overdue
                </span>
              )}
            </button>

            <button
              onClick={onOpenReminders}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900 text-xs font-bold text-emerald-100 rounded-xl border border-emerald-500/40 shadow-xs transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>{currentMonthName} Tasks</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800/80 hover:bg-emerald-700 text-xs font-semibold text-white rounded-xl border border-emerald-500/40 transition-all ml-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Custom Plant</span>
            </button>
          </div>
        </div>

        {/* Decorative Leaf Graphic */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-emerald-200">
          <Leaf className="w-64 h-64" />
        </div>
      </div>

      {/* Garden Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Plants in Garden</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-1">
            {stats.totalOwned}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            of {plants.length} reference species
          </div>
        </div>

        <div
          onClick={onOpenFertilizer}
          role="button"
          tabIndex={0}
          className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs hover:border-amber-400 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Feed Overdue</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className={`text-2xl font-extrabold mt-1 ${stats.overdueCount > 0 ? 'text-amber-600' : 'text-stone-900'}`}>
            {stats.overdueCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            {stats.overdueCount > 0 ? 'Needs feeding attention' : 'All feeds up to date'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Blooming Now</span>
            <Flower2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-1">
            {stats.bloomingCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            in {currentMonthName}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Thirsty Plants</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-stone-900 mt-1">
            {stats.highWaterCount}
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            High summer water need
          </div>
        </div>
      </div>

      {/* EMPTY STATE IF NO PLANTS ARE MARKED AS OWNED */}
      {ownedPlants.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-5 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200/80 shadow-xs">
            <Sprout className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-xl font-bold text-stone-900">
              Your Terrace Garden is Empty
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Mark the plants you actually grow on your balcony or terrace. This keeps your fertilizer schedules, seasonal pruning reminders, and health scans focused on your active plants.
            </p>
          </div>

          {/* Quick-add popular Indian varieties */}
          {recommendedIndianPlants.length > 0 && (
            <div className="pt-2 max-w-lg mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Quick-Add Common Indian Terrace Plants:
              </span>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {recommendedIndianPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => onToggleGarden(plant.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                    <span>{plant.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onBrowseReference}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse All 20 Reference Plants</span>
            </button>
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Plant</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search & Filters for Owned Plants */}
          <GardenFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedSunlight={selectedSunlight}
            onSunlightChange={setSelectedSunlight}
            selectedWater={selectedWater}
            onWaterChange={setSelectedWater}
            onlyBloomingNow={onlyBloomingNow}
            onOnlyBloomingNowChange={setOnlyBloomingNow}
            currentMonthIndex={currentMonthIndex}
            totalCount={ownedPlants.length}
            filteredCount={filteredOwnedPlants.length}
            onClearAll={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedSunlight('all');
              setSelectedWater('all');
              setOnlyBloomingNow(false);
            }}
          />

          {/* Plant Grid */}
          {filteredOwnedPlants.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                No plants in My Garden match this filter
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try clearing your search query or adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSunlight('all');
                  setSelectedWater('all');
                  setOnlyBloomingNow(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {filteredOwnedPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  currentMonthIndex={currentMonthIndex}
                  onSelect={(p) => onSelectPlant(p)}
                  onToggleFavorite={onToggleFavorite}
                  onToggleGarden={onToggleGarden}
                />
              ))}
            </div>
          )}

          {/* Bottom Bar: Explore Reference Library */}
          <div className="bg-gradient-to-r from-emerald-50 to-stone-100 p-5 rounded-3xl border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div>
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <span>Explore the 20-Plant Indian Reference Guide</span>
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Looking to add new herbs, flowering perennials, or vegetables to your terrace? Browse complete care specs, pruning rules, and Indian kitchen remedies.
              </p>
            </div>
            <button
              onClick={onBrowseReference}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs transition-all active:scale-95"
            >
              <span>View Full Reference Guide</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
