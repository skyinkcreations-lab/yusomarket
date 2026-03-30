// app/account/orders/[id]/page.tsx

"use client";

import { use } from "react";
import Header from "../../../_components/Header";
import Footer from "../../../_components/Footer";
import { useEffect, useState } from "react";


function getStatusIndex(status: string | null | undefined): number {
  switch (status) {
    case "delivered":
      return 3;
    case "shipped":
      return 2;
    case "processing":
      return 1;
    case "pending":
    default:
      return 0;
  }
}

function formatMoney(value: number | null | undefined) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(value || 0));
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const publicOrderId = resolvedParams.id;

  const [order, setOrder] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  let interval: NodeJS.Timeout;

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${publicOrderId}`);

      if (!res.ok) {
        setOrder(null);
        return;
      }

      const data = await res.json();
      setOrder(data.order ?? null);
    } catch (err) {
      console.error("Order fetch failed", err);
      setOrder(null);
    } finally {
  setLoading(false);
}
  };

  loadOrder();

  // 🔁 AUTO REFRESH EVERY 5 SECONDS
  interval = setInterval(loadOrder, 5000);

  return () => clearInterval(interval);
}, [publicOrderId]);

if (loading) {
  return (
    <>
      <Header />
      <div style={{ padding: 40 }}>Loading...</div>
      <Footer />
    </>
  );
}

  if (!order) {
    return (
      <>
        <Header />
        <div style={{ padding: 40 }}>Order not found.</div>
        <Footer />
      </>
    );
  }

const vendor = order.vendor || {};

const shippingAddress = order.shipping_address_json || {};

  const statusIndex = getStatusIndex(order.status);
  const steps = ["Order placed", "Processing", "Shipped", "Delivered"];
  const displayId = order.order_number || order.id;

  return (
    <>
      <Header />

      {/* HERO */}
      <section style={heroStyle}>
        <div style={heroInner}>
          <div style={heroBadge}>Order details</div>
          <h1 style={heroTitle}>Order #{displayId}</h1>
          <p style={heroSub}>
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      </section>

      <main style={pageStyle}>
        <div style={containerStyle}>

          <div style={breadcrumb}>
            My Orders /{" "}
            <span style={{ color: "#0f172a" }}>Order #{displayId}</span>
          </div>

          <div className="grid-layout">

            {/* MAIN */}
            <section style={mainCard}>

              <div style={{ marginBottom: 24 }}>
                <div style={sectionTitle}>Order progress</div>

                <div style={timelineWrap}>
                  {steps.map((label, idx) => {
                    const active = statusIndex >= idx;

                    return (
                      <div key={label} style={timelineStep}>
                        <div
                          style={{
                            ...timelineCircle,
                            background: active ? "#385fa2" : "#e5e7eb",
                          }}
                        />
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: active ? 600 : 500,
                            color: active ? "#0f172a" : "#64748b",
                          }}
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={sectionTitle}>Items</div>

              <div style={itemsBox}>
                {order.order_items?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      ...itemRow,
                      borderBottom:
                        idx === (order.order_items?.length || 0) - 1
                          ? "none"
                          : "1px solid #f1f5f9",
                    }}
                  >
                    <div>
                      <div style={itemName}>
                        {item.product_name || item.products?.name || "Product"}
                      </div>
                      <div style={itemMeta}>
                        Qty {item.quantity}
                      </div>
                    </div>
                    <div style={itemPrice}>
                      {formatMoney(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28 }}>
                <div style={sectionTitle}>Payment summary</div>

                <div style={totalsCard}>
                  <Row label="Subtotal">
                    {formatMoney(
                      Number(order.total_amount) -
                        Number(order.shipping_cost ?? 0)
                    )}
                  </Row>

                  <Row label="Shipping">
                    {formatMoney(order.shipping_cost)}
                  </Row>

                  <Row label="Discount">
                    -{formatMoney(order.discount_amount)}
                  </Row>

                  <div style={totalDivider} />

                  <Row label="Total paid" bold>
                    {formatMoney(order.total_amount)}
                  </Row>
                </div>
              </div>
            </section>

            {/* SIDEBAR */}
            <aside style={sideColumn}>
              <InfoCard title="Shipping address">
                {shippingAddress?.line1 || ""}
                {"\n"}
                {shippingAddress?.city || ""}{" "}
                {shippingAddress?.state || ""}{" "}
                {shippingAddress?.postal_code || ""}
                {"\n"}
                {shippingAddress?.country || ""}
              </InfoCard>

{order.tracking_number && (
  <InfoCard title="Courier tracking">
    <div style={{ fontWeight: 600 }}>
      {order.tracking_number}
    </div>

    <div
      style={{
        marginTop: 8,
        fontSize: 12,
        color: "#64748b",
      }}
    >
      Use this tracking number with your courier to follow your shipment.
    </div>
  </InfoCard>
)}

<InfoCard title="Seller contact">
  {vendor.support_email ? (
    <>
      {vendor.store_name || "Seller"}
      {"\n"}
      <a
        href={`mailto:${vendor.support_email}?subject=${encodeURIComponent(
          `Order ${displayId}`
        )}`}
        style={linkStyle}
      >
        {vendor.support_email}
      </a>
    </>
  ) : (
    "Seller contact not available."
  )}
</InfoCard>

{order.customer_notes && (
  <InfoCard title="Order notes">
    {order.customer_notes}
  </InfoCard>
)}

              <InfoCard title="Need help?">
                If there’s an issue with your order, contact support and we’ll
                assist you.
              </InfoCard>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx>{`
  @media (min-width: 900px) {
    .grid-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
    }
  }
