"use client";

import { useState, useRef, useEffect } from "react";
import {
  Building2, Layers, Sun, SunDim, PowerOff, Bell, BellRing,
  TrendingDown, ChevronRight, ChevronDown, AlertTriangle, Info, AlertCircle,
} from "lucide-react";
import { buildings, alerts, energyData } from "@/lib/mockData";
import type { Building, Floor, Zone } from "@/lib/mockData";
import { cn, formatWatts } from "@/lib/utils";

type ZoneState = Record<string, { isOn: boolean; brightness: number }>;

function buildInitialState(): ZoneState {
  const s: ZoneState = {};
  for (const b of buildings)
    for (const f of b.floors)
      for (const z of f.zones)
        s[z.id] = { isOn: z.isOn, brightness: z.brightness };
  return s;
}

export default function ConsolePreview() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building>(buildings[0]);
  const [selectedFloor, setSelectedFloor] = useState<Floor>(buildings[0].floors[0]);
  const [zones, setZones] = useState<ZoneState>(buildInitialState);
  const [expandedBuilding, setExpandedBuilding] = useState<string>(buildings[0].id);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw mini energy chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const maxVal = 12;
    const pad = { t: 8, b: 20, l: 8, r: 8 };
    const chartW = W - pad.l - pad.r;
    const chartH = H - pad.t - pad.b;
    const n = energyData.length;

    const xOf = (i: number) => pad.l + (i / (n - 1)) * chartW;
    const yOf = (v: number) => pad.t + chartH - (v / maxVal) * chartH;

    // Baseline area
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(energyData[0].baseline));
    for (let i = 1; i < n; i++) ctx.lineTo(xOf(i), yOf(energyData[i].baseline));
    ctx.lineTo(xOf(n - 1), yOf(0));
    ctx.lineTo(xOf(0), yOf(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(148,163,184,0.15)";
    ctx.fill();

    // Actual area
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(energyData[0].kWh));
    for (let i = 1; i < n; i++) ctx.lineTo(xOf(i), yOf(energyData[i].kWh));
    ctx.lineTo(xOf(n - 1), yOf(0));
    ctx.lineTo(xOf(0), yOf(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(245,158,11,0.25)";
    ctx.fill();

    // Actual line
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(energyData[0].kWh));
    for (let i = 1; i < n; i++) ctx.lineTo(xOf(i), yOf(energyData[i].kWh));
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // x-axis labels
    ctx.fillStyle = "rgba(148,163,184,0.8)";
    ctx.font = "8px Inter, sans-serif";
    ctx.textAlign = "center";
    [0, 4, 8, 12].forEach((i) => {
      ctx.fillText(energyData[i].hour, xOf(i), H - 4);
    });
  }, []);

  function toggleZone(id: string) {
    setZones((prev) => ({
      ...prev,
      [id]: { ...prev[id], isOn: !prev[id].isOn, brightness: !prev[id].isOn ? 75 : 0 },
    }));
  }

  function setBrightness(id: string, val: number) {
    setZones((prev) => ({
      ...prev,
      [id]: { ...prev[id], brightness: val, isOn: val > 0 },
    }));
  }

  const currentZones = selectedFloor.zones;
  const totalW = currentZones.reduce((acc, z) => acc + (zones[z.id].isOn ? z.powerWatts : 0), 0);

  return (
    <section id="product" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
            Demo Mode — Data is simulated
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            See LumiGlow in action
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Toggle lights, adjust brightness, and explore the dashboard. All interactions update live React state — no backend required.
          </p>
        </div>

        {/* Console Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-slate-400 font-mono">LumiGlow Console — HQ Tower</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
              Live
            </span>
          </div>

          <div className="flex h-[500px] sm:h-[520px] overflow-hidden">
            {/* ── Sidebar ── */}
            <aside className="w-44 sm:w-52 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col overflow-y-auto scrollbar-hide">
              <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Buildings</div>
              {buildings.map((b) => (
                <div key={b.id}>
                  <button
                    onClick={() => {
                      setExpandedBuilding(expandedBuilding === b.id ? "" : b.id);
                      setSelectedBuilding(b);
                      setSelectedFloor(b.floors[0]);
                      setSelectedZone(null);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors",
                      selectedBuilding.id === b.id
                        ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    )}
                  >
                    <Building2 size={13} />
                    <span className="truncate flex-1">{b.name}</span>
                    {expandedBuilding === b.id ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                  </button>

                  {expandedBuilding === b.id && (
                    <div className="ml-3 border-l border-slate-200 dark:border-slate-700 pl-2 pb-1">
                      <div className="py-0.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-2">Floors</div>
                      {b.floors.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => { setSelectedFloor(f); setSelectedBuilding(b); setSelectedZone(null); }}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors rounded",
                            selectedFloor.id === f.id
                              ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
                              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                          )}
                        >
                          <Layers size={11} />
                          <span className="truncate">{f.name.split("—")[0].trim()}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 overflow-y-auto scrollbar-hide p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{selectedFloor.name}</h3>
                  <p className="text-xs text-slate-400">{currentZones.filter((z) => zones[z.id].isOn).length}/{currentZones.length} zones active · {formatWatts(totalW)} live draw</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentZones.map((zone) => {
                  const s = zones[zone.id];
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
                      className={cn(
                        "relative cursor-pointer rounded-xl border p-3 transition-all group",
                        s.isOn
                          ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700",
                        selectedZone?.id === zone.id ? "ring-2 ring-amber-400" : ""
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-white">{zone.name}</p>
                          <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                            zone.schedule === "auto"    ? "bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400" :
                            zone.schedule === "manual"  ? "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400" :
                                                         "bg-slate-100 dark:bg-slate-700 text-slate-500"
                          )}>
                            {zone.schedule}
                          </span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleZone(zone.id); }}
                          aria-label={s.isOn ? "Turn off" : "Turn on"}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            s.isOn
                              ? "bg-amber-500 text-white hover:bg-amber-600"
                              : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500"
                          )}
                        >
                          {s.isOn ? <Sun size={13} /> : <PowerOff size={13} />}
                        </button>
                      </div>

                      {/* Brightness bar */}
                      <div className="flex items-center gap-2 mt-1">
                        <SunDim size={11} className="text-slate-400 shrink-0" />
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={s.brightness}
                          onChange={(e) => { e.stopPropagation(); setBrightness(zone.id, Number(e.target.value)); }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Brightness for ${zone.name}`}
                          className="flex-1 h-1.5 accent-amber-500 cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 w-7 text-right">{s.brightness}%</span>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-1.5 truncate">
                        Changed by {zone.lastChangedBy} · {zone.lastChangedAt}
                      </p>
                    </div>
                  );
                })}
              </div>
            </main>

            {/* ── Right Panel: Insights ── */}
            <aside className="hidden lg:flex w-56 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex-col overflow-y-auto scrollbar-hide">
              <div className="px-3 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Insights</div>

              {/* Energy chart */}
              <div className="mx-3 mb-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Energy Today</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-green-500 font-medium">
                    <TrendingDown size={9} />18% saved
                  </span>
                </div>
                <canvas ref={canvasRef} width={192} height={72} className="w-full" />
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-[9px] text-slate-400">
                    <span className="w-2 h-0.5 bg-amber-400 rounded" />Actual
                  </span>
                  <span className="flex items-center gap-1 text-[9px] text-slate-400">
                    <span className="w-2 h-0.5 bg-slate-300 rounded" />Baseline
                  </span>
                </div>
              </div>

              {/* Alerts */}
              <div className="px-3 pt-1 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <BellRing size={10} /> Alerts
              </div>
              <div className="px-2 pb-3 space-y-1.5 flex-1">
                {alerts.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    className={cn(
                      "flex items-start gap-2 px-2 py-1.5 rounded-lg text-[10px]",
                      a.severity === "critical" ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400" :
                      a.severity === "warning"  ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400" :
                                                  "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400"
                    )}
                  >
                    {a.severity === "critical" ? <AlertCircle size={11} className="mt-0.5 shrink-0" /> :
                     a.severity === "warning"  ? <AlertTriangle size={11} className="mt-0.5 shrink-0" /> :
                                                  <Info size={11} className="mt-0.5 shrink-0" />}
                    <span className="leading-tight">{a.message}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4">
          ✦ Interactions update local React state only — no API calls are made
        </p>
      </div>
    </section>
  );
}
