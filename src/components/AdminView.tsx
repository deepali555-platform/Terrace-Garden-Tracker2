import React, { useState, useEffect, useRef } from 'react';
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
  Download,
  Upload,
  RotateCcw,
  Database,
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isPerformingMaintenance, setIsPerformingMaintenance] = useState(false);

  const isAdmin = Boolean(user?.email && isUserAdmin(user.email));

  // Admin Database Backup (JSON)
  const handleAdminBackup = async () => {
    if (!user || !isAdmin) {
      onShowToast('Unauthorized: Admin access required.');
      return;
    }
    setIsPerformingMaintenance(true);
    try {
      const jsonStr = await firestoreStorageService.adminExportDatabase(user);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `terrace-garden-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      onShowToast('Admin backup (JSON) downloaded successfully.');
    } catch (err: any) {
      console.error('Backup failed:', err);
      onShowToast(err?.message || 'Failed to generate backup.');
    } finally {
      setIsPerformingMaintenance(false);
    }
  };

  // Admin Database Restore
  const handleAdminRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user || !isAdmin) {
      onShowToast('Unauthorized: Admin access required.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setIsPerformingMaintenance(true);
      try {
        const res = await firestoreStorageService.adminRestoreDatabase(user, content);
        if (res.success) {
          onShowToast(`Successfully restored ${res.count || 0} plants to shared catalog!`);
          if (onSharedCatalogUpdated) {
            onSharedCatalogUpdated();
          }
          loadSubmissions();
        } else {
          alert(res.error || 'Failed to restore backup file.');
        }
      } catch (err: any) {
        console.error('Restore error:', err);
        alert(err?.message || 'Failed to restore backup file.');
      } finally {
        setIsPerformingMaintenance(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Admin Reset Database
  const handleAdminReset = async () => {
    if (!user || !isAdmin) {
      onShowToast('Unauthorized: Admin access required.');
      return;
    }
    setIsPerformingMaintenance(true);
    try {
      await firestoreStorageService.adminResetDatabase(user);
      setShowResetConfirm(false);
      onShowToast('Database reset to clean 21 default Indian terrace species.');
      if (onSharedCatalogUpdated) {
        onSharedCatalogUpdated();
      }
      loadSubmissions();
    } catch (err: any) {
      console.error('Reset error:', err);
      onShowToast(err?.message || 'Failed to reset database.');
    } finally {
      setIsPerformingMaintenance(false);
    }
  };

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

      {/* ============================================================ */}
      {/* SENSITIVE DATABASE MAINTENANCE & BACKUPS (ADMIN-ONLY)       */}
      {/* ============================================================ */}
      {/* SECTION 4: DATABASE MAINTENANCE & ADMIN BACKUPS (OWNER ONLY) */}
      {/* ============================================================ */}
      {isAdmin && (
        <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200 shadow-2xs">
                <Database className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Database Maintenance & System Backups
                </h3>
                <p className="text-xs text-stone-500">
                  Restricted to verified app owner ({user?.email || ADMIN_EMAILS[0]}). Invisible to regular users.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-bold text-amber-900 bg-amber-100/70 border border-amber-300/80 px-2.5 py-1 rounded-full">
              Admin Operations Only
            </span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Manage full catalog backups, restore snapshots, or reset community additions back to the initial 21 authentic Indian terrace plants. All actions are authenticated and recorded in the audit log.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* 1. Backup (JSON) Button */}
            <button
              type="button"
              onClick={handleAdminBackup}
              disabled={isPerformingMaintenance}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download full database backup as JSON"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Backup (JSON)</span>
            </button>

            {/* 2. Restore Button */}
            <label className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer">
              <Upload className="w-4 h-4 text-stone-600" />
              <span>Restore</span>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                disabled={isPerformingMaintenance}
                onChange={handleAdminRestore}
                className="hidden"
              />
            </label>

            {/* 3. Reset Database Button */}
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={isPerformingMaintenance}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Reset database to default 21 Indian terrace plants"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Database</span>
            </button>
          </div>

          {/* Reset Confirmation Dialog */}
          {showResetConfirm && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-950">
                    Confirm Database Reset
                  </h4>
                  <p className="text-xs text-rose-900/90 leading-relaxed">
                    Are you sure you want to reset the database? This will clear all community additions from the shared catalog and restore the default 21 authentic Indian terrace plants.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminReset}
                  disabled={isPerformingMaintenance}
                  className="min-h-[38px] px-4 py-1.5 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isPerformingMaintenance ? 'Resetting...' : 'Yes, Reset Database'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
