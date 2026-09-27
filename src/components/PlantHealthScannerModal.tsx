import React, { useState, useRef, useEffect } from 'react';
import { Plant, HealthScanRecord, PlantHealthAssessment, PlantHealthStatus } from '../types/plant';
import { compressImageFile } from '../utils/imageUploadHelper';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Info,
  ChevronDown,
  ArrowRight,
  Leaf,
  Droplet,
  Beaker,
} from 'lucide-react';

interface PlantHealthScannerModalProps {
  isOpen: boolean;
  initialPlant?: Plant | null;
  allPlants: Plant[];
  onClose: () => void;
  onScanSaved: (plantId: string, record: HealthScanRecord) => void;
}

export const PlantHealthScannerModal: React.FC<PlantHealthScannerModalProps> = ({
  isOpen,
  initialPlant,
  allPlants,
  onClose,
  onScanSaved,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [assessmentResult, setAssessmentResult] = useState<PlantHealthAssessment | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync initial plant when modal opens
  useEffect(() => {
    if (initialPlant) {
      setSelectedPlantId(initialPlant.id);
    } else if (allPlants.length > 0 && !selectedPlantId) {
      const firstOwned = allPlants.find((p) => p.inMyGarden);
      setSelectedPlantId(firstOwned ? firstOwned.id : allPlants[0].id);
    }
  }, [initialPlant, allPlants]);

  // Reset state when closing or re-opening
  useEffect(() => {
    if (!isOpen) {
      setSelectedImageBase64(null);
      setAssessmentResult(null);
      setAnalysisError(null);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPlant = allPlants.find((p) => p.id === selectedPlantId) || initialPlant || allPlants[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setAnalysisError(null);
      setAssessmentResult(null);
      setIsSaved(false);
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.82);
      setSelectedImageBase64(compressedDataUrl);
    } catch (err) {
      console.error('Failed to compress image for scan:', err);
      setAnalysisError('Unable to read this photo. Please try choosing another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRunHealthScan = async () => {
    if (!selectedImageBase64 || !currentPlant) return;

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      const payload = {
        imageBase64: selectedImageBase64,
        plantName: currentPlant.name,
        botanicalName: currentPlant.botanicalName,
        category: currentPlant.category,
        knownDiseases: currentPlant.diseasesAndPests.map((d) => ({
          name: d.name,
          symptoms: d.symptoms,
          homeRemedy: d.homeRemedy,
          conventionalTreatment: d.conventionalTreatment,
        })),
      };

      const res = await fetch('/api/scan-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned error (${res.status})`);
      }

      const data = (await res.json()) as PlantHealthAssessment;
      setAssessmentResult(data);
    } catch (err: unknown) {
      console.error('Scan failed:', err);
      const msg = err instanceof Error ? err.message : 'Visual health scan failed. Please try again.';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!assessmentResult || !selectedImageBase64 || !currentPlant) return;

    const newRecord: HealthScanRecord = {
      ...assessmentResult,
      id: 'scan-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      plantId: currentPlant.id,
      plantName: currentPlant.name,
      scanDate: new Date().toISOString(),
      photoDataUrl: selectedImageBase64,
    };

    onScanSaved(currentPlant.id, newRecord);
    setIsSaved(true);
  };

  const getStatusBadge = (status: PlantHealthStatus) => {
    if (status === 'Healthy') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Healthy Plant</span>
        </span>
      );
    }
    if (status === 'Needs Attention') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
          <AlertCircle className="w-4 h-4 text-amber-700" />
          <span>Needs Attention</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
        <AlertTriangle className="w-4 h-4 text-rose-700" />
        <span>Sick / Infested</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emerald-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className="bg-[#faf8f4] w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0f381f] text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-900/60 relative">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/80 text-emerald-100 flex items-center justify-center shadow-xs border border-emerald-400/30 shrink-0">
              <Camera className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2 truncate">
                <span>Plant Health Scanner</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-600/40 shrink-0">
                  AI Vision
                </span>
              </h2>
              <p className="text-xs text-emerald-200/80 truncate">
                Visual health check & Indian kitchen remedies
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white/90 transition-colors flex items-center justify-center shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* STEP 1: Select Plant */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>Select Plant to Analyze</span>
            </label>
            <div className="relative">
              <select
                value={selectedPlantId}
                onChange={(e) => {
                  setSelectedPlantId(e.target.value);
                  setAssessmentResult(null);
                  setIsSaved(false);
                }}
                disabled={isAnalyzing}
                className="w-full min-h-[46px] appearance-none px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-base sm:text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 pr-10 cursor-pointer"
              >
                {allPlants.some((p) => p.inMyGarden) && (
                  <optgroup label="🌿 Plants in My Garden">
                    {allPlants
                      .filter((p) => p.inMyGarden)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.hindiName ? `(${p.hindiName})` : ''} · {p.category}
                        </option>
                      ))}
                  </optgroup>
                )}
                {allPlants.some((p) => !p.inMyGarden) && (
                  <optgroup label="📚 Reference Guide Plants">
                    {allPlants
                      .filter((p) => !p.inMyGarden)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.hindiName ? `(${p.hindiName})` : ''} · {p.category}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {currentPlant && (
              <p className="text-[11px] text-stone-500 italic">
                Will cross-reference with {currentPlant.diseasesAndPests.length} recorded pest & disease remedies for{' '}
                {currentPlant.name}.
              </p>
            )}
          </div>

          {/* STEP 2: Photo Capture / Upload Zone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700">
              <span className="uppercase tracking-wider">Plant Photo (Leaves, Stems, or Foliage)</span>
              {selectedImageBase64 && (
                <button
                  onClick={() => {
                    setSelectedImageBase64(null);
                    setAssessmentResult(null);
                    setIsSaved(false);
                  }}
                  className="min-h-[36px] flex items-center text-emerald-800 hover:underline font-semibold"
                >
                  Choose another photo
                </button>
              )}
            </div>

            {selectedImageBase64 ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-600/40 bg-stone-900 max-h-72 flex items-center justify-center shadow-xs">
                <img
                  src={selectedImageBase64}
                  alt="Captured plant for diagnosis"
                  className="w-full h-64 object-contain"
                />
                <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-xl backdrop-blur-xs">
                  Ready for AI Diagnosis
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-stone-300 hover:border-emerald-600 rounded-3xl p-5 sm:p-8 text-center bg-white transition-colors space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-800">
                    Take or upload a close-up photo of your {currentPlant?.name || 'plant'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Focus on any leaves with discoloration, spots, wilting, or visible insects for the most accurate assessment.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-1">
                  {/* Camera capture button (mobile friendly) */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isCompressing}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo (Camera)</span>
                  </button>

                  {/* Upload from gallery */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isCompressing}
                    className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-xs sm:text-sm font-bold border border-stone-300 transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Browse Gallery</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Action Button: Run Scan */}
          {selectedImageBase64 && !assessmentResult && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleRunHealthScan}
                disabled={isAnalyzing}
                className="w-full min-h-[50px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-75"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                    <span>Analyzing foliage, nutrients & pest patterns with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Diagnose {currentPlant?.name} Health</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {analysisError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Scan Incomplete</p>
                <p className="mt-0.5">{analysisError}</p>
              </div>
            </div>
          )}

          {/* STEP 3: Assessment Results Card */}
          {assessmentResult && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md overflow-hidden">
                {/* Status Bar */}
                <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-50 to-emerald-50/40 border-b border-stone-200/80 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Overall Health Status
                    </span>
                    <div className="mt-1">{getStatusBadge(assessmentResult.healthStatus)}</div>
                  </div>

                  <span className="text-xs text-stone-500 font-medium">
                    {new Date().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Summary */}
                <div className="p-4 sm:p-5 border-b border-stone-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                    Visual Assessment Summary
                  </h4>
                  <p className="text-sm font-semibold text-stone-900 leading-relaxed">
                    {assessmentResult.summary}
                  </p>
                </div>

                {/* Grid: Nutrient Deficiencies & Pests/Diseases */}
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-stone-100">
                  {/* Nutrient Deficiency Section */}
                  <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/70 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <Droplet className="w-4 h-4 text-amber-600" />
                      <span>Nutrient Deficiency Audit</span>
                    </div>
                    {assessmentResult.nutrientDeficiencies.detected ? (
                      <div className="text-xs space-y-1.5 text-stone-800">
                        <p className="font-bold text-amber-950">
                          {assessmentResult.nutrientDeficiencies.deficiency}
                        </p>
                        <p className="text-stone-600 leading-relaxed">
                          {assessmentResult.nutrientDeficiencies.details}
                        </p>
                        <div className="pt-1 text-[11px] font-semibold text-amber-900 bg-white/80 p-2 rounded-xl border border-amber-200/60">
                          <strong>Suggested Feed: </strong>
                          {assessmentResult.nutrientDeficiencies.suggestedFeed}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-stone-600 space-y-1">
                        <p className="font-semibold text-emerald-800">No acute nutrient deficiency detected.</p>
                        <p className="text-[11px] text-stone-500">
                          Leaves show adequate chlorophyll and balance. Maintain your regular feeding cycle: {assessmentResult.nutrientDeficiencies.suggestedFeed}.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pest / Disease Damage Section */}
                  <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-200/70 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-900">
                      <Beaker className="w-4 h-4 text-sky-600" />
                      <span>Pest & Disease Diagnosis</span>
                    </div>
                    {assessmentResult.pestOrDisease.detected ? (
                      <div className="text-xs space-y-1.5 text-stone-800">
                        <p className="font-bold text-sky-950">
                          {assessmentResult.pestOrDisease.matchedDiseaseName || 'Infection / Pest Symptoms'}
                        </p>
                        <p className="text-stone-600 leading-relaxed">
                          <strong>Symptoms: </strong> {assessmentResult.pestOrDisease.symptomsObserved}
                        </p>
                        <p className="text-stone-600 text-[11px]">
                          {assessmentResult.pestOrDisease.details}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-stone-600 space-y-1">
                        <p className="font-semibold text-emerald-800">No visible pest infestation or fungus.</p>
                        <p className="text-[11px] text-stone-500">
                          Foliage surfaces look clean without tell-tale webbing, powdery mildew, or sucking insects.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Remedy: Indian Kitchen First */}
                <div className="p-4 sm:p-5 space-y-3 bg-emerald-50/40">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Recommended Indian Kitchen Remedy</span>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs space-y-2 text-xs">
                    <h5 className="font-extrabold text-sm text-emerald-950">
                      {assessmentResult.recommendedRemedies.homeRemedyName}
                    </h5>
                    <p className="text-stone-700">
                      <strong className="text-stone-900">Kitchen Ingredients: </strong>
                      {assessmentResult.recommendedRemedies.homeRemedyIngredients}
                    </p>
                    <p className="text-stone-700 leading-relaxed">
                      <strong className="text-stone-900">How to Prepare & Apply: </strong>
                      {assessmentResult.recommendedRemedies.homeRemedyInstructions}
                    </p>

                    {assessmentResult.recommendedRemedies.conventionalOption && (
                      <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600">
                        <strong className="text-stone-800">Conventional Nursery Backup: </strong>
                        {assessmentResult.recommendedRemedies.conventionalOption}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Visual Estimate Disclaimer */}
                <div className="p-3.5 bg-stone-100 border-t border-stone-200/80 text-[11px] text-stone-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>AI Visual Estimate Disclaimer: </strong>
                    This assessment is an automated computer vision estimate. Camera lighting, glare, soil moisture, and photo angles can influence diagnosis. Inspect the soil base and leaf undersides manually before aggressive pruning or treatment.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Save to History / Scan Another */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImageBase64(null);
                    setAssessmentResult(null);
                    setIsSaved(false);
                  }}
                  className="min-h-[44px] px-5 py-2.5 text-xs font-bold text-stone-700 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 active:scale-[0.98] transition-colors flex items-center justify-center"
                >
                  Scan Another Photo
                </button>

                <button
                  type="button"
                  onClick={handleSaveToHistory}
                  disabled={isSaved}
                  className={`min-h-[48px] px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                    isSaved
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>Saved to {currentPlant?.name} Log!</span>
                    </>
                  ) : (
                    <>
                      <span>Save to Plant Health History</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200/70 bg-white flex items-center justify-between text-xs text-stone-500">
          <span className="truncate pr-2">Terrace Garden AI Doctor</span>
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors active:scale-95 text-xs sm:text-sm shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