`}</style>
    </>
  );
}

/* ====================== COMPONENTS ====================== */

function Row({
  label,
  children,
  bold,
}: {
  label: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 14,
        fontWeight: bold ? 600 : 500,
        marginBottom: 8,
      }}
    >
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ color: "#0f172a" }}>{children}</span>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={infoCard}>
      <div style={infoTitle}>{title}</div>
      <div style={infoBody}>{children}</div>
    </div>
  );
}

/* ====================== RESPONSIVE GRID ====================== */

const responsiveGrid: React.CSSProperties = {
  display: "grid",
  gap: 24,
  gridTemplateColumns: "1fr",
};

/* ====================== STYLES ====================== */

const heroStyle = {
  background: "#385fa2",
  padding: "60px 20px 50px",
  color: "#fff",
};

const heroInner = {
  maxWidth: 960,
  margin: "0 auto",
};

const heroBadge = {
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.9,
  marginBottom: 8,
};

const heroTitle = {
  fontSize: 30,
  fontWeight: 700,
  marginBottom: 4,
};

const heroSub = {
  fontSize: 13,
  opacity: 0.85,
};

const pageStyle = {
  background: "#f5f5f7",
  padding: "40px 20px 80px",
};

const containerStyle = {
  maxWidth: 960,
  margin: "0 auto",
};

const breadcrumb = {
  fontSize: 12,
  color: "#64748b",
  marginBottom: 24,
};

const mainCard = {
  background: "#fff",
  borderRadius: 20,
  border: "1px solid rgba(15,23,42,0.06)",
  padding: 24,
};

const sectionTitle = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 12,
};

const timelineWrap = {
  display: "flex",
  gap: 16,
  flexWrap: "wrap" as const,
};

const timelineStep = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const timelineCircle = {
  width: 10,
  height: 10,
  borderRadius: 999,
};

const itemsBox = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 14,
};

const itemRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  flexWrap: "wrap" as const,
  gap: 8,
};

const itemName = {
  fontSize: 14,
  fontWeight: 600,
};

const itemMeta = {
  fontSize: 12,
  color: "#64748b",
};

const itemPrice = {
  fontSize: 14,
  fontWeight: 600,
};

const totalsCard = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
};

const totalDivider = {
  borderTop: "1px solid #e5e7eb",
  margin: "10px 0",
};

const sideColumn = {
  display: "flex",
  flexDirection: "column" as const,
  gap: 16,
};

const infoCard = {
  background: "#ffffff",
  borderRadius: 16,
  border: "1px solid rgba(15,23,42,0.06)",
  padding: 16,
};

const infoTitle = {
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 8,
};

const infoBody = {
  fontSize: 12,
  color: "#475569",
  whiteSpace: "pre-line" as const,
};

const linkStyle = {
  color: "#385fa2",
  fontWeight: 600,
  textDecoration: "none",
};