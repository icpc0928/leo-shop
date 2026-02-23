"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";
import { orderAPI } from "@/lib/api";
import { useTranslations } from "next-intl";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { Order } from "@/types";

const mockOrders: Order[] = [
  {
    id: 1, orderNumber: "LS-20260201-001", createdAt: "2026-02-01", status: "COMPLETED", totalAmount: 3980,
    items: [
      { id: 1, productName: "手工陶瓷花瓶", price: 1980, quantity: 1, image: "/images/products/product-1.jpg" },
      { id: 2, productName: "天然香氛蠟燭", price: 680, quantity: 2, image: "/images/products/product-2.jpg" },
      { id: 3, productName: "棉麻桌布", price: 640, quantity: 1, image: "/images/products/product-3.jpg" },
    ],
  },
  {
    id: 2, orderNumber: "LS-20260205-002", createdAt: "2026-02-05", status: "SHIPPED", totalAmount: 2560,
    items: [
      { id: 4, productName: "北歐風置物架", price: 2560, quantity: 1, image: "/images/products/product-4.jpg" },
    ],
  },
  {
    id: 3, orderNumber: "LS-20260210-003", createdAt: "2026-02-10", status: "PENDING", totalAmount: 1280,
    items: [
      { id: 5, productName: "手工皮革筆記本", price: 640, quantity: 2, image: "/images/products/product-5.jpg" },
    ],
  },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  // legacy lowercase
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  PENDING: "待處理",
  CONFIRMED: "已確認",
  PROCESSING: "處理中",
  SHIPPED: "已出貨",
  DELIVERED: "已送達",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  processing: "處理中",
  shipped: "已出貨",
  completed: "已完成",
};

export default function OrdersPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/account/login"); return; }
    (async () => {
      try {
        const data = await orderAPI.getMyOrders();
        setOrders(data.content);
      } catch {
        console.warn('API unavailable, using mock orders');
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;

  const getOrderDate = (order: Order) => order.createdAt?.split('T')[0] || order.date || '';
  const getOrderTotal = (order: Order) => order.totalAmount || order.total || 0;
  const getItemPrice = (item: Order['items'][0]) => item.productPrice || item.price || 0;

  return (
    <Container>
      <div className="max-w-3xl mx-auto py-16">
        <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("backToAccount")}
        </Link>
        <h1 className="text-2xl font-serif mb-8">{t("myOrders")}</h1>
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 && <p className="text-center text-muted py-12">目前沒有訂單</p>}
            {orders.map((order) => (
              <div key={order.id} className="border border-border">
                <button
                  onClick={() => setExpanded(expanded === String(order.id) ? null : String(order.id))}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <span className="font-medium">{order.orderNumber}</span>
                    <span className="text-muted">{getOrderDate(order)}</span>
                    <span>
                      <span className={`px-2 py-0.5 text-xs rounded ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </span>
                    <span className="font-medium">NT${getOrderTotal(order).toLocaleString()}</span>
                  </div>
                  {expanded === String(order.id) ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </button>
                {expanded === String(order.id) && (
                  <div className="border-t border-border p-4 space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 text-sm">
                        <div className="w-12 h-12 bg-gray-100 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-muted">x{item.quantity}</p>
                        </div>
                        <p className="font-medium">NT${(getItemPrice(item) * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
