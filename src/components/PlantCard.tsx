import React from 'react';
import { Plant } from '../types/plant';
import { PlantImage } from './PlantImage';
import { Sun, Droplets, Flower2, Heart, Leaf, AlertTriangle, CheckCircle2, Plus, User as UserIcon } from 'lucide-react';
import { isPlantBloomingMonth, getPlantCategoryAccent } from '../utils/gardenHelpers';
import { calculateFertilizerStatus } from '../utils/fertilizerHelpers';
import { useAuth } from '../contexts/AuthContext';

interface PlantCardProps {
  plant: Plant;
  currentMonthIndex: number;
  onSelect: (plant: Plant) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleGarden?: (id: string, e: React.MouseEvent) => void;
  isHighlighted?: boolean;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  currentMonthIndex,
  onSelect,
  onToggleFavorite,
  onToggleGarden,
  isHighlighted = false,
}) => {
  const { user } = useAuth();
  const isBloomingNow = isPlantBloomingMonth(plant, currentMonthIndex);
  const accent = getPlantCategoryAccent(plant.category);
  const fertilizerStatus = calculateFertilizerStatus(plant);
  // Strictly evaluate isOwned ONLY for authenticated users
  const isOwned = Boolean(user && plant.inMyGarden);

  return (
    <div
      id={`plant-card-${plant.id}`}
      onClick={() => onSelect(plant)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(plant);
        }
      }}
      className={`group text-left rounded-2xl sm:rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98] cursor-pointer flex flex-col justify-between relative overflow-hidden p-2.5 sm:p-4 ${
        isHighlighted
          ? 'ring-2 ring-emerald-600 ring-offset-2 bg-emerald-50/20 border-emerald-600 shadow-md scale-[1.01]'
          : isOwned
          ? isOwned && fertilizerStatus.isOverdue
            ? 'bg-gradient-to-b from-amber-50/30 via-white to-white border-amber-400 ring-1 ring-amber-400/30 shadow-xs hover:border-amber-500'
            : 'bg-gradient-to-b from-emerald-50/25 via-white to-white border-emerald-500/70 ring-1 ring-emerald-500/20 shadow-xs hover:border-emerald-600'
          : 'bg-white border-stone-200/90 hover:border-stone-400 shadow-2xs'
      }`}
    >
      {/* Top Match Badge if highlighted */}
      {isHighlighted && (
        <div className="absolute top-2 right-2 z-20 pointer-events-none">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white shadow-sm animate-pulse">
            ★ Top Match
          </span>
        </div>
      )}
      {/* ============================================================ */}
      {/* 1. MOBILE VIEW (< sm): Clean, evenly sized 2-column card     */}
      {/* ============================================================ */}
      <div className="sm:hidden flex flex-col justify-between h-full w-full">
        <div>
          {/* Plant image at the top with rounded corners */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
            <PlantImage
              plant={plant}
              aspectRatio="square"
              className="w-full h-full object-cover"
              showCustomBadge={false}
            />

            {/* In Garden indicator badge */}
            {isOwned && (
              <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-900/85 backdrop-blur-xs text-white shadow-xs">
                <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>In Garden</span>
              </span>
            )}

            {/* Favorite Heart Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(plant.id, e);
              }}
              className="absolute top-1.5 right-1.5 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/85 backdrop-blur-xs text-stone-400 hover:text-rose-500 active:scale-90 transition-all shadow-xs"
              title={plant.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={plant.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
                  plant.isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-stone-500'
                }`}
              />
            </button>
          </div>

          {/* Plant name below the image in medium-weight text */}
          <div className="mt-2 min-w-0">
            <h3 className="text-xs font-medium text-stone-900 group-hover:text-emerald-900 transition-colors truncate leading-tight">
              {plant.name}
            </h3>
          </div>

          {/* Small category tag/badge below the name */}
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${accent.pillBadge}`}
            >
              <Leaf className="w-2.5 h-2.5 shrink-0" />
              <span className="truncate">{plant.category}</span>
            </span>
            {plant.addedByUserName && (
              <span className="text-[10px] text-stone-500 font-medium truncate">
                by {plant.addedByUserName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TABLET & DESKTOP VIEW (>= sm): Rich, detailed care card   */}
      {/* ============================================================ */}
      <div className="hidden sm:flex sm:flex-col sm:justify-between h-full w-full">
        <div>
          {/* Top Status Strip: Category + In My Garden Badge / Toggle + Favorite */}
          <div className="flex items-center justify-between gap-1.5 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight border shrink-0 ${accent.pillBadge}`}
              >
                <Leaf className="w-3 h-3" />
                <span>{plant.category}</span>
              </span>

              {plant.addedByUserName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200/80 shrink-0">
                  <UserIcon className="w-2.5 h-2.5 text-stone-400" />
                  <span>Added by {plant.addedByUserName}</span>
                </span>
              )}

              {/* In My Garden Toggle Button */}
              {onToggleGarden && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleGarden(plant.id, e);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold tracking-tight transition-all active:scale-95 shadow-2xs min-h-[44px] shrink-0 ${
                    isOwned
                      ? 'bg-emerald-100 hover:bg-rose-50 text-emerald-950 hover:text-rose-800 border border-emerald-300 hover:border-rose-300'
                      : 'bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-950 border border-stone-200 hover:border-emerald-300'
                  }`}
                  title={isOwned ? 'Currently In My Garden (Click to remove)' : 'Click to Add to My Garden'}
                >
                  {isOwned ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 stroke-[2.4]" />
                      <span>In Garden</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-stone-700 shrink-0 stroke-[2.5]" />
                      <span>Add to Garden</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Favorite Button */}
            <button
              type="button"
              onClick={(e) => onToggleFavorite(plant.id, e)}
              className="w-11 h-11 -mr-1.5 -mt-1 flex items-center justify-center rounded-full text-stone-400 hover:text-rose-600 hover:bg-stone-100 active:scale-90 transition-all shrink-0"
              title={plant.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={plant.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                  plant.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                }`}
              />
            </button>
          </div>

          {/* Thumbnail Image + Plant Titles */}
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <PlantImage
                plant={plant}
                aspectRatio="thumb"
                className={`w-16 h-16 rounded-2xl shadow-xs border transition-shadow ${
                  isOwned ? 'border-emerald-200/90 group-hover:shadow-md' : 'border-stone-200/80'
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-1">
                {plant.name}
              </h3>

              {plant.hindiName && (
                <p className="text-[11px] font-medium text-emerald-800/80 truncate mt-0.5">
                  {plant.hindiName}
                </p>
              )}

              {plant.botanicalName && (
                <p className="text-xs italic text-stone-500 font-serif truncate mt-0.5">
                  {plant.botanicalName}
                </p>
              )}
            </div>
          </div>

          {/* Overdue Fertilizer Notification Banner */}
          {isOwned && fertilizerStatus.isOverdue && (
            <div className="mt-2.5 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center justify-between text-[11px] text-amber-900 font-bold">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Feed Overdue</span>
              </span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-200/60 px-1.5 py-0.2 rounded-md">
                {fertilizerStatus.status === 'not_set' ? 'Not recorded' : fertilizerStatus.statusLabel}
              </span>
            </div>
          )}

          {/* Quick Specs Grid */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-700 bg-[#fbf9f4] p-2.5 rounded-2xl border border-stone-200/60">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{plant.sunlightRequirement.type}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="truncate">{plant.waterRequirement.level} water</span>
            </div>
          </div>

          {/* Blooming Season Tag / Pot Size */}
          <div className="mt-2.5 flex items-center justify-between text-xs text-stone-500">
            <span className="text-[11px] font-medium text-stone-600">
              Pot: <strong className="text-stone-800 font-semibold">{plant.potSizeRequired.sizeInches}</strong>
            </span>

            {isBloomingNow && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/70 px-2 py-0.5 rounded-full animate-pulse">
                <Flower2 className="w-3 h-3 text-rose-500" />
                <span>Blooming now</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs min-h-[44px]">
          <span className="text-emerald-800 font-bold group-hover:underline flex items-center gap-1 text-xs">
            <span>View Care Guide</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
          <span className="text-stone-500 font-medium text-[11px]">
            {plant.diseasesAndPests.length} {plant.diseasesAndPests.length === 1 ? 'remedy' : 'remedies'}
          </span>
        </div>
      </div>
    </div>
  );
};

