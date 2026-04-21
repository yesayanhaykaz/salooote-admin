export const ADMIN_NAV = [
  { label: "Dashboard",      href: "/admin",                   icon: "LayoutDashboard" },
  { label: "Users",          href: "/admin/users",             icon: "Users" },
  { label: "Vendors",        href: "/admin/vendors",           icon: "Store" },
  { label: "Approvals",      href: "/admin/approvals",         icon: "ClipboardCheck" },
  { label: "Bookings",       href: "/admin/bookings",          icon: "CalendarCheck" },
  { label: "Products",       href: "/admin/products",          icon: "Package" },
  { label: "Categories",     href: "/admin/categories",        icon: "Tag" },
  { label: "Subscriptions",  href: "/admin/subscriptions",     icon: "CreditCard" },
  { label: "Payments",       href: "/admin/payments",          icon: "DollarSign" },
  { label: "Reviews",        href: "/admin/reviews",           icon: "Star" },
  { label: "Support",        href: "/admin/support",           icon: "Headphones" },
  { label: "Marketing",      href: "/admin/marketing",         icon: "Megaphone" },
  { label: "Notifications",  href: "/admin/notifications",     icon: "Bell" },
  { label: "CMS",            href: "/admin/cms",               icon: "FileText" },
  { label: "Reports",        href: "/admin/reports",           icon: "BarChart2" },
  { label: "Roles",          href: "/admin/roles",             icon: "Shield" },
  { label: "Settings",       href: "/admin/settings",          icon: "Settings" },
];

export const VENDOR_NAV = [
  { label: "Dashboard",     href: "/vendor",                  icon: "LayoutDashboard" },
  { label: "AI Assistant",  href: "/vendor/ai",               icon: "Sparkles" },
  { label: "Inquiries",     href: "/vendor/inquiries",        icon: "Inbox" },
  { label: "Orders",        href: "/vendor/orders",           icon: "ShoppingBag" },
  { label: "Calendar",      href: "/vendor/calendar",         icon: "CalendarDays" },
  { label: "Products",      href: "/vendor/products",         icon: "Package" },
  { label: "Services",      href: "/vendor/services",         icon: "Briefcase" },
  { label: "Messages",      href: "/vendor/messages",         icon: "MessageSquare" },
  { label: "Reviews",       href: "/vendor/reviews",          icon: "Star" },
  { label: "Analytics",     href: "/vendor/reports",          icon: "BarChart2" },
  { label: "Subscription",  href: "/vendor/subscription",     icon: "CreditCard" },
  { label: "Notifications", href: "/vendor/notifications",    icon: "Bell" },
  { label: "Settings",      href: "/vendor/settings",         icon: "Settings" },
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
