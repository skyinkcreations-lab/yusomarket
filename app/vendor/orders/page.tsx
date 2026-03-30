"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function VendorOrdersPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  /* AUTH → VENDOR */
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return router.push("/login");

      setUserId(auth.user.id);

      const { data: vendor } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      if (!vendor) return router.push("/sell");
      setVendorId(vendor.id);
    })();
  }, []);

  /* FETCH ORDERS */
  useEffect(() => {
    if (!vendorId) return;

(async () => {
  setLoading(true);

  const start = (page - 1) * limit;
  const end = start + limit - 1;

const { data } = await supabase
  .from("orders")
  .select(`
    id,
    order_number,
    user_id,
    customer_name,
    customer_email,
    total_amount,
    currency,
    status,
    created_at,
    order_items (
      id,
      product_id,
      products (
        id,
        vendor_id
      )
    )
  `)
    .order("created_at", { ascending: false })

    console.log("RAW ORDERS:", data);

  // 🔥 FILTER TO ONLY THIS VENDOR'S ORDERS
const vendorOrders = (data || []).filter((o: any) => {
  const match = o.order_items?.some(
    (i: any) => i.products?.vendor_id === vendorId
  );

  console.log("CHECK ORDER:", o.order_number, {
    match,
    items: o.order_items,
    vendorId
  });

  return match && o.user_id !== userId;
});

  setOrders(vendorOrders);
  setLoading(false);
})();
  }, [vendorId, page]);

  const filtered = useMemo(() => {
    const t = searchTerm.toLowerCase();
    return orders.filter(
      (o) =>
        o.order_number?.toLowerCase().includes(t) ||
        o.customer_name?.toLowerCase().includes(t) ||
        o.customer_email?.toLowerCase().includes(t)
    );
  }, [orders, searchTerm]);

  const fmtMoney = (n: number, c = "AUD") =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: c,
    }).format(n);

  const open = (orderNumber: string) =>
  router.push(`/vendor/orders/${orderNumber}`);

  const statusColor = (s: string) =>
    s === "pending"
      ? "#fbbf24"
      : s === "processing"
      ? "#3b82f6"
      : s === "shipped"
      ? "#10b981"
      : s === "cancelled"
      ? "#ef4444"
      : "#6b7280";

  return (
    <>
      <Header />

      {/* HERO */}
      <div
        style={{
          padding: "56px 20px",
          textAlign: "center",
          background: "linear-gradient(135deg,#eef2ff,#f9fafb)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h1 style={{ fontSize: 34, fontWeight: 900, letterSpacing: "-0.04em" }}>
          Orders
        </h1>
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          Fulfilment, tracking & customer delivery
        </p>
      </div>

      <main style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
        {/* SEARCH */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <Search
            size={18}
            style={{ position: "absolute", top: 12, left: 12, opacity: 0.5 }}
          />
          <input
            placeholder="Search orders…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px 12px 38px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              fontSize: 14,
            }}
          />
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="desktop">
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                    tableLayout: "fixed",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f9fafb" }}>
                      {["Order", "Customer", "Total", "Status", "Date"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "14px 18px",
                              fontSize: 12,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              color: "#64748b",
                              textAlign: "left",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr
                        key={o.id}
                        onClick={() => o.order_number && open(o.order_number)}
                        style={{
                          background: "#fff",
                          borderRadius: 12,
                          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                          cursor: "pointer",
                        }}
                      >
                        <td style={{ padding: "16px 18px" }}>
                          <div style={{ fontWeight: 700 }}>
                            #{o.order_number}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>
                            {o.id}
                          </div>
                        </td>
                        <td style={{ padding: "16px 18px" }}>
                          <div style={{ fontWeight: 600 }}>
                            {o.customer_name}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            {o.customer_email}
                          </div>
                        </td>
                        <td style={{ padding: "16px 18px" }}>
                          {fmtMoney(o.total_amount, o.currency)}
                        </td>
                        <td style={{ padding: "16px 18px" }}>
                          <span
                            style={{
                              background: statusColor(o.status),
                              color: "#fff",
                              padding: "6px 12px",
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px 18px" }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE LIST */}
<div className="mobile">
  <div
    style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 14,
      overflow: "hidden",
    }}
  >
    {filtered.map((o, i) => (
      <div
        key={o.id}
        onClick={() => o.order_number && open(o.order_number)}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 12,
          padding: "14px 16px",
          borderBottom:
            i === filtered.length - 1 ? "none" : "1px solid #f1f5f9",
          cursor: "pointer",
        }}
      >
        {/* LEFT */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            #{o.order_number}
          </div>

          <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
            {o.customer_name}
          </div>

          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {new Date(o.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {fmtMoney(o.total_amount, o.currency)}
          </div>

          <span
            style={{
              display: "inline-block",
              marginTop: 6,
              background: statusColor(o.status),
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {o.status}
          </span>
        </div>
      </div>
    ))}
  </div>
</div>

          </>
        )}

        <style jsx>{`
          .mobile {
            display: none;
          }
          @media (max-width: 900px) {
            .desktop {
              display: none;
            }
            .mobile {
              display: block;
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
