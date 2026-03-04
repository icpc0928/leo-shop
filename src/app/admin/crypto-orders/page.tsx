"use client";

import { useState, useEffect } from "react";
import { adminCryptoOrderAPI } from "@/lib/api";
import type { CryptoOrder } from "@/types";
import { ExternalLink } from "lucide-react";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending:  { label: "待驗證", bg: "bg-amber-50",  text: "text-amber-600" },
  verified: { label: "已驗證", bg: "bg-emerald-50", text: "text-emerald-600" },
  failed:   { label: "失敗",   bg: "bg-red-50",     text: "text-red-500" },
  manual:   { label: "已確認", bg: "bg-blue-50",    text: "text-blue-600" },
};

export default function AdminCryptoOrdersPage() {
  const [orders, setOrders] = useState<CryptoOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const data = await adminCryptoOrderAPI.getAll();
      setOrders(Array.isArray(data) ? data : data.content || []);
    } catch {
      console.warn("Failed to fetch crypto orders");
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

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-base-content/60 text-xs uppercase tracking-wider">
                  <th>訂單 ID</th>
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
                      <td className="font-mono text-sm text-base-content/70">#{order.orderId}</td>
                      <td>
                        <span className="font-medium">{order.symbol}</span>
                        <span className="text-xs text-base-content/40 ml-1">({order.network})</span>
                      </td>
                      <td className="text-right tabular-nums font-medium">{order.expectedAmount}</td>
                      <td className="font-mono text-xs">
                        {order.txHash ? (
                          txUrl ? (
                            <a href={txUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline">
                              {order.txHash.slice(0, 12)}…
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <span className="text-base-content/60">{order.txHash.slice(0, 16)}…</span>
                          )
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
    </div>
  );
}
