"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Building2, Users, ShieldCheck, Globe, FileText, LogOut,
  ChevronDown, CheckCircle2, AlertTriangle, Search, Plus,
  MoreHorizontal, Download, RefreshCw, Lock, Unlock,
  Key, ToggleLeft, ToggleRight, Copy, Trash2, Eye, EyeOff,
  ArrowLeftRight, Filter, X, Menu, ChevronRight, Zap,
  UserCheck, UserX, Clock, Shield, Settings, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgTab = "workspaces" | "members" | "sso" | "security" | "audit";

interface Workspace {
  id: string;
  name: string;
  region: string;
  plan: string;
  status: "active" | "suspended" | "archived";
  members: number;
  owner: string;
  created: string;
}

interface OrgMember {
  id: string;
  name: string;
  email: string;
  orgRole: "Org Owner" | "Org Admin" | "Auditor" | "Member";
  workspaces: string[];
  mfaEnabled: boolean;
  lastLogin: string;
  status: "active" | "deactivated" | "pending";
}

interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  target: string;
  workspace: string;
  result: "success" | "failure";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const workspaces: Workspace[] = [
  { id: "ws1", name: "HQ Operations",       region: "us-east-1",   plan: "Enterprise", status: "active",    members: 142, owner: "Jordan Davis",  created: "Jan 12, 2024" },
  { id: "ws2", name: "EMEA Facilities",     region: "eu-west-1",   plan: "Enterprise", status: "active",    members: 87,  owner: "Priya Sharma",  created: "Mar 3, 2024"  },
  { id: "ws3", name: "APAC Offices",        region: "ap-south-1",  plan: "Business",   status: "active",    members: 53,  owner: "Chen Wei",      created: "Jun 7, 2024"  },
  { id: "ws4", name: "West Campus Lab",     region: "us-west-2",   plan: "Business",   status: "active",    members: 28,  owner: "Sam Torres",    created: "Sep 19, 2024" },
  { id: "ws5", name: "Legacy Manchester",   region: "eu-west-2",   plan: "Starter",    status: "suspended", members: 11,  owner: "Alice Martin",  created: "Feb 2, 2023"  },
  { id: "ws6", name: "Pilot — São Paulo",   region: "sa-east-1",   plan: "Starter",    status: "archived",  members: 4,   owner: "Rafael Costa",  created: "Apr 15, 2022" },
];

const members: OrgMember[] = [
  { id: "m1", name: "Jordan Davis",   email: "jordan@acme.com",   orgRole: "Org Owner",  workspaces: ["HQ Operations", "EMEA Facilities"], mfaEnabled: true,  lastLogin: "5 min ago",    status: "active"      },
  { id: "m2", name: "Priya Sharma",   email: "priya@acme.com",    orgRole: "Org Admin",  workspaces: ["EMEA Facilities", "APAC Offices"],  mfaEnabled: true,  lastLogin: "2 hr ago",     status: "active"      },
  { id: "m3", name: "Chen Wei",       email: "chen@acme.com",     orgRole: "Org Admin",  workspaces: ["APAC Offices"],                     mfaEnabled: false, lastLogin: "Yesterday",    status: "active"      },
  { id: "m4", name: "Sam Torres",     email: "sam@acme.com",      orgRole: "Member",     workspaces: ["West Campus Lab"],                  mfaEnabled: true,  lastLogin: "3 days ago",   status: "active"      },
  { id: "m5", name: "Alice Martin",   email: "alice@acme.com",    orgRole: "Auditor",    workspaces: ["Legacy Manchester"],                mfaEnabled: true,  lastLogin: "1 week ago",   status: "active"      },
  { id: "m6", name: "Liam Nguyen",    email: "liam@acme.com",     orgRole: "Member",     workspaces: ["HQ Operations"],                   mfaEnabled: false, lastLogin: "2 weeks ago",  status: "pending"     },
  { id: "m7", name: "Sofia Reyes",    email: "sofia@acme.com",    orgRole: "Member",     workspaces: ["EMEA Facilities"],                 mfaEnabled: false, lastLogin: "Never",        status: "deactivated" },
];

