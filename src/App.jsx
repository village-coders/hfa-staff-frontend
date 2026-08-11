import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard, Bell, BookOpen, Users as UsersIcon, LogOut, ChevronDown,
  ChevronRight, Search, Plus, CheckCircle2, XCircle, Clock3, RotateCcw,
  Eye, Trash2, ShieldCheck, Wallet, Landmark, Building2, Lock, User as UserIcon,
  Menu as MenuIcon, X, FileEdit, FilePlus2, BadgeCheck, CircleDollarSign,
  Package, PackagePlus, PlusCircle, Calculator, ArrowRight, MessageSquare,
  ChevronLeft, ChevronRight as ChevronRightIcon, Building, MoreVertical,
  TrendingUp, ArrowUpRight, ArrowRightLeft, Shield, DollarSign, Activity,
  Globe, BarChart3, Layers, Sparkles, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import logo from "./logo.jpg";

/* ---------------------------------------------------------------- */
/* THEME & DESIGN SYSTEM                                             */
/* ---------------------------------------------------------------- */
const T = {
  tealDark: "#042D3A",
  tealMain: "#007A87",
  tealLight: "#0D857B",
  tealGlow: "#0F9F93",
  navyDeep: "#02132B",
  navyDark: "#051D3B",
  navyMedium: "#092C56",
  bgApp: "#F8FAFC",
  white: "#FFFFFF",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray300: "#CBD5E1",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray700: "#334155",
  gray900: "#0F172A",
};

const API_BASE_URL = "https://staff-portal-backend-mrxv.onrender.com/api/v1";

const STATUS = {
  new:                   { label: "New",                   color: "#1D4ED8", bg: "#DBEAFE" },
  pending:               { label: "Pending",                color: "#B45309", bg: "#FEF3C7" },
  verified:              { label: "Verified",               color: "#4338CA", bg: "#E0E7FF" },
  further_approval:      { label: "Further Approval",       color: "#7C3AED", bg: "#EDE9FE" },
  approved_for_payment:  { label: "Approved For Payment",   color: "#0E7490", bg: "#CFFAFE" },
  paid:                  { label: "Paid",                   color: "#15803D", bg: "#DCFCE7" },
  rejected:              { label: "Rejected",                color: "#B91C1C", bg: "#FEE2E2" },
};

const fmtN = (n) => "£" + (Number(n) || 0).toLocaleString();

/* ---------------------------------------------------------------- */
/* REAL BACKEND DATA STRUCTURES                                      */
/* ---------------------------------------------------------------- */
const CLAIMS_SEED = [];
const ASSETS_SEED = [];

const USERS_SEED = [];

const NOTIFICATIONS_SEED = [];

/* ---------------------------------------------------------------- */
/* ROLE & MENU CONFIG                                                */
/* ---------------------------------------------------------------- */
const ROLES = [
  { id: "user", label: "User", icon: UserIcon },
  { id: "financial_officer", label: "Financial Officer", icon: Wallet },
  { id: "ceo", label: "CEO", icon: Landmark },
  { id: "accountant", label: "Accountant", icon: Calculator },
  { id: "admin", label: "Admin", icon: ShieldCheck },
  { id: "chairman", label: "Chairman (Board)", icon: Building2 },
];

const CLAIM_ITEMS = [
  { key: "manage-claim-sheet", label: "New Claim", icon: FileEdit },
  { key: "all-claims-list", label: "Manage Claim List", icon: LayoutDashboard },
  { key: "new-claim-list", label: "New Claim List", icon: FilePlus2, status: "new" },
  { key: "verified-list", label: "Verified List", icon: BadgeCheck, status: "verified" },
  { key: "approved-for-payment", label: "Approved For Payment", icon: CircleDollarSign, status: "approved_for_payment" },
  { key: "further-approval", label: "Further Approval", icon: Building, status: "further_approval" },
  { key: "paid-list", label: "Paid List", icon: CheckCircle2, status: "paid" },
  { key: "pending-claim-list", label: "Pending Claim List", icon: Clock3, status: "pending" },
  { key: "rejected-claim-list", label: "Rejected Claim List", icon: XCircle, status: "rejected" },
];

const ASSET_ITEMS = [
  { key: "manage-asset", label: "Manage Asset", icon: Package },
  { key: "new-asset-list", label: "New Asset List", icon: PackagePlus },
  { key: "add-new-asset", label: "Add New Asset", icon: PlusCircle },
];

const MENU_ACCESS = {
  user: ["dashboard", "manage-claim-sheet", "all-claims-list", "pending-claim-list", "rejected-claim-list", "manage-asset", "track-claim"],
  financial_officer: ["dashboard", "manage-claim-sheet", "all-claims-list", "new-claim-list", "pending-claim-list", "rejected-claim-list", "manage-asset", "track-claim"],
  ceo: ["dashboard", "verified-list", "track-claim"],
  accountant: ["dashboard", "manage-claim-sheet", "all-claims-list", "approved-for-payment", "paid-list", "manage-asset", "track-claim"],
  admin: ["dashboard", "manage-claim-sheet", "all-claims-list", "new-claim-list", "verified-list", "further-approval", "approved-for-payment", "paid-list", "pending-claim-list", "rejected-claim-list", "manage-asset", "new-asset-list", "add-new-asset", "users", "track-claim"],
  chairman: ["dashboard", "further-approval", "track-claim"],
};


const VIEW_TITLES = {
  dashboard: "Dashboard",
  "manage-claim-sheet": "New Claim",
  "all-claims-list": "Manage Claim List",
  "new-claim-list": "New Claim List",
  "verified-list": "Verified List",
  "approved-for-payment": "Approved For Payment",
  "further-approval": "Further Approval",
  "paid-list": "Paid List",
  "pending-claim-list": "Pending Claim List",
  "rejected-claim-list": "Rejected Claim List",
  "manage-asset": "Manage Asset",
  "new-asset-list": "New Asset List",
  "add-new-asset": "Add New Asset",
  users: "User Management",
  "track-claim": "Claim Processing Tracker",
};


const NOTIF_COLORS = {
  claim:    { dot: "#1D4ED8", bg: "#DBEAFE" },
  verified: { dot: "#4338CA", bg: "#E0E7FF" },
  pending:  { dot: "#B45309", bg: "#FEF3C7" },
  paid:     { dot: "#15803D", bg: "#DCFCE7" },
  asset:    { dot: "#0D857B", bg: "#CCFBF1" },
};

/* ---------------------------------------------------------------- */
/* SMALL UI PRIMITIVES                                               */
/* ---------------------------------------------------------------- */
function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, color: "#475569", bg: "#F1F5F9" };
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium whitespace-nowrap shadow-sm border border-slate-200"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}

function StatCard4({ label, value, icon: Icon, accent, onClick }) {
  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 60%, #ffffff 100%)`,
        borderColor: accent + "30",
      }}
    >
      {/* Decorative glow orb */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-[0.12] pointer-events-none"
        style={{ background: accent }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200"
            style={{ backgroundColor: accent + "22", color: accent }}
          >
            <Icon size={22} strokeWidth={1.8} />
          </div>
          <div
            className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={{ backgroundColor: accent + "18", color: accent }}
          >
            View →
          </div>
        </div>

        <p className="text-3xl font-extrabold tracking-tight mb-1" style={{ color: accent }}>
          {value}
        </p>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest leading-tight">
          {label}
        </p>
      </div>
    </div>
  );
}

