import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../constants/theme";

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function AppProvider({ children }) {
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const stored = localStorage.getItem("ifrs_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const role = loggedInUser?.role || "user";
  const currentUser = loggedInUser?.name || loggedInUser?.username || "";

  const [claims, setClaims] = useState(() => {
    try {
      const stored = sessionStorage.getItem("ifrs_cached_claims");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [deletedClaims, setDeletedClaims] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [claimStats, setClaimStats] = useState(() => {
    try {
      const stored = sessionStorage.getItem("ifrs_cached_stats");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(() => {
    try {
      const stored = localStorage.getItem("ifrs_user");
      if (!stored) return false;
      const cachedStats = sessionStorage.getItem("ifrs_cached_stats");
      return !cachedStats;
    } catch {
      return false;
    }
  });
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [transitioningId, setTransitioningId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success", duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-4), { id, message, type, duration }]);
  };
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));
  const hideToast = () => setToasts([]);

  const [isClaimSheetOpen, setIsClaimSheetOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState(null);

  const openClaimSheet = () => setIsClaimSheetOpen(true);
  const closeClaimSheet = () => setIsClaimSheetOpen(false);

  const openAddAsset = () => setIsAddAssetOpen(true);
  const closeAddAsset = () => setIsAddAssetOpen(false);

  const openClaimDetails = async (claim) => {
    if (!claim) return;
    setSelectedClaimForDetails(claim);
    try {
      const id = claim._id || claim.id;
      const res = await fetch(`${API_BASE_URL}/claims/${id}`, { headers: apiHeaders() });
      if (res.ok) {
        const full = await res.json();
        const data = full.data || full.claim || full;
        if (data) {
          setSelectedClaimForDetails((prev) => ({
            ...prev,
            ...data,
            id: data.claimRefNo || data.claimNumber || data.id || prev?.id || id,
            claimant: data.claimantName || (data.claimantId && (data.claimantId.fullName || data.claimantId.name || data.claimantId.username)) || prev?.claimant || "User",
            attachments: (Array.isArray(data.attachments) && data.attachments.length > 0)
              ? data.attachments
              : (Array.isArray(data.files) && data.files.length > 0)
              ? data.files
              : (Array.isArray(prev?.attachments) && prev.attachments.length > 0)
              ? prev.attachments
              : (Array.isArray(claim.attachments) ? claim.attachments : []),
            items: (Array.isArray(data.items) && data.items.length > 0) ? data.items : (prev?.items || claim.items || []),
            reasons: (Array.isArray(data.reasons) && data.reasons.length > 0) ? data.reasons : (prev?.reasons || claim.reasons || []),
            note: data.note || data.notes || data.officerNote || prev?.note || claim.note || "",
            status: data.status ? (data.status.toLowerCase() === "new" ? "submitted" : data.status.toLowerCase()) : (prev?.status || claim.status || "submitted"),
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load full claim details:", e);
    }
  };
  const closeClaimDetails = () => setSelectedClaimForDetails(null);

  // Persist auth
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem("ifrs_user", JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem("ifrs_user");
    }
  }, [loggedInUser]);

  // Auth headers helper
  const apiHeaders = (extra = {}) => {
    const token = loggedInUser?.token || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  // Extract list from various backend response shapes
  const extractList = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.data?.docs && Array.isArray(data.data.docs)) return data.data.docs;
    if (data?.docs && Array.isArray(data.docs)) return data.docs;
    return [];
  };

  // Format dates safely across varied backend formats
  const safeFormatDate = (raw) => {
    if (!raw) return "";
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return String(raw).slice(0, 10);
      return d.toISOString().slice(0, 10);
    } catch {
      return String(raw).slice(0, 10);
    }
  };

  // Helper: if token is invalid (401), clear session. 403 (permission denied) simply returns false without logging out.
  const checkAuth = (res) => {
    if (res.status === 401) {
      localStorage.removeItem("ifrs_user");
      localStorage.removeItem("token");
      try {
        sessionStorage.removeItem("ifrs_cached_claims");
        sessionStorage.removeItem("ifrs_cached_stats");
      } catch {}
      setLoggedInUser(null);
      setLoading(false);
      return false;
    }
    return res.ok;
  };


  // Fetch all data after login
  useEffect(() => {
    if (!loggedInUser) {
      setLoading(false);
      return;
    }
    const token = loggedInUser?.token || "";
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    async function fetchAll() {
      // 1. Fast parallel fetch for summary stats (renders dashboard immediately in <250ms)
      const summaryPromise = fetch(`${API_BASE_URL}/claims/summary`, { headers })
        .then(async (r) => {
          if (checkAuth(r)) {
            const s = await r.json();
            if (s && s.success) {
              setClaimStats(s);
              try { sessionStorage.setItem("ifrs_cached_stats", JSON.stringify(s)); } catch {}
            }
          }
        })
        .catch(() => {});

      // Release the full-screen workspace loading screen quickly as soon as summary stats arrive,
      // or at most after a snappy 350ms transition so the user enters their workspace immediately!
      const splashTimeout = new Promise((res) => setTimeout(res, 350));
      Promise.race([summaryPromise, splashTimeout]).finally(() => {
        setLoading(false);
      });

      // 2. Fetch Claims (concurrently in parallel)
      setClaimsLoading(true);
      const claimsPromise = fetch(`${API_BASE_URL}/claims?limit=10000`, { headers })
        .then(async (claimsRes) => {
          if (checkAuth(claimsRes)) {
            const d = await claimsRes.json();
            const list = extractList(d);
            const mapped = list.map((c) => ({
              _id: c._id,
              id: c.claimRefNo || c.claimNumber || c.id || c._id,
              claimant: c.claimantName || (c.claimantId && (c.claimantId.fullName || c.claimantId.name || c.claimantId.username)) || "User",
              dept: c.department || "Operations",
              title: c.claimType ? `${c.claimType} Claim` : c.title || "General Expense Claim",
              claimType: c.claimType || "Staff Expense",
              companyName: c.companyName || "Halal Food Authority",
              contactPerson: c.contactPerson || "",
              contactEmail: c.contactEmail || "",
              reasons: c.reasons || [],
              items: c.items || [],
              subtotals: c.subtotals || null,
              attachments: c.attachments || c.files || [],
              amount: (c.subtotals && c.subtotals.grandTotal) || c.totalClaimAmount || c.amount || 0,
              date: safeFormatDate(c.filingDate || c.claimDate || c.createdAt || c.date || c.updatedAt),
              status: c.status ? (c.status.toLowerCase() === "new" ? "submitted" : c.status.toLowerCase()) : "submitted",
              note: c.officerNote || c.feedbackNote || c.note || "",
              history: c.history || [],
            }));
            setClaims(mapped);
            try { sessionStorage.setItem("ifrs_cached_claims", JSON.stringify(mapped)); } catch {}
          } else {
            setClaims([]);
          }
        })
        .catch(() => setClaims([]))
        .finally(() => {
          setClaimsLoading(false);
          setLoading(false);
        });

      // 3. Fetch Users (concurrently in background)
      const usersPromise = (role === "super_admin" || role === "admin")
        ? fetch(`${API_BASE_URL}/users?limit=1000`, { headers })
            .then(async (usersRes) => {
              if (checkAuth(usersRes)) {
                const d = await usersRes.json();
                const list = extractList(d);
                const mapped = list.map((u) => ({
                  _id: u._id,
                  name: u.fullName || u.name || "",
                  email: u.email || "",
                  role: u.role || "user",
                  username: u.username || "",
                }));
                setUsers(mapped);
              }
            })
            .catch(() => {})
        : Promise.resolve();

      // 4. Fetch Assets (concurrently in background)
      const assetsPromise = fetch(`${API_BASE_URL}/assets`, { headers })
        .then(async (assetsRes) => {
          if (checkAuth(assetsRes)) {
            const d = await assetsRes.json();
            const list = extractList(d);
            const mapped = list.map((a) => ({
              _id: a._id,
              id: a.serialNumber || a.assetNumber || a.id || a._id,
              name: a.assetName || a.name || "",
              category: a.category || "Equipment",
              dept: a.department || "Operations",
              acquired: a.acquisitionDate
                ? new Date(a.acquisitionDate).toISOString().slice(0, 10)
                : a.acquiredDate
                ? new Date(a.acquiredDate).toISOString().slice(0, 10)
                : a.acquired || new Date().toISOString().slice(0, 10),
              status: a.status || "Active",
              staffName: a.staffName || "",
              expiryDate: a.expiryDate ? new Date(a.expiryDate).toISOString().slice(0, 10) : "",
              amount: a.amount || 0,
              sellerVendor: a.sellerVendor || "",
            }));
            setAssets(mapped);
          } else {
            setAssets([]);
          }
        })
        .catch(() => setAssets([]));

      // 5. Fetch Notifications (concurrently in background)
      const notifsPromise = fetch(`${API_BASE_URL}/notifications`, { headers })
        .then(async (notifRes) => {
          if (checkAuth(notifRes)) {
            const d = await notifRes.json();
            const list = extractList(d);
            const mapped = list.map((n) => ({
              _id: n._id,
              id: n._id || n.id,
              title: n.title || "Notification",
              body: n.message || n.body || "",
              message: n.message || n.body || "",
              time: n.createdAt
                ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : n.time || "Just now",
              date: n.createdAt
                ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : n.date || "Just now",
              read: n.isRead ?? n.read ?? false,
              type: n.type || "claim",
              claimId: n.claimId || null,
            }));
            setNotifications(mapped);
          } else {
            setNotifications([]);
          }
        })
        .catch(() => setNotifications([]));

      // 6. Super admin deleted claims in background
      if (role === "super_admin") {
        fetchDeletedClaims();
      }

      await Promise.allSettled([summaryPromise, claimsPromise, usersPromise, assetsPromise, notifsPromise]);
      setLoading(false);
    }

    fetchAll();
  }, [loggedInUser]);

  /* ---- Action Handlers ---- */

  const handleLogin = (user) => {
    // Only show loading if we don't have cached dashboard stats
    try {
      const cached = sessionStorage.getItem("ifrs_cached_stats");
      setLoading(!cached);
    } catch {
      setLoading(true);
    }
    setLoggedInUser(user);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: apiHeaders(),
      }).catch(() => {});
    } catch {}
    localStorage.removeItem("ifrs_user");
    localStorage.removeItem("token");
    try {
      sessionStorage.removeItem("ifrs_cached_claims");
      sessionStorage.removeItem("ifrs_cached_stats");
    } catch {}
    setLoggedInUser(null);
    setClaims([]);
    setAssets([]);
    setUsers([]);
    setNotifications([]);
    setClaimStats(null);
    setLoading(false);
  };

  const handleTransition = async (id, newStatus, note, targetRole) => {
    const claimObj = claims.find((c) => c.id === id || c._id === id);
    const dbId = claimObj?._id || id;
    const currentStatus = claimObj?.status;
    const previousClaims = claims;

    // Determine target role for note routing
    let derivedTargetRole = targetRole;
    if (!derivedTargetRole) {
      const lowerStatus = (newStatus || "").toLowerCase();
      if (lowerStatus === "verified") derivedTargetRole = "ceo";
      else if (lowerStatus === "further_approval") derivedTargetRole = "chairman";
      else if (lowerStatus === "further_approval_approved" || lowerStatus === "further_approval_rejected") derivedTargetRole = "ceo";
      else if (lowerStatus === "approved_for_payment") derivedTargetRole = "accountant";
      else if (lowerStatus === "paid") derivedTargetRole = "user";
      else if (lowerStatus === "pending") derivedTargetRole = "user";
      else if (lowerStatus === "submitted" || lowerStatus === "new") derivedTargetRole = "financial_officer";
      else if (lowerStatus === "rejected") derivedTargetRole = "user";
    }

    setTransitioningId(`${id}-${newStatus}`);

    const normalizedTargetStatus = newStatus.toLowerCase() === "new" ? "submitted" : newStatus.toLowerCase();

    // Optimistic update with history record
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === id || c._id === id) {
          const newEntry = {
            actorName: currentUser || "User",
            actorRole: role,
            fromStatus: c.status,
            toStatus: normalizedTargetStatus,
            note: note || "",
            targetRole: derivedTargetRole,
            timestamp: new Date().toISOString(),
          };
          const updatedHistory = Array.isArray(c.history) ? [...c.history, newEntry] : [newEntry];
          return {
            ...c,
            status: normalizedTargetStatus,
            note: note ?? c.note,
            history: updatedHistory,
          };
        }
        return c;
      })
    );

    // Keep selectedClaimForDetails in sync if modal is open
    setSelectedClaimForDetails((prev) => {
      if (!prev) return null;
      if (prev.id === id || prev._id === id) {
        return {
          ...prev,
          status: normalizedTargetStatus,
          note: note ?? prev.note,
        };
      }
      return prev;
    });

    try {
      let res;
      if (currentStatus === "pending" && (newStatus === "submitted" || newStatus === "new")) {
        res = await fetch(`${API_BASE_URL}/claims/${dbId}/resubmit`, {
          method: "PUT",
          headers: apiHeaders(),
          body: JSON.stringify({
            note: note || "Claim resubmitted after addressing feedback.",
            targetRole: derivedTargetRole,
          }),
        });
      } else {
        res = await fetch(`${API_BASE_URL}/claims/${dbId}/transition`, {
          method: "PATCH",
          headers: apiHeaders(),
          body: JSON.stringify({
            newStatus: newStatus.toUpperCase(),
            note,
            targetRole: derivedTargetRole,
          }),
        });
      }
      
      const messages = {
        verified: "Claim verified successfully! Sent to CEO for review.",
        approved_for_payment: "Claim approved for payment! Forwarded to Accountant.",
        further_approval: "Claim escalated for Further Approval by the Board.",
        further_approval_approved: "Further Approval Granted! Returned to CEO for final action.",
        further_approval_rejected: "Further Approval Rejected by Board. Returned to CEO for review.",
        paid: "Claim marked as Paid successfully!",
        pending: "Feedback note sent to user successfully.",
        submitted: "Claim submitted successfully for review.",
        new: "Claim submitted successfully for review.",
        rejected: "Claim rejected.",
      };
      const st = normalizedTargetStatus;

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.data) {
          const updated = json.data;
          setClaims((prev) =>
            prev.map((c) => {
              if (c.id === id || c._id === id || c.id === updated.claimRefNo || c._id === updated._id) {
                return {
                  ...c,
                  status: (updated.status || newStatus).toLowerCase() === "new" ? "submitted" : (updated.status || newStatus).toLowerCase(),
                  note: updated.officerNote || note || c.note,
                  history: Array.isArray(updated.history) ? updated.history : c.history,
                };
              }
              return c;
            })
          );
          setSelectedClaimForDetails((prev) => {
            if (!prev) return null;
            if (prev.id === id || prev._id === id || prev.id === updated.claimRefNo || prev._id === updated._id) {
              return {
                ...prev,
                status: (updated.status || newStatus).toLowerCase() === "new" ? "submitted" : (updated.status || newStatus).toLowerCase(),
                note: updated.officerNote || note || prev.note,
                history: Array.isArray(updated.history) ? updated.history : prev.history,
              };
            }
            return prev;
          });
        }
        showToast(messages[st] || `Claim updated to ${st}.`, st === "rejected" || st === "further_approval_rejected" ? "info" : "success");
      } else {
        const errJson = await res.json().catch(() => null);
        console.error("Transition failed:", res.status, errJson);
        // Rollback state on error
        setClaims(previousClaims);
        showToast(errJson?.message || "Failed to update claim status.", "error");
      }
    } catch (e) {
      console.error("Transition error:", e);
      // Rollback state on error
      setClaims(previousClaims);
      showToast("Error executing action. Please try again.", "error");
    } finally {
      setTransitioningId(null);
    }
  };

  const fetchDeletedClaims = async () => {
    if (!loggedInUser || role !== "super_admin") return;
    setLoadingDeleted(true);
    try {
      const res = await fetch(`${API_BASE_URL}/claims?deleted=true&limit=5000`, { headers: apiHeaders() });
      if (res.ok) {
        const d = await res.json();
        const list = extractList(d);
        const mapped = list.map((c) => ({
          _id: c._id,
          id: c.claimRefNo || c.claimNumber || c.id || c._id,
          claimant: c.claimantName || (c.claimantId && (c.claimantId.fullName || c.claimantId.name || c.claimantId.username)) || "User",
          dept: c.department || "Operations",
          title: c.claimType ? `${c.claimType} Claim` : c.title || "General Expense Claim",
          claimType: c.claimType || "Staff Expense",
          companyName: c.companyName || "Halal Food Authority",
          contactPerson: c.contactPerson || "",
          contactEmail: c.contactEmail || "",
          reasons: c.reasons || [],
          items: c.items || [],
          subtotals: c.subtotals || null,
          attachments: c.attachments || c.files || [],
          amount: (c.subtotals && c.subtotals.grandTotal) || c.totalClaimAmount || c.amount || 0,
          date: safeFormatDate(c.filingDate || c.claimDate || c.createdAt || c.date || c.updatedAt),
          deletedAt: safeFormatDate(c.deletedAt || c.updatedAt),
          deletedBy: c.deletedBy || "super_admin",
          previousStatus: c.previousStatus || "submitted",
          status: c.status ? (c.status.toLowerCase() === "new" ? "submitted" : c.status.toLowerCase()) : "submitted",
          note: c.officerNote || c.feedbackNote || c.note || "",
          history: c.history || [],
        }));
        setDeletedClaims(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch deleted claims:", e);
    } finally {
      setLoadingDeleted(false);
    }
  };

  const handleDeleteClaim = async (id) => {
    const claimObj = claims.find((c) => c.id === id || c._id === id);
    const dbId = claimObj?._id || id;
    const refNo = claimObj?.id || id;

    // Optimistically remove from active claims
    setClaims((prev) => prev.filter((c) => c.id !== id && c._id !== dbId));

    if (claimObj) {
      const trashed = {
        ...claimObj,
        deletedAt: new Date().toISOString().slice(0, 10),
        deletedBy: currentUser || "super_admin",
        previousStatus: claimObj.status,
      };
      setDeletedClaims((prev) => [trashed, ...prev]);
    }

    showToast(`Claim ${refNo} moved to Trash. You can restore it from Deleted Claims.`, "info");

    try {
      const res = await fetch(`${API_BASE_URL}/claims/${dbId}`, {
        method: "DELETE",
        headers: apiHeaders(),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.message || "Failed to delete claim on server.", "error");
      }
    } catch (e) {
      console.error("Delete claim error:", e);
    }
  };

  const handleRestoreClaim = async (id) => {
    const claimObj = deletedClaims.find((c) => c.id === id || c._id === id);
    const dbId = claimObj?._id || id;
    const refNo = claimObj?.id || id;

    // Optimistic removal from deletedClaims
    setDeletedClaims((prev) => prev.filter((c) => c.id !== id && c._id !== dbId));

    // Restore to active claims with restored status
    if (claimObj) {
      const restored = {
        ...claimObj,
        status: claimObj.previousStatus || "submitted",
      };
      setClaims((prev) => [restored, ...prev]);
    }

    showToast(`Claim ${refNo} restored successfully to active workflow!`, "success");

    try {
      const res = await fetch(`${API_BASE_URL}/claims/${dbId}/restore`, {
        method: "POST",
        headers: apiHeaders(),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.message || "Failed to restore claim.", "error");
        fetchDeletedClaims();
      }
    } catch (e) {
      console.error("Restore claim error:", e);
      showToast("Network error restoring claim.", "error");
      fetchDeletedClaims();
    }
  };

  const handlePurgeClaim = async (id) => {
    const claimObj = deletedClaims.find((c) => c.id === id || c._id === id);
    const dbId = claimObj?._id || id;
    const refNo = claimObj?.id || id;

    setDeletedClaims((prev) => prev.filter((c) => c.id !== id && c._id !== dbId));
    showToast(`Claim ${refNo} permanently purged from database.`, "info");

    try {
      const res = await fetch(`${API_BASE_URL}/claims/${dbId}/purge`, {
        method: "DELETE",
        headers: apiHeaders(),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        showToast(errJson.message || "Failed to purge claim.", "error");
        fetchDeletedClaims();
      }
    } catch (e) {
      console.error("Purge claim error:", e);
      showToast("Network error purging claim.", "error");
      fetchDeletedClaims();
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
          claimant: serverClaim.claimantName || claimPayload.claimantName || loggedInUser?.name || "User",
          dept: serverClaim.department || "Operations",
          title: serverClaim.claimType ? `${serverClaim.claimType} Claim` : claimPayload.title || "General Expense Claim",
          claimType: serverClaim.claimType || claimPayload.claimType || "Staff Expense",
          companyName: serverClaim.companyName || claimPayload.companyName || "Halal Food Authority",
          contactPerson: serverClaim.contactPerson || claimPayload.contactPerson || "",
          contactEmail: serverClaim.contactEmail || claimPayload.contactEmail || "",
          reasons: serverClaim.reasons || claimPayload.reasons || [],
          items: serverClaim.items || claimPayload.items || [],
          subtotals: serverClaim.subtotals || claimPayload.subtotals || null,
          attachments: (serverClaim.attachments && serverClaim.attachments.length > 0)
            ? serverClaim.attachments
            : (claimPayload.attachments || []),
          amount: (serverClaim.subtotals && serverClaim.subtotals.grandTotal) || claimPayload.amount || 0,
          date: serverClaim.filingDate
            ? new Date(serverClaim.filingDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          status: serverClaim.status ? (serverClaim.status.toLowerCase() === "new" ? "submitted" : serverClaim.status.toLowerCase()) : "submitted",
          note: serverClaim.note || serverClaim.notes || serverClaim.officerNote || claimPayload.note || "",
        };
        setClaims((prev) => [mappedClaim, ...prev]);
        showToast("Claim created and submitted successfully!", "success");
        return { success: true, claimId: serverClaim._id, claimRefNo: serverClaim.claimRefNo };
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to submit claim:", res.status, errData);
        showToast(errData.message || "Failed to submit claim.", "error");
        return { success: false, message: errData.message || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Submit claim error:", e);
      showToast("Network error. Please try again.", "error");
      return { success: false, message: "Network error. Please check your connection and try again." };
    }
  };

  // Re-fetch a single claim by claimRefNo and patch its attachments in state
  const refreshClaimAttachments = async (claimRefNo) => {
    try {
      const res = await fetch(`${API_BASE_URL}/claims/${claimRefNo}`, { headers: apiHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      const c = data.data || data.claim || data;
      if (!c || !c.attachments) return;
      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === claimRefNo || claim._id === c._id
            ? { ...claim, attachments: c.attachments }
            : claim
        )
      );
    } catch (e) {
      console.warn("[refreshClaimAttachments] Failed:", e);
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
          acquired: serverAsset.acquisitionDate
            ? new Date(serverAsset.acquisitionDate).toISOString().slice(0, 10)
            : asset.acquired,
          status: serverAsset.status || asset.status,
          staffName: serverAsset.staffName || "",
          expiryDate: serverAsset.expiryDate ? new Date(serverAsset.expiryDate).toISOString().slice(0, 10) : "",
          amount: serverAsset.amount || 0,
          sellerVendor: serverAsset.sellerVendor || "",
        };
        setAssets((prev) => [mappedAsset, ...prev]);
        showToast("New asset registered successfully!", "success");
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to register asset:", res.status, errData);
        showToast(errData.message || "Failed to register asset.", "error");
        return { success: false, message: errData.message || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Add asset error:", e);
      showToast("Network error. Please try again.", "error");
      return { success: false, message: "Network error. Please check your connection and try again." };
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
        department: "Operations",
      };
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const created = await res.json();
        const serverUser = created.data || created.user || created;
        setUsers((prev) => [
          ...prev,
          {
            _id: serverUser._id,
            name: serverUser.name || u.name,
            username: serverUser.username || u.username,
            email: serverUser.email || u.email,
            role: serverUser.role || u.role,
          },
        ]);
        showToast("User account created successfully!", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to create user:", errData.message || res.status);
        showToast(errData.message || "Failed to create user account.", "error");
      }
    } catch (e) {
      console.error("Add user error:", e);
      showToast("Network error. Please try again.", "error");
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.username === updatedUser.username ? { ...u, ...updatedUser } : u))
    );
    showToast("User details updated successfully!", "success");
    try {
      const dbId = updatedUser._id || updatedUser.username;
      if (!dbId) { console.warn("No identifier to update user."); return; }
      const payload = {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        ...(updatedUser.password && updatedUser.password.trim() !== ""
          ? { password: updatedUser.password }
          : {}),
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
    showToast("User account deleted.", "info");
    try {
      if (!dbId) { console.warn("No _id for user:", username); return; }
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
      await fetch(`${API_BASE_URL}/notifications/mark-read`, {
        method: "PATCH",
        headers: apiHeaders(),
      });
    } catch (e) {
      console.error("Mark all read error:", e);
    }
  };

  const handleNotificationClick = (n, navigate) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );

    try {
      fetch(`${API_BASE_URL}/notifications/${n._id || n.id}/mark-read`, {
        method: "PATCH",
        headers: apiHeaders(),
      }).catch(() => {});
    } catch {}

    let targetClaim = null;
    if (n.claimId) {
      targetClaim = claims.find(
        (c) => c.id === n.claimId || c._id === n.claimId || c.claimRefNo === n.claimId
      );
    }

    if (!targetClaim) {
      const text = `${n.title || ""} ${n.body || ""}`;
      targetClaim = claims.find((c) => c.id && text.includes(c.id));
    }

    if (targetClaim) {
      setSelectedClaimForDetails(targetClaim);
      if (navigate) navigate("/claims");
    } else if (navigate) {
      navigate("/claims");
    }
  };

  const handleDeleteAsset = async (id) => {
    const assetObj = assets.find((a) => a.id === id || a._id === id);
    const dbId = assetObj?._id || id;
    setAssets((prev) => prev.filter((a) => a.id !== id && a._id !== id));
    showToast("Asset record deleted.", "info");
    try {
      await fetch(`${API_BASE_URL}/assets/${dbId}`, {
        method: "DELETE",
        headers: apiHeaders(),
      });
    } catch (e) {
      console.error("Delete asset error:", e);
    }
  };

  const value = {
    loggedInUser,
    role,
    currentUser,
    claims,
    claimStats,
    assets,
    users,
    notifications,
    loading,
    claimsLoading,
    loadingClaims: claimsLoading,
    transitioningId,
    toasts,
    hideToast,
    dismissToast,
    handleLogin,
    handleLogout,
    handleTransition,
    handleDeleteClaim,
    deletedClaims,
    loadingDeleted,
    fetchDeletedClaims,
    handleRestoreClaim,
    handlePurgeClaim,
    handleSubmitClaim,
    refreshClaimAttachments,
    handleAddAsset,
    handleDeleteAsset,
    handleAddUser,
    handleUpdateUser,
    handleDeleteUser,
    handleMarkAllRead,
    handleNotificationClick,
    selectedClaimForDetails,
    openClaimDetails,
    closeClaimDetails,
    isClaimSheetOpen,
    openClaimSheet,
    closeClaimSheet,
    isAddAssetOpen,
    openAddAsset,
    closeAddAsset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
