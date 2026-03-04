"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp } from "lucide-react";
import { dashboardStats as mockDashboardStats, revenueChartData as mockRevenueData, mockOrders } from "@/lib/adminMockData";
import { adminDashboardAPI, adminOrderAPI } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  PENDING: { label: "待處理", bg: "bg-amber-50", text: "text-amber-600" },
  PAID: { label: "已付款", bg: "bg-emerald-50", text: "text-emerald-600" },
  PROCESSING: { label: "處理中", bg: "bg-yellow-50", text: "text-yellow-600" },
  CONFIRMED: { label: "已確認", bg: "bg-blue-50", text: "text-blue-600" },
  SHIPPED: { label: "已出貨", bg: "bg-indigo-50", text: "text-indigo-600" },
  DELIVERED: { label: "已送達", bg: "bg-emerald-50", text: "text-emerald-600" },
  COMPLETED: { label: "已完成", bg: "bg-emerald-50", text: "text-emerald-600" },
  CANCELLED: { label: "已取消", bg: "bg-red-50", text: "text-red-500" },
  processing: { label: "處理中", bg: "bg-yellow-50", text: "text-yellow-600" },
  shipped: { label: "已出貨", bg: "bg-indigo-50", text: "text-indigo-600" },
  completed: { label: "已完成", bg: "bg-emerald-50", text: "text-emerald-600" },
  cancelled: { label: "已取消", bg: "bg-red-50", text: "text-red-500" },
};

interface DashboardStat {
  title: string;
  value: string;
  unit?: string;
  change: string;
  changeType: "positive" | "negative";
  icon: string;
}

interface RevenueData {
  date: string;
  revenue: number;
}

interface RecentOrder {
  id: string | number;
  orderNumber: string;
  customerName?: string;
  shippingName?: string;
  date?: string;
  createdAt?: string;
  total?: number;
  totalAmount?: number;
  status: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStat[]>(mockDashboardStats);
  const [revenueData, setRevenueData] = useState<RevenueData[]>(mockRevenueData);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>(mockOrders.slice(0, 5));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, revenueRes, ordersRes] = await Promise.all([
          adminDashboardAPI.getStats(),
          adminDashboardAPI.getRevenue(),
          adminOrderAPI.getAll({ size: 5 }),
        ]);
        setStats([
          { title: "總營收", value: `NT$${Number(statsData.totalRevenue).toLocaleString()}`, change: "", changeType: "positive", icon: "DollarSign" },
          { title: "總訂單", value: String(statsData.totalOrders), unit: "筆", change: "", changeType: "positive", icon: "ShoppingCart" },
          { title: "商品數量", value: String(statsData.totalProducts), change: "", changeType: "positive", icon: "Package" },
          { title: "會員數量", value: String(statsData.totalUsers), change: "", changeType: "positive", icon: "Users" },
        ]);
        setRevenueData(revenueRes.map((r: { date: string; revenue: number }) => ({
          date: r.date.slice(5), // "02-05" -> "2/5"
          revenue: r.revenue,
        })));
        setRecentOrders(ordersRes.content);
      } catch {
        console.warn('Admin API unavailable, using mock data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon] || DollarSign;
          return (
            <div key={stat.title} className="stat bg-base-100 rounded-box shadow-sm">
              <div className="stat-figure text-primary">
                <Icon className="w-6 h-6" />
              </div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value text-2xl">
                {stat.value}
                {stat.unit && <span className="text-sm font-normal text-base-content/50 ml-1">{stat.unit}</span>}
              </div>
              {stat.change && (
                <div className="stat-desc flex items-center gap-1 text-success">
                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                  {stat.change} vs 上月
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base">營收趨勢（近 7 天）</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "營收"]} />
                <Line type="monotone" dataKey="revenue" stroke="oklch(var(--p))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title text-base">最近訂單</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>訂單編號</th>
                  <th>客戶</th>
                  <th>日期</th>
                  <th className="text-right">金額</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-sm">{order.orderNumber}</td>
                    <td>{order.customerName || order.shippingName || '-'}</td>
                    <td className="text-base-content/50">{formatDate(order.createdAt?.split('T')[0] || order.date || '')}</td>
                    <td className="text-right font-medium tabular-nums">{formatCurrency(order.totalAmount || order.total || 0)}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
