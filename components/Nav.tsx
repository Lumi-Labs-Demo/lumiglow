"use client";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Zap, Check, Sparkles, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { pricingTiers } from "@/lib/mockData";

const links = ["Product", "Security", "Pricing", "Customers", "Docs"];

export default function Nav({ onDemo }: { onDemo: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close pricing dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pricingRef.current && !pricingRef.current.contains(e.target as Node)) {
        setPricingOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
        scrolled
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md group-hover:shadow-amber-400/40 transition-shadow">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Lumi<span className="text-amber-500">Glow</span>
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) =>
              l === "Pricing" ? (
                <div key={l} className="relative" ref={pricingRef}>
                  <button
                    onClick={() => setPricingOpen((v) => !v)}
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      pricingOpen
                        ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    Pricing
                    <ChevronDown
                      size={14}
                      className={cn("transition-transform duration-200", pricingOpen && "rotate-180")}
                    />
                  </button>

                  {pricingOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[780px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-900/10 dark:shadow-slate-950/40 p-5 animate-fade-in">
                      {/* Header row */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">
                            Transparent pricing that scales with you
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            14-day free trial · No credit card required
                          </p>
                        </div>
                        <a
                          href="#pricing"
                          onClick={() => setPricingOpen(false)}
                          className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors"
                        >
                          See full comparison →
                        </a>
                      </div>

                      {/* Tier cards */}
                      <div className="grid grid-cols-3 gap-4">
                        {pricingTiers.map((tier) => (
                          <div
                            key={tier.id}
                            className={cn(
                              "relative rounded-xl border p-4 flex flex-col transition-all",
                              tier.highlighted
                                ? "bg-slate-900 dark:bg-slate-800 border-amber-500/60 shadow-lg shadow-amber-500/10"
                                : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                            )}
                          >
                            {tier.badge && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow">
                                <Sparkles size={8} /> {tier.badge}
                              </div>
                            )}

                            {/* Plan name & price */}
                            <div className="mb-3">
                              <p className={cn("text-xs font-semibold uppercase tracking-wider mb-1", tier.highlighted ? "text-amber-400" : "text-slate-500 dark:text-slate-400")}>
                                {tier.name}
                              </p>
                              <div className="flex items-end gap-1">
                                <span className={cn("text-2xl font-extrabold leading-none", tier.highlighted ? "text-white" : "text-slate-900 dark:text-white")}>
                                  {tier.price}
                                </span>
                                <span className={cn("text-xs pb-0.5", tier.highlighted ? "text-slate-400" : "text-slate-400")}>
                                  {tier.period}
                                </span>
                              </div>
                              <p className={cn("text-xs mt-1.5 leading-snug", tier.highlighted ? "text-slate-400" : "text-slate-500 dark:text-slate-400")}>
                                {tier.description}
                              </p>
                            </div>

                            {/* Top features (first 5 included) */}
                            <ul className="space-y-1.5 mb-4 flex-1">
                              {tier.features.filter((f) => f.included).slice(0, 5).map((f) => (
                                <li key={f.text} className="flex items-start gap-2">
                                  <Check size={11} className="text-green-500 mt-0.5 shrink-0" />
                                  <span className={cn("text-[11px] leading-snug", tier.highlighted ? "text-slate-300" : "text-slate-600 dark:text-slate-300")}>
                                    {f.text}
                                  </span>
                                </li>
                              ))}
                              {tier.features.filter((f) => f.included).length > 5 && (
                                <li className={cn("text-[11px]", tier.highlighted ? "text-slate-500" : "text-slate-400")}>
                                  +{tier.features.filter((f) => f.included).length - 5} more included
                                </li>
                              )}
                            </ul>

                            {/* CTA */}
                            <a
                              href="#pricing"
                              onClick={() => setPricingOpen(false)}
                              className={cn(
                                "block text-center text-xs font-semibold py-2 rounded-lg transition-all",
                                tier.highlighted
                                  ? "bg-amber-500 hover:bg-amber-400 text-white shadow shadow-amber-500/30"
                                  : "bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600"
                              )}
                            >
                              {tier.cta}
                            </a>
                          </div>
                        ))}
                      </div>

                      {/* Footer note */}
                      <p className="text-[11px] text-slate-400 text-center mt-4">
                        All plans billed annually · Monthly billing +20% · Volume discounts for 50+ buildings
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={l}
                  href={`#${l.toLowerCase()}`}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {l}
                </a>
              )
            )}
          </nav>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <a
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Sign in
            </a>
            <button
              onClick={onDemo}
              className="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white rounded-lg shadow-sm hover:shadow-amber-400/30 transition-all"
            >
              Request demo
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pb-4 animate-fade-in">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase()}`}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors"
            >
              {l}
            </a>
          ))}

          {/* Mobile pricing summary */}
          <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5",
                  i < pricingTiers.length - 1 && "border-b border-slate-100 dark:border-slate-800",
                  tier.highlighted && "bg-slate-900 dark:bg-slate-800"
                )}
              >
                <div>
                  <span className={cn("text-xs font-semibold", tier.highlighted ? "text-amber-400" : "text-slate-700 dark:text-slate-300")}>
                    {tier.name}
                  </span>
                  {tier.badge && (
                    <span className="ml-1.5 text-[10px] font-bold text-amber-500">★ {tier.badge}</span>
                  )}
                </div>
                <span className={cn("text-sm font-bold", tier.highlighted ? "text-white" : "text-slate-900 dark:text-white")}>
                  {tier.price}
                  <span className={cn("text-[10px] font-normal ml-1", tier.highlighted ? "text-slate-400" : "text-slate-400")}>
                    {tier.period}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <a
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="mt-3 block w-full text-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Sign in
          </a>
          <button
            onClick={() => { setOpen(false); onDemo(); }}
            className="mt-2 w-full px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white rounded-lg transition-all"
          >
            Request demo
          </button>
        </div>
      )}
    </header>
  );
}
