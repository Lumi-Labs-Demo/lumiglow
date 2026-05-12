"use client";

import { useState } from "react";
import {
  Terminal, Code2, Play, CheckCircle2, AlertCircle,
  Cpu, Package, Globe, Zap, ChevronRight, Copy, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Snippet definitions ───────────────────────────────────────────────────────

const snippets = [
  {
    id: "init",
    label: "Initialize",
    icon: Package,
    code: `import { DevModeClient } from "@lumiglow/devmode-sdk";

const client = new DevModeClient({
  baseUrl: "https://staging.api.lumiglow.dev",
  apiKey: process.env.LUMIGLOW_DEVMODE_KEY!,
  logLevel: "info",
});`,
    output: [
      { type: "info",    text: "[devmode] Client initialized" },
      { type: "info",    text: "[devmode] Environment: staging" },
      { type: "success", text: "[devmode] Auth validated ✓" },
      { type: "info",    text: "[devmode] Tenant: sandbox-acme" },
    ],
  },
  {
    id: "seed",
    label: "Seed project",
    icon: Zap,
    code: `const project = await client.projects.create({
  name: "Demo Project",
});

await client.fixtures.seedProject(project.id, {
  preset: "retail-demo",
});`,
    output: [
      { type: "info",    text: "[devmode] Creating sandbox project…" },
      { type: "success", text: "[devmode] Project created: prj_abc123" },
      { type: "info",    text: "[devmode] Seeding preset: retail-demo" },
      { type: "info",    text: "[devmode] → 12 components, 3 themes" },
      { type: "success", text: "[devmode] Fixtures seeded ✓" },
    ],
  },
  {
    id: "simulate",
    label: "Run simulation",
    icon: Cpu,
    code: `const sim = await client.simulations.start({
  projectId: project.id,
  device: "Pixel_8",
  scenario: "checkout-flow",
});

const report = await client.simulations
  .stopAndFetchReport(sim.id);
console.log(report.summary);`,
    output: [
      { type: "info",    text: "[devmode] Starting simulation…" },
      { type: "info",    text: "[devmode] Device: Pixel_8" },
      { type: "info",    text: "[devmode] Scenario: checkout-flow" },
      { type: "success", text: "[devmode] sim_x9k2 started ✓" },
      { type: "info",    text: "[devmode] Streaming events…" },
      { type: "info",    text: "[devmode] → 47 events captured" },
      { type: "success", text: "[devmode] Report ready: rpt_7f3d" },
    ],
  },
  {
    id: "debug",
    label: "Export bundle",
    icon: Globe,
    code: `const bundle = await client.debug.exportBundle({
  projectId: project.id,
  includeEvents: true,
  includeLogs: true,
});

// Returns a signed URL valid for 24h
console.log(bundle.downloadUrl);`,
    output: [
      { type: "info",    text: "[devmode] Building debug bundle…" },
      { type: "info",    text: "[devmode] Attaching 47 events" },
      { type: "info",    text: "[devmode] Attaching server logs" },
      { type: "success", text: "[devmode] Bundle compressed: 2.1 MB" },
      { type: "success", text: "[devmode] Signed URL generated ✓" },
      { type: "info",    text: "[devmode] Expires: 24 h" },
    ],
  },
];

const modules = [
  { name: "client.projects.*",    ops: ["create", "get", "list", "archive"],                      color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-950/30",   border: "border-amber-200 dark:border-amber-800" },
  { name: "client.components.*",  ops: ["create", "update", "publish", "lint"],                   color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800" },
  { name: "client.themes.*",      ops: ["upload", "validate", "apply"],                            color: "text-sky-500",    bg: "bg-sky-50 dark:bg-sky-950/30",       border: "border-sky-200 dark:border-sky-800" },
  { name: "client.fixtures.*",    ops: ["seedProject", "resetProject", "generateEvents"],          color: "text-green-500",  bg: "bg-green-50 dark:bg-green-950/30",   border: "border-green-200 dark:border-green-800" },
  { name: "client.simulations.*", ops: ["start", "streamEvents", "stop", "stopAndFetchReport"],    color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  { name: "client.debug.*",       ops: ["exportBundle", "getServerInfo"],                          color: "text-rose-500",   bg: "bg-rose-50 dark:bg-rose-950/30",     border: "border-rose-200 dark:border-rose-800" },
];

const endpoints = [
  { method: "POST", path: "/devmode/projects",              purpose: "Create sandbox project" },
  { method: "POST", path: "/devmode/projects/:id/reset",    purpose: "Reset to clean state" },
  { method: "POST", path: "/devmode/fixtures/seed",         purpose: "Seed demo data" },
  { method: "POST", path: "/devmode/simulations",           purpose: "Start simulation" },
  { method: "GET",  path: "/devmode/simulations/:id/events",purpose: "Stream events (SSE)" },
  { method: "POST", path: "/devmode/simulations/:id/stop",  purpose: "Stop simulation" },
  { method: "POST", path: "/devmode/debug/bundle",          purpose: "Create debug bundle" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <button
      onClick={copy}
      aria-label="Copy code"
      className="p-1.5 rounded-md hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DevModeSDK() {
  const [activeSnippet, setActiveSnippet] = useState(snippets[0]);
  const [running, setRunning] = useState(false);
  const [outputLines, setOutputLines] = useState<typeof snippets[0]["output"]>([]);
  const [ran, setRan] = useState<string[]>([]);

  function runSnippet(snippet: typeof snippets[0]) {
    if (running) return;
    setActiveSnippet(snippet);
    setRunning(true);
    setOutputLines([]);

    snippet.output.forEach((line, i) => {
      setTimeout(() => {
        setOutputLines((prev) => [...prev, line]);
        if (i === snippet.output.length - 1) {
          setRunning(false);
          setRan((prev) => [...new Set([...prev, snippet.id])]);
        }
      }, 280 * (i + 1));
    });
  }

  return (
    <section id="devmode" className="py-24 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 text-xs font-semibold mb-4">
            <Code2 size={12} />
            @lumiglow/devmode-sdk — now available
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Build and iterate faster with{" "}
            <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Dev Mode SDK
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A typed TypeScript client for sandboxed development. Seed fixtures, run device simulations,
            and export debug bundles — all without production credentials.
          </p>
        </div>

        {/* Interactive terminal */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden mb-16">
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 dark:bg-slate-900 border-b border-slate-700">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-slate-400 font-mono">@lumiglow/devmode-sdk — TypeScript</span>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-violet-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Sandbox
            </span>
          </div>

          <div className="flex flex-col md:flex-row h-auto md:h-[440px]">
            {/* Snippet tabs — left rail */}
            <div className="flex md:flex-col gap-1 p-2 bg-slate-800/50 md:bg-slate-800 border-b md:border-b-0 md:border-r border-slate-700 overflow-x-auto md:overflow-x-visible md:w-44 shrink-0">
              {snippets.map((s) => {
                const Icon = s.icon;
                const done = ran.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSnippet(s); setOutputLines([]); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all text-xs font-medium whitespace-nowrap md:whitespace-normal w-full shrink-0",
                      activeSnippet.id === s.id
                        ? "bg-violet-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-700"
                    )}
                  >
                    <Icon size={13} className="shrink-0" />
                    <span className="flex-1">{s.label}</span>
                    {done && <CheckCircle2 size={11} className="text-green-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Code pane */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
                <span className="text-[10px] text-slate-500 font-mono">example.ts</span>
                <div className="flex items-center gap-1">
                  <CopyButton text={activeSnippet.code} />
                  <button
                    onClick={() => runSnippet(activeSnippet)}
                    disabled={running}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all",
                      running
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-500 text-white"
                    )}
                  >
                    <Play size={11} />
                    {running ? "Running…" : "Run"}
                  </button>
                </div>
              </div>

              {/* Code */}
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-300">
                <pre className="whitespace-pre-wrap break-words">{activeSnippet.code}</pre>
              </div>
            </div>

            {/* Output pane */}
            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-700 flex flex-col bg-slate-950">
              <div className="px-4 py-2 border-b border-slate-700 flex items-center gap-2">
                <Terminal size={12} className="text-slate-500" />
                <span className="text-[10px] text-slate-500 font-mono">Output</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[120px]">
                {outputLines.length === 0 && !running && (
                  <p className="text-[11px] text-slate-600 italic mt-2">
                    Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 not-italic">Run</kbd> to execute
                  </p>
                )}
                {outputLines.map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    {line.type === "success"
                      ? <CheckCircle2 size={10} className="text-green-400 mt-0.5 shrink-0" />
                      : line.type === "error"
                      ? <AlertCircle size={10} className="text-red-400 mt-0.5 shrink-0" />
                      : <ChevronRight size={10} className="text-slate-500 mt-0.5 shrink-0" />}
                    <span className={cn(
                      "font-mono text-[10px] leading-snug",
                      line.type === "success" ? "text-green-400" :
                      line.type === "error"   ? "text-red-400" :
                                                "text-slate-400"
                    )}>
                      {line.text}
                    </span>
                  </div>
                ))}
                {running && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="font-mono text-[10px] text-slate-500">executing…</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two-col: Modules + Endpoints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* SDK Modules */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Package size={18} className="text-violet-500" />
              SDK Modules
            </h3>
            <div className="space-y-2">
              {modules.map((m) => (
                <div
                  key={m.name}
                  className={`flex items-center gap-3 rounded-xl border ${m.border} ${m.bg} px-4 py-3 group hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150`}
                >
                  <code className={`text-xs font-mono font-semibold ${m.color} shrink-0`}>{m.name}</code>
                  <div className="flex flex-wrap gap-1 ml-auto">
                    {m.ops.map((op) => (
                      <span
                        key={op}
                        className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                      >
                        {op}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Server Endpoints */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Globe size={18} className="text-violet-500" />
              Server Endpoints
            </h3>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {endpoints.map((ep, i) => (
                <div
                  key={ep.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-xs",
                    i % 2 === 0
                      ? "bg-white dark:bg-slate-900"
                      : "bg-slate-50/70 dark:bg-slate-800/40",
                    i < endpoints.length - 1 && "border-b border-slate-100 dark:border-slate-800"
                  )}
                >
                  <span className={cn(
                    "shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono",
                    ep.method === "POST"
                      ? "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
                      : "bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
                  )}>
                    {ep.method}
                  </span>
                  <code className="flex-1 font-mono text-slate-700 dark:text-slate-300 truncate">{ep.path}</code>
                  <span className="hidden sm:block text-slate-400 dark:text-slate-500 shrink-0">{ep.purpose}</span>
                </div>
              ))}
            </div>

            {/* Auth + Error callout */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Auth</p>
                <code className="text-[10px] text-slate-500 dark:text-slate-400 break-all">
                  Authorization: Bearer &lt;key&gt;<br />
                  X-LumiGlow-Tenant: &lt;tenantId&gt;
                </code>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-4">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Typed Errors</p>
                <ul className="space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <li>AuthError · 401, 403</li>
                  <li>ValidationError · 400</li>
                  <li>RateLimitError · 429</li>
                  <li>ServerError · 5xx</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/20 px-6 py-5">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">Ready to start building?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Install the SDK and spin up a sandbox in under a minute.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <code className="px-3 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
              npm i @lumiglow/devmode-sdk
            </code>
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors">
              View docs →
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
