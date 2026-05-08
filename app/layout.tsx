"use client";

import "./globals.css";
import { useEffect, useState } from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("lumiglow-theme");
    // Default to dark mode unless the user explicitly chose light
    if (saved !== "light") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>LumiGlow — Enterprise Lighting Control Platform</title>
        <meta name="description" content="LumiGlow is the enterprise-grade SaaS platform for intelligent, policy-driven lighting control across your entire portfolio." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💡</text></svg>" />
      </head>
      <body className={mounted ? "" : "opacity-0"}>{children}</body>
    </html>
  );
}
