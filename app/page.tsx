"use client";

import { useState, useCallback, useRef } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ConsolePreview from "@/components/ConsolePreview";
import FeatureGrid from "@/components/FeatureGrid";
import SecurityBand from "@/components/SecurityBand";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Modal from "@/components/Modal";
import Toast from "@/components/Toast";

export default function HomePage() {
  const [demoModal, setDemoModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  function scrollToPreview() {
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Nav onDemo={() => setDemoModal(true)} />

      <main>
        <Hero onDemo={() => setDemoModal(true)} onPreview={scrollToPreview} />

        <div ref={previewRef}>
          <ConsolePreview />
        </div>

        <FeatureGrid />
        <SecurityBand onToast={showToast} />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>

      <Footer />

      {/* Demo request modal */}
      {demoModal && (
        <Modal title="Request a demo" onClose={() => setDemoModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Tell us about your environment and a solutions engineer will reach out within one business day.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full name"
                aria-label="Full name"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                type="email"
                placeholder="Work email"
                aria-label="Work email"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <input
                type="text"
                placeholder="Company"
                aria-label="Company"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <select
                aria-label="Portfolio size"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Portfolio size</option>
                <option>1–5 buildings</option>
                <option>6–25 buildings</option>
                <option>26–100 buildings</option>
                <option>100+ buildings</option>
              </select>
            </div>
            <button
              onClick={() => { setDemoModal(false); showToast("Demo request received — we'll be in touch soon!"); }}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl transition-all"
            >
              Request demo
            </button>
            <p className="text-xs text-center text-slate-400">
              This is a demo — no data is submitted.
            </p>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </>
  );
}
