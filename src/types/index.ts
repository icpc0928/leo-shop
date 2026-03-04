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
  cryptoPaymentId?: string;
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

export interface PaymentMethod {
  id: number;
  name: string;
  symbol: string;
  network: string;
  contractAddress?: string;
  walletAddress: string;
  exchangeRate: number;
  rateSource: string;
  gateway: string;
  explorerUrl?: string;
  iconUrl?: string;
  enabled: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CryptoOrder {
  id: number;
  orderId: number;
  orderNumber?: string;
  paymentMethodId: number;
  symbol: string;
  network: string;
  expectedAmount: number;
  actualAmount?: number;
  walletAddress: string;
  txHash?: string;
  verifyStatus: "pending" | "verified" | "failed" | "manual";
  verifyMessage?: string;
  contractAddress?: string;
  explorerUrl?: string;
  createdAt?: string;
  paidAt?: string;
  verifiedAt?: string;
}