const auditLog: AuditEntry[] = [
  { id: "a1",  ts: "Today 12:04",   actor: "Jordan Davis",   action: "SSO enabled",             target: "Org-wide",         workspace: "All",             result: "success" },
  { id: "a2",  ts: "Today 11:50",   actor: "Priya Sharma",   action: "Role changed",            target: "Chen Wei → Admin",  workspace: "APAC Offices",    result: "success" },
  { id: "a3",  ts: "Today 10:22",   actor: "Jordan Davis",   action: "MFA enforced",            target: "Org-wide",         workspace: "All",             result: "success" },
  { id: "a4",  ts: "Today 09:15",   actor: "Liam Nguyen",    action: "Login attempt",           target: "SSO",              workspace: "HQ Operations",   result: "failure" },
  { id: "a5",  ts: "Yesterday",     actor: "Chen Wei",       action: "Workspace created",       target: "APAC Offices",     workspace: "APAC Offices",    result: "success" },
  { id: "a6",  ts: "Yesterday",     actor: "Priya Sharma",   action: "API key rotated",         target: "api_key_prod_1",   workspace: "EMEA Facilities", result: "success" },
  { id: "a7",  ts: "May 17",        actor: "Jordan Davis",   action: "Domain verified",         target: "acme.com",         workspace: "All",             result: "success" },
  { id: "a8",  ts: "May 17",        actor: "Sam Torres",     action: "Session revoked",         target: "sofia@acme.com",   workspace: "EMEA Facilities", result: "success" },
  { id: "a9",  ts: "May 16",        actor: "Alice Martin",   action: "Audit log exported",      target: "CSV export",       workspace: "All",             result: "success" },
  { id: "a10", ts: "May 16",        actor: "Jordan Davis",   action: "Domain allowlist updated", target: "acme.com, acmeco.net", workspace: "All",        result: "success" },
];

