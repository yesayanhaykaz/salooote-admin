const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Try to refresh
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getToken();
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }
      return retryRes.json();
    } else {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
      return;
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }

  if (res.status === 204) return null;
  return res.json();
}

async function tryRefresh() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("access_token", data.data.access_token);
    localStorage.setItem("refresh_token", data.data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// Auth
export const authAPI = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request("/auth/me"),
  logout: () =>
    request("/auth/logout", { method: "POST" }).catch(() => null),
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
};

// Admin - Dashboard
export const adminDashboardAPI = {
  stats: () => request("/admin/dashboard"),
  revenue: (months = 7) => request(`/admin/analytics/revenue?months=${months}`),
};

// Admin - Users
export const adminUsersAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/users${q ? "?" + q : ""}`);
  },
  get: (id) => request(`/admin/users/${id}`),
  updateStatus: (id, status) =>
    request(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// Admin - Vendors
export const adminVendorsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/vendors${q ? "?" + q : ""}`);
  },
  create: (data) => request("/admin/vendors", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/admin/vendors/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updateStatus: (id, status) =>
    request(`/admin/vendors/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getCategories: (id) => request(`/admin/vendors/${id}/categories`),
  setCategories: (id, category_ids) =>
    request(`/admin/vendors/${id}/categories`, {
      method: "PUT",
      body: JSON.stringify({ category_ids }),
    }),
};

// Admin - Bookings
export const adminBookingsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/bookings${q ? "?" + q : ""}`);
  },
  updateStatus: (id, status) =>
    request(`/admin/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

// Admin - Reviews
export const adminReviewsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/reviews${q ? "?" + q : ""}`);
  },
  updateStatus: (id, status) =>
    request(`/admin/reviews/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  delete: (id) => request(`/admin/reviews/${id}`, { method: "DELETE" }),
};

// Admin - Subscriptions
export const adminSubscriptionsAPI = {
  list: () => request("/admin/subscriptions"),
  assignPlan: (vendorId, planSlug) =>
    request("/admin/subscriptions/assign", { method: "POST", body: JSON.stringify({ vendor_id: vendorId, plan_slug: planSlug }) }),
  plans: () => request("/vendor/subscription/plans"),
};

// Admin - Approvals
export const adminApprovalsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/approvals${q ? "?" + q : ""}`);
  },
  approve: (id) =>
    request(`/admin/approvals/${id}/approve`, { method: "POST" }),
  reject: (id, reason) =>
    request(`/admin/approvals/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};

// Admin - Products
export const adminProductsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/products${q ? "?" + q : ""}`);
  },
  delete: (id) => request(`/admin/products/${id}`, { method: "DELETE" }),
};

// Admin - Categories
export const adminCategoriesAPI = {
  list: () => request("/categories"),
  create: (data) =>
    request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) => request(`/admin/categories/${id}`, { method: "DELETE" }),
  upsertTranslation: (id, data) =>
    request(`/admin/categories/${id}/translations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Public - Vendors (for admin display)
export const vendorsAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendors${q ? "?" + q : ""}`);
  },
};

// User portal
export const userAPI = {
  // Profile
  getProfile: () => request("/user/profile"),
  updateProfile: (data) => request("/user/profile", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (data) => request("/user/password", { method: "PUT", body: JSON.stringify(data) }),
  // Orders
  orders: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/user/orders${q ? "?" + q : ""}`); },
  createOrder: (data) => request("/user/orders", { method: "POST", body: JSON.stringify(data) }),
  // Inquiries
  inquiries: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/user/inquiries${q ? "?" + q : ""}`); },
  createInquiry: (data) => request("/user/inquiries", { method: "POST", body: JSON.stringify(data) }),
  // Reviews
  reviews: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/user/reviews${q ? "?" + q : ""}`); },
  createReview: (data) => request("/user/reviews", { method: "POST", body: JSON.stringify(data) }),
  // Saved
  saved: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/user/saved${q ? "?" + q : ""}`); },
  saveItem: (target_type, target_id) => request("/user/saved", { method: "POST", body: JSON.stringify({ target_type, target_id }) }),
  unsaveItem: (id) => request(`/user/saved/${id}`, { method: "DELETE" }),
  // Notifications
  notifications: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/user/notifications${q ? "?" + q : ""}`); },
  markNotifRead: (id) => request(`/user/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotifsRead: () => request("/user/notifications/read-all", { method: "POST" }),
};

