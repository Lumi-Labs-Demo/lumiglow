import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>LumiGlow — Enterprise Lighting Control Platform</title>
        <meta name="description" content="LumiGlow is the enterprise-grade SaaS platform for intelligent, policy-driven lighting control across your entire portfolio." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💡</text></svg>" />
        {/* Anti-FOUC: apply theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('lumiglow-theme');var dark=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
