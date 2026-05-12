"use client";
import { Monitor, Sun, Moon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Theme = "system" | "light" | "dark";

const OPTIONS: { value: Theme; label: string; Icon: typeof Monitor }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light",  label: "Light",  Icon: Sun },
  { value: "dark",   label: "Dark",   Icon: Moon },
];

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  if (dark) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem("lumiglow-theme") as Theme | null) ?? "system";
    setTheme(saved);

    // Keep system mode in sync when OS preference changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystem = () => {
      if ((localStorage.getItem("lumiglow-theme") ?? "system") === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", onSystem);
    return () => mq.removeEventListener("change", onSystem);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function select(next: Theme) {
    setTheme(next);
    setOpen(false);
    if (next === "system") {
      localStorage.removeItem("lumiglow-theme");
    } else {
      localStorage.setItem("lumiglow-theme", next);
    }
    applyTheme(next);
  }

  const current = OPTIONS.find((o) => o.value === theme)!;
  const Icon = current.Icon;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Appearance: ${current.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
      >
        <Icon size={15} aria-hidden />
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Appearance"
          className="absolute right-0 mt-1 w-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg shadow-slate-900/10 dark:shadow-slate-950/40 py-1 z-50 animate-fade-in"
        >
          {OPTIONS.map(({ value, label, Icon: OptionIcon }) => (
            <button
              key={value}
              role="option"
              aria-selected={theme === value}
              onClick={() => select(value)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-colors ${
                theme === value
                  ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <OptionIcon size={13} aria-hidden />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
