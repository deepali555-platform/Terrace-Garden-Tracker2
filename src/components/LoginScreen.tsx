import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, ShieldCheck, Sparkles, Bell, Camera, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onContinueAsGuest?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onContinueAsGuest }) => {
  const { signInWithGoogle, continueAsGuest, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      // Handled in auth context
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ea] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-br from-[#0e3a1f] via-[#144929] to-[#1c5d36] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-3 shadow-inner">
              <Sprout className="w-8 h-8 text-emerald-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Terrace Garden Tracker
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xs font-medium">
              Private garden tracking, seasonal schedules & organic pest remedies for Indian homes
            </p>
          </div>

          {/* Decorative concentric circles */}
          <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full border border-emerald-300" />
            <div className="absolute w-44 h-44 rounded-full border border-emerald-200" />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {/* Feature Highlights */}
          <div className="space-y-2.5 text-xs text-stone-700">
            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Private Garden Data</span>
                <span className="text-stone-500">Your owned plants, pot sizes, and custom species stay 100% private to you.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
              <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">Fertilizer & Seasonal Reminders</span>
                <span className="text-stone-500">Personalized feeding alerts and pruning schedules tailored to your terrace.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
              <Camera className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">AI Health Scanner</span>
                <span className="text-stone-500">Diagnose diseases from photos and save diagnosis records to your account.</span>
              </div>
            </div>
          </div>

          {/* Error Notice */}
          {authError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Sign-in Notice:</span>
                <p className="mt-0.5 leading-relaxed">{authError}</p>
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="mt-1 text-[11px] underline font-semibold text-rose-900"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full min-h-[50px] py-3 px-5 rounded-2xl border-2 border-stone-300 hover:border-emerald-700 bg-white hover:bg-stone-50 text-stone-800 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-75 cursor-pointer"
            >
              {isSigningIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Google Account...</span>
                </>
              ) : (
                <>
                  {/* Google SVG Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Guest Mode Button (Browse Shared Catalog) */}
            <button
              type="button"
              onClick={handleGuest}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Browse 21 Reference Plants without signing in</span>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-stone-100 text-center">
            <p className="text-[11px] text-stone-600 leading-normal">
              No passwords required. Powered by Firebase Authentication. Your email is only used to secure your personal garden records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
