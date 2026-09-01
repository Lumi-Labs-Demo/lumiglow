"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft,
  Loader2, Users, Plug, LayoutDashboard, RefreshCw,
  ShieldOff, WifiOff, Mail, X, Plus, Trash2, Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Types ─────────────────────────────────────────────────────────────────────

type OnboardingStep = 1 | 2 | 3 | 4;
type ResumeState = "idle" | "checking" | "resuming";

interface InviteEntry {
  id: string;
  email: string;
  status: "idle" | "sending" | "sent" | "failed";
  error?: string;
}

// ─── Step indicator ────────────────────────────────────────────────────────────

const STEPS: { label: string; icon: React.ReactNode }[] = [
  { label: "Create workspace",  icon: <Zap size={14} /> },
  { label: "Invite teammates",  icon: <Users size={14} /> },
  { label: "Connect tools",     icon: <Plug size={14} /> },
  { label: "You're ready",      icon: <CheckCircle2 size={14} /> },
];

function StepIndicator({ current }: { current: OnboardingStep }) {
  return (
    <nav aria-label="Setup progress" className="flex items-center gap-0 w-full max-w-lg mx-auto">
      {STEPS.map((s, i) => {
        const n = (i + 1) as OnboardingStep;
        const done = current > n;
        const active = current === n;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  done  ? "bg-green-500 text-white"
                  : active ? "bg-amber-500 text-white shadow-lg shadow-amber-400/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                )}
              >
                {done ? <CheckCircle2 size={15} /> : <span>{n}</span>}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-[10px] font-semibold whitespace-nowrap",
                  active ? "text-amber-500" : done ? "text-green-500" : "text-slate-400 dark:text-slate-500"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1 mb-4 sm:mb-5 rounded-full transition-all",
                  current > n ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ─── Step 1 — Create Workspace ─────────────────────────────────────────────────

function Step1({
  workspaceName,
  setWorkspaceName,
  onNext,
}: {
  workspaceName: string;
  setWorkspaceName: (v: string) => void;
  onNext: () => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = workspaceName.trim();
    if (!trimmed) { setError("Workspace name is required."); return; }
    if (trimmed.length < 2) { setError("Name must be at least 2 characters."); return; }
    setError("");
    setLoading(true);
    setNetworkError(false);
    // Simulate network check — random failure for demo
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 900);
  }

  function handleRetry() {
    setNetworkError(false);
    setLoading(true);
    setTimeout(() => { setLoading(false); onNext(); }, 900);
  }

  const displayName = workspaceName.trim() || "Your Workspace";
  const truncated = displayName.length > 28 ? displayName.slice(0, 26) + "…" : displayName;

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Name your workspace</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your workspace is where your team manages buildings and energy data. You can rename it any time.
        </p>
      </div>

      {/* Glossary callout */}
      <div className="flex items-start gap-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3">
        <Zap size={14} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300">
          <strong>Workspace</strong> is what we call your LumiGlow environment — it holds your buildings, users, and settings. Think of it as your dedicated command center.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
            Workspace name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={workspaceName}
            onChange={e => { setWorkspaceName(e.target.value); setError(""); }}
            placeholder="e.g. ACME Corp Facilities"
            maxLength={60}
            className={cn(
              "w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
              error
                ? "border-red-400 focus:ring-red-400/30"
                : "border-slate-200 dark:border-slate-700 focus:ring-amber-400/40 focus:border-amber-400"
            )}
          />
          {/* Live preview with truncation handling */}
          {workspaceName.trim() && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Preview:</span>
              <span
                className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate"
                title={workspaceName.trim()}
              >
                {truncated}
              </span>
              {displayName.length > 28 && (
                <span className="text-[10px] text-amber-500 font-medium">(truncated in narrow views)</span>
              )}
            </div>
          )}
          {error && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} /> {error}
            </p>
          )}
        </div>

        {/* Network error inline state */}
        {networkError && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3">
            <WifiOff size={14} className="text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">Network error — workspace not saved</p>
              <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">Your input is preserved. Try again when you're back online.</p>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-500 transition-colors"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30 text-sm"
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Creating workspace…</>
          ) : (
            <>Create workspace <ArrowRight size={15} /></>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Step 2 — Invite Teammates ─────────────────────────────────────────────────

function Step2({
  workspaceName,
  onNext,
  onBack,
}: {
  workspaceName: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [invites, setInvites] = useState<InviteEntry[]>([
    { id: "i1", email: "", status: "idle" },
  ]);
  const [permDenied, setPermDenied] = useState(false);
  const [sending, setSending] = useState(false);

  function addRow() {
    setInvites(prev => [...prev, { id: `i${Date.now()}`, email: "", status: "idle" }]);
  }

  function removeRow(id: string) {
    setInvites(prev => prev.filter(i => i.id !== id));
  }

  function updateEmail(id: string, email: string) {
    setInvites(prev => prev.map(i => i.id === id ? { ...i, email, status: "idle", error: undefined } : i));
  }

  function sendInvites() {
    const filled = invites.filter(i => i.email.trim() && i.email.includes("@"));
    if (filled.length === 0) { onNext(); return; }

    setSending(true);
    setInvites(prev => prev.map(i =>
      i.email.trim() && i.email.includes("@") ? { ...i, status: "sending" } : i
    ));

    // Simulate send — second invite always fails for demo purposes
    setTimeout(() => {
      setSending(false);
      setInvites(prev => prev.map((inv, idx) => {
        if (!inv.email.trim() || !inv.email.includes("@")) return inv;
        // Simulate: second entry fails
        if (idx === 1 && filled.length > 1) {
          return { ...inv, status: "failed", error: "Delivery failed — address not found. Check the email and try again." };
        }
        return { ...inv, status: "sent" };
      }));
    }, 1500);
  }

  function retryInvite(id: string) {
    setInvites(prev => prev.map(i => i.id === id ? { ...i, status: "sending", error: undefined } : i));
    setTimeout(() => {
      setInvites(prev => prev.map(i => i.id === id ? { ...i, status: "sent" } : i));
    }, 1000);
  }

  const hasFailed = invites.some(i => i.status === "failed");
  const allSentOrEmpty = invites.every(i => i.status === "sent" || !i.email.trim() || i.status === "idle");
  const canProceed = !sending;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite your teammates</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add people to <strong className="text-slate-700 dark:text-slate-300">{workspaceName || "your workspace"}</strong>. You can always invite more from workspace settings.
        </p>
      </div>

      {/* Permission-denied state */}
      {permDenied && (
        <div className="rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-4 py-4">
          <div className="flex items-start gap-3">
            <ShieldOff size={16} className="text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">You don't have permission to invite members</p>
              <p className="text-xs text-orange-700/80 dark:text-orange-400/70 mt-1">
                Only workspace admins can send invitations. Ask your admin to grant you the <strong>Manage Members</strong> permission, or have them send invites directly.
              </p>
              <button
                onClick={() => setPermDenied(false)}
                className="mt-2 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors underline"
              >
                Dismiss and continue without inviting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite rows */}
      <div className="space-y-2.5">
        {invites.map((inv, idx) => (
          <div key={inv.id}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={inv.email}
                  onChange={e => updateEmail(inv.id, e.target.value)}
                  placeholder={idx === 0 ? "colleague@company.com" : "another@company.com"}
                  disabled={inv.status === "sending" || inv.status === "sent"}
                  className={cn(
                    "w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border transition-all focus:outline-none focus:ring-2",
                    "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500",
                    inv.status === "failed"
                      ? "border-red-400 dark:border-red-500/60 focus:ring-red-400/30"
                      : inv.status === "sent"
                        ? "border-green-400 dark:border-green-500/40 bg-green-50/50 dark:bg-green-500/5"
                        : "border-slate-200 dark:border-slate-700 focus:ring-amber-400/40 focus:border-amber-400",
                    (inv.status === "sending" || inv.status === "sent") && "opacity-70 cursor-not-allowed"
                  )}
                />
              </div>

              {/* Status icon */}
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                {inv.status === "sending" && <Loader2 size={15} className="text-amber-500 animate-spin" />}
                {inv.status === "sent"    && <CheckCircle2 size={15} className="text-green-500" />}
                {inv.status === "failed"  && <AlertCircle size={15} className="text-red-500" />}
              </div>

              {/* Remove */}
              {invites.length > 1 && inv.status !== "sent" && (
                <button
                  onClick={() => removeRow(inv.id)}
                  className="w-7 h-7 flex items-center justify-center shrink-0 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Inline error + retry */}
            {inv.status === "failed" && (
              <div className="flex items-start gap-2 mt-1.5 px-1">
                <AlertCircle size={11} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-500 dark:text-red-400 flex-1">{inv.error}</p>
                <button
                  onClick={() => retryInvite(inv.id)}
                  className="shrink-0 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={10} /> Re-send
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addRow}
          disabled={sending}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors disabled:opacity-40"
        >
          <Plus size={13} /> Add another
        </button>
      </div>

      {/* Simulate permission-denied demo toggle */}
      <button
        onClick={() => setPermDenied(v => !v)}
        className="text-[11px] text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-500 transition-colors underline"
      >
        {permDenied ? "Hide" : "Demo:"} simulate non-admin denied state
      </button>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex-1" />
        {hasFailed ? (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Skip and continue <ArrowRight size={14} />
          </button>
        ) : null}
        <button
          onClick={sendInvites}
          disabled={sending}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30"
        >
          {sending ? (
            <><Loader2 size={14} className="animate-spin" /> Sending…</>
          ) : allSentOrEmpty && invites.some(i => i.status === "sent") ? (
            <>Next step <ArrowRight size={14} /></>
          ) : (
            <>Send invites <ArrowRight size={14} /></>
          )}
        </button>
      </div>

      {/* Post-send proceed */}
      {invites.some(i => i.status === "sent") && !sending && (
        <button
          onClick={onNext}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Continue to next step <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ─── Step 3 — Connect Tools ────────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: "slack",    name: "Slack",     desc: "Alert notifications in your channels",  color: "#4A154B" },
  { id: "ms-teams", name: "MS Teams",  desc: "Push alerts to Teams channels",          color: "#464EB8" },
  { id: "pagerduty",name: "PagerDuty", desc: "On-call escalation for critical events", color: "#06AC38" },
  { id: "jira",     name: "Jira",      desc: "Create tickets from alerts automatically",color: "#0052CC" },
];

function Step3({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [connected, setConnected] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  function connect(id: string) {
    setConnecting(id);
    setTimeout(() => {
      setConnecting(null);
      setConnected(prev => [...prev, id]);
    }, 1200);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connect your tools</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Integrate LumiGlow with your existing stack. All of these are optional — you can add them any time from workspace settings.
        </p>
      </div>

      <div className="space-y-2.5">
        {INTEGRATIONS.map(int => {
          const isConnected = connected.includes(int.id);
          const isConnecting = connecting === int.id;
          return (
            <div
              key={int.id}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all",
                isConnected
                  ? "bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20"
                  : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
              )}
            >
              {/* Logo circle */}
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                style={{ backgroundColor: int.color }}
              >
                <Plug size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-semibold",
                  isConnected ? "text-green-700 dark:text-green-400" : "text-slate-800 dark:text-slate-200"
                )}>
                  {int.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{int.desc}</p>
              </div>
              <button
                onClick={() => !isConnected && connect(int.id)}
                disabled={isConnecting || isConnected}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  isConnected
                    ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 cursor-default"
                    : "bg-amber-500 hover:bg-amber-400 text-white shadow-sm hover:shadow-amber-400/30"
                )}
              >
                {isConnecting ? (
                  <><Loader2 size={11} className="animate-spin" /> Connecting…</>
                ) : isConnected ? (
                  <><CheckCircle2 size={12} /> Connected</>
                ) : (
                  <>Connect</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex-1" />
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30"
        >
          {connected.length > 0 ? "Continue" : "Continue"} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 — Success / Ready ──────────────────────────────────────────────────

function Step4({
  workspaceName,
  onDashboard,
}: {
  workspaceName: string;
  onDashboard: () => void;
}) {
  const displayName = workspaceName.trim() || "Your Workspace";

  return (
    <div className="space-y-6 text-center">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          <span className="max-w-[260px] inline-block truncate align-bottom" title={displayName}>
            {displayName}
          </span>{" "}
          is ready!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your workspace is set up. Here's what you can do next to make the most of LumiGlow.
        </p>
      </div>

      {/* Next action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        {[
          {
            icon: <LayoutDashboard size={18} className="text-amber-500" />,
            title: "View your dashboard",
            desc: "See live building data, energy stats, and active alerts.",
            cta: "Go to dashboard",
            action: onDashboard,
            primary: true,
          },
          {
            icon: <Users size={18} className="text-sky-500" />,
            title: "Manage teammates",
            desc: "Review pending invites and assign roles to your team.",
            cta: "Open Members",
            action: onDashboard,
            primary: false,
          },
          {
            icon: <Plug size={18} className="text-purple-500" />,
            title: "Add integrations",
            desc: "Connect Slack, PagerDuty, or Jira to automate alerts.",
            cta: "Open Integrations",
            action: onDashboard,
            primary: false,
          },
        ].map(card => (
          <div
            key={card.title}
            className={cn(
              "rounded-xl border p-4 flex flex-col gap-3 transition-all",
              card.primary
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25"
                : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              {card.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{card.desc}</p>
            </div>
            <button
              onClick={card.action}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold transition-colors",
                card.primary ? "text-amber-600 dark:text-amber-400 hover:text-amber-500" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {card.cta} <ArrowRight size={11} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onDashboard}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30 text-sm"
      >
        Go to dashboard <ArrowRight size={15} />
      </button>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        You can always access workspace settings from the sidebar.
      </p>
    </div>
  );
}

// ─── Resume Banner ─────────────────────────────────────────────────────────────

function ResumeBanner({
  workspaceName,
  step,
  onResume,
  onRestart,
}: {
  workspaceName: string;
  step: OnboardingStep;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 px-4 py-4">
      <div className="flex items-start gap-3">
        <RefreshCw size={16} className="text-sky-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">Resume your setup</p>
          <p className="text-xs text-sky-600/80 dark:text-sky-400/70 mt-1 truncate">
            You were setting up <strong>{workspaceName || "your workspace"}</strong> — you're on step {step} of 4.
          </p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={onResume}
            className="text-xs font-semibold px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition-colors"
          >
            Resume setup
          </button>
          <button
            onClick={onRestart}
            className="text-xs text-sky-500 dark:text-sky-400 hover:text-sky-400 transition-colors text-center"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ──────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [resumeState, setResumeState] = useState<ResumeState>("checking");
  const [showResume, setShowResume] = useState(false);

  // Simulate checking for a saved session on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("lumiglow_onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setWorkspaceName(data.workspaceName || "");
        setResumeState("idle");
        setShowResume(true);
      } catch {
        setResumeState("idle");
      }
    } else {
      // Simulate: 30% chance of finding a saved partial session for demo
      setTimeout(() => {
        setResumeState("idle");
      }, 600);
    }
  }, []);

  function saveProgress(s: OnboardingStep, name: string) {
    sessionStorage.setItem("lumiglow_onboarding", JSON.stringify({ step: s, workspaceName: name }));
  }

  function next() {
    const next = Math.min(step + 1, 4) as OnboardingStep;
    setStep(next);
    saveProgress(next, workspaceName);
    setShowResume(false);
  }

  function back() {
    const prev = Math.max(step - 1, 1) as OnboardingStep;
    setStep(prev);
    saveProgress(prev, workspaceName);
  }

  function handleResume() {
    const saved = sessionStorage.getItem("lumiglow_onboarding");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setStep((data.step as OnboardingStep) || 1);
        setWorkspaceName(data.workspaceName || "");
      } catch { /* no-op */ }
    }
    setShowResume(false);
  }

  function handleRestart() {
    sessionStorage.removeItem("lumiglow_onboarding");
    setStep(1);
    setWorkspaceName("");
    setShowResume(false);
  }

  function goToDashboard() {
    sessionStorage.removeItem("lumiglow_onboarding");
    router.push("/dashboard");
  }

  const isChecking = resumeState === "checking";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-amber-400/40 transition-shadow">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Lumi<span className="text-amber-500">Glow</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Shield size={11} /> SOC 2 Type II · GDPR
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-lg space-y-8">
          {/* Checking state */}
          {isChecking && (
            <div className="flex flex-col items-center gap-3 py-16">
              <Loader2 size={28} className="text-amber-400 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Checking your workspace status…</p>
            </div>
          )}

          {!isChecking && (
            <>
              {/* Resume banner */}
              {showResume && (
                <ResumeBanner
                  workspaceName={workspaceName}
                  step={step}
                  onResume={handleResume}
                  onRestart={handleRestart}
                />
              )}

              {/* Step indicator */}
              <StepIndicator current={step} />

              {/* Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-slate-950/50 p-7 sm:p-8">
                {step === 1 && (
                  <Step1
                    workspaceName={workspaceName}
                    setWorkspaceName={name => { setWorkspaceName(name); saveProgress(1, name); }}
                    onNext={next}
                  />
                )}
                {step === 2 && (
                  <Step2
                    workspaceName={workspaceName}
                    onNext={next}
                    onBack={back}
                  />
                )}
                {step === 3 && (
                  <Step3 onNext={next} onBack={back} />
                )}
                {step === 4 && (
                  <Step4 workspaceName={workspaceName} onDashboard={goToDashboard} />
                )}
              </div>

              {/* Contextual helper text */}
              {step < 4 && (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                  Your progress is saved automatically.{" "}
                  <button
                    onClick={() => {
                      sessionStorage.setItem("lumiglow_onboarding", JSON.stringify({ step, workspaceName }));
                      setShowResume(true);
                    }}
                    className="text-amber-500 hover:text-amber-400 font-medium transition-colors"
                  >
                    Demo resume flow
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
