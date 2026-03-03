const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('leo-shop-token');
}

export function setToken(token: string): void {
  localStorage.setItem('leo-shop-token', token);
}

export function removeToken(): void {
  localStorage.removeItem('leo-shop-token');
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.error || error.message || `HTTP ${res.status}`);
  }
  // Handle 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string) =>
    fetchAPI('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
};

// User API
export const userAPI = {
  getProfile: () => fetchAPI('/api/user/profile'),
  updateProfile: (data: { name?: string; phone?: string }) =>
    fetchAPI('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    fetchAPI('/api/user/password', { method: 'PUT', body: JSON.stringify(data) }),
};

// Product API
export const productAPI = {
  getAll: (params?: { category?: string; keyword?: string; sort?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size) query.set('size', String(params.size));
    return fetchAPI(`/api/products?${query}`);
  },
  getBySlug: (slug: string) => fetchAPI(`/api/products/${slug}`),
  getCategories: () => fetchAPI('/api/products/categories'),
};

// Order API
export const orderAPI = {
  create: (data: {
    items: { productId: number; quantity: number }[];
    shippingName: string;
    shippingPhone: string;
    shippingEmail: string;
    shippingAddress: string;
    paymentMethod: string;
    note?: string;
  }) => fetchAPI('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: (page?: number, size?: number) =>
    fetchAPI(`/api/orders?page=${page || 0}&size=${size || 10}`),
  getByNumber: (orderNumber: string) => fetchAPI(`/api/orders/${orderNumber}`),
  cancel: (id: number) => fetchAPI(`/api/orders/${id}/cancel`, { method: 'PUT' }),
};

// Address API
export const addressAPI = {
  getAll: () => fetchAPI('/api/addresses'),
  create: (data: { name: string; phone: string; address: string; isDefault?: boolean }) =>
    fetchAPI('/api/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: { name: string; phone: string; address: string; isDefault?: boolean }) =>
    fetchAPI(`/api/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/api/addresses/${id}`, { method: 'DELETE' }),
  setDefault: (id: number) => fetchAPI(`/api/addresses/${id}/default`, { method: 'PUT' }),
};

// Admin API
export const adminProductAPI = {
  create: (data: {
    name: string; slug: string; description: string; price: number;
    comparePrice?: number; imageUrl: string; imageUrls?: string[]; category: string; stock: number; active: boolean;
  }) => fetchAPI('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: {
    name: string; slug: string; description: string; price: number;
    comparePrice?: number; imageUrl: string; imageUrls?: string[]; category: string; stock: number; active: boolean;
  }) => fetchAPI(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/api/admin/products/${id}`, { method: 'DELETE' }),
};

export const adminOrderAPI = {
  getAll: (params?: { status?: string; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size) query.set('size', String(params.size));
    return fetchAPI(`/api/admin/orders?${query}`);
  },
  getById: (id: number) => fetchAPI(`/api/admin/orders/${id}`),
  updateStatus: (id: number, status: string) =>
    fetchAPI(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// Upload API
export const uploadAPI = {
  uploadImages: async (files: File[]): Promise<{ urls: string[] }> => {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  deleteImage: async (url: string) => {
    return fetchAPI('/api/admin/upload', { method: 'DELETE', body: JSON.stringify({ url }) });
  },
};

// Crypto Payment API
export const cryptoPaymentAPI = {
  create: (data: { orderId: number; payCurrency: string }) =>
    fetchAPI('/api/payments/crypto/create', { method: 'POST', body: JSON.stringify(data) }),
  getStatus: (paymentId: string) =>
    fetchAPI(`/api/payments/crypto/status/${paymentId}`),
};

export const adminDashboardAPI = {
  getStats: () => fetchAPI('/api/admin/dashboard/stats'),
  getRevenue: () => fetchAPI('/api/admin/dashboard/revenue'),
};

// Payment Method API (public)
export const paymentMethodAPI = {
  getEnabled: () => fetchAPI('/api/payment-methods'),
};

// Admin Payment Method API
export const adminPaymentMethodAPI = {
  getAll: () => fetchAPI('/api/admin/payment-methods'),
  create: (data: Record<string, unknown>) => fetchAPI('/api/admin/payment-methods', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Record<string, unknown>) => fetchAPI(`/api/admin/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/api/admin/payment-methods/${id}`, { method: 'DELETE' }),
  toggle: (id: number) => fetchAPI(`/api/admin/payment-methods/${id}/toggle`, { method: 'PATCH' }),
};

// Crypto Order API (customer)
export const cryptoOrderAPI = {
  create: (data: { orderId: number; paymentMethodId: number }) =>
    fetchAPI('/api/crypto-orders', { method: 'POST', body: JSON.stringify(data) }),
  submitHash: (id: number, txHash: string) =>
    fetchAPI(`/api/crypto-orders/${id}/submit-hash`, { method: 'PUT', body: JSON.stringify({ txHash }) }),
  getStatus: (id: number) => fetchAPI(`/api/crypto-orders/${id}/status`),
};

// Admin Crypto Order API
export const adminCryptoOrderAPI = {
  getAll: () => fetchAPI('/api/admin/crypto-orders'),
  verify: (id: number) => fetchAPI(`/api/admin/crypto-orders/${id}/verify`, { method: 'POST' }),
  confirm: (id: number) => fetchAPI(`/api/admin/crypto-orders/${id}/confirm`, { method: 'POST' }),
  reject: (id: number) => fetchAPI(`/api/admin/crypto-orders/${id}/reject`, { method: 'POST' }),
};
