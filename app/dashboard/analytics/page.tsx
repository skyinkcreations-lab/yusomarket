"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useState } from "react";

import {
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaUndo,
} from "react-icons/fa";

/* ---------------------------------- DATA ---------------------------------- */

const salesData = [
  { day: "Mon", revenue: 420000, orders: 14 },
  { day: "Tue", revenue: 380000, orders: 11 },
  { day: "Wed", revenue: 520000, orders: 17 },
  { day: "Thu", revenue: 610000, orders: 21 },
  { day: "Fri", revenue: 450000, orders: 13 },
  { day: "Sat", revenue: 680000, orders: 22 },
  { day: "Sun", revenue: 500000, orders: 15 },
];

const categoryData = [
  { category: "Electronics", revenue: 6200000 },
  { category: "Fashion", revenue: 4100000 },
  { category: "Home", revenue: 2800000 },
  { category: "Beauty", revenue: 1900000 },
  { category: "Sports", revenue: 1600000 },
];

const orderStatusData = [
  { name: "Completed", value: 73 },
  { name: "Processing", value: 21 },
  { name: "Pending", value: 14 },
  { name: "Refunded", value: 4 },
];

const COLORS = ["#16a34a", "#2563eb", "#f59e0b", "#dc2626"];

/* ---------------------------------- PAGE ---------------------------------- */

export default function AnalyticsPage() {
  const stats = [
    {
      id: 1,
      label: "Total Sales",
      value: "Rp24.450.000",
      change: "+12.3%",
      positive: true,
      icon: <FaDollarSign />,
      gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    },
    {
      id: 2,
      label: "Orders",
      value: "118",
      change: "+5.1%",
      positive: true,
      icon: <FaShoppingCart />,
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
    },
    {
      id: 3,
      label: "Customers",
      value: "47",
      change: "+3",
      positive: true,
      icon: <FaUsers />,
      gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
    },
    {
      id: 4,
      label: "Refunds",
      value: "4",
      change: "-1.2%",
      positive: false,
      icon: <FaUndo />,
      gradient: "linear-gradient(135deg, #f43f5e, #fb7185)",
    },
  ];

  const [range, setRange] = useState("30");

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <h1 style={styles.title}>Analytics</h1>
      <p style={styles.subtitle}>
        Track your store performance with real charts and insights.
      </p>

      {/* Date Select */}
      <div style={styles.rangeWrap}>
        <label style={styles.label}>Date Range</label>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          style={styles.select}
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* KPI GRID */}
      <div style={styles.kpiGrid}>
        {stats.map((s) => (
          <div key={s.id} style={styles.kpiCard}>
            <div
              style={{
                ...styles.kpiIcon,
                background: s.gradient,
              }}
            >
              {s.icon}
            </div>

            <div style={styles.kpiLabel}>{s.label}</div>
            <div style={styles.kpiValue}>{s.value}</div>

            <div
              style={{
                ...styles.kpiChange,
                color: s.positive ? "#059669" : "#dc2626",
              }}
            >
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* SALES OVERVIEW */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Sales Overview</h2>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={salesData}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(v) => `Rp${v / 1000}k`} />
            <Tooltip formatter={(v) => `Rp${v.toLocaleString()}`} />
            <Legend />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#16a34a"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CATEGORY BAR */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Revenue by Category</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(v) => `Rp${v / 1_000_000}m`} />
            <Tooltip formatter={(v) => `Rp${v.toLocaleString()}`} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Orders by Status</h2>

        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={orderStatusData}
              dataKey="value"
              nameKey="name"
              outerRadius={110}
              label
            >
              {orderStatusData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------------------------------- STYLES ---------------------------------- */

const styles: any = {
  page: {
    padding: "24px",
    maxWidth: "1300px",
    margin: "0 auto",
  },

  title: {
    fontSize: 30,
    fontWeight: 700,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },

  rangeWrap: {
    marginBottom: 20,
  },

  label: {
    fontSize: 12,
    color: "#6b7280",
  },

  select: {
    marginTop: 4,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: 14,
  },

  /* KPI AREA */
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },

  kpiCard: {
    padding: 20,
    borderRadius: 14,
    background: "#ffffffaa",
    backdropFilter: "blur(6px)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },

  kpiIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    marginBottom: 10,
  },

  kpiLabel: { fontSize: 13, color: "#6b7280" },
  kpiValue: { fontSize: 26, fontWeight: 700, marginTop: 4 },
  kpiChange: { marginTop: 4, fontSize: 13 },

  /* CARDS */
  card: {
    padding: 24,
    borderRadius: 16,
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
    marginBottom: 30,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 14,
  },
};
