"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import { mockOrders, type AdminOrder } from "@/lib/adminMockData";
import { adminOrderAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import React from "react";

const statusColors: Record<string, string> = {
  PENDING: "badge-warning",
  CONFIRMED: "badge-info",
  SHIPPED: "badge-info",
  DELIVERED: "badge-success",
  COMPLETED: "badge-success",
  CANCELLED: "badge-error",
  processing: "badge-warning",
  shipped: "badge-info",
  completed: "badge-success",
  cancelled: "badge-error",
};

const statusLabels: Record<string, string> = {
  PENDING: "待處理",
  CONFIRMED: "已確認",
  SHIPPED: "已出貨",
  DELIVERED: "已送達",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  processing: "處理中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
};

const allStatuses = ["all", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
const tabLabels: Record<string, string> = {
  all: "全部", PENDING: "待處理", CONFIRMED: "已確認", SHIPPED: "已出貨", DELIVERED: "已送達", CANCELLED: "已取消",
};

interface OrderData {
  id: number | string;
  orderNumber: string;
  status: string;
  totalAmount?: number;
  total?: number;
  shippingName?: string;
  shippingPhone?: string;
  shippingEmail?: string;
  shippingAddress?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt?: string;
  date?: string;
  items: {
    id?: number | string;
    productName?: string;
    name?: string;
    productPrice?: number;
    price?: number;
    quantity: number;
    image?: string;
  }[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: { status?: string; size?: number } = { size: 50 };
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await adminOrderAPI.getAll(params);
      setOrders(data.content);
    } catch {
      console.warn('Admin API unavailable, using mock orders');
      const mapped: OrderData[] = mockOrders.map((o) => ({
        ...o,
        items: o.items.map((item, i) => ({ ...item, id: i })),
      }));
      setOrders(statusFilter === "all" ? mapped : mapped.filter((o) => o.status === statusFilter));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string | number, newStatus: string) => {
    try {
      await adminOrderAPI.updateStatus(Number(orderId), newStatus);
      await fetchOrders();
    } catch {
      console.warn('Admin API unavailable, using local state');
      setOrders((prev) => prev.map((o) => (String(o.id) === String(orderId) ? { ...o, status: newStatus } : o)));
    }
  };

  const getOrderName = (order: OrderData) => order.customerName || order.shippingName || '-';
  const getOrderDate = (order: OrderData) => order.createdAt?.split('T')[0] || order.date || '';
  const getOrderTotal = (order: OrderData) => order.totalAmount || order.total || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">訂單管理</h1>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed w-fit">
        {allStatuses.map((s) => (
          <button key={s} role="tab"
            className={`tab ${statusFilter === s ? "tab-active" : ""}`}
            onClick={() => setStatusFilter(s)}
          >
            {tabLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>訂單編號</th><th>客戶</th><th>日期</th>
                    <th className="text-right">金額</th><th>狀態</th><th className="w-[50px]" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr className="cursor-pointer hover" tabIndex={0} role="button" aria-expanded={expandedId === String(order.id)}
                        onClick={() => setExpandedId(expandedId === String(order.id) ? null : String(order.id))}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(expandedId === String(order.id) ? null : String(order.id)); } }}>
                        <td className="font-mono text-sm">{order.orderNumber}</td>
                        <td>{getOrderName(order)}</td>
                        <td className="text-base-content/50">{formatDate(getOrderDate(order))}</td>
                        <td className="text-right font-medium tabular-nums">{formatCurrency(getOrderTotal(order))}</td>
                        <td><span className={`badge ${statusColors[order.status] || "badge-ghost"} badge-sm`}>{statusLabels[order.status] || order.status}</span></td>
                        <td>{expandedId === String(order.id) ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}</td>
                      </tr>
                      {expandedId === String(order.id) && (
                        <tr key={`${order.id}-detail`}>
                          <td colSpan={6} className="bg-base-200 p-0">
                            <div className="p-6 space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold mb-2">客戶資訊</h4>
                                <div className="text-sm text-base-content/60 space-y-1">
                                  <p>{getOrderName(order)} / {order.shippingPhone || order.customerPhone || '-'}</p>
                                  <p>{order.shippingEmail || order.customerEmail || '-'}</p>
                                  <p>{order.shippingAddress || '-'}</p>
                                </div>
                              </div>
                              <div className="divider my-0" />
                              <div>
                                <h4 className="text-sm font-semibold mb-2">商品明細</h4>
                                <div className="space-y-2">
                                  {order.items.map((item, i) => (
                                    <div key={item.id || i} className="flex items-center gap-3">
                                      {item.image && <Image src={item.image} alt={item.productName || item.name || ''} width={40} height={40} className="rounded" />}
                                      <span className="text-sm flex-1">{item.productName || item.name}</span>
                                      <span className="text-sm text-base-content/50">x{item.quantity}</span>
                                      <span className="text-sm font-medium tabular-nums">{formatCurrency((item.productPrice || item.price || 0) * item.quantity)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="divider my-0" />
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-base-content/50">更改狀態：</span>
                                {(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const).map((s) => (
                                  <button key={s} onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s); }}
                                    disabled={order.status === s}
                                    className={`btn btn-xs ${order.status === s ? "btn-disabled" : "btn-outline"}`}>
                                    {statusLabels[s]}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
