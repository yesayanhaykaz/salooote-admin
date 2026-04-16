# Salooote Admin Portal — Project Architecture Reference

> Paste this file at the start of any new conversation so Claude has full context without reading every file.
> GitHub: https://github.com/yesayanhaykaz/salooote-admin
> Runs on port 3001 (`next dev --port 3001` / `next start --port 3001`)

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14.2 — App Router |
| Styling | Tailwind CSS 3 |
| Charts | Recharts 2.12 |
| Icons | Lucide React 0.400 |
| Utilities | clsx |
| Language | JavaScript (no TypeScript) |
| Auth | Frontend only — no real auth yet |

---

## 3 User Roles

| Role | Base path | Layout | Nav data | Sample identity |
|---|---|---|---|---|
| **Admin** (Super Admin / Website Owner) | `/admin` | `src/app/admin/layout.js` | `ADMIN_NAV` (17 items) | Haykaz Yesayan, haykaz@salooote.am |
| **Vendor** (Business Owner) | `/vendor` | `src/app/vendor/layout.js` | `VENDOR_NAV` (12 items) | Sweet Dreams Bakery, vendor@salooote.am |
| **User** (Customer) | `/user` | `src/app/user/layout.js` | `USER_NAV` (10 items) | Anna Hovhannisyan, anna@example.com |

All 3 layouts share the same `<Sidebar>` component — role determines nav items + color scheme.

---

## Folder Structure

```
src/
├── app/
│   ├── layout.js              # Root — minimal html/body shell only
│   ├── page.js                # Root redirect (to /admin or login)
│   ├── login/page.js          # Login page
│   ├── signup/page.js         # Signup page
│   │
│   ├── admin/
│   │   ├── layout.js          # Sidebar(ADMIN_NAV, role="admin") + content area
│   │   ├── page.js            # Dashboard — KPI cards, revenue chart, user growth, recent orders, category pie
│   │   ├── users/page.js      # User management — DataTable, ban/activate, role badges
│   │   ├── vendors/page.js    # Vendor management — DataTable, status filter, approve/suspend
│   │   ├── approvals/page.js  # Pending vendor applications — review + approve/reject
│   │   ├── bookings/page.js   # All bookings across platform
│   │   ├── products/page.js   # All products across all vendors
│   │   ├── categories/page.js # Categories CRUD — AddCategoryModal (emoji picker, color picker, slug auto-gen, parent category, drag-drop image upload)
│   │   ├── subscriptions/page.js # Subscription plans (Basic/Pro/Premium), vendor plan management
│   │   ├── payments/page.js   # Platform payments + payout management
│   │   ├── reviews/page.js    # All reviews — approve/reject/flag moderation
│   │   ├── support/page.js    # Support tickets — priority, type, status
│   │   ├── marketing/page.js  # Promo codes, banners, email campaigns
│   │   ├── notifications/page.js # Platform-wide notification management
│   │   ├── cms/page.js        # Content management — pages, blog posts
│   │   ├── reports/page.js    # Analytics + reports — charts with Recharts
│   │   ├── roles/page.js      # Role & permissions management
│   │   └── settings/page.js   # Platform settings (NO billing/subscription tab — admin doesn't pay)
│   │
│   ├── vendor/
│   │   ├── layout.js          # Sidebar(VENDOR_NAV, role="vendor") + content area
│   │   ├── page.js            # Dashboard — revenue, bookings, inquiry stats, recent activity
│   │   ├── inquiries/page.js  # 2-panel inbox — list left, detail right, reply form
│   │   ├── orders/page.js     # Vendor's orders
│   │   ├── calendar/page.js   # Monthly calendar with booking chips per day
│   │   ├── products/page.js   # Vendor's products — add/edit/delete
│   │   ├── services/page.js   # Vendor's services
│   │   ├── messages/page.js   # Customer messages
│   │   ├── reviews/page.js    # Reviews received
│   │   ├── reports/page.js    # Vendor analytics
│   │   ├── subscription/page.js # Subscription plans — Basic/Pro/Premium with upgrade UI
│   │   ├── notifications/page.js # Vendor notifications
│   │   └── settings/page.js   # Vendor settings — cover/banner upload, business logo upload (square), owner profile photo (circular), drag-drop image zones with preview
│   │
│   └── user/
│       ├── layout.js          # Sidebar(USER_NAV, role="user") + content area
│       ├── page.js            # Dashboard — event countdown, upcoming events, recent orders
│       ├── events/page.js     # User's events
│       ├── inquiries/page.js  # Inquiries sent to vendors
│       ├── saved/page.js      # Saved/wishlist vendors & products
│       ├── messages/page.js   # Messages with vendors
│       ├── orders/page.js     # Order history
│       ├── reviews/page.js    # Reviews written by user
│       ├── planner/page.js    # AI event planner tool
│       ├── notifications/page.js # User notifications
│       └── settings/page.js   # Profile settings — AvatarUpload (circular drag-drop, camera hover overlay, remove button)
│
├── components/
│   ├── Sidebar.js             # "use client" — fixed 228px sidebar. Props: nav[], role, userName, userEmail.
│   │                          #   Role colors: admin=primary-600 (violet), vendor=violet-600, user=blue-600
│   │                          #   Active link: bg-primary-600 text-white. Hover: bg-primary-50 text-primary-700
│   │                          #   Bottom: user avatar initials + name/email + logout button
│   │                          #   Icons resolved from string names via ICONS map (all Lucide)
│   │
│   ├── TopBar.js              # "use client" — h-14 sticky top bar. Props: title, subtitle, actions (ReactNode).
│   │                          #   Has search input + bell icon + user avatar chip
│   │
│   ├── StatsCard.js           # Server-safe — KPI card. Props: label, value, change, changeLabel, icon, iconBg, iconColor
│   │                          #   Shows TrendingUp/TrendingDown based on change >= 0
│   │
│   └── DataTable.js           # "use client" — sortable/searchable/paginated table.
│                              #   Props: columns[], data[], pageSize=8, searchable=true, searchKeys=[]
│                              #   columns: [{ key, label, render?: (val, row) => ReactNode }]
│
└── lib/
    └── data.js                # All sample data (see Data section below)
```

