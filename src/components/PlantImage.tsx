import React, { useState } from 'react';
import { Plant, PlantCategory } from '../types/plant';
import {
  Flower2,
  Carrot,
  Leaf,
  Trees,
  Sprout,
  Sparkles,
  Camera,
  Layers,
} from 'lucide-react';

interface PlantImageProps {
  plant: Plant;
  aspectRatio?: 'square' | 'thumb' | 'hero' | 'card';
  className?: string;
  showCustomBadge?: boolean;
  altText?: string;
}

export const PlantImage: React.FC<PlantImageProps> = ({
  plant,
  aspectRatio = 'square',
  className = '',
  showCustomBadge = true,
  altText,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Prioritize user's uploaded terrace photo, then verified species Wikimedia photo
  const hasUserPhoto = Boolean(plant.customPhotoUrl);
  const displayUrl = plant.customPhotoUrl || plant.imageUrl;
  const hasPhoto = Boolean(displayUrl) && !hasError;

  const ratioClasses = {
    square: 'aspect-square',
    thumb: 'w-14 h-14 sm:w-16 sm:h-16 shrink-0',
    card: 'aspect-4/3 w-full',
    hero: 'w-full h-56 sm:h-72',
  };

  const getCategoryTheme = (category: PlantCategory) => {
    switch (category) {
      case 'Flowering':
        return {
          bg: 'from-rose-50 via-pink-50 to-emerald-50/40 text-rose-700 border-rose-200/80',
          accentBadge: 'bg-rose-100/90 text-rose-800 border-rose-200',
          icon: Flower2,
          label: 'Flowering Specimen',
          svgPattern: 'rgba(244, 63, 94, 0.08)',
        };
      case 'Vegetable':
        return {
          bg: 'from-amber-50 via-orange-50 to-emerald-50/40 text-amber-700 border-amber-200/80',
          accentBadge: 'bg-amber-100/90 text-amber-800 border-amber-200',
          icon: Carrot,
          label: 'Terrace Vegetable',
          svgPattern: 'rgba(245, 158, 11, 0.08)',
        };
      case 'Herb':
        return {
          bg: 'from-emerald-50 via-teal-50 to-lime-50/40 text-emerald-700 border-emerald-200/80',
          accentBadge: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
          icon: Leaf,
          label: 'Aromatic Herb',
          svgPattern: 'rgba(16, 185, 129, 0.08)',
        };
      case 'Foliage':
        return {
          bg: 'from-teal-50 via-emerald-50 to-green-50/40 text-teal-800 border-teal-200/80',
          accentBadge: 'bg-teal-100/90 text-teal-800 border-teal-200',
          icon: Trees,
          label: 'Lush Foliage',
          svgPattern: 'rgba(13, 148, 136, 0.08)',
        };
      case 'Succulent':
        return {
          bg: 'from-stone-100 via-emerald-50 to-stone-50 text-stone-700 border-stone-300/80',
          accentBadge: 'bg-stone-200 text-stone-800 border-stone-300',
          icon: Sprout,
          label: 'Hardy Succulent',
          svgPattern: 'rgba(120, 113, 108, 0.08)',
        };
      case 'Fruit':
        return {
          bg: 'from-orange-50 via-amber-50 to-emerald-50/40 text-orange-700 border-orange-200/80',
          accentBadge: 'bg-orange-100/90 text-orange-800 border-orange-200',
          icon: Sparkles,
          label: 'Terrace Fruit',
          svgPattern: 'rgba(249, 115, 22, 0.08)',
        };
      default:
        return {
          bg: 'from-emerald-50 via-stone-50 to-emerald-50 text-emerald-800 border-emerald-200',
          accentBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Leaf,
          label: 'Terrace Plant',
          svgPattern: 'rgba(16, 185, 129, 0.08)',
        };
    }
  };

  const theme = getCategoryTheme(plant.category);
  const CategoryIcon = theme.icon;

  // 1. Display photo (Custom photo OR verified Wikimedia Commons species photo)
  if (hasPhoto && displayUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-stone-100 ${ratioClasses[aspectRatio]} ${className}`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-stone-200/70 animate-pulse flex items-center justify-center z-10">
            <Leaf className="w-5 h-5 text-stone-400 animate-bounce" />
          </div>
        )}

        <img
          src={displayUrl}
          alt={altText || `${plant.name} - ${hasUserPhoto ? 'My Terrace Photo' : 'Botanical Species Photo'}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {showCustomBadge && hasUserPhoto && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-emerald-950/90 backdrop-blur-md text-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border border-emerald-400/40">
            <Camera className="w-3 h-3 text-emerald-400" />
            <span>My Photo</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Safe, consistent botanical category illustrated graphic (guaranteed 100% accurate per category)
  if (aspectRatio === 'hero') {
    return (
      <div
        className={`relative overflow-hidden flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br ${theme.bg} ${ratioClasses.hero} ${className} border-b`}
        role="img"
        aria-label={`${plant.name} - Botanical ${theme.label}`}
      >
        {/* Subtle decorative concentric botanical rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div
            className="w-80 h-80 rounded-full border border-dashed"
            style={{ borderColor: theme.svgPattern }}
          />
          <div
            className="absolute w-56 h-56 rounded-full border"
            style={{ borderColor: theme.svgPattern }}
          />
        </div>

        {/* Central Illustrated Botanical Icon */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/80 backdrop-blur-md shadow-sm border border-white flex items-center justify-center mb-2.5 transition-transform hover:scale-105">
            <CategoryIcon className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.8]" />
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${theme.accentBadge}`}>
            <Layers className="w-3 h-3" />
            <span>{theme.label}</span>
          </span>

          <span className="text-[11px] text-stone-500 font-medium mt-2 max-w-xs">
            Botanical category graphic · Upload your plant photo above anytime
          </span>
        </div>
      </div>
    );
  }

  if (aspectRatio === 'thumb') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl flex flex-col items-center justify-center bg-gradient-to-br ${theme.bg} border ${ratioClasses.thumb} ${className} shadow-2xs group-hover:shadow-xs transition-shadow`}
        role="img"
        aria-label={`${plant.name} - ${theme.label}`}
      >
        <div className="w-8 h-8 rounded-xl bg-white/85 shadow-2xs flex items-center justify-center transition-transform group-hover:scale-110">
          <CategoryIcon className="w-4 h-4 stroke-[2]" />
        </div>
      </div>
    );
  }

  // Card or Square view
  return (
    <div
      className={`relative overflow-hidden rounded-2xl flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br ${theme.bg} border ${ratioClasses[aspectRatio]} ${className}`}
      role="img"
      aria-label={`${plant.name} - ${theme.label}`}
    >
      <div className="w-11 h-11 rounded-2xl bg-white/80 shadow-2xs flex items-center justify-center mb-1.5">
        <CategoryIcon className="w-5 h-5 stroke-[1.75]" />
      </div>
      <span className="text-[11px] font-bold tracking-tight line-clamp-1">
        {plant.name}
      </span>
      <span className="text-[10px] opacity-75 font-medium">{theme.label}</span>
    </div>
  );
};
