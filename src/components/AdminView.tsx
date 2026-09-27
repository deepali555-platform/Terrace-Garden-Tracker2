import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Globe,
  XCircle,
  Clock,
  User,
  CheckCircle2,
  RefreshCw,
  Eye,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Sprout,
  Sun,
  Droplets,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isUserAdmin, ADMIN_EMAILS } from '../config/adminConfig';
import { UserSubmittedPlantRecord, SubmissionStatus } from '../types/admin';
import { Plant } from '../types/plant';
import { firestoreStorageService } from '../services/firestoreStorageService';
import { PlantAvatar } from './PlantAvatar';

interface AdminViewProps {
  onBackToHome: () => void;
  onSelectPlantToInspect: (plant: Plant) => void;
  onShowToast: (msg: string) => void;
  onSharedCatalogUpdated?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onBackToHome,
  onSelectPlantToInspect,
  onShowToast,
  onSharedCatalogUpdated,
}) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<UserSubmittedPlantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isAdmin = Boolean(user?.email && isUserAdmin(user.email));

  const loadSubmissions = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const records = await firestoreStorageService.getSubmittedPlantsForAdmin();
      setSubmissions(records);
    } catch (err) {
      console.error('Failed to load admin submissions:', err);
      onShowToast('Could not load user submissions.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadSubmissions();
    }
  }, [isAdmin]);

  // Access Denied guard
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Access Restricted
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
            This administration portal is only accessible to the verified app owner account ({ADMIN_EMAILS[0]}).
          </p>
          {user?.email && (
            <p className="text-xs text-stone-500 font-mono">
              Signed in as: {user.email}
            </p>
          )}
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-2xl shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Plant Reference Guide</span>
          </button>
        </div>
      </div>
    );
  }

  // Handle Approve into Shared Catalog
  const handleApprove = async (sub: UserSubmittedPlantRecord) => {
    if (!user?.email) return;
    setProcessingId(sub.id);
    try {
      await firestoreStorageService.approvePlantToSharedCatalog(sub, user.email);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? {
                ...s,
                status: 'approved',
                reviewedAt: new Date().toISOString(),
                reviewedBy: user.email || undefined,
              }
            : s
        )
      );
      onShowToast(`Approved "${sub.plantName}" into the global shared catalog!`);
      if (onSharedCatalogUpdated) {
        onSharedCatalogUpdated();
      }
    } catch (err) {
      console.error('Failed to approve plant:', err);
      onShowToast('Failed to approve plant to shared catalog.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Dismiss (Private to User Only)
  const handleDismiss = async (sub: UserSubmittedPlantRecord) => {
    if (!user?.email) return;
    setProcessingId(sub.id);
    try {
      await firestoreStorageService.dismissSubmittedPlant(sub.id, user.email);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? {
                ...s,
                status: 'dismissed',
                reviewedAt: new Date().toISOString(),
                reviewedBy: user.email || undefined,
              }
            : s
        )
      );
      onShowToast(`Dismissed "${sub.plantName}". Kept as private plant for user.`);
    } catch (err) {
      console.error('Failed to dismiss plant:', err);
      onShowToast('Failed to dismiss plant.');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Remove from Shared Catalog
  const handleRemoveFromShared = async (sub: UserSubmittedPlantRecord) => {
    setProcessingId(sub.id);
    try {
      await firestoreStorageService.removeFromSharedCatalog(sub.originalPlantId, sub.id);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? {
                ...s,
                status: 'dismissed',
                reviewedAt: new Date().toISOString(),
              }
            : s
        )
      );
      onShowToast(`Removed "${sub.plantName}" from the shared catalog.`);
      if (onSharedCatalogUpdated) {
        onSharedCatalogUpdated();
      }
    } catch (err) {
      console.error('Failed to remove from shared catalog:', err);
      onShowToast('Failed to remove plant from shared catalog.');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (statusFilter === 'all') return true;
    return sub.status === statusFilter;
  });

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;
  const dismissedCount = submissions.filter((s) => s.status === 'dismissed').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Admin Hero Header */}
      <div className="bg-gradient-to-br from-[#0b2917] via-[#123e23] to-[#1c5531] text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 relative overflow-hidden shadow-md border border-emerald-700/50">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Owner & Admin Control Portal</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadSubmissions}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Refresh submissions list"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Plants</span>
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              User-Added Plants Moderation
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Review plants created by users across all accounts. Approve quality entries into the global shared catalog for all visitors (including guests) or keep them private to the original user.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="pt-1 flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1 rounded-xl bg-emerald-950/70 border border-emerald-600/40 text-emerald-200">
              Total Submissions: <strong className="text-white ml-1">{submissions.length}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200">
              Pending Review: <strong className="text-amber-100 ml-1">{pendingCount}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-200">
              In Shared Catalog: <strong className="text-teal-100 ml-1">{approvedCount}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl bg-stone-500/20 border border-stone-400/40 text-stone-200">
              Private Only: <strong className="text-stone-100 ml-1">{dismissedCount}</strong>
            </span>
          </div>
        </div>

        {/* Decorative subtle background illustration */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-emerald-100">
          <ShieldCheck className="w-64 h-64" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          All ({submissions.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review ({pendingCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('approved')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'approved'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Shared Catalog ({approvedCount})</span>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('dismissed')}
          className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
            statusFilter === 'dismissed'
              ? 'bg-stone-700 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Private Only ({dismissedCount})</span>
        </button>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-10 h-10 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-semibold">
            Loading user-submitted plants from Firestore...
          </p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Sprout className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-800">
            No submissions found
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
            {statusFilter === 'all'
              ? 'No users have added custom plants yet. When users submit plants through the "+ Add Plant" form, they will appear here for your review.'
              : `There are currently no plants with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub) => {
            const isProcessing = processingId === sub.id;
            const formattedDate = sub.submittedAt
              ? new Date(sub.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Unknown date';

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Plant Details & Submitter Information */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200/80 shadow-2xs">
                    {sub.plantData?.customPhotoUrl || sub.plantData?.imageUrl ? (
                      <img
                        src={sub.plantData.customPhotoUrl || sub.plantData.imageUrl}
                        alt={sub.plantName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <PlantAvatar
                        category={sub.plantData?.category || 'Flowering'}
                        name={sub.plantName}
                        size="md"
                      />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-stone-900 tracking-tight">
                        {sub.plantName}
                      </h3>
                      {sub.botanicalName && (
                        <span className="text-xs italic text-stone-600">
                          ({sub.botanicalName})
                        </span>
                      )}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                        {sub.category}
                      </span>
                    </div>

                    {/* Submitter & Timestamp Badge */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-stone-600">
                      <span className="inline-flex items-center gap-1 text-emerald-900 font-semibold">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{sub.userDisplayName || 'User'}</span>
                      </span>
                      {sub.userEmail && (
                        <span className="text-[11px] text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200 font-mono">
                          {sub.userEmail}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-stone-600">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span>Added on {formattedDate}</span>
                      </span>
                    </div>

                    {/* Quick Care Snapshot */}
                    {sub.plantData && (
                      <div className="flex items-center gap-3 pt-0.5 text-[11px] text-stone-600 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-cyan-600" />
                          <span>Water: {sub.plantData.waterRequirement?.level || 'Moderate'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-500" />
                          <span>Sun: {sub.plantData.sunlightRequirement?.type || 'Full Sun'}</span>
                        </span>
                        {sub.plantData.potSizeRequired?.sizeInches && (
                          <span className="inline-flex items-center gap-1">
                            <Sprout className="w-3 h-3 text-emerald-600" />
                            <span>Pot: {sub.plantData.potSizeRequired.sizeInches}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status Pill & Action Buttons */}
                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {/* Status Indicator */}
                  {sub.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Review</span>
                    </span>
                  )}
                  {sub.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>In Shared Catalog</span>
                    </span>
                  )}
                  {sub.status === 'dismissed' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
                      <XCircle className="w-3 h-3 text-stone-500" />
                      <span>Private Only</span>
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Full Spec Modal */}
                    <button
                      type="button"
                      onClick={() => onSelectPlantToInspect(sub.plantData)}
                      className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 hover:border-emerald-600 bg-white hover:bg-stone-50 text-xs font-bold text-stone-800 transition-all active:scale-95 cursor-pointer shadow-2xs"
                      title="Inspect complete care guide, soil mix, fertilizer & remedies"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Inspect</span>
                    </button>

                    {/* If pending: give Add to Shared and Dismiss options */}
                    {sub.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(sub)}
                          disabled={isProcessing}
                          className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          <Globe className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Add to shared catalog</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDismiss(sub)}
                          disabled={isProcessing}
                          className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-stone-500" />
                          <span>Dismiss</span>
                        </button>
                      </>
                    )}

                    {/* If already approved: allow removing if needed */}
                    {sub.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFromShared(sub)}
                        disabled={isProcessing}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-bold text-rose-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        title="Remove from shared catalog (leaves user's private plant intact)"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Remove from shared</span>
                      </button>
                    )}

                    {/* If dismissed: allow re-approving */}
                    {sub.status === 'dismissed' && (
                      <button
                        type="button"
                        onClick={() => handleApprove(sub)}
                        disabled={isProcessing}
                        className="min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Add to shared catalog</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