// Public search
export const publicAPI = {
  vendors: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/vendors${q ? "?" + q : ""}`); },
  getVendor: (id) => request(`/vendors/${id}`),
  products: (params = {}) => { const q = new URLSearchParams(params).toString(); return request(`/products${q ? "?" + q : ""}`); },
  getProduct: (id) => request(`/products/${id}`),
};

// Vendor portal
export const vendorAPI = {
  dashboard: () => request("/vendor/dashboard"),
  revenue: (months = 7) => request(`/vendor/analytics/revenue?months=${months}`),
  products: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendor/products${q ? "?" + q : ""}`);
  },
  getProduct: (id) => request(`/vendor/products/${id}`),
  createProduct: (data) =>
    request("/vendor/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) =>
    request(`/vendor/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  upsertProductTranslation: (id, locale, data) =>
    request(`/vendor/products/${id}/translations`, { method: "POST", body: JSON.stringify({ locale, ...data }) }),
  publishProduct: (id) =>
    request(`/vendor/products/${id}/publish`, { method: "POST" }),
  unpublishProduct: (id) =>
    request(`/vendor/products/${id}/unpublish`, { method: "POST" }),
  deleteProduct: (id) =>
    request(`/vendor/products/${id}`, { method: "DELETE" }),
  getProfile: () => request("/vendor/profile"),
  updateProfile: (data) =>
    request("/vendor/profile", { method: "PUT", body: JSON.stringify(data) }),

  // Inquiries
  inquiries: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendor/inquiries${q ? "?" + q : ""}`);
  },
  updateInquiryStatus: (id, status) =>
    request(`/vendor/inquiries/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  markInquiryRead: (id) =>
    request(`/vendor/inquiries/${id}/read`, { method: "PATCH" }),

  // Orders
  orders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendor/orders${q ? "?" + q : ""}`);
  },
  getOrder: (id) => request(`/vendor/orders/${id}`),
  updateOrderStatus: (id, status) =>
    request(`/vendor/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Bookings
  bookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendor/bookings${q ? "?" + q : ""}`);
  },
  updateBookingStatus: (id, status) =>
    request(`/vendor/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  // Services
  services: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendor/services${q ? "?" + q : ""}`);
  },
  getService: (id) => request(`/vendor/services/${id}`),
  createService: (data) =>
    request("/vendor/services", { method: "POST", body: JSON.stringify(data) }),
  updateService: (id, data) =>
    request(`/vendor/services/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteService: (id) =>
    request(`/vendor/services/${id}`, { method: "DELETE" }),
  publishService: (id) =>
    request(`/vendor/services/${id}/publish`, { method: "POST" }),
  unpublishService: (id) =>
    request(`/vendor/services/${id}/unpublish`, { method: "POST" }),
  upsertServiceTranslation: (id, locale, data) =>
    request(`/vendor/services/${id}/translations`, { method: "POST", body: JSON.stringify({ locale, ...data }) }),

  // Reviews
  reviews: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendor/reviews${q ? "?" + q : ""}`);
  },

  // Notifications
  notifications: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/vendor/notifications${q ? "?" + q : ""}`);
  },
  markNotifRead: (id) =>
    request(`/vendor/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotifsRead: () =>
    request("/vendor/notifications/read-all", { method: "POST" }),

  // Categories
  getCategories: () => request("/vendor/categories"),
  setCategories: (category_ids) =>
    request("/vendor/categories", { method: "PUT", body: JSON.stringify({ category_ids }) }),

  // Subscription
  subscription: () => request("/vendor/subscription"),
  subscriptionPlans: () => request("/vendor/subscription/plans"),
  changePlan: (plan_slug) => request("/vendor/subscription/change", { method: "POST", body: JSON.stringify({ plan_slug }) }),
  cancelSubscription: () => request("/vendor/subscription/cancel", { method: "POST" }),
  billingHistory: () => request("/vendor/subscription/history"),
};

// AI Chat
export const aiAPI = {
  vendorChat: (messages) =>
    request("/vendor/ai/chat", { method: "POST", body: JSON.stringify({ messages }) }),
  adminChat: (messages) =>
    request("/admin/ai/chat", { method: "POST", body: JSON.stringify({ messages }) }),
};

// Upload
export const uploadAPI = {
  image: async (file, role = "admin") => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const endpoint = role === "vendor" ? "/vendor/upload" : "/admin/upload";
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }
    return res.json();
  },

  productImage: async (productId, file) => {
    const token = getToken();
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${BASE_URL}/vendor/products/${productId}/images`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }
    return res.json();
  },

  deleteProductImage: (productId, imageId) =>
    request(`/vendor/products/${productId}/images/${imageId}`, { method: "DELETE" }),

  setProductImagePrimary: (productId, imageId) =>
    request(`/vendor/products/${productId}/images/${imageId}/primary`, { method: "POST" }),

  serviceImage: async (serviceId, file) => {
    const token = getToken();
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${BASE_URL}/vendor/services/${serviceId}/images`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }
    return res.json();
  },

  deleteServiceImage: (serviceId, imageId) =>
    request(`/vendor/services/${serviceId}/images/${imageId}`, { method: "DELETE" }),

  setServiceImagePrimary: (serviceId, imageId) =>
    request(`/vendor/services/${serviceId}/images/${imageId}/primary`, { method: "POST" }),

  galleryImage: async (file) => {
    const token = getToken();
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${BASE_URL}/vendor/gallery`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(err.error || "Upload failed");
    }
    return res.json();
  },

  deleteGalleryImage: (imageId) =>
    request(`/vendor/gallery/${imageId}`, { method: "DELETE" }),

  getGallery: () => request("/vendor/gallery"),
};
