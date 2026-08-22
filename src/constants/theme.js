/* ---------------------------------------------------------------- */
/* THEME & DESIGN SYSTEM                                             */
/* ---------------------------------------------------------------- */
export const T = {
  tealDark: "#042D3A",
  tealMain: "#007A87",
  tealLight: "#0D857B",
  tealGlow: "#0F9F93",
  navyDeep: "#02132B",
  navyDark: "#051D3B",
  navyMedium: "#092C56",
  bgApp: "#F8FAFC",
  white: "#FFFFFF",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray300: "#CBD5E1",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray700: "#334155",
  gray900: "#0F172A",
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.hfaportal.company/api/v1";

export const STATUS = {
  new:                   { label: "New",                   color: "#1D4ED8", bg: "#DBEAFE" },
  pending:               { label: "Pending",                color: "#B45309", bg: "#FEF3C7" },
  verified:              { label: "Verified",               color: "#4338CA", bg: "#E0E7FF" },
  further_approval:      { label: "Further Approval",       color: "#7C3AED", bg: "#EDE9FE" },
  approved_for_payment:  { label: "Approved For Payment",   color: "#0E7490", bg: "#CFFAFE" },
  paid:                  { label: "Paid",                   color: "#15803D", bg: "#DCFCE7" },
  rejected:              { label: "Rejected",               color: "#B91C1C", bg: "#FEE2E2" },
};

export const fmtN = (n) => "£" + (Number(n) || 0).toLocaleString();
