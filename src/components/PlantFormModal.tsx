import React, { useState, useRef, useMemo } from 'react';
import { Plant, PlantCategory, SunlightType, WaterLevel, DiseasePestInfo } from '../types/plant';
import {
  X,
  Plus,
  Trash2,
  Camera,
  RotateCcw,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Globe,
  Eye,
} from 'lucide-react';
import { MONTHS, CATEGORIES, SUNLIGHT_OPTIONS, WATER_OPTIONS, getPlantCategoryAccent } from '../utils/gardenHelpers';
import { compressImageFile } from '../utils/imageUploadHelper';
import { sanitizeForFirestore } from '../services/firestoreStorageService';

interface PlantFormModalProps {
  initialPlant?: Plant | null;
  existingPlants?: Plant[];
  onSave: (plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'> | Plant) => void;
  onClose: () => void;
  onOpenExistingPlant?: (plant: Plant) => void;
  onAddExistingToGarden?: (plant: Plant) => void;
}

export const PlantFormModal: React.FC<PlantFormModalProps> = ({
  initialPlant,
  existingPlants = [],
  onSave,
  onClose,
  onOpenExistingPlant,
  onAddExistingToGarden,
}) => {
  const isEditing = Boolean(initialPlant);

  // AI Auto-fill state
  const [autoFillQuery, setAutoFillQuery] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);
  const [autoFillClarification, setAutoFillClarification] = useState<{
    question: string;
    suggestions: Array<{ name: string; botanicalName: string; hint: string }>;
  } | null>(null);
  const [autoFillUnrecognizedMessage, setAutoFillUnrecognizedMessage] = useState<string | null>(null);
  const [autoFillSuccessMessage, setAutoFillSuccessMessage] = useState<string | null>(null);
  const [autoFetchedImageMatched, setAutoFetchedImageMatched] = useState<boolean | null>(null);
  const [autoFetchedImageTitle, setAutoFetchedImageTitle] = useState<string>('');

  // Core basic fields
  const [name, setName] = useState(initialPlant?.name || '');
  const [botanicalName, setBotanicalName] = useState(initialPlant?.botanicalName || '');
  const [hindiName, setHindiName] = useState(initialPlant?.hindiName || '');
  const [category, setCategory] = useState<PlantCategory>(initialPlant?.category || 'Flowering');
  const [customPhotoUrl, setCustomPhotoUrl] = useState(initialPlant?.customPhotoUrl || '');
  const [imageUrl, setImageUrl] = useState(initialPlant?.imageUrl || '');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Water
  const [waterLevel, setWaterLevel] = useState<WaterLevel>(
    initialPlant?.waterRequirement.level || 'Moderate'
  );
  const [waterFrequency, setWaterFrequency] = useState(
    initialPlant?.waterRequirement.frequency || 'Every 1 to 2 days'
  );
  const [waterNote, setWaterNote] = useState(initialPlant?.waterRequirement.seasonalNote || '');

  // Sun
  const [sunlightType, setSunlightType] = useState<SunlightType>(
    initialPlant?.sunlightRequirement.type || 'Full Sun'
  );
  const [sunHours, setSunHours] = useState(
    initialPlant?.sunlightRequirement.hoursNeeded || '5 to 6 hours direct sun'
  );
  const [sunSummerNote, setSunSummerNote] = useState(
    initialPlant?.sunlightRequirement.summerTerraceNote || ''
  );

  // Fertilizer
  const [fertilizerType, setFertilizerType] = useState(
    initialPlant?.fertilizerRequirement.type || 'Vermicompost or Cow Dung Manure'
  );
  const [fertilizerNpk, setFertilizerNpk] = useState(
    initialPlant?.fertilizerRequirement.npkOrOrganic || 'Organic compost and seaweed'
  );
  const [fertilizerFrequency, setFertilizerFrequency] = useState(
    initialPlant?.fertilizerRequirement.frequency || 'Every 20 to 30 days'
  );
  const [lastFertilizedDate, setLastFertilizedDate] = useState(
    initialPlant?.lastFertilizedDate || ''
  );

  // Sowing
  const [sowingMonths, setSowingMonths] = useState<number[]>(
    initialPlant?.sowingTime.months || [2, 3, 7]
  );
  const [sowingSeasonText, setSowingSeasonText] = useState(
    initialPlant?.sowingTime.seasonText || 'Spring (Feb-Mar) and Monsoon (July)'
  );
  const [sowingMethod, setSowingMethod] = useState(
    initialPlant?.sowingTime.method || 'Seeds or stem cuttings'
  );

  // Pruning
  const [pruningMonths, setPruningMonths] = useState<number[]>(
    initialPlant?.pruningTime.months || [2, 10]
  );
  const [pruningSeasonText, setPruningSeasonText] = useState(
    initialPlant?.pruningTime.seasonText || 'Spring after winter rest; regular deadheading'
  );
  const [pruningFrequency, setPruningFrequency] = useState(
    initialPlant?.pruningTime.frequency || 'Pinch growing tips regularly'
  );
  const [pruningTips, setPruningTips] = useState(
    initialPlant?.pruningTime.tips || 'Prune at 45 degree angle above outward bud node'
  );

