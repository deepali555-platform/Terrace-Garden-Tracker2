import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plant, PlantCategory, SunlightType, WaterLevel, HealthScanRecord } from './types/plant';
import { storageService } from './services/storageService';
import { isPlantBloomingMonth, MONTHS } from './utils/gardenHelpers';
import { calculateFertilizerStatus } from './utils/fertilizerHelpers';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PlantCard } from './components/PlantCard';
import { PlantDetailModal } from './components/PlantDetailModal';
import { PlantFormModal } from './components/PlantFormModal';
import { SeasonalRemindersView } from './components/SeasonalRemindersView';
import { DiseaseDiagnosisView } from './components/DiseaseDiagnosisView';
import { FertilizerScheduleView } from './components/FertilizerScheduleView';
import { PlantHealthScannerModal } from './components/PlantHealthScannerModal';
import { GardenFilters } from './components/GardenFilters';
import { GardenStatsBar } from './components/GardenStatsBar';
import {
  Sprout,
  Plus,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Stethoscope,
  Info,
  Sparkles,
  Camera,
  BookOpen,
  Search,
  X,
} from 'lucide-react';

export default function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentTab, setCurrentTab] = useState<'my-garden' | 'home' | 'reminders' | 'diagnosis' | 'fertilizer'>('my-garden');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filters state for Reference Guide
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PlantCategory | 'all'>('all');
  const [selectedSunlight, setSelectedSunlight] = useState<SunlightType | 'all'>('all');
  const [selectedWater, setSelectedWater] = useState<WaterLevel | 'all'>('all');
  const [onlyBloomingNow, setOnlyBloomingNow] = useState(false);

  // Search & Filter state for My Garden
  const [gardenSearchQuery, setGardenSearchQuery] = useState('');
  const [gardenSelectedCategory, setGardenSelectedCategory] = useState<PlantCategory | 'all'>('all');

  // Modals & Selection state
  const [selectedPlantForDetail, setSelectedPlantForDetail] = useState<Plant | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState<Plant | null>(null);
  const [preselectedDiagnosisPlantId, setPreselectedDiagnosisPlantId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanModalPlant, setScanModalPlant] = useState<Plant | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current Month index (1 to 12)
  const currentMonthIndex = useMemo(() => {
    return new Date().getMonth() + 1; // 1-12
  }, []);

  const currentMonthName = MONTHS[currentMonthIndex - 1]?.name || 'September';

  // Load plants on mount
  useEffect(() => {
    const loaded = storageService.getPlants();
    setPlants(loaded);
  }, []);

  // Filter ONLY plants marked as "In My Garden"
  const ownedPlants = useMemo(() => {
    return plants.filter((p) => Boolean(p.inMyGarden));
  }, [plants]);

  // Calculate overdue fertilizer count ONLY for owned plants
  const overdueFertilizerCount = useMemo(() => {
    return ownedPlants.filter((p) => calculateFertilizerStatus(p).isOverdue).length;
  }, [ownedPlants]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Add / Edit Plant handlers
  const handleOpenAddModal = () => {
    setPlantToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (plant: Plant) => {
    setPlantToEdit(plant);
    setIsFormModalOpen(true);
  };

  const handleSavePlant = (savedPlant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'> | Plant) => {
    if ('id' in savedPlant && savedPlant.id) {
      // Update existing
      const updated = storageService.updatePlant(savedPlant as Plant);
      setPlants((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedPlantForDetail?.id === updated.id) {
        setSelectedPlantForDetail(updated);
      }
      showToast(`Updated care guide for ${updated.name}`);
    } else {
      // Add new
      const created = storageService.addPlant(savedPlant);
      setPlants((prev) => [created, ...prev]);
      showToast(`Added ${created.name} to your garden!`);
    }
  };

  // Delete plant handler
  const handleDeletePlant = (id: string) => {
    const target = plants.find((p) => p.id === id);
    const success = storageService.deletePlant(id);
    if (success) {
      setPlants((prev) => prev.filter((p) => p.id !== id));
      if (selectedPlantForDetail?.id === id) {
        setSelectedPlantForDetail(null);
      }
      showToast(`Deleted ${target?.name || 'plant'} from tracker`);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.toggleFavorite(id);
    if (updated) {
      setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: updated.isFavorite } : p)));
      if (selectedPlantForDetail?.id === id) {
        setSelectedPlantForDetail({ ...selectedPlantForDetail, isFavorite: updated.isFavorite });
      }
    }
  };

  // Toggle "In My Garden"
  const handleToggleInMyGarden = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const updated = storageService.toggleInMyGarden(id);
    if (updated) {
      setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, inMyGarden: updated.inMyGarden } : p)));
      if (selectedPlantForDetail?.id === id) {
        setSelectedPlantForDetail({ ...selectedPlantForDetail, inMyGarden: updated.inMyGarden });
      }
      showToast(
        updated.inMyGarden
          ? `Added ${updated.name} to My Garden!`
          : `Removed ${updated.name} from My Garden (feed & scan history saved)`
      );
    }
  };

  // Update Plant Photo (upload or reset)
  const handleUpdatePlantPhoto = (plantId: string, photoDataUrl: string | null) => {
    const updated = storageService.updatePlantPhoto(plantId, photoDataUrl);
    if (updated) {
      setPlants((prev) => prev.map((p) => (p.id === plantId ? updated : p)));
      if (selectedPlantForDetail?.id === plantId) {
        setSelectedPlantForDetail(updated);
      }
      showToast(photoDataUrl ? `Updated photo for ${updated.name}!` : `Reset photo to default for ${updated.name}`);
    }
  };

  // Reset to default Indian seed plants
  const handleResetDefaults = () => {
    const defaults = storageService.resetToDefaults();
    setPlants(defaults);
    setSelectedPlantForDetail(null);
    setShowResetConfirm(false);
    showToast('Reset plant list to 21 authentic Indian terrace species!');
  };

  // Export JSON backup
  const handleExportJson = () => {
    const jsonStr = storageService.exportToJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terrace-garden-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Garden database downloaded as JSON backup.');
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importFromJson(content);
      if (res.success) {
        setPlants(storageService.getPlants());
        showToast(`Successfully imported ${res.count} plants from backup!`);
      } else {
        alert(res.error || 'Failed to import backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Open Plant Health Scanner Modal
  const handleOpenScanModal = (plant?: Plant) => {
    setScanModalPlant(plant || null);
    setIsScanModalOpen(true);
  };

  // Save Scan Record to Plant History
  const handleSaveScanRecord = (plantId: string, record: HealthScanRecord) => {
    const updated = storageService.saveScanRecord(plantId, record);
    if (updated) {
      setPlants((prev) => prev.map((p) => (p.id === plantId ? updated : p)));
      if (selectedPlantForDetail?.id === plantId) {
        setSelectedPlantForDetail(updated);
      }
      showToast(`Health diagnosis logged for ${updated.name}!`);
    }
  };

  // Delete Scan Record
  const handleDeleteScanRecord = (plantId: string, scanId: string) => {
    const updated = storageService.deleteScanRecord(plantId, scanId);
    if (updated) {
      setPlants((prev) => prev.map((p) => (p.id === plantId ? updated : p)));
      if (selectedPlantForDetail?.id === plantId) {
        setSelectedPlantForDetail(updated);
      }
      showToast('Health scan log entry removed');
    }
  };

  // Record Fertilization
  const handleMarkFertilized = (plantId: string, dateStr?: string) => {
    const updated = storageService.recordFertilization(plantId, dateStr);
    if (updated) {
      setPlants((prev) => prev.map((p) => (p.id === plantId ? updated : p)));
      if (selectedPlantForDetail?.id === plantId) {
        setSelectedPlantForDetail(updated);
      }
      showToast(`Logged fertilization for ${updated.name}! Next due date recalculated.`);
    }
  };

  // Navigate to Diagnosis with a specific plant
  const handleDiagnosePlant = (plantId: string) => {
    setPreselectedDiagnosisPlantId(plantId);
    setCurrentTab('diagnosis');
  };

  // Filtered plants for My Garden Tab
  const filteredGardenPlants = useMemo(() => {
    return ownedPlants.filter((plant) => {
      if (gardenSearchQuery.trim() !== '') {
        const query = gardenSearchQuery.toLowerCase().trim();
        const matchesName = plant.name.toLowerCase().includes(query);
        const matchesBotanical = plant.botanicalName?.toLowerCase().includes(query);
        const matchesHindi = plant.hindiName?.toLowerCase().includes(query);
        const matchesCategory = plant.category.toLowerCase().includes(query);
        if (!matchesName && !matchesBotanical && !matchesHindi && !matchesCategory) {
          return false;
        }
      }
      if (gardenSelectedCategory !== 'all' && plant.category !== gardenSelectedCategory) {
        return false;
      }
      return true;
    });
  }, [ownedPlants, gardenSearchQuery, gardenSelectedCategory]);

  // Filter plants for Reference Guide Screen
  const filteredReferencePlants = useMemo(() => {
    return plants.filter((plant) => {
      // 1. Search text match
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

      // 2. Category filter
      if (selectedCategory !== 'all' && plant.category !== selectedCategory) {
        return false;
      }

      // 3. Sunlight filter
      if (selectedSunlight !== 'all' && plant.sunlightRequirement.type !== selectedSunlight) {
        return false;
      }

      // 4. Water filter
      if (selectedWater !== 'all' && plant.waterRequirement.level !== selectedWater) {
        return false;
      }

      // 5. Blooming Now filter
      if (onlyBloomingNow) {
        if (!isPlantBloomingMonth(plant, currentMonthIndex)) {
          return false;
        }
      }

      return true;
    });
  }, [
    plants,
    searchQuery,
    selectedCategory,
    selectedSunlight,
    selectedWater,
    onlyBloomingNow,
    currentMonthIndex,
  ]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSunlight('all');
    setSelectedWater('all');
    setOnlyBloomingNow(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f4ea] text-stone-900 flex flex-col pb-36 lg:pb-16 overflow-x-hidden w-full">
      {/* 3-Zone Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'diagnosis') {
            setPreselectedDiagnosisPlantId(null);
          }
        }}
        onOpenAddModal={handleOpenAddModal}
        onOpenScanModal={() => handleOpenScanModal()}
        overdueFertilizerCount={overdueFertilizerCount}
        gardenPlantCount={ownedPlants.length}
        totalPlantCount={plants.length}
        onResetDefaults={() => setShowResetConfirm(true)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-2 text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex-1 space-y-5 sm:space-y-6">
        {/* VIEW 1: MY GARDEN (Owned Plants Only) */}
        {currentTab === 'my-garden' && (
          <div className="space-y-5 sm:space-y-6">
            {/* My Garden Hero Banner */}
            <div className="bg-gradient-to-br from-[#0c2f1b] via-[#144929] to-[#1c5d36] text-stone-100 rounded-3xl p-5 sm:p-8 relative overflow-hidden shadow-md border border-emerald-700/40">
              <div className="max-w-2xl relative z-10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-300">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  <span>My Active Terrace & Balcony Garden</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-2.5 flex-wrap">
                  <span>My Garden</span>
                  <span className="text-xs sm:text-base font-bold bg-emerald-800/80 text-emerald-200 px-3 py-0.5 sm:py-1 rounded-full border border-emerald-500/40">
                    {ownedPlants.length} {ownedPlants.length === 1 ? 'plant' : 'plants'}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                  Showing plants you actively grow. Personalized fertilizer schedules, seasonal pruning reminders, and AI health histories only track these plants.
                </p>

                {/* Quick Shortcuts - Generous Mobile Touch Targets */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('fertilizer')}
                    className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-950/70 hover:bg-emerald-900 text-xs font-bold text-emerald-100 rounded-xl border border-emerald-500/40 shadow-xs transition-all relative active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Fertilizer Schedule</span>
                    {overdueFertilizerCount > 0 && (
                      <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {overdueFertilizerCount} overdue
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenScanModal()}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-stone-900" />
                    <span>Scan Plant (AI)</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('reminders')}
                    className="min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2.5 bg-emerald-950/70 hover:bg-emerald-900 text-xs font-bold text-emerald-100 rounded-xl border border-emerald-500/40 shadow-xs transition-all active:scale-95"
                  >
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span>{currentMonthName} Reminders</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-xs font-bold text-white rounded-xl shadow-xs transition-all border border-white/20 active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-300" />
                    <span>Browse All 21 Plants</span>
                  </button>
                </div>
              </div>

              {/* Decorative subtle botanical background illustration */}
              <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-emerald-100">
                <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
            </div>

            {/* Quick Stats Summary for Owned Plants */}
            <GardenStatsBar
              plants={ownedPlants}
              currentMonthIndex={currentMonthIndex}
              onOpenFertilizer={() => setCurrentTab('fertilizer')}
            />

            {/* Owned Plants Empty State OR Grid */}
            {ownedPlants.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-2xs">
                  <Sprout className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-stone-900">
                    Your garden list is currently empty
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    You haven&apos;t marked any plants as owned yet. All 21 authentic Indian species remain fully browsable in the Reference Guide. Click &quot;Add to Garden&quot; on any plants you grow to track feeding and seasonal tasks!
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-200" />
                    <span>Browse 21 Reference Plants</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Search & Category Filter for My Garden */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={gardenSearchQuery}
                      onChange={(e) => setGardenSearchQuery(e.target.value)}
                      placeholder="Search my garden..."
                      className="w-full min-h-[44px] pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700"
                    />
                    {gardenSearchQuery && (
                      <button
                        onClick={() => setGardenSearchQuery('')}
                        className="w-8 h-8 flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {['all', 'Flowering', 'Herb', 'Foliage', 'Vegetable', 'Succulent', 'Fruit'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setGardenSelectedCategory(cat as PlantCategory | 'all')}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors active:scale-95 ${
                          gardenSelectedCategory === cat
                            ? 'bg-emerald-800 text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid of Owned Plant Cards */}
                {filteredGardenPlants.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-2">
                    <p className="text-xs font-semibold text-stone-600">No garden plants match your search</p>
                    <button
                      onClick={() => {
                        setGardenSearchQuery('');
                        setGardenSelectedCategory('all');
                      }}
                      className="min-h-[44px] inline-flex items-center px-4 text-xs text-emerald-800 underline font-bold"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredGardenPlants.map((plant) => (
                      <PlantCard
                        key={plant.id}
                        plant={plant}
                        currentMonthIndex={currentMonthIndex}
                        onSelect={(p) => setSelectedPlantForDetail(p)}
                        onToggleFavorite={handleToggleFavorite}
                        onToggleGarden={handleToggleInMyGarden}
                      />
                    ))}
                  </div>
                )}

                {/* Helpful link to explore full reference guide */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                    <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Want to add more plants? All 21 authentic Indian species are in the Reference Guide.</span>
                  </div>
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="min-h-[44px] inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline shrink-0"
                  >
                    <span>Open Reference Guide →</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: FULL REFERENCE GUIDE (All 21 Plants, Browsable at All Times) */}
        {currentTab === 'home' && (
          <div className="space-y-6">
            {/* Reference Guide Header Banner */}
            <div className="bg-gradient-to-br from-[#1c3e27] via-[#244b30] to-[#1a3824] text-stone-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md border border-emerald-700/40">
              <div className="max-w-2xl relative z-10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-300">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Indian Balcony & Terrace Reference Database</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-3">
                  <span>Plant Reference Guide</span>
                  <span className="text-sm sm:text-base font-bold bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-600/40">
                    {plants.length} species
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                  Comprehensive care instructions, sunlight requirements, potting mixes, and Indian kitchen remedies. Use the &quot;+ Add to Garden&quot; button on any plant you grow to track customized feeding schedules and seasonal tasks.
                </p>

                {/* Switcher & Action buttons - Generous touch targets */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setCurrentTab('my-garden')}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Sprout className="w-4 h-4 text-emerald-200" />
                    <span>View My Garden ({ownedPlants.length})</span>
                  </button>
                  <button
                    onClick={() => handleOpenScanModal()}
                    className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-stone-900" />
                    <span>Scan Plant (AI)</span>
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-xs transition-all ml-auto border border-emerald-600/50 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add Custom Plant</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Search Bar & Category/Sun/Water/Flowering Filters */}
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
              totalCount={plants.length}
              filteredCount={filteredReferencePlants.length}
              onClearAll={handleClearAllFilters}
            />

            {/* Plant Cards Grid (All 21 Plants Always Visible) */}
            {filteredReferencePlants.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200/80 p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  No plants match your active filter criteria
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Try adjusting your search query, or clear filters to view all {plants.length} plants in the reference database.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={handleClearAllFilters}
                    className="min-h-[44px] px-4 py-2 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors active:scale-95"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReferencePlants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                    currentMonthIndex={currentMonthIndex}
                    onSelect={(p) => setSelectedPlantForDetail(p)}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleGarden={handleToggleInMyGarden}
                  />
                ))}
              </div>
            )}

            {/* Footer Utilities: Backup, Export, Reset */}
            <div className="pt-6 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <span>Terrace Garden Tracker · Offline local storage</span>
              </div>

              <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                {/* Export Backup */}
                <button
                  onClick={handleExportJson}
                  className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-700 transition-colors active:scale-95"
                  title="Download garden backup file"
                >
                  <Download className="w-4 h-4 text-stone-500" />
                  <span>Backup (JSON)</span>
                </button>

                {/* Import Backup */}
                <label className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-700 transition-colors cursor-pointer active:scale-95">
                  <Upload className="w-4 h-4 text-stone-500" />
                  <span>Restore</span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>

                {/* Reset to Default 21 Indian Plants */}
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-stone-200 hover:bg-stone-50 rounded-xl text-stone-700 transition-colors active:scale-95"
                  title="Reset to 21 default Indian plants"
                >
                  <RotateCcw className="w-4 h-4 text-stone-500" />
                  <span>Reset Database</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: SEASONAL REMINDERS (Defaults to My Garden, toggleable to All Reference) */}
        {currentTab === 'reminders' && (
          <SeasonalRemindersView
            plants={plants}
            currentMonthIndex={currentMonthIndex}
            onSelectPlant={(p) => setSelectedPlantForDetail(p)}
            onOpenMyGarden={() => setCurrentTab('my-garden')}
          />
        )}

        {/* VIEW 4: DISEASE DIAGNOSIS & INDIAN KITCHEN REMEDIES */}
        {currentTab === 'diagnosis' && (
          <DiseaseDiagnosisView
            plants={plants}
            preselectedPlantId={preselectedDiagnosisPlantId}
            onSelectPlantDetail={(p) => setSelectedPlantForDetail(p)}
          />
        )}

        {/* VIEW 5: FERTILIZER SCHEDULE TRACKER (Only for Plants in My Garden) */}
        {currentTab === 'fertilizer' && (
          <FertilizerScheduleView
            plants={ownedPlants}
            onMarkFertilized={handleMarkFertilized}
            onSelectPlant={(p) => setSelectedPlantForDetail(p)}
            onBrowseReference={() => setCurrentTab('home')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'diagnosis') {
            setPreselectedDiagnosisPlantId(null);
          }
        }}
        onOpenScanModal={() => handleOpenScanModal()}
        overdueFertilizerCount={overdueFertilizerCount}
        gardenPlantCount={ownedPlants.length}
      />

      {/* MODAL 1: Plant Detail Modal (All 12 Fields) */}
      {selectedPlantForDetail && (
        <PlantDetailModal
          plant={selectedPlantForDetail}
          currentMonthIndex={currentMonthIndex}
          onClose={() => setSelectedPlantForDetail(null)}
          onEdit={(p) => {
            setSelectedPlantForDetail(null);
            handleOpenEditModal(p);
          }}
          onDelete={(id) => handleDeletePlant(id)}
          onToggleFavorite={handleToggleFavorite}
          onToggleInMyGarden={handleToggleInMyGarden}
          onDiagnosePlant={handleDiagnosePlant}
          onUpdatePhoto={handleUpdatePlantPhoto}
          onOpenScanModal={handleOpenScanModal}
          onMarkFertilized={handleMarkFertilized}
          onDeleteScanRecord={handleDeleteScanRecord}
        />
      )}

      {/* MODAL 2: Add / Edit Plant Form Modal */}
      {isFormModalOpen && (
        <PlantFormModal
          initialPlant={plantToEdit}
          onSave={handleSavePlant}
          onClose={() => {
            setIsFormModalOpen(false);
            setPlantToEdit(null);
          }}
        />
      )}

      {/* MODAL 3: Plant Health Scanner AI Modal */}
      <PlantHealthScannerModal
        isOpen={isScanModalOpen}
        initialPlant={scanModalPlant}
        allPlants={plants}
        onClose={() => {
          setIsScanModalOpen(false);
          setScanModalPlant(null);
        }}
        onScanSaved={handleSaveScanRecord}
      />

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Reset Plant Database?
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                This will reset your tracker to the pre-populated set of 20 authentic Indian terrace plants (Tulsi, Desi Rose, Curry Leaf, Hibiscus, Marigold, Tomato, Mogra, etc.) with all 12 care fields and home remedies. Any custom plants you added will be replaced.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-950 rounded-xl shadow-xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
