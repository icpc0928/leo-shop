export interface Product {
  id: number | string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: string[];
  imageUrl?: string;
  description: string;
  details?: string;
  specs?: Record<string, string>;
  category: string;
  stock: number;
  rating: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  role: string; // "USER" | "ADMIN" | "customer" | "admin"
}

export interface Order {
  id: number | string;
  orderNumber: string;
  date?: string;
  status: string; // "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  total?: number;
  totalAmount?: number;
  shippingFee?: number;
  shippingName?: string;
  shippingPhone?: string;
  shippingEmail?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  note?: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number | string;
  productId?: number;
  productName: string;
  productPrice?: number;
  price?: number;
  quantity: number;
  subtotal?: number;
  image?: string;
}

export interface Address {
  id: number | string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export interface CryptoPayment {
  paymentId: string;
  payAddress: string;
  payAmount: string;
  payCurrency: string;
  priceAmount: number;
  priceCurrency: string;
  status: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
}
