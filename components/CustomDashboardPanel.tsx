"use client";

import { useState, useRef } from "react";
import {
  Plus, Trash2, GripVertical, LayoutDashboard, Zap, Bell,
  Building2, Activity, TrendingDown, CheckCircle2, X,
  BookOpen, Save, ToggleRight,
  ShieldCheck, Edit3, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildings, alerts, energyData, Building } from "@/lib/mockData";

type WidgetType =
  | "energy_chart"
  | "kpi_summary"
  | "active_alerts"
  | "buildings_list"
  | "power_draw"
  | "energy_savings"
  | "zones_status"
  | "co2_offset";

type WidgetSize = "small" | "medium" | "large";

interface WidgetConfig {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  title: string;
}

const WIDGET_CATALOG: { type: WidgetType; label: string; desc: string; icon: React.ReactNode; defaultSize: WidgetSize }[] = [
  { type: "energy_chart",   label: "Energy Chart",     desc: "kWh usage vs. baseline over time",   icon: <Activity size={16} className="text-amber-500" />,    defaultSize: "large"  },
  { type: "kpi_summary",    label: "KPI Summary",      desc: "Buildings, zones, power & savings",  icon: <LayoutDashboard size={16} className="text-sky-500" />, defaultSize: "large"  },
  { type: "active_alerts",  label: "Active Alerts",    desc: "Critical and warning alerts",        icon: <Bell size={16} className="text-red-500" />,          defaultSize: "medium" },
  { type: "buildings_list", label: "Buildings Status", desc: "All buildings with live power draw", icon: <Building2 size={16} className="text-violet-500" />,   defaultSize: "medium" },
  { type: "power_draw",     label: "Power Draw",       desc: "Live kW across all zones",           icon: <Zap size={16} className="text-amber-500" />,         defaultSize: "small"  },
  { type: "energy_savings", label: "Energy Savings",   desc: "% saved vs. last-year baseline",    icon: <TrendingDown size={16} className="text-green-500" />, defaultSize: "small"  },
  { type: "zones_status",   label: "Zones Status",     desc: "Active vs. total zones summary",    icon: <ToggleRight size={16} className="text-sky-500" />,    defaultSize: "small"  },
  { type: "co2_offset",     label: "CO\u2082 Offset",  desc: "Estimated carbon offset this month", icon: <ShieldCheck size={16} className="text-emerald-500" />, defaultSize: "small" },
];

const TEMPLATES: { id: string; name: string; desc: string; widgets: Omit<WidgetConfig, "id">[] }[] = [
  {
    id: "default",
    name: "Default Overview",
    desc: "A balanced view of energy, buildings, and alerts",
    widgets: [
      { type: "kpi_summary",    size: "large",  title: "KPI Summary" },
      { type: "energy_chart",   size: "large",  title: "Energy Usage Today" },
      { type: "active_alerts",  size: "medium", title: "Active Alerts" },
      { type: "buildings_list", size: "medium", title: "Buildings Status" },
    ],
  },
  {
    id: "energy_focus",
    name: "Energy Focus",
    desc: "Deep-dive into energy metrics and savings",
    widgets: [
      { type: "energy_chart",   size: "large",  title: "Energy Usage Today" },
      { type: "power_draw",     size: "small",  title: "Live Power Draw" },
      { type: "energy_savings", size: "small",  title: "Energy Savings" },
      { type: "co2_offset",     size: "small",  title: "CO\u2082 Offset" },
      { type: "kpi_summary",    size: "large",  title: "KPI Summary" },
    ],
  },
  {
    id: "facilities",
    name: "Facilities Manager",
    desc: "Focus on buildings, zones, and alerts",
    widgets: [
      { type: "buildings_list", size: "medium", title: "Buildings Status" },
      { type: "active_alerts",  size: "medium", title: "Active Alerts" },
      { type: "zones_status",   size: "small",  title: "Zones Status" },
      { type: "power_draw",     size: "small",  title: "Live Power Draw" },
      { type: "energy_chart",   size: "large",  title: "Energy Usage Today" },
    ],
  },
];

function totalWatts(blds: Building[]) {
  return blds.flatMap(b => b.floors).flatMap(f => f.zones).reduce((s, z) => s + z.powerWatts, 0);
}
function totalZones(blds: Building[]) {
  return blds.flatMap(b => b.floors).flatMap(f => f.zones).length;
}
function zonesOn(blds: Building[]) {
  return blds.flatMap(b => b.floors).flatMap(f => f.zones).filter(z => z.isOn).length;
}

let widgetIdCounter = 100;
function makeWidgetId() { return `w${++widgetIdCounter}`; }
function makeLayout(template: typeof TEMPLATES[0]): WidgetConfig[] {
  return template.widgets.map(w => ({ ...w, id: makeWidgetId() }));
}

