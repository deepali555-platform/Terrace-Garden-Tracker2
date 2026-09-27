import React, { useState } from 'react';
import { Plant, SymptomCategory } from '../types/plant';
import { COMMON_SYMPTOMS } from '../data/seedPlants';
import { PlantImage } from './PlantImage';
import { getPlantCategoryAccent } from '../utils/gardenHelpers';
import {
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Activity,
  Leaf,
} from 'lucide-react';

interface DiseaseDiagnosisViewProps {
  plants: Plant[];
  preselectedPlantId?: string | null;
  onSelectPlantDetail?: (plant: Plant) => void;
}

export const DiseaseDiagnosisView: React.FC<DiseaseDiagnosisViewProps> = ({
  plants,
  preselectedPlantId,
  onSelectPlantDetail,
}) => {
  const [selectedPlantId, setSelectedPlantId] = useState<string>(preselectedPlantId || 'all');
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomCategory | 'all'>('all');

  const selectedPlant = plants.find((p) => p.id === selectedPlantId);

  // Compute matched diagnoses
  interface MatchedDiagnosis {
    plant: Plant;
    disease: Plant['diseasesAndPests'][0];
  }

  const matches: MatchedDiagnosis[] = [];

  const candidatePlants = selectedPlantId === 'all' ? plants : selectedPlant ? [selectedPlant] : plants;

  candidatePlants.forEach((p) => {
    p.diseasesAndPests.forEach((d) => {
      if (selectedSymptom === 'all' || d.symptomType === selectedSymptom) {
        matches.push({ plant: p, disease: d });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* DISTINCT ACCENT HERO: Cool Organic Teal & Mint Plant Clinic Theme */}
      <div className="bg-gradient-to-br from-[#083329] via-[#0f4438] to-[#122e28] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-teal-500/30 relative overflow-hidden">
        {/* Subtle decorative medical cross / leaf motif */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-teal-300">
          <Stethoscope className="w-60 h-60 stroke-[1]" />
        </div>

        <div className="relative z-10 flex items-start gap-4 border-b border-white/10 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center shrink-0 shadow-xs">
            <Stethoscope className="w-6 h-6 text-teal-200 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Diagnostic Clinic & Organic Remedies</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              Terrace Plant Doctor & Pest Clinic
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
              Diagnose pest infestations, yellowing leaves, and fungal blights. Get tested Indian kitchen treatments (neem, sour buttermilk, turmeric, wood ash) alongside safe conventional alternatives.
            </p>
          </div>
        </div>

        {/* Step 1: Select Plant */}
        <div className="mt-5 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
              <span>Step 1: Which plant is showing distress?</span>
            </label>
            {selectedPlantId !== 'all' && (
              <button
                onClick={() => setSelectedPlantId('all')}
                className="min-h-[36px] text-xs text-teal-300 hover:text-white font-bold underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset to All Plants
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <button
              onClick={() => setSelectedPlantId('all')}
              className={`p-2.5 min-h-[46px] rounded-2xl border text-left transition-all active:scale-95 ${
                selectedPlantId === 'all'
                  ? 'bg-teal-400 text-stone-950 border-teal-300 font-extrabold shadow-md scale-102'
                  : 'bg-black/30 text-teal-100 border-white/10 hover:bg-black/50'
              }`}
            >
              <div className="text-xs font-bold">All Plants</div>
              <div className="text-[10px] opacity-80">Full garden search</div>
            </button>

            {plants.map((p) => {
              const isSelected = p.id === selectedPlantId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlantId(p.id)}
                  className={`p-2 min-h-[46px] rounded-2xl border text-left transition-all flex items-center gap-2 active:scale-95 ${
                    isSelected
                      ? 'bg-teal-400 text-stone-950 border-teal-300 font-extrabold shadow-md scale-102'
                      : 'bg-black/30 text-teal-100 border-white/10 hover:bg-black/50'
                  }`}
                >
                  <PlantImage
                    plant={p}
                    aspectRatio="thumb"
                    className="w-8 h-8 rounded-xl shrink-0"
                    showCustomBadge={false}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{p.name}</div>
                    <div className="text-[10px] opacity-75 truncate">{p.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Symptom */}
        <div className="mt-6 space-y-2 relative z-10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-teal-200 uppercase tracking-wider">
              Step 2: What symptom do you observe on the plant?
            </label>
            {selectedSymptom !== 'all' && (
              <button
                onClick={() => setSelectedSymptom('all')}
                className="min-h-[36px] text-xs text-teal-300 hover:text-white font-bold underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Show All Symptoms
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedSymptom('all')}
              className={`p-3 min-h-[48px] rounded-2xl border text-left transition-all active:scale-95 ${
                selectedSymptom === 'all'
                  ? 'bg-teal-400 text-stone-950 border-teal-300 font-extrabold shadow-md'
                  : 'bg-black/30 text-teal-100 border-white/10 hover:bg-black/50'
              }`}
            >
              <div className="text-xs font-bold">All Symptoms</div>
              <p className="text-[11px] opacity-80 mt-0.5">Show all recorded ailments</p>
            </button>

            {COMMON_SYMPTOMS.map((sym) => {
              const isSelected = selectedSymptom === sym.type;
              return (
                <button
                  key={sym.type}
                  onClick={() => setSelectedSymptom(sym.type)}
                  className={`p-3 min-h-[48px] rounded-2xl border text-left transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-teal-400 text-stone-950 border-teal-300 font-extrabold shadow-md'
                      : 'bg-black/30 text-teal-100 border-white/10 hover:bg-black/50'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{sym.label}</div>
                  <p className="text-[11px] opacity-80 mt-0.5 line-clamp-2">
                    {sym.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Diagnosis Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <span>Diagnosis Matches</span>
            <span className="text-xs font-bold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full border border-teal-200">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </span>
          </h2>
          <span className="text-xs text-stone-500 font-medium">
            {selectedPlant ? `Targeting: ${selectedPlant.name}` : 'Searching full terrace database'}
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200/80 p-8 text-center space-y-3 shadow-xs">
            <HelpCircle className="w-12 h-12 text-teal-500/50 mx-auto" />
            <h3 className="text-base font-bold text-stone-900">
              No recorded issue matches this specific combination
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Try setting "All Symptoms" or "All Plants" to browse our complete collection of Indian organic kitchen garden pest treatments.
            </p>
            <button
              onClick={() => {
                setSelectedPlantId('all');
                setSelectedSymptom('all');
              }}
              className="px-4 py-2 text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 rounded-xl transition-colors border border-teal-300 shadow-2xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {matches.map(({ plant, disease }, idx) => {
              const accent = getPlantCategoryAccent(plant.category);
              return (
                <div
                  key={disease.id + '-' + idx}
                  className="bg-white rounded-3xl border border-stone-200 hover:border-teal-500/60 p-5 sm:p-6 shadow-xs transition-all space-y-4"
                >
                  {/* Header: Plant Photo & Disease Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
                    <div className="flex items-center gap-3.5">
                      <PlantImage
                        plant={plant}
                        aspectRatio="thumb"
                        className="w-14 h-14 rounded-2xl shrink-0 border border-stone-200 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2.5 py-0.2 rounded-full font-bold border ${accent.pillBadge}`}>
                            {plant.category}
                          </span>
                          <span className="text-xs font-bold text-emerald-900">{plant.name}</span>
                          {plant.hindiName && (
                            <span className="text-xs text-stone-500">({plant.hindiName})</span>
                          )}
                        </div>
                        <h3 className="text-lg font-extrabold text-stone-900 mt-1">
                          {disease.name}
                        </h3>
                      </div>
                    </div>

                    {onSelectPlantDetail && (
                      <button
                        onClick={() => onSelectPlantDetail(plant)}
                        className="min-h-[44px] text-xs font-bold text-teal-950 flex items-center justify-center gap-1.5 self-stretch sm:self-center bg-teal-50 px-4 py-2.5 rounded-xl border border-teal-200 hover:bg-teal-100 transition-all shadow-2xs active:scale-95"
                      >
                        <span>Full Plant Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Confirmatory Symptoms */}
                  <div className="text-xs text-stone-700 flex items-start gap-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900">Symptoms to Confirm: </strong>
                      {disease.symptoms}
                    </div>
                  </div>

                  {/* Indian Kitchen Home Remedy Box */}
                  <div className="bg-emerald-50/90 rounded-2xl p-4 sm:p-5 border border-emerald-200 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Indian Kitchen Remedy: {disease.homeRemedy.name}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                        <span className="font-bold text-emerald-950 block mb-1">
                          Ingredients Required:
                        </span>
                        <p className="text-emerald-900 font-medium">{disease.homeRemedy.ingredients}</p>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                        <span className="font-bold text-emerald-950 block mb-1">
                          Application Schedule:
                        </span>
                        <p className="text-emerald-900 font-bold">
                          {disease.homeRemedy.frequency}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 leading-relaxed shadow-2xs">
                      <span className="font-bold block mb-1">
                        Preparation & Application Steps:
                      </span>
                      {disease.homeRemedy.preparationAndUse}
                    </div>
                  </div>

                  {/* Conventional Treatment Alternative */}
                  <div className="text-xs text-stone-700 bg-stone-50 p-3 rounded-2xl border border-stone-200 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-stone-900">
                        Conventional / Chemical Treatment (Alternative):{' '}
                      </strong>
                      {disease.conventionalTreatment}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Indian Terrace Kitchen Remedy Cabinet Cheat-Sheet */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 text-sm font-bold text-stone-900 mb-3">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Quick Indian Kitchen Garden Medicine Cabinet (Cheat Sheet)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <span className="font-bold text-emerald-950 block">Neem Oil Emulsion</span>
            <p className="text-stone-600">
              5ml cold-pressed neem oil + 3 drops gentle dish soap per 1L lukewarm water. Repels aphids, whiteflies, mealybugs, and spider mites.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <span className="font-bold text-emerald-950 block">Sour Buttermilk (Khatta Chhaas)</span>
            <p className="text-stone-600">
              100ml 3-day old sour curd/buttermilk in 1L water. Natural organic fungicide for powdery mildew, leaf curl, and blight.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <span className="font-bold text-emerald-950 block">Turmeric (Haldi) Paste</span>
            <p className="text-stone-600">
              Turmeric mixed with mustard oil. Antiseptic sealant for freshly pruned rose stems to stop Dieback fungus cold.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <span className="font-bold text-emerald-950 block">Baking Soda Solution</span>
            <p className="text-stone-600">
              1 tsp baking soda (meetha soda) + 2 drops soap in 1L water. Changes leaf surface pH to suppress powdery mildew and spots.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <span className="font-bold text-emerald-950 block">Garlic-Chili Spray</span>
            <p className="text-stone-600">
              5 cloves garlic + 2 hot chilies blended and steeped overnight in 1L water. Powerful organic deterrent against caterpillars and borers.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
            <span className="font-bold text-emerald-950 block">Cinnamon & Wood Ash</span>
            <p className="text-stone-600">
              Dry ground cinnamon powder + sifted wood ash. Natural antifungal dusting for seedling damping off and root rot prevention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