---

## Design System (Tailwind tokens)

### Primary color (violet — admin brand)
```
primary-50   #f5f3ff   (light violet bg)
primary-100  #ede9fe
primary-200  #ddd6fe
primary-500  #8b5cf6
primary-600  #7c3aed   (PRIMARY — buttons, active states, accents)
primary-700  #6d28d9   (hover)
```

### Surface (slate grays)
```
surface-50   #f8f9fc   (app background)
surface-100  #f1f3f9   (card/table row hover)
surface-200  #e2e8f0   (borders)
surface-400  #94a3b8   (placeholder text)
surface-500  #64748b   (secondary text)
surface-600  #475569   (body text)
surface-700  #334155   (sidebar links default)
surface-800  #1e293b   (sidebar background)
surface-900  #0f172a   (headings)
```

### Semantic colors
```
success-500  #22c55e / success-600 #16a34a  (active, delivered, approved)
warning-500  #f59e0b / warning-600 #d97706  (pending, processing)
danger-500   #ef4444 / danger-600  #dc2626  (cancelled, banned, flagged)
info-500     #3b82f6 / info-600    #2563eb  (info states)
```

### Key CSS classes (globals.css)
```css
.sidebar-link          — nav link base style
.sidebar-link.active   — bg-primary-600 text-white
.badge                 — pill badge base
.badge-success         — green pill
.badge-warning         — amber pill
.badge-danger          — red pill (defined implicitly)
.stat-card             — KPI card base with fade-in animation
.fade-in               — opacity 0→1 animation
.modal-content         — slide-up modal animation
```

### Layout pattern for every page
```jsx
export default function SomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Page Title" subtitle="Optional subtitle" actions={<button>...</button>} />
      <div className="flex-1 p-6 space-y-6">
        {/* content */}
      </div>
    </div>
  );
}
```

### Standard card
```jsx
<div className="bg-white rounded-xl border border-surface-200 p-5">
```

### Primary button
```jsx
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
```

---

## Shared Components Usage

### Sidebar
```jsx
// Already in layout.js — don't add to pages
<Sidebar nav={ADMIN_NAV} role="admin" userName="Name" userEmail="email@..." />
// role: "admin" | "vendor" | "user"
```

### TopBar
```jsx
<TopBar
  title="Page Name"
  subtitle="Optional description"
  actions={<button className="bg-primary-600...">Action</button>}
/>
```

### StatsCard
```jsx
import StatsCard from "@/components/StatsCard";
import { Users } from "lucide-react";

<StatsCard
  label="Total Users"
  value="3,891"
  change={12.4}          // positive = green TrendingUp, negative = red TrendingDown
  changeLabel="vs last month"
  icon={Users}
  iconBg="bg-primary-50"
  iconColor="text-primary-600"
/>
```

### DataTable
```jsx
import DataTable from "@/components/DataTable";

<DataTable
  columns={[
    { key: "name",   label: "Name" },
    { key: "status", label: "Status", render: (val) => <span className="badge badge-success">{val}</span> },
  ]}
  data={SAMPLE_USERS}
  pageSize={8}
  searchable={true}
  searchKeys={["name", "email"]}
/>
```

### Charts (Recharts)
```jsx
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// Data from lib/data.js: REVENUE_DATA, USER_GROWTH, BOOKINGS_DATA, CATEGORY_DATA
```

---

## Sample Data in `src/lib/data.js`

