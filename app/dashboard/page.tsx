"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Zap, LayoutDashboard, Building2, Bell, Calendar,
  BarChart3, Settings, LogOut, ChevronRight, Sun, Moon,
  AlertTriangle, Info, CheckCircle2, X, SlidersHorizontal,
  TrendingDown, Activity, Users, ShieldCheck, Search,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Menu,
  Palette, Upload, Eye, Plug, RefreshCw, ArrowLeftRight,
  Database, Globe, Link2, AlertCircle, Clock, ClipboardCheck,
  Circle, CheckCircle, XCircle, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import {
  buildings as initialBuildings,
  alerts as initialAlerts,
  energyData,
  Building,
  Zone,
  Alert,
} from "@/lib/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "overview" | "buildings" | "alerts" | "schedules" | "reports" | "settings" | "integrations" | "qa";

interface BrandingConfig {
  companyName: string;
  tagline: string;
  accentColor: string;
  logoUrl: string;
  logoInitials: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function totalWatts(blds: Building[]) {
  return blds.flatMap(b => b.floors).flatMap(f => f.zones).reduce((s, z) => s + z.powerWatts, 0);
}

function totalZones(blds: Building[]) {
  return blds.flatMap(b => b.floors).flatMap(f => f.zones).length;
}

function zonesOn(blds: Building[]) {
  return blds.flatMap(b => b.floors).flatMap(f => f.zones).filter(z => z.isOn).length;
}

// ─── Energy Chart (pure SVG) ──────────────────────────────────────────────────

function EnergyChart() {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 700, H = 200, padL = 40, padR = 16, padT = 16, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxY = Math.max(...energyData.map(d => Math.max(d.kWh, d.baseline))) * 1.15;

  const xStep = chartW / (energyData.length - 1);

  function px(i: number) { return padL + i * xStep; }
  function py(v: number) { return padT + chartH - (v / maxY) * chartH; }

  const kwhPath = energyData.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.kWh).toFixed(1)}`).join(" ");
  const basePath = energyData.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.baseline).toFixed(1)}`).join(" ");

  const fillPath = kwhPath + ` L${px(energyData.length - 1).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL},${(padT + chartH).toFixed(1)} Z`;

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: 320, maxHeight: 220 }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="kwhGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = padT + chartH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" className="text-slate-500" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.4" className="text-slate-500">
                {(maxY * t).toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Baseline */}
        <path d={basePath} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* kWh fill */}
        <path d={fillPath} fill="url(#kwhGrad)" />

        {/* kWh line */}
        <path d={kwhPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* X labels */}
        {energyData.map((d, i) => (
          i % 2 === 0 && (
            <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.45" className="text-slate-500">
              {d.hour}
            </text>
          )
        ))}

        {/* Hover areas */}
        {energyData.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)}>
            <rect
              x={px(i) - xStep / 2}
              y={padT}
              width={xStep}
              height={chartH}
              fill="transparent"
            />
            {hovered === i && (
              <>
                <line x1={px(i)} y1={padT} x2={px(i)} y2={padT + chartH} stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5" />
                <circle cx={px(i)} cy={py(d.kWh)} r="4" fill="#f59e0b" stroke="white" strokeWidth="1.5" />
                <circle cx={px(i)} cy={py(d.baseline)} r="3" fill="#94a3b8" stroke="white" strokeWidth="1.5" />
                {/* Tooltip */}
                <rect
                  x={Math.min(px(i) - 38, W - padR - 80)}
                  y={py(d.kWh) - 46}
                  width={78}
                  height={42}
                  rx="5"
                  fill="#1e293b"
                  fillOpacity="0.95"
                />
                <text x={Math.min(px(i) - 38, W - padR - 80) + 7} y={py(d.kWh) - 32} fontSize="10" fill="#f59e0b" fontWeight="600">{d.hour}</text>
                <text x={Math.min(px(i) - 38, W - padR - 80) + 7} y={py(d.kWh) - 19} fontSize="9" fill="white">{`Usage: ${d.kWh} kWh`}</text>
                <text x={Math.min(px(i) - 38, W - padR - 80) + 7} y={py(d.kWh) - 8} fontSize="9" fill="#94a3b8">{`Baseline: ${d.baseline} kWh`}</text>
              </>
            )}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-1 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-amber-400 rounded" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Actual usage</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 border-t border-dashed border-slate-400" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Baseline</span>
        </div>
      </div>
    </div>
  );
}

// ─── Zone Row ─────────────────────────────────────────────────────────────────

function ZoneRow({ zone, onToggle, onBrightness }: {
  zone: Zone;
  onToggle: (id: string) => void;
  onBrightness: (id: string, v: number) => void;
}) {
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
      zone.isOn
        ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/20"
        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50"
    )}>
      {/* Toggle */}
      <button
        onClick={() => onToggle(zone.id)}
        className={cn("shrink-0 transition-colors", zone.isOn ? "text-amber-500" : "text-slate-400 dark:text-slate-600")}
        aria-label={zone.isOn ? "Turn off" : "Turn on"}
      >
        {zone.isOn ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
      </button>

      {/* Name & meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold truncate", zone.isOn ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500")}>
            {zone.name}
          </span>
          <span className={cn(
            "shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
            zone.schedule === "auto" ? "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400" :
            zone.schedule === "manual" ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400" :
            "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
          )}>
            {zone.schedule}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
          {zone.lastChangedBy} · {zone.lastChangedAt}
        </p>
      </div>

      {/* Brightness */}
      <div className="hidden sm:flex items-center gap-2 w-32 shrink-0">
        <Sun size={12} className={cn("shrink-0", zone.isOn ? "text-amber-400" : "text-slate-300 dark:text-slate-600")} />
        <input
          type="range"
          min={0}
          max={100}
          value={zone.brightness}
          disabled={!zone.isOn}
          onChange={e => onBrightness(zone.id, Number(e.target.value))}
          className={cn("flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-amber-400", !zone.isOn && "opacity-30 cursor-not-allowed")}
        />
        <span className={cn("text-[11px] w-7 text-right font-mono", zone.isOn ? "text-slate-600 dark:text-slate-400" : "text-slate-300 dark:text-slate-600")}>
          {zone.brightness}%
        </span>
      </div>

      {/* Watts */}
      <div className="shrink-0 text-right">
        <span className={cn("text-sm font-bold tabular-nums", zone.isOn ? "text-slate-800 dark:text-slate-200" : "text-slate-300 dark:text-slate-600")}>
          {zone.powerWatts}W
        </span>
      </div>
    </div>
  );
}

