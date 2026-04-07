export const ADMIN_NAV = [
  { label: "Dashboard",      href: "/admin",                   icon: "LayoutDashboard" },
  { label: "Users",          href: "/admin/users",             icon: "Users" },
  { label: "Vendors",        href: "/admin/vendors",           icon: "Store" },
  { label: "Approvals",      href: "/admin/approvals",         icon: "ClipboardCheck",  badge: "5" },
  { label: "Bookings",       href: "/admin/bookings",          icon: "CalendarCheck" },
  { label: "Products",       href: "/admin/products",          icon: "Package" },
  { label: "Categories",     href: "/admin/categories",        icon: "Tag" },
  { label: "Subscriptions",  href: "/admin/subscriptions",     icon: "CreditCard" },
  { label: "Payments",       href: "/admin/payments",          icon: "DollarSign" },
  { label: "Reviews",        href: "/admin/reviews",           icon: "Star" },
  { label: "Support",        href: "/admin/support",           icon: "Headphones",      badge: "3" },
  { label: "Marketing",      href: "/admin/marketing",         icon: "Megaphone" },
  { label: "Notifications",  href: "/admin/notifications",     icon: "Bell" },
  { label: "CMS",            href: "/admin/cms",               icon: "FileText" },
  { label: "Reports",        href: "/admin/reports",           icon: "BarChart2" },
  { label: "Roles",          href: "/admin/roles",             icon: "Shield" },
  { label: "Settings",       href: "/admin/settings",          icon: "Settings" },
];

export const VENDOR_NAV = [
  { label: "Dashboard",    href: "/vendor",                  icon: "LayoutDashboard" },
  { label: "Inquiries",    href: "/vendor/inquiries",        icon: "Inbox",          badge: "4" },
  { label: "Orders",       href: "/vendor/orders",           icon: "ShoppingBag" },
  { label: "Calendar",     href: "/vendor/calendar",         icon: "CalendarDays" },
  { label: "Products",     href: "/vendor/products",         icon: "Package" },
  { label: "Services",     href: "/vendor/services",         icon: "Sparkles" },
  { label: "Messages",     href: "/vendor/messages",         icon: "MessageSquare" },
  { label: "Reviews",      href: "/vendor/reviews",          icon: "Star" },
  { label: "Analytics",    href: "/vendor/reports",          icon: "BarChart2" },
  { label: "Subscription", href: "/vendor/subscription",     icon: "CreditCard" },
  { label: "Notifications",href: "/vendor/notifications",    icon: "Bell" },
  { label: "Settings",     href: "/vendor/settings",         icon: "Settings" },
];

export const USER_NAV = [
  { label: "Dashboard",   href: "/user",                  icon: "LayoutDashboard" },
  { label: "My Events",   href: "/user/events",           icon: "Calendar" },
  { label: "Inquiries",   href: "/user/inquiries",        icon: "Inbox" },
  { label: "Saved",       href: "/user/saved",            icon: "Heart" },
  { label: "Messages",    href: "/user/messages",         icon: "MessageSquare" },
  { label: "Orders",      href: "/user/orders",           icon: "ShoppingBag" },
  { label: "Reviews",     href: "/user/reviews",          icon: "Star" },
  { label: "Planner",     href: "/user/planner",          icon: "ClipboardList" },
  { label: "Notifications",href: "/user/notifications",   icon: "Bell" },
  { label: "Settings",    href: "/user/settings",         icon: "Settings" },
];

