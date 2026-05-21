"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, CheckCircle2, ArrowRight, Building2, Plug, Users,
  LayoutDashboard, RefreshCw, AlertCircle, Mail, X,
  ChevronRight, ShieldOff, RotateCcw, Sparkles, Clock,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type OnboardingStep = "start" | "create-workspace" | "connect-tools" | "invite" | "success";
type EdgeCase = null | "permission-denied" | "invite-bounce" | "resume";

// ─── Glossary callout ─────────────────────────────────────────────────────────

function GlossaryCallout() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10 p-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 text-left"
      >
        <span className="text-base">🗺️</span>
        <p className="text-sm font-semibold text-sky-800 dark:text-sky-300 flex-1">
          Glossary — key terms used in LumiGlow
        </p>
        <ChevronRight
          size={16}
          className={cn(
            "text-sky-500 transition-transform duration-200 shrink-0",
            expanded && "rotate-90"
          )}
        />
      </button>
      {expanded && (
        <ul className="mt-3 space-y-2 text-xs text-sky-700 dark:text-sky-300 pl-2 border-l-2 border-sky-200 dark:border-sky-500/40 ml-1">
          <li>
            <strong>Workspace</strong> — your top-level account that contains all your buildings,
            users, and settings. (Not "org" or "team" — always "workspace".)
          </li>
          <li>
            <strong>Building</strong> — a physical property managed within your workspace.
          </li>
          <li>
            <strong>Zone</strong> — a group of lighting fixtures within a building floor.
          </li>
          <li>
            <strong>Admin</strong> — a workspace member who can manage users and billing.
          </li>
        </ul>
      )}
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: "create-workspace", label: "Create workspace" },
  { id: "connect-tools",    label: "Connect tools"    },
  { id: "invite",           label: "Invite teammates" },
  { id: "success",          label: "View dashboard"   },
] as const;

