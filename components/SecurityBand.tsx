"use client";
import { useState } from "react";
import { ShieldCheck, Lock, ScrollText, Download, CheckCircle2, KeyRound, FileSearch } from "lucide-react";

const bullets = [
  { icon: KeyRound,     label: "SSO / SAML 2.0 & OIDC"             },
  { icon: ShieldCheck,  label: "Role-based access control (RBAC)"   },
  { icon: ScrollText,   label: "Immutable audit logs"               },
  { icon: FileSearch,   label: "Exportable events (Snowflake, S3)"  },
  { icon: Lock,         label: "TLS 1.3 in transit · AES-256 at rest"},
  { icon: CheckCircle2, label: "SOC 2 Type II certified"            },
];

export default function SecurityBand({ onToast }: { onToast: (msg: string) => void }) {
  return (
    <section id="security" className="py-20 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800 text-amber-400 text-xs font-semibold mb-5">
              <ShieldCheck size={12} /> Enterprise security
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Security built in,<br />not bolted on.
            </h2>
            <p className="text-slate-400 max-w-md leading-relaxed mb-8">
              LumiGlow was designed with a security-first architecture. Every layer of the stack — from the edge agent to the data plane — is hardened for regulated industries.
            </p>
            <button
              onClick={() => onToast("Security overview PDF queued — check your inbox.")}
              className="group flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <Download size={16} />
              Download security overview
            </button>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bullets.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
              >
                <Icon size={16} className="text-amber-400 shrink-0" />
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
