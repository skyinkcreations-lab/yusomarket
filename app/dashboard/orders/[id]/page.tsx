"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { FaArrowLeft, FaPrint, FaBoxOpen, FaUser, FaTruck } from "react-icons/fa";

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

type OrderItem = {
  name: string;
  sku: string;
  qty: number;
  price: string;
  total: string;
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

// Fake line items for each order
const ORDER_ITEMS: Record<number, OrderItem[]> = {
  1: [
    {
      name: "Wireless Earbuds",
      sku: "WRL-001",
      qty: 2,
      price: "$39.95",
      total: "$79.90",
    },
    {
      name: "Charging Case",
      sku: "CASE-010",
      qty: 1,
      price: "$50.00",
      total: "$50.00",
    },
  ],
  2: [
    {
      name: "Smart Fitness Watch",
      sku: "FIT-002",
      qty: 1,
      price: "$59.99",
      total: "$59.99",
    },
  ],
  3: [
    {
      name: "LED Desk Lamp",
      sku: "LAMP-003",
      qty: 3,
      price: "$29.99",
      total: "$89.97",
    },
    {
      name: "Wireless Earbuds",
      sku: "WRL-001",
      qty: 2,
      price: "$62.26",
      total: "$124.53",
    },
  ],
  4: [
    {
      name: "Tote Bag",
      sku: "BAG-040",
      qty: 1,
      price: "$39.99",
      total: "$39.99",
    },
  ],
};

// Dumb fake addresses – swap with real data later
const BILLING_ADDRESS: Record<number, string> = {
  1: "Emily Johnson\n123 Market Street\nSydney NSW 2000\nAustralia\nemily@example.com\n+61 400 000 001",
  2: "Liam Smith\n45 River Road\nBrisbane QLD 4000\nAustralia\nliam@example.com\n+61 400 000 002",
  3: "Olivia Brown\n89 Beach Avenue\nGold Coast QLD 4217\nAustralia\nolivia@example.com\n+61 400 000 003",
  4: "Noah Wilson\n12 Hilltop Lane\nMelbourne VIC 3000\nAustralia\nnoah@example.com\n+61 400 000 004",
};

const SHIPPING_ADDRESS: Record<number, string> = {
  1: BILLING_ADDRESS[1],
  2: BILLING_ADDRESS[2],
  3: BILLING_ADDRESS[3],
  4: BILLING_ADDRESS[4],
};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const action = searchParams.get("action");

  const orderId = Number(params.id);
  const order = ORDERS.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div style={{ padding: "30px" }}>
        <Link
          href="/dashboard/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#4b5563",
            textDecoration: "none",
            marginBottom: "16px",
          }}
        >
          <FaArrowLeft /> Back to Orders
        </Link>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          Order not found
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          This order ID doesn&apos;t exist in the current dataset.
        </p>
      </div>
    );
  }

  const items = ORDER_ITEMS[order.id] || [];

  // Extract numeric totals from strings just to fake a summary
  const subtotal = order.total;
  const shipping = "$9.90";
  const tax = "$0.00";
  const grandTotal = order.total;

  return (
    <div style={{ padding: "30px" }}>
      {/* Back link */}
      <div style={{ marginBottom: "14px" }}>
        <Link
          href="/dashboard/orders"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#4b5563",
            textDecoration: "none",
          }}
        >
          <FaArrowLeft /> Back to Orders
        </Link>
      </div>

      {/* Header row: title + meta + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Order {order.orderNumber}
          </h1>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            Placed on <strong>{order.date}</strong> •{" "}
            <span>Payment via {order.paymentMethod}</span>
          </div>
          <div style={{ marginTop: "8px" }}>
            <span style={statusBadgeStyle(order.status)}>
              {statusLabel(order.status)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {action === "refund" && (
            <span
              style={{
                fontSize: "11px",
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "4px 8px",
                borderRadius: "999px",
                border: "1px solid #fecaca",
              }}
            >
              Refund flow (UI only) – wire to Stripe/Supabase later.
            </span>
          )}
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 10px",
              fontSize: "12px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              background: "#f9fafb",
              cursor: "pointer",
            }}
          >
            <FaPrint />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Main layout: 2 columns – left content, right sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1fr)",
          gap: "18px",
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Top summary cards: General / Billing / Shipping */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {/* General */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "12px 14px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaBoxOpen /> Order summary
              </div>
              <div style={{ marginBottom: "4px" }}>
                <strong>Total:</strong> {order.total}
              </div>
              <div style={{ marginBottom: "4px" }}>
                <strong>Items:</strong> {order.items}
              </div>
              <div>
                <strong>Payment method:</strong> {order.paymentMethod}
              </div>
            </div>

            {/* Billing */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "12px 14px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaUser /> Billing details
              </div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  color: "#4b5563",
                }}
              >
                {BILLING_ADDRESS[order.id] || "No billing address on file."}
              </pre>
            </div>

            {/* Shipping */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "12px 14px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <FaTruck /> Shipping details
              </div>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  color: "#4b5563",
                }}
              >
                {SHIPPING_ADDRESS[order.id] || "No shipping address on file."}
              </pre>
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Shipping method: Standard (3–7 business days)
              </div>
            </div>
          </div>

          {/* Order items table */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Items
            </div>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                overflow: "hidden",
                fontSize: "13px",
              }}
            >
              {/* Header row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr",
                  background: "#f9fafb",
                  padding: "8px 10px",
                  borderBottom: "1px solid #e5e7eb",
                  fontWeight: 600,
                  color: "#4b5563",
                }}
              >
                <div>Item</div>
                <div>SKU</div>
                <div>Qty</div>
                <div style={{ textAlign: "right" }}>Total</div>
              </div>

              {/* Rows */}
              {items.length === 0 ? (
                <div
                  style={{
                    padding: "12px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  No line items for this order.
                </div>
              ) : (
                items.map((item, index) => (
                  <div
                    key={`${item.sku}-${index}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr",
                      padding: "8px 10px",
                      borderBottom:
                        index === items.length - 1
                          ? "none"
                          : "1px solid #f3f4f6",
                      background: index % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <div>
                      <div>{item.name}</div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          marginTop: "2px",
                        }}
                      >
                        Price: {item.price}
                      </div>
                    </div>
                    <div>{item.sku}</div>
                    <div>{item.qty}</div>
                    <div style={{ textAlign: "right" }}>{item.total}</div>
                  </div>
                ))
              )}
            </div>

            {/* Totals summary */}
            <div
              style={{
                marginTop: "12px",
                marginLeft: "auto",
                maxWidth: "260px",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span>Subtotal:</span>
                <span>{subtotal}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span>Shipping:</span>
                <span>{shipping}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span>Tax:</span>
                <span>{tax}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "6px",
                  paddingTop: "6px",
                  borderTop: "1px solid #e5e7eb",
                  fontWeight: 600,
                }}
              >
                <span>Total:</span>
                <span>{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN – actions / notes */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Order actions / status */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "12px 14px",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Order actions
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#6b7280",
                  marginBottom: "4px",
                }}
              >
                Order status
              </label>
              <select
                defaultValue={order.status}
                style={{
                  width: "100%",
                  height: "34px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  padding: "4px 8px",
                }}
              >
                <option value="pending">Pending payment</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "4px",
                  border: "1px solid #e5e7eb",
                  background: "#111827",
                  color: "#ffffff",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Update status
              </button>
              <button
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "4px",
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  color: "#374151",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Mark as Processing
              </button>
              <button
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "4px",
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  color: "#374151",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Mark as Completed
              </button>
              <button
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: "4px",
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Refund order (UI only)
              </button>
            </div>
          </div>

          {/* Order notes / timeline (dummy) */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              padding: "12px 14px",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "10px",
              }}
            >
              Order notes
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: "12px",
                color: "#4b5563",
              }}
            >
              <li style={{ marginBottom: "8px" }}>
                <strong>2025-11-23 14:22</strong> – Payment received via{" "}
                {order.paymentMethod}.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>2025-11-23 15:03</strong> – Order status changed to{" "}
                {statusLabel(order.status)}.
              </li>
              <li>
                <strong>Internal note:</strong> Add tracking number + carrier
                once shipped.
              </li>
            </ul>

            <div style={{ marginTop: "10px" }}>
              <textarea
                placeholder="Add a private note for this order…"
                style={{
                  width: "100%",
                  minHeight: "70px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  fontSize: "12px",
                  padding: "6px 8px",
                  resize: "vertical",
                }}
              />
              <button
                style={{
                  marginTop: "6px",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Add note (UI only)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------- helpers ------- */

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
