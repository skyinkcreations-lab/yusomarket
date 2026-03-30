"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import {
  Loader2,
  Package,
  User2,
  MapPin,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  StickyNote,
} from "lucide-react";

const supabase = supabaseBrowser();

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type ToastState = { type: "success" | "error"; message: string } | null;

type OrderItem = {
  id: string;
  product_id: string | null;
  variation_id: string | null;
  product_name: string | null;
  thumbnail_url: string | null;
  quantity: number;
  unit_price: number | null;
  total_price: number | null;
};

type OrderRecord = {
  id: string;
  order_number: string | null;
  user_id: string;
  vendor_id: string;
  status: OrderStatus | string;
  total_amount: number | null;
  subtotal_amount: number | null;
  shipping_cost: number | null;
  currency: string | null;
  total: number | null; // legacy
  created_at: string;

  processing_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  refunded_at: string | null;

  tracking_number: string | null;
  vendor_notes: string | null;
  customer_notes: string | null;
  cancellation_reason: string | null;

  customer_name: string | null;
  customer_email: string | null;
  shipping_address: string | null;

  shipping_address_json?: {
  line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
};

  order_items?: OrderItem[];
};

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function formatMoney(amount: number | null | undefined, currency = "AUD") {
  if (amount == null) return "-";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency,
  }).format(amount);
}

const statusMeta: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Pending",
    bg: "rgba(251, 191, 36, 0.1)",
    text: "#92400e",
    border: "#fbbf24",
  },
  processing: {
    label: "Processing",
    bg: "rgba(59,130,246,0.08)",
    text: "#1d4ed8",
    border: "#60a5fa",
  },
  shipped: {
    label: "Shipped",
    bg: "rgba(34,197,94,0.08)",
    text: "#15803d",
    border: "#4ade80",
  },
  delivered: {
    label: "Delivered",
    bg: "rgba(22,163,74,0.08)",
    text: "#166534",
    border: "#22c55e",
  },
  cancelled: {
    label: "Cancelled",
    bg: "rgba(239,68,68,0.08)",
    text: "#b91c1c",
    border: "#f97373",
  },
  refunded: {
    label: "Refunded",
    bg: "rgba(56,189,248,0.08)",
    text: "#0e7490",
    border: "#38bdf8",
  },
};

export default function VendorOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = typeof params?.id === "string" ? params.id : null;
const orderId = rawId?.trim();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 11px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 13,
  };

  const sectionCard: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: 18,
  };

  // ---------------------------------------------
  // LOAD ORDER
  // ---------------------------------------------