  // Repotting
  const [repottingMonths, setRepottingMonths] = useState<number[]>(
    initialPlant?.repottingTime.months || [2, 3, 7]
  );
  const [repottingSeasonText, setRepottingSeasonText] = useState(
    initialPlant?.repottingTime.seasonText || 'Spring (Feb–March) or Monsoon'
  );
  const [repottingFrequency, setRepottingFrequency] = useState(
    initialPlant?.repottingTime.frequency || 'Once every 2 years'
  );
  const [repottingSignsText, setRepottingSignsText] = useState(
    initialPlant?.repottingTime.signs.join('\n') ||
      'Roots protruding from drainage holes\nSoil dries out within hours\nStunted growth'
  );

  // Pot Size
  const [potSizeInches, setPotSizeInches] = useState(
    initialPlant?.potSizeRequired.sizeInches || '10 to 12 inches'
  );
  const [potVolumeLiters, setPotVolumeLiters] = useState(
    initialPlant?.potSizeRequired.volumeLiters || '10–15 Liters'
  );
  const [potMaterial, setPotMaterial] = useState(
    initialPlant?.potSizeRequired.materialAdvice || 'Terracotta or earthen pot preferred'
  );

  // Flowering
  const [isFlowering, setIsFlowering] = useState(
    initialPlant?.floweringSeason.isFlowering ?? true
  );
  const [floweringMonths, setFloweringMonths] = useState<number[]>(
    initialPlant?.floweringSeason.months || [3, 4, 5, 8, 9, 10]
  );
  const [floweringSeasonText, setFloweringSeasonText] = useState(
    initialPlant?.floweringSeason.seasonText || 'Spring through Autumn'
  );

  // Diseases & Home Remedies
  const [diseases, setDiseases] = useState<DiseasePestInfo[]>(
    initialPlant?.diseasesAndPests || [
      {
        id: 'pest-' + Date.now(),
        name: 'Mealybugs / Aphids',
        symptomType: 'pests_visible',
        symptoms: 'Sticky white waxy coating or small bugs on tender shoot tips',
        homeRemedy: {
          name: 'Neem Oil & Mild Soap Spray',
          ingredients: '5ml neem oil + 3 drops liquid soap in 1L water',
          preparationAndUse: 'Shake vigorously into emulsion and spray leaf undersides early morning',
          frequency: 'Every 3 days',
        },
        conventionalTreatment: 'Imidacloprid 17.8 SL (0.5ml/L) or sticky traps',
      },
    ]
  );

  const [notes, setNotes] = useState(initialPlant?.notes || '');
  const [error, setError] = useState('');

  // Case-insensitive, extra space-ignoring duplicate detector
  const normalizedInputName = name.trim().toLowerCase().replace(/\s+/g, ' ');
  const detectedDuplicate = useMemo(() => {
    if (!normalizedInputName) return null;
    return (
      existingPlants.find(
        (p) =>
          (!initialPlant || p.id !== initialPlant.id) &&
          p.name.trim().toLowerCase().replace(/\s+/g, ' ') === normalizedInputName
      ) || null
    );
  }, [existingPlants, initialPlant, normalizedInputName]);

  const toggleMonth = (
    currentList: number[],
    setList: React.Dispatch<React.SetStateAction<number[]>>,
    monthIndex: number
  ) => {
    if (currentList.includes(monthIndex)) {
      setList(currentList.filter((m) => m !== monthIndex));
    } else {
      setList([...currentList, monthIndex].sort((a, b) => a - b));
    }
  };

  const handleAddDisease = () => {
    const newEntry: DiseasePestInfo = {
      id: 'pest-' + Date.now() + Math.random().toString(36).substring(2, 5),
      name: '',
      symptomType: 'pests_visible',
      symptoms: '',
      homeRemedy: {
        name: 'Indian Kitchen Remedy (e.g., Sour Buttermilk / Turmeric)',
        ingredients: '',
        preparationAndUse: '',
        frequency: 'Every 5 days',
      },
      conventionalTreatment: '',
    };
    setDiseases([...diseases, newEntry]);
  };

  const handleRemoveDisease = (index: number) => {
    setDiseases(diseases.filter((_, i) => i !== index));
  };

  const handleUpdateDisease = (
    index: number,
    field: keyof DiseasePestInfo | 'homeRemedy_name' | 'homeRemedy_ingredients' | 'homeRemedy_prep' | 'homeRemedy_freq',
    val: string
  ) => {
    const updated = [...diseases];
    const target = { ...updated[index] };

    if (field === 'homeRemedy_name') {
      target.homeRemedy = { ...target.homeRemedy, name: val };
    } else if (field === 'homeRemedy_ingredients') {
      target.homeRemedy = { ...target.homeRemedy, ingredients: val };
    } else if (field === 'homeRemedy_prep') {
      target.homeRemedy = { ...target.homeRemedy, preparationAndUse: val };
    } else if (field === 'homeRemedy_freq') {
      target.homeRemedy = { ...target.homeRemedy, frequency: val };
    } else {
      // @ts-expect-error dynamic key
      target[field] = val;
    }
    updated[index] = target;
    setDiseases(updated);
  };

