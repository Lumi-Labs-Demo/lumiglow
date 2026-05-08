"use client";
import Link from "next/link";
import { ArrowRight, Play, ShieldCheck, Zap, Activity } from "lucide-react";

const stats = [
  { icon: Activity, label: "Events / day processed", value: "1M+" },
  { icon: ShieldCheck, label: "Compliance posture",   value: "SOC 2 Ready" },
  { icon: Zap, label: "Control latency",             value: "< 200 ms" },
];

export default function Hero({ onPreview }: { onPreview: () => void }) {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-amber-950/10" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-6 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-slow" />
          Enterprise lighting intelligence — now generally available
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-tight animate-slide-up">
          Command every lumen.{" "}
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            At enterprise scale.
          </span>
        </h1>

        {/* Subhead */}
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-slide-up">
          LumiGlow is the policy-driven SaaS platform that gives facilities and IT teams
          real-time control, granular RBAC, and deep analytics across every building in your portfolio.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-slide-up">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-400/40 transition-all"
          >
            Go to Dashboard
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button
            onClick={onPreview}
            className="group flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
          >
            <Play size={15} className="text-amber-500" />
            View interactive preview
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 px-6 py-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <Icon size={22} className="text-amber-500" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
