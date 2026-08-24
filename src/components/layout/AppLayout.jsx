import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useApp } from "../../context/AppContext";
import ClaimDetailsModal from "../claims/ClaimDetailsModal";
import LoadingScreen from "../ui/LoadingScreen";
import ToastContainer from "../ui/Toast";

export default function AppLayout() {
  const {
    loggedInUser, role, currentUser, claims, assets, users,
    notifications, handleLogout, handleMarkAllRead,
    selectedClaimForDetails, closeClaimDetails,
    loading, toasts, dismissToast
  } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect to login if not authenticated
  if (!loggedInUser) return <Navigate to="/login" replace />;

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      {loading && <LoadingScreen />}
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

      {/* Global Claim Details Modal — opens when notification or claim action requests details */}
      {selectedClaimForDetails && (
        <ClaimDetailsModal
          claim={selectedClaimForDetails}
          onClose={closeClaimDetails}
        />
      )}
    </div>
    </>
  );
}