  const handleAutoFill = async (queryToUse?: string) => {
    const q = (queryToUse || autoFillQuery).trim();
    if (!q) {
      setAutoFillError('Please enter a plant name first (e.g. Mogra, Gudhal, Champa, Tulsi).');
      return;
    }

    setAutoFillError(null);
    setAutoFillClarification(null);
    setAutoFillUnrecognizedMessage(null);
    setAutoFillSuccessMessage(null);
    setAutoFetchedImageMatched(null);
    setAutoFetchedImageTitle('');
    setIsAutoFilling(true);

    try {
      const res = await fetch('/api/autofill-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();

      if (data.status === 'ambiguous') {
        setAutoFillClarification({
          question: data.clarificationQuestion || 'Did you mean one of these specific plants?',
          suggestions: data.suggestions || [],
        });
        return;
      }

      if (data.status === 'unrecognized') {
        setAutoFillUnrecognizedMessage(
          data.message ||
            `We could not confidently identify a garden plant matching "${q}". You can try another regional or botanical name, or fill in the fields manually below.`
        );
        return;
      }

      if (data.status === 'success' && data.plantData) {
        const p = data.plantData;
        setName(p.name || q);
        if (p.botanicalName) setBotanicalName(p.botanicalName);
        if (p.hindiName) setHindiName(p.hindiName);
        if (p.category) setCategory(p.category as PlantCategory);
        
        // Auto-fetch verified image handling from Wikimedia Commons
        if (p.imageUrl) {
          setImageUrl(p.imageUrl);
          setAutoFetchedImageMatched(true);
          setAutoFetchedImageTitle(data.imageTitle || p.imageTitle || '');
        } else {
          setImageUrl('');
          setAutoFetchedImageMatched(false);
          setAutoFetchedImageTitle('');
        }

        if (p.waterRequirement) {
          if (p.waterRequirement.level) setWaterLevel(p.waterRequirement.level);
          if (p.waterRequirement.frequency) setWaterFrequency(p.waterRequirement.frequency);
          if (p.waterRequirement.seasonalNote) setWaterNote(p.waterRequirement.seasonalNote);
        }

        if (p.sunlightRequirement) {
          if (p.sunlightRequirement.type) setSunlightType(p.sunlightRequirement.type);
          if (p.sunlightRequirement.hoursNeeded) setSunHours(p.sunlightRequirement.hoursNeeded);
          if (p.sunlightRequirement.summerTerraceNote) setSunSummerNote(p.sunlightRequirement.summerTerraceNote);
        }

        if (p.fertilizerRequirement) {
          if (p.fertilizerRequirement.type) setFertilizerType(p.fertilizerRequirement.type);
          if (p.fertilizerRequirement.npkOrOrganic) setFertilizerNpk(p.fertilizerRequirement.npkOrOrganic);
          if (p.fertilizerRequirement.frequency) setFertilizerFrequency(p.fertilizerRequirement.frequency);
        }

        if (p.sowingTime) {
          if (Array.isArray(p.sowingTime.months) && p.sowingTime.months.length > 0) {
            setSowingMonths(p.sowingTime.months);
          }
          if (p.sowingTime.seasonText) setSowingSeasonText(p.sowingTime.seasonText);
          if (p.sowingTime.method) setSowingMethod(p.sowingTime.method);
        }

        if (p.pruningTime) {
          if (Array.isArray(p.pruningTime.months) && p.pruningTime.months.length > 0) {
            setPruningMonths(p.pruningTime.months);
          }
          if (p.pruningTime.seasonText) setPruningSeasonText(p.pruningTime.seasonText);
          if (p.pruningTime.frequency) setPruningFrequency(p.pruningTime.frequency);
          if (p.pruningTime.tips) setPruningTips(p.pruningTime.tips);
        }

        if (p.repottingTime) {
          if (Array.isArray(p.repottingTime.months) && p.repottingTime.months.length > 0) {
            setRepottingMonths(p.repottingTime.months);
          }
          if (p.repottingTime.seasonText) setRepottingSeasonText(p.repottingTime.seasonText);
          if (p.repottingTime.frequency) setRepottingFrequency(p.repottingTime.frequency);
          if (Array.isArray(p.repottingTime.signs) && p.repottingTime.signs.length > 0) {
            setRepottingSignsText(p.repottingTime.signs.join('\n'));
          }
        }

        if (p.potSizeRequired) {
          if (p.potSizeRequired.sizeInches) setPotSizeInches(p.potSizeRequired.sizeInches);
          if (p.potSizeRequired.volumeLiters) setPotVolumeLiters(p.potSizeRequired.volumeLiters);
          if (p.potSizeRequired.materialAdvice) setPotMaterial(p.potSizeRequired.materialAdvice);
        }

        if (p.floweringSeason) {
          setIsFlowering(Boolean(p.floweringSeason.isFlowering));
          if (Array.isArray(p.floweringSeason.months)) {
            setFloweringMonths(p.floweringSeason.months);
          }
          if (p.floweringSeason.seasonText) setFloweringSeasonText(p.floweringSeason.seasonText);
        }

        if (Array.isArray(p.diseasesAndPests) && p.diseasesAndPests.length > 0) {
          setDiseases(
            p.diseasesAndPests.map((dp: any, idx: number) => ({
              id: 'pest-ai-' + Date.now() + '-' + idx,
              name: dp.name || 'Common Terrace Pest',
              symptomType: dp.symptomType || 'pests_visible',
              symptoms: dp.symptoms || '',
              homeRemedy: {
                name: dp.homeRemedy?.name || 'Neem oil or sour buttermilk spray',
                ingredients: dp.homeRemedy?.ingredients || '',
                preparationAndUse: dp.homeRemedy?.preparationAndUse || '',
                frequency: dp.homeRemedy?.frequency || 'Weekly',
              },
              conventionalTreatment: dp.conventionalTreatment || 'Saaf fungicide or organic spray',
            }))
          );
        }

        if (p.notes) {
          setNotes(p.notes);
        }

        if (p.imageUrl) {
          setAutoFillSuccessMessage(
            `All 12 fields and a verified Wikimedia Commons photo auto-filled for "${p.name}". Review the details and preview below, adjust anything as needed, and click "Save Plant" when ready!`
          );
        } else {
          setAutoFillSuccessMessage(
            `All 12 fields auto-filled for "${p.name}". Note: No verified photo was found on Wikimedia Commons; please upload your own photo in Section 1 below, or keep the category icon.`
          );
        }
      }
    } catch (err: unknown) {
      console.error('Plant auto-fill error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to auto-fill plant details';
      setAutoFillError(msg);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingPhoto(true);
      const dataUrl = await compressImageFile(file);
      setCustomPhotoUrl(dataUrl);
    } catch (err) {
      console.error('Failed to compress image', err);
      alert('Could not process this image file. Please try another image.');
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Plant Name is required.');
      return;
    }

    if (detectedDuplicate) {
      setError(
        `A plant named "${detectedDuplicate.name}" already exists in the shared catalog. Please view the existing plant or add it to your garden below.`
      );
      return;
    }

    const signsArray = repottingSignsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // Build the payload cleanly omitting or nulling any empty optional fields
    const payload: Record<string, any> = {
      ...(initialPlant?.id ? { id: initialPlant.id } : {}),
      name: name.trim(),
      category,
      waterRequirement: {
        level: waterLevel,
        frequency: waterFrequency.trim() || 'As needed when topsoil feels dry',
        ...(waterNote.trim() ? { seasonalNote: waterNote.trim() } : {}),
      },
      sunlightRequirement: {
        type: sunlightType,
        hoursNeeded: sunHours.trim() || '4-6 hours direct sun',
        ...(sunSummerNote.trim() ? { summerTerraceNote: sunSummerNote.trim() } : {}),
      },
      fertilizerRequirement: {
        type: fertilizerType.trim() || 'Organic compost / NPK',
        npkOrOrganic: fertilizerNpk.trim() || 'Organic vermicompost / mustard cake tea',
        frequency: fertilizerFrequency.trim() || 'Once every 3 to 4 weeks',
      },
      sowingTime: {
        months: sowingMonths.length > 0 ? sowingMonths : [2, 3, 6, 7],
        seasonText: sowingSeasonText.trim() || 'Spring / Monsoon',
        ...(sowingMethod.trim() ? { method: sowingMethod.trim() } : {}),
      },
      pruningTime: {
        months: pruningMonths.length > 0 ? pruningMonths : [2, 9, 10],
        seasonText: pruningSeasonText.trim() || 'Post-monsoon / Early Spring',
        frequency: pruningFrequency.trim() || 'Light pruning as needed',
        tips: pruningTips.trim() || 'Prune dead or diseased branches with clean shears.',
      },
      repottingTime: {
        months: repottingMonths.length > 0 ? repottingMonths : [2, 3, 7],
        seasonText: repottingSeasonText.trim() || 'Spring or Monsoon',
        frequency: repottingFrequency.trim() || 'Once every 1 to 2 years',
        signs: signsArray.length > 0 ? signsArray : ['Roots tightly bounded in container'],
      },
      potSizeRequired: {
        sizeInches: potSizeInches.trim() || '10 to 12 inches',
        volumeLiters: potVolumeLiters.trim() || '10–15 Liters',
        ...(potMaterial.trim() ? { materialAdvice: potMaterial.trim() } : {}),
      },
      floweringSeason: {
        isFlowering,
        months: isFlowering ? floweringMonths : [],
        seasonText: isFlowering
          ? (floweringSeasonText.trim() || 'Summer through Autumn')
          : 'Not applicable (foliage / non-flowering plant)',
      },
      diseasesAndPests: diseases.filter((d) => d.name.trim() !== ''),
      isFavorite: initialPlant?.isFavorite || false,
    };

    // Optional top-level fields: ONLY attach if non-empty string, NEVER undefined
    if (botanicalName.trim()) payload.botanicalName = botanicalName.trim();
    if (hindiName.trim()) payload.hindiName = hindiName.trim();
    if (imageUrl.trim()) payload.imageUrl = imageUrl.trim();
    if (customPhotoUrl.trim()) payload.customPhotoUrl = customPhotoUrl.trim();
    if (notes.trim()) payload.notes = notes.trim();
    if (lastFertilizedDate) payload.lastFertilizedDate = lastFertilizedDate;

    // Apply strict sanitization to remove any possible undefined values
    const cleanPayload = sanitizeForFirestore(payload);

    onSave(cleanPayload as Plant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 truncate">
              {isEditing ? `Edit ${initialPlant?.name}` : 'Add Plant to Tracker'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
              Fill in the 12 terrace garden care specs and kitchen remedies.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors flex items-center justify-center shrink-0"
            title="Cancel"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          {/* AI Plant Auto-Fill Header Card */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-amber-50/40 p-4 sm:p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-emerald-950 text-sm sm:text-base">
                      Auto-fill Plant with AI
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Regional & Indian Names
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    Type any regional Indian name (e.g. Mogra, Gudhal, Champa, Tulsi, Ghritkumari, Kadi Patta), English name, or botanical name.
                  </p>
                </div>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type local name (e.g. Mogra, Gudhal, Champa, Parijat, Tulsi)..."
                  value={autoFillQuery}
                  onChange={(e) => {
                    setAutoFillQuery(e.target.value);
                    if (autoFillError) setAutoFillError(null);
                    if (autoFillClarification) setAutoFillClarification(null);
                    if (autoFillUnrecognizedMessage) setAutoFillUnrecognizedMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAutoFill();
                    }
                  }}
                  disabled={isAutoFilling}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-emerald-300 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm shadow-2xs font-medium"
                />
                {autoFillQuery && (
                  <button
                    type="button"
                    onClick={() => setAutoFillQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleAutoFill()}
                disabled={isAutoFilling || !autoFillQuery.trim()}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-all active:scale-95 shrink-0 ${
                  isAutoFilling || !autoFillQuery.trim()
                    ? 'bg-emerald-800/50 text-emerald-200 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer hover:shadow-md'
                }`}
              >
                {isAutoFilling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Researching...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Auto-fill Details</span>
                  </>
                )}
              </button>
            </div>

            {/* Error State */}
            {autoFillError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{autoFillError}</div>
                <button
                  type="button"
                  onClick={() => setAutoFillError(null)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Ambiguous State - Clarifying question & suggestions */}
            {autoFillClarification && (
              <div className="mt-3 p-3.5 bg-amber-50/90 border border-amber-300 rounded-xl text-stone-800 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-950 text-xs sm:text-sm">
                      {autoFillClarification.question}
                    </p>
                    <p className="text-[11px] text-amber-800/90 mt-0.5">
                      Click on the specific plant you intended to auto-fill its exact terrace care specs:
                    </p>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {autoFillClarification.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAutoFillQuery(suggestion.name);
                            handleAutoFill(suggestion.name);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100/70 border border-amber-300 hover:border-amber-400 rounded-xl text-left text-xs font-semibold text-stone-900 shadow-2xs transition-all active:scale-95 group"
                        >
                          <span>{suggestion.name}</span>
                          {suggestion.botanicalName && (
                            <span className="italic text-stone-500 font-normal">
                              ({suggestion.botanicalName})
                            </span>
                          )}
                          {suggestion.hint && (
                            <span className="text-[10px] text-amber-700 font-normal bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                              {suggestion.hint}
                            </span>
                          )}
                          <ArrowRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Unrecognized State */}
            {autoFillUnrecognizedMessage && (
              <div className="mt-3 p-3.5 bg-stone-100/90 border border-stone-300 rounded-xl text-stone-800 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-stone-900 mb-0.5">
                      Could not identify plant
                    </p>
                    <p className="text-stone-600 leading-relaxed">
                      {autoFillUnrecognizedMessage}
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setAutoFillUnrecognizedMessage(null);
                          const nameInput = document.querySelector<HTMLInputElement>('input[required]');
                          nameInput?.focus();
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
                      >
                        <span>Fill in details manually below</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoFillUnrecognizedMessage(null)}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Success Populated Notification */}
            {autoFillSuccessMessage && (
              <div className="mt-3 p-3.5 bg-emerald-100/90 border border-emerald-300 rounded-xl text-emerald-950 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-emerald-900 mb-0.5">
                      Auto-fill Complete!
                    </p>
                    <p className="text-emerald-800 leading-relaxed">
                      {autoFillSuccessMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoFillSuccessMessage(null)}
                    className="text-emerald-700 hover:text-emerald-900 p-0.5"
                    title="Dismiss notice"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Plant Identity */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-900 border-b border-stone-100 pb-2">
              1 & 2. Plant Identity & Category
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  1. Plant Common Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tulsi, Desi Rose, Tomato"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 text-base sm:text-sm text-stone-900 transition-colors ${
                    detectedDuplicate
                      ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/30'
                      : 'border-stone-200 focus:ring-emerald-700'
                  }`}
                />

                {/* Duplicate Detected Warning & Quick Actions */}
                {detectedDuplicate && (
                  <div className="mt-2 p-3 bg-amber-50/90 border border-amber-300 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-start gap-2 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold">Plant Already in Catalog: </span>
                        <span>
                          "{detectedDuplicate.name}" is already available
                          {detectedDuplicate.addedByUserName
                            ? ` (contributed by ${detectedDuplicate.addedByUserName})`
                            : ' in the standard reference catalog'}
                          .
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center flex-wrap gap-2 pt-0.5">
                      {onOpenExistingPlant && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenExistingPlant(detectedDuplicate);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] shadow-2xs active:scale-95 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open Plant Guide</span>
                        </button>
                      )}

                      {onAddExistingToGarden && (
                        <button
                          type="button"
                          onClick={() => {
                            onAddExistingToGarden(detectedDuplicate);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] shadow-2xs active:scale-95 transition-all"
                        >
                          {detectedDuplicate.inMyGarden ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Already in My Garden</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 text-amber-900 stroke-[2.5]" />
                              <span>Add to My Garden</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Botanical / Scientific Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ocimum tenuiflorum"
                  value={botanicalName}
                  onChange={(e) => setBotanicalName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900 italic"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Hindi / Regional Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. कृष्ण तुलसी / मीठा नीम"
                  value={hindiName}
                  onChange={(e) => setHindiName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  2. Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PlantCategory)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Photo Upload & Preview */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-800">
                  Plant Photo (Wikimedia Verified Auto-fetch & Device Upload)
                </label>
                {imageUrl && !customPhotoUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Globe className="w-3 h-3 text-emerald-600" />
                    <span>Wikimedia Auto-fetched</span>
                  </span>
                )}
                {customPhotoUrl && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    <Camera className="w-3 h-3 text-emerald-700" />
                    <span>User Photo Active</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                {/* Photo Preview Box */}
                <div className="w-28 h-28 rounded-2xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300 relative shadow-xs">
                  {customPhotoUrl ? (
                    <img
                      src={customPhotoUrl}
                      alt="Plant Preview (User Upload)"
                      className="w-full h-full object-cover"
                    />
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`${name || 'Plant'} - Wikimedia Commons`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 p-2 text-center bg-emerald-50/60">
                      <ImageIcon className="w-6 h-6 text-emerald-700 stroke-[1.75]" />
                      <span className="text-[10px] mt-1 font-semibold text-emerald-900">
                        {category} Icon
                      </span>
                    </div>
                  )}

                  {/* Badges on preview thumbnail */}
                  {customPhotoUrl ? (
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 bg-stone-900/90 backdrop-blur-xs text-emerald-200 text-[9px] px-1.5 py-0.5 rounded-md font-bold text-center truncate">
                      Your Upload (Active)
                    </span>
                  ) : imageUrl ? (
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 bg-emerald-900/90 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold text-center flex items-center justify-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-emerald-300 shrink-0" />
                      <span className="truncate">Wikimedia (Verified)</span>
                    </span>
                  ) : null}
                </div>

                {/* Upload Controls & Status Messages */}
                <div className="space-y-2.5 flex-1 w-full min-w-0">
                  {customPhotoUrl ? (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Your uploaded photo is active</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        {imageUrl
                          ? 'This uploaded photo takes top priority and overrides the auto-fetched Wikimedia image.'
                          : 'Your uploaded photo will be displayed on your plant card and details page.'}
                      </p>
                    </div>
                  ) : imageUrl ? (
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-0.5">
                        <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>Verified Wikimedia Commons photo attached</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Accurately matched for <span className="italic font-semibold">{botanicalName || name}</span>.
                      </p>
                      {autoFetchedImageTitle && (
                        <p className="text-[10px] text-stone-500 italic mt-0.5 truncate">
                          File: {autoFetchedImageTitle}
                        </p>
                      )}
                    </div>
                  ) : autoFetchedImageMatched === false ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-0.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>No verified Wikimedia image found</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        No reliable, correctly-matched photo could be verified on Wikimedia Commons for this species. Please upload your own photo below, or save with the botanical {category} category icon.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Upload an authentic photo of your plant, or use the <strong>Auto-fill Details</strong> button above to search and verify an authentic image from Wikimedia Commons.
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingPhoto}
                      className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-emerald-200" />
                      <span>
                        {customPhotoUrl
                          ? 'Change Uploaded Photo'
                          : imageUrl
                          ? 'Upload Your Own Photo'
                          : 'Upload Plant Photo'}
                      </span>
                    </button>

                    {customPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setCustomPhotoUrl('')}
                        className="min-h-[44px] inline-flex items-center gap-1 px-3.5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
                        <span>{imageUrl ? 'Revert to Auto-fetched Photo' : 'Use Category Icon Instead'}</span>
                      </button>
                    )}

                    {!customPhotoUrl && imageUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setAutoFetchedImageMatched(null);
                          setAutoFetchedImageTitle('');
                        }}
                        className="min-h-[44px] inline-flex items-center gap-1 px-3.5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer active:scale-95"
                      >
                        <X className="w-3.5 h-3.5 text-stone-500" />
                        <span>Remove Auto-fetched Image</span>
                      </button>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Water & Sunlight Requirements */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-900 border-b border-stone-100 pb-2">
              3 & 4. Water & Sunlight Requirements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  3. Water Requirement Level
                </label>
                <select
                  value={waterLevel}
                  onChange={(e) => setWaterLevel(e.target.value as WaterLevel)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                >
                  {WATER_OPTIONS.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label} - {w.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Watering Frequency
                </label>
                <input
                  type="text"
                  placeholder="e.g. Daily in summer; every 2 days in winter"
                  value={waterFrequency}
                  onChange={(e) => setWaterFrequency(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  4. Sunlight Requirement
                </label>
                <select
                  value={sunlightType}
                  onChange={(e) => setSunlightType(e.target.value as SunlightType)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                >
                  {SUNLIGHT_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Sun Hours Needed
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6 to 8 hours direct sun"
                  value={sunHours}
                  onChange={(e) => setSunHours(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fertilizer & Pot Size */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-900 border-b border-stone-100 pb-2">
              5 & 9. Fertilizer & Pot Size Required
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  5. Fertilizer Type & Organic Feed
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vermicompost, Mustard Cake tea, Cow Dung"
                  value={fertilizerType}
                  onChange={(e) => setFertilizerType(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Fertilizer Frequency
                </label>
                <input
                  type="text"
                  placeholder="e.g. Every 15 to 20 days"
                  value={fertilizerFrequency}
                  onChange={(e) => setFertilizerFrequency(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Last Fertilized Date (Optional)
                </label>
                <input
                  type="date"
                  value={lastFertilizedDate}
                  onChange={(e) => setLastFertilizedDate(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  9. Pot Size (Inches & Volume)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12 to 14 inches"
                  value={potSizeInches}
                  onChange={(e) => setPotSizeInches(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Pot Volume (Liters) & Material
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15–20 Liters (Terracotta or Grow bag)"
                  value={potVolumeLiters}
                  onChange={(e) => setPotVolumeLiters(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Calendar Months (6, 7, 8, 10) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-900 border-b border-stone-100 pb-2">
              6, 7, 8 & 10. Seasonal Calendar (Select Months)
            </h3>

            {/* Sowing Months */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-stone-700">
                  6. Best Sowing Months
                </label>
                <span className="text-[11px] text-stone-500">Tap months to toggle</span>
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-2">
                {MONTHS.map((m) => (
                  <button
                    type="button"
                    key={m.index}
                    onClick={() => toggleMonth(sowingMonths, setSowingMonths, m.index)}
                    className={`py-2 sm:py-1.5 min-h-[40px] rounded-xl text-xs font-bold border transition-colors active:scale-95 ${
                      sowingMonths.includes(m.index)
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {m.shortName}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Season description, e.g. Feb–March and June–July"
                value={sowingSeasonText}
                onChange={(e) => setSowingSeasonText(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base sm:text-sm text-stone-900"
              />
            </div>

            {/* Pruning Months */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                7. Pruning & Trimming Months
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-2">
                {MONTHS.map((m) => (
                  <button
                    type="button"
                    key={m.index}
                    onClick={() => toggleMonth(pruningMonths, setPruningMonths, m.index)}
                    className={`py-2 sm:py-1.5 min-h-[40px] rounded-xl text-xs font-bold border transition-colors active:scale-95 ${
                      pruningMonths.includes(m.index)
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {m.shortName}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Pruning advice, e.g. Hard prune in Spring; pinch weekly"
                value={pruningSeasonText}
                onChange={(e) => setPruningSeasonText(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base sm:text-sm text-stone-900"
              />
            </div>

            {/* Repotting Months */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                8. Repotting Months
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-2">
                {MONTHS.map((m) => (
                  <button
                    type="button"
                    key={m.index}
                    onClick={() => toggleMonth(repottingMonths, setRepottingMonths, m.index)}
                    className={`py-2 sm:py-1.5 min-h-[40px] rounded-xl text-xs font-bold border transition-colors active:scale-95 ${
                      repottingMonths.includes(m.index)
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {m.shortName}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder="Signs plant needs repotting (one per line)"
                value={repottingSignsText}
                onChange={(e) => setRepottingSignsText(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base sm:text-sm text-stone-900"
              />
            </div>

            {/* Flowering Months */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-stone-700">
                  10. Flowering Season (If applicable)
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer min-h-[36px]">
                  <input
                    type="checkbox"
                    checked={isFlowering}
                    onChange={(e) => setIsFlowering(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>Is Flowering Plant</span>
                </label>
              </div>
              {isFlowering && (
                <>
                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 mb-2">
                    {MONTHS.map((m) => (
                      <button
                        type="button"
                        key={m.index}
                        onClick={() => toggleMonth(floweringMonths, setFloweringMonths, m.index)}
                        className={`py-2 sm:py-1.5 min-h-[40px] rounded-xl text-xs font-bold border transition-colors active:scale-95 ${
                          floweringMonths.includes(m.index)
                            ? 'bg-amber-700 text-white border-amber-800 shadow-2xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {m.shortName}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Flowering description, e.g. Year-round, peaks March to October"
                    value={floweringSeasonText}
                    onChange={(e) => setFloweringSeasonText(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-base sm:text-sm text-stone-900"
                  />
                </>
              )}
            </div>
          </div>

          {/* Section 5: Diseases & Kitchen Remedies (11 & 12) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h3 className="font-semibold text-stone-900">
                11 & 12. Diseases & Indian Home Remedies
              </h3>
              <button
                type="button"
                onClick={handleAddDisease}
                className="min-h-[44px] inline-flex items-center gap-1 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-300 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Pest / Disease</span>
              </button>
            </div>

            <div className="space-y-4">
              {diseases.map((d, idx) => (
                <div
                  key={d.id}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveDisease(idx)}
                    className="w-11 h-11 flex items-center justify-center absolute top-2 right-2 text-stone-400 hover:text-rose-600 rounded-xl active:scale-95 transition-colors"
                    title="Remove entry"
                    aria-label="Remove disease entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-10">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                        Disease / Pest Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Mealybugs, Powdery Mildew"
                        value={d.name}
                        onChange={(e) => handleUpdateDisease(idx, 'name', e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-white border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                        Symptom Category
                      </label>
                      <select
                        value={d.symptomType}
                        onChange={(e) => handleUpdateDisease(idx, 'symptomType', e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-white border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900"
                      >
                        <option value="pests_visible">Visible Insects / Pests</option>
                        <option value="yellowing">Yellowing Leaves</option>
                        <option value="curling">Curling / Puckered Leaves</option>
                        <option value="powdery_coating">White Powdery Coating</option>
                        <option value="spots">Spots or Blight</option>
                        <option value="holes">Holes / Chewed Leaves</option>
                        <option value="wilting">Wilting / Drooping Stems</option>
                        <option value="bud_drop">Flower Bud Dropping</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                      Symptoms Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. White cottony clusters at leaf joints"
                      value={d.symptoms}
                      onChange={(e) => handleUpdateDisease(idx, 'symptoms', e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900"
                    />
                  </div>

                  {/* Home remedy sub-box */}
                  <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200/80 space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-950 mb-0.5">
                          Indian Kitchen Remedy Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sour Buttermilk & Turmeric Spray"
                          value={d.homeRemedy.name}
                          onChange={(e) =>
                            handleUpdateDisease(idx, 'homeRemedy_name', e.target.value)
                          }
                          className="w-full min-h-[44px] px-3 py-2 bg-white border border-emerald-200 rounded-xl text-base sm:text-xs text-emerald-950"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-950 mb-0.5">
                          Remedy Ingredients
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 100ml sour buttermilk in 1L water"
                          value={d.homeRemedy.ingredients}
                          onChange={(e) =>
                            handleUpdateDisease(idx, 'homeRemedy_ingredients', e.target.value)
                          }
                          className="w-full min-h-[44px] px-3 py-2 bg-white border border-emerald-200 rounded-xl text-base sm:text-xs text-emerald-950"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-emerald-950 mb-0.5">
                        Preparation & Application Method
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Shake well and spray top & underside of leaves in morning"
                        value={d.homeRemedy.preparationAndUse}
                        onChange={(e) =>
                          handleUpdateDisease(idx, 'homeRemedy_prep', e.target.value)
                        }
                        className="w-full min-h-[44px] px-3 py-2 bg-white border border-emerald-200 rounded-xl text-base sm:text-xs text-emerald-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-0.5">
                      Conventional Treatment Alternative
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Saaf fungicide (1.5g/L) or sticky traps"
                      value={d.conventionalTreatment}
                      onChange={(e) =>
                        handleUpdateDisease(idx, 'conventionalTreatment', e.target.value)
                      }
                      className="w-full min-h-[44px] px-3 py-2 bg-white border border-stone-200 rounded-xl text-base sm:text-xs text-stone-900"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Terrace Notes */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Personal Terrace Notes & Location
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Kept on north balcony railing; needs afternoon shade net in May"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-base sm:text-sm text-stone-900"
            />
          </div>

          {/* Modal Actions - Thumb Friendly */}
          <div className="pt-4 border-t border-stone-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 py-2.5 text-stone-700 font-semibold bg-stone-100 hover:bg-stone-200 active:scale-[0.98] rounded-xl transition-colors flex items-center justify-center text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] px-6 py-3 font-bold text-white bg-emerald-900 hover:bg-emerald-950 active:scale-[0.98] rounded-xl shadow-md transition-colors flex items-center justify-center text-sm"
            >
              {isEditing ? 'Save Changes' : 'Add to Garden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
