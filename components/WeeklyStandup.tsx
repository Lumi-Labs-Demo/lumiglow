"use client";

import { useEffect, useRef } from "react";
import {
  X, TrendingDown, Zap, Building2, AlertTriangle,
  CheckCircle2, CalendarDays, BarChart3, Flame,
} from "lucide-react";
import { buildings, alerts, energyData } from "@/lib/mockData";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
}

// ── Derived weekly stats (mocked from existing data) ─────────────────────────
const totalZones = buildings.reduce((acc, b) => acc + b.floors.reduce((a, f) => a + f.zones.length, 0), 0);
const onZones = buildings.reduce((acc, b) => acc + b.floors.reduce((a, f) => a + f.zones.filter(z => z.isOn).length, 0), 0);
const totalWatts = buildings.reduce((acc, b) => acc + b.floors.reduce((a, f) => a + f.zones.reduce((x, z) => x + z.powerWatts, 0), 0), 0);

const weeklyKwh = energyData.reduce((a, p) => a + p.kWh, 0) * 7;
const baselineKwh = energyData.reduce((a, p) => a + p.baseline, 0) * 7;
const savingsPct = Math.round(((baselineKwh - weeklyKwh) / baselineKwh) * 100);

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weeklyEnergy = [{ day: "Mon", kWh: 84.2, baseline: 98.1 }, { day: "Tue", kWh: 91.7, baseline: 99.5 }, { day: "Wed", kWh: 79.3, baseline: 97.2 }, { day: "Thu", kWh: 88.4, baseline: 98.8 }, { day: "Fri", kWh: 82.1, baseline: 96.4 }, { day: "Sat", kWh: 41.2, baseline: 60.0 }, { day: "Sun", kWh: 38.6, baseline: 58.3 }];

const criticalAlerts = alerts.filter(a => a.severity === "critical").length;
const warningAlerts  = alerts.filter(a => a.severity === "warning").length;

const highlights = [
  { icon: TrendingDown, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", label: "Energy Saved", value: `${savingsPct}%`, sub: "vs. baseline this week" },
  { icon: Zap,          color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30",  border: "border-amber-200 dark:border-amber-800",  label: "Total kWh",    value: weeklyKwh.toFixed(0), sub: "consumed across all sites" },
  { icon: Building2,    color: "text-sky-500",   bg: "bg-sky-50 dark:bg-sky-950/30",      border: "border-sky-200 dark:border-sky-800",      label: "Active Zones", value: `${onZones}/${totalZones}`, sub: "zones online right now" },
  { icon: Flame,        color: "text-rose-500",  bg: "bg-rose-50 dark:bg-rose-950/30",    border: "border-rose-200 dark:border-rose-800",    label: "Live Draw",    value: `${(totalWatts / 1000).toFixed(1)} kW`, sub: "across all buildings" },
];

export default function WeeklyStandup({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw weekly bar chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const maxVal = 110;
    const pad = { t: 8, b: 24, l: 8, r: 8 };
    const chartW = W - pad.l - pad.r;
    const chartH = H - pad.t - pad.b;
    const n = weeklyEnergy.length;
    const groupW = chartW / n;
    const barW = groupW * 0.3;

    weeklyEnergy.forEach((d, i) => {
      const x = pad.l + i * groupW + groupW / 2;

      // Baseline bar
      const bH = (d.baseline / maxVal) * chartH;
      ctx.fillStyle = "rgba(148,163,184,0.2)";
      ctx.beginPath();
      ctx.roundRect(x - barW - 2, pad.t + chartH - bH, barW, bH, 3);
      ctx.fill();

      // Actual bar
      const aH = (d.kWh / maxVal) * chartH;
      ctx.fillStyle = d.kWh < d.baseline ? "rgba(245,158,11,0.85)" : "rgba(239,68,68,0.7)";
      ctx.beginPath();
      ctx.roundRect(x + 2, pad.t + chartH - aH, barW, aH, 3);
      ctx.fill();

      // Day label
      ctx.fillStyle = "rgba(148,163,184,0.9)";
      ctx.font = "9px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.day, x, H - 6);
    });
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Weekly Standup Report">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <CalendarDays size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Weekly Standup Report</h2>
              <p className="text-xs text-amber-100">Jun 16 – Jun 22, 2026 · All Buildings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close weekly standup"
            className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* KPI highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div key={h.label} className={cn("rounded-xl border p-3", h.bg, h.border)}>
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-2", h.bg, "border", h.border)}>
                    <Icon size={14} className={h.color} />
                  </div>
                  <div className={cn("text-xl font-bold", h.color)}>{h.value}</div>
                  <div className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{h.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{h.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Weekly energy chart */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-white">Energy by Day</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-amber-400/85" />Actual
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-600" />Baseline
                </span>
              </div>
            </div>
            <canvas ref={canvasRef} width={560} height={100} className="w-full" />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-400">Mon–Sun · kWh</span>
              <span className="flex items-center gap-1 text-[10px] text-green-500 font-semibold">
                <TrendingDown size={10} />{savingsPct}% below baseline
              </span>
            </div>
          </div>

          {/* Alerts summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-red-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-white">Critical Alerts</span>
              </div>
              <div className="text-3xl font-bold text-red-500">{criticalAlerts}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Require immediate attention</p>
              {alerts.filter(a => a.severity === "critical").map(a => (
                <div key={a.id} className="mt-2 text-[10px] text-red-600 dark:text-red-400 leading-tight border-t border-red-200 dark:border-red-800 pt-2">
                  {a.message} <span className="text-red-400">· {a.zone}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={14} className="text-amber-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-white">Warnings</span>
              </div>
              <div className="text-3xl font-bold text-amber-500">{warningAlerts}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review at your convenience</p>
              {alerts.filter(a => a.severity === "warning").map(a => (
                <div key={a.id} className="mt-2 text-[10px] text-amber-600 dark:text-amber-400 leading-tight border-t border-amber-200 dark:border-amber-800 pt-2">
                  {a.message} <span className="text-amber-400">· {a.zone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Building status */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Building Status</h3>
            <div className="space-y-2">
              {buildings.map((b) => {
                const allZones = b.floors.flatMap(f => f.zones);
                const onCount = allZones.filter(z => z.isOn).length;
                const pct = Math.round((onCount / allZones.length) * 100);
                return (
                  <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center shrink-0">
                      <Building2 size={13} className="text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-white truncate">{b.name}</span>
                        <span className="text-[10px] text-slate-400 ml-2 shrink-0">{onCount}/{allZones.length} zones · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{b.location}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">Auto-generated every Monday · Next report Jun 29, 2026</p>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
