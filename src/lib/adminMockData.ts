export const dashboardStats = [
  {
    title: "總營收",
    value: "NT$128,500",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: "DollarSign" as const,
  },
  {
    title: "本月訂單",
    value: "56",
    unit: "筆",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: "ShoppingCart" as const,
  },
  {
    title: "商品數量",
    value: "24",
    change: "+2",
    changeType: "positive" as const,
    icon: "Package" as const,
  },
  {
    title: "會員數量",
    value: "189",
    change: "+15.3%",
    changeType: "positive" as const,
    icon: "Users" as const,
  },
];

export const revenueChartData = [
  { date: "2/5", revenue: 15200 },
  { date: "2/6", revenue: 18600 },
  { date: "2/7", revenue: 12400 },
  { date: "2/8", revenue: 22100 },
  { date: "2/9", revenue: 19800 },
  { date: "2/10", revenue: 24500 },
  { date: "2/11", revenue: 15900 },
];

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  total: number;
  status: "processing" | "shipped" | "completed" | "cancelled";
  items: {
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  shippingAddress: string;
}

export const mockOrders: AdminOrder[] = [
  {
    id: "o1",
    orderNumber: "LS-20260211-001",
    customerName: "王小明",
    customerEmail: "wang@example.com",
    customerPhone: "0912-111-222",
    date: "2026-02-11",
    total: 3860,
    status: "processing",
    items: [
      { name: "Ceramic Vase", price: 1280, quantity: 1, image: "https://picsum.photos/seed/vase1/60/60" },
      { name: "Scented Candle", price: 680, quantity: 2, image: "https://picsum.photos/seed/candle1/60/60" },
      { name: "Wooden Coaster Set", price: 520, quantity: 1, image: "https://picsum.photos/seed/coaster1/60/60" },
    ],
    shippingAddress: "台北市大安區忠孝東路四段100號",
  },
  {
    id: "o2",
    orderNumber: "LS-20260210-002",
    customerName: "李美玲",
    customerEmail: "lee@example.com",
    customerPhone: "0923-333-444",
    date: "2026-02-10",
    total: 2570,
    status: "shipped",
    items: [
      { name: "Linen Tote Bag", price: 890, quantity: 1, image: "https://picsum.photos/seed/bag1/60/60" },
      { name: "Minimalist Wall Clock", price: 1680, quantity: 1, image: "https://picsum.photos/seed/clock1/60/60" },
    ],
    shippingAddress: "新北市板橋區文化路一段50號",
  },
  {
    id: "o3",
    orderNumber: "LS-20260209-003",
    customerName: "張大偉",
    customerEmail: "chang@example.com",
    customerPhone: "0934-555-666",
    date: "2026-02-09",
    total: 1480,
    status: "completed",
    items: [
      { name: "Cotton Throw Blanket", price: 1480, quantity: 1, image: "https://picsum.photos/seed/blanket1/60/60" },
    ],
    shippingAddress: "台中市西屯區台灣大道三段200號",
  },
  {
    id: "o4",
    orderNumber: "LS-20260208-004",
    customerName: "陳雅琪",
    customerEmail: "chen@example.com",
    customerPhone: "0945-777-888",
    date: "2026-02-08",
    total: 1370,
    status: "completed",
    items: [
      { name: "Leather Card Holder", price: 750, quantity: 1, image: "https://picsum.photos/seed/card1/60/60" },
      { name: "Glass Water Bottle", price: 620, quantity: 1, image: "https://picsum.photos/seed/bottle1/60/60" },
    ],
    shippingAddress: "高雄市前鎮區中華五路500號",
  },
  {
    id: "o5",
    orderNumber: "LS-20260207-005",
    customerName: "林志豪",
    customerEmail: "lin@example.com",
    customerPhone: "0956-999-000",
    date: "2026-02-07",
    total: 2960,
    status: "processing",
    items: [
      { name: "Brass Pen Holder", price: 980, quantity: 2, image: "https://picsum.photos/seed/pen1/60/60" },
      { name: "Woven Storage Basket", price: 860, quantity: 1, image: "https://picsum.photos/seed/basket1/60/60" },
    ],
    shippingAddress: "台南市東區大學路一段1號",
  },
  {
    id: "o6",
    orderNumber: "LS-20260206-006",
    customerName: "黃雅芳",
    customerEmail: "huang@example.com",
    customerPhone: "0967-111-333",
    date: "2026-02-06",
    total: 890,
    status: "cancelled",
    items: [
      { name: "Linen Tote Bag", price: 890, quantity: 1, image: "https://picsum.photos/seed/bag1/60/60" },
    ],
    shippingAddress: "桃園市中壢區中大路300號",
  },
  {
    id: "o7",
    orderNumber: "LS-20260205-007",
    customerName: "吳建宏",
    customerEmail: "wu@example.com",
    customerPhone: "0978-222-444",
    date: "2026-02-05",
    total: 4440,
    status: "shipped",
    items: [
      { name: "Minimalist Wall Clock", price: 1680, quantity: 1, image: "https://picsum.photos/seed/clock1/60/60" },
      { name: "Ceramic Vase", price: 1280, quantity: 1, image: "https://picsum.photos/seed/vase1/60/60" },
      { name: "Cotton Throw Blanket", price: 1480, quantity: 1, image: "https://picsum.photos/seed/blanket1/60/60" },
    ],
    shippingAddress: "新竹市東區光復路二段101號",
  },
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "customer";
  registeredAt: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
}

export const mockUsers: AdminUser[] = [
  { id: "u1", name: "Admin", email: "admin@leoshop.com", phone: "0900-000-000", role: "admin", registeredAt: "2025-12-01", isActive: true, totalOrders: 0, totalSpent: 0 },
  { id: "u2", name: "王小明", email: "wang@example.com", phone: "0912-111-222", registeredAt: "2026-01-05", role: "customer", isActive: true, totalOrders: 5, totalSpent: 12800 },
  { id: "u3", name: "李美玲", email: "lee@example.com", phone: "0923-333-444", registeredAt: "2026-01-10", role: "customer", isActive: true, totalOrders: 3, totalSpent: 8500 },
  { id: "u4", name: "張大偉", email: "chang@example.com", phone: "0934-555-666", registeredAt: "2026-01-12", role: "customer", isActive: true, totalOrders: 7, totalSpent: 21000 },
  { id: "u5", name: "陳雅琪", email: "chen@example.com", phone: "0945-777-888", registeredAt: "2026-01-15", role: "customer", isActive: true, totalOrders: 2, totalSpent: 3200 },
  { id: "u6", name: "林志豪", email: "lin@example.com", phone: "0956-999-000", registeredAt: "2026-01-18", role: "customer", isActive: false, totalOrders: 1, totalSpent: 1680 },
  { id: "u7", name: "黃雅芳", email: "huang@example.com", phone: "0967-111-333", registeredAt: "2026-01-22", role: "customer", isActive: true, totalOrders: 4, totalSpent: 9600 },
  { id: "u8", name: "吳建宏", email: "wu@example.com", phone: "0978-222-444", registeredAt: "2026-01-25", role: "customer", isActive: true, totalOrders: 6, totalSpent: 15800 },
  { id: "u9", name: "劉怡君", email: "liu@example.com", phone: "0989-333-555", registeredAt: "2026-02-01", role: "customer", isActive: true, totalOrders: 2, totalSpent: 4200 },
  { id: "u10", name: "趙志遠", email: "zhao@example.com", phone: "0910-444-666", registeredAt: "2026-02-05", role: "customer", isActive: false, totalOrders: 0, totalSpent: 0 },
];