function Pagination({ page, setPage, totalItems, pageSize = 10 }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 flex-wrap gap-3 bg-slate-50/50">
      <p className="text-xs font-medium text-slate-600">
        Showing {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalItems)} of {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronLeft size={15} />
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className="w-8 h-8 text-xs font-medium rounded-md border transition-colors shadow-sm"
            style={
              page === i + 1
                ? { backgroundColor: T.tealMain, color: T.white, borderColor: T.tealMain }
                : { borderColor: "#E2E8F0", color: "#334155", backgroundColor: "#FFFFFF" }
            }
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ChevronRightIcon size={15} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-3 bg-teal-50 border border-teal-100">
        <Icon size={24} style={{ color: T.tealMain }} />
      </div>
      <p className="font-semibold text-slate-800 text-sm">{title}</p>
      <p className="text-xs text-slate-500 font-normal mt-1 max-w-xs">{subtitle}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* NOTIFICATION PANEL                                                */
/* ---------------------------------------------------------------- */
function NotificationPanel({ notifications, onMarkAllRead, onClose }) {
  const [showAll, setShowAll] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const displayedNotifs = showAll ? notifications : notifications.slice(0, 5);

  return (
    <>
      {/* Mobile Backdrop for Centered Modal */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs sm:hidden z-40" 
        onClick={onClose} 
      />

      <div className="fixed sm:absolute inset-x-4 top-16 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-scale-in max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell size={15} style={{ color: T.tealMain }} />
            <span className="text-sm font-bold text-slate-900">Notifications</span>
            {unread > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-500 text-white">{unread}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-[10px] font-semibold text-teal-700 hover:text-teal-900"
              >
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {displayedNotifs.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 font-medium">No notifications</div>
          ) : (
            displayedNotifs.map((n) => {
              const c = NOTIF_COLORS[n.type] || { dot: "#94A3B8", bg: "#F1F5F9" };
              return (
                <div key={n.id} className={`flex gap-3 px-4 py-3 ${n.read ? "bg-white" : "bg-teal-50/40"}`}>
                  <div
                    className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: n.read ? "#CBD5E1" : c.dot }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold text-slate-900 ${!n.read ? "font-bold" : ""}`}>{n.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-center">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              {showAll ? "Show less" : `View all notifications (${notifications.length})`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* LOGIN PAGE                                                        */
/* ---------------------------------------------------------------- */
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // POST to live backend auth endpoint
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const userObj = data.user || data.data?.user || {};
        const mappedUser = {
          name: userObj.fullName || userObj.name || data.data?.name || username,
          role: userObj.role || data.data?.role || "user",
          username: userObj.username || username,
          token: data.accessToken || data.token || data.data?.token || data.data?.accessToken,
          id: userObj.id || userObj._id || data.data?.id || data.data?._id
        };
        onLogin(mappedUser);
        setIsLoading(false);
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Invalid username or password. Please try again.");
      }
    } catch (err) {
      console.log("Backend auth error:", err);
      setError("Unable to connect to the backend server. It may be waking up, please try again in a few seconds.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]">
      <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-in border border-slate-200 bg-white my-auto">

        {/* Left / Top Banner */}
        <div className="relative w-full md:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#007A87] via-[#054D66] to-[#031B38] text-white text-center md:text-left">
          <div className="absolute top-0 left-0 w-48 h-48 opacity-20 pointer-events-none">
            <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#dotPattern)" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center md:items-start">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">IFRS</h1>
            <p className="text-sm sm:text-base font-semibold text-teal-100">Internal Financial Record System</p>
            <div className="w-12 h-0.5 bg-teal-300/50 my-3 sm:my-4 rounded-full" />
            <p className="text-xs text-teal-50/90 leading-relaxed max-w-xs sm:max-w-sm font-normal">
              Secure access to manage and monitor Internal Financial Record System operations and analytics.
            </p>
          </div>

          <div className="relative z-10 mt-6 sm:mt-8 md:mt-12 pt-4 md:pt-8 flex justify-center items-end hidden sm:flex">
            <svg className="w-full h-32 md:h-44 text-white/30" viewBox="0 0 400 160" fill="currentColor">
              <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="20" y1="154" x2="380" y2="154" stroke="currentColor" strokeWidth="0.5" />
              <g transform="translate(140, 10)">
                <path d="M 50 140 L 50 10 C 50 10 90 40 100 140 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 50 20 L 95 60 L 50 65 L 90 95 L 50 100 L 85 130" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="50" y1="0" x2="50" y2="140" stroke="currentColor" strokeWidth="2" />
                <line x1="30" y1="140" x2="110" y2="140" stroke="currentColor" strokeWidth="3" />
                <circle cx="50" cy="25" r="4" fill="currentColor" />
              </g>
              <rect x="20" y="100" width="15" height="40" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="40" y="80" width="20" height="60" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="65" y="110" width="12" height="30" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="260" y="90" width="18" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="285" y="70" width="25" height="70" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

        </div>

        {/* Right / Bottom Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 lg:p-12 bg-[#02132B] text-white flex flex-col justify-between items-center text-center">
          <div className="w-full max-w-sm flex flex-col items-center my-auto">

            <div className="mb-4 sm:mb-6 flex items-center justify-center">
              <div className="p-1 bg-[#F8FAFC] rounded-full shadow-xl shadow-black/30 border border-white/20 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <img src={logo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain rounded-full" />
              </div>
            </div>

            <p className="text-white/90 text-xs font-medium mb-4 sm:mb-6">Enter Details to Login</p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-inner">
                <div className="px-3.5 py-3 text-slate-500 bg-slate-100 border-r border-slate-200">
                  <UserIcon size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Username"
                  className="w-full px-4 py-3 text-xs text-slate-800 outline-none bg-white placeholder-slate-400 font-medium"
                />
              </div>

              <div className="relative flex items-center bg-white rounded-xl overflow-hidden shadow-inner">
                <div className="px-3.5 py-3 text-slate-500 bg-slate-100 border-r border-slate-200">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password"
                  className="w-full px-4 py-3 text-xs text-slate-800 outline-none bg-white placeholder-slate-400 font-medium"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5">
                  <XCircle size={14} className="text-rose-500 flex-shrink-0" />
                  <p className="text-xs text-rose-700 font-medium text-left">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-6 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#0D9488] to-[#0284C7] hover:from-[#0F766E] hover:to-[#0369A1] shadow-md transform active:scale-98 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Authenticating...</span></>
                ) : "Log In"}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 mt-6 sm:mt-8">
            <span className="w-2 h-2 rounded-full bg-teal-400/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] shadow-sm" />
            <span className="w-2 h-2 rounded-full bg-teal-400/50" />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* SIDEBAR                                                           */
/* ---------------------------------------------------------------- */
function NavSection({ icon: Icon, label, items, access = [], activeView, setActiveView, open, onToggle, counts = {}, sectionCount, collapsed }) {
  const visible = items.filter((it) => (access || []).includes(it.key));
  if (visible.length === 0) return null;

  if (collapsed) {
    // In collapsed mode just show icons
    return (
      <div className="mb-1 space-y-1">
        {visible.map((it) => {
          const ItemIcon = it.icon;
          const active = activeView === it.key;
          return (
            <button
              key={it.key}
              onClick={() => setActiveView(it.key)}
              title={it.label}
              className={`w-full flex items-center justify-center p-3 rounded-xl transition-all ${
                active
                  ? "bg-[#14B8A6]/90 text-white shadow-sm"
                  : "text-teal-100/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <ItemIcon size={18} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold text-teal-50/90 hover:bg-white/10 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-3">
          <Icon size={16} className="text-teal-200/80" />
          <span>{label}</span>
          {sectionCount !== undefined && sectionCount !== null && (
            <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white">
              {sectionCount}
            </span>
          )}
        </span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
      {open && (
        <div className="mt-1 space-y-1 pl-3">
          {visible.map((it) => {
            const ItemIcon = it.icon;
            const active = activeView === it.key;
            const count = counts[it.key];
            return (
              <button
                key={it.key}
                onClick={() => setActiveView(it.key)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? "bg-[#14B8A6]/90 text-white font-semibold shadow-sm"
                    : "text-teal-100/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <ItemIcon size={14} />
                <span className="truncate">{it.label}</span>
                {count !== undefined && count !== null && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sidebar({ role, activeView, setActiveView, mobileOpen, setMobileOpen, claims = [], assets = [], users = [], collapsed, setCollapsed }) {
  const [claimOpen, setClaimOpen] = useState(true);
  const [assetOpen, setAssetOpen] = useState(true);
  const access = MENU_ACCESS[role] || MENU_ACCESS.user || [];
  const currentUser = users.find((u) => u.role === role)?.name || "Ibrahim Musa";

  const claimCounts = useMemo(() => {
    const isTotalViewer = role === "admin" || role === "financial_officer";
    const list = isTotalViewer
      ? claims
      : claims.filter((c) => c.claimant === currentUser);

    const counts = {
      "manage-claim-sheet": null,
      "all-claims-list": isTotalViewer ? claims.length : list.length,
    };
    list.forEach((c) => {
      const item = CLAIM_ITEMS.find((it) => it.status === c.status);
      if (item) {
        counts[item.key] = (counts[item.key] || 0) + 1;
      }
    });
    CLAIM_ITEMS.forEach((it) => {
      if (it.status && counts[it.key] === undefined) {
        // FO can see counts of status lists
        if (role === "financial_officer" || role === "admin") {
          counts[it.key] = claims.filter((c) => c.status === it.status).length;
        } else if (role === "ceo" && it.key === "verified-list") {
          counts[it.key] = claims.filter((c) => c.status === "verified").length;
        } else if (role === "chairman" && it.key === "further-approval") {
          counts[it.key] = claims.filter((c) => c.status === "further_approval").length;
        } else {
          counts[it.key] = 0;
        }
      }
    });
    return counts;
  }, [claims, role, currentUser]);

  const assetCounts = useMemo(() => ({
    "manage-asset": assets.length,
    "new-asset-list": 0,
    "add-new-asset": null,
  }), [assets]);

  const sidebarWidth = collapsed ? "w-16" : "w-64";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-40 overflow-y-auto flex flex-col justify-between
          transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          ${sidebarWidth}
          bg-gradient-to-b from-[#007A87] via-[#054D66] to-[#031B38] text-white shadow-lg flex-shrink-0`}
      >
        {/* Header */}
        <div>
          <div className={`flex items-center gap-3 px-4 py-6 border-b border-white/10 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center flex-shrink-0">
              <img src={logo} alt="HFA Icon" className="w-full h-full object-contain" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-white font-bold text-base leading-tight tracking-tight">HFA</p>
                <p className="text-[10px] text-teal-100 font-medium leading-tight opacity-90">Internal Financial Record System</p>
              </div>
            )}
            {!collapsed && (
              <button className="ml-auto lg:hidden text-white/80 hover:text-white" onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className={`p-3 space-y-1 ${collapsed ? "px-2" : "px-4"}`}>
            {/* Dashboard */}
            <button
              onClick={() => setActiveView("dashboard")}
              title={collapsed ? "Dashboard" : undefined}
              className={`w-full flex items-center gap-3 rounded-xl text-xs font-semibold transition-all
                ${collapsed ? "justify-center p-3" : "px-4 py-2.5"}
                ${activeView === "dashboard"
                  ? "bg-[#14B8A6]/90 text-white shadow-sm"
                  : "text-teal-50/80 hover:bg-white/10 hover:text-white"
                }`}
            >
              <LayoutDashboard size={collapsed ? 18 : 16} />
              {!collapsed && "Dashboard"}
            </button>

            {/* Claim section header when collapsed */}
            {collapsed && (
              <div className="flex justify-center py-1">
                <div className="w-6 h-px bg-white/10" />
              </div>
            )}
            {collapsed && (
              <button title="Claim" className="w-full flex justify-center p-2 text-teal-200/60">
                <Bell size={13} />
              </button>
            )}

            <NavSection
              icon={Bell}
              label="Claim"
              items={CLAIM_ITEMS}
              access={access}
              activeView={activeView}
              setActiveView={setActiveView}
              open={claimOpen}
              onToggle={() => setClaimOpen(!claimOpen)}
              counts={claimCounts}
              sectionCount={claims.length}
              collapsed={collapsed}
            />

            {collapsed && (
              <div className="flex justify-center py-1">
                <div className="w-6 h-px bg-white/10" />
              </div>
            )}
            {collapsed && (
              <button title="Asset" className="w-full flex justify-center p-2 text-teal-200/60">
                <BookOpen size={13} />
              </button>
            )}

            <NavSection
              icon={BookOpen}
              label="Asset"
              items={ASSET_ITEMS}
              access={access}
              activeView={activeView}
              setActiveView={setActiveView}
              open={assetOpen}
              onToggle={() => setAssetOpen(!assetOpen)}
              counts={assetCounts}
              sectionCount={assets.length}
              collapsed={collapsed}
            />

            {access.includes("users") && (
              <button
                onClick={() => setActiveView("users")}
                title={collapsed ? "Users" : undefined}
                className={`w-full flex items-center gap-3 rounded-xl text-xs font-semibold transition-all
                  ${collapsed ? "justify-center p-3" : "px-4 py-2.5 justify-between"}
                  ${activeView === "users"
                    ? "bg-[#14B8A6]/90 text-white shadow-sm"
                    : "text-teal-50/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span className={`flex items-center gap-3 ${collapsed ? "" : ""}`}>
                  <UsersIcon size={collapsed ? 18 : 16} />
                  {!collapsed && "Users"}
                </span>
                {!collapsed && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-white">
                    {users.length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Bottom callout — hidden when collapsed */}
        {!collapsed && (
          <div className="p-4 m-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield size={15} className="text-teal-300" />
              <p className="text-xs font-semibold tracking-wide">Secure. Monitor. Optimize.</p>
            </div>
            <p className="text-[11px] text-teal-100/80 leading-relaxed mb-3 font-normal">
              Manage and monitor Internal Financial Record System operations securely.
            </p>
            <button
              onClick={() => setActiveView("dashboard")}
              className="w-full py-2 px-3 rounded-lg bg-teal-500/80 hover:bg-teal-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>View Reports</span>
              <ArrowRight size={13} />
            </button>
            <p className="text-[10px] text-teal-200/50 text-center mt-2.5 font-normal">
              © 2024 Internal Financial Record System.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* TOPBAR                                                            */
/* ---------------------------------------------------------------- */
function Topbar({ role, viewTitle, setMobileOpen, notifications, onMarkAllRead, currentUser, onLogout, sidebarCollapsed, setSidebarCollapsed }) {
  const [profileMenu, setProfileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const unread = notifications.filter((n) => !n.read).length;

  // Close notification panel on outside click
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenu(false);
      }
    }
    if (profileMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileMenu]);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Hamburger — toggles sidebar collapse on desktop, opens mobile drawer */}
        <button
          onClick={() => {
            if (window.innerWidth >= 1024) {
              setSidebarCollapsed((v) => !v);
            } else {
              setMobileOpen((v) => !v);
            }
          }}
          className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-slate-900 leading-tight">{viewTitle}</h1>
            {/* <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </span> */}
          </div>
          <p className="text-xs text-slate-500 font-normal">Welcome back, {currentUser}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="relative hidden md:flex items-center">
          <Search size={15} className="absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-full w-52 focus:w-64 focus:bg-white focus:border-teal-500 outline-none text-slate-800 transition-all duration-200"
          />
        </div>

        {/* Bell — clickable notification toggle */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={`relative cursor-pointer p-2 rounded-full transition-colors border ${
              notifOpen ? "bg-teal-50 border-teal-300" : "hover:bg-slate-100 border-slate-200"
            }`}
            title="Notifications"
          >
            <Bell size={18} className={notifOpen ? "text-teal-700" : "text-slate-700"} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold text-white bg-teal-500 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <NotificationPanel
              notifications={notifications}
              onMarkAllRead={onMarkAllRead}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        {/* User profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenu(!profileMenu)}
            className="flex items-center gap-3 p-1 pl-2 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 bg-white"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {currentUser.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-none">{currentUser}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1 uppercase">{ROLES.find(r => r.id === role)?.label || role}</p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-in">
              {/* Profile info card */}
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow">
                    {currentUser.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{currentUser}</p>
                    <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wide">{ROLES.find(r => r.id === role)?.label || role}</p>
                  </div>
                </div>
              </div>
              <div className="pt-1">
                <button
                  onClick={() => { onLogout(); setProfileMenu(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={14} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- */
/* DASHBOARD VIEW                                                    */
/* ---------------------------------------------------------------- */
function DashboardView({ role, claims, assets, users, currentUser, onNavigate, onTrackClaim, onTransition, onDelete }) {
  const [feedbackClaim, setFeedbackClaim] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const counts = useMemo(() => {
    const c = {};
    Object.keys(STATUS).forEach((k) => (c[k] = claims.filter((x) => x.status === k).length));
    c.total = claims.length;
    c.mine = claims.filter((x) => x.claimant === currentUser).length;
    return c;
  }, [claims, currentUser]);

  let cards = [];
  if (role === "user") {
    cards = [
      { label: "My Claims", value: counts.mine, icon: FileEdit, accent: "#007A87", targetView: "all-claims-list" },
      { label: "Pending Feedback", value: claims.filter((c) => c.claimant === currentUser && c.status === "pending").length, icon: Clock3, accent: "#B45309", targetView: "pending-claim-list" },
      { label: "Rejected", value: claims.filter((c) => c.claimant === currentUser && c.status === "rejected").length, icon: XCircle, accent: "#B91C1C", targetView: "rejected-claim-list" },
      { label: "Paid To Date", value: claims.filter((c) => c.claimant === currentUser && c.status === "paid").length, icon: CheckCircle2, accent: "#15803D", targetView: "all-claims-list" },
    ];
  } else if (role === "financial_officer") {
    cards = [
      { label: "New Claims", value: counts.new, icon: FilePlus2, accent: "#007A87", targetView: "new-claim-list" },
      { label: "Awaiting User Response", value: counts.pending, icon: Clock3, accent: "#B45309", targetView: "pending-claim-list" },
      { label: "Verified", value: counts.verified, icon: BadgeCheck, accent: "#4338CA", targetView: "all-claims-list" },
      { label: "Rejected", value: counts.rejected, icon: XCircle, accent: "#B91C1C", targetView: "rejected-claim-list" },
    ];
  } else if (role === "ceo") {
    cards = [
      { label: "Verified — Awaiting You", value: counts.verified, icon: BadgeCheck, accent: "#4338CA", targetView: "verified-list" },
    ];
  } else if (role === "accountant") {
    cards = [
      { label: "Approved For Payment", value: counts.approved_for_payment, icon: CircleDollarSign, accent: "#0E7490", targetView: "approved-for-payment" },
      { label: "Paid This Period", value: counts.paid, icon: CheckCircle2, accent: "#15803D", targetView: "paid-list" },
      { label: "Total Paid Value", value: fmtN(claims.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0)), icon: Wallet, accent: "#051D3B", targetView: "paid-list" },
      { label: "Pending Processing", value: counts.pending, icon: Clock3, accent: "#B45309", targetView: "all-claims-list" },
    ];
  } else if (role === "chairman") {
    cards = [
      { label: "Awaiting Board Review", value: counts.further_approval, icon: Building2, accent: "#7C3AED", targetView: "further-approval" },
      { label: "Combined Value", value: fmtN(claims.filter((c) => c.status === "further_approval").reduce((s, c) => s + c.amount, 0)), icon: CircleDollarSign, accent: "#007A87", targetView: "further-approval" },
    ];
  } else if (role === "admin") {
    cards = [
      { label: "Total Claims", value: counts.total, icon: FileEdit, accent: "#007A87", targetView: "all-claims-list" },
      { label: "New Claims", value: counts.new, icon: FilePlus2, accent: "#0D857B", targetView: "new-claim-list" },
      { label: "Pending Claims", value: counts.pending, icon: Clock3, accent: "#B45309", targetView: "pending-claim-list" },
      { label: "Paid Claims", value: counts.paid, icon: CheckCircle2, accent: "#15803D", targetView: "paid-list" },
    ];
  }

  const recent = (
    role === "user"
      ? claims.filter((c) => c.claimant === currentUser)
      : role === "ceo"
      ? claims.filter((c) => c.status === "verified")
      : role === "chairman"
      ? claims.filter((c) => c.status === "further_approval")
      : claims
  ).slice(0, 8);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner with gradient */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg"
        style={{ background: "linear-gradient(135deg, #007A87 0%, #054D66 50%, #031B38 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #14B8A6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0891B2 0%, transparent 50%)" }}
        />
        <div className="relative z-10 p-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest mb-1">Internal Financial Record System</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back, {currentUser}!</h2>
            <p className="text-sm text-teal-100/80 mt-1 font-normal">
              Click any statistic card below to jump directly to its management page.
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck size={18} className="text-teal-200" />
            </div>
            <div>
              <p className="text-[10px] text-teal-100 uppercase tracking-widest font-semibold">Active Role</p>
              <p className="text-sm font-bold text-white uppercase">{ROLES.find(r => r.id === role)?.label || role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c) => (
          <StatCard4
            key={c.label}
            {...c}
            onClick={() => onNavigate(c.targetView)}
          />
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div
          className="px-6 py-4 rounded-t-2xl border-b border-slate-200 flex items-center justify-between"
          style={{ background: "linear-gradient(90deg, #007A87 0%, #054D66 100%)" }}
        >
          <h3 className="font-semibold text-sm text-white">Recent Claim Activity</h3>
          <button
            onClick={() => onNavigate("all-claims-list")}
            className="text-xs font-semibold text-teal-100 hover:text-white flex items-center gap-1"
          >
            <span>View All Claims</span>
            <ArrowRight size={13} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="text-left px-5 py-3.5 whitespace-nowrap">Claim ID</th>
                <th className="text-left px-5 py-3.5 whitespace-nowrap">Claimant</th>
                <th className="text-left px-5 py-3.5 whitespace-nowrap">Department</th>
                <th className="text-left px-5 py-3.5 whitespace-nowrap">Amount</th>
                <th className="text-left px-5 py-3.5 whitespace-nowrap">Date</th>
                <th className="text-left px-5 py-3.5 whitespace-nowrap">Status</th>
                <th className="text-center px-5 py-3.5 w-20 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((c) => (
                <DashboardClaimRow
                  key={c.id}
                  claim={c}
                  role={role}
                  onNavigate={onNavigate}
                  onTrack={() => onTrackClaim(c)}
                  onTransition={onTransition}
                  onOpenFeedback={(claim) => { setFeedbackClaim(claim); setFeedbackText(""); }}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* DASHBOARD CLAIM ROW — with 3-dot Action menu                     */
/* ---------------------------------------------------------------- */
function DashboardClaimRow({ claim, role, onNavigate, onTrack, onTransition, onOpenFeedback, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentStatus = claim.status;

  return (
    <tr className="hover:bg-teal-50/30 transition-colors">
      <td className="px-5 py-4 font-semibold text-teal-800 cursor-pointer" onClick={() => onNavigate("all-claims-list")}>{claim.id}</td>
      <td className="px-5 py-4 font-medium text-slate-900">{claim.claimant}</td>
      <td className="px-5 py-4 text-slate-600">{claim.dept}</td>
      <td className="px-5 py-4 font-semibold text-slate-900">{fmtN(claim.amount)}</td>
      <td className="px-5 py-4 text-slate-500">{claim.date}</td>
      <td className="px-5 py-4"><StatusBadge status={claim.status} /></td>
      <td className="px-5 py-4 text-center">
        <div className="relative inline-block text-left" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
          >
            <MoreVertical size={15} className="text-slate-600" />
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 overflow-hidden flex flex-col animate-scale-in">
                {/* Always available: Track Processing */}
                <button
                  onClick={() => { setOpen(false); onTrack(); }}
                  className="w-full text-left text-xs font-semibold px-4 py-2.5 hover:bg-teal-50 text-teal-700 flex items-center gap-2 transition-colors border-b border-slate-100"
                >
                  <Activity size={14} />
                  Track Processing
                </button>

                {/* Role Specific Actions */}
                {currentStatus === "new" && (role === "financial_officer" || role === "admin") && (
                  <>
                    <button onClick={() => { setOpen(false); onTransition(claim.id, "verified"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2">Verify</button>
                    <button onClick={() => { setOpen(false); onOpenFeedback(claim); }} className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2">Send Feedback</button>
                    <button onClick={() => { setOpen(false); onTransition(claim.id, "rejected"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2">Reject</button>
                  </>
                )}

                {currentStatus === "verified" && (role === "ceo" || role === "admin") && (
                  <>
                    <button onClick={() => { setOpen(false); onTransition(claim.id, "approved_for_payment"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2">Send to Accountant</button>
                    <button onClick={() => { setOpen(false); onTransition(claim.id, "further_approval"); }} className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-purple-50 text-purple-700 flex items-center gap-2">Send to Board</button>
                    <button onClick={() => { setOpen(false); onTransition(claim.id, "pending"); }} className="w-full text-left text-xs font-medium px-4 py-2 hover:bg-amber-50 text-amber-700 flex items-center gap-2">Reverse to Fin. Officer</button>
                  </>
                )}

                {currentStatus === "further_approval" && (role === "chairman" || role === "admin") && (
                  <>
                    <button onClick={() => { setOpen(false); onTransition(claim.id, "verified"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2">Approve — Return to CEO</button>
                    <button onClick={() => { setOpen(false); onTransition(claim.id, "rejected"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2">Reject</button>
                  </>
                )}

                {currentStatus === "approved_for_payment" && (role === "accountant" || role === "admin") && (
                  <button onClick={() => { setOpen(false); onTransition(claim.id, "paid"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-emerald-50 text-emerald-700 flex items-center gap-2">Mark as Paid</button>
                )}

                {currentStatus === "pending" && role === "user" && (
                  <button onClick={() => { setOpen(false); onTransition(claim.id, "new"); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-teal-50 text-teal-700 flex items-center gap-2">Resubmit Claim</button>
                )}

                {role === "admin" && (
                  <button onClick={() => { setOpen(false); onDelete(claim.id); }} className="w-full text-left text-xs font-semibold px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100">Delete</button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ---------------------------------------------------------------- */
/* CLAIM TRACKING VIEW (Full Page)                                  */
/* ---------------------------------------------------------------- */
function ClaimTrackingView({ claim, onBack }) {
  const isRejected = claim.status === "rejected";
  const isPending  = claim.status === "pending";
  const showBoard  = claim.status === "further_approval";

  const steps = [
    {
      key: "submitted",
      label: "Claim Submitted",
      icon: FilePlus2,
      color: "#007A87",
      bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-800",
      passedStatuses: ["new","pending","verified","further_approval","approved_for_payment","paid","rejected"],
      activeStatuses: [],
    },
    {
      key: "fo_review",
      label: "Financial Officer Review",
      icon: BadgeCheck,
      color: "#4338CA",
      bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-800",
      passedStatuses: ["verified","further_approval","approved_for_payment","paid"],
      activeStatuses: ["new","pending"],
    },
    {
      key: "ceo_review",
      label: "CEO Review & Approval",
      icon: ShieldCheck,
      color: "#0369A1",
      bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800",
      passedStatuses: showBoard
        ? ["further_approval","approved_for_payment","paid"]
        : ["approved_for_payment","paid"],
      activeStatuses: ["verified"],
    },
    ...(showBoard ? [{
      key: "board_review",
      label: "Board / Chairman Review",
      icon: Building2,
      color: "#7C3AED",
      bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-800",
      isFurtherApproval: true,
      passedStatuses: ["approved_for_payment","paid"],
      activeStatuses: ["further_approval"],
    }] : []),
    {
      key: "payment",
      label: "Payment Processing",
      icon: CircleDollarSign,
      color: "#0E7490",
      bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-800",
      passedStatuses: ["paid"],
      activeStatuses: ["approved_for_payment"],
    },
    {
      key: "paid_complete",
      label: "Claim Paid — Process Complete",
      icon: CheckCircle2,
      color: "#15803D",
      bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800",
      passedStatuses: [],
      activeStatuses: ["paid"],
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-6 text-white flex items-center justify-between relative overflow-hidden rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-1">
            <Activity size={16} className="text-teal-300" />
            <span className="text-xs font-bold text-teal-200 uppercase tracking-widest">Claim Processing Tracker</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Tracking Claim</h2>
          <p className="text-xs text-teal-100/80 font-mono mt-0.5">{claim.id} · {claim.claimant}</p>
        </div>
        <button
          onClick={onBack}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-2xl border border-white/20 transition-all"
        >
          <ChevronLeft size={15} />
          Back to Dashboard
        </button>
      </div>

      {/* Claim Details */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Claim ID",    value: claim.id,        mono: true,  teal: true },
            { label: "Claimant",    value: claim.claimant },
            { label: "Amount",      value: fmtN(claim.amount), large: true },
            { label: "Department",  value: claim.dept },
            { label: "Date Filed",  value: claim.date },
            { label: "Status",      badge: true },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">{f.label}</p>
              {f.badge
                ? <StatusBadge status={claim.status} />
                : <p className={`font-bold ${f.large ? "text-base" : "text-sm"} ${f.teal ? "text-teal-700 font-mono" : "text-slate-800"}`}>{f.value}</p>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Steps Only */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5" style={{ background: "linear-gradient(90deg,#007A87 0%,#054D66 100%)" }}>
          <Activity size={15} className="text-teal-200" />
          <p className="text-xs font-bold text-white uppercase tracking-widest">Process Steps</p>
        </div>
        <div className="p-6 space-y-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isPassed = s.passedStatuses.includes(claim.status);
            const isActive = s.activeStatuses.includes(claim.status);
            const isFuture = !isPassed && !isActive;

            return (
              <div key={s.key} className="flex items-center gap-4">
                {/* Icon + Connector line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      isPassed ? "border-emerald-400 bg-emerald-50"
                      : isActive ? "border-white shadow-lg"
                      : "border-slate-200 bg-slate-50"
                    }`}
                    style={isActive ? { borderColor: s.color, background: `${s.color}18`, boxShadow: `0 0 0 4px ${s.color}15` } : {}}
                  >
                    {isPassed
                      ? <CheckCircle2 size={18} className="text-emerald-600" />
                      : <Icon size={16} style={{ color: isActive ? s.color : "#CBD5E1" }} />
                    }
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-0.5 h-6 my-1 rounded-full ${isPassed ? "bg-emerald-300" : "bg-slate-200"}`} />
                  )}
                </div>

                {/* Step Item */}
                <div className="flex-1">
                  <div className={`rounded-2xl border px-4 py-3 flex items-center justify-between transition-all ${
                    isPassed ? "bg-emerald-50/50 border-emerald-200"
                    : isActive ? `${s.bg} ${s.border} shadow-sm`
                    : "bg-white border-slate-100"
                  }`}>
                    <p className={`font-bold text-sm ${
                      isPassed ? "text-emerald-800" : isActive ? s.text : "text-slate-400"
                    }`}>{s.label}</p>

                    <div className="flex items-center gap-1.5">
                      {isPassed && <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">✓ Completed</span>}
                      {isActive && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border animate-pulse" style={{ background: `${s.color}18`, color: s.color, borderColor: `${s.color}40` }}>● In Progress</span>}
                      {isFuture && <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200">Pending</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start pb-6">
        <button onClick={onBack} className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg transition-all">
          <ChevronLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* CLAIM VIEWS                                                       */
/* ---------------------------------------------------------------- */
function ClaimActions({ claim, view, role, onTransition, onOpenFeedback, onDelete, onViewDetails }) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { 
      if (ref.current && !ref.current.contains(e.target) && !e.target.closest('.action-popup-menu')) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    const handleScroll = () => setOpen(false);
    if (open) window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  const toggleOpen = (e) => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      });
    }
    setOpen(!open);
  };

  const btn = (label, onClick, style) => (
    <button
      key={label}
      onClick={() => { onClick(); setOpen(false); }}
      className="w-full text-left text-xs font-medium px-3.5 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center gap-2 transition-colors"
      style={{ color: style?.color || T.gray700 }}
    >
      {label}
    </button>
  );

  const buttons = [];
  const currentStatus = claim.status;

  if (currentStatus === "new" && (role === "financial_officer" || role === "admin")) {
    buttons.push(btn("Verify", () => onTransition(claim.id, "verified"), { color: T.tealLight }));
    buttons.push(btn("Send Feedback", () => onOpenFeedback(claim), { color: T.gray700 }));
    buttons.push(btn("Reject", () => onTransition(claim.id, "rejected"), { color: "#B91C1C" }));
  }
  if (currentStatus === "verified" && (role === "ceo" || role === "admin")) {
    buttons.push(btn("Send to Accountant", () => onTransition(claim.id, "approved_for_payment"), { color: T.tealLight }));
    buttons.push(btn("Send to Board", () => onTransition(claim.id, "further_approval"), { color: T.gray700 }));
    buttons.push(btn("Reverse to Fin. Officer", () => onTransition(claim.id, "pending"), { color: "#B45309" }));
  }
  if (currentStatus === "further_approval" && (role === "chairman" || role === "admin")) {
    buttons.push(btn("Approve — Return to CEO", () => onTransition(claim.id, "verified"), { color: T.tealLight }));
    buttons.push(btn("Reject", () => onTransition(claim.id, "rejected"), { color: "#B91C1C" }));
  }
  if (currentStatus === "approved_for_payment" && (role === "accountant" || role === "admin")) {
    buttons.push(btn("Mark as Paid", () => onTransition(claim.id, "paid"), { color: T.tealLight }));
  }
  if (currentStatus === "pending" && role === "user") {
    buttons.push(btn("Resubmit Claim", () => onTransition(claim.id, "new"), { color: T.tealLight }));
  }
  if (role === "admin" && view !== "manage-claim-sheet") {
    buttons.push(btn("Delete", () => onDelete(claim.id), { color: "#B91C1C" }));
  }
  buttons.push(btn("View Details", () => onViewDetails && onViewDetails(claim), { color: T.gray700 }));

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={toggleOpen}
        className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
      >
        <MoreVertical size={15} className="text-slate-600" />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div 
            className="action-popup-menu fixed bg-white rounded-xl shadow-2xl border border-slate-200 z-50 py-1 overflow-hidden flex flex-col animate-scale-in"
            style={{ top: dropdownPos.top, right: dropdownPos.right, width: '13rem' }}
          >
            {buttons}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

function ClaimListView({ view, role, claims, onTransition, onDelete, currentUser }) {
  const item = CLAIM_ITEMS.find((i) => i.key === view) || CLAIM_ITEMS[1];
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [feedbackClaim, setFeedbackClaim] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedClaim, setSelectedClaim] = useState(null);

  let filtered = view === "all-claims-list"
    ? claims
    : item.status
      ? claims.filter((c) => c.status === item.status)
      : claims;

  // Role-based visibility filtering
  if (role === "user") {
    // Regular users see ONLY claims submitted by themselves
    filtered = filtered.filter((c) => c.claimant === currentUser);
  } else if (role === "ceo") {
    // CEO sees claims in 'verified' status for approval, plus any claims submitted by themselves
    filtered = filtered.filter((c) => c.status === "verified" || c.claimant === currentUser);
  } else if (role === "chairman") {
    // Chairman / Board sees ONLY claims escalated to 'further_approval'
    filtered = filtered.filter((c) => c.status === "further_approval");
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((c) => c.claimant.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  }

  const pageSize = 10;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const submitFeedback = () => {
    onTransition(feedbackClaim.id, "pending", feedbackText);
    setFeedbackClaim(null);
    setFeedbackText("");
  };

  const countSubtitle = useMemo(() => {
    if (role === "admin" || role === "financial_officer") {
      return `${filtered.length} total claim${filtered.length !== 1 ? "s" : ""} recorded`;
    }
    if (role === "ceo" && view === "verified-list") {
      return `${filtered.length} verified claim${filtered.length !== 1 ? "s" : ""} awaiting your review`;
    }
    if (role === "chairman" && view === "further-approval") {
      return `${filtered.length} claim${filtered.length !== 1 ? "s" : ""} awaiting Board approval`;
    }
    return `${filtered.length} claim${filtered.length !== 1 ? "s" : ""} in your list`;
  }, [role, view, filtered.length]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{item.label}</h2>
          <p className="text-xs text-slate-500 font-medium">{countSubtitle}</p>
        </div>
        <div className="flex items-center rounded-xl border border-slate-200 px-3.5 py-2 bg-white w-full sm:w-64 shadow-sm">
          <Search size={15} className="text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search claimant, ID..."
            className="ml-2 text-xs outline-none w-full bg-white text-slate-800 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {filtered.length === 0 ? (
          <EmptyState icon={item.icon} title="Nothing here yet" subtitle={`No claims currently sit in ${item.label.toLowerCase()}.`} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="text-left px-5 py-3">Claim ID</th>
                    <th className="text-left px-5 py-3">Claimant</th>
                    <th className="text-left px-5 py-3">Title</th>
                    <th className="text-left px-5 py-3">Amount</th>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paged.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-teal-800 whitespace-nowrap">{c.id}</td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">{c.claimant}</td>
                      <td className="px-5 py-3.5 text-slate-700">{c.title}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{fmtN(c.amount)}</td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{c.date}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5">
                        <ClaimActions claim={c} view={view} role={role} onTransition={onTransition} onOpenFeedback={setFeedbackClaim} onDelete={onDelete} onViewDetails={setSelectedClaim} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} setPage={setPage} totalItems={filtered.length} pageSize={pageSize} />
          </>
        )}
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <FileEdit size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedClaim.id}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">{selectedClaim.title}</h3>
                </div>
              </div>
              <button onClick={() => setSelectedClaim(null)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Claimant</p>
                <p className="font-bold text-slate-800 mt-1">{selectedClaim.claimant}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Department</p>
                <p className="font-bold text-slate-800 mt-1">{selectedClaim.dept}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Filing Date</p>
                <p className="font-bold text-slate-800 mt-1">{selectedClaim.date}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Status</p>
                <div className="mt-1"><StatusBadge status={selectedClaim.status} /></div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</p>
                <p className="font-bold text-teal-700 text-lg mt-1">{fmtN(selectedClaim.amount)}</p>
              </div>
              {selectedClaim.note && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Officer / Feedback Note</p>
                  <p className="font-medium text-slate-700 mt-1">{selectedClaim.note}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setSelectedClaim(null)} className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {feedbackClaim && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-200 animate-scale-in">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Send Feedback</h3>
            <p className="text-xs text-slate-500 mb-4">To {feedbackClaim.claimant} regarding {feedbackClaim.id}.</p>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              placeholder="e.g. Please attach a valid receipt..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none mb-4 font-medium focus:border-teal-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setFeedbackClaim(null)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600">Cancel</button>
              <button onClick={submitFeedback} className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700">Send Feedback</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const WIZARD_STEPS = [
  { id: 1, title: "Claimant & Details", subtitle: "Basic claimant identification" },
  { id: 2, title: "Claim Reasons", subtitle: "Business justification" },
  { id: 3, title: "Expense Itemization", subtitle: "Breakdown & calculations" },
  { id: 4, title: "Attachments & Review", subtitle: "Documents & final submission" },
];

function ManageClaimSheet({ onSubmitClaim, currentUser, onClose }) {
  const [step, setStep] = useState(1);
  const [claimantName, setClaimantName] = useState(currentUser || "Taoheed");
  const [claimRefNo, setClaimRefNo] = useState("MDOS-" + Math.floor(10000000000000 + Math.random() * 90000000000000));
  const [claimType, setClaimType] = useState("Staff Expense");
  const [companyName, setCompanyName] = useState("Halal Food Authority");
  const [contactPerson, setContactPerson] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [claimDate, setClaimDate] = useState(new Date().toISOString().slice(0, 10));

  const [reasons, setReasons] = useState([
    { id: 1, option: "Official Duty Expense", chg: false }
  ]);

  const [items, setItems] = useState([
    { id: 1, type: "In Budget", category: "Taxi Fare", note: "", currency: "GBP", payMode: "cash", card: 0, cash: 15000, bank: 0, vat: 0, total: 15000 }
  ]);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const [activeNoteModalItem, setActiveNoteModalItem] = useState(null);
  const [noteModalText, setNoteModalText] = useState("");

  const CATEGORY_OPTIONS = [
    "Underground Ticket", "National Rail Ticket", "Taxi Fare", "Car Hire (inc, fuel)", "Car Millage", "Car Parking", "Fuel", "Air Fare", "Hotel Accommodation", "Lunch/Dinner", "Sundry", "Office Consumables", "Standards & Export Cert", "DHL To Dubai x2 ()", "Cash Advancement", "Other Deductions", "Telephone Expenses", "Audit Fee (External)", "Gym Allowance", "Currency exchange charges", "Charity", "HFF expense", "Rent & Rates", "Service Charges", "Office Expense", "Meeting fee", "Office Cleaning", "Remuneration Payments", "Scholars Fee", "Honorarium payments", "Postage", "Stationary exp", "Computer Repair", "Computer/IT Expense"
  ];

  const TYPE_OPTIONS = ["None", "In Budget", "Not In Budget", "Not Applicable"];

  const addReasonRow = () => { setReasons([...reasons, { id: Date.now(), option: "", chg: false }]); };
  const removeReasonRow = (id) => { if (reasons.length > 1) setReasons(reasons.filter((r) => r.id !== id)); };
  const updateReason = (id, field, value) => { setReasons(reasons.map((r) => (r.id === id ? { ...r, [field]: value } : r))); };

  const addItemRow = () => {
    setItems([...items, { id: Date.now(), type: "In Budget", category: "", note: "", currency: "GBP", payMode: "cash", card: 0, cash: 0, bank: 0, vat: 0, total: 0 }]);
  };
  const removeItemRow = (id) => { if (items.length > 1) setItems(items.filter((item) => item.id !== id)); };

  const updateItem = (id, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "card" && parseFloat(value) > 0) { updated.cash = 0; updated.payMode = "card"; }
          else if (field === "cash" && parseFloat(value) > 0) { updated.card = 0; updated.payMode = "cash"; }
          const card = parseFloat(updated.card) || 0;
          const cash = parseFloat(updated.cash) || 0;
          const vat = parseFloat(updated.vat) || 0;
          updated.total = card + cash + vat;
          return updated;
        }
        return item;
      })
    );
  };

  const openNoteModal = (item) => { setActiveNoteModalItem(item); setNoteModalText(item.note || ""); };
  const saveNoteModal = () => {
    if (activeNoteModalItem) updateItem(activeNoteModalItem.id, "note", noteModalText);
    setActiveNoteModalItem(null); setNoteModalText("");
  };

  const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(e.type === "dragenter" || e.type === "dragover"); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) addFiles(Array.from(e.dataTransfer.files)); };
  const handleFileInput = (e) => { if (e.target.files && e.target.files[0]) addFiles(Array.from(e.target.files)); };
  const addFiles = (newFilesList) => { setUploadedFiles((prev) => [...prev, ...newFilesList.map((f) => ({ id: Date.now() + Math.random(), file: f, name: f.name, size: (f.size / 1024).toFixed(1) + " KB" }))]); };
  const removeFile = (id) => { setUploadedFiles((prev) => prev.filter((f) => f.id !== id)); };

  const CURRENCY_SYMBOLS = { NGN: "₦", GBP: "£", USD: "$", EUR: "€" };
  const fmtCurrency = (val, symbol = "£") => `${symbol}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const primaryCurrency = items[0]?.currency || "GBP";
  const activeSymbol = CURRENCY_SYMBOLS[primaryCurrency] || "£";

  const subtotalCard = items.reduce((sum, item) => sum + (parseFloat(item.card) || 0), 0);
  const subtotalCash = items.reduce((sum, item) => sum + (parseFloat(item.cash) || 0), 0);
  const subtotalVat = items.reduce((sum, item) => sum + (parseFloat(item.vat) || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const handleNext = () => {
    if (step === 1) { if (!claimantName.trim()) { alert("Please enter claimant name."); return; } }
    else if (step === 2) { if (reasons.length === 0 || !reasons[0].option) { alert("Please select at least one claim reason option."); return; } }
    else if (step === 3) { const validItem = items.some((i) => i.category); if (!validItem) { alert("Please select a description option for at least one item."); return; } }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const submitForm = (e) => {
    if (e) e.preventDefault();
    const primaryItem = items.find((i) => i.category) || items[0];
    const claimTitle = primaryItem.category ? `${primaryItem.category} Claim` : "General Expense Claim";

    onSubmitClaim({
      claimType: claimType || "Staff Expense",
      filingDate: claimDate || new Date().toISOString().slice(0, 10),
      companyName: companyName || "Halal Food Authority",
      contactPerson: contactPerson || "",
      contactEmail: contactEmail || "",
      reasons: reasons.map(r => ({ option: r.option, chg: r.chg || false })),
      items: items.map(i => ({
        type: i.type || "None",
        category: i.category,
        currency: i.currency || "GBP",
        payMode: i.payMode || "cash",
        card: parseFloat(i.card) || 0,
        cash: parseFloat(i.cash) || 0,
        vat: parseFloat(i.vat) || 0,
        total: parseFloat(i.total) || 0,
        note: i.note || ""
      })),
      subtotals: {
        subtotalCard,
        subtotalCash,
        subtotalVat,
        grandTotal
      },
      department: "Operations",
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-scale-in">
        <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-5 sm:px-8 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-[11px] font-semibold tracking-wide border border-teal-300/30">
                Claim Application Wizard
              </span>
              <span className="text-xs font-mono font-bold text-teal-100 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">
                {claimRefNo}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Submit New Claim</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
            title="Close Modal"
          >
            <X size={22} />
          </button>
        </div>

        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-8 py-3.5 flex-shrink-0">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto">
            {WIZARD_STEPS.map((s) => {
              const isCurrent = step === s.id;
              const isPassed = step > s.id;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => { if (isPassed) setStep(s.id); }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                    isCurrent
                      ? "bg-white border border-teal-300 shadow-sm text-teal-900"
                      : isPassed
                      ? "text-teal-700 hover:bg-white/60 cursor-pointer"
                      : "text-slate-400 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-[#007A87] text-white shadow-sm"
                        : isPassed
                        ? "bg-teal-100 text-teal-800"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isPassed ? <CheckCircle2 size={15} /> : s.id}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className={`text-xs font-bold truncate ${isCurrent ? "text-slate-900" : "text-slate-600"}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{s.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/30 space-y-6">
          {submitted && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm flex items-center gap-3 animate-scale-in">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-sm font-bold">Claim Submitted Successfully!</p>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  Reference: <span className="font-mono font-bold">{claimRefNo}</span>. Total amount logged: <span className="font-bold">{fmtN(grandTotal)}</span>.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Claimant & Organization Details</h3>
                  <p className="text-xs text-slate-500 font-normal">Basic claimant identification and organizational routing.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Claimant Name</label>
                  <input
                    type="text"
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Claim Type</label>
                  <select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  >
                    <option value="">...Select Type...</option>
                    <option value="Audit">Audit</option>
                    <option value="Supervision">Supervision</option>
                    <option value="Audit / Supervision">Audit / Supervision</option>
                    <option value="Payment Request Form">Payment Request Form</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                    <option value="Approved Supplier IT (Yearly)">Approved Supplier IT (Yearly)</option>
                    <option value="Approved Supplier Admin (Yearly)">Approved Supplier Admin (Yearly)</option>
                    <option value="Approved Supplier IT (Monthly)">Approved Supplier IT (Monthly)</option>
                    <option value="Approved Supplier Admin (Monthly)">Approved Supplier Admin (Monthly)</option>
                    <option value="Approved Supplier Training (Yearly)">Approved Supplier Training (Yearly)</option>
                    <option value="Approved Supplier Training (Monthly)">Approved Supplier Training (Monthly)</option>
                    <option value="Approved Supplier Advertisement (Yearly)">Approved Supplier Advertisement (Yearly)</option>
                    <option value="Approved Supplier Advertisement (Monthly)">Approved Supplier Advertisement (Monthly)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Filing Date</label>
                  <input
                    type="date"
                    required
                    value={claimDate}
                    onChange={(e) => setClaimDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Halal Food Authority"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Line Manager Name"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Contact E-Mail</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="email@hfa.org"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Claim Reasons & Options</h3>
                    <p className="text-xs text-slate-500 font-normal">Specify business reasons for this expense claim.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addReasonRow}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-sm"
                >
                  <Plus size={15} /> Add Reason
                </button>
              </div>

              <div className="space-y-3">
                {reasons.map((r, idx) => (
                  <div key={r.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex-1">
                      <select
                        value={r.option}
                        onChange={(e) => updateReason(r.id, "option", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 bg-white"
                      >
                        <option value="">....Select Option....</option>
                        <option value="Overseas Travel">Overseas Travel</option>
                        <option value="Training">Training</option>
                        <option value="Other Authorised">Other Authorised</option>
                        <option value="Event">Event</option>
                        <option value="Seminar/Conference">Seminar/Conference</option>
                        <option value="Office Expense">Office Expense</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Telephone Expense">Telephone Expense</option>
                        <option value="External Invoices">External Invoices</option>
                        <option value="Telephone Claim">Telephone Claim</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={r.chg}
                        onChange={(e) => updateReason(r.id, "chg", e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-xs font-semibold text-slate-700">Chargeable (Chg)</span>
                    </label>

                    {reasons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeReasonRow(r.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center justify-center"
                        title="Remove Reason"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Expense Itemization Breakdown</h3>
                    <p className="text-xs text-slate-500 font-normal">Add each individual expenditure with currency and payment method.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors"
                >
                  <Plus size={16} /> Add Expense Item
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#007A87] text-white font-semibold">
                      <th className="text-left px-4 py-3.5 min-w-[120px] whitespace-nowrap">Type</th>
                      <th className="text-left px-4 py-3.5 min-w-[150px] whitespace-nowrap">Description</th>
                      <th className="text-left px-3 py-3.5 w-24 whitespace-nowrap">Currency</th>
                      <th className="text-right px-3 py-3.5 w-28 whitespace-nowrap">Credit Card</th>
                      <th className="text-right px-3 py-3.5 w-28 whitespace-nowrap">Cash</th>
                      <th className="text-right px-3 py-3.5 w-24 whitespace-nowrap">VAT</th>
                      <th className="text-right px-4 py-3.5 w-28 whitespace-nowrap">Total</th>
                      <th className="text-center px-3 py-3.5 w-32 whitespace-nowrap">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <select
                            value={item.type}
                            onChange={(e) => updateItem(item.id, "type", e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 outline-none bg-white focus:border-teal-500 shadow-sm"
                          >
                            {TYPE_OPTIONS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={item.category}
                            onChange={(e) => updateItem(item.id, "category", e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 outline-none bg-white focus:border-teal-500"
                          >
                            <option value="">....Select Description Option....</option>
                            {CATEGORY_OPTIONS.map((cat) => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={item.currency}
                            onChange={(e) => updateItem(item.id, "currency", e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 outline-none bg-white focus:border-teal-500"
                          >
                            <option value="NGN">NGN (₦)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.card || ""}
                            onChange={(e) => updateItem(item.id, "card", e.target.value)}
                            placeholder="0.00"
                            className={`w-full border rounded-xl px-3 py-2 text-xs font-medium text-right outline-none focus:border-teal-500 ${
                              item.payMode === "card" && item.card > 0 ? "border-teal-400 bg-teal-50/30" : "border-slate-200"
                            }`}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.cash || ""}
                            onChange={(e) => updateItem(item.id, "cash", e.target.value)}
                            placeholder="0.00"
                            className={`w-full border rounded-xl px-3 py-2 text-xs font-medium text-right outline-none focus:border-teal-500 ${
                              item.payMode === "cash" && item.cash > 0 ? "border-teal-400 bg-teal-50/30" : "border-slate-200"
                            }`}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.vat || ""}
                            onChange={(e) => updateItem(item.id, "vat", e.target.value)}
                            placeholder="0.00"
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-right outline-none focus:border-teal-500"
                          />
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 text-xs">
                          {fmtCurrency(item.total, CURRENCY_SYMBOLS[item.currency] || "£")}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openNoteModal(item)}
                              className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 ${
                                item.note ? "bg-teal-100 text-teal-800 border border-teal-300" : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                              }`}
                              title="Add/View Note"
                            >
                              <MessageSquare size={12} />
                              <span className="hidden sm:inline">{item.note ? "Noted" : "Note"}</span>
                            </button>
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(item.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                                title="Remove item"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                      <td colSpan={3} className="px-4 py-3.5 text-right uppercase tracking-wider text-slate-600">
                        Grand Subtotals ({activeSymbol}):
                      </td>
                      <td className="px-3 py-3.5 text-right">{fmtCurrency(subtotalCard, activeSymbol)}</td>
                      <td className="px-3 py-3.5 text-right">{fmtCurrency(subtotalCash, activeSymbol)}</td>
                      <td className="px-3 py-3.5 text-right">{fmtCurrency(subtotalVat, activeSymbol)}</td>
                      <td className="px-4 py-3.5 text-right text-teal-800 text-sm font-extrabold">{fmtCurrency(grandTotal, activeSymbol)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Add Attachments & Supporting Documents</h3>
                      <p className="text-xs text-slate-500 font-normal">Attach multiple receipts, invoices, or supporting files to this claim.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                      {uploadedFiles.length} files attached
                    </span>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-sm"
                    >
                      <Plus size={15} /> Add Attachment
                    </button>
                  </div>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3
                    ${dragActive ? "border-teal-500 bg-teal-50/50 scale-[0.99]" : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300"}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-teal-100/60 text-teal-700 flex items-center justify-center shadow-inner">
                    <PlusCircle size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      <span className="text-teal-700 hover:underline">Click to browse</span> or drag and drop files here
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Supports JPG, PNG, PDF, DOCX up to 10MB each
                    </p>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {uploadedFiles.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">
                            {item.name.split('.').pop().slice(0, 3)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{item.size}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-slate-900 via-[#054D66] to-[#007A87] rounded-3xl p-6 text-white shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-bold text-sm tracking-tight text-teal-100">Claim Application Summary</h4>
                  <span className="text-xs font-mono font-semibold bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                    {claimRefNo}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-[11px] text-teal-200/80">Claimant</p>
                    <p className="font-bold text-white mt-0.5">{claimantName || currentUser}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-teal-200/80">Claim Type</p>
                    <p className="font-bold text-white mt-0.5">{claimType || "Standard"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-teal-200/80">Filing Date</p>
                    <p className="font-bold text-white mt-0.5">{claimDate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-teal-200/80">Grand Total Amount</p>
                    <p className="font-extrabold text-white-200 text-sm mt-0.5">{fmtCurrency(grandTotal, activeSymbol)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {activeNoteModalItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-teal-800">
                  <MessageSquare size={18} />
                  <h3 className="font-bold text-sm text-slate-900">Add Item Note / Other Info</h3>
                </div>
                <button type="button" onClick={() => setActiveNoteModalItem(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
              </div>
              <p className="text-xs text-slate-500">Provide additional context or details for <span className="font-bold text-slate-700">{activeNoteModalItem.category || "this expense line item"}</span>.</p>
              <textarea rows={4} value={noteModalText} onChange={(e) => setNoteModalText(e.target.value)} placeholder="Enter additional info or explanatory notes here..." className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 shadow-sm" />
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setActiveNoteModalItem(null)} className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={saveNoteModal} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md">Save Note</button>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              Step {step} of 4
            </span>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007A87] to-[#0D857B] hover:opacity-95 shadow-md transition-all"
              >
                <span>Next</span>
                <ChevronRightIcon size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitForm}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                <CheckCircle2 size={16} />
                <span>Submit Claim Application</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* ASSET VIEWS                                                       */
/* ---------------------------------------------------------------- */
function ManageAssetView({ assets }) {
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const pageSize = 10;
  const paged = assets.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manage Assets</h2>
          <p className="text-xs text-slate-500 font-medium">{assets.length} total asset records</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="text-left px-5 py-3">Asset ID</th>
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Department</th>
                <th className="text-left px-5 py-3">Acquired</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paged.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-teal-800">{a.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{a.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.category}</td>
                  <td className="px-5 py-3.5 text-slate-600">{a.dept}</td>
                  <td className="px-5 py-3.5 text-slate-500">{a.acquired}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      a.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelectedAsset(a)}
                      className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-700 shadow-sm transition-colors"
                      title="View Asset Details"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} setPage={setPage} totalItems={assets.length} pageSize={pageSize} />
      </div>

      {/* Asset Detail Popup Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedAsset.id}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-0.5">{selectedAsset.name}</h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Category</p>
                <p className="font-bold text-slate-800 mt-1">{selectedAsset.category}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Department</p>
                <p className="font-bold text-slate-800 mt-1">{selectedAsset.dept}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Date Acquired</p>
                <p className="font-bold text-slate-800 mt-1">{selectedAsset.acquired}</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Asset Status</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                  selectedAsset.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                }`}>
                  {selectedAsset.status}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">System Serial Number</p>
                <p className="font-mono font-bold text-teal-800 mt-1">
                  SN-AST-{selectedAsset.id.replace(/[^0-9]/g, '') || "994021"}-X88
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAsset(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewAssetListView() {
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-bold text-slate-900">New Asset List</h2>
      <p className="text-xs text-slate-500 font-medium">Assets pending inventory verification.</p>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <EmptyState icon={PackagePlus} title="No new assets" subtitle="Newly added assets awaiting review will appear here." />
      </div>
    </div>
  );
}

const ASSET_WIZARD_STEPS = [
  { id: 1, title: "Asset Details", subtitle: "Name & classification" },
  { id: 2, title: "Procurement Info", subtitle: "Purchase dates & seller" },
  { id: 3, title: "Attachments & Review", subtitle: "Documents & final registration" },
];

const genSerial = () =>
  "SN-AST-" + Math.floor(10000000 + Math.random() * 90000000);

function AddNewAssetView({ onAddAsset, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    staffName: "Builder",
    serialNumber: genSerial(),
    assetName: "",
    expiryDate: "",
    assetType: "",
    file: null,
    datePurchased: new Date().toISOString().slice(0, 10),
    amount: "",
    receivedDate: new Date().toISOString().slice(0, 10),
    sellerName: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFilesList) => {
    const mapped = newFilesList.map((f) => ({
      id: Date.now() + Math.random(),
      file: f,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + " KB",
    }));
    setUploadedFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.assetName.trim()) {
        alert("Please enter the Asset Name.");
        return;
      }
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const submit = (e) => {
    if (e) e.preventDefault();
    if (!form.assetName) return;

    onAddAsset({
      name: form.assetName,
      category: form.assetType || "Equipment",
      dept: "Operations",
      acquired: form.datePurchased || new Date().toISOString().slice(0, 10),
      status: "Active",
      staffName: form.staffName || "Builder",
      expiryDate: form.expiryDate || "",
      amount: parseFloat(form.amount) || 0,
      sellerName: form.sellerName || "",
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({
        staffName: "Builder",
        serialNumber: genSerial(),
        assetName: "",
        expiryDate: "",
        assetType: "",
        file: null,
        datePurchased: new Date().toISOString().slice(0, 10),
        amount: "",
        receivedDate: new Date().toISOString().slice(0, 10),
        sellerName: "",
      });
      setUploadedFiles([]);
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-scale-in">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#007A87] via-[#054D66] to-[#031B38] px-6 py-5 sm:px-8 text-white flex items-center justify-between relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-[11px] font-semibold tracking-wide border border-teal-300/30">
                Asset Register Wizard
              </span>
              <span className="text-xs font-mono font-bold text-teal-100 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">
                {form.serialNumber}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Add New Asset</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-2xl transition-colors"
            title="Close Modal"
          >
            <X size={22} />
          </button>
        </div>

        {/* Step Progress Indicator Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-8 py-3.5 flex-shrink-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-3xl mx-auto">
            {ASSET_WIZARD_STEPS.map((s) => {
              const isCurrent = step === s.id;
              const isPassed = step > s.id;
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => { if (isPassed) setStep(s.id); }}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                    isCurrent
                      ? "bg-white border border-teal-300 shadow-sm text-teal-900"
                      : isPassed
                      ? "text-teal-700 hover:bg-white/60 cursor-pointer"
                      : "text-slate-400 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-[#007A87] text-white shadow-sm"
                        : isPassed
                        ? "bg-teal-100 text-teal-800"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {isPassed ? <CheckCircle2 size={15} /> : s.id}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <p className={`text-xs font-bold truncate ${isCurrent ? "text-slate-900" : "text-slate-600"}`}>
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{s.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/30 space-y-6">
          {submitted && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm flex items-center gap-3 animate-scale-in">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-sm font-bold">Asset Registered Successfully!</p>
                <p className="text-xs text-emerald-700 font-medium mt-0.5">
                  Serial Number: <span className="font-mono font-bold">{form.serialNumber}</span>. The new asset entry now appears under Manage Asset.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1: ASSET DETAILS */}
          {step === 1 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Enter Asset Specifications</h3>
                  <p className="text-xs text-slate-500 font-normal">Basic identification, assignment, and system serial classification.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Staff Name:</label>
                  <select
                    value={form.staffName}
                    onChange={(e) => setForm({ ...form, staffName: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  >
                    <option value="Builder">Builder</option>
                    <option value="Ibrahim Musa">Ibrahim Musa</option>
                    <option value="Chidinma Okoro">Chidinma Okoro</option>
                    <option value="Samuel Ekong">Samuel Ekong</option>
                    <option value="Funmi Adisa">Funmi Adisa</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">Serial Number:</label>
                    {/* <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 border border-teal-200 tracking-wide">
                      System Generated
                    </span> */}
                  </div>
                  <input
                    type="text"
                    value={form.serialNumber}
                    readOnly
                    className="w-full border border-teal-200 rounded-xl px-4 py-3 text-xs font-mono font-bold text-teal-800 bg-teal-50/60 cursor-not-allowed select-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Asset Name:</label>
                  <input
                    type="text"
                    required
                    value={form.assetName}
                    onChange={(e) => setForm({ ...form, assetName: e.target.value })}
                    placeholder="e.g. Dell Latitude 5440 Laptop"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Expiry Date:</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Asset Type:</label>
                  <input
                    type="text"
                    value={form.assetType}
                    onChange={(e) => setForm({ ...form, assetType: e.target.value })}
                    placeholder="e.g. IT Equipment, Vehicle, Facility"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Amount (£):</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 450000"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROCUREMENT RECORDS */}
          {step === 2 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Procurement & Seller Information</h3>
                  <p className="text-xs text-slate-500 font-normal">Record acquisition dates, delivery timelines, and vendor details.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Date Purchased:</label>
                  <input
                    type="date"
                    value={form.datePurchased}
                    onChange={(e) => setForm({ ...form, datePurchased: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Received Date:</label>
                  <input
                    type="date"
                    value={form.receivedDate}
                    onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-2">Seller / Vendor Name:</label>
                  <input
                    type="text"
                    value={form.sellerName}
                    onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
                    placeholder="e.g. Dell Authorised Reseller Ltd"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ATTACHMENTS & REVIEW */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Asset Attachments & Invoices</h3>
                      <p className="text-xs text-slate-500 font-normal">Attach purchase receipts, warranty cards, or specification documents.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 px-3 py-1 bg-slate-100 rounded-full">
                      {uploadedFiles.length} files attached
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors shadow-sm"
                    >
                      <Plus size={15} /> Add File
                    </button>
                  </div>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3
                    ${dragActive ? "border-teal-500 bg-teal-50/50 scale-[0.99]" : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300"}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-teal-100/60 text-teal-700 flex items-center justify-center shadow-inner">
                    <PlusCircle size={28} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      <span className="text-teal-700 hover:underline">Click to browse</span> or drag and drop files here
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Attach receipts, warranty docs, or certificates
                    </p>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {uploadedFiles.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">
                            {item.name.split('.').pop().slice(0, 3)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{item.size}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(item.id); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Asset Registration Summary Overview Card */}
              <div className="bg-gradient-to-br from-slate-900 via-[#054D66] to-[#007A87] rounded-3xl p-6 text-white shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-bold text-sm tracking-tight text-teal-100">Asset Entry Registration Summary</h4>
                  <span className="text-xs font-mono font-semibold bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                    {form.serialNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="text-[11px] text-teal-200/80">Asset Name</p>
                    <p className="font-bold text-white mt-0.5">{form.assetName || "Unassigned"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-teal-200/80">Staff Assigned</p>
                    <p className="font-bold text-white mt-0.5">{form.staffName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-teal-200/80">Asset Type</p>
                    <p className="font-bold text-white mt-0.5">{form.assetType || "Equipment"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-teal-200/80">Procurement Value</p>
                    <p className="font-extrabold text-teal-300 text-sm mt-0.5">{form.amount ? fmtN(parseFloat(form.amount)) : "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Control Bar */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
              Step {step} of 3
            </span>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#007A87] to-[#0D857B] hover:opacity-95 shadow-md transition-all"
              >
                <span>Next</span>
                <ChevronRightIcon size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                <CheckCircle2 size={16} />
                <span>Register Asset Entry</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* USERS VIEW                                                        */
/* ---------------------------------------------------------------- */
function UsersView({ users, onAddUser, onUpdateUser, onDeleteUser, role }) {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", username: "", role: "user", password: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", username: "", role: "user", password: "" });

  const isAdmin = role === "admin";

  const submitAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password || !form.role) return;
    onAddUser(form);
    setForm({ name: "", email: "", username: "", role: "user", password: "" });
    setShowForm(false);
  };

  const startEdit = (u) => {
    setEditingUser(u);
    setEditForm({ _id: u._id, name: u.name, email: u.email, username: u.username, role: u.role });
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (!editForm.name) return;
    // Merge _id and username from the original editingUser so the handler can route correctly
    onUpdateUser({ ...editForm, _id: editingUser._id, username: editingUser.username });
    setEditingUser(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Management</h2>
          <p className="text-xs text-slate-500 font-medium">Manage organization accounts, credentials and system permissions.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md transition-colors"
          >
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitAdd} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-scale-in">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Add New User Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Full Name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium focus:border-teal-500" placeholder="e.g. Samuel Ekong" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Username</label>
              <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium focus:border-teal-500" placeholder="e.g. sekong" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Email Address</label>
              <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium focus:border-teal-500" placeholder="email@ifrs.org" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
              <input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium focus:border-teal-500" placeholder="Set user password" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Assign Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white text-slate-800 font-medium focus:border-teal-500">
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md">Create User Account</button>
          </div>
        </form>
      )}

      {/* User Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-5 py-3">Username</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">Role</th>
                {isAdmin && <th className="text-center px-5 py-3 w-28">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const roleInfo = ROLES.find((r) => r.id === u.role);
                return (
                  <tr key={u.username} className="hover:bg-slate-50 transition-colors font-medium">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-5 py-3.5 text-slate-700">{u.username}</td>
                    <td className="px-5 py-3.5 text-slate-600">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
                        {roleInfo?.label}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                            title="Edit User"
                          >
                            <FileEdit size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteUser(u.username)}
                            className="p-1.5 rounded-lg border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={submitEdit} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Edit User Details ({editingUser.username})</h3>
              <button type="button" onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                <input required value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} type="email" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-teal-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <input value={editForm.password || ""} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} type="password" className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-teal-500" placeholder="Leave blank to keep existing password" />
                <p className="text-[10px] text-slate-400 mt-1">Password changes are done separately — leave blank.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none bg-white focus:border-teal-500">
                  {ROLES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600">Cancel</button>
              <button type="submit" className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-700 shadow-md">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* MAIN APP                                                          */
/* ---------------------------------------------------------------- */
export default function IFRSPreview() {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const stored = localStorage.getItem("ifrs_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("ifrs_user", JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem("ifrs_user");
    }
  }, [loggedInUser]);

  const [activeView, setActiveView] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [claims, setClaims] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState(USERS_SEED);
  const [notifications, setNotifications] = useState([]);
  const [trackingClaim, setTrackingClaim] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const role = loggedInUser?.role || "user";
  const currentUser = loggedInUser?.name || loggedInUser?.username || "";

  // Build Authorization headers using token from logged-in user
  const apiHeaders = (extra = {}) => {
    const token = loggedInUser?.token || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  // Helper to extract array from common backend response shapes
  const extractList = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.data?.docs && Array.isArray(data.data.docs)) return data.data.docs;
    if (data?.docs && Array.isArray(data.docs)) return data.docs;
    return [];
  };

  // Fetch all backend data after login
  useEffect(() => {
    if (!loggedInUser) return;
    const token = loggedInUser?.token || "";
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    async function fetchAll() {
      setLoading(true);
      try {
        // Fetch Claims
        const claimsRes = await fetch(`${API_BASE_URL}/claims`, { headers });
        if (claimsRes.ok) {
          const d = await claimsRes.json();
          const list = extractList(d);
          const mapped = list.map((c) => ({
            _id: c._id,
            id: c.claimRefNo || c.claimNumber || c.id || c._id,
            claimant: c.claimantName || (c.claimantId && (c.claimantId.fullName || c.claimantId.name || c.claimantId.username)) || "User",
            dept: c.department || "Operations",
            title: c.claimType || "General Claim",
            amount: (c.subtotals && c.subtotals.grandTotal) || c.totalClaimAmount || c.amount || 0,
            date: c.filingDate ? new Date(c.filingDate).toISOString().slice(0, 10) : (c.claimDate ? new Date(c.claimDate).toISOString().slice(0, 10) : (c.date || new Date().toISOString().slice(0, 10))),
            status: c.status ? c.status.toLowerCase() : "new",
            note: c.officerNote || c.feedbackNote || c.note || ""
          }));
          setClaims(mapped);
          setApiConnected(true);
        } else {
          setClaims([]);
        }
      } catch { setClaims([]); }

      try {
        // Fetch Users
        const usersRes = await fetch(`${API_BASE_URL}/users`, { headers });
        if (usersRes.ok) {
          const d = await usersRes.json();
          const list = extractList(d);
          const mapped = list.map((u) => ({
            _id: u._id,
            name: u.fullName || u.name || "",
            email: u.email || "",
            role: u.role || "user",
            username: u.username || ""
          }));
          setUsers(mapped);
        }
      } catch { /* keep active user list */ }

      try {
        // Fetch Assets
        const assetsRes = await fetch(`${API_BASE_URL}/assets`, { headers });
        if (assetsRes.ok) {
          const d = await assetsRes.json();
          const list = extractList(d);
          const mapped = list.map((a) => ({
            _id: a._id,
            id: a.serialNumber || a.assetNumber || a.id || a._id,
            name: a.assetName || a.name || "",
            category: a.category || "Equipment",
            dept: a.department || "Operations",
            acquired: a.acquisitionDate ? new Date(a.acquisitionDate).toISOString().slice(0, 10) : (a.acquiredDate ? new Date(a.acquiredDate).toISOString().slice(0, 10) : (a.acquired || new Date().toISOString().slice(0, 10))),
            status: a.status || "Active",
            staffName: a.staffName || "",
            expiryDate: a.expiryDate ? new Date(a.expiryDate).toISOString().slice(0, 10) : "",
            amount: a.amount || 0,
            sellerVendor: a.sellerVendor || ""
          }));
          setAssets(mapped);
        } else {
          setAssets([]);
        }
      } catch { setAssets([]); }

      try {
        // Fetch Notifications
        const notifRes = await fetch(`${API_BASE_URL}/notifications`, { headers });
        if (notifRes.ok) {
          const d = await notifRes.json();
          const list = extractList(d);
          const mapped = list.map((n) => ({
            _id: n._id,
            id: n._id || n.id,
            title: n.title || "",
            body: n.body || "",
            type: n.type || "system",
            read: n.isRead ?? n.read ?? false,
            time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Just now"
          }));
          setNotifications(mapped);
        } else {
          setNotifications([]);
        }
      } catch { setNotifications([]); }

      setLoading(false);
    }
    fetchAll();
  }, [loggedInUser]);

  const access = MENU_ACCESS[role] || MENU_ACCESS.user || ["dashboard"];
  const view = access.includes(activeView) ? activeView : "dashboard";

  const handleTransition = async (id, newStatus, note) => {
    const claimObj = claims.find((c) => c.id === id || c._id === id);
    const dbId = claimObj?._id || id;
    const currentStatus = claimObj?.status; // e.g. "pending"
    
    // Optimistic UI update
    setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus, note: note ?? c.note } : c)));

    try {
      let res;
      if (currentStatus === "pending" && newStatus === "new") {
        // Resubmitting pending claim
        res = await fetch(`${API_BASE_URL}/claims/${dbId}/resubmit`, {
          method: "PUT",
          headers: apiHeaders(),
          body: JSON.stringify({ note: note || "Claim resubmitted after addressing feedback." }),
        });
      } else {
        // Standard transition
        res = await fetch(`${API_BASE_URL}/claims/${dbId}/transition`, {
          method: "PATCH",
          headers: apiHeaders(),
          body: JSON.stringify({ newStatus: newStatus.toUpperCase(), note }),
        });
      }

      if (!res.ok) {
        console.error("Transition failed with status:", res.status);
      }
    } catch (e) {
      console.error("Transition error:", e);
    }
  };

  const handleDeleteClaim = async (id) => {
    const claimObj = claims.find((c) => c.id === id || c._id === id);
    const dbId = claimObj?._id || id;
    
    // Optimistic UI update
    setClaims((prev) => prev.filter((c) => c.id !== id));

    try {
      await fetch(`${API_BASE_URL}/claims/${dbId}`, {
        method: "DELETE",
        headers: apiHeaders(),
      });
    } catch (e) {
      console.error("Delete claim error:", e);
    }
  };

  const handleSubmitClaim = async (claimPayload) => {
    try {
      const res = await fetch(`${API_BASE_URL}/claims`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(claimPayload),
      });
      if (res.ok) {
        const created = await res.json();
        const serverClaim = created.data || created.claim || created;
        const mappedClaim = {
          _id: serverClaim._id,
          id: serverClaim.claimRefNo || serverClaim.claimNumber || serverClaim.id || serverClaim._id,
          claimant: serverClaim.claimantName || (loggedInUser?.name || "User"),
          dept: serverClaim.department || "Operations",
          title: serverClaim.claimType || "General Claim",
          amount: (serverClaim.subtotals && serverClaim.subtotals.grandTotal) || 0,
          date: serverClaim.filingDate ? new Date(serverClaim.filingDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          status: serverClaim.status ? serverClaim.status.toLowerCase() : "new",
          note: serverClaim.officerNote || ""
        };
        setClaims((prev) => [mappedClaim, ...prev]);
      } else {
        console.error("Failed to submit claim:", res.status);
      }
    } catch (e) {
      console.error("Submit claim error:", e);
    }
  };

  const handleAddAsset = async (asset) => {
    try {
      const payload = {
        assetName: asset.name,
        staffName: asset.staffName || "Builder",
        category: asset.category,
        department: asset.dept,
        acquisitionDate: asset.acquired,
        expiryDate: asset.expiryDate || undefined,
        amount: asset.amount || 0,
        sellerVendor: asset.sellerName || "",
        status: asset.status || "Active",
      };
      
      const res = await fetch(`${API_BASE_URL}/assets`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        const serverAsset = created.data || created.asset || created;
        const mappedAsset = {
          _id: serverAsset._id,
          id: serverAsset.serialNumber || serverAsset.assetNumber || serverAsset.id || serverAsset._id,
          name: serverAsset.assetName || serverAsset.name || asset.name,
          category: serverAsset.category || asset.category,
          dept: serverAsset.department || asset.dept,
          acquired: serverAsset.acquisitionDate ? new Date(serverAsset.acquisitionDate).toISOString().slice(0, 10) : (serverAsset.acquiredDate ? new Date(serverAsset.acquiredDate).toISOString().slice(0, 10) : asset.acquired),
          status: serverAsset.status || asset.status,
          staffName: serverAsset.staffName || "",
          expiryDate: serverAsset.expiryDate ? new Date(serverAsset.expiryDate).toISOString().slice(0, 10) : "",
          amount: serverAsset.amount || 0,
          sellerVendor: serverAsset.sellerVendor || ""
        };
        setAssets((prev) => [mappedAsset, ...prev]);
      } else {
        console.error("Failed to register asset:", res.status);
      }
    } catch (e) {
      console.error("Add asset error:", e);
    }
  };

  const handleAddUser = async (u) => {
    try {
      const payload = {
        name: u.name,
        username: u.username,
        email: u.email,
        password: u.password,
        role: u.role,
        department: "Operations"
      };
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        const serverUser = created.data || created.user || created;
        const mappedUser = {
          _id: serverUser._id,
          name: serverUser.name || u.name,
          username: serverUser.username || u.username,
          email: serverUser.email || u.email,
          role: serverUser.role || u.role
        };
        setUsers((prev) => [...prev, mappedUser]);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to create user:", errData.message || res.status);
      }
    } catch (e) {
      console.error("Add user error:", e);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    // Optimistic UI update
    setUsers((prev) => prev.map((u) => (u.username === updatedUser.username ? { ...u, ...updatedUser } : u)));
    try {
      const dbId = updatedUser._id || updatedUser.username;
      if (!dbId) { console.warn("No identifier available to update user."); return; }
      const payload = {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        ...(updatedUser.password && updatedUser.password.trim() !== "" ? { password: updatedUser.password } : {})
      };
      const res = await fetch(`${API_BASE_URL}/users/${dbId}`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to update user:", errData.message || res.status);
      }
    } catch (e) {
      console.error("Update user error:", e);
    }
  };

  const handleDeleteUser = async (username) => {
    const userObj = users.find((u) => u.username === username);
    const dbId = userObj?._id;
    setUsers((prev) => prev.filter((u) => u.username !== username));
    try {
      if (!dbId) { console.warn("No _id found for user:", username); return; }
      const res = await fetch(`${API_BASE_URL}/users/${dbId}`, {
        method: "DELETE",
        headers: apiHeaders(),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to delete user:", errData.message || res.status);
      }
    } catch (e) {
      console.error("Delete user error:", e);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: apiHeaders(),
      });
    } catch { /* UI already updated */ }
  };

  if (!loggedInUser) return <LoginPage onLogin={(user) => { setLoggedInUser(user); setActiveView("dashboard"); }} />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-800">
      <Sidebar
        role={role}
        activeView={view}
        setActiveView={(v) => { setActiveView(v); setMobileOpen(false); }}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        claims={claims}
        assets={assets}
        users={users}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <Topbar
          role={role}
          viewTitle={VIEW_TITLES[view] || "Dashboard"}
          setMobileOpen={setMobileOpen}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          currentUser={currentUser}
          onLogout={() => { setLoggedInUser(null); setClaims([]); setActiveView("dashboard"); }}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          {(view === "dashboard" || view === "manage-claim-sheet") && (
            <DashboardView
              role={role}
              claims={claims}
              assets={assets}
              users={users}
              currentUser={currentUser}
              onNavigate={(targetView) => {
                const target = access.includes(targetView) ? targetView : "all-claims-list";
                setActiveView(target);
              }}
              onTrackClaim={(claim) => {
                setTrackingClaim(claim);
                setActiveView("track-claim");
              }}
              onTransition={handleTransition}
              onDelete={handleDeleteClaim}
            />
          )}
          {view === "manage-claim-sheet" && (
            <ManageClaimSheet
              onSubmitClaim={handleSubmitClaim}
              currentUser={currentUser}
              onClose={() => setActiveView("dashboard")}
            />
          )}
          {["new-claim-list", "verified-list", "approved-for-payment", "further-approval", "paid-list", "pending-claim-list", "rejected-claim-list", "all-claims-list"].includes(view) && (
            <ClaimListView
              view={view}
              role={role}
              claims={claims}
              onTransition={handleTransition}
              onDelete={handleDeleteClaim}
              currentUser={currentUser}
            />
          )}
          {view === "track-claim" && trackingClaim && (
            <ClaimTrackingView
              claim={trackingClaim}
              onBack={() => setActiveView("dashboard")}
            />
          )}
          {view === "track-claim" && !trackingClaim && (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
              <Activity size={48} className="mb-4 text-slate-300" />
              <p className="font-semibold">No claim selected for tracking.</p>
              <button onClick={() => setActiveView("dashboard")} className="mt-4 px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700">Back to Dashboard</button>
            </div>
          )}
          {(view === "manage-asset" || view === "add-new-asset") && <ManageAssetView assets={assets} />}
          {view === "new-asset-list" && <NewAssetListView />}
          {view === "add-new-asset" && (
            <AddNewAssetView
              onAddAsset={handleAddAsset}
              onClose={() => setActiveView("manage-asset")}
            />
          )}
          {view === "users" && (
            <UsersView
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              role={role}
            />
          )}
        </main>
      </div>
    </div>
  );
}
