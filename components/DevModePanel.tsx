"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Terminal, Play, Square, Download, Database, Cpu,
  Package, CheckCircle2, Code2, Layers, Sparkles, AlertCircle, ChevronRight,
  ToggleLeft, ToggleRight, Copy, Check, RefreshCw, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Env = "mock" | "staging";
type LogLevel = "info" | "debug" | "warn" | "error" | "success";

interface LogLine {
  id: number;
  ts: string;
  level: LogLevel;
  msg: string;
  correlationId?: string;
}

interface Project {
  id: string;
  name: string;
  status: "active" | "seeded" | "idle";
  createdAt: string;
}

interface Simulation {
  id: string;
  projectId: string;
  device: string;
  scenario: string;
  status: "running" | "stopped" | "completed";
  events: number;
  startedAt: string;
}

// ─── Mock data helpers ────────────────────────────────────────────────────────

let _logId = 0;
function mkLog(level: LogLevel, msg: string, correlationId?: string): LogLine {
  return {
    id: ++_logId,
    ts: new Date().toISOString().split("T")[1].slice(0, 12),
    level,
    msg,
    correlationId,
  };
}

const DEVICES = ["Pixel_8", "iPhone_15", "Galaxy_S24", "iPad_Pro"];
const SCENARIOS = ["checkout-flow", "product-browse", "user-onboarding", "retail-demo"];
const PRESETS = ["retail-demo", "ecommerce-baseline", "partner-showcase", "minimal"];

function randId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Code Snippet ─────────────────────────────────────────────────────────────

function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="relative group rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
      <pre className="text-[11px] leading-5 text-slate-300 p-4 overflow-x-auto font-mono whitespace-pre">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
      </button>
    </div>
  );
}

// ─── Console ──────────────────────────────────────────────────────────────────

