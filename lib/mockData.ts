// ─── Buildings / Floors / Zones ──────────────────────────────────────────────

export interface Zone {
  id: string;
  name: string;
  isOn: boolean;
  brightness: number; // 0-100
  schedule: "auto" | "manual" | "holiday";
  lastChangedBy: string;
  lastChangedAt: string;
  powerWatts: number;
}

export interface Floor {
  id: string;
  name: string;
  zones: Zone[];
}

export interface Building {
  id: string;
  name: string;
  location: string;
  floors: Floor[];
}

export const buildings: Building[] = [
  {
    id: "b1",
    name: "HQ Tower",
    location: "San Francisco, CA",
    floors: [
      {
        id: "f1",
        name: "Floor 1 — Lobby",
        zones: [
          { id: "z1", name: "Main Atrium", isOn: true,  brightness: 85, schedule: "auto",    lastChangedBy: "system",        lastChangedAt: "2 min ago",  powerWatts: 420 },
          { id: "z2", name: "Reception",   isOn: true,  brightness: 70, schedule: "auto",    lastChangedBy: "admin@acme.com", lastChangedAt: "14 min ago", powerWatts: 210 },
          { id: "z3", name: "Security",    isOn: true,  brightness: 100, schedule: "manual", lastChangedBy: "security@acme.com", lastChangedAt: "1 hr ago", powerWatts: 180 },
          { id: "z4", name: "Parking B1",  isOn: false, brightness: 0,  schedule: "holiday", lastChangedBy: "scheduler",     lastChangedAt: "6 hr ago",  powerWatts: 0   },
        ],
      },
      {
        id: "f2",
        name: "Floor 12 — Engineering",
        zones: [
          { id: "z5", name: "Open Office",  isOn: true,  brightness: 60, schedule: "auto",   lastChangedBy: "system",        lastChangedAt: "5 min ago",  powerWatts: 890 },
          { id: "z6", name: "War Room",     isOn: true,  brightness: 90, schedule: "manual", lastChangedBy: "ops@acme.com",  lastChangedAt: "32 min ago", powerWatts: 310 },
          { id: "z7", name: "Server Closet",isOn: true,  brightness: 20, schedule: "auto",   lastChangedBy: "system",        lastChangedAt: "2 hr ago",   powerWatts: 45  },
          { id: "z8", name: "Breakroom",    isOn: false, brightness: 0,  schedule: "auto",   lastChangedBy: "system",        lastChangedAt: "3 hr ago",   powerWatts: 0   },
        ],
      },
    ],
  },
  {
    id: "b2",
    name: "West Campus",
    location: "Austin, TX",
    floors: [
      {
        id: "f3",
        name: "Floor 1 — Sales",
        zones: [
          { id: "z9",  name: "Sales Floor",   isOn: true,  brightness: 75, schedule: "auto",   lastChangedBy: "system",       lastChangedAt: "8 min ago",  powerWatts: 760 },
          { id: "z10", name: "Demo Suite",     isOn: true,  brightness: 100, schedule: "manual",lastChangedBy: "sales@acme.com",lastChangedAt: "20 min ago", powerWatts: 390 },
          { id: "z11", name: "Conference A",   isOn: false, brightness: 0,  schedule: "auto",   lastChangedBy: "system",       lastChangedAt: "1 hr ago",   powerWatts: 0   },
        ],
      },
    ],
  },
  {
    id: "b3",
    name: "EMEA Office",
    location: "London, UK",
    floors: [
      {
        id: "f4",
        name: "Floor 3 — Operations",
        zones: [
          { id: "z12", name: "Ops Center",  isOn: true,  brightness: 80, schedule: "auto",    lastChangedBy: "system",         lastChangedAt: "3 min ago",  powerWatts: 640 },
          { id: "z13", name: "Canteen",     isOn: true,  brightness: 50, schedule: "auto",    lastChangedBy: "facilities@acme",lastChangedAt: "45 min ago", powerWatts: 220 },
          { id: "z14", name: "Storage",     isOn: false, brightness: 0,  schedule: "holiday", lastChangedBy: "scheduler",      lastChangedAt: "1 day ago",  powerWatts: 0   },
        ],
      },
    ],
  },
];

// ─── Alerts ──────────────────────────────────────────────────────────────────

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  message: string;
  zone: string;
  ts: string;
}

