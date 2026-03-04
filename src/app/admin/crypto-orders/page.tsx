"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { adminCryptoOrderAPI } from "@/lib/api";
import type { CryptoOrder } from "@/types";
import { ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending:  { label: "待驗證", bg: "bg-amber-50",  text: "text-amber-600" },
  verified: { label: "已驗證", bg: "bg-emerald-50", text: "text-emerald-600" },
  failed:   { label: "失敗",   bg: "bg-red-50",     text: "text-red-500" },
  manual:   { label: "已確認", bg: "bg-blue-50",    text: "text-blue-600" },
};

const allStatuses = ["all", "pending", "verified", "failed", "manual"] as const;
const statusLabels: Record<string, string> = {
  all: "全部", pending: "待驗證", verified: "已驗證", failed: "失敗", manual: "已確認",
};

export default function AdminCryptoOrdersPage() {
  const searchParams = useSearchParams();
  const highlightOrderNumber = searchParams.get("orderNumber");

  const [orders, setOrders] = useState<CryptoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(highlightOrderNumber || "");
  const [searchType, setSearchType] = useState<"orderNumber" | "txHash">("orderNumber");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, pageSize, currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: {
        status?: string;
        orderNumber?: string;
        txHash?: string;
        startDate?: string;
        endDate?: string;
        page: number;
        size: number;
      } = { page: currentPage, size: pageSize };

      if (statusFilter !== "all") params.status = statusFilter;
      if (searchQuery) {
        if (searchType === "orderNumber") {
          params.orderNumber = searchQuery;
        } else {
          params.txHash = searchQuery;
        }
      }
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await adminCryptoOrderAPI.getAll(params);
      setOrders(Array.isArray(data) ? data : data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch {
      console.warn("Failed to fetch crypto orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: "verify" | "confirm" | "reject") => {
    try {
      await adminCryptoOrderAPI[action](id);
      await fetchOrders();
    } catch {
      console.warn(`${action} failed`);
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

  const handleCopyHash = async (id: number, hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch { /* ignore */ }
  };

  const getTxUrl = (order: CryptoOrder) => {
    if (!order.txHash || !order.explorerUrl) return null;
    return order.explorerUrl.replace("{hash}", order.txHash);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">加密訂單</h1>

      {/* 篩選區域 */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-wrap items-end gap-3">
            {/* 搜尋類型選擇 */}
            <div className="min-w-[120px]">
              <label className="text-xs text-base-content/60 mb-1 block">搜尋類型</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as "orderNumber" | "txHash")}
                className="select select-bordered w-full select-sm"
              >
                <option value="orderNumber">訂單編號</option>
                <option value="txHash">TX Hash</option>
              </select>
            </div>

            {/* 搜尋框 */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-base-content/60 mb-1 block">
                {searchType === "orderNumber" ? "訂單編號" : "TX Hash"}
              </label>
              <input
                type="text"
                placeholder={searchType === "orderNumber" ? "搜尋訂單編號..." : "搜尋 TX Hash..."}
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

      {/* 狀態篩選 Tabs */}
      <div role="tablist" className="tabs tabs-boxed w-fit">
        {allStatuses.map((s) => (
          <button key={s} role="tab"
            className={`tab ${statusFilter === s ? "tab-active" : ""}`}
            onClick={() => { setStatusFilter(s); setCurrentPage(0); }}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-base-content/60 text-xs uppercase tracking-wider">
                  <th>關聯訂單</th>
                  <th>幣種</th>
                  <th className="text-right">應付金額</th>
                  <th>TX Hash</th>
                  <th className="text-center">狀態</th>
                  <th>時間</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-base-content/40 py-16">尚無加密訂單</td></tr>
                )}
                {orders.map((order) => {
                  const status = statusConfig[order.verifyStatus] || statusConfig.pending;
                  const txUrl = getTxUrl(order);
                  return (
                    <tr key={order.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="font-mono text-sm">
                        <Link href={`/admin/orders?orderNumber=${order.orderNumber || ''}`}
                          className="text-primary hover:underline">
                          {order.orderNumber || `#${order.orderId}`}
                        </Link>
                      </td>
                      <td>
                        <span className="font-medium">{order.symbol}</span>
                        <span className="text-xs text-base-content/40 ml-1">({order.network})</span>
                      </td>
                      <td className="text-right tabular-nums font-medium">{order.expectedAmount}</td>
                      <td className="font-mono text-xs">
                        {order.txHash ? (
                          <span className="inline-flex items-center gap-1">
                            {txUrl ? (
                              <a href={txUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline">
                                {order.txHash.slice(0, 12)}…
                                <ExternalLink size={11} />
                              </a>
                            ) : (
                              <span className="text-base-content/60">{order.txHash.slice(0, 16)}…</span>
                            )}
                            <button
                              onClick={() => handleCopyHash(order.id, order.txHash!)}
                              className="p-0.5 rounded hover:bg-base-200 transition-colors text-base-content/40 hover:text-base-content/70"
                              title="複製 TX Hash"
                            >
                              {copiedId === order.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                          </span>
                        ) : (
                          <span className="text-base-content/25">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className={`inline-block min-w-[72px] px-3 py-1.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="text-xs text-base-content/50">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString("zh-TW") : "—"}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.verifyStatus === "pending" && order.txHash && (
                            <button onClick={() => handleAction(order.id, "verify")}
                              className="px-3 py-1.5 rounded-full text-xs font-medium bg-base-200 text-base-content/70 hover:bg-base-300 transition-colors">
                              驗證
                            </button>
                          )}
                          {order.verifyStatus !== "verified" && (
                            <>
                              <button onClick={() => handleAction(order.id, "confirm")}
                                className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                                {order.verifyStatus === "failed" ? "重新確認" : "確認"}
                              </button>
                              {order.verifyStatus !== "failed" && (
                                <button onClick={() => handleAction(order.id, "reject")}
                                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                  拒絕
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
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

    </div>
  );
}
