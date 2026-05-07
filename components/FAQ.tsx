"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqItems } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function FAQ() {
  const [open, setOpen] = useState<string | null>(faqItems[0].id);

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently asked questions
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Can&apos;t find your answer? Talk to our team — we respond within one business day.
          </p>
        </div>

        <div className="space-y-2">
          {faqItems.map((item) => {
            const isOpen = open === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border transition-all",
                  isOpen
                    ? "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-white pr-4">{item.question}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-slate-400 shrink-0 transition-transform duration-200",
                      isOpen ? "rotate-180 text-amber-500" : ""
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 animate-fade-in">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
