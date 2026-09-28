import React, { useState, useEffect, useRef } from 'react';
import { Sprout, Calendar, Leaf, User as UserIcon, LogOut, ShieldCheck, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BottomNavProps {
  currentTab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer' | 'admin';
  onSelectTab: (tab: 'home' | 'my-garden' | 'reminders' | 'diagnosis' | 'fertilizer' | 'admin') => void;
  onOpenLoginModal?: () => void;
  overdueFertilizerCount?: number;
  gardenPlantCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenLoginModal,
  overdueFertilizerCount = 0,
  gardenPlantCount = 0,
}) => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close slide-up panel on Escape key
  useEffect(() => {
    if (!isAccountPanelOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAccountPanelOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAccountPanelOpen]);

  // Handle Account Tab Click
  const handleAccountTabClick = async () => {
    if (user) {
      setIsAccountPanelOpen((prev) => !prev);
    } else {
      try {
        await signInWithGoogle();
      } catch {
        onOpenLoginModal?.();
      }
    }
  };

  const handleLogout = async () => {
    setIsAccountPanelOpen(false);
    await signOut();
  };

  return (
    <>
      {/* Slide-Up Account Panel (For Logged In Users) */}
      {isAccountPanelOpen && user && (
        <>
          {/* Backdrop (Tapping outside closes the panel) */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-200 md:hidden"
            onClick={() => setIsAccountPanelOpen(false)}
            aria-label="Close account panel"
          />

          {/* Slide-Up Bottom Sheet */}
          <div
            ref={panelRef}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white text-stone-900 rounded-t-3xl shadow-2xl border-t border-stone-200/90 p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200 space-y-4 max-w-lg mx-auto md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Account details"
          >
            {/* Grab handle indicator */}
            <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto -mt-1.5 mb-1" />

            {/* Header row */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Your Account
              </span>
              <button
                type="button"
                onClick={() => setIsAccountPanelOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Info Card */}
            <div className="flex items-center gap-3.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-300 shadow-2xs shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white font-black flex items-center justify-center text-base shadow-2xs shrink-0">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-stone-900 truncate">
                  {user.displayName || 'Terrace Gardener'}
                </p>
                <p className="text-xs text-stone-600 truncate mt-0.5 font-mono">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-800 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Private Garden Synced</span>
                </div>
              </div>
            </div>

            {/* Quick summary tiles */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-emerald-50/80 border border-emerald-200/70 rounded-xl text-emerald-950">
                <span className="text-[11px] text-emerald-800 block font-medium">My Garden Plants</span>
                <span className="text-lg font-extrabold text-emerald-950">{gardenPlantCount}</span>
              </div>
              <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-amber-950">
                <span className="text-[11px] text-amber-800 block font-medium">Fertilizer Alerts</span>
                <span className="text-lg font-extrabold text-amber-950">{overdueFertilizerCount}</span>
              </div>
            </div>

            {/* High-visibility Log out button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full min-h-[48px] px-4 py-3 rounded-2xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span>Log Out</span>
            </button>
          </div>
        </>
      )}

      {/* 4-Tab Fixed Bottom Bar on Mobile Screens (under 768px wide) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0d2f1c] text-white border-t border-emerald-900/80 px-2 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] safe-area-pb shadow-2xl select-none"
      >
        <div className="grid grid-cols-4 items-center h-14 max-w-md mx-auto">
          {/* Tab 1: Home (Reference Guide) */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center min-h-[44px] h-full w-full transition-colors active:scale-95 cursor-pointer ${
              currentTab === 'home'
                ? 'text-emerald-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
            aria-label="Home"
          >
            <Sprout
              className={`w-5 h-5 transition-transform ${
                currentTab === 'home' ? 'stroke-[2.5] text-emerald-300 scale-110' : 'stroke-[1.8]'
              }`}
            />
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight font-semibold">Home</span>
          </button>

          {/* Tab 2: My Garden */}
          <button
            type="button"
            onClick={() => onSelectTab('my-garden')}
            className={`flex flex-col items-center justify-center min-h-[44px] h-full w-full transition-colors relative active:scale-95 cursor-pointer ${
              currentTab === 'my-garden'
                ? 'text-emerald-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
            aria-label="My Garden"
          >
            <div className="relative">
              <Leaf
                className={`w-5 h-5 transition-transform ${
                  currentTab === 'my-garden' ? 'stroke-[2.5] text-emerald-300 scale-110' : 'stroke-[1.8]'
                }`}
              />
              {gardenPlantCount > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-emerald-400 text-stone-950 text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {gardenPlantCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight font-semibold">My Garden</span>
          </button>

          {/* Tab 3: Reminders (Seasonal Calendar) */}
          <button
            type="button"
            onClick={() => onSelectTab('reminders')}
            className={`flex flex-col items-center justify-center min-h-[44px] h-full w-full transition-colors relative active:scale-95 cursor-pointer ${
              currentTab === 'reminders'
                ? 'text-amber-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
            aria-label="Reminders"
          >
            <div className="relative">
              <Calendar
                className={`w-5 h-5 transition-transform ${
                  currentTab === 'reminders' ? 'stroke-[2.5] text-amber-300 scale-110' : 'stroke-[1.8]'
                }`}
              />
              {overdueFertilizerCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-amber-400 text-stone-950 text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-xs">
                  {overdueFertilizerCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight font-semibold">Reminders</span>
          </button>

          {/* Tab 4: Account / Log in */}
          <button
            type="button"
            onClick={handleAccountTabClick}
            className={`flex flex-col items-center justify-center min-h-[44px] h-full w-full transition-colors active:scale-95 cursor-pointer ${
              isAccountPanelOpen
                ? 'text-emerald-300 font-bold'
                : 'text-emerald-200/70 hover:text-white'
            }`}
            aria-label={user ? 'Account menu' : 'Log in'}
          >
            {user ? (
              user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Account'}
                  className={`w-5 h-5 rounded-full object-cover border shrink-0 transition-transform ${
                    isAccountPanelOpen ? 'border-emerald-300 scale-110' : 'border-emerald-400/80'
                  }`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className={`w-5 h-5 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[10px] border shrink-0 transition-transform ${
                    isAccountPanelOpen ? 'border-emerald-300 scale-110' : 'border-white/60'
                  }`}
                >
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )
            ) : (
              <UserIcon className="w-5 h-5 stroke-[1.8]" />
            )}
            <span className="text-[10px] sm:text-xs mt-1 tracking-tight font-semibold">
              {user ? 'Account' : 'Log in'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
