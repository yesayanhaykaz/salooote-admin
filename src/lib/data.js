export const ADMIN_NAV = [
  { label: "Dashboard",   href: "/admin",            icon: "LayoutDashboard" },
  { label: "Users",       href: "/admin/users",       icon: "Users" },
  { label: "Vendors",     href: "/admin/vendors",     icon: "Store" },
  { label: "Orders",      href: "/admin/orders",      icon: "ShoppingBag" },
  { label: "Events",      href: "/admin/events",      icon: "Calendar" },
  { label: "Products",    href: "/admin/products",    icon: "Package" },
  { label: "Categories",  href: "/admin/categories",  icon: "Tag" },
  { label: "Reports",     href: "/admin/reports",     icon: "BarChart2" },
  { label: "Messages",    href: "/admin/messages",    icon: "MessageSquare" },
  { label: "Blog Posts",  href: "/admin/blog",        icon: "FileText" },
  { label: "Settings",    href: "/admin/settings",    icon: "Settings" },
];

export const VENDOR_NAV = [
  { label: "Dashboard",    href: "/vendor",                  icon: "LayoutDashboard" },
  { label: "Customers",    href: "/vendor/customers",        icon: "Users" },
  { label: "Orders",       href: "/vendor/orders",           icon: "ShoppingBag" },
  { label: "Events",       href: "/vendor/events",           icon: "Calendar" },
  { label: "Products",     href: "/vendor/products",         icon: "Package" },
  { label: "Services",     href: "/vendor/services",         icon: "Sparkles" },
  { label: "Sales Report", href: "/vendor/reports",          icon: "BarChart2" },
  { label: "Messages",     href: "/vendor/messages",         icon: "MessageSquare" },
  { label: "Subscription", href: "/vendor/subscription",     icon: "CreditCard" },
  { label: "Settings",     href: "/vendor/settings",         icon: "Settings" },
];

export const USER_NAV = [
  { label: "My Orders",  href: "/user/orders",   icon: "ShoppingBag" },
  { label: "My Events",  href: "/user/events",   icon: "Calendar" },
  { label: "Messages",   href: "/user/messages", icon: "MessageSquare" },
  { label: "Settings",   href: "/user/settings", icon: "Settings" },
];

export const SAMPLE_USERS = [
  { id: 1, name: "Anna Hovhannisyan", email: "anna@example.com", role: "user",   status: "active",  joined: "Jan 12, 2025", orders: 14, avatar: "A" },
  { id: 2, name: "Aram Petrosyan",    email: "aram@example.com", role: "vendor", status: "active",  joined: "Feb 3, 2025",  orders: 0,  avatar: "A" },
  { id: 3, name: "Lilit Sargsyan",    email: "lilit@example.com",role: "user",   status: "active",  joined: "Mar 8, 2025",  orders: 7,  avatar: "L" },
  { id: 4, name: "Davit Hakobyan",    email: "davit@example.com",role: "user",   status: "banned",  joined: "Dec 1, 2024",  orders: 2,  avatar: "D" },
  { id: 5, name: "Nare Grigoryan",    email: "nare@example.com", role: "vendor", status: "pending", joined: "Apr 2, 2025",  orders: 0,  avatar: "N" },
  { id: 6, name: "Sona Karapetyan",   email: "sona@example.com", role: "user",   status: "active",  joined: "Jan 20, 2025", orders: 5,  avatar: "S" },
  { id: 7, name: "Tigran Avetisyan",  email: "tigran@example.com",role:"user",   status: "active",  joined: "Feb 14, 2025", orders: 11, avatar: "T" },
  { id: 8, name: "Karen Martirosyan", email: "karen@example.com",role: "vendor", status: "active",  joined: "Nov 5, 2024",  orders: 0,  avatar: "K" },
];

export const SAMPLE_VENDORS = [
  { id: 1, name: "Salooote Flowers",    category: "Flowers & Gifts",  status: "active",  rating: 4.9, products: 48, revenue: "$12,400", joined: "Jan 2024" },
  { id: 2, name: "Sweet Dreams Bakery", category: "Cakes & Desserts", status: "active",  rating: 4.8, products: 32, revenue: "$9,800",  joined: "Mar 2024" },
  { id: 3, name: "Party Planet",        category: "Party & Decor",    status: "pending", rating: 0,   products: 0,  revenue: "$0",      joined: "Apr 2025" },
  { id: 4, name: "Sound Wave DJ",       category: "DJ & Music",       status: "active",  rating: 4.7, products: 8,  revenue: "$7,200",  joined: "Jun 2024" },
  { id: 5, name: "Bloom Studio",        category: "Flowers & Gifts",  status: "active",  rating: 4.6, products: 24, revenue: "$5,600",  joined: "Aug 2024" },
  { id: 6, name: "Cater King",          category: "Catering",         status: "suspended",rating: 3.2,products: 12, revenue: "$2,100",  joined: "Sep 2024" },
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

export const CATEGORY_DATA = [
  { name: "Cakes",    value: 32, color: "#f43f7a" },
  { name: "Flowers",  value: 28, color: "#7c3aed" },
  { name: "Decor",    value: 18, color: "#3b82f6" },
  { name: "Catering", value: 12, color: "#f59e0b" },
  { name: "Music",    value: 10, color: "#22c55e" },
];

export const MESSAGES = [
  { id: 1, from: "Anna Hovhannisyan", avatar: "A", color: "bg-pink-500",   preview: "Hi, is the cake available for April 12?",       time: "2m ago",  unread: 2 },
  { id: 2, from: "Tigran Avetisyan",  avatar: "T", color: "bg-blue-500",   preview: "Thank you for the quick delivery!",             time: "15m ago", unread: 0 },
  { id: 3, from: "Sona Karapetyan",   avatar: "S", color: "bg-purple-500", preview: "Can I change my order to Saturday?",             time: "1h ago",  unread: 1 },
  { id: 4, from: "Lilit Sargsyan",    avatar: "L", color: "bg-green-500",  preview: "I need a custom balloon arrangement for 100...", time: "3h ago",  unread: 0 },
  { id: 5, from: "Davit Hakobyan",    avatar: "D", color: "bg-orange-500", preview: "Please confirm my order #ORD-1039",             time: "1d ago",  unread: 0 },
];
