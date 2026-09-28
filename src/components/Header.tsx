import React, { useState, useRef, useEffect } from 'react';
import { Plus, Leaf, Calendar, Stethoscope, RefreshCw, Sprout, Sparkles, Camera, LogOut, User as UserIcon, ShieldCheck, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isUserAdmin } from '../config/adminConfig';

interface HeaderProps {
  currentTab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer' | 'admin';
  onSelectTab: (tab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer' | 'admin') => void;
  onOpenAddModal: () => void;
  onOpenScanModal?: () => void;
  onOpenLoginModal?: () => void;
  overdueFertilizerCount?: number;
  gardenPlantCount?: number;
  totalPlantCount?: number;
  isLoadingPlants?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenScanModal,
  onOpenLoginModal,
  overdueFertilizerCount = 0,
  gardenPlantCount = 0,
  totalPlantCount = 0,
  isLoadingPlants = false,
}) => {
  const { user, signOut, isGuest } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = Boolean(user?.email && isUserAdmin(user.email));

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false);
    onSelectTab('home');
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0d2f1c] text-white border-b border-emerald-900/70 px-3 sm:px-8 py-3 shadow-md relative transition-colors w-full max-w-full box-border">
      {/* Subtle Botanical SVG Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.04] pointer-events-none bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="w-full max-w-6xl mx-auto flex items-center justify-between relative z-10 gap-2 sm:gap-3 min-w-0">
        {/* Zone 1: Brand title with leaf icon */}
        <div className="flex items-center gap-2 min-w-0 shrink">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1.5 sm:gap-2 text-left group focus:outline-none min-h-[44px] -ml-1 pl-1 min-w-0"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-600/90 text-white flex items-center justify-center font-bold shadow-xs border border-emerald-400/30 group-hover:scale-105 transition-transform shrink-0">
              <Leaf className="w-5 h-5 text-emerald-100 stroke-[2.2]" />
            </div>
            <div className="min-w-0 truncate">
              <span className="text-sm sm:text-lg font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors truncate block">
                Terrace Garden
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-emerald-300/80 -mt-0.5 truncate">
                Indian Balcony & Terrace
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation links on desktop (>= 768px) */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
          {/* Tab 1: My Garden (Owned Plants Only) */}
          <button
            onClick={() => onSelectTab('my-garden')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              currentTab === 'my-garden'
                ? 'bg-emerald-600 text-white shadow-xs border border-emerald-400 font-bold'
                : 'text-emerald-100/90 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Leaf className="w-4 h-4 text-emerald-300" />
            <span>My Garden</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                currentTab === 'my-garden'
                  ? 'bg-emerald-900 text-emerald-200'
                  : 'bg-emerald-800 text-emerald-300'
              }`}
            >
              {gardenPlantCount}
            </span>
          </button>

          {/* Tab 2: All Plants Guide (Full Reference Library) */}
          <button
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              currentTab === 'home'
                ? 'bg-emerald-800/90 text-white shadow-xs border border-emerald-600/60 font-bold'
                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Reference Guide</span>
            {isLoadingPlants ? (
              <span className="text-[10px] opacity-75 font-normal">
                (...)
              </span>
            ) : totalPlantCount > 0 ? (
              <span className="text-[10px] opacity-75 font-normal">
                ({totalPlantCount})
              </span>
            ) : null}
          </button>

          {/* Tab 3: Fertilizer Schedule (Only owned plants) */}
          <button
            onClick={() => onSelectTab('fertilizer')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all relative ${
              currentTab === 'fertilizer'
                ? 'bg-emerald-700 text-white shadow-xs border border-emerald-500 font-bold'
                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Fertilizer Schedule</span>
            {overdueFertilizerCount > 0 && (
              <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-2xs">
                {overdueFertilizerCount}
              </span>
            )}
          </button>

          {/* Tab 4: Seasonal Calendar (Only owned plants) */}
          <button
            onClick={() => onSelectTab('reminders')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              currentTab === 'reminders'
                ? 'bg-amber-600/90 text-white shadow-xs border border-amber-400/60 font-bold'
                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Seasonal Calendar</span>
          </button>

          {/* Tab 5: Disease Clinic */}
          <button
            onClick={() => onSelectTab('diagnosis')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              currentTab === 'diagnosis'
                ? 'bg-teal-700/90 text-white shadow-xs border border-teal-400/60 font-bold'
                : 'text-emerald-100/80 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-teal-300" />
            <span>Disease Clinic</span>
          </button>

          {/* Tab 6: Admin Portal (Accessible exclusively to app owner) */}
          {isAdmin && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-amber-400 text-stone-950 shadow-xs border border-amber-300 font-bold'
                  : 'text-amber-200 hover:text-white hover:bg-emerald-900/50'
              }`}
              title="Admin Portal: Review & moderate user-submitted plants"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action buttons & Log in / Account - Hidden on mobile (< 768px), visible on desktop */}
        <div className="hidden md:flex items-center gap-2 shrink-0 min-w-0">
          {onOpenScanModal && (
            <button
              type="button"
              onClick={onOpenScanModal}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] rounded-xl shadow-md border border-amber-300 transition-all whitespace-nowrap min-h-[44px]"
              title="Scan plant with AI health camera"
            >
              <Camera className="w-4 h-4 text-stone-900 stroke-[2.4] shrink-0" />
              <span>Scan</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] rounded-xl shadow-md border border-emerald-400/40 transition-all whitespace-nowrap min-h-[44px]"
            title="Add Plant to Garden Tracker"
          >
            <Plus className="w-4 h-4 stroke-[2.75] shrink-0" />
            <span>Add Plant</span>
          </button>

          {/* User Profile / Authentication Menu in Top-Right Corner */}
          <div className="relative shrink-0" ref={profileMenuRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center justify-center gap-1.5 p-1 rounded-xl border transition-all min-h-[44px] min-w-[44px] cursor-pointer active:scale-95 ${
                  isProfileMenuOpen
                    ? 'bg-emerald-800 border-white ring-2 ring-emerald-400/60 shadow-md'
                    : 'bg-emerald-900/80 hover:bg-emerald-800 border-emerald-400/60 hover:border-white shadow-xs'
                }`}
                title={`Logged in as ${user.displayName || user.email || 'Gardener'} (Click to view account and Log Out)`}
                aria-label="User account menu"
                aria-expanded={isProfileMenuOpen}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profile'}
                    className="w-8 h-8 rounded-lg object-cover border border-white/70 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-xs shrink-0 border border-white/50">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline-block text-[10px] text-emerald-200 pr-0.5">▼</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-500/70 rounded-xl transition-all active:scale-95 shadow-sm cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
                title="Log in with Google"
                aria-label="Log in to account"
              >
                <LogIn className="w-4 h-4 text-emerald-200 shrink-0" />
                <span className="font-bold">Log in</span>
              </button>
            )}

            {/* Profile Dropdown Menu - Highest Z-Index, Positioned on Top of All Elements */}
            {isProfileMenuOpen && user && (
              <>
                {/* Mobile screen click-outside backdrop */}
                <div
                  className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] sm:hidden"
                  onClick={() => setIsProfileMenuOpen(false)}
                  aria-hidden="true"
                />

                <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white text-stone-900 rounded-2xl shadow-2xl border border-stone-200/90 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                  {/* User Info Header */}
                  <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Profile'}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-emerald-800 text-white font-black flex items-center justify-center text-sm shadow-2xs shrink-0">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {user.displayName || 'Terrace Gardener'}
                      </p>
                      <p className="text-[11px] text-stone-600 truncate mt-0.5 font-mono">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-800 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Private Garden Synced</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Garden Summary */}
                  <div className="p-2.5 bg-stone-50 rounded-xl text-xs text-stone-700 space-y-1 border border-stone-200/60">
                    <div className="flex justify-between">
                      <span className="text-stone-600">Plants in Garden:</span>
                      <strong className="text-stone-900 font-bold">{gardenPlantCount}</strong>
                    </div>
                    {overdueFertilizerCount > 0 && (
                      <div className="flex justify-between text-amber-800 font-bold">
                        <span>Feed Overdue:</span>
                        <span>{overdueFertilizerCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Admin Portal Shortcut (Owner only) */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSelectTab('admin');
                      }}
                      className="w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      <span>Admin Moderation Portal</span>
                    </button>
                  )}

                  {/* High-Contrast, Thumb-Friendly Log Out Button */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    aria-label="Log out of account"
                  >
                    <LogOut className="w-4 h-4 text-white" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