| Export | Type | Description |
|---|---|---|
| `ADMIN_NAV` | Array[17] | Admin sidebar nav items |
| `VENDOR_NAV` | Array[12] | Vendor sidebar nav items |
| `USER_NAV` | Array[10] | User sidebar nav items |
| `SAMPLE_USERS` | Array[8] | Users with roles, status, city, orders |
| `SAMPLE_VENDORS` | Array[8] | Vendors with plan, revenue, status, rating |
| `SAMPLE_ORDERS` | Array[8] | Orders with customer, vendor, amount, status |
| `SAMPLE_BOOKINGS` | Array[6] | Bookings with event details, guests, budget |
| `SAMPLE_INQUIRIES` | Array[5] | Inquiries with status: new/replied/confirmed/cancelled |
| `SAMPLE_REVIEWS` | Array[6] | Reviews with status: approved/pending/flagged |
| `SAMPLE_PRODUCTS` | Array[8] | Products with vendor, price, stock, sales |
| `REVENUE_DATA` | Array[7] | Monthly revenue + orders (Oct–Apr) |
| `USER_GROWTH` | Array[7] | Monthly users + vendors growth |
| `BOOKINGS_DATA` | Array[7] | Monthly bookings count |
| `CATEGORY_DATA` | Array[5] | Category distribution for pie chart |
| `MESSAGES` | Array[5] | Sample chat messages |
| `SUPPORT_TICKETS` | Array[5] | Support tickets with priority/type/status |
| `SUBSCRIPTION_PLANS` | Array[3] | Basic (free), Pro ($29/mo), Premium ($79/mo) |

---

## Nav items per role

### ADMIN_NAV (17 items)
Dashboard, Users, Vendors, Approvals (badge:5), Bookings, Products, Categories, Subscriptions, Payments, Reviews, Support (badge:3), Marketing, Notifications, CMS, Reports, Roles, Settings

### VENDOR_NAV (12 items)
Dashboard, Inquiries (badge:4), Orders, Calendar, Products, Services, Messages, Reviews, Analytics, Subscription, Notifications, Settings

### USER_NAV (10 items)
Dashboard, My Events, Inquiries, Saved, Messages, Orders, Reviews, Planner, Notifications, Settings

---

## Key Rules & Gotchas

1. **Admin has NO subscription/billing tab in Settings** — vendors pay, admin doesn't
2. **Vendor Settings has 3 image upload zones**: cover/banner (full-width h-36), business logo (square), owner photo (circular)
3. **User Settings has AvatarUpload**: circular drag-drop with camera overlay on hover + remove button
4. **All pages are "use client"** — this is a frontend-only admin portal, no server components with data fetching
5. **Sidebar width is fixed 228px** — content area has `ml-[228px]` in layout
6. **No i18n** — admin portal is English only
7. **No real auth** — login/signup pages are UI only; role switching is done by navigating to /admin, /vendor, or /user directly
8. **Recharts needs "use client"** — any page with charts must have `"use client"` at top
9. **Port 3001** — admin runs on 3001, main website (salooote-nextjs) runs on 3000
10. **Categories page has AddCategoryModal** with: drag-drop image upload (ImageUploadZone), emoji picker (20 options), 8 color presets, auto slug generation from name, parent category selector

---

## All Routes

```
/                       → redirect
/login                  Login
/signup                 Signup

/admin                  Admin Dashboard
/admin/users            User Management
/admin/vendors          Vendor Management
/admin/approvals        Vendor Approvals
/admin/bookings         All Bookings
/admin/products         All Products
/admin/categories       Category Management (+ AddCategoryModal)
/admin/subscriptions    Subscription Plans
/admin/payments         Payments & Payouts
/admin/reviews          Review Moderation
/admin/support          Support Tickets
/admin/marketing        Marketing Tools
/admin/notifications    Notifications
/admin/cms              Content Management
/admin/reports          Reports & Analytics
/admin/roles            Roles & Permissions
/admin/settings         Platform Settings

/vendor                 Vendor Dashboard
/vendor/inquiries       Inquiries Inbox (2-panel)
/vendor/orders          Orders
/vendor/calendar        Booking Calendar (monthly)
/vendor/products        Products
/vendor/services        Services
/vendor/messages        Messages
/vendor/reviews         Reviews
/vendor/reports         Analytics
/vendor/subscription    Subscription Plans
/vendor/notifications   Notifications
/vendor/settings        Profile & Business Settings (image uploads)

/user                   User Dashboard (event countdown)
/user/events            My Events
/user/inquiries         My Inquiries
/user/saved             Saved / Wishlist
/user/messages          Messages
/user/orders            Order History
/user/reviews           My Reviews
/user/planner           Event Planner
/user/notifications     Notifications
/user/settings          Profile Settings (avatar upload)
```

---

## Git / GitHub

- Repo: `https://github.com/yesayanhaykaz/salooote-admin`
- Branch: `main`
- Git user: `h.yesayan`
