import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Plant, HealthScanRecord } from '../types/plant';
import { UserSubmittedPlantRecord } from '../types/admin';
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
   * Fetches community plants approved by admin into the global reference catalog.
   * Browsable by everyone (both authenticated users and guests).
   */
  async getSharedPlants(): Promise<Plant[]> {
    try {
      const sharedRef = collection(db, 'sharedPlants');
      const snap = await getDocs(sharedRef);
      const shared: Plant[] = [];
      snap.forEach((d) => {
        shared.push(d.data() as Plant);
      });

      // Cache locally for offline guest experience
      try {
        localStorage.setItem('terrace_garden_shared_plants_cache', JSON.stringify(shared));
      } catch {
        // quota
      }

      return shared;
    } catch (err) {
      console.warn('Could not fetch shared plants from Firestore (using cache if available):', err);
      try {
        const cached = localStorage.getItem('terrace_garden_shared_plants_cache');
        if (cached) {
          return JSON.parse(cached) as Plant[];
        }
      } catch {
        // ignore
      }
      return [];
    }
  },

  /**
   * Loads full plant list for authenticated user.
   * Merges base reference plants + admin-approved shared plants with user's private garden state and custom plants.
   * Migrates pre-existing local storage data to the user's Firestore on first login.
   */
  async loadPlantsForUser(userId: string): Promise<Plant[]> {
    try {
      const userPlantsRef = collection(db, 'users', userId, 'userPlants');
      const customPlantsRef = collection(db, 'users', userId, 'customPlants');

      const [userPlantsSnap, customPlantsSnap, sharedPlants] = await Promise.all([
        getDocs(userPlantsRef),
        getDocs(customPlantsRef),
        this.getSharedPlants(),
      ]);

      const userPlantStates = new Map<string, UserPlantStateDoc>();
      userPlantsSnap.forEach((docSnap) => {
        userPlantStates.set(docSnap.id, docSnap.data() as UserPlantStateDoc);
      });

      const customPlants: Plant[] = [];
      customPlantsSnap.forEach((docSnap) => {
        customPlants.push(docSnap.data() as Plant);
      });

      // Ensure user's existing custom plants are also registered in userSubmittedPlants for admin review
      for (const cp of customPlants) {
        try {
          await setDoc(
            doc(db, 'userSubmittedPlants', cp.id),
            {
              id: cp.id,
              originalPlantId: cp.id,
              userId,
              plantName: cp.name,
              botanicalName: cp.botanicalName || '',
              category: cp.category,
              plantData: cp,
              status: 'pending',
              submittedAt: cp.createdAt || new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // ignore background sync error
        }
      }

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
            // Also submit to admin review
            migrationPromises.push(
              setDoc(doc(db, 'userSubmittedPlants', localP.id), {
                id: localP.id,
                originalPlantId: localP.id,
                userId,
                plantName: localP.name,
                botanicalName: localP.botanicalName || '',
                category: localP.category,
                plantData: localP,
                status: 'pending',
                submittedAt: localP.createdAt || new Date().toISOString(),
              }, { merge: true })
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

      // Merge base seed plants + community shared plants
      // Prevent duplicates if user has a custom plant with the same ID as a shared plant
      const customPlantIds = new Set(customPlants.map((p) => p.id));
      const filteredSharedPlants = sharedPlants.filter((sp) => !customPlantIds.has(sp.id));

      const allReferenceCatalog = [...INITIAL_PLANTS, ...filteredSharedPlants];

      // Assemble base reference catalog with user's private data overlay
      const basePlantsWithUserState: Plant[] = allReferenceCatalog.map((basePlant) => {
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

      // Combine custom plants (at top) + reference plants
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
   * Adds a new custom plant under the user's private collection AND
   * registers it in userSubmittedPlants for admin review into the shared catalog.
   */
  async addCustomPlant(
    user: { uid: string; email?: string | null; displayName?: string | null },
    plantData: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Plant> {
    const newPlant: Plant = {
      ...plantData,
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      inMyGarden: true, // newly added plant is owned by default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Save privately to user's collection
      await setDoc(doc(db, 'users', user.uid, 'customPlants', newPlant.id), {
        ...newPlant,
        userId: user.uid,
      });

      // 2. Submit to top-level review collection for admin moderation
      const submission: UserSubmittedPlantRecord = {
        id: newPlant.id,
        originalPlantId: newPlant.id,
        userId: user.uid,
        userEmail: user.email || undefined,
        userDisplayName: user.displayName || user.email || 'Terrace Gardener',
        plantName: newPlant.name,
        botanicalName: newPlant.botanicalName,
        category: newPlant.category,
        plantData: newPlant,
        status: 'pending',
        submittedAt: newPlant.createdAt || new Date().toISOString(),
      };

      await setDoc(doc(db, 'userSubmittedPlants', newPlant.id), submission);
    } catch (err) {
      console.error('Failed to save custom plant or submission to Firestore:', err);
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

  /* =======================================================================
   * ADMIN MODERATION METHODS
   * Accessible only to configured app administrators
   * ======================================================================= */

  /**
   * Fetches all user-submitted plants across all accounts for admin review.
   */
  async getSubmittedPlantsForAdmin(): Promise<UserSubmittedPlantRecord[]> {
    try {
      const submissionsRef = collection(db, 'userSubmittedPlants');
      const q = query(submissionsRef, orderBy('submittedAt', 'desc'));
      const snap = await getDocs(q);

      const records: UserSubmittedPlantRecord[] = [];
      snap.forEach((d) => {
        records.push(d.data() as UserSubmittedPlantRecord);
      });
      return records;
    } catch (err) {
      console.warn('Failed to fetch user submissions using ordered query, falling back to plain query:', err);
      try {
        const snap = await getDocs(collection(db, 'userSubmittedPlants'));
        const records: UserSubmittedPlantRecord[] = [];
        snap.forEach((d) => {
          records.push(d.data() as UserSubmittedPlantRecord);
        });
        records.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''));
        return records;
      } catch (innerErr) {
        console.error('Failed to fetch user submissions for admin:', innerErr);
        return [];
      }
    }
  },

  /**
   * Approves a user-submitted plant into the global shared catalog.
   * Copies the plant into `/sharedPlants/{plantId}` so all users can see it,
   * while keeping the original user's private plant completely intact.
   */
  async approvePlantToSharedCatalog(
    submission: UserSubmittedPlantRecord,
    adminEmail: string
  ): Promise<Plant> {
    const sharedPlant: Plant = {
      ...submission.plantData,
      id: submission.originalPlantId,
      isSharedCatalog: true,
      addedByUserId: submission.userId,
      addedByUserEmail: submission.userEmail,
      addedByUserName: submission.userDisplayName,
      approvedAt: new Date().toISOString(),
      inMyGarden: false, // in global reference catalog, not owned by default until user adds it
    };

    // 1. Write to global shared catalog
    await setDoc(doc(db, 'sharedPlants', submission.originalPlantId), sharedPlant);

    // 2. Mark submission as approved
    await setDoc(
      doc(db, 'userSubmittedPlants', submission.id),
      {
        status: 'approved',
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminEmail,
      },
      { merge: true }
    );

    return sharedPlant;
  },

  /**
   * Dismisses a plant submission (leaves it as that user's private plant only).
   */
  async dismissSubmittedPlant(submissionId: string, adminEmail: string): Promise<void> {
    await setDoc(
      doc(db, 'userSubmittedPlants', submissionId),
      {
        status: 'dismissed',
        reviewedAt: new Date().toISOString(),
        reviewedBy: adminEmail,
      },
      { merge: true }
    );
  },

  /**
   * Removes a plant from the global shared catalog if previously approved.
   */
  async removeFromSharedCatalog(plantId: string, submissionId?: string): Promise<void> {
    await deleteDoc(doc(db, 'sharedPlants', plantId));

    if (submissionId) {
      await setDoc(
        doc(db, 'userSubmittedPlants', submissionId),
        {
          status: 'dismissed',
          reviewedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  },
};
