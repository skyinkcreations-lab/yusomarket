"use client";

import {
  FaDollarSign,
  FaShoppingCart,
  FaBoxOpen,
  FaEye,
  FaPlusCircle,
  FaListAlt,
  FaStore,
  FaCog,
} from "react-icons/fa";

export default function DashboardPage() {
  const kpis = [
    {
      id: 1,
      label: "Total Orders",
      value: "4",
      sub: "Month to date",
      trend: "+12%",
      trendPositive: true,
      icon: <FaShoppingCart />,
      color: "rgba(59,130,246,0.15)",
      iconColor: "#3b82f6",
    },
    {
      id: 2,
      label: "Net Sales",
      value: "$444.38",
      sub: "+12% vs last period",
      trend: "+12%",
      trendPositive: true,
      icon: <FaDollarSign />,
      color: "rgba(16,185,129,0.15)",
      iconColor: "#10b981",
    },
    {
      id: 3,
      label: "Avg. Order Value",
      value: "$111.09",
      sub: "Based on completed orders",
      trend: "+3%",
      trendPositive: true,
      icon: <FaBoxOpen />,
      color: "rgba(139,92,246,0.15)",
      iconColor: "#8b5cf6",
    },
    {
      id: 4,
      label: "Items Sold",
      value: "10",
      sub: "Across all orders",
      trend: "+8%",
      trendPositive: true,
      icon: <FaEye />,
      color: "rgba(236,72,153,0.15)",
      iconColor: "#ec4899",
    },
  ];

  const quickActions = [
    {
      id: 1,
      label: "Add New Product",
      desc: "Create a new listing and publish it.",
      icon: <FaPlusCircle />,
      href: "/dashboard/products/add",
      color: "#3b82f6",
    },
    {
      id: 2,
      label: "Manage Products",
      desc: "Edit stock, pricing & visibility.",
      icon: <FaListAlt />,
      href: "/dashboard/products",
      color: "#8b5cf6",
    },
    {
      id: 3,
      label: "View Storefront",
      desc: "See how your store appears to customers.",
      icon: <FaStore />,
      href: "/store/your-vendor-slug",
      color: "#10b981",
    },
    {
      id: 4,
      label: "Store Settings",
      desc: "Update store info, logo & shipping.",
      icon: <FaCog />,
      href: "/dashboard/settings",
      color: "#f59e0b",
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        width: "100%",
        maxWidth: "1250px",
        margin: "0 auto",
      }}
    >
      {/* PAGE HEADER */}
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 800,
          textAlign: "center",
          marginBottom: "8px",
        }}
      >
        Vendor Dashboard
      </h1>

      <p
        style={{
          fontSize: "15px",
          color: "#6b7280",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        Welcome back! Here's your store performance at a glance.
      </p>

      {/* KPI GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "22px",
          marginBottom: "50px",
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
              borderRadius: "16px",
              padding: "22px",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.03)",
              transition: "0.25s",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: kpi.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: kpi.iconColor,
                marginBottom: "12px",
              }}
            >
              {kpi.icon}
            </div>

            <div style={{ fontSize: "15px", fontWeight: 600 }}>
              {kpi.label}
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                marginTop: "6px",
              }}
            >
              {kpi.value}
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#6b7280",
                marginTop: "4px",
              }}
            >
              {kpi.sub}
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "13px",
                fontWeight: 700,
                color: kpi.trendPositive ? "#16a34a" : "#dc2626",
              }}
            >
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS HEADER */}
      <h2
        style={{
          fontSize: "24px",
          fontWeight: 700,
          marginBottom: "8px",
          textAlign: "center",
        }}
      >
        Quick Actions
      </h2>

      <p
        style={{
          fontSize: "14px",
          color: "#6b7280",
          textAlign: "center",
          marginBottom: "26px",
        }}
      >
        Take control of your store fast.
      </p>

      {/* QUICK ACTIONS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {quickActions.map((action) => (
          <a
            key={action.id}
            href={action.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "18px",
              background: "#fff",
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.04), 0 2px 3px rgba(0,0,0,0.03)",
              textDecoration: "none",
              transition: "0.25s",
            }}
          >
            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "12px",
                background: action.color + "22",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: action.color,
                fontSize: "22px",
              }}
            >
              {action.icon}
            </div>

            <div>
              <div style={{ fontSize: "15px", fontWeight: 700 }}>
                {action.label}
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>
                {action.desc}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
