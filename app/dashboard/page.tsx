"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Zap, LayoutDashboard, Building2, Bell, Calendar,
  BarChart3, Settings, LogOut, ChevronRight, Sun, Moon,
  AlertTriangle, Info, CheckCircle2, X, SlidersHorizontal,
  TrendingDown, Activity, Users, ShieldCheck, Search,
  ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Menu,
  Database, Plus, Plug, RefreshCw, Play, ChevronRight as ChevRight,
  Table2, Eye, Layers, Link2, Lock, Unlock, Trash2, TestTube2,
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

function SettingsPanel() {
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSlack, setNotifSlack] = useState(true);
  const [notifPager, setNotifPager] = useState(false);
  const [autoPolicy, setAutoPolicy] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

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

// ─── Snowflake Integration Panel ─────────────────────────────────────────────

type ConnStatus = "connected" | "disconnected" | "testing";

interface SnowflakeConn {
  id: string;
  name: string;
  account: string;
  warehouse: string;
  database: string;
  schema: string;
  status: ConnStatus;
  lastSync: string;
  rowsQueried: number;
}

const MOCK_SCHEMA = {
  ANALYTICS_DB: {
    PUBLIC: ["ENERGY_READINGS", "ZONE_METRICS", "BUILDING_SUMMARY", "ALERT_LOG"],
    REPORTING: ["MONTHLY_ROLLUP", "ESG_METRICS", "COST_ANALYSIS"],
  },
  OPERATIONAL_DB: {
    FACILITIES: ["MAINTENANCE_LOG", "DEVICE_INVENTORY", "SENSOR_DATA"],
  },
};

const MOCK_QUERY_RESULTS = {
  columns: ["ZONE_ID", "BUILDING", "KWH_TODAY", "AVG_BRIGHTNESS", "STATUS"],
  rows: [
    ["Z-HQ-01", "HQ Tower",    "42.3", "78%", "ACTIVE"],
    ["Z-HQ-02", "HQ Tower",    "38.1", "65%", "ACTIVE"],
    ["Z-WC-01", "West Campus", "29.7", "82%", "ACTIVE"],
    ["Z-WC-02", "West Campus", "0.0",  "0%",  "OFF"],
    ["Z-EM-01", "EMEA Office", "51.2", "90%", "ACTIVE"],
    ["Z-EM-02", "EMEA Office", "44.6", "75%", "ACTIVE"],
  ],
};

