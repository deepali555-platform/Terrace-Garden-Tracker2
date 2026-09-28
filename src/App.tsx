import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plant, PlantCategory, SunlightType, WaterLevel, HealthScanRecord } from './types/plant';
import { storageService } from './services/storageService';
import { firestoreStorageService, UserPlantStateDoc } from './services/firestoreStorageService';
import { INITIAL_PLANTS } from './data/seedPlants';
import { VERIFIED_PLANT_IMAGES } from './data/plantImages';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
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
import { AdminView } from './components/AdminView';
import { isUserAdmin } from './config/adminConfig';
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
  Leaf,
  User as UserIcon,
} from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, isGuest } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);

  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentTab, setCurrentTab] = useState<'my-garden' | 'home' | 'reminders' | 'diagnosis' | 'fertilizer' | 'admin'>('home');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Pending action & contextual auth prompt state
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);

  const requireAuth = (action: () => void | Promise<void>, reason: string) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setAuthPromptReason(reason);
      setShowLoginModal(true);
    }
  };

  // Run pending action once user completes login
  useEffect(() => {
    if (user && pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      setShowLoginModal(false);
      setAuthPromptReason(null);
      act();
    }
  }, [user, pendingAction]);

  const handleSelectTab = (tab: 'my-garden' | 'home' | 'reminders' | 'diagnosis' | 'fertilizer' | 'admin') => {
    if (tab === 'home') {
      setCurrentTab('home');
      return;
    }

    if (tab === 'admin') {
      if (user && isUserAdmin(user.email)) {
        setCurrentTab('admin');
        return;
      }
      if (!user) {
        requireAuth(() => {
          setCurrentTab('admin');
        }, 'Sign in with your administrator account to access the Admin Portal.');
        return;
      }
      showToast('Access restricted: your account is not an authorized administrator.');
      return;
    }

    const tabDescriptions: Record<string, string> = {
      'my-garden': 'My Garden',
      'fertilizer': 'Fertilizer Schedule',
      'reminders': 'Seasonal Reminders',
      'diagnosis': 'AI Health Scanner',
    };

    requireAuth(() => {
      setCurrentTab(tab);
      if (tab !== 'diagnosis') {
        setPreselectedDiagnosisPlantId(null);
      }
    }, `Sign in with Google to view and manage your ${tabDescriptions[tab] || 'private garden'}.`);
  };

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
  const resultsGridRef = useRef<HTMLDivElement>(null);
  const gardenResultsGridRef = useRef<HTMLDivElement>(null);
  const [highlightedPlantId, setHighlightedPlantId] = useState<string | null>(null);

  // Current Month index (1 to 12)
  const currentMonthIndex = useMemo(() => {
    return new Date().getMonth() + 1; // 1-12
  }, []);

  const currentMonthName = MONTHS[currentMonthIndex - 1]?.name || 'September';

  // User private plant state overlay (inMyGarden, isFavorite, lastFertilizedDate, customPhotoUrl, scanHistory)
  const userPlantStatesRef = useRef<Map<string, UserPlantStateDoc>>(new Map());

  // Real-time listener for shared catalog + user private state overlay
  useEffect(() => {
    let unsubscribeShared: (() => void) | null = null;
    let isCancelled = false;

    async function initPlants() {
      setIsLoadingPlants(true);

      if (user) {
        // Authenticated: load private state docs from Firestore users/{uid}/userPlants
        try {
          const userPlantsSnap = await firestoreStorageService.loadUserPlantStates(user.uid);
          if (!isCancelled) {
            userPlantStatesRef.current = userPlantsSnap;
          }
          // Trigger background migration of any legacy custom plants (and local storage)
          firestoreStorageService.migrateLegacyCustomPlants(user.uid, user).catch(() => {});
        } catch (err) {
          console.warn('Failed to load private user plant states:', err);
        }
      } else {
        userPlantStatesRef.current = new Map();
      }

      // Real-time subscription to shared catalog
      unsubscribeShared = firestoreStorageService.subscribeToSharedPlants((sharedPlants) => {
        if (isCancelled) return;

        const sharedIds = new Set(sharedPlants.map((p) => p.id));
        const filteredSeed = INITIAL_PLANTS.filter((sp) => !sharedIds.has(sp.id));
        const allReferenceCatalog = [...filteredSeed, ...sharedPlants];

        // If guest, grab local storage overrides
        const localPlantsMap = !user
          ? new Map(storageService.getPlants().map((p) => [p.id, p]))
          : null;

        const merged: Plant[] = allReferenceCatalog.map((basePlant) => {
          const userState = userPlantStatesRef.current.get(basePlant.id);
          const verified = VERIFIED_PLANT_IMAGES[basePlant.id];
          const localOverride = localPlantsMap?.get(basePlant.id);

          const isCreator = Boolean(user && basePlant.addedByUserId && basePlant.addedByUserId === user.uid);

          const inGarden = user
            ? userState
              ? Boolean(userState.inMyGarden)
              : isCreator // Creator owns their added plant by default
            : localOverride
            ? Boolean(localOverride.inMyGarden)
            : false;

          const isFav = user
            ? Boolean(userState?.isFavorite)
            : Boolean(localOverride?.isFavorite);

          return {
            ...basePlant,
            imageUrl: basePlant.imageUrl || verified?.imageUrl,
            inMyGarden: inGarden,
            isFavorite: isFav,
            lastFertilizedDate: user
              ? userState?.lastFertilizedDate
              : localOverride?.lastFertilizedDate,
            customPhotoUrl: user
              ? userState?.customPhotoUrl
              : localOverride?.customPhotoUrl,
            scanHistory: user
              ? userState?.scanHistory || []
              : localOverride?.scanHistory || [],
          };
        });

        setPlants(merged);
        setIsLoadingPlants(false);

        // Update selectedPlantForDetail if currently open
        setSelectedPlantForDetail((currentSelected) => {
          if (!currentSelected) return null;
          const fresh = merged.find((p) => p.id === currentSelected.id);
          return fresh || null;
        });
      });
    }

    if (!authLoading) {
      initPlants();
    }

    return () => {
      isCancelled = true;
      if (unsubscribeShared) {
        unsubscribeShared();
      }
    };
  }, [user, authLoading]);

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
    requireAuth(() => {
      setPlantToEdit(null);
      setIsFormModalOpen(true);
    }, 'Sign in with Google to add plants to the shared community catalog.');
  };

  const handleOpenEditModal = (plant: Plant) => {
    requireAuth(() => {
      setPlantToEdit(plant);
      setIsFormModalOpen(true);
    }, `Sign in with Google to edit care details for ${plant.name}.`);
  };

  const handleSavePlant = async (savedPlant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'> | Plant) => {
    if ('id' in savedPlant && savedPlant.id) {
      // Update existing plant in shared catalog
      const existingId = savedPlant.id;
      const updated = {
        ...savedPlant,
        updatedAt: new Date().toISOString(),
      } as Plant;

      // Optimistic update
      setPlants((prev) => prev.map((p) => (p.id === existingId ? updated : p)));
      if (selectedPlantForDetail?.id === existingId) {
        setSelectedPlantForDetail(updated);
      }

      if (user) {
        try {
          await firestoreStorageService.updateSharedPlant(user, updated);
        } catch (err) {
          console.error('Failed to update plant in shared catalog:', err);
          showToast('Could not save update to shared catalog');
          return;
        }
      } else {
        storageService.updatePlant(updated);
      }
      showToast(`Updated care guide for ${updated.name}`);
    } else {
      // Add new: directly save to shared/common catalog
      if (user) {
        const result = await firestoreStorageService.addSharedPlant(
          { uid: user.uid, email: user.email, displayName: user.displayName },
          savedPlant,
          plants
        );

        if (!result.success || !result.plant) {
          if (result.existingPlant) {
            showToast(`"${result.existingPlant.name}" already exists in the catalog!`);
            setSelectedPlantForDetail(result.existingPlant);
          } else {
            showToast(result.error || 'Failed to add plant');
          }
          return;
        }

        const created = result.plant;
        userPlantStatesRef.current.set(created.id, {
          id: created.id,
          userId: user.uid,
          inMyGarden: true,
          updatedAt: new Date().toISOString(),
        });

        setPlants((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
        showToast(`Added ${created.name} to shared catalog and your garden!`);
      } else {
        const created = storageService.addPlant(savedPlant);
        setPlants((prev) => [created, ...prev]);
        showToast(`Added ${created.name} to your garden!`);
      }
    }
  };

  // Delete plant handler
  const handleDeletePlant = async (id: string) => {
    const target = plants.find((p) => p.id === id);
    setPlants((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlantForDetail?.id === id) {
      setSelectedPlantForDetail(null);
    }

    if (user) {
      try {
        await firestoreStorageService.deleteSharedPlant(user.uid, id);
        userPlantStatesRef.current.delete(id);
        showToast(`Deleted ${target?.name || 'plant'} from shared catalog`);
      } catch (err) {
        console.error('Failed to delete plant from shared catalog:', err);
        showToast('Failed to delete plant from shared catalog');
      }
    } else {
      storageService.deletePlant(id);
      showToast(`Deleted ${target?.name || 'plant'} from tracker`);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = plants.find((p) => p.id === id);
    requireAuth(async () => {
      const updated = storageService.toggleFavorite(id);
      if (updated) {
        setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: updated.isFavorite } : p)));
        if (selectedPlantForDetail?.id === id) {
          setSelectedPlantForDetail({ ...selectedPlantForDetail, isFavorite: updated.isFavorite });
        }
        if (user) {
          const full = plants.find((p) => p.id === id);
          if (full) {
            await firestoreStorageService.syncUserPlantState(user.uid, { ...full, isFavorite: updated.isFavorite });
          }
        }
      }
    }, `Sign in with Google to save ${target?.name || 'this plant'} to your favorites.`);
  };

  // Toggle "In My Garden"
  const handleToggleInMyGarden = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const target = plants.find((p) => p.id === id);
    requireAuth(async () => {
      const currentVal = Boolean(target?.inMyGarden);
      const nextVal = !currentVal;

      setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, inMyGarden: nextVal } : p)));
      if (selectedPlantForDetail?.id === id) {
        setSelectedPlantForDetail((prev) => (prev ? { ...prev, inMyGarden: nextVal } : null));
      }

      if (user) {
        const existingState = userPlantStatesRef.current.get(id);
        const updatedState: UserPlantStateDoc = {
          ...(existingState || {
            id,
            userId: user.uid,
            scanHistory: [],
          }),
          id,
          userId: user.uid,
          inMyGarden: nextVal,
          updatedAt: new Date().toISOString(),
        };
        userPlantStatesRef.current.set(id, updatedState);
        if (target) {
          await firestoreStorageService.syncUserPlantState(user.uid, { ...target, inMyGarden: nextVal });
        }
      } else {
        storageService.toggleInMyGarden(id);
      }

      showToast(
        nextVal
          ? `Added ${target?.name || 'plant'} to My Garden!`
          : `Removed ${target?.name || 'plant'} from My Garden`
      );
    }, `Sign in with Google to add ${target?.name || 'this plant'} to your garden and track care schedules.`);
  };

  // Update Plant Photo (upload or reset)
  const handleUpdatePlantPhoto = (plantId: string, photoDataUrl: string | null) => {
    const target = plants.find((p) => p.id === plantId);
    requireAuth(async () => {
      const updated = storageService.updatePlantPhoto(plantId, photoDataUrl);
      if (updated) {
        setPlants((prev) => prev.map((p) => (p.id === plantId ? updated : p)));
        if (selectedPlantForDetail?.id === plantId) {
          setSelectedPlantForDetail(updated);
        }
        if (user) {
          await firestoreStorageService.syncUserPlantState(user.uid, updated);
        }
        showToast(photoDataUrl ? `Updated photo for ${updated.name}!` : `Reset photo to default for ${updated.name}`);
      }
    }, `Sign in with Google to customize photos for ${target?.name || 'this plant'}.`);
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
    requireAuth(() => {
      setScanModalPlant(plant || null);
      setIsScanModalOpen(true);
    }, 'Sign in with Google to diagnose plant diseases and save scan histories to your account.');
  };

  // Save Scan Record to Plant History
  const handleSaveScanRecord = async (plantId: string, record: HealthScanRecord) => {
    const updated = storageService.saveScanRecord(plantId, record);
    if (updated) {
      setPlants((prev) => prev.map((p) => (p.id === plantId ? updated : p)));
      if (selectedPlantForDetail?.id === plantId) {
        setSelectedPlantForDetail(updated);
      }
      if (user) {
        await firestoreStorageService.syncUserPlantState(user.uid, updated);
      }
      showToast(`Health diagnosis logged for ${updated.name}!`);
    }
  };

  // Delete Scan Record
  const handleDeleteScanRecord = async (plantId: string, scanId: string) => {
    const updated = storageService.deleteScanRecord(plantId, scanId);
    if (updated) {
      setPlants((prev) => prev.map((p) => (p.id === plantId ? updated : p)));
      if (selectedPlantForDetail?.id === plantId) {
        setSelectedPlantForDetail(updated);
      }
      if (user) {
        await firestoreStorageService.syncUserPlantState(user.uid, updated);
      }
      showToast('Health scan log entry removed');
    }
  };

  // Record Fertilization
  const handleMarkFertilized = (plantId: string, dateStr?: string) => {
    const target = plants.find((p) => p.id === plantId);
    requireAuth(async () => {
      const updated = storageService.recordFertilization(plantId, dateStr);
      if (updated) {
        setPlants((prev) => prev.map((p) => (p.id === plantId ? updated : p)));
        if (selectedPlantForDetail?.id === plantId) {
          setSelectedPlantForDetail(updated);
        }
        if (user) {
          await firestoreStorageService.syncUserPlantState(user.uid, updated);
        }
        showToast(`Logged fertilization for ${updated.name}! Next due date recalculated.`);
      }
    }, `Sign in with Google to log fertilization for ${target?.name || 'this plant'}.`);
  };

  // Navigate to Diagnosis with a specific plant
  const handleDiagnosePlant = (plantId: string) => {
    requireAuth(() => {
      setPreselectedDiagnosisPlantId(plantId);
      setCurrentTab('diagnosis');
    }, 'Sign in with Google to diagnose plant issues and save scan histories.');
  };

  // Helper function to rank search relevance: exact matches > startsWith > word matches > contains
  const getSearchRelevanceScore = (plant: Plant, rawQuery: string): number => {
    const q = rawQuery.toLowerCase().trim();
    if (!q) return 0;

    const name = plant.name.toLowerCase();
    const botanical = (plant.botanicalName || '').toLowerCase();
    const hindi = (plant.hindiName || '').toLowerCase();
    const category = plant.category.toLowerCase();

    // 1. Exact matches (Highest Priority)
    if (name === q) return 100;
    if (hindi === q) return 95;

    // 2. Starts with query
    if (name.startsWith(q)) return 85;
    if (hindi.startsWith(q)) return 80;

    // 3. Word inside name starts with query (e.g. "Rose" in "Indian Rose", "Tulsi" in "Holy Basil (Tulsi)")
    const nameWords = name.split(/[\s,()/-]+/);
    if (nameWords.some((w) => w.startsWith(q))) return 75;

    const hindiWords = hindi.split(/[\s,()/-]+/);
    if (hindiWords.some((w) => w.startsWith(q))) return 70;

    // 4. Substring in name or Hindi
    if (name.includes(q)) return 60;
    if (hindi.includes(q)) return 55;

    // 5. Botanical name matches
    if (botanical.startsWith(q)) return 50;
    if (botanical.includes(q)) return 40;

    // 6. Category matches
    if (category === q) return 35;
    if (category.includes(q)) return 25;

    return 0;
  };

  // Filtered plants for My Garden Tab
  const filteredGardenPlants = useMemo(() => {
    const q = gardenSearchQuery.trim();
    const matches = ownedPlants.filter((plant) => {
      if (q !== '') {
        const score = getSearchRelevanceScore(plant, q);
        if (score === 0) return false;
      }
      if (gardenSelectedCategory !== 'all' && plant.category !== gardenSelectedCategory) {
        return false;
      }
      return true;
    });

    if (q !== '') {
      return [...matches].sort((a, b) => {
        return getSearchRelevanceScore(b, q) - getSearchRelevanceScore(a, q);
      });
    }

    return matches;
  }, [ownedPlants, gardenSearchQuery, gardenSelectedCategory]);

  // Filter plants for Reference Guide Screen (Ranked with Exact Matches First)
  const filteredReferencePlants = useMemo(() => {
    const q = searchQuery.trim();

    const matches = plants.filter((plant) => {
      // 1. Search text match
      if (q !== '') {
        const score = getSearchRelevanceScore(plant, q);
        if (score === 0) {
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

    // If search query is active, sort by relevance score so best match is at the very top
    if (q !== '') {
      return [...matches].sort((a, b) => {
        return getSearchRelevanceScore(b, q) - getSearchRelevanceScore(a, q);
      });
    }

    return matches;
  }, [
    plants,
    searchQuery,
    selectedCategory,
    selectedSunlight,
    selectedWater,
    onlyBloomingNow,
    currentMonthIndex,
  ]);

  // Auto-scroll effect for Reference Guide Search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setHighlightedPlantId(null);
      return;
    }

    const timer = setTimeout(() => {
      if (filteredReferencePlants.length === 0) {
        setHighlightedPlantId(null);
        return;
      }

      const topMatch = filteredReferencePlants[0];
      const topScore = getSearchRelevanceScore(topMatch, q);
      const isStrongOrSingleMatch = filteredReferencePlants.length === 1 || topScore >= 75;

      if (isStrongOrSingleMatch) {
        setHighlightedPlantId(topMatch.id);
        const cardEl = document.getElementById(`plant-card-${topMatch.id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        setHighlightedPlantId(null);
        if (resultsGridRef.current) {
          resultsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery, filteredReferencePlants]);

  // Auto-scroll effect for My Garden Search
  useEffect(() => {
    const q = gardenSearchQuery.trim();
    if (!q) {
      return;
    }

    const timer = setTimeout(() => {
      if (filteredGardenPlants.length === 0) return;

      const topMatch = filteredGardenPlants[0];
      const topScore = getSearchRelevanceScore(topMatch, q);
      const isStrongOrSingleMatch = filteredGardenPlants.length === 1 || topScore >= 75;

      if (isStrongOrSingleMatch) {
        setHighlightedPlantId(topMatch.id);
        const cardEl = document.getElementById(`plant-card-${topMatch.id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else if (gardenResultsGridRef.current) {
        gardenResultsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [gardenSearchQuery, filteredGardenPlants]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedSunlight('all');
    setSelectedWater('all');
    setOnlyBloomingNow(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f7f4ea] flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mb-3 shadow-md animate-bounce">
          <Leaf className="w-7 h-7 text-emerald-200" />
        </div>
        <p className="text-sm font-bold text-stone-800">Loading Terrace Garden Tracker...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4ea] text-stone-900 flex flex-col pb-36 lg:pb-16 overflow-x-hidden w-full">
      {/* 3-Zone Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenAddModal={handleOpenAddModal}
        onOpenScanModal={() => handleOpenScanModal()}
        onOpenLoginModal={() => {
          setAuthPromptReason(null);
          setShowLoginModal(true);
        }}
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
            {/* Guest Mode Banner */}
            {!user && isGuest && (
              <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="font-bold block text-stone-900">Browsing in Guest Mode</span>
                    <span className="text-stone-600 text-[11px]">
                      Sign in with Google to keep your private garden, fertilizer logs, and plant scans safely saved to your account.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="self-start sm:self-center px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 text-xs whitespace-nowrap min-h-[40px] flex items-center gap-1.5 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}

            {/* My Garden Hero Banner - Sleek, Responsive, Compact on Mobile */}
            <div className="bg-gradient-to-br from-[#0c2f1b] via-[#144929] to-[#1c5d36] text-stone-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 relative overflow-hidden shadow-md border border-emerald-700/40">
              <div className="relative z-10 space-y-2 sm:space-y-3">
                {/* Top Row: Subtitle tag + Plant Count Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-300">
                    <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <span>My Active Terrace & Balcony</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold bg-emerald-800/90 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shrink-0">
                    {ownedPlants.length} {ownedPlants.length === 1 ? 'plant' : 'plants'}
                  </span>
                </div>

                {/* Main Heading & Concise Tagline */}
                <div>
                  <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    My Garden
                  </h1>
                  <p className="text-[11px] sm:text-xs text-emerald-100/90 leading-relaxed max-w-xl mt-0.5">
                    Personalized feeding schedules, seasonal pruning reminders, and AI health logs.
                  </p>
                </div>

                {/* Quick Shortcuts - Clean, non-cluttering responsive row */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handleSelectTab('fertilizer')}
                    className="min-h-[38px] sm:min-h-[42px] inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-950/70 hover:bg-emerald-900 text-xs font-bold text-emerald-100 rounded-xl border border-emerald-500/40 shadow-xs transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Fertilizer</span>
                    {overdueFertilizerCount > 0 && (
                      <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        {overdueFertilizerCount} overdue
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenScanModal()}
                    className="min-h-[38px] sm:min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                    <span>Scan Plant</span>
                  </button>
                  <button
                    onClick={() => handleSelectTab('reminders')}
                    className="min-h-[38px] sm:min-h-[42px] inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-950/70 hover:bg-emerald-900 text-xs font-bold text-emerald-100 rounded-xl border border-emerald-500/40 shadow-xs transition-all active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>{currentMonthName}</span>
                  </button>
                  <button
                    onClick={() => handleSelectTab('home')}
                    className="min-h-[38px] sm:min-h-[42px] inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-white rounded-xl shadow-xs transition-all border border-white/20 active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span>All Guide ({plants.length})</span>
                  </button>
                </div>
              </div>

              {/* Decorative subtle botanical background illustration */}
              <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none text-emerald-100">
                <svg className="w-44 h-44 sm:w-64 sm:h-64" viewBox="0 0 24 24" fill="currentColor">
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
                    You haven&apos;t marked any plants as owned yet. All {plants.length} authentic Indian species remain fully browsable in the Reference Guide. Click &quot;Add to Garden&quot; on any plants you grow to track feeding and seasonal tasks!
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentTab('home')}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-200" />
                    <span>Browse {plants.length} Reference Plants</span>
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
                <div ref={gardenResultsGridRef} className="scroll-mt-4">
                  {filteredGardenPlants.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-3 shadow-2xs">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                        <Search className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-stone-900">
                          No garden plants match &quot;{gardenSearchQuery}&quot;
                        </p>
                        <p className="text-xs text-stone-500 max-w-sm mx-auto">
                          You haven&apos;t added this plant to your garden yet. You can find and add it from the full Reference Guide.
                        </p>
                      </div>
                      <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setGardenSearchQuery('');
                            setGardenSelectedCategory('all');
                          }}
                          className="min-h-[38px] px-3.5 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold cursor-pointer"
                        >
                          Clear search
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery(gardenSearchQuery);
                            handleSelectTab('home');
                          }}
                          className="min-h-[38px] px-3.5 py-1.5 text-xs text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl font-bold cursor-pointer"
                        >
                          Search All Plants →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                      {filteredGardenPlants.map((plant) => (
                        <PlantCard
                          key={plant.id}
                          plant={plant}
                          currentMonthIndex={currentMonthIndex}
                          onSelect={(p) => setSelectedPlantForDetail(p)}
                          onToggleFavorite={handleToggleFavorite}
                          onToggleGarden={handleToggleInMyGarden}
                          isHighlighted={highlightedPlantId === plant.id}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Helpful link to explore full reference guide */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                    <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Want to add more plants? All {plants.length} authentic Indian species are in the Reference Guide.</span>
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
            {/* Reference Guide Header Banner - Sleek & Compact on Mobile */}
            <div className="bg-gradient-to-br from-[#1c3e27] via-[#244b30] to-[#1a3824] text-stone-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 lg:p-7 relative overflow-hidden shadow-md border border-emerald-700/40">
              <div className="max-w-2xl relative z-10 space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-300">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <span>Indian Balcony & Terrace Guide</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold bg-emerald-900/90 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-600/40 shrink-0">
                    {plants.length} species
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  Plant Reference Guide
                </h1>
                <p className="text-[11px] sm:text-xs text-emerald-100/90 leading-relaxed max-w-xl">
                  Care instructions, sunlight needs, and Indian kitchen remedies. Tap &quot;+ Add to Garden&quot; to track feeding and seasonal alerts.
                </p>

                {/* Switcher & Action buttons */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handleSelectTab('my-garden')}
                    className="min-h-[38px] sm:min-h-[42px] inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Sprout className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                    <span>My Garden ({ownedPlants.length})</span>
                  </button>
                  <button
                    onClick={() => handleOpenScanModal()}
                    className="min-h-[38px] sm:min-h-[42px] inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5 text-stone-900 shrink-0" />
                    <span>Scan Plant</span>
                  </button>
                  <button
                    onClick={handleOpenAddModal}
                    className="min-h-[38px] sm:min-h-[42px] inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-800 hover:bg-emerald-700 text-xs font-bold text-white rounded-xl shadow-xs transition-all ml-auto border border-emerald-600/50 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Plant</span>
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

            {/* Plant Cards Grid or Clean No Plants Found State */}
            <div ref={resultsGridRef} className="scroll-mt-4">
              {filteredReferencePlants.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200/90 p-8 sm:p-12 text-center space-y-4 shadow-sm animate-in fade-in duration-150">
                  <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
                    <Search className="w-7 h-7" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-base sm:text-lg font-bold text-stone-900">
                      {searchQuery.trim()
                        ? `No plants found matching "${searchQuery}"`
                        : 'No plants match your active filter criteria'}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {searchQuery.trim()
                        ? 'Try searching by common English name (Tulsi, Rose, Jasmine, Money Plant), Hindi name (Gulab, Mogra, Genda), or category.'
                        : `Try clearing filters to view all ${plants.length} authentic Indian terrace plants.`}
                    </p>
                  </div>
                  <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear Search & Filters</span>
                    </button>
                    {searchQuery.trim() && (
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Add &quot;{searchQuery}&quot; as New Plant</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                  {filteredReferencePlants.map((plant) => (
                    <PlantCard
                      key={plant.id}
                      plant={plant}
                      currentMonthIndex={currentMonthIndex}
                      onSelect={(p) => setSelectedPlantForDetail(p)}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleGarden={handleToggleInMyGarden}
                      isHighlighted={highlightedPlantId === plant.id}
                    />
                  ))}
                </div>
              )}
            </div>

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
            onOpenMyGarden={() => handleSelectTab('my-garden')}
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
            onBrowseReference={() => handleSelectTab('home')}
          />
        )}

        {/* VIEW 6: ADMIN MODERATION PORTAL (App Owner Only) */}
        {currentTab === 'admin' && (
          <AdminView
            onBackToHome={() => setCurrentTab('home')}
            onSelectPlantToInspect={(p) => setSelectedPlantForDetail(p)}
            onShowToast={showToast}
            onSharedCatalogUpdated={async () => {
              if (user) {
                const reloaded = await firestoreStorageService.loadPlantsForUser(user.uid);
                setPlants(reloaded);
              } else {
                const local = storageService.getPlants();
                const shared = await firestoreStorageService.getSharedPlants();
                const localIds = new Set(local.map((p) => p.id));
                setPlants([...local, ...shared.filter((s) => !localIds.has(s.id))]);
              }
            }}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenLoginModal={() => {
          setAuthPromptReason(null);
          setShowLoginModal(true);
        }}
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
          onRequireAuth={requireAuth}
          isLoggedIn={Boolean(user)}
        />
      )}

      {/* MODAL 2: Add / Edit Plant Form Modal */}
      {isFormModalOpen && (
        <PlantFormModal
          initialPlant={plantToEdit}
          existingPlants={plants}
          onSave={handleSavePlant}
          onClose={() => {
            setIsFormModalOpen(false);
            setPlantToEdit(null);
          }}
          onOpenExistingPlant={(existingPlant) => {
            setSelectedPlantForDetail(existingPlant);
          }}
          onAddExistingToGarden={(existingPlant) => {
            handleToggleInMyGarden(existingPlant.id);
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

      {/* Login Modal for Account Actions */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="relative w-full max-w-md">
            <LoginScreen
              isModal={true}
              promptReason={authPromptReason}
              onClose={() => {
                setShowLoginModal(false);
                setPendingAction(null);
                setAuthPromptReason(null);
              }}
              onSuccess={() => {
                setShowLoginModal(false);
              }}
              onContinueAsGuest={() => {
                setShowLoginModal(false);
                setPendingAction(null);
                setAuthPromptReason(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