export const alerts: Alert[] = [
  { id: "a6", severity: "critical", message: "504 Gateway Timeout — API endpoint unreachable", zone: "API Gateway",  ts: "Just now"  },
  { id: "a1", severity: "critical", message: "Zone offline — driver failure detected", zone: "Parking B1",   ts: "6 hr ago"  },
  { id: "a2", severity: "warning",  message: "Energy spike (+34%) above baseline",     zone: "Main Atrium",  ts: "2 hr ago"  },
  { id: "a3", severity: "warning",  message: "Schedule drift detected (>5 min)",       zone: "Open Office",  ts: "1 hr ago"  },
  { id: "a4", severity: "info",     message: "Firmware update available (v4.2.1)",     zone: "All zones",    ts: "30 min ago"},
  { id: "a5", severity: "info",     message: "Daily energy report generated",          zone: "HQ Tower",     ts: "12 min ago"},
];

// ─── API Health ───────────────────────────────────────────────────────────────

export interface ApiEndpoint {
  id: string;
  name: string;
  path: string;
  status: "healthy" | "degraded" | "down";
  responseMs: number;
  errorRate: number; // percent
  uptime: number;    // percent last 30d
  timeoutMs: number;
  lastIncident: string | null;
}

export const apiEndpoints: ApiEndpoint[] = [
  {
    id: "ep1",
    name: "Zone Control",
    path: "/api/v2/zones",
    status: "healthy",
    responseMs: 48,
    errorRate: 0.1,
    uptime: 99.97,
    timeoutMs: 5000,
    lastIncident: null,
  },
  {
    id: "ep2",
    name: "Energy Metrics",
    path: "/api/v2/energy",
    status: "degraded",
    responseMs: 1240,
    errorRate: 4.2,
    uptime: 98.81,
    timeoutMs: 5000,
    lastIncident: "504 Gateway Timeout · Just now",
  },
  {
    id: "ep3",
    name: "Schedules",
    path: "/api/v2/schedules",
    status: "healthy",
    responseMs: 62,
    errorRate: 0.0,
    uptime: 99.99,
    timeoutMs: 5000,
    lastIncident: null,
  },
  {
    id: "ep4",
    name: "Alerts & Events",
    path: "/api/v2/alerts",
    status: "healthy",
    responseMs: 35,
    errorRate: 0.3,
    uptime: 99.95,
    timeoutMs: 5000,
    lastIncident: null,
  },
  {
    id: "ep5",
    name: "Auth Gateway",
    path: "/api/v2/auth",
    status: "down",
    responseMs: 0,
    errorRate: 100,
    uptime: 94.40,
    timeoutMs: 5000,
    lastIncident: "504 Gateway Timeout · Just now",
  },
];

// ─── Energy Chart Data ────────────────────────────────────────────────────────

export interface EnergyPoint {
  hour: string;
  kWh: number;
  baseline: number;
}

export const energyData: EnergyPoint[] = [
  { hour: "06:00", kWh: 1.2, baseline: 2.1 },
  { hour: "07:00", kWh: 3.4, baseline: 3.8 },
  { hour: "08:00", kWh: 7.8, baseline: 8.5 },
  { hour: "09:00", kWh: 9.1, baseline: 9.9 },
  { hour: "10:00", kWh: 8.6, baseline: 9.5 },
  { hour: "11:00", kWh: 8.9, baseline: 9.8 },
  { hour: "12:00", kWh: 6.2, baseline: 9.0 },
  { hour: "13:00", kWh: 6.8, baseline: 8.9 },
  { hour: "14:00", kWh: 9.0, baseline: 9.7 },
  { hour: "15:00", kWh: 8.4, baseline: 9.3 },
  { hour: "16:00", kWh: 7.1, baseline: 8.8 },
  { hour: "17:00", kWh: 4.3, baseline: 7.5 },
  { hour: "18:00", kWh: 2.1, baseline: 5.0 },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  initials: string;
  avatarColor: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "LumiGlow cut our global lighting spend by 31% in the first year. The policy engine is genuinely powerful — we pushed a holiday schedule to 48 buildings in under 60 seconds.",
    name: "Sarah Okonkwo",
    title: "VP of Facilities & Real Estate",
    company: "Meridian Financial Group",
    industry: "Financial Services",
    initials: "SO",
    avatarColor: "bg-violet-600",
  },
  {
    id: "t2",
    quote: "The RBAC model mapped perfectly to our existing org structure. Our security team was satisfied after a single review — SSO via Azure AD was live in an afternoon.",
    name: "James Whitfield",
    title: "Director of IT Operations",
    company: "Crestline Healthcare",
    industry: "Healthcare",
    initials: "JW",
    avatarColor: "bg-sky-600",
  },
  {
    id: "t3",
    quote: "We process audit events from 200+ sites into Snowflake for compliance reporting. LumiGlow's integration story is legitimately enterprise-grade — not an afterthought.",
    name: "Priya Nair",
    title: "Head of Sustainability Engineering",
    company: "Vantage Logistics",
    industry: "Supply Chain",
    initials: "PN",
    avatarColor: "bg-emerald-600",
  },
];

