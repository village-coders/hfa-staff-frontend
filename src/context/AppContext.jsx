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

  const [claims, setClaims] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transitioningId, setTransitioningId] = useState(null);

  const [isClaimSheetOpen, setIsClaimSheetOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState(null);

  const openClaimSheet = () => setIsClaimSheetOpen(true);
  const closeClaimSheet = () => setIsClaimSheetOpen(false);

  const openAddAsset = () => setIsAddAssetOpen(true);
  const closeAddAsset = () => setIsAddAssetOpen(false);

  const openClaimDetails = (claim) => setSelectedClaimForDetails(claim);
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

  // Fetch all data after login
  useEffect(() => {
    if (!loggedInUser) {
      setLoading(false);
      return;
    }
    const token = loggedInUser?.token || "";
    const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

    async function fetchAll() {
      setLoading(true);

      // Helper: if any endpoint returns 401/403 the token is stale — log out
      const checkAuth = (res) => {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("ifrs_user");
          localStorage.removeItem("token");
          setLoggedInUser(null);
          return false;
        }
        return res.ok;
      };

      try {
        const claimsRes = await fetch(`${API_BASE_URL}/claims`, { headers });
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
            date: c.filingDate
              ? new Date(c.filingDate).toISOString().slice(0, 10)
              : c.claimDate
              ? new Date(c.claimDate).toISOString().slice(0, 10)
              : c.date || new Date().toISOString().slice(0, 10),
            status: c.status ? c.status.toLowerCase() : "new",
            note: c.officerNote || c.feedbackNote || c.note || "",
            history: c.history || [],
          }));
          setClaims(mapped);
        } else {
          setClaims([]);
        }
      } catch { setClaims([]); }

      try {
        const usersRes = await fetch(`${API_BASE_URL}/users`, { headers });
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
      } catch { /* keep empty */ }

      try {
        const assetsRes = await fetch(`${API_BASE_URL}/assets`, { headers });
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
      } catch { setAssets([]); }

      try {
        const notifRes = await fetch(`${API_BASE_URL}/notifications`, { headers });
        if (checkAuth(notifRes)) {
          const d = await notifRes.json();
          const list = extractList(d);
          const mapped = list.map((n) => ({
            _id: n._id,
            id: n._id || n.id,
            title: n.title || "",
            message: n.message || "",
            date: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            read: n.isRead || false,
            claimId: n.claimId || null,
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

  /* ---- Action Handlers ---- */

  const handleLogin = (user) => setLoggedInUser(user);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: apiHeaders(),
      }).catch(() => {});
    } catch {}
    localStorage.removeItem("ifrs_user");
    localStorage.removeItem("token");
    setLoggedInUser(null);
    setClaims([]);
    setAssets([]);
    setUsers([]);
    setNotifications([]);
  };

  const handleTransition = async (id, newStatus, note, targetRole) => {
    const claimObj = claims.find((c) => c.id === id || c._id === id);
    const dbId = claimObj?._id || id;
    const currentStatus = claimObj?.status;

    // Determine target role for note routing
    let derivedTargetRole = targetRole;
    if (!derivedTargetRole) {
      const lowerStatus = (newStatus || "").toLowerCase();
      if (lowerStatus === "verified") derivedTargetRole = "ceo";
      else if (lowerStatus === "further_approval") derivedTargetRole = "chairman";
      else if (lowerStatus === "approved_for_payment") derivedTargetRole = "accountant";
      else if (lowerStatus === "paid") derivedTargetRole = "user";
      else if (lowerStatus === "pending") derivedTargetRole = "user";
      else if (lowerStatus === "new") derivedTargetRole = "financial_officer";
      else if (lowerStatus === "rejected") derivedTargetRole = "user";
    }

    setTransitioningId(`${id}-${newStatus}`);

    // Optimistic update with history record
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === id || c._id === id) {
          const newEntry = {
            actorName: currentUser || "User",
            actorRole: role,
            fromStatus: c.status,
            toStatus: newStatus.toLowerCase(),
            note: note || "",
            targetRole: derivedTargetRole,
            timestamp: new Date().toISOString(),
          };
          const updatedHistory = Array.isArray(c.history) ? [...c.history, newEntry] : [newEntry];
          return {
            ...c,
            status: newStatus.toLowerCase(),
            note: note ?? c.note,
            history: updatedHistory,
          };
        }
        return c;
      })
    );

    try {
      let res;
      if (currentStatus === "pending" && newStatus === "new") {
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
      if (!res.ok) console.error("Transition failed:", res.status);
    } catch (e) {
      console.error("Transition error:", e);
    } finally {
      setTransitioningId(null);
    }
  };

  const handleDeleteClaim = async (id) => {
    const claimObj = claims.find((c) => c.id === id || c._id === id);
    const dbId = claimObj?._id || id;
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
          attachments: serverClaim.attachments || claimPayload.attachments || [],
          amount: (serverClaim.subtotals && serverClaim.subtotals.grandTotal) || claimPayload.amount || 0,
          date: serverClaim.filingDate
            ? new Date(serverClaim.filingDate).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          status: serverClaim.status ? serverClaim.status.toLowerCase() : "new",
          note: serverClaim.officerNote || "",
        };
        setClaims((prev) => [mappedClaim, ...prev]);
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to submit claim:", res.status, errData);
        return { success: false, message: errData.message || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Submit claim error:", e);
      return { success: false, message: "Network error. Please check your connection and try again." };
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
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to register asset:", res.status, errData);
        return { success: false, message: errData.message || `Server error: ${res.status}` };
      }
    } catch (e) {
      console.error("Add asset error:", e);
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
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to create user:", errData.message || res.status);
      }
    } catch (e) {
      console.error("Add user error:", e);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.username === updatedUser.username ? { ...u, ...updatedUser } : u))
    );
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
      fetch(`${API_BASE_URL}/notifications/${n._id || n.id}/read`, {
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
    role: loggedInUser?.role || "user",
    currentUser: loggedInUser?.name || loggedInUser?.username || "",
    claims,
    assets,
    users,
    notifications,
    loading,
    transitioningId,
    handleLogin,
    handleLogout,
    handleTransition,
    handleDeleteClaim,
    handleSubmitClaim,
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
