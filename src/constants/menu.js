import {
  LayoutDashboard, FileEdit, FilePlus2, BadgeCheck, CircleDollarSign,
  Building, CheckCircle2, Clock3, XCircle, Package, PackagePlus, PlusCircle,
  UserIcon, Wallet, Landmark, Calculator, ShieldCheck, Building2
} from "lucide-react";

// Re-export UserIcon for use elsewhere
export { UserIcon };

export const ROLES = [
  { id: "user", label: "User", icon: UserIcon },
  { id: "financial_officer", label: "Financial Officer", icon: Wallet },
  { id: "ceo", label: "CEO", icon: Landmark },
  { id: "accountant", label: "Accountant", icon: Calculator },
  { id: "admin", label: "Admin", icon: ShieldCheck },
  { id: "chairman", label: "Chairman (Board)", icon: Building2 },
];

export const CLAIM_ITEMS = [
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

export const ASSET_ITEMS = [
  { key: "manage-asset", label: "Manage Asset", icon: Package },
  { key: "new-asset-list", label: "New Asset List", icon: PackagePlus },
  { key: "add-new-asset", label: "Add New Asset", icon: PlusCircle },
];

export const MENU_ACCESS = {
  user:              ["dashboard", "manage-claim-sheet", "all-claims-list", "pending-claim-list", "rejected-claim-list", "manage-asset", "track-claim"],
  financial_officer: ["dashboard", "manage-claim-sheet", "all-claims-list", "new-claim-list", "pending-claim-list", "rejected-claim-list", "manage-asset", "track-claim"],
  ceo:               ["dashboard", "verified-list", "track-claim"],
  accountant:        ["dashboard", "manage-claim-sheet", "all-claims-list", "approved-for-payment", "paid-list", "manage-asset", "track-claim"],
  admin:             ["dashboard", "manage-claim-sheet", "all-claims-list", "new-claim-list", "verified-list", "further-approval", "approved-for-payment", "paid-list", "pending-claim-list", "rejected-claim-list", "manage-asset", "new-asset-list", "add-new-asset", "users", "track-claim"],
  chairman:          ["dashboard", "further-approval", "track-claim"],
};

export const VIEW_TITLES = {
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

// Map URL path segments -> view keys (for sidebar active state)
export const PATH_TO_VIEW = {
  "/dashboard": "dashboard",
  "/claims/new": "manage-claim-sheet",
  "/claims": "all-claims-list",
  "/claims/new-list": "new-claim-list",
  "/claims/verified": "verified-list",
  "/claims/approved": "approved-for-payment",
  "/claims/further-approval": "further-approval",
  "/claims/paid": "paid-list",
  "/claims/pending": "pending-claim-list",
  "/claims/rejected": "rejected-claim-list",
  "/claims/track": "track-claim",
  "/assets": "manage-asset",
  "/assets/new-list": "new-asset-list",
  "/assets/add": "add-new-asset",
  "/users": "users",
};

// Map view keys -> URL paths (for navigation)
export const VIEW_TO_PATH = {
  dashboard: "/dashboard",
  "manage-claim-sheet": "/claims/new",
  "all-claims-list": "/claims",
  "new-claim-list": "/claims/new-list",
  "verified-list": "/claims/verified",
  "approved-for-payment": "/claims/approved",
  "further-approval": "/claims/further-approval",
  "paid-list": "/claims/paid",
  "pending-claim-list": "/claims/pending",
  "rejected-claim-list": "/claims/rejected",
  "track-claim": "/claims/track",
  "manage-asset": "/assets",
  "new-asset-list": "/assets/new-list",
  "add-new-asset": "/assets/add",
  users: "/users",
};

export const NOTIF_COLORS = {
  claim:    { dot: "#1D4ED8", bg: "#DBEAFE" },
  verified: { dot: "#4338CA", bg: "#E0E7FF" },
  pending:  { dot: "#B45309", bg: "#FEF3C7" },
  paid:     { dot: "#15803D", bg: "#DCFCE7" },
  asset:    { dot: "#0D857B", bg: "#CCFBF1" },
};
