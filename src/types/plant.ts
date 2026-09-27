export type PlantCategory =
  | 'Flowering'
  | 'Vegetable'
  | 'Herb'
  | 'Foliage'
  | 'Fruit'
  | 'Succulent';

export type WaterLevel = 'Low' | 'Moderate' | 'High';

export type SunlightType = 'Full Sun' | 'Partial Shade' | 'Full Shade';

export type SymptomCategory =
  | 'yellowing'
  | 'spots'
  | 'powdery_coating'
  | 'wilting'
  | 'curling'
  | 'pests_visible'
  | 'holes'
  | 'bud_drop'
  | 'stunted';

export interface HomeRemedy {
  name: string;
  ingredients: string;
  preparationAndUse: string;
  frequency: string;
}

export interface DiseasePestInfo {
  id: string;
  name: string;
  symptomType: SymptomCategory;
  symptoms: string;
  homeRemedy: HomeRemedy;
  conventionalTreatment: string;
}

export interface PlantIdentificationInfo {
  commonName: string;
  botanicalName?: string;
  category?: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Uncertain';
  confidenceReason?: string;
  matchesTargetPlant?: boolean;
  targetPlantMismatchNote?: string;
}

export interface PlantHealthAssessment {
  isImageQualityAdequate: boolean;
  qualityIssueFeedback?: string;
  identification: PlantIdentificationInfo;
  healthStatus: PlantHealthStatus;
  summary: string;
  nutrientDeficiencies: {
    detected: boolean;
    deficiency?: string;
    suggestedFeed: string;
    details: string;
  };
  pestOrDisease: {
    detected: boolean;
    matchedDiseaseName?: string;
    symptomsObserved: string;
    details: string;
  };
  recommendedRemedies: {
    homeRemedyName: string;
    homeRemedyIngredients: string;
    homeRemedyInstructions: string;
    conventionalOption?: string;
  };
  confidenceOrCaveat?: string;
}

export type PlantHealthStatus = 'Healthy' | 'Needs Attention' | 'Sick';

export interface HealthScanRecord extends PlantHealthAssessment {
  id: string;
  plantId: string;
  plantName: string;
  scanDate: string; // ISO date string
  photoDataUrl: string; // Image captured/uploaded
}

export interface FertilizerScheduleInfo {
  intervalDays: number;
  lastFertilizedDate?: string; // YYYY-MM-DD
  nextDueDate?: string; // YYYY-MM-DD
  daysUntilDue: number; // negative if overdue, 0 if today, positive if upcoming
  status: 'overdue' | 'due_today' | 'due_soon' | 'healthy' | 'not_set';
  isOverdue: boolean;
  statusLabel: string;
}

export interface Plant {
  id: string;
  name: string;
  botanicalName?: string;
  hindiName?: string;
  category: PlantCategory;
  
  // 12 Core Fields
  waterRequirement: {
    level: WaterLevel;
    frequency: string;
    seasonalNote?: string;
  };
  sunlightRequirement: {
    type: SunlightType;
    hoursNeeded: string;
    summerTerraceNote?: string;
  };
  fertilizerRequirement: {
    type: string;
    npkOrOrganic: string;
    frequency: string;
  };
  sowingTime: {
    months: number[]; // 1 to 12
    seasonText: string;
    method?: string; // Seeds, Cuttings, Root division
  };
  pruningTime: {
    months: number[];
    seasonText: string;
    frequency: string;
    tips: string;
  };
  repottingTime: {
    months: number[];
    seasonText: string;
    frequency: string;
    signs: string[];
  };
  potSizeRequired: {
    sizeInches: string;
    volumeLiters: string;
    materialAdvice?: string;
  };
  floweringSeason: {
    isFlowering: boolean;
    months: number[];
    seasonText: string;
  };
  diseasesAndPests: DiseasePestInfo[];

  // Extra user metadata & Tracking
  inMyGarden?: boolean; // Whether the user actually grows/owns this plant (separate from reference guide)
  imageUrl?: string;
  customPhotoUrl?: string;
  notes?: string;
  isFavorite?: boolean;
  avatarColor?: string;
  lastFertilizedDate?: string; // YYYY-MM-DD
  fertilizerCustomDays?: number;
  scanHistory?: HealthScanRecord[];
  createdAt?: string;
  updatedAt?: string;

  // Shared catalog metadata (for plants approved by admin into global catalog)
  isSharedCatalog?: boolean;
  addedByUserId?: string;
  addedByUserEmail?: string;
  addedByUserName?: string;
  approvedAt?: string;
}

export interface SymptomDefinition {
  type: SymptomCategory;
  label: string;
  description: string;
}