// ─── Pricing Tiers ────────────────────────────────────────────────────────────

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  highlighted: boolean;
  badge?: string;
  features: PricingFeature[];
}

export const pricingTiers: PricingTier[] = [
  {
    id: "team",
    name: "Team",
    price: "$299",
    period: "per month",
    description: "For growing teams managing a single site.",
    cta: "Start free trial",
    highlighted: false,
    features: [
      { text: "Up to 3 buildings",           included: true  },
      { text: "Up to 50 zones",              included: true  },
      { text: "Basic scheduling & policies", included: true  },
      { text: "Email alerts",                included: true  },
      { text: "7-day audit log retention",   included: true  },
      { text: "Standard support",            included: true  },
      { text: "SSO / SAML",                  included: false },
      { text: "RBAC (role-based access)",    included: false },
      { text: "Snowflake / Webhook export",  included: false },
      { text: "Custom SLA",                  included: false },
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$999",
    period: "per month",
    description: "For multi-site organizations that need real controls.",
    cta: "Start free trial",
    highlighted: false,
    features: [
      { text: "Up to 25 buildings",          included: true },
      { text: "Unlimited zones",             included: true },
      { text: "Advanced policies & schedules",included: true },
      { text: "PagerDuty & Slack alerts",    included: true },
      { text: "90-day audit log retention",  included: true },
      { text: "Priority support (4 hr SLA)", included: true },
      { text: "SSO / SAML",                  included: true },
      { text: "RBAC (role-based access)",    included: true },
      { text: "Snowflake / Webhook export",  included: false },
      { text: "Custom SLA",                  included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Unlimited scale, dedicated infra, and white-glove onboarding.",
    cta: "Talk to sales",
    highlighted: true,
    badge: "Most Popular",
    features: [
      { text: "Unlimited buildings & zones", included: true },
      { text: "Advanced policies & schedules",included: true },
      { text: "All alert integrations",      included: true },
      { text: "Unlimited audit log + export", included: true },
      { text: "Dedicated CSM + 1 hr SLA",   included: true },
      { text: "SSO / SAML",                  included: true },
      { text: "RBAC (role-based access)",    included: true },
      { text: "Snowflake / Webhook export",  included: true },
      { text: "Custom SLA & MSA",            included: true },
    ],
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    id: "faq1",
    question: "How does LumiGlow connect to physical lighting hardware?",
    answer: "LumiGlow integrates via DALI-2, BACnet/IP, KNX, and Zigbee 3.0 gateways. Our edge agent runs on commodity hardware (Raspberry Pi 4 or our certified gateway appliance) and maintains a local control loop — so zones respond in <200 ms even when the cloud connection is interrupted.",
  },
  {
    id: "faq2",
    question: "Can we keep our existing Azure AD user directory?",
    answer: "Yes. LumiGlow ships with first-class SAML 2.0 and OIDC connectors for Azure AD, Okta, OneLogin, and any compliant IdP. Provisioning is handled via SCIM 2.0, so user and group changes in your IdP propagate automatically within seconds.",
  },
  {
    id: "faq3",
    question: "How granular is the role-based access control?",
    answer: "RBAC in LumiGlow is policy-as-code. You can scope permissions to individual zones, floors, buildings, or tags. Built-in roles (Viewer, Operator, Facility Manager, Admin) cover most use cases; custom roles let you express exactly who can change what, with full audit trails for every action.",
  },
  {
    id: "faq4",
    question: "Where is data stored, and what compliance certifications do you hold?",
    answer: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II certified and ISO 27001 aligned. Tenants are fully isolated at the data layer. EU customers can elect in-region storage (Frankfurt) to satisfy GDPR data-residency requirements.",
  },
  {
    id: "faq5",
    question: "Can we export events to our own data warehouse?",
    answer: "Absolutely. LumiGlow offers a Snowflake Data Share, a streaming Webhook endpoint, and a Kafka connector (Enterprise tier). Every state change, policy evaluation, and user action is a structured event you can pipe into your own analytics stack — with configurable retention up to 7 years.",
  },
  {
    id: "faq6",
    question: "What does the onboarding process look like for a 50-building portfolio?",
    answer: "Our Enterprise onboarding runs in four phases: Discovery (site audit & gateway sizing), Deployment (edge agent rollout, typically 2-4 weeks), Configuration (policy templates, RBAC mapping, integrations), and Handoff (live training + 30-day hypercare). Most customers reach full production in under 6 weeks.",
  },
];