export const SAMPLE_USERS = [
  { id: 1, name: "Anna Hovhannisyan", email: "anna@example.com", phone: "+374 91 234 567", role: "user",   status: "active",  joined: "Jan 12, 2025", orders: 14, avatar: "A", city: "Yerevan" },
  { id: 2, name: "Aram Petrosyan",    email: "aram@example.com", phone: "+374 77 111 222", role: "vendor", status: "active",  joined: "Feb 3, 2025",  orders: 0,  avatar: "A", city: "Yerevan" },
  { id: 3, name: "Lilit Sargsyan",    email: "lilit@example.com",phone: "+374 91 333 444", role: "user",   status: "active",  joined: "Mar 8, 2025",  orders: 7,  avatar: "L", city: "Gyumri" },
  { id: 4, name: "Davit Hakobyan",    email: "davit@example.com",phone: "+374 99 555 666", role: "user",   status: "banned",  joined: "Dec 1, 2024",  orders: 2,  avatar: "D", city: "Yerevan" },
  { id: 5, name: "Nare Grigoryan",    email: "nare@example.com", phone: "+374 98 777 888", role: "vendor", status: "pending", joined: "Apr 2, 2025",  orders: 0,  avatar: "N", city: "Vanadzor" },
  { id: 6, name: "Sona Karapetyan",   email: "sona@example.com", phone: "+374 91 999 000", role: "user",   status: "active",  joined: "Jan 20, 2025", orders: 5,  avatar: "S", city: "Yerevan" },
  { id: 7, name: "Tigran Avetisyan",  email: "tigran@example.com",phone:"+374 77 123 456",role:"user",    status: "active",  joined: "Feb 14, 2025", orders: 11, avatar: "T", city: "Yerevan" },
  { id: 8, name: "Karen Martirosyan", email: "karen@example.com",phone: "+374 91 654 321", role: "vendor", status: "active",  joined: "Nov 5, 2024",  orders: 0,  avatar: "K", city: "Abovyan" },
];

export const SAMPLE_VENDORS = [
  { id: 1, name: "Salooote Flowers",    category: "Flowers & Gifts",  status: "active",    rating: 4.9, products: 48, revenue: "$12,400", joined: "Jan 2024", plan: "Premium", city: "Yerevan" },
  { id: 2, name: "Sweet Dreams Bakery", category: "Cakes & Desserts", status: "active",    rating: 4.8, products: 32, revenue: "$9,800",  joined: "Mar 2024", plan: "Pro",     city: "Yerevan" },
  { id: 3, name: "Party Planet",        category: "Party & Decor",    status: "pending",   rating: 0,   products: 0,  revenue: "$0",      joined: "Apr 2025", plan: "Basic",   city: "Gyumri" },
  { id: 4, name: "Sound Wave DJ",       category: "DJ & Music",       status: "active",    rating: 4.7, products: 8,  revenue: "$7,200",  joined: "Jun 2024", plan: "Pro",     city: "Yerevan" },
  { id: 5, name: "Bloom Studio",        category: "Flowers & Gifts",  status: "active",    rating: 4.6, products: 24, revenue: "$5,600",  joined: "Aug 2024", plan: "Basic",   city: "Vanadzor" },
  { id: 6, name: "Cater King",          category: "Catering",         status: "suspended", rating: 3.2, products: 12, revenue: "$2,100",  joined: "Sep 2024", plan: "Pro",     city: "Yerevan" },
  { id: 7, name: "Lense & Light",       category: "Photography",      status: "pending",   rating: 0,   products: 0,  revenue: "$0",      joined: "Apr 2025", plan: "Basic",   city: "Yerevan" },
  { id: 8, name: "Glamour Makeup",      category: "Beauty & Makeup",  status: "active",    rating: 4.5, products: 18, revenue: "$4,200",  joined: "Oct 2024", plan: "Pro",     city: "Yerevan" },
];

export const SAMPLE_ORDERS = [
  { id: "#ORD-1042", customer: "Anna Hovhannisyan", vendor: "Sweet Dreams Bakery", product: "Wedding Cake",       amount: "$250", status: "delivered", date: "Apr 5, 2025" },
  { id: "#ORD-1041", customer: "Tigran Avetisyan",  vendor: "Salooote Flowers",    product: "Rose Bouquet",       amount: "$65",  status: "pending",   date: "Apr 5, 2025" },
  { id: "#ORD-1040", customer: "Sona Karapetyan",   vendor: "Party Planet",        product: "Balloon Bundle",     amount: "$45",  status: "processing",date: "Apr 4, 2025" },
  { id: "#ORD-1039", customer: "Lilit Sargsyan",    vendor: "Sound Wave DJ",       product: "DJ Event Package",   amount: "$400", status: "delivered", date: "Apr 3, 2025" },
  { id: "#ORD-1038", customer: "Davit Hakobyan",    vendor: "Bloom Studio",        product: "Flower Arrangement", amount: "$80",  status: "cancelled", date: "Apr 2, 2025" },
  { id: "#ORD-1037", customer: "Karen Martirosyan", vendor: "Cater King",          product: "Catering (50 pax)",  amount: "$850", status: "delivered", date: "Apr 1, 2025" },
  { id: "#ORD-1036", customer: "Nare Grigoryan",    vendor: "Sweet Dreams Bakery", product: "Birthday Cake",      amount: "$120", status: "processing",date: "Mar 31, 2025" },
  { id: "#ORD-1035", customer: "Aram Petrosyan",    vendor: "Salooote Flowers",    product: "Wedding Flowers",    amount: "$320", status: "delivered", date: "Mar 30, 2025" },
];

