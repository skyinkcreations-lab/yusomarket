// app/dashboard/customers/[id]/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft, FaEye } from "react-icons/fa";

type OrderStatus = "pending" | "processing" | "completed" | "refunded";

type Order = {
  id: number;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: string;
};

type Customer = {
  id: number;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  city: string;
  country: string;
  joinedAt: string;
  lastActive: string;
  device: string;
  avatarInitials: string;
  totalOrders: number;
  totalSpent: string;
  avgOrderValue: string;
  totalItems: number;
  tags: string[];
  notes: string;
  orders: Order[];
  discountUsage: {
    code: string;
    timesUsed: number;
    lastUsed: string;
    value: string;
  }[];
  communications: {
    id: number;
    date: string;
    channel: "Email" | "WhatsApp" | "Phone";
    summary: string;
  }[];
};

// --- DUMMY DATA (static for now) ---

const CUSTOMERS: Customer[] = [
  {
    id: 1,
    code: "CUST-001",
    name: "Jordan Lee",
    email: "jordan@example.com",
    phone: "+62 812-4455-3911",
    status: "active",
    city: "Jakarta",
    country: "Indonesia",
    joinedAt: "2025-01-12",
    lastActive: "2025-11-23 14:21",
    device: "Android · Chrome",
    avatarInitials: "JL",
    totalOrders: 12,
    totalSpent: "Rp2.450.000",
    avgOrderValue: "≈ Rp204.000",
    totalItems: 34,
    tags: ["VIP", "Repeat buyer", "High value"],
    notes:
      "Loves electronics and sports equipment. Responds well to weekend promos and free shipping offers.",
    orders: [
      {
        id: 1,
        orderNumber: "#1001",
        date: "2025-11-23 14:21",
        status: "completed",
        total: "$129.90",
      },
      {
        id: 2,
        orderNumber: "#1002",
        date: "2025-11-23 13:05",
        status: "processing",
        total: "$59.99",
      },
      {
        id: 3,
        orderNumber: "#1003",
        date: "2025-11-22 19:40",
        status: "pending",
        total: "$214.50",
      },
    ],
    discountUsage: [
      {
        code: "WELCOME10",
        timesUsed: 1,
        lastUsed: "2025-02-01",
        value: "10% off",
      },
      {
        code: "FREESHIPID",
        timesUsed: 3,
        lastUsed: "2025-10-18",
        value: "Free shipping",
      },
    ],
    communications: [
      {
        id: 1,
        date: "2025-11-10 09:30",
        channel: "Email",
        summary: "Order confirmation and shipping details sent.",
      },
      {
        id: 2,
        date: "2025-10-05 16:12",
        channel: "WhatsApp",
        summary: "Answered question about return policy and warranty.",
      },
      {
        id: 3,
        date: "2025-09-21 11:05",
        channel: "Phone",
        summary: "Resolved delayed delivery issue with courier.",
      },
    ],
  },
  // You can add more customers here later
];

// --- HELPERS ---

