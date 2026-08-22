import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ClaimsPage from "./pages/ClaimsPage";
import ManageClaimSheetPage from "./pages/ManageClaimSheetPage";
import ClaimTrackingPage from "./pages/ClaimTrackingPage";
import AssetsPage from "./pages/AssetsPage";
import AddNewAssetPage from "./pages/AddNewAssetPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes inside AppLayout */}
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Claims Routes */}
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/claims/new" element={<ManageClaimSheetPage />} />
            <Route path="/claims/new-list" element={<ClaimsPage />} />
            <Route path="/claims/verified" element={<ClaimsPage />} />
            <Route path="/claims/approved" element={<ClaimsPage />} />
            <Route path="/claims/further-approval" element={<ClaimsPage />} />
            <Route path="/claims/paid" element={<ClaimsPage />} />
            <Route path="/claims/pending" element={<ClaimsPage />} />
            <Route path="/claims/rejected" element={<ClaimsPage />} />
            <Route path="/claims/track" element={<ClaimTrackingPage />} />

            {/* Assets Routes */}
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/new-list" element={<AssetsPage />} />
            <Route path="/assets/add" element={<AddNewAssetPage />} />

            {/* Users & Reports Routes */}
            <Route path="/users" element={<UsersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