useEffect(() => {
  if (!orderId) return;

  const load = async () => {
    try {
      setLoading(true);
      setToast(null);

      // 🔥 STEP 2 — ADD THIS HERE
      console.log("ACTUAL PARAM ID:", orderId);
      console.log("MATCH CHECK:", {
        param: orderId,
        matchesExpected: orderId === "YM-97673001-c621",
      });

      const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          router.push("/login");
          return;
        }

        const { data: vendor } = await supabase
          .from("vendors")
          .select("id")
          .eq("user_id", auth.user.id)
          .maybeSingle();

        if (!vendor) {
          router.push("/sell");
          return;
        }

// DEBUG STEP 1 — check order exists WITHOUT vendor filter
const { data: testOrder } = await supabase
  .from("orders")
  .select("order_number, vendor_id")
  .eq("order_number", orderId)
  .maybeSingle();

console.log("STEP 1 ORDER CHECK:", testOrder);

// DEBUG STEP 2 — check vendor id
console.log("STEP 2 VENDOR:", vendor.id);

// ORIGINAL QUERY
const { data, error } = await supabase
  .from("orders")
  .select(`
    *,
    order_items (
      id,
      quantity,
      unit_price,
      total_price,
      products (
        name,
        thumbnail_url
      )
    )
  `)
  .eq("order_number", orderId)
  .maybeSingle();

console.log("STEP 3 FINAL QUERY:", { data, error });

        if (error || !data) {
          console.error("Order load debug:", {
  error,
  data,
  orderId,
  vendorId: vendor.id,
});
          setToast({
            type: "error",
            message: "Unable to load this order.",
          });
          return;
        }

        const formatted = {
  ...data,
  order_items: data.order_items?.map((i: any) => ({
    ...i,
    product_name: i.products?.name,
    thumbnail_url: i.products?.thumbnail_url,
  })),
};

setOrder(formatted);
setTrackingNumber(formatted.tracking_number || "");
setVendorNotes(formatted.vendor_notes || "");
setCustomerNotes(formatted.customer_notes || "");
setCancelReason(formatted.cancellation_reason || "");
      } catch (err) {
        console.error(err);
        setToast({
          type: "error",
          message: "Unexpected error loading order.",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // ---------------------------------------------
  // UPDATE HELPER
  // ---------------------------------------------
  const applyPatch = async (
  patch: any,
  action?: "processing" | "shipped" | "delivered" | "cancel" | "refund" | "tracking" | "notes"
) => {
    if (!order) return;
    setSaving(true);
    setToast(null);

    try {
      const res = await fetch("/api/vendor/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.order_number,
          patch,
          action,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update order.");
      }

      const data = await res.json();
      const updated: OrderRecord | null = data.order ?? null;

      if (updated) {
  setOrder(updated);
  setTrackingNumber(updated.tracking_number || "");
  setVendorNotes(updated.vendor_notes || "");
  setCustomerNotes(updated.customer_notes || "");
  setCancelReason(updated.cancellation_reason || "");
}


      setToast({
        type: "success",
        message: "Order updated.",
      });
    } catch (err: any) {
      console.error(err);
      setToast({
        type: "error",
        message: err?.message || "Unexpected error.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTracking = () => {
    void applyPatch(
      { tracking_number: trackingNumber || null },
      "tracking"
    );
  };

  const handleSaveNotes = () => {
    void applyPatch(
      {
        vendor_notes: vendorNotes || null,
        customer_notes: customerNotes || null,
      },
      "notes"
    );
  };

  const handleStatusChange = (next: OrderStatus) => {
  if (next === "processing" || next === "shipped" || next === "delivered") {
    void applyPatch({}, next);
  }

  if (next === "cancelled") handleCancel();
  if (next === "refunded") handleRefund();
};


  const handleCancel = () => {
    if (!cancelReason.trim()) {
      setToast({
        type: "error",
        message: "Add a cancellation reason first.",
      });
      return;
    }
    void applyPatch(
      { cancellation_reason: cancelReason.trim() },
      "cancel"
    );
  };

  const handleRefund = () => {
    void applyPatch({}, "refund");
  };

  // ---------------------------------------------
  // TIMELINE DATA
  // ---------------------------------------------
  const timeline = order
    ? [
        {
          key: "created",
          label: "Order placed",
          icon: <Clock size={16} />,
          at: order.created_at,
        },
        {
          key: "processing",
          label: "Processing",
          icon: <Package size={16} />,
          at: order.processing_at,
        },
        {
          key: "shipped",
          label: "Shipped",
          icon: <Truck size={16} />,
          at: order.shipped_at,
        },
        {
          key: "delivered",
          label: "Delivered",
          icon: <CheckCircle2 size={16} />,
          at: order.delivered_at,
        },
        {
          key: "cancelled",
          label: "Cancelled",
          icon: <XCircle size={16} />,
          at: order.cancelled_at,
        },
        {
          key: "refunded",
          label: "Refunded",
          icon: <CreditCard size={16} />,
          at: order.refunded_at,
        },
      ].filter((step) => step.key === "created" || step.at)
    : [];

  // ---------------------------------------------
  // RENDER
  // ---------------------------------------------
  if (loading) {
    return (
      <>
        <Header />
        <main
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2
            style={{
              width: 28,
              height: 28,
              animation: "spin 1s linear infinite",
            }}
          />
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main
          style={{
            maxWidth: 900,
            margin: "40px auto",
            padding: "0 20px 60px",
          }}
        >
          <div
            style={{
              ...sectionCard,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Order not found
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              This order either doesn&apos;t exist or is not assigned to your
              vendor account.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentStatus = (order.status as OrderStatus) || "pending";
  const meta = statusMeta[currentStatus] ?? statusMeta.pending;
  const currency = order.currency || "AUD";
  const totalAmount =
    order.total_amount ?? order.total ?? order.subtotal_amount ?? 0;
  const shipping = order.shipping_cost ?? 0;

  return (
    <>
      <Header />

      {/* Hero / breadcrumb */}
      <div
        style={{
          background: "linear-gradient(135deg,#f9fafb,#eef2ff)",
          padding: "32px 20px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  marginBottom: 4,
                }}
              >
                Vendor / Orders
              </div>
              <h1
  style={{
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  }}
>
  Order #{order.order_number || order.id.slice(0, 8)}
</h1>

              <div
                style={{
                  fontSize: 13,
                  color: "#6b7280",
                  marginTop: 4,
                }}
              >
                Placed on {formatDate(order.created_at)}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              {/* Status pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 999,
                  padding: "5px 12px",
                  border: `1px solid ${meta.border}`,
                  background: meta.bg,
                  color: meta.text,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.04,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "999px",
                    background: meta.border,
                  }}
                />
                {meta.label}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#4b5563",
                  textAlign: "right",
                }}
              >
                Total{" "}
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    marginLeft: 4,
                  }}
                >
                  {formatMoney(totalAmount, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main
        style={{
          maxWidth: 1200,
          margin: "24px auto 60px",
          padding: "0 20px",
        }}
      >
        {/* Toast */}
        {toast && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              borderRadius: 10,
              border:
                toast.type === "success"
                  ? "1px solid #22c55e"
                  : "1px solid #ef4444",
              background:
                toast.type === "success"
                  ? "rgba(34,197,94,0.06)"
                  : "rgba(248,113,113,0.06)",
              fontSize: 13,
            }}
          >
            {toast.message}
          </div>
        )}

        <div className="order-detail-grid">
          {/* LEFT COLUMN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Order summary + items */}
            <section style={sectionCard}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h2
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Package size={18} />
                  Order items
                </h2>
              </div>

              {order.order_items && order.order_items.length > 0 ? (
                <div
                  style={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead
                      style={{
                        background: "#f9fafb",
                      }}
                    >
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            padding: "8px 10px",
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        >
                          Item
                        </th>
                        <th
                          style={{
                            textAlign: "center",
                            padding: "8px 10px",
                            borderBottom: "1px solid #e5e7eb",
                            width: 70,
                          }}
                        >
                          Qty
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            padding: "8px 10px",
                            borderBottom: "1px solid #e5e7eb",
                            width: 120,
                          }}
                        >
                          Unit
                        </th>
                        <th
                          style={{
                            textAlign: "right",
                            padding: "8px 10px",
                            borderBottom: "1px solid #e5e7eb",
                            width: 120,
                          }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.order_items.map((item) => (
                        <tr
                          key={item.id}
                          style={{
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <td
                            style={{
                              padding: "8px 10px",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            {item.thumbnail_url && (
                              <img
                                src={item.thumbnail_url}
                                alt={item.product_name || "Item"}
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 8,
                                  objectFit: "cover",
                                  border: "1px solid #e5e7eb",
                                  background: "#f9fafb",
                                }}
                              />
                            )}
                            <span>{item.product_name || "Product"}</span>
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "center",
                            }}
                          >
                            {item.quantity}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                            }}
                          >
                            {formatMoney(item.unit_price, currency)}
                          </td>
                          <td
                            style={{
                              padding: "8px 10px",
                              textAlign: "right",
                            }}
                          >
                            {formatMoney(item.total_price, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  No items recorded for this order.
                </p>
              )}

              {/* Totals */}
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignItems: "flex-end",
                  fontSize: 13,
                }}
              >
                <div>
                  <span style={{ color: "#6b7280" }}>Subtotal: </span>
                  <strong>
                    {formatMoney(order.subtotal_amount ?? totalAmount - shipping, currency)}
                  </strong>
                </div>
                <div>
                  <span style={{ color: "#6b7280" }}>Shipping: </span>
                  <strong>{formatMoney(shipping, currency)}</strong>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    paddingTop: 4,
                    borderTop: "1px dashed #e5e7eb",
                  }}
                >
                  <span style={{ color: "#6b7280" }}>Order total: </span>
                  <strong
                    style={{
                      fontSize: 16,
                    }}
                  >
                    {formatMoney(totalAmount, currency)}
                  </strong>
                </div>
              </div>
            </section>

            {/* Customer + shipping */}
            <section style={sectionCard}>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <User2 size={18} />
                Customer & delivery
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                  gap: 12,
                  fontSize: 13,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 2,
                    }}
                  >
                    Name
                  </div>
                  <div>{order.customer_name || "Unknown"}</div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 2,
                    }}
                  >
                    Email
                  </div>
                  <div>{order.customer_email || "Unknown"}</div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <MapPin size={16} style={{ marginTop: 2 }} />
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 2,
                    }}
                  >
                    Shipping address
                  </div>
                  <div>
                    {(() => {
  const addr = order.shipping_address_json || {};

  if (!addr.line1) return "No shipping address stored.";

  return (
    <>
      {addr.line1}
      <br />
      {addr.city} {addr.state} {addr.postal_code}
      <br />
      {addr.country}
    </>
  );
})()}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Status + timeline */}
            <section style={sectionCard}>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Clock size={18} />
                Status & timeline
              </h2>

              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {(
                  [
                    "pending",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                    "refunded",
                  ] as OrderStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    disabled={saving}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: currentStatus === s ? "1px solid #111827" : "1px solid #e5e7eb",
background: currentStatus === s ? "#111827" : "rgba(249,250,251,0.8)",
color: currentStatus === s ? "#ffffff" : "#111827",

                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.04,
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                  >
                    {statusMeta[s].label}
                  </button>
                ))}
              </div>

              <div
                style={{
                  marginTop: 8,
                  borderTop: "1px dashed #e5e7eb",
                  paddingTop: 10,
                }}
              >
                {timeline.length === 0 ? (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                    }}
                  >
                    No timeline events yet.
                  </p>
                ) : (
                  <ol
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {timeline.map((step, idx) => (
                      <li
                        key={step.key}
                        style={{
                          display: "flex",
                          gap: 10,
                          position: "relative",
                          paddingBottom:
                            idx === timeline.length - 1 ? 0 : 10,
                          marginBottom:
                            idx === timeline.length - 1 ? 0 : 10,
                        }}
                      >
                        {/* vertical line */}
                        {idx < timeline.length - 1 && (
                          <span
                            style={{
                              position: "absolute",
                              left: 7,
                              top: 18,
                              bottom: 0,
                              width: 1,
                              background: "#e5e7eb",
                            }}
                          />
                        )}

                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "999px",
                            border: "2px solid #4f46e5",
                            background: "#eef2ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {step.icon}
                        </span>

                        <div>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                          >
                            {step.label}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                            }}
                          >
                            {formatDate(step.at)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </section>

            {/* Tracking */}
            <section style={sectionCard}>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Truck size={18} />
                Courier tracking
              </h2>

              <p
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 8,
                }}
              >
                Store the tracking number for this shipment so you and the
                customer can refer to it later.
              </p>

              <input
                style={inputStyle}
                placeholder="e.g. AUSPOST 1234 5678 90"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />

              <button
                type="button"
                onClick={handleSaveTracking}
                disabled={saving}
                style={{
                  marginTop: 8,
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: "#111827",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save tracking"}
              </button>
            </section>

            {/* Notes */}
            <section style={sectionCard}>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <StickyNote size={18} />
                Notes
              </h2>

              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Internal vendor notes are only visible to your team. Customer
                notes can be displayed on the customer&apos;s order page or
                emails.
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Vendor internal notes
                  </div>
                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: 80,
                      resize: "vertical",
                    }}
                    value={vendorNotes}
                    onChange={(e) => setVendorNotes(e.target.value)}
                    placeholder="Visible only to you and your team…"
                  />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    Customer notes
                  </div>
                  <textarea
                    style={{
                      ...inputStyle,
                      minHeight: 70,
                      resize: "vertical",
                    }}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Information or expectations you want the customer to see…"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={saving}
                style={{
                  marginTop: 8,
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: "#111827",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving…" : "Save notes"}
              </button>
            </section>
          </div>
        </div>

        {/* Responsive grid layout */}
        <style jsx>{`
          .order-detail-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.7fr) minmax(0, 1.1fr);
            gap: 20px;
          }

          @media (max-width: 900px) {
            .order-detail-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>

      <Footer />
    </>
  );
}