function statusBadgeStyle(status: OrderStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 500,
    borderWidth: "1px",
    borderStyle: "solid",
    textTransform: "capitalize",
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

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const idParam = params?.id;

  const customer = useMemo(() => {
    const numericId =
      typeof idParam === "string" ? parseInt(idParam, 10) : NaN;
    if (!isNaN(numericId)) {
      return CUSTOMERS.find((c) => c.id === numericId) ?? CUSTOMERS[0];
    }
    return CUSTOMERS[0];
  }, [idParam]);

  // Local-only notes (A option) – not persisted anywhere
  const [notes, setNotes] = useState<string>(customer.notes);

  if (!customer) {
    // Should never hit because of fallback above, but just in case
    return (
      <div style={{ padding: "30px" }}>
        <button
          onClick={() => router.push("/dashboard/customers")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#4b5563",
            marginBottom: "16px",
          }}
        >
          <FaArrowLeft /> Back to customers
        </button>
        <h1 style={{ fontSize: "22px", fontWeight: 600 }}>Customer not found</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      {/* BACK LINK */}
      <button
        onClick={() => router.push("/dashboard/customers")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "#4b5563",
          marginBottom: "16px",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <FaArrowLeft />
        <span>Back to customers</span>
      </button>

      {/* TOP HEADER CARD */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          padding: "18px 20px",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "999px",
            background: "#e5edff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "20px",
            color: "#1d4ed8",
          }}
        >
          {customer.avatarInitials}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {customer.name}
            </h1>
            <span
              style={{
                padding: "3px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 500,
                background:
                  customer.status === "active" ? "#dcfce7" : "#fee2e2",
                color: customer.status === "active" ? "#166534" : "#991b1b",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              {customer.status}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              fontSize: "13px",
              color: "#4b5563",
            }}
          >
            <span>{customer.email}</span>
            <span>•</span>
            <span>{customer.phone}</span>
            <span>•</span>
            <span>{customer.city}</span>
            <span style={{ color: "#9ca3af" }}>ID: {customer.code}</span>
          </div>
        </div>
      </div>

      {/* METRIC CARDS ROW */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>Total Orders</div>
          <div style={metricValueStyle}>{customer.totalOrders}</div>
          <div style={metricSubStyle}>Across all time</div>
        </div>

        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>Total Spent</div>
          <div style={metricValueStyle}>{customer.totalSpent}</div>
          <div style={metricSubStyle}>All completed orders</div>
        </div>

        <div style={metricCardStyle}>
          <div style={metricLabelStyle}>Average Order Value</div>
          <div style={metricValueStyle}>{customer.avgOrderValue}</div>
          <div style={metricSubStyle}>{customer.totalItems} items purchased</div>
        </div>
      </div>

      {/* MAIN GRID: LEFT + RIGHT COLUMNS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.4fr)",
          gap: "18px",
          marginBottom: "26px",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Customer details */}
          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>Customer details</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                rowGap: "10px",
                columnGap: "20px",
                fontSize: "13px",
              }}
            >
              <DetailItem label="Email" value={customer.email} />
              <DetailItem label="Phone" value={customer.phone} />
              <DetailItem
                label="Location"
                value={`${customer.city}, ${customer.country}`}
              />
              <DetailItem label="Customer ID" value={customer.code} />
              <DetailItem label="Member since" value={customer.joinedAt} />
              <DetailItem label="Last active" value={customer.lastActive} />
              <DetailItem label="Device" value={customer.device} />
            </div>
          </section>

          {/* Tags & segments */}
          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>Tags & segments</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {customer.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* Internal notes – local only (A) */}
          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>Internal notes</h2>
            <p
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "8px",
              }}
            >
              Only your team can see these notes. Use them to remember preferences,
              issues and follow-ups.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                padding: "8px 10px",
                fontSize: "13px",
                resize: "vertical",
              }}
            />
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                // Local-only "save" just keeps state (already done)
                onClick={() => void 0}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #111827",
                  background: "#111827",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Save note (local only)
              </button>
              <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                Not connected to database yet.
              </span>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Lifetime value breakdown */}
          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>Lifetime value</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                rowGap: "10px",
                columnGap: "18px",
                fontSize: "13px",
              }}
            >
              <DetailItem label="Total spent" value={customer.totalSpent} />
              <DetailItem
                label="Avg. order value"
                value={customer.avgOrderValue}
              />
              <DetailItem
                label="Total orders"
                value={customer.totalOrders.toString()}
              />
              <DetailItem
                label="Items purchased"
                value={customer.totalItems.toString()}
              />
            </div>
          </section>

          {/* Communication log */}
          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>Communication log</h2>
            {customer.communications.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#6b7280" }}>
                No communication recorded yet.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {customer.communications.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      fontSize: "13px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "2px",
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>{c.channel}</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>
                        {c.date}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#4b5563" }}>
                      {c.summary}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Discount usage */}
          <section style={sectionCardStyle}>
            <h2 style={sectionTitleStyle}>Discount & coupon usage</h2>
            {customer.discountUsage.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#6b7280" }}>
                No vouchers or discount codes used yet.
              </p>
            ) : (
              <div
                style={{
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 80px 1fr 90px",
                    padding: "8px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: "#f9fafb",
                    color: "#4b5563",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <div>Code</div>
                  <div>Used</div>
                  <div>Last used</div>
                  <div>Value</div>
                </div>
                {customer.discountUsage.map((d, idx) => (
                  <div
                    key={d.code}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 80px 1fr 90px",
                      padding: "8px 10px",
                      fontSize: "12px",
                      background: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                      borderBottom:
                        idx === customer.discountUsage.length - 1
                          ? "none"
                          : "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: "11px",
                      }}
                    >
                      {d.code}
                    </div>
                    <div>{d.timesUsed}x</div>
                    <div>{d.lastUsed}</div>
                    <div>{d.value}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <section>
        <h2
          style={{
            fontSize: "15px",
            fontWeight: 600,
            marginBottom: "10px",
          }}
        >
          Recent Orders
        </h2>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 180px 140px 1fr 80px",
              padding: "10px 12px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: "12px",
              fontWeight: 600,
              color: "#4b5563",
            }}
          >
            <div>Order</div>
            <div>Date</div>
            <div>Status</div>
            <div>Total</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {customer.orders.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              No orders found for this customer yet.
            </div>
          ) : (
            customer.orders.map((order, index) => (
              <div
                key={order.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 180px 140px 1fr 80px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  alignItems: "center",
                  background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                  borderBottom:
                    index === customer.orders.length - 1
                      ? "none"
                      : "1px solid #f3f4f6",
                }}
              >
                <div style={{ fontWeight: 500 }}>{order.orderNumber}</div>
                <div style={{ fontSize: "12px", color: "#6b7280" }}>
                  {order.date}
                </div>
                <div>
                  <span style={statusBadgeStyle(order.status)}>
                    {order.status}
                  </span>
                </div>
                <div>{order.total}</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <FaEye
                      style={{
                        cursor: "pointer",
                        fontSize: "13px",
                        color: "#4b5563",
                      }}
                    />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

// --- SMALL REUSABLE PIECES ---

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "11px",
          color: "#6b7280",
          marginBottom: "2px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "13px", color: "#111827" }}>{value}</div>
    </div>
  );
}

// shared metric/section styles
const metricCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  padding: "12px 14px",
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  textTransform: "uppercase",
  color: "#6b7280",
  marginBottom: "6px",
};

const metricValueStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
};

const metricSubStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#9ca3af",
  marginTop: "3px",
};

const sectionCardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  padding: "14px 16px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  marginBottom: "10px",
};
