"use client";
import { useState } from "react";
import { Check, X, Sparkles } from "lucide-react";
import { pricingTiers } from "@/lib/mockData";
import Modal from "./Modal";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const [modal, setModal] = useState<{ open: boolean; tier: string }>({ open: false, tier: "" });

  return (
    <section id="pricing" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Transparent pricing that scales with you
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {pricingTiers.map((tier) => (
            <div
              key={tier.id}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col transition-all",
                tier.highlighted
                  ? "bg-slate-900 dark:bg-slate-800 border-amber-500/50 shadow-2xl shadow-amber-500/10 scale-[1.02]"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
              )}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow">
                  <Sparkles size={10} /> {tier.badge}
                </div>
              )}

              <div className="mb-5">
                <h3 className={cn("text-base font-semibold mb-1", tier.highlighted ? "text-white" : "text-slate-900 dark:text-white")}>
                  {tier.name}
                </h3>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className={cn("text-3xl font-extrabold", tier.highlighted ? "text-white" : "text-slate-900 dark:text-white")}>
                    {tier.price}
                  </span>
                  <span className={cn("text-sm pb-1", tier.highlighted ? "text-slate-400" : "text-slate-400")}>
                    {tier.period}
                  </span>
                </div>
                <p className={cn("text-sm", tier.highlighted ? "text-slate-400" : "text-slate-500 dark:text-slate-400")}>
                  {tier.description}
                </p>
              </div>

              <button
                onClick={() => setModal({ open: true, tier: tier.name })}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-semibold mb-6 transition-all",
                  tier.highlighted
                    ? "bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white"
                )}
              >
                {tier.cta}
              </button>

              <ul className="space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5">
                    {f.included
                      ? <Check size={14} className="text-green-500 mt-0.5 shrink-0" />
                      : <X size={14} className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0" />
                    }
                    <span className={cn(
                      "text-sm",
                      f.included
                        ? (tier.highlighted ? "text-slate-200" : "text-slate-700 dark:text-slate-300")
                        : "text-slate-300 dark:text-slate-600"
                    )}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          All plans billed annually. Monthly billing available at +20%. Volume discounts for 50+ buildings.
        </p>
      </div>

      {modal.open && (
        <Modal title={`Get started with ${modal.tier}`} onClose={() => setModal({ open: false, tier: "" })}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {modal.tier === "Enterprise"
                ? "Tell us about your portfolio and we'll put together a custom proposal."
                : "Start your 14-day free trial. No credit card required."}
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Your name"
                aria-label="Your name"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
              <input
                type="email"
                placeholder="Work email"
                aria-label="Work email"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
              <input
                type="text"
                placeholder="Company name"
                aria-label="Company name"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
            <button
              onClick={() => setModal({ open: false, tier: "" })}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all"
            >
              {modal.tier === "Enterprise" ? "Request a proposal" : "Start free trial"}
            </button>
            <p className="text-xs text-center text-slate-400">
              This is a demo — no data is submitted.
            </p>
          </div>
        </Modal>
      )}
    </section>
  );
}
