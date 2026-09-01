"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

type Step = "idle" | "redirecting" | "authenticating" | "success" | "error";

// Microsoft SVG icon
function MicrosoftIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftOAuthModal({
  step,
  onClose,
}: {
  step: Step;
  onClose: () => void;
}) {
  if (step === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
        {/* Microsoft header bar */}
        <div className="bg-[#0078D4] px-6 py-4 flex items-center gap-3">
          <MicrosoftIcon size={22} />
          <span className="text-white font-semibold text-sm">Microsoft</span>
        </div>

        <div className="px-6 py-8 text-center">
          {step === "redirecting" && (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-[#0078D4] animate-spin" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Redirecting to Microsoft</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Connecting to Azure AD / Entra ID…
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <Shield size={14} className="text-green-500 shrink-0" />
                <p className="text-xs text-slate-500 dark:text-slate-400 text-left">
                  Secure OAuth 2.0 · Redirect URI verified · State parameter active
                </p>
              </div>
            </div>
          )}

          {step === "authenticating" && (
            <div className="space-y-4">
              <Loader2 className="w-10 h-10 mx-auto text-[#0078D4] animate-spin" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Authenticating</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Exchanging authorization code for token…
                </p>
              </div>
              <div className="flex flex-col gap-2 text-left">
                {[
                  { label: "Redirect URI matched", done: true },
                  { label: "Authorization code received", done: true },
                  { label: "Token exchange in progress…", done: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.done ? (
                      <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                    ) : (
                      <Loader2 size={14} className="text-[#0078D4] animate-spin shrink-0" />
                    )}
                    <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Signed in successfully</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Welcome back, Jordan Davis
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  jordan@acme.com · Microsoft Entra ID
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 rounded-xl p-3">
                <Shield size={14} className="text-green-500 shrink-0" />
                <p className="text-xs text-green-700 dark:text-green-400 text-left">
                  OAuth flow completed · Session created · Redirecting to dashboard…
                </p>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-slate-400" />
                <span className="text-xs text-slate-400">Redirecting…</span>
              </div>
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Sign-in failed</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Token exchange error: redirect_uri_mismatch
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [oauthStep, setOauthStep] = useState<Step>("idle");
  const [emailError, setEmailError] = useState("");

  // Microsoft OAuth demo flow
  function handleMicrosoftSignIn() {
    setOauthStep("redirecting");
    setTimeout(() => setOauthStep("authenticating"), 1800);
    setTimeout(() => setOauthStep("success"), 3600);
    setTimeout(() => router.push("/dashboard"), 5200);
  }

  function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    router.push("/dashboard");
  }

  return (
    <>
      <MicrosoftOAuthModal step={oauthStep} onClose={() => setOauthStep("idle")} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-amber-400/40 transition-shadow">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Lumi<span className="text-amber-500">Glow</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-slate-950/50 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  Sign in to your LumiGlow account
                </p>
              </div>

              {/* SSO Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleMicrosoftSignIn}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow group"
                >
                  <MicrosoftIcon size={18} />
                  Continue with Microsoft
                  <ArrowRight size={14} className="ml-auto text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow group"
                >
                  <GoogleIcon size={18} />
                  Continue with Google
                  <ArrowRight size={14} className="ml-auto text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400 font-medium">or continue with email</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
                    Work email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    placeholder="you@company.com"
                    className={cn(
                      "w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-all",
                      emailError
                        ? "border-red-400 focus:ring-red-400/30"
                        : "border-slate-200 dark:border-slate-700 focus:ring-amber-400/40 focus:border-amber-400"
                    )}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle size={11} /> {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs text-amber-500 hover:text-amber-400 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30 text-sm"
                >
                  Sign in
                </button>
              </form>

              {/* Footer */}
              <p className="text-center text-xs text-slate-400 mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/onboarding" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                  Create a workspace
                </Link>
              </p>
            </div>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 mt-5">
              <Shield size={12} className="text-slate-400" />
              <p className="text-xs text-slate-400">
                Protected by OAuth 2.0 · SOC 2 Type II · GDPR compliant
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