export const SAMPLE_BOOKINGS = [
  { id: "#BK-2041", customer: "Anna Hovhannisyan", vendor: "Sweet Dreams Bakery", service: "Wedding Cake (3-tier)", event: "Wedding",      eventDate: "Jun 15, 2025", guests: 120, budget: "$400",  status: "confirmed",  date: "Apr 5, 2025", city: "Yerevan" },
  { id: "#BK-2040", customer: "Tigran Avetisyan",  vendor: "Sound Wave DJ",       service: "DJ Event Package 5hr",  event: "Birthday",     eventDate: "May 3, 2025",  guests: 60,  budget: "$600",  status: "pending",    date: "Apr 4, 2025", city: "Yerevan" },
  { id: "#BK-2039", customer: "Lilit Sargsyan",    vendor: "Lense & Light",       service: "Photo + Video Package", event: "Christening",  eventDate: "May 22, 2025", guests: 80,  budget: "$700",  status: "negotiating",date: "Apr 3, 2025", city: "Gyumri" },
  { id: "#BK-2038", customer: "Sona Karapetyan",   vendor: "Salooote Flowers",    service: "Wedding Flower Package",event: "Wedding",      eventDate: "Jul 12, 2025", guests: 200, budget: "$1,200",status: "confirmed",  date: "Apr 2, 2025", city: "Yerevan" },
  { id: "#BK-2037", customer: "Karen Martirosyan", vendor: "Cater King",          service: "Catering (100 pax)",    event: "Office Event", eventDate: "Apr 28, 2025", guests: 100, budget: "$2,000",status: "cancelled",  date: "Apr 1, 2025", city: "Yerevan" },
  { id: "#BK-2036", customer: "Nare Grigoryan",    vendor: "Glamour Makeup",      service: "Bridal Makeup Package", event: "Wedding",      eventDate: "Jun 1, 2025",  guests: 1,   budget: "$250",  status: "confirmed",  date: "Mar 30, 2025",city: "Yerevan" },
];

export const SAMPLE_INQUIRIES = [
  { id: "#INQ-501", from: "Anna Hovhannisyan", avatar: "A", service: "Wedding Cake (3-tier)", vendor: "Sweet Dreams Bakery", event: "Wedding",     eventDate: "Jun 15, 2025", guests: 120, budget: "$400",  message: "Hi! I'd love a 3-tier almond cake with floral decoration in white and gold. Do you have availability?", status: "new",       date: "Apr 5, 2025" },
  { id: "#INQ-500", from: "Tigran Avetisyan",  avatar: "T", service: "DJ Event Package",       vendor: "Sound Wave DJ",       event: "Birthday",    eventDate: "May 3, 2025",  guests: 60,  budget: "$600",  message: "Need a DJ for 5 hours, mainly pop and EDM music. Do you do outdoor events?",                               status: "replied",   date: "Apr 4, 2025" },
  { id: "#INQ-499", from: "Lilit Sargsyan",    avatar: "L", service: "Photo + Video Package",  vendor: "Lense & Light",       event: "Christening", eventDate: "May 22, 2025", guests: 80,  budget: "$700",  message: "Looking for a photographer and videographer for my baby's christening. Can you provide a package?",      status: "new",       date: "Apr 3, 2025" },
  { id: "#INQ-498", from: "Sona Karapetyan",   avatar: "S", service: "Balloon Arch Setup",     vendor: "Party Planet",        event: "Birthday",    eventDate: "Apr 20, 2025", guests: 30,  budget: "$150",  message: "Pink and white balloon arch for my daughter's 5th birthday party. Size: 3 meters.",                       status: "confirmed", date: "Apr 2, 2025" },
  { id: "#INQ-497", from: "Karen Martirosyan", avatar: "K", service: "Catering (100 pax)",     vendor: "Cater King",          event: "Office Event",eventDate: "Apr 28, 2025", guests: 100, budget: "$2,000",message: "Corporate lunch event. Need full catering service with serving staff.",                                   status: "cancelled", date: "Apr 1, 2025" },
];

