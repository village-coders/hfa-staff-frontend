import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Search, ChevronDown, LogOut, X, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { T } from "../../constants/theme";
import { ROLES, NOTIF_COLORS as MENU_NOTIF_COLORS, VIEW_TITLES, PATH_TO_VIEW } from "../../constants/menu";
import { useApp } from "../../context/AppContext";

/* ---- Notification Panel ---- */
function NotificationPanel({ notifications, onMarkAllRead, onNotifClick, onClose }) {
  const [showAll, setShowAll] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const displayed = showAll ? notifications : notifications.slice(0, 5);

  const COLORS = {
    claim:    { dot: "#1D4ED8", bg: "#DBEAFE" },
    verified: { dot: "#4338CA", bg: "#E0E7FF" },
    pending:  { dot: "#B45309", bg: "#FEF3C7" },
    paid:     { dot: "#15803D", bg: "#DCFCE7" },
    asset:    { dot: "#0D857B", bg: "#CCFBF1" },
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs sm:hidden z-40" onClick={onClose} />
      <div className="fixed sm:absolute inset-x-4 top-16 sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-scale-in max-w-md mx-auto">
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
              <button onClick={onMarkAllRead} className="text-[10px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer">
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {displayed.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 font-medium">No notifications</div>
          ) : (
            displayed.map((n) => {
              const c = COLORS[n.type] || { dot: "#94A3B8", bg: "#F1F5F9" };
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (onNotifClick) onNotifClick(n);
                    onClose();
                  }}
                  className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-teal-50/70 ${n.read ? "bg-white" : "bg-teal-50/40"}`}
                >
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

        {notifications.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-center">
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900"
            >
              {showAll ? "Show less" : `View all notifications (${notifications.length})`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ---- Topbar ---- */
export default function Topbar({ role, setMobileOpen, notifications, onMarkAllRead, currentUser, onLogout, sidebarCollapsed, setSidebarCollapsed }) {
  const [profileMenu, setProfileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { handleNotificationClick } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  // Derive page title from URL path
  const viewKey = PATH_TO_VIEW[location.pathname] || "dashboard";
  const viewTitle = VIEW_TITLES[viewKey] || "Dashboard";

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileMenu(false);
    };
    if (profileMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileMenu]);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
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
          <h1 className="font-bold text-lg text-slate-900 leading-tight">{viewTitle}</h1>
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
              onNotifClick={(n) => handleNotificationClick(n, navigate)}
              onClose={() => setNotifOpen(false)}
            />
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileMenu((v) => !v)}
            className="flex items-center gap-3 p-1 pl-2 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-slate-200 bg-white"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {(currentUser || "?").charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-none">{currentUser}</p>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-1 uppercase">
                {ROLES.find((r) => r.id === role)?.label || role}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-scale-in">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow">
                    {(currentUser || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{currentUser}</p>
                    <p className="text-[10px] text-teal-700 font-semibold uppercase tracking-wide">
                      {ROLES.find((r) => r.id === role)?.label || role}
                    </p>
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
