import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

import DashboardCard from "./DashboardCard";
import LogoutButton from "./LogoutButton"; // ✅ ADD THIS

import {
  StoreIcon,
  PackageIcon,
  ClipboardListIcon,
  MonitorSmartphoneIcon,
} from "lucide-react";

export default async function VendorDashboardPage() {
  const supabase = await supabaseServer();

  // 1) AUTH CHECK
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 2) PROFILE CHECK — SAFE
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "vendor") {
    redirect("/account");
  }

  // 3) VENDOR ACCOUNT CHECK — SAFE
  const { data: vendor, error: vendorErr } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor || vendorErr) {
    redirect("/sell");
  }
// ---------------- KPI QUERIES ----------------

// PRODUCTS
const { count: productCount } = await supabase
  .from("products")
  .select("id", { count: "exact", head: true })
  .eq("vendor_id", vendor.id);

// ORDERS (distinct order_ids via order_items → products → orders)
const { data: vendorOrders } = await supabase
  .from("order_items")
  .select(`
    order_id,
    orders!inner(status),
    products!inner(vendor_id)
  `)
  .eq("products.vendor_id", vendor.id)
  .not("orders.status", "in", '("cancelled","refunded")');

const orderCount = new Set(vendorOrders?.map(o => o.order_id)).size;

// REVENUE (sum of order_items.total_price for this vendor)
const { data: revenueRows } = await supabase
  .from("order_items")
  .select(`
    total_price,
    orders!inner(status),
    products!inner(vendor_id)
  `)
  .eq("products.vendor_id", vendor.id)
  .not("orders.status", "in", '("cancelled","refunded")');

const revenue =
  revenueRows?.reduce((sum, row) => sum + Number(row.total_price || 0), 0) || 0;
  // STORE VIEWS (unique sessions)
const { count: storeViewCount } = await supabase
  .from("store_views")
  .select("session_id", { count: "exact", head: true })
  .eq("vendor_id", vendor.id);


  return (
    <>
      {/* HEADER */}
      <Header />

      {/* HERO */}
{/* HERO */}
<section
  style={{
    width: "100%",
    background: "#385fa2",
    padding: "60px 20px 55px",
    color: "white",
    position: "relative",
  }}
>
  {/* Logout button */}
  <div
    style={{
      position: "absolute",
      top: 20,
      right: 20,
    }}
  >
    <LogoutButton />
  </div>

  <div
    style={{
      maxWidth: 1200,
      margin: "0 auto",
      textAlign: "left",
    }}
  >
    <div
      style={{
        fontSize: 13,
        fontWeight: 500,
        opacity: 0.8,
        marginBottom: 8,
      }}
    >
      Vendor Dashboard
    </div>

    <h1
      style={{
        fontSize: 32,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        marginBottom: 8,
      }}
    >
      {vendor.store_name}
    </h1>

    <p
      style={{
        maxWidth: 640,
        fontSize: 14,
        opacity: 0.85,
        lineHeight: 1.6,
      }}
    >
      Manage products, fulfil orders, track revenue, and optimise your storefront performance.
    </p>
  </div>
</section>

      {/* KPI CARDS */}
      <section
        style={{
          maxWidth: 1400,
          margin: "55px auto",
          padding: "0 28px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 26,
          }}
        >
          {[
            {
  label: "Products",
  value: productCount || 0,
  color: "#6b3ce9",
},
{
  label: "Orders",
  value: orderCount || 0,
  color: "#4f81ff",
},
{
  label: "Store Views",
  value: storeViewCount || 0,
  color: "#00c199",
},
{
  label: "Revenue",
  value: `$${revenue.toFixed(2)}`,
  color: "#ff6b4a",
},

          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "white",
                padding: "32px 30px",
                borderRadius: 20,
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow:
                  "0 18px 45px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.04)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: 5,
                  width: "100%",
                  background: stat.color,
                }}
              />
              <p
  style={{
    fontSize: 15,
    opacity: 0.65,
    marginBottom: 8,
    fontWeight: 500,
    whiteSpace: "nowrap",
  }}
>
  {stat.label}
</p>

              <h3
  style={{
    fontSize: 30,
    fontWeight: 700,
    letterSpacing: "-0.5px",
    color: "#111",
    lineHeight: 1,
    wordBreak: "break-word",
    maxWidth: "100%",
  }}
>
  {stat.value}
</h3>

              <div
                style={{
                  height: 40,
                  marginTop: 12,
                  background:
                    "linear-gradient(135deg, rgba(0,0,0,0.06), transparent)",
                  borderRadius: 8,
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* OPERATIONAL SYSTEMS */}
      <section
        style={{
          maxWidth: 1400,
          margin: "70px auto",
          padding: "0 28px",
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 32,
            color: "#111",
          }}
        >
          Operational Systems
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 26,
          }}
        >
<DashboardCard
  title="Store Details"
  description="Brand identity, logos, description and storefront configuration."
  icon={<StoreIcon size={28} />}
  accentColor="#6b3ce9"
  href="/vendor/settings"
/>

<DashboardCard
  title="Products"
  description="Create new listings, manage inventory, update pricing."
  icon={<PackageIcon size={28} />}
  accentColor="#4f81ff"
  href="/vendor/products"
/>

<DashboardCard
  title="Orders"
  description="Fulfillment pipeline, shipping, payment tracking and analytics."
  icon={<ClipboardListIcon size={28} />}
  accentColor="#00c199"
  href="/vendor/orders"
/>

<DashboardCard
  title="View Storefront"
  description="See how customers experience your public store."
  icon={<MonitorSmartphoneIcon size={28} />}
  accentColor="#ff6b4a"
  href={`/vendors/${vendor.slug}`}
/>

        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </>
  );
}
