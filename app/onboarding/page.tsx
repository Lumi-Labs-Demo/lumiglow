"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Users,
  Mail, ShieldOff, Clock, ChevronRight, Zap, Building2,
  Info, Send, RotateCcw, Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Glossary callout ──────────────────────────────────────────────────────────
function GlossaryCallout() {
  return (
    <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-sm">
      <Info size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-800 dark:text-amber-300">Glossary — </span>
        <span className="text-amber-700 dark:text-amber-400">
          <strong>Workspace</strong> refers to your organization&apos;s LumiGlow environment. All buildings,
          users, schedules, and policies are scoped to a single workspace. A workspace is distinct from
          a <em>team</em> (a sub-group of users) or an <em>org</em> (legacy term; use <em>workspace</em> instead).
        </span>
      </div>
    </div>
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
              i < current
                ? "bg-amber-500 border-amber-500 text-white"
                : i === current
                ? "bg-white dark:bg-slate-900 border-amber-500 text-amber-600 dark:text-amber-400"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
            )}
          >
            {i < current ? <CheckCircle2 size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={cn(
                "h-0.5 w-8 rounded-full transition-all",
                i < current ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm",
      className
    )}>
      {children}
    </div>
  );
}

// ─── Step 1: Create workspace ──────────────────────────────────────────────────
function StepCreateWorkspace({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("pro");
  const [loading, setLoading] = useState(false);

  function submit() {
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 1200);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
          Create your workspace
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A workspace is your team&apos;s shared LumiGlow environment. You can rename it later.
        </p>
      </div>

      <GlossaryCallout />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Workspace name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Acme Corp Facilities"
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Plan
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: "starter", label: "Starter", sub: "Up to 5 buildings" },
              { id: "pro",     label: "Pro",     sub: "Up to 50 buildings" },
              { id: "enterprise", label: "Enterprise", sub: "Unlimited" },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPlan(p.id)}
                className={cn(
                  "p-3 rounded-xl border-2 text-left transition-all",
                  plan === p.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <p className={cn("text-sm font-semibold", plan === p.id ? "text-amber-700 dark:text-amber-400" : "text-slate-800 dark:text-slate-200")}>
                  {p.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.sub}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!name.trim() || loading}
        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-amber-400/30"
      >
        {loading ? (
          <><RefreshCw size={15} className="animate-spin" /> Creating workspace…</>
        ) : (
          <>Create workspace <ChevronRight size={15} /></>
        )}
      </button>
    </div>
  );
}

