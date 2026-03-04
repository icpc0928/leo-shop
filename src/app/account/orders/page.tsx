"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { useAuthStore } from "@/stores/authStore";
import { orderAPI } from "@/lib/api";
import { useTranslations } from "next-intl";
import { ArrowLeft, ChevronDown, ChevronUp, CreditCard, XCircle, PackageCheck } from "lucide-react";
import { Order } from "@/types";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING:    { label: "待處理", bg: "bg-amber-50",   text: "text-amber-600" },
  PAID:       { label: "已付款", bg: "bg-emerald-50", text: "text-emerald-600" },
  CONFIRMED:  { label: "已確認", bg: "bg-blue-50",    text: "text-blue-600" },
  PROCESSING: { label: "處理中", bg: "bg-yellow-50",  text: "text-yellow-600" },
  SHIPPED:    { label: "已出貨", bg: "bg-indigo-50",  text: "text-indigo-600" },
  DELIVERED:  { label: "已送達", bg: "bg-teal-50",    text: "text-teal-600" },
  COMPLETED:  { label: "已完成", bg: "bg-emerald-50", text: "text-emerald-600" },
  CANCELLED:  { label: "已取消", bg: "bg-red-50",     text: "text-red-500" },
};

export default function OrdersPage() {
  const t = useTranslations("account");
  const router = useRouter();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn) { router.push("/account/login"); return; }
    fetchOrders();
  }, [isLoggedIn, router]);

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getMyOrders();
      setOrders(data.content || []);
    } catch {
      console.warn("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("確定要取消此訂單嗎？")) return;
    setCancelling(id);
    try {
      await orderAPI.cancel(id);
      await fetchOrders();
    } catch {
      alert("取消訂單失敗");
    } finally {
      setCancelling(null);
    }
  };

  const handleGoPayment = (order: Order) => {
    if (order.cryptoPaymentId) {
      router.push(`/checkout/crypto/${order.cryptoPaymentId}`);
    }
  };

  if (!isLoggedIn) return null;

  const getOrderDate = (order: Order) => {
    const d = order.createdAt?.split("T")[0] || order.date || "";
    return d;
  };
  const getOrderTotal = (order: Order) => order.totalAmount || order.total || 0;
  const getItemPrice = (item: Order["items"][0]) => item.productPrice || item.price || 0;

  const isCrypto = (order: Order) =>
    order.paymentMethod === "CRYPTO_DIRECT" || order.paymentMethod === "CRYPTO";

  return (
    <Container>
      <div className="max-w-3xl mx-auto py-16">
        <Link href="/account" className="inline-flex items-center gap-1 text-sm text-base-content/50 hover:text-base-content mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("backToAccount")}
        </Link>
        <h1 className="text-2xl font-serif mb-8">{t("myOrders")}</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 && (
              <p className="text-center text-base-content/40 py-16">目前沒有訂單</p>
            )}
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const isExpanded = expanded === String(order.id);

              return (
                <div key={order.id} className="card bg-base-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => setExpanded(isExpanded ? null : String(order.id))}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-base-200/50 transition-colors"
                  >
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm items-center">
                      <span className="font-mono font-medium text-xs">{order.orderNumber}</span>
                      <span className="text-base-content/50 text-xs">{getOrderDate(order)}</span>
                      <span>
                        <span className={`inline-block min-w-[60px] text-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </span>
                      <span className="font-medium text-right">NT${getOrderTotal(order).toLocaleString()}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-base-content/40 ml-2" /> : <ChevronDown className="w-4 h-4 text-base-content/40 ml-2" />}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-base-200">
                      {/* Order Info */}
                      <div className="p-4 grid grid-cols-2 gap-4 text-xs text-base-content/60">
                        <div>
                          <span className="font-medium text-base-content/80">付款方式：</span>
                          {isCrypto(order) ? "加密貨幣" : "貨到付款"}
                        </div>
                        {order.shippingFee !== undefined && (
                          <div>
                            <span className="font-medium text-base-content/80">運費：</span>
                            {Number(order.shippingFee) === 0 ? "免運" : `NT$${Number(order.shippingFee).toLocaleString()}`}
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      <div className="px-4 pb-4 space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 text-sm">
                            <div className="w-12 h-12 bg-base-200 rounded flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-base-content/50 text-xs">x{item.quantity}</p>
                            </div>
                            <p className="font-medium tabular-nums">
                              NT${(getItemPrice(item) * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {(order.status === "PENDING" || order.status === "SHIPPED") && (
                        <div className="border-t border-base-200 p-4 flex items-center justify-end gap-2">
                          {/* PENDING: Go to payment (crypto) */}
                          {order.status === "PENDING" && isCrypto(order) && order.cryptoPaymentId && (
                            <button
                              onClick={() => handleGoPayment(order)}
                              className="px-4 py-2 rounded-full text-xs font-medium bg-primary text-primary-content hover:brightness-110 transition-colors inline-flex items-center gap-1.5"
                            >
                              <CreditCard size={14} />
                              前往付款
                            </button>
                          )}

                          {/* PENDING: Cancel order */}
                          {order.status === "PENDING" && (
                            <button
                              onClick={() => handleCancel(Number(order.id))}
                              disabled={cancelling === Number(order.id)}
                              className="px-4 py-2 rounded-full text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors inline-flex items-center gap-1.5"
                            >
                              {cancelling === Number(order.id) ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : (
                                <XCircle size={14} />
                              )}
                              取消訂單
                            </button>
                          )}

                          {/* SHIPPED: Confirm received */}
                          {order.status === "SHIPPED" && (
                            <button
                              onClick={() => {/* TODO: confirm received API */}}
                              className="px-4 py-2 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5"
                            >
                              <PackageCheck size={14} />
                              確認收貨
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