function MiniEnergyChart() {
  const W = 500, H = 140, padL = 30, padR = 12, padT = 10, padB = 24;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxY = Math.max(...energyData.map(d => Math.max(d.kWh, d.baseline))) * 1.15;
  const xStep = chartW / (energyData.length - 1);
  const px = (i: number) => padL + i * xStep;
  const py = (v: number) => padT + chartH - (v / maxY) * chartH;
  const kwhPath = energyData.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.kWh).toFixed(1)}`).join(" ");
  const basePath = energyData.map((d, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(d.baseline).toFixed(1)}`).join(" ");
  const fillPath = kwhPath + ` L${px(energyData.length - 1).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL},${(padT + chartH).toFixed(1)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 140 }}>
      <defs>
        <linearGradient id="miniKwhGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={basePath} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={fillPath} fill="url(#miniKwhGrad)" />
      <path d={kwhPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {energyData.map((d, i) => i % 3 === 0 && (
        <text key={i} x={px(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="currentColor" fillOpacity="0.4" className="text-slate-500">{d.hour}</text>
      ))}
    </svg>
  );
}

function WidgetContent({ widget }: { widget: WidgetConfig }) {
  const watts = totalWatts(buildings);
  const zones = totalZones(buildings);
  const on = zonesOn(buildings);
  const criticalAlerts = alerts.filter(a => a.severity !== "info");

  if (widget.type === "energy_chart") return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400 dark:text-slate-500">All buildings &middot; kWh per hour</p>
        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/15 px-2 py-0.5 rounded-full">&darr; 31% vs baseline</span>
      </div>
      <MiniEnergyChart />
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-amber-400 rounded" /><span className="text-[10px] text-slate-400">Actual</span></div>
        <div className="flex items-center gap-1.5"><div className="w-5 border-t border-dashed border-slate-400" /><span className="text-[10px] text-slate-400">Baseline</span></div>
      </div>
    </div>
  );

  if (widget.type === "kpi_summary") {
    const kpis = [
      { label: "Buildings", value: String(buildings.length), sub: "All online", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-100 dark:bg-sky-500/20", icon: <Building2 size={14} className="text-sky-600 dark:text-sky-400" /> },
      { label: "Zones active", value: `${on}/${zones}`, sub: "Across all floors", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/20", icon: <Zap size={14} className="text-amber-600 dark:text-amber-400" /> },
      { label: "Live power", value: `${(watts/1000).toFixed(1)} kW`, sub: "Combined draw", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-500/20", icon: <Activity size={14} className="text-violet-600 dark:text-violet-400" /> },
      { label: "Savings", value: "31%", sub: "vs. last year", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-500/20", icon: <TrendingDown size={14} className="text-green-600 dark:text-green-400" /> },
    ];
    return (
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", k.bg)}>{k.icon}</div>
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{k.label}</p>
              <p className={cn("text-sm font-bold", k.color)}>{k.value}</p>
              <p className="text-[10px] text-slate-400">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (widget.type === "active_alerts") return (
    <div className="space-y-2">
      {criticalAlerts.length === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-500/10">
          <CheckCircle2 size={14} className="text-green-500" />
          <p className="text-xs text-green-700 dark:text-green-400 font-medium">All clear</p>
        </div>
      )}
      {criticalAlerts.slice(0, 4).map(a => (
        <div key={a.id} className={cn("flex items-start gap-2 p-2.5 rounded-xl", a.severity === "critical" ? "bg-red-50 dark:bg-red-500/10" : "bg-amber-50 dark:bg-amber-500/10")}>
          <span className={cn("shrink-0 w-1.5 h-1.5 rounded-full mt-1.5", a.severity === "critical" ? "bg-red-500" : "bg-amber-500")} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{a.message}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{a.zone} &middot; {a.ts}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (widget.type === "buildings_list") return (
    <div className="space-y-2">
      {buildings.map(b => {
        const bZones = b.floors.flatMap(f => f.zones);
        const bOn = bZones.filter(z => z.isOn).length;
        const bWatts = bZones.reduce((s, z) => s + z.powerWatts, 0);
        return (
          <div key={b.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{b.name}</p>
              <p className="text-[10px] text-slate-400">{b.location}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{bOn}/{bZones.length}</p>
              <p className="text-[10px] text-slate-400">{(bWatts/1000).toFixed(1)} kW</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (widget.type === "power_draw") {
    const kw = (watts / 1000).toFixed(1);
    const pct = Math.min(100, (watts / 5000) * 100);
    return (
      <div className="flex flex-col items-center py-2">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 40 * pct / 100} ${2 * Math.PI * 40 * (1 - pct / 100)}`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{kw}</span>
            <span className="text-[10px] text-slate-400 font-medium">kW live</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{on} of {zones} zones active</p>
      </div>
    );
  }

  if (widget.type === "energy_savings") return (
    <div className="flex flex-col items-center py-3">
      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-2">
        <TrendingDown size={28} className="text-green-600 dark:text-green-400" />
      </div>
      <p className="text-3xl font-extrabold text-green-600 dark:text-green-400">31%</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">energy saved vs. last-year baseline</p>
      <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: "31%" }} />
      </div>
    </div>
  );

  if (widget.type === "zones_status") {
    const pct = Math.round((on / zones) * 100);
    return (
      <div className="flex flex-col items-center py-2">
        <div className="flex items-end gap-3 mb-3">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-amber-500">{on}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">zones on</p>
          </div>
          <div className="text-slate-300 dark:text-slate-700 mb-3 text-lg">/</div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-slate-300 dark:text-slate-600">{zones}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">total</p>
          </div>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
          <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">{pct}% utilization</p>
      </div>
    );
  }

  if (widget.type === "co2_offset") return (
    <div className="flex flex-col items-center py-3">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-2">
        <ShieldCheck size={28} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">2.1 t</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">CO&#x2082; offset this month</p>
      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
        &asymp; 230 trees planted
      </p>
    </div>
  );

  return null;
}

