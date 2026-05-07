"use client";
import {
  LayoutGrid, CalendarClock, ScrollText, ShieldCheck,
  Plug, BarChart3,
} from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "Centralized Lighting Control",
    description:
      "Manage every zone across every building from a single pane of glass. Real-time state updates with sub-200 ms latency — even across continents.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
  },
  {
    icon: CalendarClock,
    title: "Policies & Schedules",
    description:
      "Define lighting policies as code. Cron schedules, occupancy triggers, holiday overrides, and dimming curves — applied to any scope from a single zone to the entire portfolio.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
  },
  {
    icon: ScrollText,
    title: "Immutable Audit Log",
    description:
      "Every state change, policy evaluation, and user action produces a structured, tamper-evident event. Exportable to Snowflake, S3, or your SIEM on demand.",
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800",
  },
  {
    icon: ShieldCheck,
    title: "RBAC + SSO",
    description:
      "Fine-grained roles scoped to zones, floors, buildings, or tags. First-class SAML 2.0 / OIDC with Azure AD, Okta, and any compliant IdP. SCIM 2.0 provisioning included.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-800",
  },
  {
    icon: Plug,
    title: "Integrations",
    description:
      "Connect to your existing stack out of the box.",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-800",
    integrations: ["Azure AD", "Snowflake", "Webhooks", "Kafka", "PagerDuty", "Slack"],
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description:
      "Track energy consumption, uptime, and savings vs. baseline across any time window. Scheduled PDF reports and live dashboards — no BI tool required.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Built for the complexity of enterprise portfolios, not retrofitted for it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`group rounded-2xl border ${f.border} ${f.bg} p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                  <Icon size={20} className={f.color} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.description}</p>
                {f.integrations && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {f.integrations.map((name) => (
                      <span
                        key={name}
                        className="px-2 py-0.5 text-xs font-medium rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {name}
                      </span>
                    ))}
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
