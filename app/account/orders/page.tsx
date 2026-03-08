// app/account/orders/page.tsx
import Link from "next/link";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { supabaseServer } from "@/lib/supabaseServer";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const statusMeta: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Pending",
    bg: "rgba(251,191,36,0.08)",
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

function formatMoney(value: number | null) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value || 0);
}

export default async function OrdersPage() {
  const supabase = await supabaseServer();
  const { data: session } = await supabase.auth.getUser();

  if (!session?.user) {
    return (
      <>
        <Header />
        <main style={pageStyle}>
          <div style={containerStyle}>
            <h2 style={titleStyle}>My Orders</h2>
            <p style={subStyle}>
              You need to log in to view your orders.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, status, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Header />

      {/* HERO */}
      <section style={heroStyle}>
        <div style={heroInner}>
          <h1 style={heroTitle}>Your Orders</h1>
          <p style={heroSub}>
            View, track and manage your recent purchases.
          </p>
          <Link href="/account" style={backLink}>
            ← Back to account
          </Link>
        </div>
      </section>

      <main style={pageStyle}>
        <div style={containerStyle}>
          {!orders || orders.length === 0 ? (
            <div style={emptyCard}>
              <div style={{ fontWeight: 600, fontSize: 16 }}>
                No orders yet
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                Once you place an order, it will appear here.
              </div>
            </div>
          ) : (
            <div style={gridStyle}>
              {orders.map((order) => {
                const publicId = order.order_number || order.id;
                const meta =
                  statusMeta[(order.status as OrderStatus) || "pending"] ??
                  statusMeta.pending;

                return (
                  <div key={order.id} style={cardStyle}>
                    <div style={cardHead}>
                      <div>
                        <div style={orderId}>
                          Order #{publicId}
                        </div>
                        <div style={orderDate}>
                          Placed{" "}
                          {new Date(
                            order.created_at
                          ).toLocaleDateString()}
                        </div>
                      </div>

                      <div
                        style={{
                          ...statusPill,
                          background: meta.bg,
                          color: meta.text,
                          border: `1px solid ${meta.border}`,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: meta.border,
                          }}
                        />
                        {meta.label}
                      </div>
                    </div>

                    <div style={orderTotal}>
                      {formatMoney(order.total_amount)}
                    </div>

                    <Link
                      href={`/account/orders/${publicId}`}
                      style={viewLink}
                    >
                      View order →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

/* =====================
   STYLES
===================== */

const heroStyle = {
  background: "#385fa2",
  padding: "60px 18px 50px",
  color: "#fff",
};

const heroInner = {
  maxWidth: 1100,
  margin: "0 auto",
};

const heroTitle = {
  fontSize: 32,
  fontWeight: 700,
  margin: "0 0 6px",
};

const heroSub = {
  fontSize: 14,
  opacity: 0.85,
  marginBottom: 16,
};

const backLink = {
  fontSize: 13,
  fontWeight: 600,
  color: "#fff",
  textDecoration: "none",
};

const pageStyle = {
  background: "#f5f5f7",
  padding: "40px 18px 80px",
};

const containerStyle = {
  maxWidth: 1100,
  margin: "0 auto",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
  gap: 18,
};

const cardStyle = {
  background: "#fff",
  borderRadius: 18,
  border: "1px solid rgba(15,23,42,0.06)",
  padding: 18,
  display: "flex",
  flexDirection: "column" as const,
  gap: 14,
};

const cardHead = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const orderId = {
  fontSize: 14,
  fontWeight: 600,
};

const orderDate = {
  fontSize: 12,
  color: "#64748b",
};

const statusPill = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase" as const,
};

const orderTotal = {
  fontSize: 18,
  fontWeight: 600,
};

const viewLink = {
  fontSize: 13,
  fontWeight: 600,
  color: "#385fa2",
  textDecoration: "none",
};

const emptyCard = {
  background: "#fff",
  borderRadius: 18,
  padding: 28,
  border: "1px solid rgba(15,23,42,0.06)",
};