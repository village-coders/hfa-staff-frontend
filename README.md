# IFRS — Claims & Asset Management (Frontend Preview)

React + Vite + Tailwind frontend for the IFRS claim and asset workflow.
This is a UI/UX preview only — all data lives in local React state
(`src/App.jsx`) and resets on refresh. No backend calls are made yet.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

Output goes to `dist/`.

## What's here

- `src/App.jsx` — everything: login page, sidebar/topbar, dashboard,
  claim list views, asset views, user management. Organized top to
  bottom as: theme tokens → status config → mock data → role config →
  small UI primitives → login → sidebar/topbar → claim table & actions
  → manage claim sheet form → asset views → users view → process
  explainer → dashboard → app root.
- Mock data (`CLAIMS_SEED`, `ASSETS_SEED`, `USERS_SEED`) sits at the
  top of `App.jsx` — swap these out first when wiring up the real API.
- `MENU_ACCESS` controls which sidebar items each role can see.
- `ClaimActions` controls which buttons appear per role, per list —
  this is where the claim workflow rules live (verify, send feedback,
  reverse, send to board, mark as paid, etc).

## Backend integration notes

Everything that should eventually be an API call is currently a local
state update:

- `handleTransition(id, newStatus, note)` — moves a claim between
  statuses (new → pending → verified → further_approval →
  approved_for_payment → paid / rejected). Swap this for a PATCH/PUT
  call to your claims endpoint.
- `handleDeleteClaim(id)` — currently gated to the `admin` role in
  the UI; wire to a DELETE call, and enforce the real
  admin/super-admin distinction server-side.
- `handleSubmitClaim(claim)` — new claim submission (Manage Claim
  Sheet form). Wire to a POST call.
- `handleAddAsset(asset)` / `handleAddUser(user)` — same pattern for
  Add New Asset and User Management.
- Login is currently a no-op button (`onLogin`) — wire to real auth
  and drive `role` from the authenticated user instead of the
  role-switcher in the topbar (the switcher is a preview convenience
  and should be removed once auth is live).
- Pagination is client-side over the full mock array
  (`pageSize = 10`) — replace with server-side pagination params
  once claim lists can be large.

## Two open questions from the brief

1. **Admin vs. Super Admin** — the brief says only Admin can create
   users, but only Super Admin can delete claims. Right now `admin`
   has both powers. Confirm whether these should be split into two
   roles.
2. The brief mentions 5 user types but lists 6 (User, Financial
   Officer, CEO, Accountant, Admin, Chairman). All 6 are implemented.
