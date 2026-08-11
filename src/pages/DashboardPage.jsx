import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileEdit, Clock3, XCircle, CheckCircle2, FilePlus2, BadgeCheck,
  CircleDollarSign, Wallet, Building2, ShieldCheck, ArrowRight
} from "lucide-react";
import StatCard4 from "../components/ui/StatCard4";
import DashboardClaimRow from "../components/claims/DashboardClaimRow";
import ClaimDetailsModal from "../components/claims/ClaimDetailsModal";
import { useApp } from "../context/AppContext";
import { ROLES, VIEW_TO_PATH } from "../constants/menu";
import { STATUS, fmtN } from "../constants/theme";

export default function DashboardPage() {
  const { role, claims, assets, currentUser, handleTransition, handleDeleteClaim } = useApp();
  const navigate = useNavigate();

  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState(null);
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

  const handleNavigateView = (viewKey) => {
    const path = VIEW_TO_PATH[viewKey] || "/claims";
    navigate(path);
  };

  const handleTrackClaim = (claim) => {
    navigate("/claims/track", { state: { claim } });
  };

  const submitFeedback = () => {
    if (feedbackClaim) {
      handleTransition(feedbackClaim.id, "pending", feedbackText);
      setFeedbackClaim(null);
      setFeedbackText("");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-lg"
        style={{ background: "linear-gradient(135deg, #007A87 0%, #054D66 50%, #031B38 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
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
              <p className="text-sm font-bold text-white uppercase">{ROLES.find((r) => r.id === role)?.label || role}</p>
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
            onClick={() => handleNavigateView(c.targetView)}
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
            onClick={() => navigate("/claims")}
            className="text-xs font-semibold text-teal-100 hover:text-white flex items-center gap-1 cursor-pointer"
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
                  onNavigate={handleNavigateView}
                  onTrack={() => handleTrackClaim(c)}
                  onTransition={handleTransition}
                  onOpenFeedback={(claim) => { setFeedbackClaim(claim); setFeedbackText(""); }}
                  onDelete={handleDeleteClaim}
                  onViewDetails={(claim) => setSelectedClaimForDetails(claim)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Claim Details Modal */}
      {selectedClaimForDetails && (
        <ClaimDetailsModal
          claim={selectedClaimForDetails}
          assets={assets}
          onClose={() => setSelectedClaimForDetails(null)}
        />
      )}

      {/* Feedback Modal */}
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
