"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Zap, CheckCircle2, ArrowRight, Users, Building2,
  RefreshCw, ShieldOff, Mail, X, ChevronDown, ChevronUp,
  Sparkles, Info, AlertCircle, ArrowLeft, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "resume" | "start" | "workspace" | "invite" | "empty" | "denied" | "success";

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ["Create workspace", "Invite teammates", "Start using LumiGlow"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const done = stepNum < current;
        const active = stepNum === current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2",
              active ? "opacity-100" : done ? "opacity-100" : "opacity-40"
            )}>
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                done ? "bg-green-500 text-white" :
                active ? "bg-amber-500 text-white" :
                "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
              )}>
                {done ? <CheckCircle2 size={14} /> : stepNum}
              </div>
              <span className={cn(
                "text-xs font-medium hidden sm:block",
                active ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
              )}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-px w-6 sm:w-12 mx-1",
                done ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Glossary Callout ─────────────────────────────────────────────────────────

function GlossaryCallout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 text-left"
      >
        <Info size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-sm font-semibold text-amber-800 dark:text-amber-300 flex-1">
          Terminology glossary
        </span>
        {open
          ? <ChevronUp size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          : <ChevronDown size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
        }
      </button>
      {open && (
        <dl className="mt-3 space-y-2 border-t border-amber-200 dark:border-amber-500/30 pt-3">
          {[
            { term: "Workspace", def: "Your organization's dedicated LumiGlow environment — all buildings, zones, and team members live here." },
            { term: "Building", def: "A physical location managed in your workspace, containing one or more lighting zones." },
            { term: "Zone", def: "A grouping of lights within a building (e.g. open floor, conference rooms) that can be controlled together." },
            { term: "Admin", def: "A workspace member with full permissions to configure buildings, manage members, and edit schedules." },
          ].map(({ term, def }) => (
            <div key={term} className="flex gap-2">
              <dt className="text-xs font-bold text-amber-700 dark:text-amber-400 w-20 shrink-0">{term}</dt>
              <dd className="text-xs text-amber-700 dark:text-amber-300">{def}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// ─── Start Step ───────────────────────────────────────────────────────────────

function StartStep({ onNext, onShowEdgeCase }: {
  onNext: () => void;
  onShowEdgeCase: (s: Step) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/30">
          <Zap size={28} className="text-white" fill="white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to LumiGlow</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Let&apos;s set up your workspace in 3 quick steps.
        </p>
      </div>

      <GlossaryCallout />

      {/* What you'll get */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">What you&apos;ll set up</h2>
        {[
          { icon: <Building2 size={16} className="text-sky-500" />, title: "Create your workspace", desc: "A home for all your buildings and lighting zones." },
          { icon: <Users size={16} className="text-violet-500" />, title: "Invite your teammates", desc: "Add colleagues to manage lighting together." },
          { icon: <Sparkles size={16} className="text-amber-500" />, title: "Start saving energy", desc: "Set schedules and watch your savings climb." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30 text-sm"
      >
        Create workspace <ArrowRight size={15} />
      </button>

      {/* Edge case demos */}
      <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Demo: edge-case states
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Refresh / Resume", step: "resume" as Step, icon: <RefreshCw size={12} /> },
            { label: "Empty invite state", step: "empty" as Step, icon: <Mail size={12} /> },
            { label: "Permission denied", step: "denied" as Step, icon: <ShieldOff size={12} /> },
          ].map(({ label, step, icon }) => (
            <button
              key={step}
              onClick={() => onShowEdgeCase(step)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Workspace Step ───────────────────────────────────────────────────────────

function WorkspaceStep({ onNext, onBack }: { onNext: (name: string) => void; onBack: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setTimeout(() => { setSaving(false); onNext(name.trim()); }, 1200);
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
          <ArrowLeft size={13} /> Back
        </button>
        <StepIndicator current={1} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create your workspace</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your workspace is the home for all your buildings and teammates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Workspace name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. ACME Facilities"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              autoFocus
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              This is how your workspace will be identified across LumiGlow.
            </p>
          </div>

          {slug && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Workspace URL (auto-generated)
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80">
                <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">app.lumiglow.io/</span>
                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{slug}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-sky-100 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 p-4 flex gap-3">
          <Info size={15} className="text-sky-500 shrink-0 mt-0.5" />
          <p className="text-xs text-sky-700 dark:text-sky-300">
            You&apos;ll be the <strong>admin</strong> of this workspace. Admins can add buildings, manage members, and configure schedules.
          </p>
        </div>

        <button
          type="submit"
          disabled={!name.trim() || saving}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all text-sm",
            name.trim() && !saving
              ? "bg-amber-500 hover:bg-amber-400 text-white shadow-sm hover:shadow-amber-400/30"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          )}
        >
          {saving ? <><Loader2 size={15} className="animate-spin" /> Creating workspace…</> : <>Continue <ArrowRight size={15} /></>}
        </button>
      </form>
    </div>
  );
}

// ─── Invite Step ──────────────────────────────────────────────────────────────

function InviteStep({ workspaceName, onNext, onSkip, onBack }: {
  workspaceName: string;
  onNext: (emails: string[]) => void;
  onSkip: () => void;
  onBack: () => void;
}) {
  const [emails, setEmails] = useState(["", "", ""]);
  const [sending, setSending] = useState(false);

  const validEmails = emails.filter(e => e.trim() && e.includes("@"));

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (validEmails.length === 0) return;
    setSending(true);
    setTimeout(() => { setSending(false); onNext(validEmails); }, 1400);
  }

  return (
    <div className="space-y-6">
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
          <ArrowLeft size={13} /> Back
        </button>
        <StepIndicator current={2} />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invite teammates</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Collaborate on <strong className="text-slate-700 dark:text-slate-300">{workspaceName}</strong> by inviting your team.
        </p>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Invite by email</span>
          </div>
          {emails.map((email, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmails(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                placeholder={`colleague${i + 1}@company.com`}
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all"
              />
              {email && (
                <button
                  type="button"
                  onClick={() => setEmails(prev => prev.map((v, j) => j === i ? "" : v))}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          ))}

          <div className="pt-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
              Role for all invitees
            </label>
            <select className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all">
              <option value="member">Member — can view and control zones</option>
              <option value="admin">Admin — full workspace access</option>
              <option value="viewer">Viewer — read-only access</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={validEmails.length === 0 || sending}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 font-semibold rounded-xl transition-all text-sm",
              validEmails.length > 0 && !sending
                ? "bg-amber-500 hover:bg-amber-400 text-white shadow-sm hover:shadow-amber-400/30"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
            )}
          >
            {sending
              ? <><Loader2 size={15} className="animate-spin" /> Sending invites…</>
              : <><Mail size={15} /> Send {validEmails.length > 0 ? `${validEmails.length} invite${validEmails.length > 1 ? "s" : ""}` : "invites"}</>
            }
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="px-5 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Skip
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Success Step ─────────────────────────────────────────────────────────────

function SuccessStep({ workspaceName, inviteCount, onDashboard }: {
  workspaceName: string;
  inviteCount: number;
  onDashboard: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace ready!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          <strong className="text-slate-700 dark:text-slate-300">{workspaceName}</strong> is all set.{" "}
          {inviteCount > 0 && `${inviteCount} invite${inviteCount > 1 ? "s" : ""} sent.`}
        </p>
      </div>

      <StepIndicator current={4} />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm text-left space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">What&apos;s next?</h3>
        {[
          { icon: <Building2 size={16} className="text-sky-500" />, title: "Add your first building", desc: "Register a building to start managing lighting zones." },
          { icon: <Users size={16} className="text-violet-500" />, title: "Invite more teammates", desc: "You can always add more members from Settings → Workspace." },
          { icon: <Sparkles size={16} className="text-amber-500" />, title: "Set a lighting schedule", desc: "Automate on/off times to start saving energy today." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onDashboard}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30 text-sm"
      >
        Go to dashboard <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ─── Edge Case: Resume State ──────────────────────────────────────────────────

function ResumeStep({ workspaceName, onResume, onRestart }: {
  workspaceName?: string;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
          <RefreshCw size={28} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Looks like your workspace setup was interrupted. Pick up right where you left off.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{workspaceName || "ACME Facilities"}</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">Setup in progress — step 2 of 3</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: "Create workspace", done: true },
            { label: "Invite teammates", done: false, active: true },
            { label: "Start using LumiGlow", done: false },
          ].map(({ label, done, active }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                done ? "bg-green-500" : active ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
              )}>
                {done
                  ? <CheckCircle2 size={12} className="text-white" />
                  : active
                    ? <span className="w-2 h-2 rounded-full bg-white" />
                    : null
                }
              </div>
              <span className={cn(
                "text-xs font-medium",
                done ? "text-green-700 dark:text-green-400" :
                active ? "text-amber-700 dark:text-amber-300 font-semibold" :
                "text-slate-400 dark:text-slate-500"
              )}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onResume}
          className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30 text-sm"
        >
          <RefreshCw size={15} /> Resume setup
        </button>
        <button
          onClick={onRestart}
          className="w-full py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

// ─── Edge Case: Empty Invite State ────────────────────────────────────────────

function EmptyInviteStep({ workspaceName, onContinue, onGoBack }: {
  workspaceName: string;
  onContinue: () => void;
  onGoBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <button onClick={onGoBack} className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
          <ArrowLeft size={13} /> Back to invites
        </button>
        <StepIndicator current={2} />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-10 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <Users size={24} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">No teammates yet</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          Your workspace <strong className="text-slate-700 dark:text-slate-300">{workspaceName}</strong> has no other members yet. That&apos;s okay — you can invite teammates any time from <span className="font-semibold text-amber-600 dark:text-amber-400">Settings → Workspace → Members</span>.
        </p>
      </div>

      <div className="rounded-xl border border-sky-100 dark:border-sky-500/20 bg-sky-50 dark:bg-sky-500/10 p-4 flex gap-3">
        <Info size={15} className="text-sky-500 shrink-0 mt-0.5" />
        <p className="text-xs text-sky-700 dark:text-sky-300">
          Invites can be sent to <strong>individual email addresses</strong> or an entire domain (e.g. <code className="bg-sky-100 dark:bg-sky-500/20 px-1 rounded">@acme.com</code>). Invitees will receive a link to join your workspace.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-amber-400/30 text-sm"
      >
        Continue anyway <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ─── Edge Case: Permission Denied ─────────────────────────────────────────────

function DeniedStep({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <ShieldOff size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Only workspace <strong className="text-slate-700 dark:text-slate-300">admins</strong> can complete setup.
        </p>
      </div>

      <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-5 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">You don&apos;t have admin permissions</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              Your account is a <strong>member</strong> in this workspace. Completing the initial workspace setup requires admin privileges.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">How to get access</h3>
        {[
          { step: "1", text: "Contact your workspace admin and ask them to grant you admin role." },
          { step: "2", text: "Or ask them to complete the workspace setup on your behalf." },
          { step: "3", text: "Once you have admin access, return here and resume setup." },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">
              {step}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back to start
        </button>
        <a
          href="mailto:admin@company.com"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl transition-all text-sm"
        >
          <Mail size={14} /> Email admin
        </a>
      </div>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialState = searchParams.get("state") as Step | null;

  const [step, setStep] = useState<Step>(initialState || "start");
  const [workspaceName, setWorkspaceName] = useState("ACME Facilities");
  const [inviteCount, setInviteCount] = useState(0);

  return (
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
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard"
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
          >
            Skip to dashboard →
          </Link>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-slate-950/50 p-8">

            {step === "start" && (
              <StartStep
                onNext={() => setStep("workspace")}
                onShowEdgeCase={setStep}
              />
            )}

            {step === "workspace" && (
              <WorkspaceStep
                onNext={(name) => { setWorkspaceName(name); setStep("invite"); }}
                onBack={() => setStep("start")}
              />
            )}

            {step === "invite" && (
              <InviteStep
                workspaceName={workspaceName}
                onNext={(emails) => { setInviteCount(emails.length); setStep("success"); }}
                onSkip={() => setStep("empty")}
                onBack={() => setStep("workspace")}
              />
            )}

            {step === "empty" && (
              <EmptyInviteStep
                workspaceName={workspaceName}
                onContinue={() => setStep("success")}
                onGoBack={() => setStep("invite")}
              />
            )}

            {step === "denied" && (
              <DeniedStep onBack={() => setStep("start")} />
            )}

            {step === "resume" && (
              <ResumeStep
                workspaceName={workspaceName}
                onResume={() => setStep("invite")}
                onRestart={() => { setWorkspaceName("ACME Facilities"); setStep("start"); }}
              />
            )}

            {step === "success" && (
              <SuccessStep
                workspaceName={workspaceName}
                inviteCount={inviteCount}
                onDashboard={() => router.push("/dashboard")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
