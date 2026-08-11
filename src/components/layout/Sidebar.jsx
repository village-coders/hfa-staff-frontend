import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Bell, BookOpen, Users as UsersIcon,
  ChevronDown, ChevronRight, ArrowRight, Shield, X
} from "lucide-react";
import { CLAIM_ITEMS, ASSET_ITEMS, MENU_ACCESS, VIEW_TO_PATH } from "../../constants/menu";
import { T } from "../../constants/theme";
import { useApp } from "../../context/AppContext";
import logo from "../../logo.jpg";

function NavSection({ icon: Icon, label, items, access = [], currentViewKey, collapsed, counts = {}, sectionCount, open, onToggle, onItemClick }) {
  const visible = items.filter((it) => (access || []).includes(it.key));
  if (visible.length === 0) return null;

  if (collapsed) {
    return (
      <div className="mb-1 space-y-1">
        {visible.map((it) => {
          const ItemIcon = it.icon;
          const active = currentViewKey === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onItemClick(it.key)}
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
            const active = currentViewKey === it.key;
            const count = counts[it.key];
            return (
              <button
                key={it.key}
                onClick={() => onItemClick(it.key)}
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

export default function Sidebar({ role, mobileOpen, setMobileOpen, claims = [], assets = [], users = [], collapsed, setCollapsed }) {
  const [claimOpen, setClaimOpen] = useState(true);
  const [assetOpen, setAssetOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { openClaimSheet, openAddAsset } = useApp();

  const handleItemClick = (key) => {
    navigate(VIEW_TO_PATH[key] || "/dashboard");
    setMobileOpen(false);
  };

  const access = MENU_ACCESS[role] || MENU_ACCESS.user || [];

  // Derive the current view key from the URL path
  const currentViewKey = Object.entries(VIEW_TO_PATH).find(([, path]) => path === location.pathname)?.[0] || "dashboard";

  // Sidebar badge counts
  const claimCounts = (() => {
    const currentUser = users.find((u) => u.role === role)?.name || "";
    const isTotalViewer = role === "admin" || role === "financial_officer";
    const list = isTotalViewer ? claims : claims.filter((c) => c.claimant === currentUser);
    const counts = {
      "manage-claim-sheet": null,
      "all-claims-list": isTotalViewer ? claims.length : list.length,
    };
    list.forEach((c) => {
      const item = CLAIM_ITEMS.find((it) => it.status === c.status);
      if (item) counts[item.key] = (counts[item.key] || 0) + 1;
    });
    CLAIM_ITEMS.forEach((it) => {
      if (it.status && counts[it.key] === undefined) {
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
  })();

  const assetCounts = {
    "manage-asset": assets.length,
    "new-asset-list": 0,
    "add-new-asset": null,
  };

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

          <nav className={`p-3 space-y-1 ${collapsed ? "px-2" : "px-4"}`}>
            <button
              onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}
              title={collapsed ? "Dashboard" : undefined}
              className={`w-full flex items-center gap-3 rounded-xl text-xs font-semibold transition-all
                ${collapsed ? "justify-center p-3" : "px-4 py-2.5"}
                ${currentViewKey === "dashboard"
                  ? "bg-[#14B8A6]/90 text-white shadow-sm"
                  : "text-teal-50/80 hover:bg-white/10 hover:text-white"
                }`}
            >
              <LayoutDashboard size={collapsed ? 18 : 16} />
              {!collapsed && "Dashboard"}
            </button>

            {collapsed && (
              <div className="flex justify-center py-1"><div className="w-6 h-px bg-white/10" /></div>
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
              currentViewKey={currentViewKey}
              open={claimOpen}
              onToggle={() => setClaimOpen((v) => !v)}
              counts={claimCounts}
              sectionCount={claims.length}
              collapsed={collapsed}
              onItemClick={handleItemClick}
            />

            {collapsed && (
              <div className="flex justify-center py-1"><div className="w-6 h-px bg-white/10" /></div>
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
              currentViewKey={currentViewKey}
              open={assetOpen}
              onToggle={() => setAssetOpen((v) => !v)}
              counts={assetCounts}
              sectionCount={assets.length}
              collapsed={collapsed}
              onItemClick={handleItemClick}
            />

            {access.includes("users") && (
              <button
                onClick={() => { navigate("/users"); setMobileOpen(false); }}
                title={collapsed ? "Users" : undefined}
                className={`w-full flex items-center gap-3 rounded-xl text-xs font-semibold transition-all
                  ${collapsed ? "justify-center p-3" : "px-4 py-2.5 justify-between"}
                  ${currentViewKey === "users"
                    ? "bg-[#14B8A6]/90 text-white shadow-sm"
                    : "text-teal-50/80 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span className="flex items-center gap-3">
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
              onClick={() => navigate("/dashboard")}
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
