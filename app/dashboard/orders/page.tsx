"use client";

import { useState } from "react";
import Link from "next/link";
import { FaSearch, FaFilter, FaEye, FaUndoAlt } from "react-icons/fa";

type OrderStatus = "all" | "pending" | "processing" | "completed" | "refunded";

type Order = {
  id: number;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  customer: string;
  total: string;
  items: number;
  paymentMethod: string;
};

const ORDERS: Order[] = [
  {
    id: 1,
    orderNumber: "#1001",
    date: "2025-11-23 14:21",
    status: "completed",
    customer: "Emily Johnson",
    total: "$129.90",
    items: 3,
    paymentMethod: "Credit Card",
  },
  {
    id: 2,
    orderNumber: "#1002",
    date: "2025-11-23 13:05",
    status: "processing",
    customer: "Liam Smith",
    total: "$59.99",
    items: 1,
    paymentMethod: "PayPal",
  },
  {
    id: 3,
    orderNumber: "#1003",
    date: "2025-11-22 19:40",
    status: "pending",
    customer: "Olivia Brown",
    total: "$214.50",
    items: 5,
    paymentMethod: "Credit Card",
  },
  {
    id: 4,
    orderNumber: "#1004",
    date: "2025-11-22 10:12",
    status: "refunded",
    customer: "Noah Wilson",
    total: "$39.99",
    items: 1,
    paymentMethod: "Afterpay",
  },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("month_to_date");
  const [showType, setShowType] = useState("all_orders");

  const filteredOrders = ORDERS.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ? true : order.status === statusFilter;

    const searchLower = search.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      order.orderNumber.toLowerCase().includes(searchLower) ||
      order.customer.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const totalOrders = ORDERS.length;
  const netSales = "$444.38";
  const avgOrderValue = "$111.09";
  const itemsSold = ORDERS.reduce((sum, o) => sum + o.items, 0);

  return (
    <div style={{ padding: "30px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 600,
            marginBottom: "4px",
          }}
        >
          Orders
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          Track your marketplace orders, payments, and fulfilment status.
        </p>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Total Orders */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: "8px",
            }}
          >
            Total Orders
          </div>
          <div style={{ fontSize: "22px", fontWeight: 600 }}>{totalOrders}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
            Month to date
          </div>
        </div>

        {/* Net Sales */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: "8px",
            }}
          >
            Net Sales
          </div>
          <div style={{ fontSize: "22px", fontWeight: 600 }}>{netSales}</div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px" }}>
            +12% vs last period
          </div>
        </div>

        {/* Average Order Value */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: "8px",
            }}
          >
            Avg. Order Value
          </div>
          <div style={{ fontSize: "22px", fontWeight: 600 }}>
            {avgOrderValue}
          </div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
            Based on completed orders
          </div>
        </div>

        {/* Items Sold */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: "8px",
            }}
          >
            Items Sold
          </div>
          <div style={{ fontSize: "22px", fontWeight: 600 }}>{itemsSold}</div>
          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
            Across all orders
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        {/* Date range */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", color: "#6b7280" }}>
            Date range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              height: "32px",
              fontSize: "13px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              minWidth: "220px",
            }}
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last_7">Last 7 days</option>
            <option value="month_to_date">Month to date</option>
            <option value="last_30">Last 30 days</option>
          </select>
        </div>

        {/* Show type */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "11px", color: "#6b7280" }}>Show</label>
          <select
            value={showType}
            onChange={(e) => setShowType(e.target.value)}
            style={{
              height: "32px",
              fontSize: "13px",
              padding: "4px 8px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              minWidth: "160px",
            }}
          >
            <option value="all_orders">All orders</option>
          </select>
        </div>

        {/* Search */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div style={{ position: "relative", width: "220px" }}>
            <FaSearch
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px",
                color: "#9ca3af",
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders or customers…"
              style={{
                width: "100%",
                height: "32px",
                padding: "4px 8px 4px 26px",
                fontSize: "13px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
          </div>

          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              height: "32px",
              padding: "0 10px",
              fontSize: "12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
            }}
          >
            <FaFilter style={{ fontSize: "11px" }} />
            More filters
          </button>
        </div>
      </div>

      {/* STATUS PILLS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {(
          [
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "processing", label: "Processing" },
            { key: "completed", label: "Completed" },
            { key: "refunded", label: "Refunded" },
          ] as { key: OrderStatus; label: string }[]
        ).map((status) => {
          const active = statusFilter === status.key;
          return (
            <button
              key={status.key}
              onClick={() => setStatusFilter(status.key)}
              style={{
                padding: "4px 10px",
                fontSize: "12px",
                borderRadius: "999px",
                border: active ? "1px solid #111827" : "1px solid #d1d5db",
                background: active ? "#111827" : "#ffffff",
                color: active ? "#ffffff" : "#374151",
                cursor: "pointer",
              }}
            >
              {status.label}
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "40px 120px 150px 120px 1fr 120px 120px 110px",
            padding: "10px 12px",
            background: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            fontSize: "12px",
            fontWeight: 600,
            color: "#4b5563",
          }}
        >
          <div>
            <input type="checkbox" />
          </div>
          <div>Order</div>
          <div>Date</div>
          <div>Status</div>
          <div>Customer</div>
          <div>Total</div>
          <div>Payment</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>

        {/* Rows */}
        {filteredOrders.length === 0 ? (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            No orders match your filters.
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <div
              key={order.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "40px 120px 150px 120px 1fr 120px 120px 110px",
                padding: "10px 12px",
                fontSize: "13px",
                alignItems: "center",
                background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <input type="checkbox" />
              </div>

              <div style={{ fontWeight: 500 }}>{order.orderNumber}</div>

              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                {order.date}
              </div>

              <div>
                <span style={statusBadgeStyle(order.status)}>
                  {statusLabel(order.status)}
                </span>
              </div>

              <div>{order.customer}</div>

              <div>{order.total}</div>

              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                {order.paymentMethod}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  color: "#4b5563",
                }}
              >
                <Link href={`/dashboard/orders/${order.id}`}>
                  <FaEye
                    style={{
                      cursor: "pointer",
                      fontSize: "13px",
                    }}
                  />
                </Link>

                <Link href={`/dashboard/orders/${order.id}?action=refund`}>
                  <FaUndoAlt
                    style={{
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#b91c1c",
                    }}
                  />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* HELPERS */
function statusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending payment";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "refunded":
      return "Refunded";
    default:
      return "Unknown";
  }
}

function statusBadgeStyle(status: OrderStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 500,
    borderWidth: "1px",
    borderStyle: "solid",
  };

  switch (status) {
    case "pending":
      return {
        ...base,
        background: "#fef3c7",
        borderColor: "#facc15",
        color: "#92400e",
      };
    case "processing":
      return {
        ...base,
        background: "#dbeafe",
        borderColor: "#3b82f6",
        color: "#1d4ed8",
      };
    case "completed":
      return {
        ...base,
        background: "#dcfce7",
        borderColor: "#22c55e",
        color: "#166534",
      };
    case "refunded":
      return {
        ...base,
        background: "#fee2e2",
        borderColor: "#ef4444",
        color: "#991b1b",
      };
    default:
      return {
        ...base,
        background: "#e5e7eb",
        borderColor: "#9ca3af",
        color: "#374151",
      };
  }
}
