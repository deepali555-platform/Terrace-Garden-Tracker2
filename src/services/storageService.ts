import { INITIAL_PLANTS } from '../data/seedPlants';
import { Plant, HealthScanRecord } from '../types/plant';
import { toISODateString } from '../utils/fertilizerHelpers';
import { VERIFIED_PLANT_IMAGES } from '../data/plantImages';

const STORAGE_KEY = 'terrace_garden_plants_v6';

/**
 * Requirement 5: Clear any leftover local storage data related to My Garden status
 * so guests never inherit stale or test-session garden status.
 */
export function clearLegacyGardenLocalStorage(): void {
  try {
    const keysToCheck = [
      'terrace_garden_plants_v6',
      'terrace_garden_plants_v5',
      'terrace_garden_plants_v4',
      'terrace_garden_plants_v3',
      'terrace_garden_plants_v2',
      'terrace_garden_plants',
    ];
    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const sanitized = list.map((p: any) => ({
              ...p,
              inMyGarden: false,
            }));
            localStorage.setItem(key, JSON.stringify(sanitized));
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (e) {
    // Ignore in non-browser or restricted environments
  }
}

// Automatically sanitize on load
clearLegacyGardenLocalStorage();

function seedInitialPlantsWithDates(): Plant[] {
  const now = new Date();
  return INITIAL_PLANTS.map((plant, index) => {
    // Distribute realistic past fertilization dates:
    // Some overdue, some due soon, some recently fertilized
    const daysAgo = [26, 12, 4, 32, 11, 2, 28, 5, 14, 21, 1, 15, 30, 7, 10, 18, 25, 3, 16, 9][index % 20];
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return {
      ...plant,
      imageUrl: plant.imageUrl || VERIFIED_PLANT_IMAGES[plant.id]?.imageUrl,
      inMyGarden: false, // Must default to false; only authenticated user data in DB defines ownership
      lastFertilizedDate: toISODateString(d),
    };
  });
}

export const storageService = {
  getPlants(): Plant[] {
    try {
      let stored = localStorage.getItem(STORAGE_KEY);
      // Migrate from v5 or earlier if available
      if (!stored) {
        const prev =
          localStorage.getItem('terrace_garden_plants_v5') ||
          localStorage.getItem('terrace_garden_plants_v4') ||
          localStorage.getItem('terrace_garden_plants_v3') ||
          localStorage.getItem('terrace_garden_plants_v2');
        if (prev) {
          try {
            const oldParsed = JSON.parse(prev) as Plant[];
            if (Array.isArray(oldParsed) && oldParsed.length > 0) {
              const enriched = oldParsed.map((p, idx) => {
                if (!p.lastFertilizedDate) {
                  const d = new Date();
                  d.setDate(d.getDate() - ((idx * 5) % 25 + 2));
                  p.lastFertilizedDate = toISODateString(d);
                }
                // Never default to inMyGarden for guests
                p.inMyGarden = false;
                const verified = VERIFIED_PLANT_IMAGES[p.id];
                if (verified) {
                  p.imageUrl = verified.imageUrl;
                }
                return p;
              });
              this.savePlants(enriched);
              return enriched;
            }
          } catch {
            // fallback
          }
        }
      }

      if (!stored) {
        const seeded = seedInitialPlantsWithDates();
        this.savePlants(seeded);
        return seeded;
      }
      const parsed = JSON.parse(stored) as Plant[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const seeded = seedInitialPlantsWithDates();
        this.savePlants(seeded);
        return seeded;
      }

      let modified = false;

      // Ensure all plants have their verified species reference image populated
      parsed.forEach((p) => {
        const verified = VERIFIED_PLANT_IMAGES[p.id];
        if (verified && p.imageUrl !== verified.imageUrl) {
          p.imageUrl = verified.imageUrl;
          modified = true;
        }
        // Guest/unauthenticated local plants must never default to inMyGarden
        if (p.inMyGarden) {
          p.inMyGarden = false;
          modified = true;
        }
      });

      if (!parsed.some((p) => p.id === 'spider-plant')) {
        const spiderPlant = INITIAL_PLANTS.find((p) => p.id === 'spider-plant');
        if (spiderPlant) {
          const d = new Date();
          d.setDate(d.getDate() - 14);
          const enrichedSpider: Plant = {
            ...spiderPlant,
            inMyGarden: false,
            lastFertilizedDate: toISODateString(d),
          };
          parsed.push(enrichedSpider);
          modified = true;
        }
      }

      if (!parsed.some((p) => p.id === 'sadabahar')) {
        const sadabaharPlant = INITIAL_PLANTS.find((p) => p.id === 'sadabahar');
        if (sadabaharPlant) {
          const d = new Date();
          d.setDate(d.getDate() - 8);
          const enrichedSadabahar: Plant = {
            ...sadabaharPlant,
            inMyGarden: false,
            imageUrl: '/images/sadabahar.jpg',
            lastFertilizedDate: toISODateString(d),
          };
          parsed.push(enrichedSadabahar);
          modified = true;
        }
      }

      // If user has any custom plant named Sadabahar, update its image too
      parsed.forEach((p) => {
        if (p.name.toLowerCase().includes('sadabahar') || p.botanicalName?.toLowerCase().includes('catharanthus')) {
          if (!p.imageUrl || p.imageUrl.includes('placeholder') || p.imageUrl === '/images/sadabahar.jpg') {
            p.imageUrl = '/images/sadabahar.jpg';
            modified = true;
          }
        }
      });

      if (modified) {
        this.savePlants(parsed);
      }

      return parsed;
    } catch (err) {
      console.error('Failed to read plants from localStorage', err);
      return seedInitialPlantsWithDates();
    }
  },

  savePlants(plants: Plant[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
    } catch (err) {
      console.error('Failed to save plants to localStorage', err);
    }
  },

  updatePlantPhoto(id: string, photoDataUrl: string | null): Plant | null {
    const plants = this.getPlants();
    const target = plants.find((p) => p.id === id);
    if (!target) return null;
    target.customPhotoUrl = photoDataUrl || undefined;
    target.updatedAt = new Date().toISOString();
    this.savePlants(plants);
    return target;
  },

  recordFertilization(id: string, dateStr?: string): Plant | null {
    const plants = this.getPlants();
    const target = plants.find((p) => p.id === id);
    if (!target) return null;
    target.lastFertilizedDate = dateStr || toISODateString(new Date());
    target.updatedAt = new Date().toISOString();
    this.savePlants(plants);
    return target;
  },

  saveScanRecord(plantId: string, scanRecord: HealthScanRecord): Plant | null {
    const plants = this.getPlants();
    const target = plants.find((p) => p.id === plantId);
    if (!target) return null;
    if (!target.scanHistory) {
      target.scanHistory = [];
    }
    // Prepend latest scan record
    target.scanHistory = [scanRecord, ...target.scanHistory];
    target.updatedAt = new Date().toISOString();
    this.savePlants(plants);
    return target;
  },

  deleteScanRecord(plantId: string, scanId: string): Plant | null {
    const plants = this.getPlants();
    const target = plants.find((p) => p.id === plantId);
    if (!target || !target.scanHistory) return null;
    target.scanHistory = target.scanHistory.filter((s) => s.id !== scanId);
    target.updatedAt = new Date().toISOString();
    this.savePlants(plants);
    return target;
  },

  addPlant(plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Plant {
    const plants = this.getPlants();
    const newPlant: Plant = {
      ...plant,
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newPlant, ...plants];
    this.savePlants(updated);
    return newPlant;
  },

  updatePlant(updatedPlant: Plant): Plant {
    const plants = this.getPlants();
    const plantWithTimestamp = {
      ...updatedPlant,
      updatedAt: new Date().toISOString(),
    };
    const updated = plants.map((p) => (p.id === updatedPlant.id ? plantWithTimestamp : p));
    this.savePlants(updated);
    return plantWithTimestamp;
  },

  deletePlant(id: string): boolean {
    const plants = this.getPlants();
    const updated = plants.filter((p) => p.id !== id);
    this.savePlants(updated);
    return updated.length < plants.length;
  },

  toggleFavorite(id: string): Plant | null {
    const plants = this.getPlants();
    const target = plants.find((p) => p.id === id);
    if (!target) return null;
    target.isFavorite = !target.isFavorite;
    target.updatedAt = new Date().toISOString();
    this.savePlants(plants);
    return target;
  },

  toggleInMyGarden(id: string): Plant | null {
    const plants = this.getPlants();
    const target = plants.find((p) => p.id === id);
    if (!target) return null;
    target.inMyGarden = !target.inMyGarden;
    target.updatedAt = new Date().toISOString();
    // Keep fertilizer history and scan history intact!
    this.savePlants(plants);
    return target;
  },

  setInMyGarden(id: string, inGarden: boolean): Plant | null {
    const plants = this.getPlants();
    const target = plants.find((p) => p.id === id);
    if (!target) return null;
    target.inMyGarden = inGarden;
    target.updatedAt = new Date().toISOString();
    this.savePlants(plants);
    return target;
  },

  resetToDefaults(): Plant[] {
    const seeded = seedInitialPlantsWithDates();
    this.savePlants(seeded);
    return seeded;
  },

  exportToJson(): string {
    const plants = this.getPlants();
    return JSON.stringify(plants, null, 2);
  },

  importFromJson(jsonString: string): { success: boolean; count?: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, error: 'File content must be an array of plants' };
      }
      // Simple validation for required fields
      const valid = parsed.every(
        (p) => p && typeof p.name === 'string' && typeof p.category === 'string'
      );
      if (!valid) {
        return { success: false, error: 'Invalid plant format in backup file' };
      }
      this.savePlants(parsed as Plant[]);
      return { success: true, count: parsed.length };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON file';
      return { success: false, error: message };
    }
  },
};
