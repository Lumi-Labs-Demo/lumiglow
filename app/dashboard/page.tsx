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
  Database, Globe, Link2, AlertCircle, Clock,
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

type Tab = "overview" | "buildings" | "alerts" | "schedules" | "reports" | "settings" | "integrations";

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

// ─── Tableau Integration Data ─────────────────────────────────────────────────

const TABLEAU_DASHBOARDS = [
  { id: "td1", name: "Energy Consumption Overview",  workbook: "Facilities Analytics", views: 1240, lastRefresh: "2 min ago",   status: "live"    },
  { id: "td2", name: "Zone Efficiency Heatmap",       workbook: "Facilities Analytics", views: 876,  lastRefresh: "5 min ago",   status: "live"    },
  { id: "td3", name: "Carbon Footprint Tracker",      workbook: "ESG Reports",          views: 432,  lastRefresh: "1 hour ago",  status: "live"    },
  { id: "td4", name: "Predictive Maintenance Report", workbook: "Operations",           views: 215,  lastRefresh: "6 hours ago", status: "pending" },
];

const TABLEAU_PERM_MAP = [
  { lumiRole: "Facility Manager",  tableauRole: "Explorer",     status: "mapped"   },
  { lumiRole: "Energy Analyst",    tableauRole: "Explorer",     status: "mapped"   },
  { lumiRole: "Admin",             tableauRole: "Site Admin",   status: "mapped"   },
  { lumiRole: "Read-Only Viewer",  tableauRole: "Viewer",       status: "mapped"   },
  { lumiRole: "API Service Acct",  tableauRole: "Unlicensed",   status: "pending"  },
];

const TABLEAU_ACTIVITY = [
  { ts: "Today 12:18",  event: "Dashboard data refreshed",        detail: "4 dashboards",  ok: true  },
  { ts: "Today 08:00",  event: "OAuth token auto-renewed",         detail: "",              ok: true  },
  { ts: "Yesterday",    event: "Permission sync completed",        detail: "18 users",      ok: true  },
  { ts: "May 19",       event: "Embed token expiry – 2 failures",  detail: "2 errors",      ok: false },
];

function TableauLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#E8762D"/>
      <path d="M13 4h2v5h5v2h-5v5h-2v-5H8V9h5V4Z" fill="white"/>
      <path d="M6 14h2v4h4v2H8v4H6v-4H2v-2h4v-4Z" fill="white" opacity=".8"/>
      <path d="M20 14h2v4h4v2h-4v4h-2v-4h-4v-2h4v-4Z" fill="white" opacity=".8"/>
      <path d="M13 19h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3Z" fill="white" opacity=".6"/>
    </svg>
  );
}

// ─── Integrations Tabs Wrapper ────────────────────────────────────────────────

function IntegrationsTabs() {
  const [activeInt, setActiveInt] = useState<"hubspot" | "tableau">("hubspot");
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
        {([
          { id: "hubspot" as const, label: "HubSpot CRM" },
          { id: "tableau" as const, label: "Tableau Cloud" },
        ] as { id: "hubspot" | "tableau"; label: string }[]).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveInt(item.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeInt === item.id
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            {item.id === "tableau" && <span className="inline-flex"><TableauLogo size={14} /></span>}
            {item.label}
          </button>
        ))}
      </div>
      {activeInt === "hubspot" && <IntegrationsPanel />}
      {activeInt === "tableau" && <TableauPanel />}
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
    </div>
  );
}

// ─── Tableau Integration Panel ────────────────────────────────────────────────

