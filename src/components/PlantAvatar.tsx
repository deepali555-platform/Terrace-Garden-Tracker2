import React from 'react';
import { PlantCategory } from '../types/plant';

interface PlantAvatarProps {
  category: PlantCategory;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PlantAvatar: React.FC<PlantAvatarProps> = ({ category, name, size = 'md' }) => {
  // Generate consistent tint based on plant name
  const isHerbal = category === 'Herb';
  const isVeg = category === 'Vegetable';
  const isFlowering = category === 'Flowering';
  const isSucculent = category === 'Succulent';

  let bgClass = 'bg-emerald-900/10 text-emerald-800';
  if (isFlowering) bgClass = 'bg-rose-900/10 text-rose-800';
  if (isVeg) bgClass = 'bg-amber-900/10 text-amber-800';
  if (isHerbal) bgClass = 'bg-teal-900/10 text-teal-800';
  if (isSucculent) bgClass = 'bg-stone-800/10 text-stone-800';

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-xl',
    md: 'w-14 h-14 rounded-2xl',
    lg: 'w-20 h-20 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 border border-stone-200/60 overflow-hidden ${sizeClasses[size]} ${bgClass}`}
      aria-label={`${name} (${category})`}
    >
      {/* Botanical category SVG icon */}
      {isFlowering && (
        <svg
          className={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V3m4.5 9a4.5 4.5 0 1 1-4.5 4.5M16.5 12H21m-9 4.5a4.5 4.5 0 1 1-4.5-4.5M12 16.5V21m-4.5-9H3" />
          <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      )}

      {isVeg && (
        <svg
          className={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v3m0 0a6 6 0 0 1 6 6c0 4.5-3 8-6 9-3-1-6-4.5-6-9a6 6 0 0 1 6-6Z" />
          <path d="M9 4.5C9.5 3 10.5 2 12 2s2.5 1 3 2.5" />
          <path d="M12 9v6" strokeDasharray="2 2" />
        </svg>
      )}

      {isHerbal && (
        <svg
          className={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      )}

      {isSucculent && (
        <svg
          className={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v20M6.5 8.5C4 10 3 13 3 16c2 1 5 0 6.5-2.5M17.5 8.5C20 10 21 13 21 16c-2 1-5 0-6.5-2.5" />
          <path d="M8 12c-2.5 0-4 2-4 4.5M16 12c2.5 0 4 2 4 4.5" />
        </svg>
      )}

      {!isFlowering && !isVeg && !isHerbal && !isSucculent && (
        <svg
          className={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3v12" />
          <path d="M18 9a9 9 0 0 1-9 9H6" />
          <path d="M6 8a6 6 0 0 1 6-6c3 0 6 2 6 6 0 4-3 7-6 7" />
        </svg>
      )}
    </div>
  );
};
