import { Plant } from './plant';

export type SubmissionStatus = 'pending' | 'approved' | 'dismissed';

export interface UserSubmittedPlantRecord {
  id: string; // Document ID in /userSubmittedPlants
  originalPlantId: string;
  userId: string;
  userEmail?: string;
  userDisplayName?: string;
  plantName: string;
  botanicalName?: string;
  category: string;
  plantData: Plant;
  status: SubmissionStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}