export const SAMPLE_REVIEWS = [
  { id: 1, author: "Anna Hovhannisyan", avatar: "A", vendor: "Sweet Dreams Bakery", service: "Wedding Cake",        rating: 5, comment: "Absolutely stunning cake! Exactly what we wanted. Very professional and delivered on time.", date: "Apr 3, 2025", status: "approved" },
  { id: 2, author: "Tigran Avetisyan",  avatar: "T", vendor: "Sound Wave DJ",       service: "DJ Package",           rating: 5, comment: "Best DJ ever! Everyone was on the dance floor. Will definitely book again.",              date: "Apr 1, 2025", status: "approved" },
  { id: 3, author: "Lilit Sargsyan",    avatar: "L", vendor: "Salooote Flowers",    service: "Wedding Flowers",      rating: 4, comment: "Beautiful flowers, though delivery was 30 minutes late. Overall great service.",            date: "Mar 29, 2025",status: "approved" },
  { id: 4, author: "Davit Hakobyan",    avatar: "D", vendor: "Cater King",          service: "Catering (50 pax)",    rating: 1, comment: "Terrible service! Food was cold and staff were rude. Very disappointed.",                   date: "Mar 25, 2025",status: "flagged" },
  { id: 5, author: "Sona Karapetyan",   avatar: "S", vendor: "Glamour Makeup",      service: "Bridal Makeup",        rating: 5, comment: "Absolutely gorgeous! I cried when I saw myself. Perfect makeup lasted all night.",            date: "Mar 20, 2025",status: "pending" },
  { id: 6, author: "Karen Martirosyan", avatar: "K", vendor: "Bloom Studio",        service: "Flower Arrangement",   rating: 4, comment: "Very creative arrangements. Would have been 5 stars but price was a bit high.",              date: "Mar 18, 2025",status: "approved" },
];

export const SAMPLE_PRODUCTS = [
  { id: 1, name: "Premium Wedding Cake",    vendor: "Sweet Dreams Bakery", category: "Cakes",   price: "$250", stock: 12, status: "active",   sales: 47 },
  { id: 2, name: "Red Rose Bouquet (50pc)", vendor: "Salooote Flowers",    category: "Flowers", price: "$65",  stock: 30, status: "active",   sales: 134 },
  { id: 3, name: "Party Balloon Bundle",    vendor: "Party Planet",        category: "Decor",   price: "$45",  stock: 80, status: "active",   sales: 89 },
  { id: 4, name: "DJ Event Package 3hr",    vendor: "Sound Wave DJ",       category: "Music",   price: "$400", stock: 5,  status: "active",   sales: 23 },
  { id: 5, name: "Spring Flower Box",       vendor: "Bloom Studio",        category: "Flowers", price: "$80",  stock: 0,  status: "out_stock",sales: 56 },
  { id: 6, name: "Catering Set (50 pax)",   vendor: "Cater King",          category: "Catering",price: "$850", stock: 3,  status: "active",   sales: 12 },
  { id: 7, name: "Cupcake Tower (24pc)",    vendor: "Sweet Dreams Bakery", category: "Cakes",   price: "$95",  stock: 20, status: "active",   sales: 78 },
  { id: 8, name: "Butterfly Arrangement",   vendor: "Bloom Studio",        category: "Flowers", price: "$110", stock: 8,  status: "draft",    sales: 0 },
];