// ─── Alert Badge ──────────────────────────────────────────────────────────────

function AlertBadge({ severity }: { severity: Alert["severity"] }) {
  if (severity === "critical") return <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/15 px-2 py-0.5 rounded-full"><AlertTriangle size={10} />critical</span>;
  if (severity === "warning")  return <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-full"><AlertTriangle size={10} />warning</span>;
  return <span className="flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/15 px-2 py-0.5 rounded-full"><Info size={10} />info</span>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, accent }: {
  label: string; value: string; sub: string; icon: React.ReactNode; accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", accent)}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Schedule data ────────────────────────────────────────────────────────────

const schedules = [
  { id: "s1", name: "Business Hours",  scope: "All buildings", time: "Mon–Fri  8:00 – 19:00",  mode: "auto",    active: true  },
  { id: "s2", name: "Weekend Dimmed",  scope: "HQ Tower",      time: "Sat–Sun  9:00 – 18:00",  mode: "auto",    active: true  },
  { id: "s3", name: "Holiday Blackout",scope: "All buildings", time: "Public holidays",         mode: "holiday", active: false },
  { id: "s4", name: "Late Night Min",  scope: "EMEA Office",   time: "Daily  22:00 – 06:00",    mode: "auto",    active: true  },
  { id: "s5", name: "Demo Suite Boost",scope: "West Campus",   time: "Mon–Fri  09:00 – 17:00",  mode: "manual",  active: true  },
];

// ─── Report data ──────────────────────────────────────────────────────────────

const reports = [
  { id: "r1", name: "Weekly Energy Summary",  scope: "All buildings", generated: "Today 06:00",   size: "142 KB" },
  { id: "r2", name: "Monthly ESG Report",     scope: "All buildings", generated: "May 1, 2025",   size: "1.2 MB" },
  { id: "r3", name: "Audit Log Export",       scope: "HQ Tower",      generated: "Apr 30, 2025",  size: "88 KB"  },
  { id: "r4", name: "Zone Uptime Report",     scope: "West Campus",   generated: "Apr 28, 2025",  size: "56 KB"  },
  { id: "r5", name: "Firmware Inventory",     scope: "All buildings", generated: "Apr 25, 2025",  size: "34 KB"  },
];

// ─── Settings Panel ───────────────────────────────────────────────────────────

function SettingsPanel({
  branding,
  onBrandingChange,
}: {
  branding: BrandingConfig;
  onBrandingChange: (b: BrandingConfig) => void;
}) {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSlack, setNotifSlack] = useState(true);
  const [notifPager, setNotifPager] = useState(false);
  const [autoPolicy, setAutoPolicy] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [saved, setSaved] = useState(false);

  const [draft, setDraft] = useState<BrandingConfig>(branding);
  const [brandingSaved, setBrandingSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function applyBranding() {
    onBrandingChange(draft);
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 2500);
  }

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDraft(d => ({ ...d, logoUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  const accentStyle = { backgroundColor: draft.accentColor };
  const accentText = { color: draft.accentColor };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Profile</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-lg font-bold shadow">JD</div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Jordan Davis</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">jordan@acme.com · Facility Manager</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Full name</label>
            <input defaultValue="Jordan Davis" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Email</label>
            <input defaultValue="jordan@acme.com" className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Notifications</h3>
        {[
          { label: "Email alerts",       sub: "Critical & warning events",    val: notifEmail, set: setNotifEmail },
          { label: "Slack integration",  sub: "#facilities-alerts channel",   val: notifSlack, set: setNotifSlack },
          { label: "PagerDuty",          sub: "Critical-only escalation",     val: notifPager, set: setNotifPager },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{row.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{row.sub}</p>
            </div>
            <button onClick={() => row.set(!row.val)} className={cn("transition-colors", row.val ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
              {row.val ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        ))}
      </div>

      {/* Automation */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Automation</h3>
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Auto-apply schedule policies</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">System adjusts brightness automatically</p>
          </div>
          <button onClick={() => setAutoPolicy(!autoPolicy)} className={cn("transition-colors", autoPolicy ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
            {autoPolicy ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Security</h3>
        <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Two-factor authentication</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">TOTP via authenticator app</p>
          </div>
          <button onClick={() => setTwoFA(!twoFA)} className={cn("transition-colors", twoFA ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
            {twoFA ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>
        <div className="py-3">
          <label className="text-sm text-slate-800 dark:text-slate-200 font-medium block mb-1">Session timeout (minutes)</label>
          <select
            value={sessionTimeout}
            onChange={e => setSessionTimeout(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {["15", "30", "60", "120", "480"].map(v => <option key={v} value={v}>{v} min</option>)}
          </select>
        </div>
      </div>

      {/* Custom Branding */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Palette size={16} style={accentText} />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Custom Branding</h3>
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">Enterprise</span>
        </div>

        {/* Company name + tagline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Company name</label>
            <input
              value={draft.companyName}
              onChange={e => setDraft(d => ({ ...d, companyName: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="ACME Corp"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Logo initials (fallback)</label>
            <input
              value={draft.logoInitials}
              onChange={e => setDraft(d => ({ ...d, logoInitials: e.target.value.slice(0, 3) }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="AC"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Tagline</label>
            <input
              value={draft.tagline}
              onChange={e => setDraft(d => ({ ...d, tagline: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Smart Lighting Console · ACME Corp"
            />
          </div>
        </div>

        {/* Accent color */}
        <div className="mb-4">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Primary accent color</label>
          <div className="flex items-center gap-3 flex-wrap">
            {["#f59e0b", "#6366f1", "#10b981", "#ef4444", "#3b82f6", "#ec4899", "#8b5cf6", "#0ea5e9"].map(color => (
              <button
                key={color}
                onClick={() => setDraft(d => ({ ...d, accentColor: color }))}
                style={{ backgroundColor: color }}
                className={cn(
                  "w-7 h-7 rounded-full transition-transform hover:scale-110 border-2",
                  draft.accentColor === color ? "border-white dark:border-slate-900 scale-110 shadow-md" : "border-transparent"
                )}
              />
            ))}
            <div className="flex items-center gap-2 ml-1">
              <input
                type="color"
                value={draft.accentColor}
                onChange={e => setDraft(d => ({ ...d, accentColor: e.target.value }))}
                className="w-7 h-7 rounded cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Custom color"
              />
              <span className="text-xs text-slate-400 font-mono">{draft.accentColor}</span>
            </div>
          </div>
        </div>

        {/* Logo upload */}
        <div className="mb-5">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Logo (PNG or SVG)</label>
          <div className="flex items-center gap-3">
            {draft.logoUrl ? (
              <div className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow"
                style={accentStyle}
              >
                {draft.logoInitials || "?"}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload size={12} /> Upload logo
              </button>
              {draft.logoUrl && (
                <button
                  onClick={() => setDraft(d => ({ ...d, logoUrl: "" }))}
                  className="text-xs text-red-500 hover:text-red-400 font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoFile}
            />
          </div>
        </div>

        {/* Live preview */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Eye size={12} className="text-slate-400" />
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sidebar preview</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 w-48">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              {draft.logoUrl ? (
                <div className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={draft.logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow"
                  style={accentStyle}
                >
                  {draft.logoInitials || "?"}
                </div>
              )}
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{draft.companyName || "Your Brand"}</span>
            </div>
            {["Dashboard", "Buildings", "Settings"].map((item, i) => (
              <div
                key={item}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium mb-0.5",
                  i === 0 ? "text-white" : "text-slate-500 dark:text-slate-400"
                )}
                style={i === 0 ? accentStyle : {}}
              >
                <div className="w-3 h-3 rounded bg-current opacity-60" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={applyBranding}
          className={cn(
            "px-5 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center gap-2",
            brandingSaved ? "bg-green-500 text-white" : "text-white shadow"
          )}
          style={brandingSaved ? {} : accentStyle}
        >
          {brandingSaved ? <><CheckCircle2 size={15} /> Branding applied!</> : <><Palette size={15} /> Apply branding</>}
        </button>
      </div>

      <button
        onClick={save}
        className={cn(
          "px-6 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center gap-2",
          saved ? "bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-white shadow hover:shadow-amber-400/30"
        )}
      >
        {saved ? <><CheckCircle2 size={15} /> Saved!</> : "Save changes"}
      </button>
    </div>
  );
}

// ─── Intercom Integration Card ───────────────────────────────────────────────

const INTERCOM_CONV_MAPPINGS = [
  { source: "Conversation ID",      target: "LumiGlow Ticket ID",        status: "synced"  },
  { source: "User Email",           target: "Contact Email",              status: "synced"  },
  { source: "Conversation Body",    target: "Ticket Description",         status: "synced"  },
  { source: "Assignee",             target: "Assigned Agent",             status: "synced"  },
  { source: "Conversation State",   target: "Ticket Status",              status: "pending" },
  { source: "Tags",                 target: "Ticket Labels",              status: "pending" },
];

const INTERCOM_SYNC_LOG = [
  { ts: "Today 13:22",  event: "Conversation import completed",   count: "87 conversations", ok: true  },
  { ts: "Today 09:00",  event: "Contact attributes synced",       count: "214 contacts",     ok: true  },
  { ts: "Yesterday",    event: "OAuth token refreshed",           count: "",                 ok: true  },
  { ts: "May 17",       event: "Webhook delivery – retry",        count: "3 retries",        ok: false },
];

function IntercomIntegrationCard() {
  const [icConnected, setIcConnected]           = useState(false);
  const [icConnecting, setIcConnecting]         = useState(false);
  const [icSyncConvs, setIcSyncConvs]           = useState(true);
  const [icSyncContacts, setIcSyncContacts]     = useState(true);
  const [icWebhook, setIcWebhook]               = useState(false);
  const [icSyncFreq, setIcSyncFreq]             = useState("15");
  const [icSyncing, setIcSyncing]               = useState(false);
  const [icSyncToast, setIcSyncToast]           = useState(false);

  function handleIcConnect() {
    setIcConnecting(true);
    setTimeout(() => { setIcConnecting(false); setIcConnected(true); }, 1800);
  }

  function handleIcSync() {
    setIcSyncing(true);
    setTimeout(() => { setIcSyncing(false); setIcSyncToast(true); setTimeout(() => setIcSyncToast(false), 2500); }, 2000);
  }

  return (
    <div className="space-y-6">
      {/* ── Connection Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#1F8DED" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.97.57 3.804 1.555 5.348L2.25 21l3.75-1.281A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Zm0 14.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 7.5 12 7.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5Z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Intercom</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Sync conversations &amp; customer support context</p>
          </div>
          {icConnected ? (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={11} /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <AlertCircle size={11} /> Not connected
            </span>
          )}
        </div>

        {!icConnected ? (
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 mb-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Connect your Intercom workspace to surface customer conversations directly in LumiGlow.
              You&apos;ll be redirected to Intercom to authorise access via OAuth 2.0.
            </p>
            <ul className="space-y-1.5 mb-4">
              {[
                "Read & import Intercom conversations",
                "Sync contact attributes & tags",
                "Receive webhook events in real time",
              ].map(s => (
                <li key={s} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
            <button
              onClick={handleIcConnect}
              disabled={icConnecting}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-70"
              style={{ background: icConnecting ? "#94a3b8" : "#1F8DED" }}
            >
              {icConnecting ? <><RefreshCw size={14} className="animate-spin" /> Connecting…</> : <><Link2 size={14} /> Connect Intercom</>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 p-4 flex items-center gap-3">
              <Globe size={15} className="text-blue-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">acme-corp.intercom.com</p>
                <p className="text-[11px] text-slate-400 mt-0.5">OAuth token active · Workspace ID ic_w8x92</p>
              </div>
              <button
                onClick={() => setIcConnected(false)}
                className="text-[11px] text-red-500 hover:text-red-400 font-medium shrink-0"
              >
                Disconnect
              </button>
            </div>
            <button
              onClick={handleIcSync}
              disabled={icSyncing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={13} className={icSyncing ? "animate-spin" : ""} />
              {icSyncing ? "Syncing…" : "Sync now"}
            </button>
          </div>
        )}
      </div>

      {/* ── Sync Settings ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <ArrowLeftRight size={15} className="text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sync settings</h3>
        </div>
        {[
          { label: "Conversation sync",  sub: "Import Intercom conversations as LumiGlow support tickets",  val: icSyncConvs,    set: setIcSyncConvs    },
          { label: "Contact sync",       sub: "Pull Intercom contact attributes into customer profiles",     val: icSyncContacts,  set: setIcSyncContacts  },
          { label: "Webhook events",     sub: "Receive real-time updates when conversations change state",   val: icWebhook,       set: setIcWebhook       },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{row.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{row.sub}</p>
            </div>
            <button
              onClick={() => row.set(!row.val)}
              className={cn("transition-colors shrink-0 ml-4", row.val ? "text-blue-500" : "text-slate-300 dark:text-slate-600")}
            >
              {row.val ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        ))}
        <div className="pt-4">
          <label className="text-sm text-slate-800 dark:text-slate-200 font-medium block mb-1.5">Sync frequency</label>
          <select
            value={icSyncFreq}
            onChange={e => setIcSyncFreq(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="5">Every 5 minutes</option>
            <option value="15">Every 15 minutes</option>
            <option value="60">Every hour</option>
            <option value="360">Every 6 hours</option>
            <option value="1440">Daily</option>
          </select>
        </div>
      </div>

      {/* ── Field Mapping ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Database size={15} className="text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Field mapping</h3>
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">Read-only</span>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs min-w-[400px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">Intercom field</th>
                <th className="text-center font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1 w-8">→</th>
                <th className="text-left font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">LumiGlow field</th>
                <th className="text-right font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {INTERCOM_CONV_MAPPINGS.map((m, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                  <td className="py-2.5 px-1 text-slate-700 dark:text-slate-300 font-medium">{m.source}</td>
                  <td className="py-2.5 px-1 text-center text-slate-300 dark:text-slate-600">→</td>
                  <td className="py-2.5 px-1 text-slate-500 dark:text-slate-400">{m.target}</td>
                  <td className="py-2.5 px-1 text-right">
                    {m.status === "synced" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 size={9} /> synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-1.5 py-0.5 rounded-full">
                        <Clock size={9} /> pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Activity Log ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-blue-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent activity</h3>
        </div>
        <div className="space-y-2">
          {INTERCOM_SYNC_LOG.map((l, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              {l.ok
                ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                : <AlertCircle size={13} className="text-red-500 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{l.event}</p>
                {l.count && <p className="text-[11px] text-slate-400 mt-0.5">{l.count}</p>}
              </div>
              <p className="text-[11px] text-slate-400 shrink-0">{l.ts}</p>
            </div>
          ))}
        </div>
      </div>

      {icSyncToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl">
          <CheckCircle2 size={15} className="text-green-400 shrink-0" />
          Intercom sync triggered successfully!
        </div>
      )}
    </div>
  );
}

// ─── HubSpot Integration Panel ───────────────────────────────────────────────

const FIELD_MAPPINGS = [
  { source: "Zendesk Ticket ID",       target: "HubSpot Note ID",              status: "synced"  },
  { source: "Ticket Subject",          target: "Note Title",                   status: "synced"  },
  { source: "Ticket Body",             target: "Note Body",                    status: "synced"  },
  { source: "Requester Email",         target: "Contact Email",                status: "synced"  },
  { source: "Ticket Status",           target: "Activity Status",              status: "pending" },
  { source: "HubSpot Contact Name",    target: "Zendesk Requester Name",       status: "synced"  },
  { source: "HubSpot Lifecycle Stage", target: "Zendesk Custom Field",         status: "pending" },
];

const SYNC_LOG = [
  { ts: "Today 12:04",  event: "Contact sync completed",        count: "142 records", ok: true  },
  { ts: "Today 08:00",  event: "Ticket batch sent to HubSpot",  count: "38 tickets",  ok: true  },
  { ts: "Yesterday",    event: "OAuth token refreshed",         count: "",            ok: true  },
  { ts: "May 16",       event: "Ticket sync – partial failure", count: "2 errors",    ok: false },
];

function IntegrationsPanel() {
  const [activeInteg, setActiveInteg]     = useState<"hubspot" | "intercom">("hubspot");
  const [connected, setConnected]         = useState(false);
  const [connecting, setConnecting]       = useState(false);
  const [syncContacts, setSyncContacts]   = useState(true);
  const [syncTickets, setSyncTickets]     = useState(true);
  const [syncFreq, setSyncFreq]           = useState("15");
  const [syncing, setSyncing]             = useState(false);
  const [syncToast, setSyncToast]         = useState(false);

  function handleConnect() {
    setConnecting(true);
    setTimeout(() => { setConnecting(false); setConnected(true); }, 1800);
  }

  function handleSync() {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setSyncToast(true); setTimeout(() => setSyncToast(false), 2500); }, 2000);
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Integration Tabs ── */}
      <div className="flex gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 w-fit">
        {([
          { id: "hubspot",  label: "HubSpot",  dot: "#ff7a59" },
          { id: "intercom", label: "Intercom", dot: "#1F8DED" },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setActiveInteg(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all",
              activeInteg === t.id
                ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }} />
            {t.label}
          </button>
        ))}
      </div>

      {activeInteg === "intercom" && <IntercomIntegrationCard />}
      {activeInteg === "hubspot" && <>

      {/* ── Connection Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#ff7a59" }}>
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.164 7.93V5.48a1.71 1.71 0 0 0 .987-1.543V3.9a1.712 1.712 0 0 0-3.424 0v.037a1.71 1.71 0 0 0 .987 1.543v2.45a4.86 4.86 0 0 0-2.31.898L8.29 4.61a1.9 1.9 0 1 0-.878.94l5.964 3.733a4.87 4.87 0 0 0-.734 2.591 4.874 4.874 0 0 0 .848 2.757l-1.813 1.813a1.56 1.56 0 0 0-.453-.073 1.573 1.573 0 1 0 1.573 1.573 1.556 1.556 0 0 0-.073-.453l1.79-1.79a4.9 4.9 0 1 0 3.65-7.771Zm0 7.8a2.574 2.574 0 1 1 0-5.148 2.574 2.574 0 0 1 0 5.148Z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">HubSpot CRM</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Sync contacts &amp; support tickets</p>
          </div>
          {connected ? (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={11} /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <AlertCircle size={11} /> Not connected
            </span>
          )}
        </div>

        {!connected ? (
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 mb-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Connect your HubSpot workspace to enable two-way sync of contacts and support tickets.
              You&apos;ll be redirected to HubSpot to authorise access via OAuth 2.0.
            </p>
            <ul className="space-y-1.5 mb-4">
              {["Read & write CRM contacts", "Create notes/activities from tickets", "Read contact lifecycle stage"].map(s => (
                <li key={s} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-70"
              style={{ background: connecting ? "#94a3b8" : "#ff7a59" }}
            >
              {connecting ? <><RefreshCw size={14} className="animate-spin" /> Connecting…</> : <><Link2 size={14} /> Connect HubSpot</>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-green-100 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5 p-4 flex items-center gap-3">
              <Globe size={15} className="text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">acme-corp.hubspot.com</p>
                <p className="text-[11px] text-slate-400 mt-0.5">OAuth token active · Expires in 58 days</p>
              </div>
              <button
                onClick={() => setConnected(false)}
                className="text-[11px] text-red-500 hover:text-red-400 font-medium shrink-0"
              >
                Disconnect
              </button>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          </div>
        )}
      </div>

      {/* ── Sync Settings ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <ArrowLeftRight size={15} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sync settings</h3>
        </div>
        {[
          { label: "Contact sync",     sub: "Pull HubSpot contacts into Zendesk requester profiles", val: syncContacts, set: setSyncContacts },
          { label: "Ticket → HubSpot", sub: "Push Zendesk tickets as notes/activities on contacts",  val: syncTickets,  set: setSyncTickets  },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{row.label}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{row.sub}</p>
            </div>
            <button
              onClick={() => row.set(!row.val)}
              className={cn("transition-colors shrink-0 ml-4", row.val ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}
            >
              {row.val ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        ))}
        <div className="pt-4">
          <label className="text-sm text-slate-800 dark:text-slate-200 font-medium block mb-1.5">Sync frequency</label>
          <select
            value={syncFreq}
            onChange={e => setSyncFreq(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="5">Every 5 minutes</option>
            <option value="15">Every 15 minutes</option>
            <option value="60">Every hour</option>
            <option value="360">Every 6 hours</option>
            <option value="1440">Daily</option>
          </select>
        </div>
      </div>

      {/* ── Field Mapping ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Database size={15} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Field mapping</h3>
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">Read-only</span>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs min-w-[400px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">Source field</th>
                <th className="text-center font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1 w-8">→</th>
                <th className="text-left font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">Target field</th>
                <th className="text-right font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {FIELD_MAPPINGS.map((m, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                  <td className="py-2.5 px-1 text-slate-700 dark:text-slate-300 font-medium">{m.source}</td>
                  <td className="py-2.5 px-1 text-center text-slate-300 dark:text-slate-600">→</td>
                  <td className="py-2.5 px-1 text-slate-500 dark:text-slate-400">{m.target}</td>
                  <td className="py-2.5 px-1 text-right">
                    {m.status === "synced" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 size={9} /> synced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-1.5 py-0.5 rounded-full">
                        <Clock size={9} /> pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sync Activity Log ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent activity</h3>
        </div>
        <div className="space-y-2">
          {SYNC_LOG.map((l, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              {l.ok
                ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                : <AlertCircle size={13} className="text-red-500 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{l.event}</p>
                {l.count && <p className="text-[11px] text-slate-400 mt-0.5">{l.count}</p>}
              </div>
              <p className="text-[11px] text-slate-400 shrink-0">{l.ts}</p>
            </div>
          ))}
        </div>
      </div>

      {syncToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl">
          <CheckCircle2 size={15} className="text-green-400 shrink-0" />
          Sync triggered successfully!
        </div>
      )}
      </>}
    </div>
  );
}

// ─── Dark Mode QA Checklist ───────────────────────────────────────────────────

type CheckStatus = "pending" | "pass" | "fail";

interface QAItem {
  id: string;
  area: string;
  check: string;
  status: CheckStatus;
  notes: string;
}

const INITIAL_QA_ITEMS: QAItem[] = [
  { id: "q01", area: "Sidebar", check: "Background uses dark surface color (slate-900)", status: "pending", notes: "" },
  { id: "q02", area: "Sidebar", check: "Nav items show correct hover state in dark mode", status: "pending", notes: "" },
  { id: "q03", area: "Sidebar", check: "Active nav item accent color is legible on dark background", status: "pending", notes: "" },
  { id: "q04", area: "Sidebar", check: "Logo / initials badge renders correctly in dark mode", status: "pending", notes: "" },
  { id: "q05", area: "Sidebar", check: "User footer border and avatar are visible in dark mode", status: "pending", notes: "" },
  { id: "q06", area: "Top Bar", check: "Header background is dark (slate-900), not white", status: "pending", notes: "" },
  { id: "q07", area: "Top Bar", check: "Search bar uses dark input style", status: "pending", notes: "" },
  { id: "q08", area: "Top Bar", check: "Theme toggle dropdown has correct dark background", status: "pending", notes: "" },
  { id: "q09", area: "Top Bar", check: "Notification bell icon and badge are visible", status: "pending", notes: "" },
  { id: "q10", area: "KPI Cards", check: "Card backgrounds switch to dark surface (slate-900)", status: "pending", notes: "" },
  { id: "q11", area: "KPI Cards", check: "Icon accent chip adapts to dark opacity variant", status: "pending", notes: "" },
  { id: "q12", area: "KPI Cards", check: "Primary value text is white/light in dark mode", status: "pending", notes: "" },
  { id: "q13", area: "KPI Cards", check: "Sub-label text is muted but legible (slate-400/500)", status: "pending", notes: "" },
  { id: "q14", area: "Energy Chart", check: "Chart container background is dark", status: "pending", notes: "" },
  { id: "q15", area: "Energy Chart", check: "SVG grid lines use low-opacity light color", status: "pending", notes: "" },
  { id: "q16", area: "Energy Chart", check: "Axis labels are readable against dark background", status: "pending", notes: "" },
  { id: "q17", area: "Energy Chart", check: "Hover tooltip uses dark background (not white)", status: "pending", notes: "" },
  { id: "q18", area: "Alerts", check: "Critical alert row uses dark-variant red background", status: "pending", notes: "" },
  { id: "q19", area: "Alerts", check: "Warning alert row uses dark-variant amber background", status: "pending", notes: "" },
  { id: "q20", area: "Alerts", check: "Info alert row uses dark-variant sky background", status: "pending", notes: "" },
  { id: "q21", area: "Alerts", check: "Badge text colors remain accessible in dark mode", status: "pending", notes: "" },
  { id: "q22", area: "Zone Controls", check: "Active zone row uses amber dark variant", status: "pending", notes: "" },
  { id: "q23", area: "Zone Controls", check: "Inactive zone row uses slate dark variant", status: "pending", notes: "" },
  { id: "q24", area: "Zone Controls", check: "Range slider is visible against dark background", status: "pending", notes: "" },
  { id: "q25", area: "Zone Controls", check: "Toggle icons change color correctly when active/inactive in dark mode", status: "pending", notes: "" },
  { id: "q26", area: "Forms & Inputs", check: "Text inputs use dark bg (slate-800) with light text", status: "pending", notes: "" },
  { id: "q27", area: "Forms & Inputs", check: "Select dropdowns use dark bg and border", status: "pending", notes: "" },
  { id: "q28", area: "Forms & Inputs", check: "Input focus ring is visible in dark mode", status: "pending", notes: "" },
  { id: "q29", area: "Forms & Inputs", check: "Labels above inputs are legible (slate-400)", status: "pending", notes: "" },
  { id: "q30", area: "Integrations", check: "Tab switcher pill background is correct dark shade", status: "pending", notes: "" },
  { id: "q31", area: "Integrations", check: "'Connected' and 'Not connected' badges render in dark mode", status: "pending", notes: "" },
  { id: "q32", area: "Integrations", check: "Field mapping table rows alternate correctly in dark", status: "pending", notes: "" },
  { id: "q33", area: "Integrations", check: "Activity log rows use dark-variant background", status: "pending", notes: "" },
  { id: "q34", area: "Settings", check: "All settings card backgrounds are dark", status: "pending", notes: "" },
  { id: "q35", area: "Settings", check: "Toggle rows show correct border color in dark mode", status: "pending", notes: "" },
  { id: "q36", area: "Settings", check: "Branding preview sidebar renders in dark context", status: "pending", notes: "" },
  { id: "q37", area: "Toasts & Overlays", check: "Toast notification uses correct dark background", status: "pending", notes: "" },
  { id: "q38", area: "Toasts & Overlays", check: "Mobile sidebar overlay (dark scrim) is sufficient", status: "pending", notes: "" },
  { id: "q39", area: "Global", check: "Page background switches to slate-950 in dark mode", status: "pending", notes: "" },
  { id: "q40", area: "Global", check: "Scrollbars (where visible) are not stark white", status: "pending", notes: "" },
];

const QA_AREAS = [...new Set(INITIAL_QA_ITEMS.map(i => i.area))];

function DarkModeQAPanel() {
  const [items, setItems] = useState<QAItem[]>(INITIAL_QA_ITEMS);
  const [filterArea, setFilterArea] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<CheckStatus | "all">("all");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);

  function setStatus(id: string, status: CheckStatus) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  function saveNote(id: string) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes: noteDraft } : i));
    setEditingNote(null);
    setNoteDraft("");
  }

  function resetAll() {
    setItems(INITIAL_QA_ITEMS);
    setResetConfirm(false);
  }

  const displayed = items
    .filter(i => filterArea === "All" || i.area === filterArea)
    .filter(i => filterStatus === "all" || i.status === filterStatus);

  const passCount = items.filter(i => i.status === "pass").length;
  const failCount = items.filter(i => i.status === "fail").length;
  const pendingCount = items.filter(i => i.status === "pending").length;
  const total = items.length;
  const progress = Math.round((passCount / total) * 100);

  const areaGroups = QA_AREAS
    .filter(a => filterArea === "All" || a === filterArea)
    .map(area => ({
      area,
      items: displayed.filter(i => i.area === area),
    }))
    .filter(g => g.items.length > 0);

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck size={17} className="text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode QA Checklist</h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
                Synced from Asana
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify dark mode appearance across all dashboard components. Switch to dark mode using the theme toggle in the header, then work through these checks.
            </p>
          </div>
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors shrink-0"
          >
            <RotateCcw size={12} /> Reset all
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{progress}% complete</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold"><CheckCircle size={11} /> {passCount} pass</span>
              <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-semibold"><XCircle size={11} /> {failCount} fail</span>
              <span className="flex items-center gap-1 text-slate-400 font-semibold"><Circle size={11} /> {pendingCount} pending</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: progress === 100 ? "#22c55e" : failCount > 0 ? "#f59e0b" : "#10b981",
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 flex-wrap">
          {["All", ...QA_AREAS].map(a => (
            <button
              key={a}
              onClick={() => setFilterArea(a)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                filterArea === a
                  ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 ml-auto">
          {(["all", "pending", "pass", "fail"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all",
                filterStatus === s
                  ? "bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Checklist groups */}
      {areaGroups.length === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
          <p className="text-sm text-slate-400">No items match the current filter.</p>
        </div>
      )}

      {areaGroups.map(({ area, items: groupItems }) => (
        <div key={area} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{area}</span>
            <span className="ml-auto text-[11px] text-slate-400">
              {groupItems.filter(i => i.status === "pass").length}/{groupItems.length} passed
            </span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {groupItems.map(item => (
              <div key={item.id} className="px-5 py-3.5">
                <div className="flex items-start gap-3">
                  {/* Status buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <button
                      onClick={() => setStatus(item.id, item.status === "pass" ? "pending" : "pass")}
                      aria-label="Mark pass"
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all border",
                        item.status === "pass"
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-green-400 hover:text-green-500"
                      )}
                    >
                      <CheckCircle2 size={13} />
                    </button>
                    <button
                      onClick={() => setStatus(item.id, item.status === "fail" ? "pending" : "fail")}
                      aria-label="Mark fail"
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all border",
                        item.status === "fail"
                          ? "bg-red-500 border-red-500 text-white"
                          : "border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 hover:border-red-400 hover:text-red-500"
                      )}
                    >
                      <X size={11} />
                    </button>
                  </div>

                  {/* Check text */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs font-medium",
                      item.status === "pass" ? "text-slate-400 dark:text-slate-500 line-through" :
                      item.status === "fail" ? "text-red-600 dark:text-red-400" :
                      "text-slate-700 dark:text-slate-300"
                    )}>
                      {item.check}
                    </p>
                    {editingNote === item.id ? (
                      <div className="mt-2 flex gap-2">
                        <input
                          autoFocus
                          value={noteDraft}
                          onChange={e => setNoteDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveNote(item.id); if (e.key === "Escape") setEditingNote(null); }}
                          placeholder="Add a note…"
                          className="flex-1 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <button onClick={() => saveNote(item.id)} className="text-xs font-semibold text-amber-500 hover:text-amber-400">Save</button>
                        <button onClick={() => setEditingNote(null)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingNote(item.id); setNoteDraft(item.notes); }}
                        className="mt-1 text-[11px] text-slate-400 hover:text-amber-500 transition-colors font-medium"
                      >
                        {item.notes ? `📝 ${item.notes}` : "+ Add note"}
                      </button>
                    )}
                  </div>

                  {/* Status pill */}
                  <span className={cn(
                    "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5",
                    item.status === "pass" ? "bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400" :
                    item.status === "fail" ? "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400" :
                    "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Reset confirm modal */}
      {resetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-2xl w-80">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Reset checklist?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">This will clear all statuses and notes. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={resetAll} className="flex-1 py-2 text-sm font-semibold rounded-xl bg-red-500 hover:bg-red-400 text-white transition-colors">Reset</button>
              <button onClick={() => setResetConfirm(false)} className="flex-1 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const DEFAULT_BRANDING: BrandingConfig = {
  companyName: "LumiGlow",
  tagline: "Smart Lighting Console · ACME Corp",
  accentColor: "#f59e0b",
  logoUrl: "",
  logoInitials: "LG",
};

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [buildings, setBuildings] = useState(initialBuildings);
  const [alertList, setAlertList] = useState(initialAlerts);
  const [expandedBuildings, setExpandedBuildings] = useState<string[]>(["b1"]);
  const [searchQ, setSearchQ] = useState("");
  const [scheduleActive, setScheduleActive] = useState<Record<string, boolean>>(
    Object.fromEntries(schedules.map(s => [s.id, s.active]))
  );
  const [reportToast, setReportToast] = useState<string | null>(null);
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);

  // Zone interactions
  const toggleZone = useCallback((zoneId: string) => {
    setBuildings(prev => prev.map(b => ({
      ...b,
      floors: b.floors.map(f => ({
        ...f,
        zones: f.zones.map(z =>
          z.id === zoneId
            ? { ...z, isOn: !z.isOn, powerWatts: z.isOn ? 0 : Math.round(100 + Math.random() * 400), brightness: z.isOn ? 0 : 75 }
            : z
        ),
      })),
    })));
  }, []);

  const setBrightness = useCallback((zoneId: string, val: number) => {
    setBuildings(prev => prev.map(b => ({
      ...b,
      floors: b.floors.map(f => ({
        ...f,
        zones: f.zones.map(z =>
          z.id === zoneId
            ? { ...z, brightness: val, powerWatts: z.isOn ? Math.round((val / 100) * 800) : 0 }
            : z
        ),
      })),
    })));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlertList(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleBuildingExpand = useCallback((id: string) => {
    setExpandedBuildings(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  // Derived stats
  const watts = totalWatts(buildings);
  const kwhEst = ((watts / 1000) * 8).toFixed(1);
  const savings = 31;

  const navItems: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview",     label: "Overview",     icon: <LayoutDashboard size={17} /> },
    { id: "buildings",    label: "Buildings",    icon: <Building2 size={17} /> },
    { id: "alerts",       label: "Alerts",       icon: <Bell size={17} />, badge: alertList.filter(a => a.severity !== "info").length },
    { id: "schedules",    label: "Schedules",    icon: <Calendar size={17} /> },
    { id: "reports",      label: "Reports",      icon: <BarChart3 size={17} /> },
    { id: "integrations", label: "Integrations", icon: <Plug size={17} /> },
    { id: "settings",     label: "Settings",     icon: <Settings size={17} /> },
    { id: "qa",           label: "Dark Mode QA", icon: <ClipboardCheck size={17} /> },
  ];

  const filteredZones = buildings
    .flatMap(b => b.floors.flatMap(f => f.zones.map(z => ({ ...z, buildingName: b.name, floorName: f.name }))))
    .filter(z =>
      searchQ === "" ||
      z.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      z.buildingName.toLowerCase().includes(searchQ.toLowerCase())
    );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200",
        "md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {branding.logoUrl ? (
            <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={branding.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow shrink-0"
              style={{ background: `linear-gradient(135deg, ${branding.accentColor}cc, ${branding.accentColor})` }}
            >
              <span className="text-white text-[11px] font-bold">{branding.logoInitials}</span>
            </div>
          )}
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {branding.companyName}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 text-left",
                tab === item.id
                  ? "text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
              style={tab === item.id ? { backgroundColor: branding.accentColor } : {}}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Jordan Davis</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Facility Manager</p>
            </div>
            <Link href="/" aria-label="Sign out" className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 px-4 sm:px-6 shrink-0 z-20">
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{tab}</h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
              {branding.tagline}
            </p>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 w-48">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Search zones…"
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none w-full"
            />
          </div>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notification bell */}
          <button
            onClick={() => setTab("alerts")}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Bell size={17} />
            {alertList.some(a => a.severity === "critical") && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                  label="Buildings online"
                  value={String(buildings.length)}
                  sub="All systems normal"
                  icon={<Building2 size={18} className="text-sky-600 dark:text-sky-400" />}
                  accent="bg-sky-100 dark:bg-sky-500/20"
                />
                <KpiCard
                  label="Zones active"
                  value={`${zonesOn(buildings)} / ${totalZones(buildings)}`}
                  sub="Across all floors"
                  icon={<Zap size={18} className="text-amber-600 dark:text-amber-400" />}
                  accent="bg-amber-100 dark:bg-amber-500/20"
                />
                <KpiCard
                  label="Live power draw"
                  value={`${(watts / 1000).toFixed(1)} kW`}
                  sub={`~${kwhEst} kWh est. today`}
                  icon={<Activity size={18} className="text-violet-600 dark:text-violet-400" />}
                  accent="bg-violet-100 dark:bg-violet-500/20"
                />
                <KpiCard
                  label="Energy savings"
                  value={`${savings}%`}
                  sub="vs. last-year baseline"
                  icon={<TrendingDown size={18} className="text-green-600 dark:text-green-400" />}
                  accent="bg-green-100 dark:bg-green-500/20"
                />
              </div>

              {/* Chart */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Energy usage today</h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">All buildings · kWh per hour</p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-2.5 py-1 rounded-full">
                    ↓ {savings}% vs baseline
                  </span>
                </div>
                <EnergyChart />
              </div>

              {/* Alerts preview & buildings summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent alerts */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent alerts</h2>
                    <button onClick={() => setTab("alerts")} className="text-xs text-amber-500 hover:text-amber-400 font-semibold">
                      View all →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {alertList.slice(0, 4).map(a => (
                      <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <AlertBadge severity={a.severity} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">{a.message}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{a.zone} · {a.ts}</p>
                        </div>
                      </div>
                    ))}
                    {alertList.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">All clear 🎉</p>
                    )}
                  </div>
                </div>

                {/* Buildings summary */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Buildings</h2>
                    <button onClick={() => setTab("buildings")} className="text-xs text-amber-500 hover:text-amber-400 font-semibold">
                      Manage →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {buildings.map(b => {
                      const bZones = b.floors.flatMap(f => f.zones);
                      const on = bZones.filter(z => z.isOn).length;
                      const bWatts = bZones.reduce((s, z) => s + z.powerWatts, 0);
                      return (
                        <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Building2 size={15} className="text-slate-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{b.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{b.location}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{on}/{bZones.length} on</p>
                            <p className="text-[11px] text-slate-400">{(bWatts / 1000).toFixed(1)} kW</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── BUILDINGS ── */}
          {tab === "buildings" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {buildings.length} buildings · {totalZones(buildings)} zones · {zonesOn(buildings)} on
                </h2>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 ml-auto">
                  <Search size={12} className="text-slate-400 shrink-0" />
                  <input
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Search zones…"
                    className="bg-transparent text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400 outline-none w-36"
                  />
                  {searchQ && (
                    <button onClick={() => setSearchQ("")} className="text-slate-400 hover:text-slate-600">
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>

              {searchQ ? (
                <div className="space-y-2">
                  {filteredZones.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8">No zones match "{searchQ}"</p>
                  )}
                  {filteredZones.map(z => (
                    <div key={z.id}>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1 px-1">{z.buildingName} · {z.floorName}</p>
                      <ZoneRow zone={z} onToggle={toggleZone} onBrightness={setBrightness} />
                    </div>
                  ))}
                </div>
              ) : (
                buildings.map(b => {
                  const isExp = expandedBuildings.includes(b.id);
                  const bZones = b.floors.flatMap(f => f.zones);
                  const on = bZones.filter(z => z.isOn).length;
                  const bWatts = bZones.reduce((s, z) => s + z.powerWatts, 0);
                  return (
                    <div key={b.id} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                      <button
                        onClick={() => toggleBuildingExpand(b.id)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <Building2 size={18} className="text-amber-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {b.location} · {b.floors.length} floor{b.floors.length > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{on}/{bZones.length} zones on</p>
                          <p className="text-[11px] text-slate-400">{(bWatts / 1000).toFixed(1)} kW live</p>
                        </div>
                        {isExp
                          ? <ChevronUp size={16} className="text-slate-400 shrink-0" />
                          : <ChevronDown size={16} className="text-slate-400 shrink-0" />
                        }
                      </button>

                      {isExp && (
                        <div className="border-t border-slate-100 dark:border-slate-800 px-5 pb-4 space-y-4 pt-3">
                          {b.floors.map(f => (
                            <div key={f.id}>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                {f.name}
                              </p>
                              <div className="space-y-2">
                                {f.zones.map(z => (
                                  <ZoneRow key={z.id} zone={z} onToggle={toggleZone} onBrightness={setBrightness} />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── ALERTS ── */}
          {tab === "alerts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {alertList.length} active alert{alertList.length !== 1 ? "s" : ""}
                </h2>
                {alertList.length > 0 && (
                  <button
                    onClick={() => setAlertList([])}
                    className="text-xs text-slate-500 hover:text-red-500 font-medium transition-colors"
                  >
                    Dismiss all
                  </button>
                )}
              </div>

              {alertList.length === 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
                  <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">All clear!</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No active alerts across your portfolio.</p>
                </div>
              )}

              {(["critical", "warning", "info"] as Alert["severity"][]).map(sev => {
                const group = alertList.filter(a => a.severity === sev);
                if (group.length === 0) return null;
                return (
                  <div key={sev}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
                      {sev === "critical" ? "🔴" : sev === "warning" ? "🟡" : "🔵"} {sev}
                    </p>
                    <div className="space-y-2">
                      {group.map(a => (
                        <div key={a.id} className={cn(
                          "flex items-start gap-4 p-4 rounded-2xl border shadow-sm",
                          a.severity === "critical" ? "bg-red-50 dark:bg-red-500/5 border-red-200/60 dark:border-red-500/20" :
                          a.severity === "warning"  ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/20" :
                          "bg-sky-50 dark:bg-sky-500/5 border-sky-200/60 dark:border-sky-500/20"
                        )}>
                          <AlertBadge severity={a.severity} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.message}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.zone} · {a.ts}</p>
                          </div>
                          <button
                            onClick={() => dismissAlert(a.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                            aria-label="Dismiss"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── SCHEDULES ── */}
          {tab === "schedules" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{schedules.length} lighting schedules</h2>
              <div className="space-y-2">
                {schedules.map(s => (
                  <div key={s.id} className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border shadow-sm bg-white dark:bg-slate-900 transition-all",
                    scheduleActive[s.id] ? "border-slate-200 dark:border-slate-700/60" : "opacity-60 border-slate-100 dark:border-slate-800"
                  )}>
                    <Calendar size={16} className={scheduleActive[s.id] ? "text-amber-500 shrink-0" : "text-slate-300 dark:text-slate-600 shrink-0"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{s.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.scope} · {s.time}</p>
                    </div>
                    <span className={cn(
                      "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      s.mode === "auto"    ? "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400" :
                      s.mode === "manual"  ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400" :
                      "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                    )}>{s.mode}</span>
                    <button
                      onClick={() => setScheduleActive(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                      className={cn("shrink-0 transition-colors", scheduleActive[s.id] ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}
                    >
                      {scheduleActive[s.id] ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === "reports" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Generated reports</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Avg daily kWh", value: "82.4", icon: <Activity size={14} className="text-amber-500" /> },
                  { label: "Monthly savings", value: "$4,210", icon: <TrendingDown size={14} className="text-green-500" /> },
                  { label: "CO₂ offset",      value: "2.1 t",  icon: <ShieldCheck size={14} className="text-sky-500" /> },
                  { label: "Zones managed",   value: String(totalZones(buildings)), icon: <Users size={14} className="text-violet-500" /> },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-3 shadow-sm flex items-center gap-2.5">
                    <div className="shrink-0">{s.icon}</div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{s.label}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-5 py-3">Report</th>
                      <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 hidden sm:table-cell">Scope</th>
                      <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 hidden md:table-cell">Generated</th>
                      <th className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-3 py-3 hidden md:table-cell">Size</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, i) => (
                      <tr key={r.id} className={cn(
                        "border-b border-slate-50 dark:border-slate-800/80 last:border-0",
                        i % 2 !== 0 && "bg-slate-50/50 dark:bg-slate-800/20"
                      )}>
                        <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{r.name}</td>
                        <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">{r.scope}</td>
                        <td className="px-3 py-3 text-xs text-slate-400 hidden md:table-cell">{r.generated}</td>
                        <td className="px-3 py-3 text-xs text-slate-400 hidden md:table-cell">{r.size}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => {
                              setReportToast(`Downloading "${r.name}"…`);
                              setTimeout(() => setReportToast(null), 2500);
                            }}
                            className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {tab === "integrations" && <IntegrationsPanel />}

          {/* ── SETTINGS ── */}
          {tab === "settings" && <SettingsPanel branding={branding} onBrandingChange={setBranding} />}

          {/* ── DARK MODE QA ── */}
          {tab === "qa" && <DarkModeQAPanel />}

        </main>
      </div>

      {/* Toast */}
      {reportToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl animate-fade-in">
          <CheckCircle2 size={15} className="text-green-400 shrink-0" />
          {reportToast}
          <button onClick={() => setReportToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