function IntegrationsPanel() {
  const [connections, setConnections] = useState<SnowflakeConn[]>([
    {
      id: "pg-1",
      name: "PostgreSQL (Primary)",
      account: "pg.acme.internal",
      warehouse: "—",
      database: "lumiglow_prod",
      schema: "public",
      status: "connected",
      lastSync: "2 min ago",
      rowsQueried: 1_482_903,
    },
    {
      id: "bq-1",
      name: "BigQuery (Analytics)",
      account: "acme-analytics.bigquery",
      warehouse: "—",
      database: "lumiglow_bq",
      schema: "reporting",
      status: "connected",
      lastSync: "12 min ago",
      rowsQueried: 8_201_440,
    },
  ]);

  // Wizard states
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthDone, setOauthDone] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [connForm, setConnForm] = useState({
    name: "Snowflake (Analytics DW)",
    account: "acme.us-east-1.snowflakecomputing.com",
    warehouse: "COMPUTE_WH",
    database: "ANALYTICS_DB",
    schema: "PUBLIC",
  });

  // Schema explorer
  const [selectedConn, setSelectedConn] = useState<string | null>(null);
  const [expandedDb, setExpandedDb] = useState<string[]>(["ANALYTICS_DB"]);
  const [expandedSchema, setExpandedSchema] = useState<string[]>(["ANALYTICS_DB__PUBLIC"]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  // Query runner
  const [queryText, setQueryText] = useState(
    "SELECT zone_id, building, kwh_today, avg_brightness, status\nFROM ANALYTICS_DB.PUBLIC.ZONE_METRICS\nLIMIT 6;"
  );
  const [queryRunning, setQueryRunning] = useState(false);
  const [queryResult, setQueryResult] = useState<typeof MOCK_QUERY_RESULTS | null>(null);
  const [queryTime, setQueryTime] = useState<number | null>(null);

  const snowflakeConn = connections.find(c => c.id === "sf-1");

  function handleOAuth() {
    setOauthLoading(true);
    setTimeout(() => { setOauthLoading(false); setOauthDone(true); }, 2200);
  }

  function finishWizard() {
    const newConn: SnowflakeConn = {
      id: "sf-1",
      name: connForm.name,
      account: connForm.account,
      warehouse: connForm.warehouse,
      database: connForm.database,
      schema: connForm.schema,
      status: "connected",
      lastSync: "Just now",
      rowsQueried: 0,
    };
    setConnections(prev => [...prev, newConn]);
    setShowWizard(false);
    setWizardStep(1);
    setOauthDone(false);
    setSelectedConn("sf-1");
  }

  function testConnection(id: string) {
    setTestingId(id);
    setConnections(prev => prev.map(c => c.id === id ? { ...c, status: "testing" } : c));
    setTimeout(() => {
      setConnections(prev => prev.map(c => c.id === id ? { ...c, status: "connected", lastSync: "Just now" } : c));
      setTestingId(null);
    }, 1800);
  }

  function removeConn(id: string) {
    setConnections(prev => prev.filter(c => c.id !== id));
    if (selectedConn === id) setSelectedConn(null);
  }

  function runQuery() {
    setQueryRunning(true);
    setQueryResult(null);
    const start = Date.now();
    setTimeout(() => {
      setQueryResult(MOCK_QUERY_RESULTS);
      setQueryTime(Date.now() - start);
      setQueryRunning(false);
      setConnections(prev => prev.map(c =>
        c.id === "sf-1" ? { ...c, rowsQueried: c.rowsQueried + 6, lastSync: "Just now" } : c
      ));
    }, 1400);
  }

  const connTypeIcon = (id: string) => {
    if (id.startsWith("pg")) return <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">PG</div>;
    if (id.startsWith("bq")) return <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center text-[10px] font-bold text-yellow-600 dark:text-yellow-400">BQ</div>;
    return <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-600 dark:text-cyan-400">SF</div>;
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Data Integrations</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Connect external data sources to LumiGlow</p>
        </div>
        {!snowflakeConn && (
          <button
            onClick={() => { setShowWizard(true); setWizardStep(1); setOauthDone(false); }}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow"
          >
            <Plus size={14} /> Connect Snowflake
          </button>
        )}
      </div>

      {/* Connection cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {connections.map(conn => (
          <div
            key={conn.id}
            onClick={() => conn.id === "sf-1" && setSelectedConn(conn.id === selectedConn ? null : conn.id)}
            className={cn(
              "rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition-all",
              conn.id === "sf-1" ? "cursor-pointer hover:shadow-md" : "",
              selectedConn === conn.id
                ? "border-cyan-400 dark:border-cyan-500 ring-1 ring-cyan-400/30"
                : "border-slate-200 dark:border-slate-700/60"
            )}
          >
            <div className="flex items-start gap-3">
              {connTypeIcon(conn.id)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{conn.name}</span>
                  <span className={cn(
                    "shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                    conn.status === "connected" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" :
                    conn.status === "testing"   ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                    "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                  )}>
                    {conn.status === "testing" ? "testing…" : conn.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{conn.account}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 dark:text-slate-500">Database</span>
                <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{conn.database}</p>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500">Last sync</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">{conn.lastSync}</p>
              </div>
              {conn.warehouse !== "—" && (
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Warehouse</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{conn.warehouse}</p>
                </div>
              )}
              <div>
                <span className="text-slate-400 dark:text-slate-500">Rows queried</span>
                <p className="font-medium text-slate-700 dark:text-slate-300">{conn.rowsQueried.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={e => { e.stopPropagation(); testConnection(conn.id); }}
                disabled={conn.status === "testing"}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw size={11} className={conn.status === "testing" ? "animate-spin" : ""} /> Test
              </button>
              {conn.id === "sf-1" && (
                <button
                  onClick={e => { e.stopPropagation(); setSelectedConn(selectedConn === conn.id ? null : conn.id); }}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-1.5 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-500/20 transition-colors"
                >
                  <Eye size={11} /> Explore
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={e => { e.stopPropagation(); removeConn(conn.id); }}
                className="text-slate-300 dark:text-slate-700 hover:text-red-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {/* Add new connector placeholder */}
        {!snowflakeConn && (
          <button
            onClick={() => { setShowWizard(true); setWizardStep(1); setOauthDone(false); }}
            className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-transparent p-5 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600 hover:border-cyan-400 dark:hover:border-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-all min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="text-xs font-semibold">Connect Snowflake</span>
          </button>
        )}
      </div>

      {/* Snowflake schema explorer + query runner */}
      {selectedConn === "sf-1" && snowflakeConn && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Schema browser */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Layers size={13} className="text-cyan-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Schema Browser</span>
              <span className="ml-auto text-[10px] text-slate-400">{snowflakeConn.account.split(".")[0]}</span>
            </div>
            <div className="p-2 overflow-y-auto max-h-80 text-xs">
              {Object.entries(MOCK_SCHEMA).map(([db, schemas]) => (
                <div key={db}>
                  <button
                    onClick={() => setExpandedDb(prev => prev.includes(db) ? prev.filter(x => x !== db) : [...prev, db])}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <Database size={11} className="text-cyan-500 shrink-0" />
                    <span className="flex-1 truncate">{db}</span>
                    {expandedDb.includes(db) ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                  </button>
                  {expandedDb.includes(db) && Object.entries(schemas).map(([schema, tables]) => {
                    const key = `${db}__${schema}`;
                    return (
                      <div key={schema} className="ml-4">
                        <button
                          onClick={() => setExpandedSchema(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-slate-500 dark:text-slate-400"
                        >
                          <Layers size={10} className="shrink-0" />
                          <span className="flex-1 truncate">{schema}</span>
                          {expandedSchema.includes(key) ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                        {expandedSchema.includes(key) && tables.map(table => (
                          <button
                            key={table}
                            onClick={() => {
                              setSelectedTable(table);
                              setQueryText(`SELECT *\nFROM ${db}.${schema}.${table}\nLIMIT 100;`);
                            }}
                            className={cn(
                              "w-full flex items-center gap-1.5 ml-4 px-2 py-1.5 rounded-lg text-left transition-colors",
                              selectedTable === table
                                ? "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                            )}
                          >
                            <Table2 size={10} className="shrink-0" />
                            <span className="truncate">{table}</span>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Query runner */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Play size={13} className="text-cyan-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Query Runner</span>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-green-600 dark:text-green-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> {snowflakeConn.warehouse}
              </span>
            </div>

            {/* Editor */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <textarea
                value={queryText}
                onChange={e => setQueryText(e.target.value)}
                rows={4}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                placeholder="SELECT * FROM ..."
                spellCheck={false}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-slate-400">
                  {queryResult && queryTime !== null
                    ? `${queryResult.rows.length} rows · ${queryTime} ms`
                    : "Run a query against Snowflake"}
                </span>
                <button
                  onClick={runQuery}
                  disabled={queryRunning}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {queryRunning
                    ? <><RefreshCw size={12} className="animate-spin" /> Running…</>
                    : <><Play size={12} /> Run Query</>}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-auto">
              {!queryResult && !queryRunning && (
                <div className="flex flex-col items-center justify-center h-32 text-slate-300 dark:text-slate-700 gap-2">
                  <Database size={28} />
                  <span className="text-xs">No results yet — run a query above</span>
                </div>
              )}
              {queryRunning && (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <RefreshCw size={20} className="text-cyan-500 animate-spin" />
                  <span className="text-xs text-slate-400">Streaming results from Snowflake…</span>
                </div>
              )}
              {queryResult && !queryRunning && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                        {queryResult.columns.map(col => (
                          <th key={col} className="px-4 py-2 text-left font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          {row.map((cell, j) => (
                            <td key={j} className={cn(
                              "px-4 py-2 whitespace-nowrap font-mono",
                              cell === "ACTIVE" ? "text-green-600 dark:text-green-400 font-semibold" :
                              cell === "OFF"    ? "text-slate-400" :
                              "text-slate-700 dark:text-slate-300"
                            )}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Connect Snowflake Wizard ── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Wizard header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Database size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Connect Snowflake</p>
                  <p className="text-white/70 text-xs">Step {wizardStep} of 3</p>
                </div>
                <button onClick={() => setShowWizard(false)} className="ml-auto text-white/60 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${(wizardStep / 3) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-6">
              {/* Step 1: Account config */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Connection details</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Connection name", key: "name", placeholder: "e.g. Snowflake (Analytics DW)" },
                      { label: "Account locator", key: "account", placeholder: "e.g. xyz12345.us-east-1" },
                      { label: "Warehouse", key: "warehouse", placeholder: "e.g. COMPUTE_WH" },
                      { label: "Default database", key: "database", placeholder: "e.g. ANALYTICS_DB" },
                      { label: "Default schema", key: "schema", placeholder: "e.g. PUBLIC" },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">{field.label}</label>
                        <input
                          value={connForm[field.key as keyof typeof connForm]}
                          onChange={e => setConnForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setWizardStep(2)}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors mt-2"
                  >
                    Next: Authenticate →
                  </button>
                </div>
              )}

              {/* Step 2: OAuth */}
              {wizardStep === 2 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">OAuth2 Authentication</h3>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                      <Lock size={12} className="text-cyan-500" /> OAuth2 with PKCE
                    </div>
                    <p>LumiGlow will request read-only access to your Snowflake account using the OAuth 2.0 Authorization Code flow with PKCE. No credentials are stored in plain text.</p>
                    <p className="text-slate-400">Scopes: <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">session:role:LUMIGLOW_READER</code></p>
                  </div>

                  {!oauthDone ? (
                    <button
                      onClick={handleOAuth}
                      disabled={oauthLoading}
                      className="w-full flex items-center justify-center gap-2 bg-[#29B5E8] hover:bg-[#22a4d4] disabled:opacity-70 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                    >
                      {oauthLoading ? (
                        <><RefreshCw size={14} className="animate-spin" /> Authorizing with Snowflake…</>
                      ) : (
                        <><Link2 size={14} /> Authorize with Snowflake</>
                      )}
                    </button>
                  ) : (
                    <div className="rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 p-4 flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">Authorization successful</p>
                        <p className="text-xs text-green-600/70 dark:text-green-400/70">Token stored securely. Refresh handled automatically.</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setWizardStep(1)} className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      ← Back
                    </button>
                    <button
                      onClick={() => setWizardStep(3)}
                      disabled={!oauthDone}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
                    >
                      Next: Verify →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Verify + finish */}
              {wizardStep === 3 && (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Connection verified</h3>
                  <div className="rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold text-sm">
                      <CheckCircle2 size={16} /> All checks passed
                    </div>
                    {[
                      { label: "Account reachable", ok: true },
                      { label: "OAuth token valid", ok: true },
                      { label: "Warehouse accessible", ok: true },
                      { label: "Schema discovery", ok: true },
                    ].map(c => (
                      <div key={c.label} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300">{c.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 text-xs space-y-1">
                    {[
                      ["Account", connForm.account],
                      ["Warehouse", connForm.warehouse],
                      ["Database", connForm.database],
                      ["Schema", connForm.schema],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200 font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={finishWizard}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Save connection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

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
    { id: "overview",      label: "Overview",     icon: <LayoutDashboard size={17} /> },
    { id: "buildings",     label: "Buildings",    icon: <Building2 size={17} /> },
    { id: "alerts",        label: "Alerts",       icon: <Bell size={17} />, badge: alertList.filter(a => a.severity !== "info").length },
    { id: "schedules",     label: "Schedules",    icon: <Calendar size={17} /> },
    { id: "reports",       label: "Reports",      icon: <BarChart3 size={17} /> },
    { id: "integrations",  label: "Integrations", icon: <Database size={17} />, badge: 1 },
    { id: "settings",      label: "Settings",     icon: <Settings size={17} /> },
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Lumi<span className="text-amber-500">Glow</span>
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
                  ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className={cn(
                  "text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center",
                  item.id === "integrations" ? "bg-cyan-500" : "bg-red-500"
                )}>
                  {item.id === "integrations" ? "N" : item.badge}
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
              LumiGlow Smart Lighting Console · ACME Corp
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
          {tab === "settings" && <SettingsPanel />}

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
