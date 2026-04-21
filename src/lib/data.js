export const ADMIN_NAV = [
  { label: "Dashboard",      key: "sidebar.dashboard",     href: "/admin",                   icon: "LayoutDashboard" },
  { label: "Users",          key: "sidebar.users",         href: "/admin/users",             icon: "Users" },
  { label: "Vendors",        key: "sidebar.vendors",       href: "/admin/vendors",           icon: "Store" },
  { label: "Approvals",      key: "sidebar.approvals",     href: "/admin/approvals",         icon: "ClipboardCheck" },
  { label: "Bookings",       key: "sidebar.bookings",      href: "/admin/bookings",          icon: "CalendarCheck" },
  { label: "Products",       key: "sidebar.products",      href: "/admin/products",          icon: "Package" },
  { label: "Categories",     key: "sidebar.categories",    href: "/admin/categories",        icon: "Tag" },
  { label: "Subscriptions",  key: "sidebar.subscription",  href: "/admin/subscriptions",     icon: "CreditCard" },
  { label: "Payments",       key: "sidebar.payments",      href: "/admin/payments",          icon: "DollarSign" },
  { label: "Reviews",        key: "sidebar.reviews",       href: "/admin/reviews",           icon: "Star" },
  { label: "Support",        key: "sidebar.support",       href: "/admin/support",           icon: "Headphones" },
  { label: "Marketing",      key: "sidebar.marketing",     href: "/admin/marketing",         icon: "Megaphone" },
  { label: "Notifications",  key: "sidebar.notifications", href: "/admin/notifications",     icon: "Bell" },
  { label: "CMS",            key: "sidebar.cms",           href: "/admin/cms",               icon: "FileText" },
  { label: "Reports",        key: "sidebar.analytics",     href: "/admin/reports",           icon: "BarChart2" },
  { label: "Roles",          key: "sidebar.roles",         href: "/admin/roles",             icon: "Shield" },
  { label: "Settings",       key: "sidebar.settings",      href: "/admin/settings",          icon: "Settings" },
];

export const VENDOR_NAV = [
  { label: "Dashboard",     key: "sidebar.dashboard",     href: "/vendor",               icon: "LayoutDashboard" },
  { label: "AI Assistant",  key: "sidebar.ai_assistant",  href: "/vendor/ai",            icon: "Sparkles" },
  { label: "Inquiries",     key: "sidebar.inquiries",     href: "/vendor/inquiries",     icon: "Inbox" },
  { label: "Orders",        key: "sidebar.orders",        href: "/vendor/orders",        icon: "ShoppingBag" },
  { label: "Calendar",      key: "sidebar.calendar",      href: "/vendor/calendar",      icon: "CalendarDays" },
  { label: "Products",      key: "sidebar.products",      href: "/vendor/products",      icon: "Package" },
  { label: "Services",      key: "sidebar.services",      href: "/vendor/services",      icon: "Briefcase" },
  { label: "Messages",      key: "sidebar.messages",      href: "/vendor/messages",      icon: "MessageSquare" },
  { label: "Reviews",       key: "sidebar.reviews",       href: "/vendor/reviews",       icon: "Star" },
  { label: "Analytics",     key: "sidebar.analytics",     href: "/vendor/reports",       icon: "BarChart2" },
  { label: "Settings",      key: "sidebar.settings",      href: "/vendor/settings",      icon: "Settings" },
];

export const USER_NAV = [
  { label: "Dashboard",    href: "/user",                  icon: "LayoutDashboard" },
  { label: "My Events",    href: "/user/events",           icon: "Calendar" },
  { label: "Inquiries",    href: "/user/inquiries",        icon: "Inbox" },
  { label: "Saved",        href: "/user/saved",            icon: "Heart" },
  { label: "Messages",     href: "/user/messages",         icon: "MessageSquare" },
  { label: "Orders",       href: "/user/orders",           icon: "ShoppingBag" },
  { label: "Reviews",      href: "/user/reviews",          icon: "Star" },
  { label: "Planner",      href: "/user/planner",          icon: "ClipboardList" },
  { label: "Notifications",href: "/user/notifications",    icon: "Bell" },
  { label: "Settings",     href: "/user/settings",         icon: "Settings" },
];

export const SAMPLE_USERS     = [];
export const SAMPLE_VENDORS   = [];
export const SAMPLE_ORDERS    = [];
export const SAMPLE_BOOKINGS  = [];
export const SAMPLE_INQUIRIES = [];
export const SAMPLE_REVIEWS   = [];
export const SAMPLE_PRODUCTS  = [];
export const MESSAGES         = [];
export const SUPPORT_TICKETS  = [];

export const REVENUE_DATA   = [];
export const USER_GROWTH    = [];
export const BOOKINGS_DATA  = [];
export const CATEGORY_DATA  = [];

export const SUBSCRIPTION_PLANS = [
  { key: "basic",   name: "Basic",   price: 0,  period: "free",  listings: 10,  services: 5,  features: ["Basic analytics", "Email support", "Standard listing"] },
  { key: "pro",     name: "Pro",     price: 29, period: "month", listings: 100, services: 30, features: ["Advanced analytics", "Priority support", "Featured badge", "Custom URL"] },
  { key: "premium", name: "Premium", price: 79, period: "month", listings: 999, services: 999,features: ["Full analytics", "24/7 support", "Top placement", "API access", "Bulk import"] },
];
