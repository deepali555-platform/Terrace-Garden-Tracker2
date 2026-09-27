import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sprout, ShieldCheck, Sparkles, Bell, Camera, AlertCircle, Copy, Check, ExternalLink, Globe, X } from 'lucide-react';

interface LoginScreenProps {
  onContinueAsGuest?: () => void;
  onSuccess?: () => void;
  promptReason?: string | null;
  onClose?: () => void;
  isModal?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onContinueAsGuest,
  onSuccess,
  promptReason,
  onClose,
  isModal = false,
}) => {
  const { signInWithGoogle, continueAsGuest, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const isUnauthorizedDomain = Boolean(authError?.startsWith('UNAUTHORIZED_DOMAIN:'));
  const currentHostname = (authError && authError.startsWith('UNAUTHORIZED_DOMAIN:'))
    ? authError.replace('UNAUTHORIZED_DOMAIN:', '')
    : (typeof window !== 'undefined' ? window.location.hostname : '');

  const handleCopyDomain = () => {
    if (currentHostname) {
      navigator.clipboard.writeText(currentHostname);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      if (onSuccess) {
        onSuccess();
      }
    } catch {
      // Handled in auth context
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDismissOrGuest = () => {
    if (onClose) {
      onClose();
    } else {
      continueAsGuest();
      if (onContinueAsGuest) {
        onContinueAsGuest();
      }
    }
  };

  const content = (
    <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
      {/* Optional Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
          title="Close and continue browsing"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Header Hero Banner */}
      <div className="bg-gradient-to-br from-[#0e3a1f] via-[#144929] to-[#1c5d36] text-white p-5 sm:p-7 text-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-2.5 shadow-inner">
            <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Terrace Garden Tracker
          </h1>
          <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-1 max-w-xs font-medium">
            Sign in with Google to sync your personal garden, feeding schedules & plant scans
          </p>
        </div>

        {/* Decorative concentric circles */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <div className="w-64 h-64 rounded-full border border-emerald-300" />
          <div className="absolute w-44 h-44 rounded-full border border-emerald-200" />
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Contextual Action Reason Pill if triggered by a user action */}
        {promptReason && (
          <div className="p-3 bg-emerald-50 border border-emerald-300/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950 font-medium shadow-2xs animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold text-stone-900 block">Sign In to Continue</span>
              <span className="text-stone-600 text-[11px] mt-0.5 block leading-relaxed">{promptReason}</span>
            </div>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="space-y-2 text-xs text-stone-700">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Private Garden Data</span>
              <span className="text-stone-500 text-[11px]">Your owned plants, pot sizes, and custom species stay 100% private to you.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
            <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">Fertilizer & Seasonal Reminders</span>
              <span className="text-stone-500 text-[11px]">Personalized feeding alerts and pruning schedules tailored to your terrace.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-50 border border-stone-100">
            <Camera className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 block">AI Health Scanner</span>
              <span className="text-stone-500 text-[11px]">Diagnose diseases from photos and save diagnosis records to your account.</span>
            </div>
          </div>
        </div>

        {/* Error Notice / Domain Authorization Helper */}
        {authError && (
          isUnauthorizedDomain ? (
            <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2.5 shadow-2xs">
              <div className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-stone-900 block text-xs">
                    Domain Authorization Required
                  </span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Google OAuth requires your current app hosting domain to be added to Authorized Domains in your Firebase project.
                  </p>
                </div>
              </div>

              {/* Domain display & copy button */}
              <div className="p-2 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-600 font-semibold block uppercase tracking-wider">
                    Your App Domain:
                  </span>
                  <code className="text-xs font-mono font-bold text-emerald-950 truncate block mt-0.5 select-all">
                    {currentHostname}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyDomain}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer min-h-[34px]"
                >
                  {copiedDomain ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3 Step Instructions */}
              <div className="space-y-1 text-[11px] text-stone-600 bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/70">
                <p className="font-bold text-stone-900">How to authorize in 30 seconds:</p>
                <ol className="list-decimal list-inside space-y-1 text-stone-700">
                  <li>
                    Open{' '}
                    <a
                      href="https://console.firebase.google.com/project/gen-lang-client-0986255984/authentication/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-900 underline font-bold inline-flex items-center gap-0.5"
                    >
                      Firebase Console Settings
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </li>
                  <li>Click <strong>&quot;Add domain&quot;</strong> under Authorized domains.</li>
                  <li>Paste <code className="bg-white/80 px-1 py-0.5 rounded text-[10px]">{currentHostname}</code> and click <strong>Save</strong>.</li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone-500">
                  After adding, click &quot;Continue with Google&quot; below.
                </span>
                <button
                  type="button"
                  onClick={clearAuthError}
                  className="text-[11px] underline font-semibold text-stone-600 hover:text-stone-900"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
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
          )
        )}

        {/* Google Sign In Button */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-stone-300 hover:border-emerald-700 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-75 cursor-pointer"
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

          {/* Cancel / Browse Free without signing in */}
          <button
            type="button"
            onClick={handleDismissOrGuest}
            className="w-full min-h-[40px] py-2 px-3 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Cancel and continue browsing plant guide</span>
          </button>
        </div>

        {/* Privacy Note */}
        <div className="pt-2 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-500 leading-normal">
            No passwords required. Powered by Firebase Authentication. Your email is only used to secure your personal garden records.
          </p>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#f7f4ea] flex items-center justify-center p-4">
      {content}
    </div>
  );
};