function TableauPanel() {
  const [connected, setConnected]         = useState(false);
  const [connecting, setConnecting]       = useState(false);
  const [refreshing, setRefreshing]       = useState(false);
  const [refreshFreq, setRefreshFreq]     = useState("15");
  const [embedEnabled, setEmbedEnabled]   = useState(true);
  const [permSync, setPermSync]           = useState(true);
  const [refreshToast, setRefreshToast]   = useState(false);
  const [activeEmbed, setActiveEmbed]     = useState<string | null>(null);
  const [embedLoading, setEmbedLoading]   = useState(false);

  function handleConnect() {
    setConnecting(true);
    setTimeout(() => { setConnecting(false); setConnected(true); }, 2000);
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshToast(true);
      setTimeout(() => setRefreshToast(false), 2500);
    }, 1800);
  }

  function handleEmbedOpen(id: string) {
    setEmbedLoading(true);
    setActiveEmbed(id);
    setTimeout(() => setEmbedLoading(false), 1400);
  }

  const activeDashboard = TABLEAU_DASHBOARDS.find(d => d.id === activeEmbed);

  return (
    <div className="max-w-2xl space-y-6">

      {/* ── Connection Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            <TableauLogo size={40} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tableau Cloud</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Embed dashboards &amp; sync analytics data</p>
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
              Connect your Tableau Cloud site to embed dashboards directly in LumiGlow.
              You&apos;ll be redirected to Tableau to authorise access via OAuth 2.0.
            </p>
            <ul className="space-y-1.5 mb-4">
              {[
                "Read workbooks & embedded views",
                "Embed dashboards via JavaScript API",
                "Sync data refresh on configurable intervals",
                "Map LumiGlow roles to Tableau permissions",
              ].map(s => (
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
              style={{ background: connecting ? "#94a3b8" : "#E8762D" }}
            >
              {connecting
                ? <><RefreshCw size={14} className="animate-spin" /> Connecting…</>
                : <><Link2 size={14} /> Connect Tableau Cloud</>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-green-100 dark:border-green-500/20 bg-green-50 dark:bg-green-500/5 p-4 flex items-center gap-3">
              <Globe size={15} className="text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">lumiglow.tableau.com</p>
                <p className="text-[11px] text-slate-400 mt-0.5">OAuth 2.0 token active · Expires in 87 days · Site: LumiGlow-Prod</p>
              </div>
              <button
                onClick={() => setConnected(false)}
                className="text-[11px] text-red-500 hover:text-red-400 font-medium shrink-0"
              >
                Disconnect
              </button>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing data…" : "Refresh all dashboards"}
            </button>
          </div>
        )}
      </div>

      {/* ── Embedded Dashboards ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={15} className="text-orange-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Embedded Dashboards</h3>
          {connected && (
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400">
              {TABLEAU_DASHBOARDS.length} dashboards
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          {connected ? "Click any dashboard to preview the embedded view." : "Connect to Tableau Cloud to enable dashboard embedding."}
        </p>

        {!connected ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 p-6 text-center">
            <BarChart3 size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500">No dashboards available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {TABLEAU_DASHBOARDS.map(dash => (
              <button
                key={dash.id}
                onClick={() => handleEmbedOpen(dash.id)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-500/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                  <BarChart3 size={14} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {dash.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{dash.workbook} · {dash.views.toLocaleString()} views</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full mb-0.5",
                    dash.status === "live"
                      ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
                  )}>
                    {dash.status === "live" ? <><CheckCircle2 size={8} /> live</> : <><Clock size={8} /> pending</>}
                  </span>
                  <p className="text-[10px] text-slate-400">{dash.lastRefresh}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Embed preview modal */}
        {activeEmbed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0"><TableauLogo size={28} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{activeDashboard?.name}</p>
                  <p className="text-[11px] text-slate-400">{activeDashboard?.workbook} · lumiglow.tableau.com</p>
                </div>
                <button
                  onClick={() => { setActiveEmbed(null); setEmbedLoading(false); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative bg-slate-50 dark:bg-slate-800/50" style={{ height: 380 }}>
                {embedLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <RefreshCw size={24} className="text-orange-400 animate-spin" />
                    <p className="text-xs text-slate-400">Loading Tableau dashboard…</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="flex-1 p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Live data · Refreshed {activeDashboard?.lastRefresh}</span>
                        </div>
                        <span className="text-[10px] text-orange-500 font-semibold">Tableau Embedded View</span>
                      </div>
                      <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 overflow-hidden">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-3">{activeDashboard?.name}</p>
                        <div className="flex items-end gap-2 h-36">
                          {[65, 82, 54, 91, 70, 88, 45, 76, 93, 60, 78, 85].map((v, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className="w-full rounded-t-sm"
                                style={{
                                  height: `${v}%`,
                                  background: i % 3 === 0 ? "#E8762D" : i % 3 === 1 ? "#f59e0b" : "#94a3b8",
                                  opacity: 0.75 + (i % 4) * 0.07,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-3">
                            {[["#E8762D", "Zone A"], ["#f59e0b", "Zone B"], ["#94a3b8", "Zone C"]].map(([c, l]) => (
                              <div key={l} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-sm" style={{ background: c }} />
                                <span className="text-[10px] text-slate-400">{l}</span>
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400">Last 12 hours</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[["Peak Usage", "891 kWh", "text-red-500"], ["Avg Efficiency", "87.4%", "text-green-500"], ["Cost Savings", "$1,240", "text-orange-500"]].map(([l, v, c]) => (
                          <div key={l} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-center">
                            <p className="text-[10px] text-slate-400 mb-0.5">{l}</p>
                            <p className={cn("text-sm font-bold", c)}>{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <span className="text-[11px] text-slate-400 flex-1">Embedded via Tableau JavaScript API · OAuth 2.0 authenticated</span>
                <button
                  onClick={() => { setActiveEmbed(null); setEmbedLoading(false); }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Data Refresh Settings ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <RefreshCw size={15} className="text-orange-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Data refresh settings</h3>
        </div>
        {[
          { label: "Enable dashboard embedding",  sub: "Render Tableau views inside LumiGlow via JS API", val: embedEnabled, set: setEmbedEnabled },
          { label: "Auto permission sync",        sub: "Map LumiGlow roles to Tableau entitlements",      val: permSync,     set: setPermSync     },
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
          <label className="text-sm text-slate-800 dark:text-slate-200 font-medium block mb-1.5">Data refresh interval</label>
          <select
            value={refreshFreq}
            onChange={e => setRefreshFreq(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="5">Every 5 minutes</option>
            <option value="15">Every 15 minutes</option>
            <option value="60">Every hour</option>
            <option value="360">Every 6 hours</option>
            <option value="1440">Daily</option>
          </select>
        </div>
      </div>

      {/* ── Permission Mapping ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck size={15} className="text-orange-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Permission mapping</h3>
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">Read-only</span>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs min-w-[380px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">LumiGlow role</th>
                <th className="text-center font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1 w-8">→</th>
                <th className="text-left font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">Tableau role</th>
                <th className="text-right font-semibold text-slate-400 dark:text-slate-500 pb-2 px-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {TABLEAU_PERM_MAP.map((m, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0">
                  <td className="py-2.5 px-1 text-slate-700 dark:text-slate-300 font-medium">{m.lumiRole}</td>
                  <td className="py-2.5 px-1 text-center text-slate-300 dark:text-slate-600">→</td>
                  <td className="py-2.5 px-1 text-slate-500 dark:text-slate-400">{m.tableauRole}</td>
                  <td className="py-2.5 px-1 text-right">
                    {m.status === "mapped" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 size={9} /> mapped
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
          <Clock size={15} className="text-orange-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent activity</h3>
        </div>
        <div className="space-y-2">
          {TABLEAU_ACTIVITY.map((l, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              {l.ok
                ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                : <AlertCircle size={13} className="text-red-500 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{l.event}</p>
                {l.detail && <p className="text-[11px] text-slate-400 mt-0.5">{l.detail}</p>}
              </div>
              <p className="text-[11px] text-slate-400 shrink-0">{l.ts}</p>
            </div>
          ))}
        </div>
      </div>

      {refreshToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl">
          <CheckCircle2 size={15} className="text-green-400 shrink-0" />
          All dashboards refreshed!
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
          {tab === "integrations" && <IntegrationsTabs />}

          {/* ── SETTINGS ── */}
          {tab === "settings" && <SettingsPanel branding={branding} onBrandingChange={setBranding} />}

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
