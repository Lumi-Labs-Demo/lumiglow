"use client";

import { useState, useRef, useCallback } from "react";
import {
  AlertTriangle, CheckCircle2, RefreshCw,
  ShieldAlert, Shield, Clock, Play, X,
  ArrowRight, AlertCircle, Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type CircuitState = "closed" | "open" | "half-open";

interface RetryStep {
  attempt: number;
  status: "pending" | "running" | "failed" | "success";
  delayMs: number;
}

interface ErrorEvent {
  id: string;
  endpoint: string;
  ts: string;
  retries: number;
  resolved: boolean;
}

// ─── Static mock data ─────────────────────────────────────────────────────────

const ERROR_HISTORY = [
  { min: "-20m", count: 0 }, { min: "-19m", count: 0 },
  { min: "-18m", count: 1 }, { min: "-17m", count: 0 },
  { min: "-16m", count: 2 }, { min: "-15m", count: 1 },
  { min: "-14m", count: 0 }, { min: "-13m", count: 0 },
  { min: "-12m", count: 3 }, { min: "-11m", count: 5 },
  { min: "-10m", count: 8 }, { min: "-9m",  count: 12 },
  { min: "-8m",  count: 7 }, { min: "-7m",  count: 4 },
  { min: "-6m",  count: 2 }, { min: "-5m",  count: 1 },
  { min: "-4m",  count: 0 }, { min: "-3m",  count: 0 },
  { min: "-2m",  count: 0 }, { min: "-1m",  count: 0 },
];

const INITIAL_ERRORS: ErrorEvent[] = [
  { id: "e1", endpoint: "/api/zones/toggle",     ts: "9 min ago",  retries: 3, resolved: false },
  { id: "e2", endpoint: "/api/buildings/status", ts: "10 min ago", retries: 2, resolved: true  },
  { id: "e3", endpoint: "/api/schedules/sync",   ts: "11 min ago", retries: 3, resolved: false },
  { id: "e4", endpoint: "/api/energy/metrics",   ts: "12 min ago", retries: 1, resolved: true  },
];

const ENDPOINTS = [
  "/api/zones/toggle",
  "/api/buildings/status",
  "/api/schedules/sync",
  "/api/energy/metrics",
  "/api/firmware/check",
];

// ─── 504 Error Rate Chart ─────────────────────────────────────────────────────

function ErrorRateChart({ data }: { data: { min: string; count: number }[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  const W = 640, H = 160, padL = 32, padR = 12, padT = 12, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxY = Math.max(...data.map(d => d.count), 1) * 1.2;
  const xStep = chartW / (data.length - 1);

  function px(i: number) { return padL + i * xStep; }
  function py(v: number) { return padT + chartH - (v / maxY) * chartH; }

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.count).toFixed(1)}`).join(" ");
  const fillPath = linePath + ` L${px(data.length - 1).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL},${(padT + chartH).toFixed(1)} Z`;

  return (
    <div className="relative w-full overflow-x-auto" onMouseLeave={() => setHovered(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 300, maxHeight: 180 }}>
        <defs>
          <linearGradient id="errGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map(t => {
          const y = padT + chartH * (1 - t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="currentColor" strokeOpacity="0.07" strokeWidth="1" className="text-slate-500" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.4" className="text-slate-500">
                {Math.round(maxY * t)}
              </text>
            </g>
          );
        })}
        <line x1={padL} y1={py(5)} x2={W - padR} y2={py(5)} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.6" />
        <text x={W - padR - 2} y={py(5) - 3} textAnchor="end" fontSize="8" fill="#f59e0b" fillOpacity="0.8">threshold</text>
        <path d={fillPath} fill="url(#errGrad)" />
        <path d={linePath} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          i % 4 === 0 && (
            <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="currentColor" fillOpacity="0.4" className="text-slate-500">
              {d.min}
            </text>
          )
        ))}
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHovered(i)}>
            <rect x={px(i) - xStep / 2} y={padT} width={xStep} height={chartH} fill="transparent" />
            {hovered === i && d.count > 0 && (
              <>
                <line x1={px(i)} y1={padT} x2={px(i)} y2={padT + chartH} stroke="#ef4444" strokeWidth="1" strokeOpacity="0.4" />
                <circle cx={px(i)} cy={py(d.count)} r="4" fill="#ef4444" stroke="white" strokeWidth="1.5" />
                <rect x={Math.min(px(i) - 30, W - padR - 68)} y={py(d.count) - 38} width={64} height={32} rx="4" fill="#1e293b" fillOpacity="0.95" />
                <text x={Math.min(px(i) - 30, W - padR - 68) + 6} y={py(d.count) - 22} fontSize="9" fill="#ef4444" fontWeight="600">{d.min}</text>
                <text x={Math.min(px(i) - 30, W - padR - 68) + 6} y={py(d.count) - 11} fontSize="9" fill="white">{d.count} error{d.count !== 1 ? "s" : ""}</text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Circuit Breaker Card ─────────────────────────────────────────────────────

function CircuitBreakerCard({ state, errorCount, onReset }: {
  state: CircuitState;
  errorCount: number;
  onReset: () => void;
}) {
  const configs = {
    closed:      { color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10", border: "border-green-200 dark:border-green-500/30", label: "Closed",    sub: "Circuit healthy — all requests flowing",               icon: <Shield size={20} className="text-green-500" /> },
    open:        { color: "text-red-600 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-500/10",     border: "border-red-200 dark:border-red-500/30",     label: "Open",      sub: "Circuit tripped — requests blocked, fallback active",  icon: <ShieldAlert size={20} className="text-red-500" /> },
    "half-open": { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", label: "Half-Open", sub: "Probing recovery — test request allowed",               icon: <ShieldAlert size={20} className="text-amber-500" /> },
  };
  const config = configs[state];

  return (
    <div className={cn("rounded-2xl border p-5 shadow-sm", config.bg, config.border)}>
      <div className="flex items-start gap-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border", config.bg, config.border)}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn("text-sm font-bold", config.color)}>Circuit Breaker · {config.label}</span>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              state === "closed" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" :
              state === "open"   ? "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400" :
              "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
            )}>{state.toUpperCase()}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{config.sub}</p>
          <div className="flex items-center gap-4 mt-3">
            {[
              { val: String(errorCount), label: "504 errors (last 5m)" },
              { val: "5",               label: "trip threshold" },
              { val: "30s",             label: "reset timeout" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{s.val}</p>
                <p className="text-[10px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {state !== "closed" && (
          <button onClick={onReset} className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors">
            <RefreshCw size={12} /> Reset
          </button>
        )}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div className={cn(
            "w-10 h-6 rounded-lg border-2 flex items-center justify-center text-[9px] font-bold",
            state === "closed" ? "border-green-400 bg-green-50 dark:bg-green-500/10 text-green-600" :
            state === "open"   ? "border-red-400 bg-red-50 dark:bg-red-500/10 text-red-600" :
            "border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-600"
          )}>CB</div>
          <div className={cn("w-8 h-1.5 rounded-full", state === "closed" ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700")} />
        </div>
        <ArrowRight size={12} className="text-slate-400" />
        <div className={cn(
          "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg",
          state === "closed" ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400" :
          state === "open"   ? "bg-slate-100 dark:bg-slate-800 text-slate-400" :
          "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
        )}>
          {state === "closed" ? <><CheckCircle2 size={12} /> API flowing</> :
           state === "open"   ? <><X size={12} /> Blocked &rarr; Fallback</> :
           <><AlertCircle size={12} /> Probing...</>}
        </div>
      </div>
    </div>
  );
}

// ─── Retry Simulator ──────────────────────────────────────────────────────────

const BACKOFF_DELAYS = [0, 1000, 2000, 4000];

function RetrySimulator({ onCircuitTrip }: { onCircuitTrip: () => void }) {
  const [steps, setSteps]                   = useState<RetryStep[]>([]);
  const [running, setRunning]               = useState(false);
  const [outcome, setOutcome]               = useState<"success" | "exhausted" | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0]);
  const [succeedOn, setSucceedOn]           = useState<"never" | 1 | 2 | 3>("never");
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timerRef.current.forEach(t => clearTimeout(t)); timerRef.current = []; };

  const run = useCallback(() => {
    clearTimers();
    setRunning(true);
    setOutcome(null);
    const maxAttempts = 3;
    setSteps(Array.from({ length: maxAttempts }, (_, i) => ({ attempt: i + 1, status: "pending" as const, delayMs: BACKOFF_DELAYS[i] })));

    let cumulative = 0;
    for (let i = 0; i < maxAttempts; i++) {
      cumulative += (i === 0 ? 600 : BACKOFF_DELAYS[i] + 600);
      const ci = i;
      timerRef.current.push(setTimeout(() => {
        setSteps(prev => prev.map((s, idx) => idx === ci ? { ...s, status: "running" } : s));
      }, cumulative - 600));
      timerRef.current.push(setTimeout(() => {
        const ok = succeedOn === ci + 1;
        setSteps(prev => prev.map((s, idx) => idx === ci ? { ...s, status: ok ? "success" : "failed" } : s));
        if (ok) { setOutcome("success"); setRunning(false); }
        else if (ci === maxAttempts - 1) {
          timerRef.current.push(setTimeout(() => { setOutcome("exhausted"); setRunning(false); onCircuitTrip(); }, 300));
        }
      }, cumulative));
    }
  }, [succeedOn, onCircuitTrip]);

  function reset() { clearTimers(); setSteps([]); setRunning(false); setOutcome(null); }

  const statusIcon = (s: RetryStep["status"]) => {
    if (s === "pending") return <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700 shrink-0" />;
    if (s === "running") return <RefreshCw size={14} className="text-amber-500 animate-spin shrink-0" />;
    if (s === "failed")  return <X size={14} className="text-red-500 shrink-0" />;
    return <CheckCircle2 size={14} className="text-green-500 shrink-0" />;
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Play size={15} className="text-amber-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interactive Retry Simulator</h3>
        <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">Demo</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Target endpoint</label>
          <select value={selectedEndpoint} onChange={e => setSelectedEndpoint(e.target.value)} disabled={running}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60">
            {ENDPOINTS.map(ep => <option key={ep} value={ep}>{ep}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block">Succeed on attempt</label>
          <select value={String(succeedOn)} onChange={e => setSucceedOn(e.target.value === "never" ? "never" : Number(e.target.value) as 1|2|3)} disabled={running}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60">
            <option value="never">Never (all fail &rarr; circuit trips)</option>
            <option value="1">Attempt 1 (immediate success)</option>
            <option value="2">Attempt 2 (1 retry)</option>
            <option value="3">Attempt 3 (2 retries)</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 mb-5">
        <button onClick={run} disabled={running}
          className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-white transition-all",
            running ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed" : "bg-amber-500 hover:bg-amber-400 shadow hover:shadow-amber-400/30")}>
          <Play size={14} className={running ? "opacity-40" : ""} />
          {running ? "Simulating\u2026" : "Simulate 504"}
        </button>
        {steps.length > 0 && !running && (
          <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw size={13} /> Reset
          </button>
        )}
      </div>
      {steps.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Retry trace &middot; {selectedEndpoint}</p>
          {steps.map((step, i) => (
            <div key={i} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all",
              step.status === "pending" ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-50" :
              step.status === "running" ? "bg-amber-50 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/20" :
              step.status === "success" ? "bg-green-50 dark:bg-green-500/5 border-green-200/60 dark:border-green-500/20" :
              "bg-red-50 dark:bg-red-500/5 border-red-200/60 dark:border-red-500/20")}>
              {statusIcon(step.status)}
              <div className="flex-1 min-w-0">
                <p className={cn("text-xs font-semibold",
                  step.status === "pending" ? "text-slate-400" :
                  step.status === "running" ? "text-amber-600 dark:text-amber-400" :
                  step.status === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                  Attempt {step.attempt}
                  {step.status === "failed"  && " \u00b7 504 Gateway Timeout"}
                  {step.status === "running" && " \u00b7 Awaiting response\u2026"}
                  {step.status === "success" && " \u00b7 200 OK \u2713"}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {i === 0 ? "Immediate" : `Backoff: ${step.delayMs / 1000}s delay (\u00d7${i * 2} exponential)`}
                </p>
              </div>
              <span className={cn("shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                step.status === "pending" ? "bg-slate-100 dark:bg-slate-800 text-slate-400" :
                step.status === "running" ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" :
                step.status === "success" ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" :
                "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400")}>
                {step.status === "pending" ? "WAIT" : step.status === "running" ? "REQ" : step.status === "success" ? "200" : "504"}
              </span>
            </div>
          ))}
        </div>
      )}
      {outcome === "success" && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Request succeeded via retry</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/60 mt-0.5">Exponential backoff recovered the call. Circuit remains closed.</p>
          </div>
        </div>
      )}
      {outcome === "exhausted" && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
          <ShieldAlert size={16} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">All retries exhausted &middot; Circuit breaker tripped</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5">3 consecutive failures exceeded threshold. Circuit is now OPEN &mdash; fallback response returned.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub: string; accent: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 flex items-start gap-3 shadow-sm">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", accent)}>{icon}</div>
      <div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Recent Errors ────────────────────────────────────────────────────────────

function RecentErrors({ errors, onDismiss }: { errors: ErrorEvent[]; onDismiss: (id: string) => void }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={15} className="text-red-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent 504 Events</h3>
        <span className="ml-auto text-[11px] text-slate-400">Last hour</span>
      </div>
      {errors.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 size={28} className="text-green-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">No recent 504 errors</p>
          <p className="text-xs text-slate-400 mt-0.5">All API endpoints are responding normally.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map(err => (
            <div key={err.id} className={cn("flex items-center gap-3 p-3 rounded-xl border",
              err.resolved ? "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800" : "bg-red-50 dark:bg-red-500/5 border-red-100 dark:border-red-500/20")}>
              {err.resolved ? <CheckCircle2 size={13} className="text-green-500 shrink-0" /> : <AlertTriangle size={13} className="text-red-500 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 truncate">{err.endpoint}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{err.retries} attempt{err.retries !== 1 ? "s" : ""} &middot; {err.ts}</p>
              </div>
              <span className={cn("shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                err.resolved ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400")}>
                {err.resolved ? "RESOLVED" : "504"}
              </span>
              <button onClick={() => onDismiss(err.id)} className="text-slate-300 hover:text-red-500 transition-colors ml-1"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ApiHealthPanel() {
  const [circuitState, setCircuitState] = useState<CircuitState>("closed");
  const [errors, setErrors]             = useState<ErrorEvent[]>(INITIAL_ERRORS);
  const [chartData, setChartData]       = useState(ERROR_HISTORY);
  const [errorCount5m, setErrorCount5m] = useState(1);

  const resetCircuit = useCallback(() => {
    setCircuitState("half-open");
    setTimeout(() => setCircuitState("closed"), 2000);
    setErrorCount5m(0);
  }, []);

  const handleCircuitTrip = useCallback(() => {
    setCircuitState("open");
    setErrorCount5m(prev => prev + 3);
    const ep = ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
    setErrors(prev => [{ id: `sim-${Date.now()}`, endpoint: ep, ts: "Just now", retries: 3, resolved: false }, ...prev]);
    setChartData(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], count: (updated[updated.length - 1].count || 0) + 3 };
      return updated;
    });
  }, []);

  const dismissError = useCallback((id: string) => {
    setErrors(prev => prev.filter(e => e.id !== id));
  }, []);

  const recentErrorCount  = errors.filter(e => !e.resolved).length;
  const retrySuccessRate  = errors.length > 0 ? Math.round((errors.filter(e => e.resolved).length / errors.length) * 100) : 100;
  const total504           = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-5">
      <CircuitBreakerCard state={circuitState} errorCount={errorCount5m} onReset={resetCircuit} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="504 errors (1h)" value={String(total504)} sub="Across all endpoints" accent="bg-red-100 dark:bg-red-500/20" icon={<AlertTriangle size={16} className="text-red-600 dark:text-red-400" />} />
        <MetricCard label="Retry success rate" value={`${retrySuccessRate}%`} sub="Recovered via backoff" accent="bg-green-100 dark:bg-green-500/20" icon={<RefreshCw size={16} className="text-green-600 dark:text-green-400" />} />
        <MetricCard label="Active errors" value={String(recentErrorCount)} sub="Unresolved 504s" accent="bg-amber-100 dark:bg-amber-500/20" icon={<AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />} />
        <MetricCard label="Avg backoff delay" value="1.75s" sub="Across retry attempts" accent="bg-sky-100 dark:bg-sky-500/20" icon={<Clock size={16} className="text-sky-600 dark:text-sky-400" />} />
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">504 Error rate &middot; last 20 minutes</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">All API endpoints &middot; errors per minute</p>
          </div>
          <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full",
            circuitState === "closed" ? "bg-green-50 dark:bg-green-500/15 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400")}>
            {circuitState === "closed" ? "\u25cf Stable" : "\u25cf Incident"}
          </span>
        </div>
        <ErrorRateChart data={chartData} />
      </div>

      <RetrySimulator onCircuitTrip={handleCircuitTrip} />

      <RecentErrors errors={errors} onDismiss={dismissError} />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Wifi size={15} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Implementation Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Exponential Backoff",   desc: "3 retry attempts with delays of 0s, 1s, 2s (doubling). Adds \u00b1200ms jitter to prevent thundering herd.",                                color: "border-l-amber-400" },
            { title: "Circuit Breaker",       desc: "Trips OPEN after 5 failures in 5 minutes. Half-open after 30s. Allows 1 test probe before closing.",                                       color: "border-l-red-400"   },
            { title: "Fallback Strategy",     desc: "When circuit is open, returns last cached response. Displays degraded-mode banner to user. Logs to PagerDuty.",                             color: "border-l-sky-400"   },
          ].map(item => (
            <div key={item.title} className={cn("border-l-2 pl-3 py-1", item.color)}>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{item.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