function WidgetCard({
  widget, editing, dragging, dragOver,
  onDragStart, onDragOver, onDragEnd, onDrop, onRemove, onRename,
}: {
  widget: WidgetConfig; editing: boolean; dragging: boolean; dragOver: boolean;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void; onDrop: () => void;
  onRemove: () => void; onRename: (t: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(widget.title);

  function commitTitle() {
    const t = titleDraft.trim();
    if (t) onRename(t); else setTitleDraft(widget.title);
    setEditingTitle(false);
  }

  const sizeClass = widget.size === "large" ? "col-span-2" : "col-span-1";

  return (
    <div
      className={cn(sizeClass, "rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all select-none",
        dragOver ? "border-amber-400 ring-2 ring-amber-400/30 scale-[1.01]" : "border-slate-200 dark:border-slate-700/60",
        dragging ? "opacity-40" : "opacity-100",
        editing ? "cursor-grab active:cursor-grabbing" : ""
      )}
      draggable={editing}
      onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDrop={onDrop}
    >
      <div className={cn("flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800", editing && "bg-slate-50/80 dark:bg-slate-800/40 rounded-t-2xl")}>
        {editing && <GripVertical size={14} className="text-slate-300 dark:text-slate-600 shrink-0 cursor-grab" />}
        {editingTitle ? (
          <input autoFocus value={titleDraft} onChange={e => setTitleDraft(e.target.value)} onBlur={commitTitle}
            onKeyDown={e => { if (e.key === "Enter") commitTitle(); if (e.key === "Escape") { setTitleDraft(widget.title); setEditingTitle(false); } }}
            className="flex-1 text-sm font-semibold bg-transparent border-b border-amber-400 outline-none text-slate-900 dark:text-white" />
        ) : (
          <p className="flex-1 text-sm font-semibold text-slate-900 dark:text-white truncate">{widget.title}</p>
        )}
        {editing && !editingTitle && (
          <button onClick={() => { setTitleDraft(widget.title); setEditingTitle(true); }} className="p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors" title="Rename">
            <Edit3 size={12} />
          </button>
        )}
        {editing && (
          <button onClick={onRemove} className="p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors" title="Remove">
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div className="p-4"><WidgetContent widget={widget} /></div>
    </div>
  );
}

function AddWidgetModal({ onAdd, onClose }: { onAdd: (type: WidgetType, size: WidgetSize, title: string) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<WidgetType | null>(null);
  function handleAdd() {
    if (!selected) return;
    const def = WIDGET_CATALOG.find(w => w.type === selected)!;
    onAdd(def.type, def.defaultSize, def.label);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Widget</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={16} /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {WIDGET_CATALOG.map(w => (
            <button key={w.type} onClick={() => setSelected(w.type)}
              className={cn("flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all",
                selected === w.type ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-400/30"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600")}>
              <div className="shrink-0 mt-0.5">{w.icon}</div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{w.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{w.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
          <button onClick={handleAdd} disabled={!selected} className="px-4 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-40 transition-colors">Add widget</button>
        </div>
      </div>
    </div>
  );
}

function TemplatePicker({ onApply, onClose }: { onApply: (t: typeof TEMPLATES[0]) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2"><BookOpen size={15} className="text-amber-500" /><h3 className="text-sm font-bold text-slate-900 dark:text-white">Apply Template</h3></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
        </div>
        <div className="p-4 space-y-2">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { onApply(t); onClose(); }}
              className="w-full flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all text-left group">
              <LayoutDashboard size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400">{t.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">{t.widgets.length} widgets</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomDashboardPanel() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => makeLayout(TEMPLATES[0]));
  const [editing, setEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedName, setSavedName] = useState("My Dashboard");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("My Dashboard");
  const dragSrc = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function addWidget(type: WidgetType, size: WidgetSize, title: string) {
    setWidgets(prev => [...prev, { id: makeWidgetId(), type, size, title }]);
  }
  function removeWidget(id: string) { setWidgets(prev => prev.filter(w => w.id !== id)); }
  function renameWidget(id: string, title: string) { setWidgets(prev => prev.map(w => w.id === id ? { ...w, title } : w)); }
  function handleDrop(targetId: string) {
    if (!dragSrc.current || dragSrc.current === targetId) return;
    setWidgets(prev => {
      const srcIdx = prev.findIndex(w => w.id === dragSrc.current);
      const tgtIdx = prev.findIndex(w => w.id === targetId);
      if (srcIdx < 0 || tgtIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(srcIdx, 1);
      next.splice(tgtIdx, 0, moved);
      return next;
    });
    dragSrc.current = null; setDraggingId(null); setDragOverId(null);
  }
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function applyTemplate(t: typeof TEMPLATES[0]) {
    setWidgets(makeLayout(t)); setSavedName(t.name); setNameDraft(t.name);
  }
  function commitName() {
    const n = nameDraft.trim(); if (n) setSavedName(n); else setNameDraft(savedName); setEditingName(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {editingName ? (
          <input autoFocus value={nameDraft} onChange={e => setNameDraft(e.target.value)} onBlur={commitName}
            onKeyDown={e => { if (e.key === "Enter") commitName(); if (e.key === "Escape") { setNameDraft(savedName); setEditingName(false); } }}
            className="text-sm font-bold bg-transparent border-b border-amber-400 outline-none text-slate-900 dark:text-white w-40" />
        ) : (
          <button onClick={() => { setNameDraft(savedName); setEditingName(true); }} className="flex items-center gap-1.5 group mr-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{savedName}</h2>
            <Edit3 size={12} className="text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
          </button>
        )}
        <div className="flex-1" />
        <button onClick={() => setShowTemplates(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <BookOpen size={13} /> Templates
        </button>
        <button onClick={() => setEditing(e => !e)} className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors",
          editing ? "border-amber-400 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
          {editing ? <><Eye size={13} /> Preview</> : <><Edit3 size={13} /> Edit layout</>}
        </button>
        {editing && (
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-white transition-colors shadow">
            <Plus size={13} /> Add widget
          </button>
        )}
        <button onClick={handleSave} className={cn("flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors",
          saved ? "bg-green-500 text-white" : "bg-slate-900 dark:bg-white hover:opacity-90 text-white dark:text-slate-900")}>
          {saved ? <><CheckCircle2 size={13} /> Saved!</> : <><Save size={13} /> Save</>}
        </button>
      </div>

      {editing && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20">
          <GripVertical size={14} className="text-amber-500 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Drag widgets to reorder &middot; Click trash to remove &middot; Click pencil to rename</p>
        </div>
      )}

      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
          <LayoutDashboard size={36} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Your dashboard is empty</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-4">Add widgets or start from a template</p>
          <div className="flex gap-2">
            <button onClick={() => setShowTemplates(true)} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <BookOpen size={13} /> Browse templates
            </button>
            <button onClick={() => { setEditing(true); setShowAddModal(true); }} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-white transition-colors">
              <Plus size={13} /> Add widget
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {widgets.map(w => (
            <WidgetCard key={w.id} widget={w} editing={editing}
              dragging={draggingId === w.id} dragOver={dragOverId === w.id}
              onDragStart={() => { dragSrc.current = w.id; setDraggingId(w.id); }}
              onDragOver={e => { e.preventDefault(); if (dragSrc.current !== w.id) setDragOverId(w.id); }}
              onDragEnd={() => { setDraggingId(null); setDragOverId(null); dragSrc.current = null; }}
              onDrop={() => handleDrop(w.id)}
              onRemove={() => removeWidget(w.id)}
              onRename={title => renameWidget(w.id, title)} />
          ))}
        </div>
      )}

      {showAddModal && <AddWidgetModal onAdd={addWidget} onClose={() => setShowAddModal(false)} />}
      {showTemplates && <TemplatePicker onApply={applyTemplate} onClose={() => setShowTemplates(false)} />}
    </div>
  );
}
