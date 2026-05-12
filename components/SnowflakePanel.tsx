"use client";

import { useState } from "react";
import {
  Database, ChevronRight, ChevronDown, Play, RefreshCw,
  CheckCircle2, XCircle, Loader2, Table2, Layers, Copy,
  Clock, Zap, ToggleLeft, ToggleRight, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Mock schema data ──────────────────────────────────────────────────────────

const SCHEMA_TREE = [
  {
    db: "LUMIGLOW_PROD",
    schemas: [
      {
        name: "ANALYTICS",
        tables: ["ENERGY_EVENTS", "ZONE_STATES", "POLICY_EVALUATIONS", "AUDIT_LOG"],
      },
      {
        name: "REPORTING",
        tables: ["DAILY_SUMMARY", "MONTHLY_ESG", "ZONE_UPTIME"],
      },
    ],
  },
  {
    db: "LUMIGLOW_RAW",
    schemas: [
      {
        name: "INGEST",
        tables: ["RAW_SENSOR_EVENTS", "RAW_DEVICE_HEALTH", "RAW_ALERTS"],
      },
    ],
  },
  {
    db: "SHARED_DATA",
    schemas: [
      {
        name: "BENCHMARKS",
        tables: ["ENERGY_BASELINES", "INDUSTRY_AVERAGES"],
      },
    ],
  },
];

// ── Mock query results ────────────────────────────────────────────────────────

const CANNED_RESULTS: Record<string, { columns: string[]; rows: (string | number)[][] }> = {
  default: {
    columns: ["BUILDING", "DATE", "KWH_ACTUAL", "KWH_BASELINE", "SAVINGS_PCT"],
    rows: [
      ["HQ Tower",    "2026-05-12", 82.4,  118.6, "30.5%"],
      ["West Campus", "2026-05-12", 61.2,   88.0, "30.5%"],
      ["EMEA Office", "2026-05-12", 44.8,   67.3, "33.4%"],
      ["HQ Tower",    "2026-05-11", 79.1,  115.2, "31.3%"],
      ["West Campus", "2026-05-11", 60.5,   86.9, "30.4%"],
    ],
  },
  audit: {
    columns: ["EVENT_ID", "TS", "USER", "ACTION", "ZONE", "BUILDING"],
    rows: [
      ["evt_0021", "2026-05-12 15:44:01", "admin@acme.com",    "ZONE_ON",        "Main Atrium",  "HQ Tower"],
      ["evt_0020", "2026-05-12 15:32:18", "system",            "BRIGHTNESS_SET", "Open Office",  "HQ Tower"],
      ["evt_0019", "2026-05-12 14:10:55", "ops@acme.com",      "ZONE_OFF",       "Conference A", "West Campus"],
      ["evt_0018", "2026-05-12 13:55:02", "scheduler",         "POLICY_APPLIED", "All zones",    "EMEA Office"],
      ["evt_0017", "2026-05-12 12:00:00", "security@acme.com", "ZONE_ON",        "Security",     "HQ Tower"],
    ],
  },
  zones: {
    columns: ["ZONE_ID", "NAME", "BUILDING", "IS_ON", "BRIGHTNESS", "POWER_W", "LAST_CHANGED"],
    rows: [
      ["z1",  "Main Atrium",   "HQ Tower",    "TRUE",  85,  420, "2026-05-12 15:42"],
      ["z2",  "Reception",     "HQ Tower",    "TRUE",  70,  210, "2026-05-12 15:30"],
      ["z5",  "Open Office",   "HQ Tower",    "TRUE",  60,  890, "2026-05-12 15:39"],
      ["z9",  "Sales Floor",   "West Campus", "TRUE",  75,  760, "2026-05-12 15:36"],
      ["z12", "Ops Center",    "EMEA Office", "TRUE",  80,  640, "2026-05-12 15:41"],
    ],
  },
};

const SAMPLE_QUERIES = [
  {
    label: "Energy summary by building",
    sql: `SELECT\n  building,\n  date,\n  kwh_actual,\n  kwh_baseline,\n  savings_pct\nFROM analytics.energy_events\nWHERE date >= CURRENT_DATE - 2\nORDER BY date DESC, building;`,
    resultKey: "default",
  },
  {
    label: "Recent audit log",
    sql: `SELECT\n  event_id,\n  ts,\n  user,\n  action,\n  zone,\n  building\nFROM analytics.audit_log\nORDER BY ts DESC\nLIMIT 50;`,
    resultKey: "audit",
  },
  {
    label: "Current zone states",
    sql: `SELECT\n  zone_id,\n  name,\n  building,\n  is_on,\n  brightness,\n  power_w,\n  last_changed\nFROM analytics.zone_states\nORDER BY building, name;`,
    resultKey: "zones",
  },
];

// ── Sub-tabs ──────────────────────────────────────────────────────────────────

type SubTab = "connection" | "schema" | "query";

// ── Main Component ────────────────────────────────────────────────────────────

export default function SnowflakePanel() {
  const [subTab, setSubTab] = useState<SubTab>("connection");

  // Connection form
  const [account, setAccount]     = useState("acmecorp.us-east-1");
  const [warehouse, setWarehouse] = useState("COMPUTE_WH");
  const [database, setDatabase]   = useState("LUMIGLOW_PROD");
  const [role, setRole]           = useState("LUMIGLOW_READER");
  const [authMethod, setAuthMethod] = useState<"oauth2" | "keypair" | "password">("oauth2");
  const [syncEnabled, setSyncEnabled] = useState(true);

  // Connection status
  type ConnStatus = "idle" | "testing" | "connected" | "error";
  const [connStatus, setConnStatus] = useState<ConnStatus>("connected");
  const [lastTested, setLastTested] = useState("Today at 3:44 PM");

  function testConnection() {
    setConnStatus("testing");
    setTimeout(() => {
      setConnStatus("connected");
      setLastTested("Just now");
    }, 1800);
  }

  // Schema browser
  const [expandedDbs, setExpandedDbs]         = useState<string[]>(["LUMIGLOW_PROD"]);
  const [expandedSchemas, setExpandedSchemas] = useState<string[]>(["LUMIGLOW_PROD::ANALYTICS"]);

  function toggleDb(db: string) {
    setExpandedDbs(prev => prev.includes(db) ? prev.filter(x => x !== db) : [...prev, db]);
  }
  function toggleSchema(key: string) {
    setExpandedSchemas(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  }

  // Query editor
  const [sql, setSql]           = useState(SAMPLE_QUERIES[0].sql);
  const [activeResult, setActiveResult] = useState<keyof typeof CANNED_RESULTS>("default");
  const [queryStatus, setQueryStatus]   = useState<"idle" | "running" | "done">("done");
  const [cached, setCached]     = useState(true);
  const [rowCount, setRowCount] = useState(5);
  const [elapsed, setElapsed]   = useState("0.12 s");
  const [copied, setCopied]     = useState(false);

  function runQuery() {
    setQueryStatus("running");
    setCached(false);
    setTimeout(() => {
      const lower = sql.toLowerCase();
      let key: keyof typeof CANNED_RESULTS = "default";
      if (lower.includes("audit")) key = "audit";
      else if (lower.includes("zone_state") || lower.includes("zone_id")) key = "zones";
      setActiveResult(key);
      setRowCount(CANNED_RESULTS[key].rows.length);
      setElapsed((Math.random() * 0.4 + 0.08).toFixed(2) + " s");
      setQueryStatus("done");
    }, 1200);
  }

  function loadSample(idx: number) {
    const q = SAMPLE_QUERIES[idx];
    setSql(q.sql);
    setActiveResult(q.resultKey as keyof typeof CANNED_RESULTS);
    setQueryStatus("done");
    setCached(true);
    setRowCount(CANNED_RESULTS[q.resultKey as keyof typeof CANNED_RESULTS].rows.length);
    setElapsed("0.00 s (cached)");
  }

  function copySQL() {
    navigator.clipboard.writeText(sql).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const result = CANNED_RESULTS[activeResult];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center shrink-0">
          <Database size={18} className="text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Snowflake Integration</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Native connector · OAuth2 · Schema discovery · Cached query execution
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          {connStatus === "connected" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Connected
            </span>
          )}
          {connStatus === "error" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-500/30">
              <XCircle size={11} /> Error
            </span>
          )}
          {connStatus === "idle" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              Not tested
            </span>
          )}
          {connStatus === "testing" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1 rounded-full">
              <Loader2 size={11} className="animate-spin" /> Testing…
            </span>
          )}
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(["connection", "schema", "query"] as SubTab[]).map(t => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={cn(
              "px-4 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all",
              subTab === t
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {t === "connection" ? "Connection" : t === "schema" ? "Schema Browser" : "Query Editor"}
          </button>
        ))}
      </div>

      {/* ── CONNECTION TAB ── */}
      {subTab === "connection" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Config form */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connection settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Account identifier</label>
                <input
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                  placeholder="org-account.region"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Warehouse</label>
                <input
                  value={warehouse}
                  onChange={e => setWarehouse(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                  placeholder="COMPUTE_WH"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Default database</label>
                <input
                  value={database}
                  onChange={e => setDatabase(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                  placeholder="MY_DATABASE"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Role</label>
                <input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
                  placeholder="MY_ROLE"
                />
              </div>
            </div>

            {/* Auth method */}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Authentication method</label>
              <div className="flex gap-2 flex-wrap">
                {(["oauth2", "keypair", "password"] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setAuthMethod(m)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                      authMethod === m
                        ? "bg-sky-500 border-sky-500 text-white"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-400"
                    )}
                  >
                    {m === "oauth2" ? "OAuth 2.0" : m === "keypair" ? "Key Pair" : "Username / Password"}
                  </button>
                ))}
              </div>
              {authMethod === "oauth2" && (
                <div className="mt-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-xs text-sky-700 dark:text-sky-300">
                  OAuth 2.0 flow configured. Token auto-refreshes every 55 minutes.{" "}
                  <span className="font-semibold underline cursor-pointer">Re-authorize →</span>
                </div>
              )}
              {authMethod === "keypair" && (
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Private key (RSA PEM)</label>
                    <textarea
                      rows={3}
                      readOnly
                      value="-----BEGIN RSA PRIVATE KEY-----\n••••••••••••••••••••••••••••••\n-----END RSA PRIVATE KEY-----"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}
              {authMethod === "password" && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Username</label>
                    <input defaultValue="svc_lumiglow" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Password</label>
                    <input type="password" defaultValue="hunter2" className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-400" />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={testConnection}
              disabled={connStatus === "testing"}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all",
                connStatus === "testing"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-sky-500 hover:bg-sky-400 text-white shadow hover:shadow-sky-400/30"
              )}
            >
              {connStatus === "testing"
                ? <><Loader2 size={13} className="animate-spin" /> Testing connection…</>
                : <><RefreshCw size={13} /> Test connection</>
              }
            </button>
          </div>

          {/* Status & sync panel */}
          <div className="space-y-3">
            {/* Connection health */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Connection health</h3>
              {[
                { label: "Latency",          value: "48 ms",   ok: true },
                { label: "Warehouse status", value: "Running", ok: true },
                { label: "Last handshake",   value: lastTested, ok: true },
                { label: "Token expiry",     value: "in 48 min", ok: true },
                { label: "Queries (24 h)",   value: "1,248",   ok: true },
                { label: "Cache hit rate",   value: "83%",     ok: true },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{row.label}</span>
                  <div className="flex items-center gap-1.5">
                    {row.ok
                      ? <CheckCircle2 size={11} className="text-green-500" />
                      : <AlertTriangle size={11} className="text-amber-500" />
                    }
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Sync settings */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Data sync</h3>
              <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800">
                <div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Continuous event export</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Stream zone events to Snowflake in real time</p>
                </div>
                <button
                  onClick={() => setSyncEnabled(p => !p)}
                  className={cn("transition-colors shrink-0", syncEnabled ? "text-sky-500" : "text-slate-300 dark:text-slate-600")}
                >
                  {syncEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock size={11} />
                Last sync: <span className="font-semibold text-slate-700 dark:text-slate-300">30 seconds ago</span>
                <span className="ml-auto text-green-500 font-semibold">8,412 events / hr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEMA TAB ── */}
      {subTab === "schema" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tree */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Database size={13} className="text-sky-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">3 databases</span>
              <button className="ml-auto text-slate-400 hover:text-sky-500 transition-colors">
                <RefreshCw size={12} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-96 p-2">
              {SCHEMA_TREE.map(dbEntry => {
                const dbOpen = expandedDbs.includes(dbEntry.db);
                return (
                  <div key={dbEntry.db}>
                    <button
                      onClick={() => toggleDb(dbEntry.db)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {dbOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      <Database size={11} className="text-sky-500 shrink-0" />
                      <span className="truncate">{dbEntry.db}</span>
                    </button>
                    {dbOpen && dbEntry.schemas.map(schema => {
                      const key = `${dbEntry.db}::${schema.name}`;
                      const schemaOpen = expandedSchemas.includes(key);
                      return (
                        <div key={key} className="ml-4">
                          <button
                            onClick={() => toggleSchema(key)}
                            className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            {schemaOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                            <Layers size={10} className="text-violet-400 shrink-0" />
                            <span className="truncate font-medium">{schema.name}</span>
                            <span className="ml-auto text-[10px] text-slate-400">{schema.tables.length}</span>
                          </button>
                          {schemaOpen && schema.tables.map(table => (
                            <button
                              key={table}
                              className="w-full flex items-center gap-2 ml-4 px-2 py-1 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                              onClick={() => {
                                setSql(`SELECT * FROM ${dbEntry.db}.${schema.name}.${table}\nLIMIT 100;`);
                                setSubTab("query");
                                setQueryStatus("idle");
                                setCached(false);
                              }}
                            >
                              <Table2 size={10} className="text-slate-400 shrink-0" />
                              <span className="truncate">{table}</span>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Table detail */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">LUMIGLOW_PROD.ANALYTICS.ENERGY_EVENTS</p>
              <p className="text-[10px] text-slate-400 mt-0.5">8 columns · ~2.4 M rows · Updated 30 s ago</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {["Column", "Type", "Nullable", "Description"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["EVENT_ID",    "VARCHAR(36)",  "NO",  "UUID primary key"],
                    ["BUILDING",    "VARCHAR(128)", "NO",  "Building display name"],
                    ["DATE",        "DATE",         "NO",  "Event date (UTC)"],
                    ["KWH_ACTUAL",  "FLOAT",        "NO",  "Measured energy consumption"],
                    ["KWH_BASELINE","FLOAT",        "YES", "Historical baseline kWh"],
                    ["SAVINGS_PCT", "VARCHAR(8)",   "YES", "Savings vs. baseline"],
                    ["ZONE_COUNT",  "INTEGER",      "NO",  "Zones active during period"],
                    ["SYNCED_AT",   "TIMESTAMP_NTZ","NO",  "LumiGlow export timestamp"],
                  ].map((row, i) => (
                    <tr key={row[0]} className={cn("border-b border-slate-50 dark:border-slate-800/80 last:border-0", i % 2 !== 0 && "bg-slate-50/50 dark:bg-slate-800/20")}>
                      <td className="px-4 py-2 font-mono font-semibold text-slate-800 dark:text-slate-100">{row[0]}</td>
                      <td className="px-4 py-2 font-mono text-sky-600 dark:text-sky-400">{row[1]}</td>
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{row[2]}</td>
                      <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── QUERY TAB ── */}
      {subTab === "query" && (
        <div className="space-y-3">
          {/* Sample queries */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium shrink-0">Quick queries:</span>
            {SAMPLE_QUERIES.map((q, i) => (
              <button
                key={q.label}
                onClick={() => loadSample(i)}
                className="text-xs px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors bg-white dark:bg-slate-900"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex-1">SQL Editor</span>
              <button
                onClick={copySQL}
                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <Copy size={10} />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea
              value={sql}
              onChange={e => setSql(e.target.value)}
              rows={6}
              spellCheck={false}
              className="w-full px-4 py-3 text-xs font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none resize-none"
            />
            <div className="flex items-center gap-3 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={runQuery}
                disabled={queryStatus === "running"}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-xl transition-all",
                  queryStatus === "running"
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-sky-500 hover:bg-sky-400 text-white shadow hover:shadow-sky-400/30"
                )}
              >
                {queryStatus === "running"
                  ? <><Loader2 size={12} className="animate-spin" /> Running…</>
                  : <><Play size={12} fill="currentColor" /> Run Query</>
                }
              </button>
              <span className="text-[10px] text-slate-400">
                Warehouse: <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{warehouse}</span>
              </span>
              <span className="text-[10px] text-slate-400 ml-auto">
                Ctrl + Enter to run
              </span>
            </div>
          </div>

          {/* Results */}
          {(queryStatus === "done" || queryStatus === "running") && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Results</span>
                {queryStatus === "done" && (
                  <>
                    <span className="text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{rowCount}</span> rows
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Zap size={9} />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{elapsed}</span>
                    </span>
                    {cached && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-500/30">
                        <Clock size={9} /> Cached (5 min)
                      </span>
                    )}
                  </>
                )}
                {queryStatus === "running" && (
                  <span className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400">
                    <Loader2 size={10} className="animate-spin" /> Executing…
                  </span>
                )}
              </div>
              {queryStatus === "done" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        {result.columns.map(col => (
                          <th key={col} className="text-left px-4 py-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap font-mono">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row, ri) => (
                        <tr key={ri} className={cn("border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-colors", ri % 2 !== 0 && "bg-slate-50/50 dark:bg-slate-800/20")}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="px-4 py-2 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">{String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