function StepIndicator({ current }: { current: OnboardingStep }) {
  const activeIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0 w-full max-w-xl mx-auto">
      {STEPS.map((step, i) => {
        const done    = i < activeIdx;
        const active  = i === activeIdx;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : active
                    ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500"
                )}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-[10px] font-medium text-center leading-tight",
                  active ? "text-amber-600 dark:text-amber-400" : done ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mx-2 mt-[-16px] sm:mt-[-18px] rounded-full transition-colors", done ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Start Here ───────────────────────────────────────────────────────────────

function StartHere({ onBegin, onResume }: { onBegin: () => void; onResume: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30">
          <Sparkles size={13} className="text-amber-500" />
          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Start here</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to LumiGlow
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Set up your <strong className="text-slate-700 dark:text-slate-200">workspace</strong> in minutes. Follow four
          quick steps to start managing your buildings with smart lighting.
        </p>
      </div>

      <GlossaryCallout />

      {/* Steps overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: <Building2 size={18} className="text-amber-500" />, step: "1", title: "Create workspace", desc: "Name your workspace and set your timezone and region." },
          { icon: <Plug size={18} className="text-violet-500" />,     step: "2", title: "Connect tools",    desc: "Link your BMS, HVAC, or energy management system." },
          { icon: <Users size={18} className="text-sky-500" />,       step: "3", title: "Invite teammates", desc: "Add admins and facility managers to your workspace." },
          { icon: <LayoutDashboard size={18} className="text-emerald-500" />, step: "4", title: "View dashboard", desc: "Go live — monitor real-time energy data across all buildings." },
        ].map((item) => (
          <div
            key={item.step}
            className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Step {item.step}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBegin}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-md shadow-amber-500/25 hover:shadow-amber-400/30 transition-all text-sm"
        >
          Create your workspace <ArrowRight size={16} />
        </button>
        <button
          onClick={onResume}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
        >
          <Clock size={15} /> Resume setup
        </button>
      </div>
    </div>
  );
}

// ─── Resume state ─────────────────────────────────────────────────────────────

function ResumeState({ onResume, onDismiss }: { onResume: () => void; onDismiss: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="text-center space-y-5 py-6">
      {loading ? (
        <>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-500/20 border border-sky-200 dark:border-sky-500/30">
            <RefreshCw size={14} className="text-sky-500 animate-spin" />
            <span className="text-sm font-semibold text-sky-700 dark:text-sky-400">Restoring your session…</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We're picking up where you left off. This only takes a moment.
          </p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center mx-auto">
            <Clock size={28} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resume your setup</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Your workspace setup was saved at <strong className="text-slate-700 dark:text-slate-300">Step 2 — Connect tools</strong>.
              Pick up right where you left off.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onResume}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
            >
              <ArrowRight size={15} /> Continue setup
            </button>
            <button
              onClick={onDismiss}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
            >
              Start over
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 1: Create workspace ─────────────────────────────────────────────────

function CreateWorkspace({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState("");
  const [tz, setTz] = useState("America/Los_Angeles");
  const [region, setRegion] = useState("us-west");

  const canSubmit = name.trim().length >= 2;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create your workspace</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your <strong className="text-slate-700 dark:text-slate-200">workspace</strong> is the top-level container for all your buildings, users, and settings.
        </p>
      </div>

      <GlossaryCallout />

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
            Workspace name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Corp Facilities"
            className={cn(
              "w-full px-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
              name.trim().length > 0 && name.trim().length < 2
                ? "border-red-300 dark:border-red-500/60 focus:ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus:ring-amber-400"
            )}
          />
          {name.trim().length > 0 && name.trim().length < 2 && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} /> Workspace name must be at least 2 characters.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Timezone
            </label>
            <select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="America/Los_Angeles">Pacific (UTC−8)</option>
              <option value="America/Chicago">Central (UTC−6)</option>
              <option value="America/New_York">Eastern (UTC−5)</option>
              <option value="Europe/London">London (UTC+0)</option>
              <option value="Europe/Berlin">Berlin (UTC+1)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
              Data region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="us-west">US West</option>
              <option value="us-east">US East</option>
              <option value="eu-west">EU West</option>
              <option value="ap-southeast">AP Southeast</option>
            </select>
          </div>
        </div>
      </div>

      <button
        disabled={!canSubmit}
        onClick={() => onNext(name.trim())}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all text-sm",
          canSubmit
            ? "bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-500/25 hover:shadow-amber-400/30"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
        )}
      >
        Create workspace <ArrowRight size={15} />
      </button>
      <p className="text-xs text-center text-slate-400 dark:text-slate-500">
        This is a demo — no workspace is created.
      </p>
    </div>
  );
}

// ─── Step 2: Connect tools ────────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: "bms",     name: "BMS / BACnet",       icon: "🏢", desc: "Connect your building management system." },
  { id: "zendesk", name: "Zendesk",             icon: "🎫", desc: "Sync facility tickets automatically."      },
  { id: "hubspot", name: "HubSpot",             icon: "🧲", desc: "Track workspace contacts and deals."       },
  { id: "slack",   name: "Slack",               icon: "💬", desc: "Get alerts in your team channel."          },
];

function ConnectTools({ workspaceName, onNext, onSkip }: { workspaceName: string; onNext: () => void; onSkip: () => void }) {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(id: string) {
    if (connected.has(id)) return;
    setConnecting(id);
    setTimeout(() => {
      setConnected((prev) => new Set([...prev, id]));
      setConnecting(null);
    }, 1200);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connect tools</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Link your existing systems to your <strong className="text-slate-700 dark:text-slate-200">{workspaceName}</strong> workspace.
          You can always add more later.
        </p>
      </div>

      <div className="space-y-3">
        {INTEGRATIONS.map((intg) => {
          const isConnected  = connected.has(intg.id);
          const isConnecting = connecting === intg.id;
          return (
            <div
              key={intg.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-all",
                isConnected
                  ? "border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              <span className="text-2xl shrink-0">{intg.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-semibold", isConnected ? "text-emerald-800 dark:text-emerald-300" : "text-slate-800 dark:text-slate-200")}>
                  {intg.name}
                </p>
                <p className={cn("text-xs mt-0.5", isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400")}>
                  {isConnected ? "Connected ✓" : intg.desc}
                </p>
              </div>
              <button
                onClick={() => handleConnect(intg.id)}
                disabled={isConnected || isConnecting}
                className={cn(
                  "shrink-0 px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5",
                  isConnected
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 cursor-default"
                    : isConnecting
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-wait"
                    : "bg-amber-500 hover:bg-amber-400 text-white shadow-sm"
                )}
              >
                {isConnected ? (
                  <><CheckCircle2 size={12} /> Connected</>
                ) : isConnecting ? (
                  <><RefreshCw size={12} className="animate-spin" /> Connecting…</>
                ) : (
                  "Connect"
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
        >
          Continue <ArrowRight size={15} />
        </button>
        <button
          onClick={onSkip}
          className="px-5 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Permission Denied state ──────────────────────────────────────────────────

function PermissionDenied({ email, onDismiss }: { email: string; onDismiss: () => void }) {
  return (
    <div className="text-center space-y-5 py-4">
      <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30 flex items-center justify-center mx-auto">
        <ShieldOff size={28} className="text-red-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          <strong className="text-slate-700 dark:text-slate-300">{email}</strong> was invited but doesn't have
          admin permissions in this workspace. Only admins can manage users and settings.
        </p>
      </div>
      <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 text-left max-w-sm mx-auto">
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-2">How to fix this</p>
        <ul className="space-y-1.5 text-xs text-amber-700 dark:text-amber-300">
          <li className="flex items-start gap-2"><ChevronRight size={12} className="mt-0.5 shrink-0" /> Ask a current workspace admin to grant this user admin access.</li>
          <li className="flex items-start gap-2"><ChevronRight size={12} className="mt-0.5 shrink-0" /> Or invite them as a <strong>Viewer</strong> or <strong>Manager</strong> role instead.</li>
          <li className="flex items-start gap-2"><ChevronRight size={12} className="mt-0.5 shrink-0" /> Contact <a href="mailto:support@lumiglow.io" className="underline font-medium">support@lumiglow.io</a> for workspace access issues.</li>
        </ul>
      </div>
      <button
        onClick={onDismiss}
        className="flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm mx-auto"
      >
        <RotateCcw size={14} /> Go back
      </button>
    </div>
  );
}

// ─── Invite bounce state ──────────────────────────────────────────────────────

function InviteBounce({ email, onRetry, onDismiss }: { email: string; onRetry: () => void; onDismiss: () => void }) {
  const [retrying, setRetrying] = useState(false);
  const [retried, setRetried] = useState(false);

  function handleRetry() {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      setRetried(true);
    }, 1500);
  }

  return (
    <div className="text-center space-y-5 py-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center mx-auto">
        <Mail size={28} className="text-amber-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {retried ? "Invitation re-sent!" : "Invite email bounced"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          {retried ? (
            <>The invitation was re-sent to <strong className="text-slate-700 dark:text-slate-300">{email}</strong>. If it bounces again, try a different email address.</>
          ) : (
            <>The invitation to <strong className="text-slate-700 dark:text-slate-300">{email}</strong> could not be delivered. The address may be invalid or the inbox may be full.</>
          )}
        </p>
      </div>

      {!retried && (
        <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
          <div className={cn("flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full",
            "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30"
          )}>
            <AlertCircle size={11} /> Delivery failed
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!retried && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-2.5 font-semibold rounded-xl text-sm transition-all",
              retrying
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-wait"
                : "bg-amber-500 hover:bg-amber-400 text-white shadow-md"
            )}
          >
            {retrying ? (
              <><RefreshCw size={14} className="animate-spin" /> Retrying…</>
            ) : (
              <><RefreshCw size={14} /> Retry invite</>
            )}
          </button>
        )}
        <button
          onClick={onDismiss}
          className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm"
        >
          {retried ? <><ArrowRight size={14} /> Continue</> : "Use different email"}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Invite teammates ─────────────────────────────────────────────────

const ROLE_OPTIONS = ["Admin", "Manager", "Viewer"];

function InviteTeammates({
  workspaceName,
  onNext,
  onEdgeCase,
}: {
  workspaceName: string;
  onNext: () => void;
  onEdgeCase: (ec: EdgeCase, email?: string) => void;
}) {
  const [email, setEmail]   = useState("");
  const [role, setRole]     = useState("Manager");
  const [invites, setInvites] = useState<Array<{ email: string; role: string; status: "sent" | "pending" }>>([]);
  const [sending, setSending] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function handleInvite() {
    if (!isValidEmail) return;
    setSending(true);
    const captured = email.trim();
    const capturedRole = role;
    setTimeout(() => {
      setSending(false);
      // Simulate: non-admin invited as admin → permission denied
      if (capturedRole === "Admin" && captured.includes("nonadmin")) {
        onEdgeCase("permission-denied", captured);
        return;
      }
      // Simulate: bounce for "bounce@" emails
      if (captured.startsWith("bounce")) {
        onEdgeCase("invite-bounce", captured);
        return;
      }
      setInvites((prev) => [...prev, { email: captured, role: capturedRole, status: "sent" }]);
      setEmail("");
    }, 900);
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite teammates</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add members to your <strong className="text-slate-700 dark:text-slate-200">{workspaceName}</strong> workspace.
          Admins can manage users and billing; Managers can control buildings; Viewers are read-only.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && isValidEmail && handleInvite()}
            placeholder="colleague@company.com"
            className={cn(
              "flex-1 px-4 py-3 text-sm rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
              email && !isValidEmail
                ? "border-red-300 dark:border-red-500/60 focus:ring-red-400"
                : "border-slate-200 dark:border-slate-700 focus:ring-amber-400"
            )}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {ROLE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>

        {email && !isValidEmail && (
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
            <AlertCircle size={11} /> Enter a valid email address.
          </p>
        )}

        {/* Edge case demo hints */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3 space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Edge case demos</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-[11px]">nonadmin@example.com</code> as <strong>Admin</strong> → permission denied state
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-[11px]">bounce@example.com</code> → invite bounce state
          </p>
        </div>

        <button
          onClick={handleInvite}
          disabled={!isValidEmail || sending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all text-sm",
            isValidEmail && !sending
              ? "bg-amber-500 hover:bg-amber-400 text-white shadow-md"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
          )}
        >
          {sending ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : <><Mail size={14} /> Send invite</>}
        </button>
      </div>

      {/* Invited list */}
      {invites.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Invited</p>
          {invites.map((inv, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10">
              <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold shrink-0">
                {inv.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{inv.email}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Invite sent · {inv.role}</p>
              </div>
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {invites.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/40 p-6 text-center">
          <Users size={24} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No teammates invited yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Invites appear here after sending.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-md transition-all text-sm"
        >
          Continue to dashboard <ArrowRight size={15} />
        </button>
        <button
          onClick={onNext}
          className="px-5 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

// ─── Success / View dashboard ─────────────────────────────────────────────────

function SuccessState({ workspaceName }: { workspaceName: string }) {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="relative inline-flex">
        <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
          <CheckCircle2 size={36} className="text-emerald-500" />
        </div>
        <span className="absolute -top-1 -right-1 text-2xl">🎉</span>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          {workspaceName || "Your workspace"} is live!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Your workspace is set up and ready. Start monitoring your buildings, reviewing energy data,
          and managing your team from the dashboard.
        </p>
      </div>

      {/* What to do next */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        {[
          { icon: <Users size={16} className="text-sky-500" />,            label: "Invite teammates",   desc: "Add more members to your workspace anytime from Settings."          },
          { icon: <Plug size={16} className="text-violet-500" />,          label: "Connect tools",      desc: "Add integrations like Slack, HubSpot, and BMS from the dashboard."  },
          { icon: <LayoutDashboard size={16} className="text-amber-500" />, label: "Explore dashboard", desc: "Monitor energy, manage zones, and review alerts in real time."        },
        ].map((item) => (
          <div key={item.label} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              {item.icon}
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.label}</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-400/30 transition-all text-sm"
      >
        <LayoutDashboard size={16} /> Go to dashboard
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>("start");
  const [edgeCase, setEdgeCase] = useState<EdgeCase>(null);
  const [edgeCaseEmail, setEdgeCaseEmail] = useState<string>("");
  const [workspaceName, setWorkspaceName] = useState("");

  function handleEdgeCase(ec: EdgeCase, email?: string) {
    setEdgeCase(ec);
    if (email) setEdgeCaseEmail(email);
  }

  function dismissEdgeCase() {
    setEdgeCase(null);
    setEdgeCaseEmail("");
  }

  const showProgress = step !== "start" && !edgeCase;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Topbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow group-hover:shadow-amber-400/40 transition-shadow">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Lumi<span className="text-amber-500">Glow</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {step !== "start" && step !== "success" && !edgeCase && (
              <button
                onClick={() => { setStep("start"); setEdgeCase(null); }}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors px-2 py-1"
              >
                <X size={13} /> Exit setup
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-20 pb-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          {/* Step indicator (only shown during steps) */}
          {showProgress && (
            <div className="mb-8">
              <StepIndicator current={step} />
            </div>
          )}

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8">
            {edgeCase === "permission-denied" ? (
              <PermissionDenied email={edgeCaseEmail} onDismiss={dismissEdgeCase} />
            ) : edgeCase === "invite-bounce" ? (
              <InviteBounce email={edgeCaseEmail} onRetry={dismissEdgeCase} onDismiss={dismissEdgeCase} />
            ) : edgeCase === "resume" ? (
              <ResumeState
                onResume={() => { dismissEdgeCase(); setStep("connect-tools"); }}
                onDismiss={() => { dismissEdgeCase(); setStep("create-workspace"); }}
              />
            ) : step === "start" ? (
              <StartHere
                onBegin={() => setStep("create-workspace")}
                onResume={() => handleEdgeCase("resume")}
              />
            ) : step === "create-workspace" ? (
              <CreateWorkspace
                onNext={(name) => { setWorkspaceName(name); setStep("connect-tools"); }}
              />
            ) : step === "connect-tools" ? (
              <ConnectTools
                workspaceName={workspaceName}
                onNext={() => setStep("invite")}
                onSkip={() => setStep("invite")}
              />
            ) : step === "invite" ? (
              <InviteTeammates
                workspaceName={workspaceName}
                onNext={() => setStep("success")}
                onEdgeCase={handleEdgeCase}
              />
            ) : (
              <SuccessState workspaceName={workspaceName} />
            )}
          </div>

          {/* Bottom nav hints */}
          {step !== "start" && step !== "success" && !edgeCase && (
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
              Step {STEPS.findIndex((s) => s.id === step) + 1} of {STEPS.length}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
