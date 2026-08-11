import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useApp } from "../../context/AppContext";
import ManageClaimSheetPage from "../../pages/ManageClaimSheetPage";
import AddNewAssetPage from "../../pages/AddNewAssetPage";

export default function AppLayout() {
  const {
    loggedInUser, role, currentUser, claims, assets, users,
    notifications, handleLogout, handleMarkAllRead,
    isClaimSheetOpen, closeClaimSheet,
    isAddAssetOpen, closeAddAsset,
  } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect to login if not authenticated
  if (!loggedInUser) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans antialiased text-slate-800">
      <Sidebar
        role={role}
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
          setMobileOpen={setMobileOpen}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          currentUser={currentUser}
          onLogout={handleLogout}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals rendered via portal — triggered by sidebar or buttons */}
      {isClaimSheetOpen && (
        <ManageClaimSheetPage onClose={closeClaimSheet} />
      )}
      {isAddAssetOpen && (
        <AddNewAssetPage onClose={closeAddAsset} />
      )}
    </div>
  );
}