export const REVENUE_DATA = [
  { month: "Oct", revenue: 18400, orders: 142 },
  { month: "Nov", revenue: 22100, orders: 168 },
  { month: "Dec", revenue: 31500, orders: 241 },
  { month: "Jan", revenue: 24800, orders: 189 },
  { month: "Feb", revenue: 28600, orders: 218 },
  { month: "Mar", revenue: 33200, orders: 254 },
  { month: "Apr", revenue: 29700, orders: 227 },
];

export const USER_GROWTH = [
  { month: "Oct", users: 1820, vendors: 28 },
  { month: "Nov", users: 2140, vendors: 33 },
  { month: "Dec", users: 2680, vendors: 38 },
  { month: "Jan", users: 3050, vendors: 41 },
  { month: "Feb", users: 3420, vendors: 44 },
  { month: "Mar", users: 3780, vendors: 46 },
  { month: "Apr", users: 3891, vendors: 48 },
];

export const BOOKINGS_DATA = [
  { month: "Oct", bookings: 84  },
  { month: "Nov", bookings: 102 },
  { month: "Dec", bookings: 148 },
  { month: "Jan", bookings: 118 },
  { month: "Feb", bookings: 134 },
  { month: "Mar", bookings: 162 },
  { month: "Apr", bookings: 141 },
];

export const CATEGORY_DATA = [
  { name: "Cakes",       value: 32, color: "#f43f7a" },
  { name: "Flowers",     value: 28, color: "#7c3aed" },
  { name: "Decor",       value: 18, color: "#3b82f6" },
  { name: "Catering",    value: 12, color: "#f59e0b" },
  { name: "Music",       value: 10, color: "#22c55e" },
];

export const MESSAGES = [
  { id: 1, from: "Anna Hovhannisyan", avatar: "A", color: "bg-pink-500",   preview: "Hi, is the cake available for April 12?",       time: "2m ago",  unread: 2 },
  { id: 2, from: "Tigran Avetisyan",  avatar: "T", color: "bg-blue-500",   preview: "Thank you for the quick delivery!",             time: "15m ago", unread: 0 },
  { id: 3, from: "Sona Karapetyan",   avatar: "S", color: "bg-purple-500", preview: "Can I change my order to Saturday?",             time: "1h ago",  unread: 1 },
  { id: 4, from: "Lilit Sargsyan",    avatar: "L", color: "bg-green-500",  preview: "I need a custom balloon arrangement for 100...", time: "3h ago",  unread: 0 },
  { id: 5, from: "Davit Hakobyan",    avatar: "D", color: "bg-orange-500", preview: "Please confirm my order #ORD-1039",             time: "1d ago",  unread: 0 },
];

export const SUPPORT_TICKETS = [
  { id: "#TKT-101", from: "Anna Hovhannisyan", subject: "Vendor didn't respond after booking", type: "complaint", priority: "high",   status: "open",    date: "Apr 5, 2025" },
  { id: "#TKT-100", from: "Sweet Dreams Bakery",subject: "Payment not received for order #ORD-1035", type: "billing",   priority: "high",   status: "open",    date: "Apr 4, 2025" },
  { id: "#TKT-099", from: "Lilit Sargsyan",    subject: "Wrong flowers delivered",               type: "dispute",   priority: "medium", status: "in_progress", date: "Apr 3, 2025" },
  { id: "#TKT-098", from: "Davit Hakobyan",    subject: "Cannot log into my account",            type: "technical", priority: "low",    status: "resolved",date: "Apr 1, 2025" },
  { id: "#TKT-097", from: "Party Planet",      subject: "Profile not visible in search",         type: "technical", priority: "medium", status: "open",    date: "Mar 30, 2025" },
];

export const SUBSCRIPTION_PLANS = [
  { key: "basic",   name: "Basic",   price: 0,  period: "free",  listings: 10,  services: 5,  features: ["Basic analytics", "Email support", "Standard listing"] },
  { key: "pro",     name: "Pro",     price: 29, period: "month", listings: 100, services: 30, features: ["Advanced analytics", "Priority support", "Featured badge", "Custom URL"] },
  { key: "premium", name: "Premium", price: 79, period: "month", listings: 999, services: 999,features: ["Full analytics", "24/7 support", "Top placement", "API access", "Bulk import"] },
];