const apiKeys = [
  { id: "k1", name: "prod-api-key",    prefix: "lmg_prod_****8f2a", created: "Jan 2025",  lastUsed: "Today",       scopes: ["read", "write"],     revoked: false },
  { id: "k2", name: "reporting-key",   prefix: "lmg_rpt_****3c91", created: "Mar 2025",  lastUsed: "Yesterday",   scopes: ["read"],              revoked: false },
  { id: "k3", name: "legacy-key",      prefix: "lmg_leg_****7d44", created: "Jun 2024",  lastUsed: "3 months ago", scopes: ["read", "write"],    revoked: true  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  active:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  suspended:   "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  archived:    "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400",
  pending:     "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
  deactivated: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400",
};

const roleColors: Record<string, string> = {
  "Org Owner":  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
  "Org Admin":  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  "Auditor":    "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
  "Member":     "bg-slate-100 text-slate-600 dark:bg-slate-700/40 dark:text-slate-400",
};

// ─── Workspaces Tab ───────────────────────────────────────────────────────────

function WorkspacesTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "suspended" | "archived">("all");

  const filtered = workspaces.filter(ws =>
    (filter === "all" || ws.status === filter) &&
    (search === "" || ws.name.toLowerCase().includes(search.toLowerCase()) || ws.owner.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Workspaces", value: workspaces.length, icon: <Building2 size={16} />, color: "bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" },
          { label: "Active",           value: workspaces.filter(w => w.status === "active").length, icon: <CheckCircle2 size={16} />, color: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
          { label: "Total Members",    value: workspaces.reduce((s, w) => s + w.members, 0), icon: <Users size={16} />, color: "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" },
          { label: "Suspended",        value: workspaces.filter(w => w.status === "suspended").length, icon: <AlertTriangle size={16} />, color: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400" },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 flex items-center gap-3 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", stat.color)}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workspaces…"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(["all", "active", "suspended", "archived"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                filter === f
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl shadow hover:shadow-amber-400/30 transition-all">
          <Plus size={15} /> New workspace
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-slate-100 dark:border-slate-800">
              <tr>
                {["Workspace", "Region", "Plan", "Members", "Owner", "Created", "Status", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ws => (
                <tr key={ws.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{ws.name}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs font-mono">{ws.region}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      ws.plan === "Enterprise" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400" :
                      ws.plan === "Business"   ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                      "bg-slate-100 text-slate-500 dark:bg-slate-700/40 dark:text-slate-400"
                    )}>
                      {ws.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{ws.members}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{ws.owner}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{ws.created}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", statusColors[ws.status])}>
                      {ws.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">No workspaces match your filter.</div>
        )}
      </div>
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab() {
  const [search, setSearch] = useState("");
  const [memberList, setMemberList] = useState<OrgMember[]>(members);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const filtered = memberList.filter(m =>
    search === "" ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  function sendInvite() {
    if (!inviteEmail) return;
    setInviteSent(true);
    setTimeout(() => { setInviteSent(false); setInviteEmail(""); }, 2500);
  }

  function toggleMFA(id: string) {
    setMemberList(prev => prev.map(m => m.id === id ? { ...m, mfaEnabled: !m.mfaEnabled } : m));
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total members",   value: memberList.length,                              color: "bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400",  icon: <Users size={16} /> },
          { label: "MFA enabled",     value: memberList.filter(m => m.mfaEnabled).length,    color: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: <Shield size={16} /> },
          { label: "Pending invites", value: memberList.filter(m => m.status === "pending").length, color: "bg-sky-100 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400", icon: <Clock size={16} /> },
          { label: "Deactivated",     value: memberList.filter(m => m.status === "deactivated").length, color: "bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400", icon: <UserX size={16} /> },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 flex items-center gap-3 shadow-sm">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", s.color)}>{s.icon}</div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Invite bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center gap-3 flex-wrap">
        <Users size={16} className="text-amber-500 shrink-0" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">Invite member</span>
        <input
          value={inviteEmail}
          onChange={e => setInviteEmail(e.target.value)}
          placeholder="colleague@acme.com"
          className="flex-1 min-w-[160px] px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          onClick={sendInvite}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5",
            inviteSent
              ? "bg-emerald-500 text-white"
              : "bg-amber-500 hover:bg-amber-400 text-white shadow"
          )}
        >
          {inviteSent ? <><CheckCircle2 size={14} /> Invite sent!</> : <><Plus size={14} /> Send invite</>}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members…"
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="border-b border-slate-100 dark:border-slate-800">
              <tr>
                {["Member", "Org Role", "Workspaces", "MFA", "Last login", "Status", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                        {m.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{m.name}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", roleColors[m.orgRole])}>
                      {m.orgRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 max-w-[160px]">
                    <span className="truncate block">{m.workspaces.join(", ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleMFA(m.id)} className={cn("transition-colors", m.mfaEnabled ? "text-emerald-500" : "text-slate-300 dark:text-slate-600")}>
                      {m.mfaEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">{m.lastLogin}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize", statusColors[m.status])}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── SSO Tab ──────────────────────────────────────────────────────────────────

function SSOTab() {
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [ssoType, setSsoType] = useState<"saml" | "oidc">("saml");
  const [domainVerified, setDomainVerified] = useState(true);
  const [ssoOnly, setSsoOnly] = useState(false);
  const [mfaForced, setMfaForced] = useState(true);
  const [scimEnabled, setScimEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifying, setVerifying] = useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 1200);
  }

  function verifyDomain() {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setDomainVerified(true); }, 1500);
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* SSO Toggle */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Single Sign-On (SSO)</h3>
          </div>
          <button onClick={() => setSsoEnabled(!ssoEnabled)} className={cn("transition-colors", ssoEnabled ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
            {ssoEnabled ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
          </button>
        </div>

        <div className={cn("space-y-5 transition-opacity", !ssoEnabled && "opacity-40 pointer-events-none")}>
          {/* Protocol */}
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 mb-2 block font-semibold uppercase tracking-wider">Protocol</label>
            <div className="flex gap-2">
              {(["saml", "oidc"] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSsoType(p)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                    ssoType === p
                      ? "bg-amber-500 text-white border-amber-500 shadow"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SAML fields */}
          {ssoType === "saml" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">IdP Metadata URL</label>
                <input
                  defaultValue="https://idp.acme.com/saml/metadata"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Entity ID (SP)</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value="https://app.lumiglow.io/saml/sp"
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default font-mono"
                  />
                  <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">ACS URL</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value="https://app.lumiglow.io/saml/acs"
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default font-mono"
                  />
                  <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OIDC fields */}
          {ssoType === "oidc" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Client ID</label>
                <input
                  defaultValue="acme-lumiglow-oidc"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Discovery URL</label>
                <input
                  defaultValue="https://idp.acme.com/.well-known/openid-configuration"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          )}

          {/* Sign-in mode */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Require SSO (disable password login)</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">All users must authenticate via SSO</p>
            </div>
            <button onClick={() => setSsoOnly(!ssoOnly)} className={cn("transition-colors", ssoOnly ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
              {ssoOnly ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Domain Verification */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Domain Verification</h3>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <input
            defaultValue="acme.com"
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="yourdomain.com"
          />
          {domainVerified ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={16} /> Verified
            </span>
          ) : (
            <button
              onClick={verifyDomain}
              className="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-all"
            >
              {verifying ? <RefreshCw size={14} className="animate-spin" /> : "Verify"}
            </button>
          )}
        </div>
        {!domainVerified && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs font-mono text-slate-500 dark:text-slate-400">
            Add TXT record: <span className="text-amber-600 dark:text-amber-400">lumiglow-verify=a1b2c3d4e5f6</span>
          </div>
        )}
      </div>

      {/* MFA */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">MFA Enforcement</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Require MFA for all org users</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Users without MFA will be prompted on next login</p>
          </div>
          <button onClick={() => setMfaForced(!mfaForced)} className={cn("transition-colors", mfaForced ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
            {mfaForced ? <ToggleRight size={30} /> : <ToggleLeft size={30} />}
          </button>
        </div>
        {mfaForced && (
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-3 py-2">
            <CheckCircle2 size={14} />
            <span>MFA enforcement active — {members.filter(m => !m.mfaEnabled && m.status === "active").length} users still need to set up MFA</span>
          </div>
        )}
      </div>

      {/* SCIM */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">SCIM Provisioning</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 ml-1">Enterprise</span>
          </div>
          <button onClick={() => setScimEnabled(!scimEnabled)} className={cn("transition-colors", scimEnabled ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
            {scimEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">Auto-provision and deprovision users via your IdP&apos;s SCIM endpoint.</p>
        {scimEnabled && (
          <div className="mt-4 flex items-center gap-2">
            <input readOnly value="https://app.lumiglow.io/scim/v2" className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono cursor-default" />
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-colors"><Copy size={14} /></button>
          </div>
        )}
      </div>

      <button
        onClick={save}
        className={cn("px-6 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center gap-2",
          saved ? "bg-emerald-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-white shadow hover:shadow-amber-400/30"
        )}
      >
        {saved ? <><CheckCircle2 size={15} /> Saved!</> : saving ? <><RefreshCw size={15} className="animate-spin" /> Saving…</> : "Save SSO settings"}
      </button>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const [domainAllowlist, setDomainAllowlist] = useState(true);
  const [domains, setDomains] = useState("acme.com, acmeco.net");
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [reauth, setReauth] = useState(true);
  const [keyList, setKeyList] = useState(apiKeys);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  function revokeKey(id: string) {
    setKeyList(prev => prev.map(k => k.id === id ? { ...k, revoked: true } : k));
  }

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl space-y-5">
      {/* Domain Allowlist */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Domain Allowlist</h3>
          </div>
          <button onClick={() => setDomainAllowlist(!domainAllowlist)} className={cn("transition-colors", domainAllowlist ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
            {domainAllowlist ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Restrict sign-ups to users with verified email domains only.</p>
        <div className={cn("transition-opacity", !domainAllowlist && "opacity-40 pointer-events-none")}>
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Allowed domains (comma-separated)</label>
          <input
            value={domains}
            onChange={e => setDomains(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="acme.com, acmeco.net"
          />
        </div>
      </div>

      {/* Session Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Session Controls</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-800 dark:text-slate-200 font-medium block mb-1">Session timeout (minutes)</label>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Users will be logged out after inactivity.</p>
            <select
              value={sessionTimeout}
              onChange={e => setSessionTimeout(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {["15", "30", "60", "120", "480"].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">Re-auth for sensitive actions</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Require password re-entry for role changes, API key creation</p>
            </div>
            <button onClick={() => setReauth(!reauth)} className={cn("transition-colors", reauth ? "text-amber-500" : "text-slate-300 dark:text-slate-600")}>
              {reauth ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">API Keys</h3>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white transition-colors">
            <Plus size={13} /> Create key
          </button>
        </div>
        <div className="space-y-2">
          {keyList.map(key => (
            <div key={key.id} className={cn(
              "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
              key.revoked
                ? "border-slate-100 dark:border-slate-800 opacity-50"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
            )}>
              <Key size={14} className={key.revoked ? "text-slate-300 dark:text-slate-600" : "text-amber-500"} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{key.name}</span>
                  {key.revoked && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">revoked</span>}
                  {key.scopes.map(s => (
                    <span key={s} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                  {showSecret[key.id] ? key.prefix.replace("****", "a1b2c3d4") : key.prefix} · Last used: {key.lastUsed}
                </p>
              </div>
              {!key.revoked && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowSecret(s => ({ ...s, [key.id]: !s[key.id] }))}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    {showSecret[key.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        className={cn("px-6 py-2.5 text-sm font-semibold rounded-xl transition-all flex items-center gap-2",
          saved ? "bg-emerald-500 text-white" : "bg-amber-500 hover:bg-amber-400 text-white shadow hover:shadow-amber-400/30"
        )}
      >
        {saved ? <><CheckCircle2 size={15} /> Saved!</> : "Save security settings"}
      </button>
    </div>
  );
}

// ─── Audit Log Tab ────────────────────────────────────────────────────────────

function AuditTab() {
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<"all" | "success" | "failure">("all");
  const [exported, setExported] = useState(false);

  const filtered = auditLog.filter(e =>
    (resultFilter === "all" || e.result === resultFilter) &&
    (search === "" ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.target.toLowerCase().includes(search.toLowerCase()))
  );

  function exportCSV() {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(["all", "success", "failure"] as const).map(f => (
            <button
              key={f}
              onClick={() => setResultFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                resultFilter === f
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={exportCSV}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all",
            exported
              ? "bg-emerald-500 text-white"
              : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          {exported ? <><CheckCircle2 size={14} /> Exported!</> : <><Download size={14} /> Export CSV</>}
        </button>
      </div>

      {/* Log table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead className="border-b border-slate-100 dark:border-slate-800">
              <tr>
                {["Time", "Actor", "Action", "Target", "Workspace", "Result"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 dark:text-slate-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{e.ts}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{e.actor}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{e.action}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono max-w-[160px]">
                    <span className="truncate block">{e.target}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">{e.workspace}</td>
                  <td className="px-4 py-3">
                    {e.result === "success"
                      ? <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12} /> success</span>
                      : <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 dark:text-red-400"><AlertTriangle size={12} /> failure</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">No audit events match your filter.</div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrgConsolePage() {
  const [tab, setTab] = useState<OrgTab>("workspaces");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { id: OrgTab; label: string; icon: React.ReactNode }[] = [
    { id: "workspaces", label: "Workspaces", icon: <Building2 size={17} /> },
    { id: "members",    label: "Members",    icon: <Users size={17} /> },
    { id: "sso",        label: "SSO / Auth",  icon: <ShieldCheck size={17} /> },
    { id: "security",   label: "Security",   icon: <Lock size={17} /> },
    { id: "audit",      label: "Audit Log",  icon: <Activity size={17} /> },
  ];

  const tabLabels: Record<OrgTab, string> = {
    workspaces: "Workspaces",
    members:    "Members & Access",
    sso:        "SSO & Authentication",
    security:   "Security Policies",
    audit:      "Audit Log",
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden font-sans">

      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200",
        "md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow shrink-0 bg-gradient-to-br from-amber-400 to-orange-500">
            <Zap size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white block truncate">LumiGlow</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">Org Console</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-2 mt-1">Administration</p>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 text-left",
                tab === item.id
                  ? "bg-amber-500 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
            </button>
          ))}

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <Settings size={17} />
              <span>Workspace Dashboard</span>
            </Link>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">JD</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Jordan Davis</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">Org Owner</p>
            </div>
            <Link href="/" aria-label="Sign out" className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={14} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 px-4 md:px-6 shrink-0">
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-medium text-slate-900 dark:text-white">ACME Corp</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{tabLabels[tab]}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <ShieldCheck size={13} className="text-amber-500" />
              Org Owner
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{tabLabels[tab]}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {tab === "workspaces" && "Manage all workspaces under ACME Corp."}
              {tab === "members"    && "Control org-wide user access, roles, and MFA."}
              {tab === "sso"        && "Configure SSO, domain verification, and provisioning."}
              {tab === "security"   && "Set domain policies, session controls, and API keys."}
              {tab === "audit"      && "Track all admin actions across workspaces."}
            </p>
          </div>

          {tab === "workspaces" && <WorkspacesTab />}
          {tab === "members"    && <MembersTab />}
          {tab === "sso"        && <SSOTab />}
          {tab === "security"   && <SecurityTab />}
          {tab === "audit"      && <AuditTab />}
        </main>
      </div>
    </div>
  );
}
