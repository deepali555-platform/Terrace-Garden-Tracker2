import React, { useState, useRef } from 'react';
import { Plant, HealthScanRecord } from '../types/plant';
import { PlantImage } from './PlantImage';
import { compressImageFile } from '../utils/imageUploadHelper';
import { calculateFertilizerStatus, formatReadableDate, toISODateString } from '../utils/fertilizerHelpers';
import {
  X,
  Droplets,
  Sun,
  Sparkles,
  Scissors,
  Calendar,
  Box,
  Flower2,
  AlertTriangle,
  Stethoscope,
  Pencil,
  Trash2,
  Heart,
  CheckCircle2,
  Info,
  Camera,
  RotateCcw,
  Leaf,
  ShieldCheck,
  AlertCircle,
  Clock,
  RotateCw,
  Plus,
  LogIn,
  User as UserIcon,
} from 'lucide-react';
import { MONTHS, isPlantBloomingMonth, getPlantCategoryAccent } from '../utils/gardenHelpers';
import { useAuth } from '../contexts/AuthContext';
import { isUserAdmin } from '../config/adminConfig';

interface PlantDetailModalProps {
  plant: Plant;
  currentMonthIndex: number;
  onClose: () => void;
  onEdit: (plant: Plant) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onToggleInMyGarden?: (plantId: string, e?: React.MouseEvent) => void;
  onDiagnosePlant?: (plantId: string) => void;
  onUpdatePhoto?: (plantId: string, photoDataUrl: string | null) => void;
  onOpenScanModal?: (plant: Plant) => void;
  onMarkFertilized?: (plantId: string, dateStr?: string) => void;
  onDeleteScanRecord?: (plantId: string, scanId: string) => void;
  onRequireAuth?: (action: () => void, reason: string) => void;
  isLoggedIn?: boolean;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  currentMonthIndex,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleInMyGarden,
  onDiagnosePlant,
  onUpdatePhoto,
  onOpenScanModal,
  onMarkFertilized,
  onDeleteScanRecord,
  onRequireAuth,
  isLoggedIn = false,
}) => {
  const [activeTab, setActiveTab] = useState<'care' | 'calendar' | 'pests' | 'scans'>('care');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [justMarkedFertilized, setJustMarkedFertilized] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const isEffectivelyLoggedIn = Boolean(user || isLoggedIn);
  // CRITICAL: "In My Garden" status should ONLY be evaluated and shown based on the currently logged-in user's
  // actual saved data in the database. It must never default to "In My Garden" or show any garden status for a guest.
  const isOwned = Boolean(isEffectivelyLoggedIn && plant.inMyGarden);

  const isAdmin = Boolean(user?.email && isUserAdmin(user.email));
  const isCreator = Boolean(user?.uid && plant.addedByUserId && plant.addedByUserId === user.uid);
  const isPrePopulated = !plant.addedByUserId;
  const canEditOrDelete = isAdmin || (isCreator && !isPrePopulated);

  const isBloomingNow = isPlantBloomingMonth(plant, currentMonthIndex);
  const accent = getPlantCategoryAccent(plant.category);
  const fertilizerSchedule = calculateFertilizerStatus(plant);

  const handleQuickMarkFertilized = () => {
    if (!isEffectivelyLoggedIn && onRequireAuth) {
      onRequireAuth(
        () => {
          if (onMarkFertilized) {
            onMarkFertilized(plant.id, toISODateString(new Date()));
            setJustMarkedFertilized(true);
            setTimeout(() => {
              setJustMarkedFertilized(false);
            }, 2000);
          }
        },
        `Sign in with Google to log fertilizer dates and track feeding schedules for ${plant.name}.`
      );
      return;
    }
    if (onMarkFertilized) {
      onMarkFertilized(plant.id, toISODateString(new Date()));
      setJustMarkedFertilized(true);
      setTimeout(() => {
        setJustMarkedFertilized(false);
      }, 2000);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdatePhoto) return;

    if (!isLoggedIn && onRequireAuth) {
      onRequireAuth(
        () => fileInputRef.current?.click(),
        `Sign in with Google to customize and save photos for ${plant.name}.`
      );
      return;
    }

    try {
      setIsUploading(true);
      const dataUrl = await compressImageFile(file);
      onUpdatePhoto(plant.id, dataUrl);
    } catch (err) {
      console.error('Failed to process image file', err);
      alert('Could not process this image file. Please try another image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetPhoto = () => {
    if (onUpdatePhoto) {
      onUpdatePhoto(plant.id, null);
    }
  };

  const renderMonthIndicators = (activeMonths: number[], label: string) => {
    return (
      <div className="mt-2">
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 text-center">
          {MONTHS.map((m) => {
            const isActive = activeMonths.includes(m.index);
            const isCurrent = m.index === currentMonthIndex;
            return (
              <div
                key={m.index}
                className={`py-1 px-0.5 rounded-lg text-[11px] font-medium border transition-colors ${
                  isActive
                    ? isCurrent
                      ? 'bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-500/50 font-bold'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                    : 'bg-stone-50 text-stone-400 border-stone-200'
                }`}
                title={`${m.name} - ${isActive ? 'Active for ' + label : 'Inactive'}`}
              >
                {m.shortName}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-emerald-950/70 backdrop-blur-xs flex items-center justify-center p-1.5 sm:p-5">
      <div className="bg-[#faf8f5] w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* HERO SECTION: Custom/Species Photo OR Botanical Illustrated Category Header */}
        {plant.customPhotoUrl || plant.imageUrl ? (
          <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-stone-900 shrink-0">
            <PlantImage
              plant={plant}
              aspectRatio="hero"
              className="w-full h-full object-cover"
              showCustomBadge={false}
            />

            {/* Measured Dark Gradient Scrim for WCAG AA Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/35" />

            {/* Top Navigation Row: Close on Left, Favorite/Edit/Delete on Right (Zero Collision) */}
            <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors flex items-center justify-center shadow-md active:scale-95"
                title="Close"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(plant.id, e)}
                  className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors flex items-center justify-center shadow-md active:scale-95"
                  title="Toggle Favorite"
                  aria-label="Toggle Favorite"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      plant.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                </button>
                {canEditOrDelete && (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(plant)}
                      className="w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors flex items-center justify-center shadow-md active:scale-95"
                      title={isAdmin && isPrePopulated ? "Edit Plant (Admin)" : "Edit Plant"}
                      aria-label="Edit Plant"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-11 h-11 rounded-full bg-black/60 hover:bg-rose-900/80 text-white backdrop-blur-md transition-colors flex items-center justify-center shadow-md active:scale-95"
                      title={isAdmin && isPrePopulated ? "Delete Plant (Admin)" : "Delete Plant"}
                      aria-label="Delete Plant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Action Pills: Scan & Photo Management */}
            <div className="absolute top-15 left-2.5 right-2.5 z-20 flex items-center flex-wrap gap-2">
              {onOpenScanModal && (
                <button
                  type="button"
                  onClick={() => onOpenScanModal(plant)}
                  className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold backdrop-blur-md border border-emerald-400/40 transition-all shadow-md active:scale-95"
                  title="Diagnose plant health with AI camera scan"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Scan Plant</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all shadow-md active:scale-95"
              >
                <Camera className="w-4 h-4 text-emerald-300" />
                <span>{plant.customPhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {plant.customPhotoUrl && (
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="min-h-[44px] flex items-center gap-1 px-3 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white/90 text-xs font-medium backdrop-blur-md border border-white/20 transition-all shadow-md"
                  title="Remove custom photo and return to species reference photo"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-stone-300" />
                  <span className="hidden sm:inline">Reference</span>
                </button>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Plant Titles Overlaid on Photo */}
            <div className="absolute bottom-3 left-3 right-3 z-20 text-white">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs border ${accent.pillBadge}`}
                >
                  <Leaf className="w-3 h-3" />
                  <span>{plant.category}</span>
                </span>

                {onToggleInMyGarden && (
                  <button
                    type="button"
                    onClick={() => onToggleInMyGarden(plant.id)}
                    className={`inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 min-h-[44px] ${
                      isOwned
                        ? 'bg-emerald-500 hover:bg-rose-600 text-white border border-emerald-300/60'
                        : 'bg-white hover:bg-emerald-50 text-emerald-950 border border-white/80'
                    }`}
                    title={isOwned ? 'In My Garden (Click to remove)' : 'Click to Add to My Garden'}
                  >
                    {isOwned ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                        <span>In My Garden</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-emerald-800 stroke-[2.5]" />
                        <span>Add to My Garden</span>
                      </>
                    )}
                  </button>
                )}

                {isBloomingNow && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/90 text-white border border-rose-300/40 shadow-xs backdrop-blur-xs">
                    <Flower2 className="w-3 h-3 text-rose-200" />
                    <span>Blooming</span>
                  </span>
                )}

                {/* Contributor Attribution Badge */}
                {plant.addedByUserName ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 text-white border border-white/20 backdrop-blur-xs shadow-xs">
                    <UserIcon className="w-3 h-3 text-emerald-300" />
                    <span>Added by {plant.addedByUserName}</span>
                    {plant.createdAt && (
                      <span className="text-white/70 text-[10px]">
                        · {new Date(plant.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-200 border border-emerald-500/30 backdrop-blur-xs shadow-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Vriksha Vatika</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md truncate">
                {plant.name}
              </h1>

              <div className="flex items-center flex-wrap gap-1.5 text-xs text-emerald-100/90 font-medium drop-shadow-sm">
                {plant.botanicalName && (
                  <span className="italic font-serif truncate max-w-[200px]">{plant.botanicalName}</span>
                )}
                {plant.botanicalName && plant.hindiName && <span>·</span>}
                {plant.hindiName && (
                  <span className="text-amber-200">{plant.hindiName}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full p-4 sm:p-6 bg-gradient-to-br from-emerald-50/80 via-stone-50 to-amber-50/50 border-b border-stone-200/80 shrink-0">
            {/* Top Bar inside Botanical Hero */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs border ${accent.pillBadge}`}
                >
                  <Leaf className="w-3 h-3" />
                  <span>{plant.category}</span>
                </span>

                {onToggleInMyGarden && (
                  <button
                    type="button"
                    onClick={() => onToggleInMyGarden(plant.id)}
                    className={`inline-flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs active:scale-95 min-h-[44px] ${
                      isOwned
                        ? 'bg-emerald-100 hover:bg-rose-50 text-emerald-900 hover:text-rose-700 border border-emerald-300 hover:border-rose-300'
                        : 'bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-300 hover:border-emerald-400'
                    }`}
                    title={isOwned ? 'Currently In My Garden (Click to remove)' : 'Click to Add to My Garden'}
                  >
                    {isOwned ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
                        <span>In My Garden</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-stone-600 stroke-[2.5]" />
                        <span>Add to My Garden</span>
                      </>
                    )}
                  </button>
                )}

                {isBloomingNow && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
                    <Flower2 className="w-3 h-3 text-rose-600" />
                    <span>Blooming</span>
                  </span>
                )}

                {/* Contributor Attribution Badge */}
                {plant.addedByUserName ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                    <UserIcon className="w-3 h-3 text-emerald-700" />
                    <span>Added by {plant.addedByUserName}</span>
                    {plant.createdAt && (
                      <span className="text-stone-500 text-[10px]">
                        · {new Date(plant.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Vriksha Vatika</span>
                  </span>
                )}
              </div>

              {/* Action Buttons: 44px Touch Hitbox */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(plant.id, e)}
                  className="w-11 h-11 rounded-full bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 shadow-2xs transition-colors flex items-center justify-center active:scale-95"
                  title="Toggle Favorite"
                  aria-label="Toggle Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      plant.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'
                    }`}
                  />
                </button>
                {canEditOrDelete && (
                  <>
                    <button
                      type="button"
                      onClick={() => onEdit(plant)}
                      className="w-11 h-11 rounded-full bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 shadow-2xs transition-colors flex items-center justify-center active:scale-95"
                      title={isAdmin && isPrePopulated ? "Edit Plant (Admin)" : "Edit Plant"}
                      aria-label="Edit Plant"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-11 h-11 rounded-full bg-white hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-stone-200 shadow-2xs transition-colors flex items-center justify-center active:scale-95"
                      title={isAdmin && isPrePopulated ? "Delete Plant (Admin)" : "Delete Plant"}
                      aria-label="Delete Plant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-11 h-11 rounded-full bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 shadow-2xs transition-colors flex items-center justify-center active:scale-95 ml-0.5"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Botanical Graphic + Plant Titles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-3 min-w-0">
                <PlantImage
                  plant={plant}
                  aspectRatio="thumb"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-xs border border-stone-200 shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight truncate">
                    {plant.name}
                  </h1>
                  <div className="flex items-center flex-wrap gap-1 text-xs text-stone-600 font-medium">
                    {plant.botanicalName && (
                      <span className="italic font-serif truncate max-w-[180px]">{plant.botanicalName}</span>
                    )}
                    {plant.botanicalName && plant.hindiName && <span>·</span>}
                    {plant.hindiName && (
                      <span className="text-emerald-800 font-semibold">{plant.hindiName}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Scan My Plant & Upload Photo */}
              <div className="flex items-center gap-2 pt-1 sm:pt-0">
                {onOpenScanModal && (
                  <button
                    type="button"
                    onClick={() => onOpenScanModal(plant)}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-sm transition-all active:scale-95 border border-amber-400"
                    title="Diagnose plant health with AI camera scan"
                  >
                    <Sparkles className="w-4 h-4 text-stone-900" />
                    <span>Scan Plant</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 border border-emerald-600"
                >
                  <Camera className="w-4 h-4 text-emerald-200" />
                  <span>Upload Photo</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-900 text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Are you sure you want to delete <strong>{plant.name}</strong> from your tracker?</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="min-h-[44px] flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(plant.id);
                  onClose();
                }}
                className="min-h-[44px] flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-rose-700 rounded-xl hover:bg-rose-800"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Segmented Control Tabs */}
        <div className="px-3 sm:px-6 pt-2 border-b border-stone-200/70 bg-white flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('care')}
            className={`min-h-[44px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'care'
                ? 'border-emerald-700 text-emerald-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Care Guide (1–5 & 9)
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`min-h-[44px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-emerald-700 text-emerald-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            Seasonal Calendar (6–10)
          </button>
          <button
            onClick={() => setActiveTab('pests')}
            className={`min-h-[44px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'pests'
                ? 'border-emerald-700 text-emerald-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>Kitchen Remedies & Pests</span>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
              {plant.diseasesAndPests.length}
            </span>
          </button>
          <button
            onClick={() => {
              if (!isLoggedIn && onRequireAuth) {
                onRequireAuth(
                  () => setActiveTab('scans'),
                  `Sign in with Google to view health diagnosis records for ${plant.name}.`
                );
                return;
              }
              setActiveTab('scans');
            }}
            className={`min-h-[44px] px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'scans'
                ? 'border-emerald-700 text-emerald-950 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Health & Scans</span>
            <span className="text-[11px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
              {plant.scanHistory?.length || 0}
            </span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: Core Care Specs in High-Hierarchy Neat Grid */}
          {activeTab === 'care' && (
            <div className="space-y-5">
              {/* NEAT VISUAL GRID: Icon + Label Pairs with Elevated Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field 3: Water Requirement */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-100 shadow-xs flex items-start gap-3.5 hover:border-sky-300 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100 shadow-2xs">
                    <Droplets className="w-5 h-5 text-sky-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-900">
                        3. Water Requirement
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        {plant.waterRequirement.level}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-stone-900 mt-1">
                      {plant.waterRequirement.frequency}
                    </p>
                    {plant.waterRequirement.seasonalNote && (
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        {plant.waterRequirement.seasonalNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Field 4: Sunlight Requirement */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-100 shadow-xs flex items-start gap-3.5 hover:border-amber-300 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
                    <Sun className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        4. Sunlight Requirement
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {plant.sunlightRequirement.type}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-stone-900 mt-1">
                      {plant.sunlightRequirement.hoursNeeded}
                    </p>
                    {plant.sunlightRequirement.summerTerraceNote && (
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        {plant.sunlightRequirement.summerTerraceNote}
                      </p>
                    )}
                  </div>
                </div>

                {/* Field 5: Fertilizer Requirement */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-100 shadow-xs flex flex-col justify-between gap-3 hover:border-emerald-300 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                      <Sparkles className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          5. Fertilizer & Feed
                        </span>
                        {isOwned && fertilizerSchedule.isOverdue && (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                            Feed Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-stone-900 mt-1">
                        {plant.fertilizerRequirement.type}
                      </p>
                      <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                        Formula: {plant.fertilizerRequirement.npkOrOrganic}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Schedule: {plant.fertilizerRequirement.frequency}
                      </p>
                    </div>
                  </div>

                  {/* Fertilizer Schedule Tracker Box: Only active when plant is in user's garden */}
                  {isOwned ? (
                    <div className="mt-1 pt-2.5 border-t border-emerald-100/70 bg-emerald-50/50 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs">
                        <div className="text-stone-500 text-[11px]">
                          Last fed:{' '}
                          <strong className="text-stone-700">
                            {formatReadableDate(plant.lastFertilizedDate)}
                          </strong>
                        </div>
                        <div className="text-emerald-950 font-bold mt-0.5 flex items-center flex-wrap gap-1.5">
                          <span>Next due: {formatReadableDate(fertilizerSchedule.nextDueDate)}</span>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-md ${
                              fertilizerSchedule.isOverdue
                                ? 'bg-rose-200 text-rose-900'
                                : 'bg-emerald-200 text-emerald-900'
                            }`}
                          >
                            {fertilizerSchedule.statusLabel}
                          </span>
                        </div>
                      </div>

                      {onMarkFertilized && (
                        <button
                          type="button"
                          onClick={handleQuickMarkFertilized}
                          className={`w-full sm:w-auto min-h-[44px] justify-center shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 ${
                            justMarkedFertilized
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-800 hover:bg-emerald-900 text-white'
                          }`}
                        >
                          {justMarkedFertilized ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                              <span>Marked!</span>
                            </>
                          ) : (
                            <>
                              <RotateCw className="w-4 h-4 text-emerald-200" />
                              <span>Fed Today</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 pt-2.5 border-t border-emerald-100/70 bg-stone-50/80 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                      <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">
                        Add {plant.name} to <strong>My Garden</strong> to track customized feeding dates and overdue notifications.
                      </p>
                      {onToggleInMyGarden && (
                        <button
                          type="button"
                          onClick={() => onToggleInMyGarden(plant.id)}
                          className="min-h-[40px] px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shrink-0 active:scale-95 transition-all shadow-2xs flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Add to My Garden</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Field 9: Pot Size Required */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-orange-100 shadow-xs flex items-start gap-3.5 hover:border-orange-300 transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-800 flex items-center justify-center shrink-0 border border-orange-100 shadow-2xs">
                    <Box className="w-5 h-5 text-orange-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-950">
                      9. Pot Size & Container
                    </span>
                    <p className="text-sm font-bold text-stone-900 mt-1">
                      {plant.potSizeRequired.sizeInches} ({plant.potSizeRequired.volumeLiters})
                    </p>
                    {plant.potSizeRequired.materialAdvice && (
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        Advice: {plant.potSizeRequired.materialAdvice}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terrace Notes Card */}
              {plant.notes && (
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 flex items-start gap-3 shadow-2xs">
                  <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 leading-relaxed">
                    <span className="font-bold">Indian Terrace Tip: </span>
                    {plant.notes}
                  </div>
                </div>
              )}

              {/* Quick links to calendar & remedies */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
                <span>Category: <strong className="text-stone-800">{plant.category}</strong></span>
                <button
                  onClick={() => setActiveTab('pests')}
                  className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  View Indian kitchen pest remedies ({plant.diseasesAndPests.length}) →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Seasonal Calendar (Fields 6-10) */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              {/* Field 6: Sowing Time */}
              <div className="border border-stone-200/80 rounded-2xl p-4 bg-white shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>6. Sowing Time & Propagation</span>
                  </div>
                  {plant.sowingTime.months.includes(currentMonthIndex) && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Sow Now!
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-800 mt-1 font-semibold">
                  {plant.sowingTime.seasonText}
                </p>
                {plant.sowingTime.method && (
                  <p className="text-xs text-stone-500 mt-0.5">
                    Method: {plant.sowingTime.method}
                  </p>
                )}
                {renderMonthIndicators(plant.sowingTime.months, 'Sowing')}
              </div>

              {/* Field 7: Pruning & Cutting Time */}
              <div className="border border-stone-200/80 rounded-2xl p-4 bg-white shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Scissors className="w-4 h-4 text-emerald-700" />
                    <span>7. Pruning & Cutting Time</span>
                  </div>
                  {plant.pruningTime.months.includes(currentMonthIndex) && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Prune Now!
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-800 mt-1 font-semibold">
                  {plant.pruningTime.seasonText}
                </p>
                <p className="text-xs text-stone-600 mt-0.5">
                  Frequency: {plant.pruningTime.frequency}
                </p>
                <p className="text-xs text-stone-500 mt-1 italic">
                  Technique: {plant.pruningTime.tips}
                </p>
                {renderMonthIndicators(plant.pruningTime.months, 'Pruning')}
              </div>

              {/* Field 8: Repotting Time & Signs */}
              <div className="border border-stone-200/80 rounded-2xl p-4 bg-white shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Box className="w-4 h-4 text-emerald-700" />
                    <span>8. Repotting Season & Root Signs</span>
                  </div>
                  {plant.repottingTime.months.includes(currentMonthIndex) && (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Repot Now!
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-800 mt-1 font-semibold">
                  {plant.repottingTime.seasonText} ({plant.repottingTime.frequency})
                </p>
                <div className="mt-2 text-xs text-stone-600">
                  <span className="font-bold text-stone-800">Signs it needs repotting:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-600">
                    {plant.repottingTime.signs.map((sign, idx) => (
                      <li key={idx}>{sign}</li>
                    ))}
                  </ul>
                </div>
                {renderMonthIndicators(plant.repottingTime.months, 'Repotting')}
              </div>

              {/* Field 10: Flowering Season */}
              <div className="border border-stone-200/80 rounded-2xl p-4 bg-white shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                    <Flower2 className="w-4 h-4 text-amber-600" />
                    <span>10. Flowering Season</span>
                  </div>
                  {isBloomingNow && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Blooming Now!
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-800 mt-1 font-semibold">
                  {plant.floweringSeason.seasonText}
                </p>
                {plant.floweringSeason.isFlowering &&
                  renderMonthIndicators(plant.floweringSeason.months, 'Flowering')}
              </div>
            </div>
          )}

          {/* TAB 3: Common Diseases & Home Remedies (Fields 11-12) */}
          {activeTab === 'pests' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-stone-900">
                    11 & 12. Indian Kitchen Remedies & Disease Care
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Natural organic recipes tested on Indian terraces alongside conventional alternatives.
                  </p>
                </div>
                {onDiagnosePlant && (
                  <button
                    onClick={() => {
                      onClose();
                      onDiagnosePlant(plant.id);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-xl border border-emerald-300 transition-colors shrink-0 shadow-xs"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Open in Clinic</span>
                  </button>
                )}
              </div>

              {plant.diseasesAndPests.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
                  No diseases recorded for this plant yet. You can add them via "Edit Plant".
                </div>
              ) : (
                <div className="space-y-4">
                  {plant.diseasesAndPests.map((item) => (
                    <div
                      key={item.id}
                      className="border border-stone-200/90 rounded-2xl p-4 sm:p-5 bg-white space-y-3.5 shadow-xs"
                    >
                      {/* Pest / Disease Name & Symptoms */}
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-stone-900">
                            {item.name}
                          </h5>
                          <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full capitalize">
                            Symptom: {item.symptomType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-1">
                          <strong className="text-stone-800">Signs & Symptoms: </strong>
                          {item.symptoms}
                        </p>
                      </div>

                      {/* Home Remedy Box */}
                      <div className="bg-emerald-50/90 rounded-2xl p-4 border border-emerald-200/90 text-xs shadow-2xs">
                        <div className="flex items-center gap-1.5 text-emerald-950 font-bold mb-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Indian Kitchen Remedy: {item.homeRemedy.name}</span>
                        </div>
                        <div className="space-y-1.5 text-emerald-950">
                          <p>
                            <span className="font-bold text-emerald-950">Ingredients: </span>
                            {item.homeRemedy.ingredients}
                          </p>
                          <p>
                            <span className="font-bold text-emerald-950">Preparation & Use: </span>
                            {item.homeRemedy.preparationAndUse}
                          </p>
                          <p className="text-[11px] text-emerald-800 font-bold">
                            Spray Frequency: {item.homeRemedy.frequency}
                          </p>
                        </div>
                      </div>

                      {/* Conventional Alternative */}
                      <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                        <span className="font-bold text-stone-800">
                          Conventional Alternative:
                        </span>{' '}
                        {item.conventionalTreatment}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Plant Health AI Scans & History Log */}
          {activeTab === 'scans' && (
            <div className="space-y-5">
              {!isLoggedIn ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200 shadow-2xs">
                    <Sparkles className="w-7 h-7 text-amber-700" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-stone-900">
                      Sign In to View Health Scans
                    </h4>
                    <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                      AI health diagnosis logs and image records are private to your Google account.
                    </p>
                  </div>
                  {onRequireAuth && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() =>
                          onRequireAuth(
                            () => setActiveTab('scans'),
                            `Sign in with Google to view health diagnosis records for ${plant.name}.`
                          )
                        }
                        className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-emerald-200" />
                        <span>Sign in with Google</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : !isOwned ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
                    <Leaf className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-stone-900">
                      {plant.name} is in Reference Guide Mode
                    </h4>
                    <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                      AI Health Scan logs and visual photo timelines are tracked specifically for plants marked as &quot;In My Garden&quot; so your active garden records stay organized.
                    </p>
                  </div>
                  {onToggleInMyGarden && (
                    <div className="pt-2">
                      <button
                        onClick={() => onToggleInMyGarden(plant.id)}
                        className="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Add to My Garden & Enable Scans</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Scan Banner with Quick Action */}
                  <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border border-emerald-700/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>AI Visual Health History</span>
                      </div>
                      <h4 className="text-base font-bold text-white">
                        Track {plant.name} Vitality Over Time
                      </h4>
                      <p className="text-xs text-emerald-100/90 max-w-md leading-relaxed">
                        Capture periodic photos to visually monitor recovery after organic sprays, repotting, or seasonal weather shifts.
                      </p>
                    </div>

                    {onOpenScanModal && (
                      <button
                        onClick={() => onOpenScanModal(plant)}
                        className="shrink-0 min-h-[46px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
                      >
                        <Camera className="w-4 h-4 text-stone-900" />
                        <span>New Health Scan</span>
                      </button>
                    )}
                  </div>

              {/* Scans List / Empty State */}
              {(!plant.scanHistory || plant.scanHistory.length === 0) ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-10 text-center space-y-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200/60">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">
                    No visual scans logged for {plant.name} yet
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                    Take a photo of your terrace plant to diagnose leaf yellowing, check for aphids or mealybugs, and test organic Indian kitchen remedies.
                  </p>
                  {onOpenScanModal && (
                    <div className="pt-2">
                      <button
                        onClick={() => onOpenScanModal(plant)}
                        className="min-h-[46px] inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Run First AI Health Scan</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {plant.scanHistory.map((scan) => {
                    const scanDateFormatted = new Date(scan.scanDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={scan.id}
                        className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 space-y-3.5 shadow-xs"
                      >
                        {/* Top: Date + Status Badge + Delete */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span className="text-xs font-bold text-stone-700">
                              {scanDateFormatted}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {scan.healthStatus === 'Healthy' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Healthy</span>
                              </span>
                            )}
                            {scan.healthStatus === 'Needs Attention' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                                <span>Needs Attention</span>
                              </span>
                            )}
                            {scan.healthStatus === 'Sick' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                                <span>Sick</span>
                              </span>
                            )}

                            {onDeleteScanRecord && (
                              <button
                                onClick={() => onDeleteScanRecord(plant.id, scan.id)}
                                className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 transition-colors"
                                title="Delete this scan log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Image + Summary */}
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                          <div className="shrink-0 w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                            <img
                              src={scan.photoDataUrl}
                              alt="Scan capture"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1 space-y-2 text-xs">
                            <p className="font-semibold text-stone-900 leading-relaxed">
                              {scan.summary}
                            </p>

                            {/* Nutrients & Pests Mini Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-stone-800">
                                <span className="font-bold text-amber-950 block text-[11px]">
                                  Nutrient Audit:
                                </span>
                                <span className="text-[11px] text-stone-600">
                                  {scan.nutrientDeficiencies?.detected
                                    ? scan.nutrientDeficiencies.deficiency
                                    : 'Balanced leaf chlorophyll'}
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/60 text-stone-800">
                                <span className="font-bold text-sky-950 block text-[11px]">
                                  Pest / Disease:
                                </span>
                                <span className="text-[11px] text-stone-600">
                                  {scan.pestOrDisease?.detected
                                    ? scan.pestOrDisease.matchedDiseaseName || scan.pestOrDisease.symptomsObserved
                                    : 'No visible pests/fungus'}
                                </span>
                              </div>
                            </div>

                            {/* Kitchen Remedy */}
                            {scan.recommendedRemedies && (
                              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-stone-800 text-[11px] space-y-0.5">
                                <span className="font-bold text-emerald-950">
                                  Kitchen Remedy: {scan.recommendedRemedies.homeRemedyName}
                                </span>
                                <p className="text-stone-600">
                                  {scan.recommendedRemedies.homeRemedyInstructions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-200/70 bg-white flex items-center justify-between text-xs text-stone-500">
          <span className="truncate pr-2">Terrace Garden Tracker</span>
          <button
            onClick={onClose}
            className="min-h-[44px] px-6 py-2.5 text-stone-800 font-bold bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors active:scale-95 text-xs sm:text-sm shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
