import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Plant, HealthScanRecord } from '../types/plant';
import { INITIAL_PLANTS } from '../data/seedPlants';
import { VERIFIED_PLANT_IMAGES } from '../data/plantImages';
import { storageService } from './storageService';

export interface UserPlantStateDoc {
  id: string;
  userId: string;
  inMyGarden: boolean;
  isFavorite?: boolean;
  lastFertilizedDate?: string;
  customPhotoUrl?: string;
  scanHistory?: HealthScanRecord[];
  updatedAt: string;
}

export const firestoreStorageService = {
  /**
   * Loads full plant list for authenticated user.
   * Merges base 21 reference plants with user's private garden state and custom plants.
   * Migrates pre-existing local storage data to the user's Firestore on first login.
   */
  async loadPlantsForUser(userId: string): Promise<Plant[]> {
    try {
      const userPlantsRef = collection(db, 'users', userId, 'userPlants');
      const customPlantsRef = collection(db, 'users', userId, 'customPlants');

      const [userPlantsSnap, customPlantsSnap] = await Promise.all([
        getDocs(userPlantsRef),
        getDocs(customPlantsRef),
      ]);

      const userPlantStates = new Map<string, UserPlantStateDoc>();
      userPlantsSnap.forEach((docSnap) => {
        userPlantStates.set(docSnap.id, docSnap.data() as UserPlantStateDoc);
      });

      const customPlants: Plant[] = [];
      customPlantsSnap.forEach((docSnap) => {
        customPlants.push(docSnap.data() as Plant);
      });

      // Check if user has no cloud data yet: migrate pre-existing local data if present
      if (userPlantStates.size === 0 && customPlants.length === 0) {
        console.log('First login for user: checking for existing local data to migrate...');
        const localPlants = storageService.getPlants();

        // Migrate any custom plants and custom garden statuses to Firestore
        const migrationPromises: Promise<unknown>[] = [];

        for (const localP of localPlants) {
          if (localP.id.startsWith('custom-')) {
            // User created plant
            migrationPromises.push(
              setDoc(doc(db, 'users', userId, 'customPlants', localP.id), {
                ...localP,
                userId,
                updatedAt: new Date().toISOString(),
              })
            );
            customPlants.push(localP);
          } else {
            // Reference plant with user-specific state
            const stateDoc: UserPlantStateDoc = {
              id: localP.id,
              userId,
              inMyGarden: Boolean(localP.inMyGarden),
              isFavorite: Boolean(localP.isFavorite),
              lastFertilizedDate: localP.lastFertilizedDate || undefined,
              customPhotoUrl: localP.customPhotoUrl || undefined,
              scanHistory: localP.scanHistory || [],
              updatedAt: new Date().toISOString(),
            };
            migrationPromises.push(
              setDoc(doc(db, 'users', userId, 'userPlants', localP.id), stateDoc)
            );
            userPlantStates.set(localP.id, stateDoc);
          }
        }

        if (migrationPromises.length > 0) {
          await Promise.all(migrationPromises);
          console.log(`Migrated ${migrationPromises.length} records to Firestore for user ${userId}`);
        }
      }

      // Assemble base reference plants with user's private data overlay
      const basePlantsWithUserState: Plant[] = INITIAL_PLANTS.map((basePlant) => {
        const userState = userPlantStates.get(basePlant.id);
        const verified = VERIFIED_PLANT_IMAGES[basePlant.id];
        return {
          ...basePlant,
          imageUrl: basePlant.imageUrl || verified?.imageUrl,
          inMyGarden: userState ? Boolean(userState.inMyGarden) : false,
          isFavorite: userState ? Boolean(userState.isFavorite) : false,
          lastFertilizedDate: userState?.lastFertilizedDate || undefined,
          customPhotoUrl: userState?.customPhotoUrl || undefined,
          scanHistory: userState?.scanHistory || [],
        };
      });

      // Combine custom plants (at top) + base reference plants
      const combined = [...customPlants, ...basePlantsWithUserState];

      // Save user-scoped local cache for instant offline fallback
      try {
        localStorage.setItem(`terrace_garden_plants_user_${userId}`, JSON.stringify(combined));
      } catch {
        // quota ignore
      }

      return combined;
    } catch (err) {
      console.error('Failed to load user plants from Firestore:', err);
      // Fallback to user-scoped local cache or default
      const cached = localStorage.getItem(`terrace_garden_plants_user_${userId}`);
      if (cached) {
        try {
          return JSON.parse(cached) as Plant[];
        } catch {
          // ignore
        }
      }
      return storageService.getPlants();
    }
  },

  /**
   * Syncs plant ownership, favorite status, or last fertilization to Firestore
   */
  async syncUserPlantState(
    userId: string,
    plant: Plant
  ): Promise<void> {
    try {
      if (plant.id.startsWith('custom-')) {
        // Full update to custom plant
        await setDoc(
          doc(db, 'users', userId, 'customPlants', plant.id),
          {
            ...plant,
            userId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        // Reference plant state update
        const stateDoc: UserPlantStateDoc = {
          id: plant.id,
          userId,
          inMyGarden: Boolean(plant.inMyGarden),
          isFavorite: Boolean(plant.isFavorite),
          lastFertilizedDate: plant.lastFertilizedDate,
          customPhotoUrl: plant.customPhotoUrl,
          scanHistory: plant.scanHistory || [],
          updatedAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'users', userId, 'userPlants', plant.id), stateDoc, { merge: true });
      }
    } catch (err) {
      console.warn('Failed to sync plant state to Firestore:', err);
    }
  },

  /**
   * Adds a new custom plant under the user's private collection
   */
  async addCustomPlant(userId: string, plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Plant> {
    const newPlant: Plant = {
      ...plantData,
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      inMyGarden: true, // newly added plant is owned by default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'users', userId, 'customPlants', newPlant.id), {
        ...newPlant,
        userId,
      });
    } catch (err) {
      console.error('Failed to save custom plant to Firestore:', err);
    }

    return newPlant;
  },

  /**
   * Deletes a custom plant from user's private collection
   */
  async deleteCustomPlant(userId: string, plantId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', userId, 'customPlants', plantId));
    } catch (err) {
      console.error('Failed to delete custom plant from Firestore:', err);
    }
  },
};
