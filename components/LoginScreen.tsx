"use client";

import { supabase } from "@/lib/supabaseClient";
import { FormEvent, useState } from "react";

type LoginScreenProps = {
  onSuccess?: () => void;
  onContinueOffline?: () => void;
};

export default function LoginScreen({
  onSuccess,
  onContinueOffline,
}: LoginScreenProps) {
  const [idInput, setIdInput] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanId = idInput.trim();
    if (!cleanId) {
      setError("Please enter your ID / Username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // Map ID to an email format if it doesn't already contain '@'
    const email = cleanId.includes("@")
      ? cleanId
      : `${cleanId.toLowerCase()}@habit-tracker.local`;

    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          onSuccess?.();
        } else {
          setSuccessMsg(
            "Account created successfully! You can now log in with your ID and password."
          );
          setIsSignUp(false);
        }
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          onSuccess?.();
        }
      }
    } catch (err: any) {
      let msg = err?.message || "An error occurred during authentication.";
      if (msg.includes("Invalid login credentials")) {
        msg = "Invalid ID or password. Please check and try again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#959399] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-300/80 bg-[#FAF9F6] p-6 shadow-xl text-slate-900 sm:p-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EBE7DF] border border-[#DCD6CA] text-xl shadow-xs">
            ⚡
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            {isSignUp ? "Create Your ID" : "Welcome Back"}
          </h2>
          <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            {isSignUp
              ? "Register with an ID & password to sync your habits"
              : "Sign in with your ID and password to access your daily tracker"}
          </p>
        </div>

        {/* Error Alert */}
        {error ? (
          <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-medium text-rose-700">
            <div className="flex items-start gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        ) : null}

        {/* Success Alert */}
        {successMsg ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs font-medium text-emerald-800">
            <div className="flex items-start gap-2">
              <span>✨</span>
              <span>{successMsg}</span>
            </div>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              User ID / Username
            </label>
            <div className="relative mt-1.5">
              <input
                type="text"
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="e.g. lokesh or user123"
                required
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              You can enter any unique ID or an email address.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((curr) => !curr)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🔒"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-xl bg-[#D8CCB4] border border-[#C6B89E] font-bold text-[#2C271E] shadow-sm transition hover:bg-[#CEC0A6] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-[#2C271E]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
              </span>
            ) : (
              <span>{isSignUp ? "Sign Up & Start Tracking" : "Sign In to Tracker"}</span>
            )}
          </button>
        </form>

        {/* Switch Sign In / Sign Up */}
        <div className="mt-6 border-t border-slate-200 pt-4 text-center">
          <p className="text-xs font-medium text-slate-500">
            {isSignUp ? "Already have an ID?" : "Don't have an ID yet?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp((curr) => !curr);
                setError(null);
                setSuccessMsg(null);
              }}
              className="font-bold text-slate-800 underline decoration-slate-400 underline-offset-2 transition hover:text-slate-950"
            >
              {isSignUp ? "Sign In Instead" : "Create New ID"}
            </button>
          </p>
        </div>

        {/* Optional Offline / Local mode escape hatch */}
        {onContinueOffline ? (
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={onContinueOffline}
              className="text-[11px] font-medium text-slate-400 transition hover:text-slate-600"
            >
              Or continue in Local Preview Mode without logging in →
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
