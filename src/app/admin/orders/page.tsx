"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mockOrders, type AdminOrder } from "@/lib/adminMockData";
import { adminOrderAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import React from "react";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "待處理", bg: "bg-amber-50", text: "text-amber-600" },
  PAID: { label: "已確認", bg: "bg-blue-50", text: "text-blue-600" },
  PROCESSING: { label: "處理中", bg: "bg-yellow-50", text: "text-yellow-600" },
  CONFIRMED: { label: "已確認", bg: "bg-blue-50", text: "text-blue-600" },
  SHIPPED: { label: "已出貨", bg: "bg-indigo-50", text: "text-indigo-600" },
  DELIVERED: { label: "已送達", bg: "bg-emerald-50", text: "text-emerald-600" },
  COMPLETED: { label: "已完成", bg: "bg-emerald-50", text: "text-emerald-600" },
  CANCELLED: { label: "已取消", bg: "bg-red-50", text: "text-red-500" },
};

const allStatuses = ["all", "PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const;
const tabLabels: Record<string, string> = {
  all: "全部", PENDING: "待處理", PAID: "已確認", PROCESSING: "處理中", SHIPPED: "已出貨", COMPLETED: "已完成", CANCELLED: "已取消",
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
  paymentMethod?: string;
  cryptoPaymentId?: string;
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
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get("orderNumber");

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(orderNumberParam || "");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, pageSize, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: {
        status?: string;
        orderNumber?: string;
        startDate?: string;
        endDate?: string;
        page: number;
        size: number;
      } = { page: currentPage, size: pageSize };
      
      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery) params.orderNumber = searchQuery;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const data = await adminOrderAPI.getAll(params);
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch {
      console.warn('Admin API unavailable, using mock orders');
      const mapped: OrderData[] = mockOrders.map((o) => ({
        ...o,
        items: o.items.map((item, i) => ({ ...item, id: i })),
      }));
      setOrders(statusFilter === "all" ? mapped : mapped.filter((o) => o.status === statusFilter));
      setTotalPages(1);
      setTotalElements(mapped.length);
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

  const handleSearch = () => {
    setCurrentPage(0);
    fetchOrders();
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };

  const getOrderName = (order: OrderData) => order.customerName || order.shippingName || '-';
  const getOrderDate = (order: OrderData) => order.createdAt?.split('T')[0] || order.date || '';
  const getOrderTotal = (order: OrderData) => order.totalAmount || order.total || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">訂單管理</h1>

      {/* 篩選區域 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-wrap items-end gap-3">
            {/* 搜尋框 */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-base-content/60 mb-1 block">訂單編號</label>
              <input
                type="text"
                placeholder="搜尋訂單編號..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="input input-bordered w-full input-sm"
              />
            </div>

            {/* 開始日期 */}
            <div className="min-w-[140px]">
              <label className="text-xs text-base-content/60 mb-1 block">開始日期</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input input-bordered w-full input-sm"
              />
            </div>

            {/* 結束日期 */}
            <div className="min-w-[140px]">
              <label className="text-xs text-base-content/60 mb-1 block">結束日期</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input input-bordered w-full input-sm"
              />
            </div>

            {/* 每頁筆數 */}
            <div className="min-w-[120px]">
              <label className="text-xs text-base-content/60 mb-1 block">每頁筆數</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="select select-bordered w-full select-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>

            {/* 搜尋按鈕 */}
            <button onClick={handleSearch} className="btn btn-primary btn-sm">
              搜尋
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed w-fit">
        {allStatuses.map((s) => (
          <button key={s} role="tab"
            className={`tab ${statusFilter === s ? "tab-active" : ""}`}
            onClick={() => { setStatusFilter(s); setCurrentPage(0); }}
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
        <>
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
                    {orders.map((order) => {
                      return (
                        <React.Fragment key={order.id}>
                          <tr 
                            className="cursor-pointer hover"
                            tabIndex={0} 
                            role="button" 
                            aria-expanded={expandedId === String(order.id)}
                            onClick={() => setExpandedId(expandedId === String(order.id) ? null : String(order.id))}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedId(expandedId === String(order.id) ? null : String(order.id)); } }}
                          >
                            <td className="font-mono text-sm">{order.orderNumber}</td>
                            <td>{getOrderName(order)}</td>
                            <td className="text-base-content/50">{formatDate(getOrderDate(order))}</td>
                            <td className="text-right font-medium tabular-nums">{formatCurrency(getOrderTotal(order))}</td>
                            <td>
                              {statusConfig[order.status] ? (
                                <span className={`inline-block min-w-[60px] px-3 py-1.5 rounded-full text-xs font-medium text-center ${statusConfig[order.status].bg} ${statusConfig[order.status].text}`}>
                                  {statusConfig[order.status].label}
                                </span>
                              ) : (
                                <span className="inline-block min-w-[60px] px-3 py-1.5 rounded-full text-xs font-medium text-center bg-gray-100 text-gray-600">
                                  {order.status}
                                </span>
                              )}
                            </td>
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
                                  {(order.paymentMethod === "CRYPTO_DIRECT" || order.paymentMethod === "CRYPTO") && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="text-base-content/50">付款方式：</span>
                                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-600">加密貨幣</span>
                                      {order.cryptoPaymentId && (
                                        <Link href={`/admin/crypto-orders?orderNumber=${order.orderNumber}`}
                                          className="text-primary text-xs hover:underline">
                                          查看加密訂單 →
                                        </Link>
                                      )}
                                    </div>
                                  )}
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
                                  <div className="flex items-center flex-wrap gap-2">
                                    <span className="text-sm text-base-content/50">更改狀態：</span>
                                    {(["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const).map((s) => {
                                      const cfg = statusConfig[s];
                                      if (!cfg) return null;
                                      const isActive = order.status === s;
                                      return (
                                        <button key={s} onClick={(e) => { e.stopPropagation(); updateStatus(order.id, s); }}
                                          disabled={isActive}
                                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                            isActive
                                              ? `${cfg.bg} ${cfg.text} opacity-50 cursor-not-allowed`
                                              : "bg-base-200 text-base-content/60 hover:bg-base-300"
                                          }`}>
                                          {cfg.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 分頁導航 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-base-content/60">
                共 {totalElements} 筆 | 第 {currentPage + 1} / {totalPages} 頁
              </div>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                >
                  上一頁
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum = i;
                  if (totalPages > 5) {
                    if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`join-item btn btn-sm ${currentPage === pageNum ? 'btn-active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  className="join-item btn btn-sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  下一頁
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
