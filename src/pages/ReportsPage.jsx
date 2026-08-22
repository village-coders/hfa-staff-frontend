import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, TrendingUp, Calendar, User, Building, Filter,
  Download, Printer, RefreshCw, DollarSign, CheckCircle2,
  Clock, AlertCircle, PieChart, Layers, ArrowUpRight,
  ChevronRight, Eye, ShieldAlert, FileText, Search
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { STATUS, fmtN } from "../constants/theme";
import ClaimDetailsModal from "../components/claims/ClaimDetailsModal";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";

export default function ReportsPage() {
  const { role, claims, users } = useApp();
  const navigate = useNavigate();

  // Filters state
  const [periodPreset, setPeriodPreset] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChartTab, setActiveChartTab] = useState("trend"); // 'trend' | 'status' | 'categories' | 'users'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Guard: Only super_admin can view reports
  const isSuperAdmin = role === "super_admin";

  // List of distinct claimants & departments
  const distinctUsers = useMemo(() => {
    const set = new Set();
    users.forEach((u) => { if (u.name) set.add(u.name); if (u.username) set.add(u.username); });
    claims.forEach((c) => { if (c.claimant) set.add(c.claimant); });
    return Array.from(set).filter(Boolean).sort();
  }, [users, claims]);

  const distinctDepts = useMemo(() => {
    const set = new Set();
    claims.forEach((c) => { if (c.dept) set.add(c.dept); });
    return Array.from(set).filter(Boolean).sort();
  }, [claims]);

  // Date range resolver
  const dateRange = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (periodPreset === "today") {
      return { start: todayStr, end: todayStr };
    }
    if (periodPreset === "7days") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { start: d.toISOString().slice(0, 10), end: todayStr };
    }
    if (periodPreset === "30days") {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return { start: d.toISOString().slice(0, 10), end: todayStr };
    }
    if (periodPreset === "this_month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      return { start, end: todayStr };
    }
    if (periodPreset === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      return { start, end };
    }
    if (periodPreset === "this_quarter") {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), currentQuarter * 3, 1).toISOString().slice(0, 10);
      return { start, end: todayStr };
    }
    if (periodPreset === "this_year") {
      const start = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
      return { start, end: todayStr };
    }
    if (periodPreset === "custom") {
      return { start: customStart, end: customEnd };
    }
    return { start: null, end: null }; // "all"
  }, [periodPreset, customStart, customEnd]);

  // Filtered transactions
  const filteredClaims = useMemo(() => {
    return claims.filter((c) => {
      // Date filter
      if (dateRange.start && c.date < dateRange.start) return false;
      if (dateRange.end && c.date > dateRange.end) return false;

      // User filter
      if (selectedUser !== "all") {
        const claimantMatch = (c.claimant || "").toLowerCase() === selectedUser.toLowerCase();
        if (!claimantMatch) return false;
      }

      // Dept filter
      if (selectedDept !== "all") {
        if ((c.dept || "").toLowerCase() !== selectedDept.toLowerCase()) return false;
      }

      // Status filter
      if (selectedStatus !== "all") {
        if ((c.status || "").toLowerCase() !== selectedStatus.toLowerCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const refMatch = (c.id || "").toLowerCase().includes(q);
        const nameMatch = (c.claimant || "").toLowerCase().includes(q);
        const deptMatch = (c.dept || "").toLowerCase().includes(q);
        const titleMatch = (c.title || "").toLowerCase().includes(q);
        if (!refMatch && !nameMatch && !deptMatch && !titleMatch) return false;
      }

      return true;
    });
  }, [claims, dateRange, selectedUser, selectedDept, selectedStatus, searchQuery]);

  // Financial KPI Metrics
  const metrics = useMemo(() => {
    const totalCount = filteredClaims.length;
    const totalValue = filteredClaims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const paidClaims = filteredClaims.filter((c) => c.status === "paid");
    const paidValue = paidClaims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const pendingClaims = filteredClaims.filter((c) => ["new", "verified", "pending", "further_approval", "approved_for_payment"].includes(c.status));
    const pendingValue = pendingClaims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const rejectedClaims = filteredClaims.filter((c) => c.status === "rejected");
    const rejectedValue = rejectedClaims.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

    const avgValue = totalCount > 0 ? totalValue / totalCount : 0;
    const maxClaim = filteredClaims.reduce((max, c) => (Number(c.amount) > (max.amount || 0) ? c : max), { amount: 0 });

    return {
      totalCount,
      totalValue,
      paidCount: paidClaims.length,
      paidValue,
      pendingCount: pendingClaims.length,
      pendingValue,
      rejectedCount: rejectedClaims.length,
      rejectedValue,
      avgValue,
      maxClaim,
    };
  }, [filteredClaims]);

  // Timeline / Trend Data Aggregation
  const timelineData = useMemo(() => {
    if (filteredClaims.length === 0) return [];

    const map = {};
    filteredClaims.forEach((c) => {
      const d = c.date || "Unknown";
      if (!map[d]) {
        map[d] = { date: d, amount: 0, count: 0, paidAmount: 0 };
      }
      map[d].amount += Number(c.amount) || 0;
      map[d].count += 1;
      if (c.status === "paid") {
        map[d].paidAmount += Number(c.amount) || 0;
      }
    });

    const sortedDates = Object.keys(map).sort();
    return sortedDates.map((date) => map[date]);
  }, [filteredClaims]);

  // Status Distribution Data
  const statusDistribution = useMemo(() => {
    const counts = {
      paid: { label: "Paid", count: 0, value: 0, color: "#10B981" },
      approved_for_payment: { label: "Approved For Payment", count: 0, value: 0, color: "#06B6D4" },
      verified: { label: "Verified (CEO Review)", count: 0, value: 0, color: "#6366F1" },
      further_approval: { label: "Further Approval (Board)", count: 0, value: 0, color: "#8B5CF6" },
      new: { label: "New (Unprocessed)", count: 0, value: 0, color: "#0EA5E9" },
      pending: { label: "Pending User Feedback", count: 0, value: 0, color: "#F59E0B" },
      rejected: { label: "Rejected", count: 0, value: 0, color: "#EF4444" },
    };

    filteredClaims.forEach((c) => {
      const st = c.status || "new";
      if (counts[st]) {
        counts[st].count += 1;
        counts[st].value += Number(c.amount) || 0;
      }
    });

    const totalVal = metrics.totalValue || 1;
    return Object.entries(counts).map(([key, data]) => ({
      key,
      ...data,
      percent: Math.round((data.value / totalVal) * 100),
    })).filter((item) => item.count > 0);
  }, [filteredClaims, metrics.totalValue]);

  // Expense Category Breakdown (from items & reasons)
  const categoryBreakdown = useMemo(() => {
    const map = {};
    filteredClaims.forEach((c) => {
      if (c.items && Array.isArray(c.items) && c.items.length > 0) {
        c.items.forEach((item) => {
          const cat = item.category || item.expenseType || "General Expense";
          if (!map[cat]) map[cat] = { category: cat, total: 0, count: 0 };
          const itemTotal = (Number(item.card) || 0) + (Number(item.cash) || 0) || Number(item.total) || 0;
          map[cat].total += itemTotal;
          map[cat].count += 1;
        });
      } else {
        const cat = c.claimType || "General Expense";
        if (!map[cat]) map[cat] = { category: cat, total: 0, count: 0 };
        map[cat].total += Number(c.amount) || 0;
        map[cat].count += 1;
      }
    });

    const total = Object.values(map).reduce((sum, item) => sum + item.total, 0) || 1;
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        ...item,
        percent: Math.round((item.total / total) * 100),
      }));
  }, [filteredClaims]);

  // User / Claimant Breakdown Leaderboard
  const userBreakdown = useMemo(() => {
    const map = {};
    filteredClaims.forEach((c) => {
      const u = c.claimant || "Unknown User";
      if (!map[u]) map[u] = { name: u, dept: c.dept || "Operations", total: 0, count: 0, paidTotal: 0 };
      map[u].total += Number(c.amount) || 0;
      map[u].count += 1;
      if (c.status === "paid") map[u].paidTotal += Number(c.amount) || 0;
    });

    const total = metrics.totalValue || 1;
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .map((item) => ({
        ...item,
        percent: Math.round((item.total / total) * 100),
      }));
  }, [filteredClaims, metrics.totalValue]);

  // Reset all filters
  const handleResetFilters = () => {
    setPeriodPreset("all");
    setCustomStart("");
    setCustomEnd("");
    setSelectedUser("all");
    setSelectedDept("all");
    setSelectedStatus("all");
    setSearchQuery("");
    setPage(1);
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredClaims.length === 0) {
      alert("No transaction records to export with current filters.");
      return;
    }

    const headers = ["Claim Ref", "Claimant Name", "Department", "Date", "Status", "Amount (£)", "Reasons / Title", "Items Count"];
    const rows = filteredClaims.map((c) => [
      `"${c.id}"`,
      `"${c.claimant || ""}"`,
      `"${c.dept || ""}"`,
      `"${c.date || ""}"`,
      `"${c.status || ""}"`,
      `"${Number(c.amount || 0).toFixed(2)}"`,
      `"${(c.reasons && c.reasons.map((r) => r.reason).join("; ")) || c.title || ""}"`,
      `"${(c.items && c.items.length) || 0}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HFA_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Paginated table data
  const pagedClaims = useMemo(() => {
    return filteredClaims.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredClaims, page]);

  // If user is not super_admin, show access denied view
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1.5">Super Admin Access Required</h2>
        <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
          The Financial Transaction Reports & Analytics module is restricted exclusively to Super Administrators.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2.5 bg-[#007A87] hover:bg-[#054D66] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Max value for timeline scaling
  const maxTimelineAmount = timelineData.reduce((max, d) => Math.max(max, d.amount), 0) || 100;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header Banner */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-lg"
        style={{ background: "linear-gradient(135deg, #007A87 0%, #054D66 50%, #031B38 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 15% 50%, #14B8A6 0%, transparent 40%), radial-gradient(circle at 85% 30%, #38BDF8 0%, transparent 40%)",
          }}
        />
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-teal-400/20 text-teal-200 border border-teal-300/30">
                Super Admin Analytics
              </span>
              <span className="text-teal-200/60 text-xs">• Live Audit & Reports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Financial Transaction Reports
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80 mt-1 max-w-xl leading-relaxed">
              Comprehensive visual cashflow analysis, user spending distributions, and transaction ledger.
            </p>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-sm transition-all shadow-sm cursor-pointer"
              title="Download CSV report"
            >
              <Download size={15} className="text-teal-200" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 backdrop-blur-sm transition-all shadow-sm cursor-pointer"
              title="Print report"
            >
              <Printer size={15} className="text-teal-200" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-500/80 hover:bg-teal-500 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
              title="Reset all filters"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <Filter size={15} className="text-teal-600" />
            <span>Interactive Filter Controls</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400">
            Showing <strong className="text-slate-900">{filteredClaims.length}</strong> of <strong className="text-slate-900">{claims.length}</strong> transactions
          </div>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Period Preset */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Calendar size={13} className="text-teal-600" /> Period of Time
            </label>
            <select
              value={periodPreset}
              onChange={(e) => {
                setPeriodPreset(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Time (Full Ledger)</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* User / Claimant Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <User size={13} className="text-teal-600" /> Filter by User / Claimant
            </label>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Users & Claimants ({distinctUsers.length})</option>
              {distinctUsers.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Building size={13} className="text-teal-600" /> Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Departments</option>
              {distinctDepts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
              <Layers size={13} className="text-teal-600" /> Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="approved_for_payment">Approved For Payment</option>
              <option value="verified">Verified</option>
              <option value="further_approval">Further Approval</option>
              <option value="new">New</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs (Shown when 'custom' is selected) */}
        {periodPreset === "custom" && (
          <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-scale-in">
            <div>
              <label className="text-[10px] font-bold text-teal-900 uppercase block mb-1">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full bg-white border border-teal-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-teal-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-teal-900 uppercase block mb-1">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full bg-white border border-teal-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-teal-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Transaction Volume */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Volume</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{fmtN(metrics.totalValue)}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-teal-700">
            <span>{metrics.totalCount} claims recorded</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Avg {fmtN(metrics.avgValue)}</span>
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Disbursed / Paid</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-900">{fmtN(metrics.paidValue)}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
            <span>{metrics.paidCount} claims settled</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">{metrics.totalValue > 0 ? Math.round((metrics.paidValue / metrics.totalValue) * 100) : 0}% of total</span>
          </div>
        </div>

        {/* In-Process / Pending Review */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-900">{fmtN(metrics.pendingValue)}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-700">
            <span>{metrics.pendingCount} in workflow</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">{metrics.totalValue > 0 ? Math.round((metrics.pendingValue / metrics.totalValue) * 100) : 0}% of total</span>
          </div>
        </div>

        {/* Rejected / Returned */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rejected Value</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-900">{fmtN(metrics.rejectedValue)}</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-rose-700">
            <span>{metrics.rejectedCount} rejected</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Highest: {fmtN(metrics.maxClaim.amount || 0)}</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Visual Display Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Chart Navigation Tabs Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/60">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={18} className="text-teal-600" />
              <span>Visual Chart Analysis</span>
            </h2>
            <p className="text-xs text-slate-500 font-normal">Interactive graphic distribution based on active filter parameters.</p>
          </div>

          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex-wrap">
            <button
              onClick={() => setActiveChartTab("trend")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === "trend" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Timeline Trend
            </button>
            <button
              onClick={() => setActiveChartTab("status")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === "status" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Status Breakdown
            </button>
            <button
              onClick={() => setActiveChartTab("categories")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === "categories" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Expense Categories
            </button>
            <button
              onClick={() => setActiveChartTab("users")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === "users" ? "bg-teal-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              User Spending
            </button>
          </div>
        </div>

        {/* Tab 1: Timeline / Cashflow Trend Chart */}
        {activeChartTab === "trend" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" />
                <span className="text-xs font-bold text-slate-700">Total Transaction Amount (£)</span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block ml-3" />
                <span className="text-xs font-bold text-slate-700">Paid Disbursed (£)</span>
              </div>
              <p className="text-[11px] text-slate-400">Hover over any bar to inspect daily transaction details.</p>
            </div>

            {timelineData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <FileText size={28} className="text-slate-300 mb-2" />
                <span>No timeline data found for selected period/user.</span>
              </div>
            ) : (
              <div className="relative">
                {/* SVG Bar / Area Chart */}
                <div className="h-72 w-full flex items-end gap-2 pt-6 pb-8 px-2 border-b border-slate-100 overflow-x-auto">
                  {timelineData.map((d, idx) => {
                    const heightPercent = Math.max(8, Math.round((d.amount / maxTimelineAmount) * 100));
                    const paidPercent = d.amount > 0 ? Math.round((d.paidAmount / d.amount) * 100) : 0;
                    const isHovered = hoveredPoint === idx;

                    return (
                      <div
                        key={d.date}
                        className="flex-1 min-w-[36px] max-w-[64px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Tooltip */}
                        {isHovered && (
                          <div className="absolute -top-16 z-20 bg-slate-900 text-white text-[10px] rounded-xl px-3 py-2 shadow-xl whitespace-nowrap pointer-events-none animate-scale-in border border-slate-700">
                            <p className="font-bold text-teal-300">{d.date}</p>
                            <p className="font-semibold">{fmtN(d.amount)} ({d.count} claims)</p>
                            <p className="text-emerald-400">Paid: {fmtN(d.paidAmount)}</p>
                          </div>
                        )}

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-xl transition-all duration-300 flex flex-col justify-end overflow-hidden ${
                            isHovered ? "ring-2 ring-teal-500 shadow-md scale-102" : "opacity-90 hover:opacity-100"
                          }`}
                          style={{
                            height: `${heightPercent}%`,
                            background: "linear-gradient(180deg, #0D9488 0%, #042F2E 100%)",
                          }}
                        >
                          {/* Inner Paid fill */}
                          {d.paidAmount > 0 && (
                            <div
                              className="w-full bg-emerald-500/80 transition-all"
                              style={{ height: `${paidPercent}%` }}
                              title={`Paid: ${fmtN(d.paidAmount)}`}
                            />
                          )}
                        </div>

                        {/* X-axis Label */}
                        <span className="absolute -bottom-6 text-[10px] font-semibold text-slate-500 truncate max-w-[48px]">
                          {d.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Status Breakdown Donut & Table */}
        {activeChartTab === "status" && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Donut Graphic Visualizer */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="14" />
                  {(() => {
                    let cumulativePercent = 0;
                    return statusDistribution.map((st) => {
                      const strokeDasharray = `${st.percent} ${100 - st.percent}`;
                      const strokeDashoffset = -cumulativePercent;
                      cumulativePercent += st.percent;
                      return (
                        <circle
                          key={st.key}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={st.color}
                          strokeWidth="14"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Spend</span>
                  <span className="text-xl font-black text-slate-900">{fmtN(metrics.totalValue)}</span>
                  <span className="text-[10px] font-semibold text-teal-600">{metrics.totalCount} Transactions</span>
                </div>
              </div>
            </div>

            {/* Status Breakdown Legend & Details */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Status Distribution Breakdown</h3>
              <div className="space-y-2.5">
                {statusDistribution.map((st) => (
                  <div key={st.key} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-lg shadow-xs flex-shrink-0" style={{ backgroundColor: st.color }} />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{st.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{st.count} transactions recorded</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900">{fmtN(st.value)}</p>
                      <p className="text-[10px] font-bold" style={{ color: st.color }}>{st.percent}% share</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Expense Category Breakdown */}
        {activeChartTab === "categories" && (
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Itemized Expense Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.category} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                    <span className="text-xs font-black text-teal-900">{fmtN(cat.total)}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.max(5, cat.percent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span>{cat.count} individual line items</span>
                    <span>{cat.percent}% of filtered total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: User Spending Leaderboard */}
        {activeChartTab === "users" && (
          <div className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Spending Users & Claimants</h3>
            <div className="space-y-2.5">
              {userBreakdown.map((u, idx) => (
                <div key={u.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-100/80 text-teal-800 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{u.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{u.dept} • {u.count} total claims submitted</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Incurred</p>
                      <p className="text-xs font-black text-slate-900">{fmtN(u.total)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Paid Out</p>
                      <p className="text-xs font-bold text-emerald-700">{fmtN(u.paidTotal)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUser(u.name);
                        setPage(1);
                      }}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white hover:bg-teal-50 text-teal-700 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                    >
                      Filter User
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filtered Transactions Detailed Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Filtered Transactions Ledger</h3>
            <p className="text-xs text-slate-500 font-normal">Audit each individual transaction row matching current active criteria.</p>
          </div>

          {/* Table Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, claimant..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-teal-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="text-left px-5 py-3.5">Ref No</th>
                <th className="text-left px-5 py-3.5">Claimant User</th>
                <th className="text-left px-5 py-3.5">Department</th>
                <th className="text-left px-5 py-3.5">Date</th>
                <th className="text-left px-5 py-3.5">Category / Title</th>
                <th className="text-left px-5 py-3.5">Status</th>
                <th className="text-right px-5 py-3.5">Amount</th>
                <th className="text-center px-5 py-3.5 w-20">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedClaims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                pagedClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors font-medium">
                    <td className="px-5 py-3.5 font-bold font-mono text-teal-800">{c.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">{c.claimant}</td>
                    <td className="px-5 py-3.5 text-slate-600">{c.dept}</td>
                    <td className="px-5 py-3.5 text-slate-500">{c.date}</td>
                    <td className="px-5 py-3.5 text-slate-700 max-w-[200px] truncate">{c.title || (c.reasons && c.reasons[0]?.reason) || "Staff Expense"}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-900">{fmtN(c.amount)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedClaimForDetails(c)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-xs cursor-pointer"
                        title="View Full Claim Sheet Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100">
          <Pagination
            page={page}
            setPage={setPage}
            totalItems={filteredClaims.length}
            pageSize={pageSize}
          />
        </div>
      </div>

      {/* Claim Details Modal */}
      {selectedClaimForDetails && (
        <ClaimDetailsModal
          claim={selectedClaimForDetails}
          onClose={() => setSelectedClaimForDetails(null)}
        />
      )}
    </div>
  );
}