function Console({ lines }: { lines: LogLine[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [lines]);

  const levelColor: Record<LogLevel, string> = {
    info:    "text-sky-400",
    debug:   "text-slate-400",
    warn:    "text-amber-400",
    error:   "text-red-400",
    success: "text-green-400",
  };

  const levelTag: Record<LogLevel, string> = {
    info:    "INF",
    debug:   "DBG",
    warn:    "WRN",
    error:   "ERR",
    success: "OK ",
  };

  return (
    <div
      ref={ref}
      className="h-64 overflow-y-auto bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-[11px] leading-5 space-y-0.5 scroll-smooth"
    >
      {lines.length === 0 && (
        <p className="text-slate-600 select-none">// Console output appears here…</p>
      )}
      {lines.map(l => (
        <div key={l.id} className="flex items-start gap-2 min-w-0">
          <span className="text-slate-600 shrink-0">{l.ts}</span>
          <span className={cn("font-bold shrink-0 w-7", levelColor[l.level])}>{levelTag[l.level]}</span>
          {l.correlationId && (
            <span className="text-slate-600 shrink-0">[{l.correlationId}]</span>
          )}
          <span className={cn("break-all", levelColor[l.level])}>{l.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Project["status"] | Simulation["status"] }) {
  const cfg: Record<string, { cls: string; dot: string }> = {
    active:    { cls: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",   dot: "bg-green-500" },
    seeded:    { cls: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400", dot: "bg-violet-500" },
    idle:      { cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",     dot: "bg-slate-400" },
    running:   { cls: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",   dot: "bg-amber-500 animate-pulse" },
    stopped:   { cls: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",          dot: "bg-red-500" },
    completed: { cls: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",          dot: "bg-sky-500" },
  };
  const c = cfg[status] ?? cfg.idle;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full", c.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
      {status}
    </span>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function DevModePanel() {
  const [env, setEnv] = useState<Env>("mock");
  const [logLevel, setLogLevel] = useState<"info" | "debug">("info");
  const [logs, setLogs] = useState<LogLine[]>([
    mkLog("info", "DevModeClient ready — select an action to begin"),
  ]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0]);
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [bundleReady, setBundleReady] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const mockApiKey = "dmk_sandbox_••••••••••••••••";
  const realKey = "dmk_sandbox_a1b2c3d4e5f6a7b8";

  const pushLog = useCallback((...newLogs: LogLine[]) => {
    setLogs(prev => [...prev, ...newLogs]);
  }, []);

  const setLoadingKey = useCallback((k: string, v: boolean) => {
    setLoading(prev => ({ ...prev, [k]: v }));
  }, []);

  function delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  async function createProject() {
    setLoadingKey("project", true);
    const cid = randId();
    const name = `Demo Project ${projects.length + 1}`;
    pushLog(
      mkLog("info",  `POST /devmode/v1/projects — name="${name}"`, cid),
      mkLog("debug", `→ Auth: Bearer ${realKey.slice(0, 12)}…`, cid),
    );
    await delay(800);
    pushLog(mkLog("info", `← 201 Created — latency 47ms`, cid));
    const proj: Project = {
      id: `proj_${randId()}`,
      name,
      status: "active",
      createdAt: new Date().toLocaleTimeString(),
    };
    setProjects(prev => [...prev, proj]);
    setSelectedProjectId(proj.id);
    pushLog(mkLog("success", `Project created: ${proj.id}`, cid));
    setLoadingKey("project", false);
  }

  async function seedFixtures() {
    if (!selectedProjectId) return;
    setLoadingKey("seed", true);
    const cid = randId();
    pushLog(
      mkLog("info",  `POST /devmode/v1/fixtures/seed — projectId=${selectedProjectId} preset="${selectedPreset}"`, cid),
      mkLog("debug", `→ Uploading component tree…`, cid),
    );
    await delay(300);
    pushLog(mkLog("debug", `→ Applying theme tokens…`, cid));
    await delay(400);
    pushLog(mkLog("debug", `→ Generating synthetic events (128)…`, cid));
    await delay(600);
    pushLog(mkLog("info",  `← 200 OK — 3 components, 1 theme, 128 events seeded`, cid));
    pushLog(mkLog("success", `Sandbox seeded with preset "${selectedPreset}"`, cid));
    setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, status: "seeded" } : p));
    setLoadingKey("seed", false);
  }

  async function startSimulation() {
    if (!selectedProjectId) return;
    const running = simulations.find(s => s.status === "running");
    if (running) return;
    setLoadingKey("sim", true);
    const cid = randId();
    pushLog(
      mkLog("info",  `POST /devmode/v1/simulations — device=${selectedDevice} scenario=${selectedScenario}`, cid),
      mkLog("debug", `→ Booting ${selectedDevice} emulator…`, cid),
    );
    await delay(500);
    pushLog(mkLog("debug", `→ Loading scenario "${selectedScenario}"…`, cid));
    await delay(400);
    const sim: Simulation = {
      id: `sim_${randId()}`,
      projectId: selectedProjectId,
      device: selectedDevice,
      scenario: selectedScenario,
      status: "running",
      events: 0,
      startedAt: new Date().toLocaleTimeString(),
    };
    setSimulations(prev => [...prev, sim]);
    pushLog(mkLog("success", `Simulation ${sim.id} started — streaming events…`, cid));
    setLoadingKey("sim", false);

    const interval = setInterval(() => {
      setSimulations(prev => prev.map(s =>
        s.id === sim.id && s.status === "running"
          ? { ...s, events: s.events + Math.floor(1 + Math.random() * 4) }
          : s
      ));
    }, 600);
    setTimeout(() => clearInterval(interval), 8000);
  }

  async function stopSimulation(simId: string) {
    setLoadingKey(`stop_${simId}`, true);
    const cid = randId();
    const sim = simulations.find(s => s.id === simId);
    pushLog(mkLog("info", `POST /devmode/v1/simulations/${simId}/stop`, cid));
    await delay(400);
    pushLog(mkLog("info",  `← 200 OK — report generated`, cid));
    pushLog(mkLog("success", `Simulation stopped. Events: ${sim?.events ?? 0}, Duration: 8.2s`, cid));
    setSimulations(prev => prev.map(s =>
      s.id === simId ? { ...s, status: "completed" } : s
    ));
    setLoadingKey(`stop_${simId}`, false);
  }

  async function exportDebug() {
    if (!selectedProjectId) return;
    setLoadingKey("debug", true);
    setBundleReady(false);
    const cid = randId();
    pushLog(
      mkLog("info",  `POST /devmode/v1/debug/bundle — projectId=${selectedProjectId}`, cid),
      mkLog("debug", `→ Collecting structured logs…`, cid),
    );
    await delay(350);
    pushLog(mkLog("debug", `→ Attaching trace spans (${12 + Math.floor(Math.random() * 20)})…`, cid));
    await delay(400);
    pushLog(mkLog("debug", `→ Snapshotting configuration…`, cid));
    await delay(300);
    pushLog(mkLog("info",  `← 200 OK — bundle.zip 184 KB`, cid));
    pushLog(mkLog("success", `Debug bundle ready for download`, cid));
    setBundleReady(true);
    setLoadingKey("debug", false);
  }

  function clearConsole() {
    setLogs([mkLog("info", "Console cleared")]);
    setBundleReady(false);
  }

  const baseUrl = env === "mock" ? "http://localhost:4040" : "https://staging.api.lumiglow.dev";

  const initSnippet = `import { DevModeClient } from "@lumiglow/devmode-sdk";

const client = new DevModeClient({
  baseUrl: "${baseUrl}",
  apiKey: process.env.LUMIGLOW_DEVMODE_KEY!,
  logLevel: "${logLevel}",
});`;

  const hasRunningSimulation = simulations.some(s => s.status === "running");

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow">
              <Code2 size={13} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dev Mode SDK</h2>
            <span className="text-[10px] font-bold bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 px-2 py-0.5 rounded-full">
              @lumiglow/devmode-sdk
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 ml-9">
            Interactive sandbox for partner apps and internal tooling
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Environment toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(["mock", "staging"] as Env[]).map(e => (
              <button
                key={e}
                onClick={() => setEnv(e)}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  env === e
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {e === "mock" ? "🔧 Mock" : "🚀 Staging"}
              </button>
            ))}
          </div>

          {/* Log level toggle */}
          <button
            onClick={() => setLogLevel(l => l === "info" ? "debug" : "info")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all",
              logLevel === "debug"
                ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
            )}
          >
            {logLevel === "debug" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            debug logs
          </button>

          {/* API key */}
          <div
            className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 cursor-pointer group"
            onClick={() => {
              navigator.clipboard.writeText(realKey).catch(() => {});
              setApiKeyCopied(true);
              setTimeout(() => setApiKeyCopied(false), 1500);
            }}
            title="Click to copy API key"
          >
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{mockApiKey}</span>
            {apiKeyCopied
              ? <Check size={11} className="text-green-500" />
              : <Copy size={11} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            }
          </div>
        </div>
      </div>

      {/* ── Init snippet ── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Package size={11} /> Client initialization
        </p>
        <CodeSnippet code={initSnippet} />
      </div>

      {/* ── 4 flow cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* 1. Projects */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center">
              <Layers size={13} className="text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">client.projects.*</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Create &amp; inspect dev projects</p>
            </div>
          </div>

          <button
            onClick={createProject}
            disabled={loading.project}
            className="w-full flex items-center justify-center gap-2 py-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            {loading.project ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12} />}
            {loading.project ? "Creating…" : "projects.create()"}
          </button>

          {projects.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all border text-xs",
                    selectedProjectId === p.id
                      ? "border-sky-300 dark:border-sky-500/40 bg-sky-50 dark:bg-sky-500/10"
                      : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <ChevronRight size={10} className={selectedProjectId === p.id ? "text-sky-500" : "text-slate-400"} />
                  <span className="flex-1 font-medium text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
                  <StatusBadge status={p.status} />
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-2">No projects yet</p>
          )}
        </div>

        {/* 2. Fixtures */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
              <Database size={13} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">client.fixtures.*</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Seed demo data &amp; component presets</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Preset</label>
            <select
              value={selectedPreset}
              onChange={e => setSelectedPreset(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <button
            onClick={seedFixtures}
            disabled={loading.seed || !selectedProjectId}
            className="w-full flex items-center justify-center gap-2 py-2 bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            {loading.seed ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {loading.seed ? "Seeding…" : "fixtures.seedProject()"}
          </button>

          {!selectedProjectId && (
            <p className="text-[11px] text-amber-500 flex items-center gap-1">
              <AlertCircle size={11} /> Select a project first
            </p>
          )}
        </div>

        {/* 3. Simulations */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
              <Cpu size={13} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">client.simulations.*</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Run device simulations &amp; stream events</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Device</label>
              <select
                value={selectedDevice}
                onChange={e => setSelectedDevice(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {DEVICES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Scenario</label>
              <select
                value={selectedScenario}
                onChange={e => setSelectedScenario(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {SCENARIOS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={startSimulation}
            disabled={loading.sim || hasRunningSimulation || !selectedProjectId}
            className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            {loading.sim ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} fill="white" />}
            {loading.sim ? "Starting…" : hasRunningSimulation ? "Simulation running…" : "simulations.start()"}
          </button>

          {simulations.filter(s => s.status === "running").map(sim => (
            <div key={sim.id} className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 truncate">{sim.id}</p>
                <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">{sim.device} · {sim.events} events</p>
              </div>
              <button
                onClick={() => stopSimulation(sim.id)}
                disabled={!!loading[`stop_${sim.id}`]}
                className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-red-500 hover:bg-red-400 text-white rounded-lg transition-all"
              >
                <Square size={9} fill="white" /> Stop
              </button>
            </div>
          ))}

          {simulations.filter(s => s.status === "completed").map(sim => (
            <div key={sim.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <CheckCircle2 size={13} className="text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">{sim.id}</p>
                <p className="text-[10px] text-slate-400">{sim.device} · {sim.events} events · completed</p>
              </div>
            </div>
          ))}

          {!selectedProjectId && (
            <p className="text-[11px] text-amber-500 flex items-center gap-1">
              <AlertCircle size={11} /> Select a project first
            </p>
          )}
        </div>

        {/* 4. Debug */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
              <Terminal size={13} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">client.debug.*</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Export logs, traces &amp; config snapshots</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3 space-y-1.5">
            {[
              { label: "Structured logs", icon: "📋" },
              { label: "Trace spans",     icon: "🔗" },
              { label: "Config snapshot", icon: "📸" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {bundleReady && <CheckCircle2 size={11} className="text-green-500 ml-auto" />}
              </div>
            ))}
          </div>

          <button
            onClick={exportDebug}
            disabled={loading.debug || !selectedProjectId}
            className="w-full flex items-center justify-center gap-2 py-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            {loading.debug ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
            {loading.debug ? "Bundling…" : "debug.exportBundle()"}
          </button>

          {bundleReady && (
            <button
              onClick={() => {
                setBundleReady(false);
                pushLog(mkLog("success", "bundle.zip downloaded (184 KB)"));
              }}
              className="w-full flex items-center justify-center gap-2 py-2 border border-green-300 dark:border-green-500/40 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-semibold rounded-xl transition-all hover:bg-green-100 dark:hover:bg-green-500/20"
            >
              <Download size={12} /> Download bundle.zip
            </button>
          )}

          {!selectedProjectId && (
            <p className="text-[11px] text-amber-500 flex items-center gap-1">
              <AlertCircle size={11} /> Select a project first
            </p>
          )}
        </div>
      </div>

      {/* ── SDK console ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal size={11} /> SDK Console
          </p>
          <button
            onClick={clearConsole}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
        <Console lines={logs} />
      </div>

      {/* ── Module reference ── */}
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Package size={11} /> Module reference
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { name: "projects",    methods: ["create", "get", "list", "delete"],        color: "text-sky-500"    },
            { name: "components",  methods: ["create", "update", "inspect"],            color: "text-indigo-500" },
            { name: "themes",      methods: ["upload", "apply", "list"],                color: "text-violet-500" },
            { name: "fixtures",    methods: ["seedProject", "reset", "listRecipes"],    color: "text-purple-500" },
            { name: "simulations", methods: ["start", "stop", "stopAndFetchReport"],    color: "text-amber-500"  },
            { name: "debug",       methods: ["exportBundle", "getLogs", "getTraces"],   color: "text-green-500"  },
          ].map(mod => (
            <div key={mod.name} className="rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-3 shadow-sm">
              <p className="text-[11px] font-bold text-slate-800 dark:text-white mb-1.5 font-mono">
                client.<span className={mod.color}>{mod.name}</span>.*
              </p>
              <ul className="space-y-0.5">
                {mod.methods.map(m => (
                  <li key={m} className="text-[10px] text-slate-500 dark:text-slate-400 font-mono pl-1 before:content-['→'] before:mr-1 before:text-slate-300 dark:before:text-slate-600">
                    {m}()
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
