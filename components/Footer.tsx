"use client";
import { Zap, Globe, AtSign, Rss } from "lucide-react";

const links = {
  Product: ["Features", "Security", "Integrations", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press", "Contact"],
  Resources: ["Docs", "API Reference", "Status", "Community", "Support"],
  Legal: ["Privacy Policy", "Terms of Service", "DPA", "Cookie Settings"],
};

export default function Footer() {
  return (
    <footer id="docs" className="bg-slate-900 dark:bg-slate-950 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="text-white font-bold">Lumi<span className="text-amber-500">Glow</span></span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              The enterprise lighting control platform. Real-time, policy-driven, and built for scale.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { Icon: AtSign, label: "Twitter / X" },
                { Icon: Globe,  label: "GitHub"      },
                { Icon: Rss,    label: "LinkedIn"    },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <Icon size={14} className="text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} LumiGlow, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-green-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
              All systems operational
            </span>
            <span className="text-xs text-slate-600">SOC 2 Type II certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