// ─── Step 2: Invite teammates ──────────────────────────────────────────────────
function StepInvite({
  onNext,
  isAdmin,
}: {
  onNext: () => void;
  isAdmin: boolean;
}) {
  const [emails, setEmails] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [inviteResults, setInviteResults] = useState<
    { email: string; status: "sent" | "failed" }[]
  >([]);

  function sendInvites() {
    if (!emails.trim()) { onNext(); return; }
    setSending(true);
    const list = emails.split(/[,\n]+/).map(e => e.trim()).filter(Boolean);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setInviteResults(
        list.map((e, i) => ({
          email: e,
          status: i === 1 ? "failed" : "sent", // simulate one failure for demo
        }))
      );
    }, 1400);
  }

  // Denied state for non-admin
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Invite teammates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add people to your workspace.</p>
        </div>
        <div className="flex flex-col items-center gap-4 py-8 px-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/25 text-center">
          <ShieldOff size={36} className="text-red-500 dark:text-red-400" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-300 mb-1">Workspace admin required</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Only workspace admins can send invites. Ask your admin to grant you the <strong>Admin</strong> role, then try again.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onNext}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Skip for now
            </button>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors">
              Request admin access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state after invite sent
  if (sent && inviteResults.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Invite status</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here&apos;s the status of your workspace invites.</p>
        </div>
        <div className="space-y-2">
          {inviteResults.map(r => (
            <div
              key={r.email}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl border text-sm",
                r.status === "sent"
                  ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/25"
                  : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                {r.status === "sent"
                  ? <CheckCircle2 size={14} className="text-green-600 dark:text-green-400 shrink-0" />
                  : <AlertCircle size={14} className="text-red-500 dark:text-red-400 shrink-0" />
                }
                <span className={cn("font-medium truncate", r.status === "sent" ? "text-green-800 dark:text-green-300" : "text-red-700 dark:text-red-300")}>
                  {r.email}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className={cn("text-xs font-semibold", r.status === "sent" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                  {r.status === "sent" ? "Sent" : "Failed"}
                </span>
                {r.status === "failed" && (
                  <button className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium">
                    <RotateCcw size={11} /> Re-send
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onNext}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          Continue <ChevronRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Invite teammates</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add people to your workspace. You can always invite more from Settings → Workspace → Members.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Email addresses
        </label>
        <textarea
          value={emails}
          onChange={e => setEmails(e.target.value)}
          rows={4}
          placeholder={"alice@acme.com\nbob@acme.com, carol@acme.com"}
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none transition-shadow font-mono"
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Separate multiple addresses with commas or new lines.</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onNext}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={sendInvites}
          disabled={sending}
          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {sending ? <><RefreshCw size={15} className="animate-spin" /> Sending…</> : <><Send size={15} /> Send invites</>}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Connect building ──────────────────────────────────────────────────
function StepConnect({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function connect() {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 1000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Connect your first building</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select your building&apos;s protocol. LumiGlow auto-discovers zones once connected.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: "bacnet",    label: "BACnet/IP",    sub: "Most common in commercial buildings" },
          { id: "dali",      label: "DALI-2",       sub: "Precision dimming control" },
          { id: "modbus",    label: "Modbus TCP",   sub: "Industrial & legacy systems" },
          { id: "knx",       label: "KNX",          sub: "European standard" },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all",
              selected === p.id
                ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            <p className={cn("text-sm font-semibold", selected === p.id ? "text-amber-700 dark:text-amber-400" : "text-slate-800 dark:text-slate-200")}>
              {p.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{p.sub}</p>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onNext}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition-colors"
        >
          Skip for now
        </button>
        <button
          onClick={connect}
          disabled={!selected || loading}
          className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? <><RefreshCw size={15} className="animate-spin" /> Connecting…</> : <>Connect building <ChevronRight size={15} /></>}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Complete / Success ────────────────────────────────────────────────
function StepComplete() {
  return (
    <div className="space-y-6 text-center py-4">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto">
        <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Your workspace is ready 🎉
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          You&apos;ve set up your LumiGlow workspace. Head to the dashboard to start managing your buildings.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {[
          { icon: Building2, label: "View dashboard",   href: "/lumiglow/dashboard",  primary: true  },
          { icon: Users,     label: "Manage members",   href: "/lumiglow/dashboard",  primary: false },
          { icon: Zap,       label: "Explore features", href: "/lumiglow/#features",  primary: false },
        ].map(a => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-semibold transition-all hover:-translate-y-0.5",
                a.primary
                  ? "bg-amber-500 hover:bg-amber-400 border-amber-500 text-white shadow-sm hover:shadow-amber-400/30"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <Icon size={18} />
              {a.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Resume / Refresh state ────────────────────────────────────────────────────
function ResumeCard({ onResume }: { onResume: () => void }) {
  const [loading, setLoading] = useState(false);

  function resume() {
    setLoading(true);
    setTimeout(() => { setLoading(false); onResume(); }, 900);
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 px-4 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/25 text-center">
      <Clock size={32} className="text-sky-500 dark:text-sky-400" />
      <div>
        <p className="font-semibold text-sky-800 dark:text-sky-300 mb-1">Setup in progress</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          It looks like you started workspace setup but didn&apos;t finish. Your progress is saved — pick up where you left off.
        </p>
      </div>
      <button
        onClick={resume}
        disabled={loading}
        className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
      >
        {loading ? <><RefreshCw size={14} className="animate-spin" /> Loading…</> : <><RotateCcw size={14} /> Resume setup</>}
      </button>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);

  const TOTAL_STEPS = 4;

  const stepLabels = [
    "Create workspace",
    "Invite teammates",
    "Connect building",
    "Done",
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Nav bar */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
                <Zap size={12} className="text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">LumiGlow</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10 space-y-6">
        {/* Start here banner */}
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Start here
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Set up your workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Follow these 4 steps to get LumiGlow running in your organization.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center">
          <StepIndicator current={step} total={TOTAL_STEPS} />
        </div>

        {/* Step label */}
        <p className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Step {Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS} — {stepLabels[Math.min(step, TOTAL_STEPS - 1)]}
        </p>

        {/* Demo controls (edge case toggles) */}
        {step < 3 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-xs">
            <span className="font-semibold text-violet-700 dark:text-violet-300">Demo controls:</span>
            <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showResume}
                onChange={e => setShowResume(e.target.checked)}
                className="accent-violet-500"
              />
              Simulate refresh/resume
            </label>
            {step === 1 && (
              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!isAdmin}
                  onChange={e => setIsAdmin(!e.target.checked)}
                  className="accent-violet-500"
                />
                Simulate non-admin
              </label>
            )}
          </div>
        )}

        {/* Main card */}
        <Card className="p-6">
          {showResume && step < 3 ? (
            <ResumeCard onResume={() => setShowResume(false)} />
          ) : step === 0 ? (
            <StepCreateWorkspace onNext={() => setStep(1)} />
          ) : step === 1 ? (
            <StepInvite onNext={() => setStep(2)} isAdmin={isAdmin} />
          ) : step === 2 ? (
            <StepConnect onNext={() => setStep(3)} />
          ) : (
            <StepComplete />
          )}
        </Card>

        {/* Back to start */}
        {step > 0 && step < 3 && (
          <button
            onClick={() => setStep(0)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <Home size={12} />
            Back to step 1
          </button>
        )}
      </main>
    </div>
  );
}
