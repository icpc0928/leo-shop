"use client";

import { useState, useEffect } from "react";
import { adminCryptoOrderAPI } from "@/lib/api";
import type { CryptoOrder } from "@/types";
import { ExternalLink } from "lucide-react";

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "待驗證", class: "badge-warning" },
  verified: { label: "已驗證", class: "badge-success" },
  failed: { label: "失敗", class: "badge-error" },
  manual: { label: "人工處理", class: "badge-info" },
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
                <tr>
                  <th>訂單 ID</th>
                  <th>幣種</th>
                  <th className="text-right">應付金額</th>
                  <th>TX Hash</th>
                  <th>狀態</th>
                  <th>時間</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-base-content/50 py-8">尚無加密訂單</td></tr>
                )}
                {orders.map((order) => {
                  const status = statusConfig[order.verifyStatus] || statusConfig.pending;
                  const txUrl = getTxUrl(order);
                  return (
                    <tr key={order.id}>
                      <td className="font-mono text-sm">#{order.orderId}</td>
                      <td>{order.symbol} <span className="text-xs text-base-content/50">({order.network})</span></td>
                      <td className="text-right tabular-nums">{order.expectedAmount}</td>
                      <td className="font-mono text-xs max-w-[150px] truncate">
                        {order.txHash ? (
                          txUrl ? (
                            <a href={txUrl} target="_blank" rel="noopener noreferrer" className="link link-primary inline-flex items-center gap-1">
                              {order.txHash.slice(0, 10)}…
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span>{order.txHash.slice(0, 16)}…</span>
                          )
                        ) : (
                          <span className="text-base-content/30">—</span>
                        )}
                      </td>
                      <td><span className={`badge ${status.class} badge-sm`}>{status.label}</span></td>
                      <td className="text-xs text-base-content/50">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString("zh-TW") : "—"}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {order.verifyStatus === "pending" && order.txHash && (
                            <button onClick={() => handleAction(order.id, "verify")} className="btn btn-outline btn-xs">驗證</button>
                          )}
                          {(order.verifyStatus === "pending" || order.verifyStatus === "manual") && (
                            <>
                              <button onClick={() => handleAction(order.id, "confirm")} className="btn btn-success btn-xs">確認</button>
                              <button onClick={() => handleAction(order.id, "reject")} className="btn btn-error btn-xs">拒絕</button>
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
