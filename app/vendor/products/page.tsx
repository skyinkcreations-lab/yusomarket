import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { PlusIcon, ExternalLink, Pencil } from "lucide-react";

export default async function VendorProductsPage() {
  const supabase = await supabaseServer();

  const userRes = await supabase.auth.getUser();
  const user = userRes.data?.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "vendor") redirect("/account");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!vendor) redirect("/sell");

  // Fetch vendor products
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <Header />

      {/* HERO */}
{/* HERO */}
<section
  style={{
    width: "100%",
    background: "#385fa2",
    padding: "60px 20px 55px",   // 🔒 SAME AS DASHBOARD
    color: "white",
    position: "relative",
  }}
>
  <div
    style={{
      maxWidth: 1200,            // 🔒 SAME WIDTH
      margin: "0 auto",
      textAlign: "left",         // 🔒 SAME ALIGNMENT
    }}
  >
    <div
      style={{
        fontSize: 13,            // 🔒 SAME SIZE
        fontWeight: 500,         // 🔒 SAME WEIGHT
        opacity: 0.8,
        marginBottom: 8,
      }}
    >
      Vendor Dashboard
    </div>

    <h1
      style={{
        fontSize: 32,            // 🔒 SAME SIZE
        fontWeight: 600,         // 🔒 SAME WEIGHT
        letterSpacing: "-0.02em",
        marginBottom: 8,
      }}
    >
      Product Management
    </h1>

    <p
      style={{
        maxWidth: 640,           // 🔒 SAME LINE WIDTH
        fontSize: 14,            // 🔒 SAME SIZE
        opacity: 0.85,
        lineHeight: 1.6,
      }}
    >
      Manage products, inventory, pricing, and visibility across your storefront.
    </p>
  </div>
</section>

      <section
        style={{
          maxWidth: 1200,
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        {/* HEADER ROW */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 25,
          }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 700 }}>Your Products</h2>

          <a
            href="/vendor/products/new"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#111",
              padding: "10px 16px",
              borderRadius: 8,
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <PlusIcon size={18} />
            Add Product
          </a>
        </div>

        {/* EMPTY STATE */}
        {(!products || products.length === 0) && (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              border: "2px dashed #ddd",
              borderRadius: 14,
              background: "#fafafa",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 14 }}>
              No products yet
            </h3>
            <p style={{ marginTop: 6, fontSize: 14 }}>
              Start building your catalog.
            </p>
            <a
              href="/vendor/products/new"
              style={{
                display: "inline-block",
                marginTop: 20,
                background: "#111",
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Add Your First Product
            </a>
          </div>
        )}

        {/* TABLE LIST */}
        {products && products.length > 0 && (
          <div
            style={{
              width: "100%",
              overflowX: "auto",
              borderRadius: 10,
              border: "1px solid #e4e4e4",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#f7f7f7",
                    textAlign: "left",
                    fontSize: 14,
                    color: "#444",
                  }}
                >
                  <th style={{ padding: "14px 18px" }}>Product</th>
                  <th style={{ padding: "14px 18px" }}>Price</th>
                  <th style={{ padding: "14px 18px" }}>Status</th>
                  <th style={{ padding: "14px 18px", width: 150 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {/* PRODUCT + IMAGE */}
                    <td style={{ padding: "14px 18px", display: "flex", gap: 14, alignItems: "center" }}>
                      <img
  src={
    p.thumbnail_url ||
    p.primary_image_url ||
    p.primary_image ||
    "/placeholder.png"
  }
  alt={p.name}
  style={{
    width: 55,
    height: 55,
    objectFit: "cover",
    borderRadius: 6,
    border: "1px solid #ddd",
  }}
/>

                      <div>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "#777" }}>{p.slug}</div>
                      </div>
                    </td>

                    {/* PRICE */}
                    <td style={{ padding: "14px 18px" }}>
                      {p.price ? `A$${p.price}` : "-"}
                    </td>

                    {/* STATUS */}
                    <td style={{ padding: "14px 18px" }}>
                      <span
                        style={{
                          background: p.status === "published" ? "#e1ffe1" : "#fff4d9",
                          color: p.status === "published" ? "#0a7f14" : "#c27d00",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {p.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: "14px 18px", display: "flex", gap: 10 }}>
                      {/* EDIT */}
                      <a
                        href={`/vendor/products/edit/${p.id}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#111",
                          color: "white",
                          padding: "6px 10px",
                          borderRadius: 6,
                          fontSize: 13,
                          textDecoration: "none",
                        }}
                      >
                        <Pencil size={14} />
                        Edit
                      </a>

                      {/* PUBLIC PAGE */}
                      <a
                        href={`/product/${p.slug}`}
                        target="_blank"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          background: "white",
                          border: "1px solid #ddd",
                          padding: "6px 10px",
                          borderRadius: 6,
                          fontSize: 13,
                          color: "#333",
                          textDecoration: "none",
                        }}
                      >
                        <ExternalLink size={14} />
                        View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
