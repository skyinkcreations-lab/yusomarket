"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export default function VendorStorefrontPreview() {
  const supabase = supabaseBrowser();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      // vendor
      const { data: v } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", auth.user.id)
        .maybeSingle();

      if (!v) return;

      setVendor(v);

      // products
      const { data: p } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", v.id)
        .order("created_at", { ascending: false });

      setProducts(p || []);
      setLoading(false);
    })();
  }, []);

  if (!vendor)
    return (
      <>
        <Header />
        <main style={{ padding: 40, textAlign: "center" }}>
          Vendor not found.
        </main>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      {/* HERO */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #eef2ff 0%, #f9fafb 100%)",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 36,
            fontWeight: 900,
            marginBottom: 6,
          }}
        >
          View Storefront
        </h1>

        <p style={{ fontSize: 15, opacity: 0.75 }}>
          This is how customers see your live store.
        </p>

        <a
          href={`/vendors/${vendor.id}`}
          target="_blank"
          style={{
            marginTop: 20,
            display: "inline-block",
            padding: "10px 20px",
            background: "#111",
            color: "#fff",
            fontSize: 14,
            borderRadius: 999,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Open Public Store
        </a>
      </div>

      <main
        style={{
          maxWidth: 1200,
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        {/* STORE INFO */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 24,
            border: "1px solid #e5e7eb",
            marginBottom: 34,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 6,
            }}
          >
            {vendor.store_name}
          </h2>

          <p style={{ fontSize: 14, opacity: 0.8 }}>
            {vendor.store_description || "No store description yet."}
          </p>
        </div>

        {/* PRODUCT GRID */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 14,
          }}
        >
          Products
        </h3>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>Loading…</div>
        ) : products.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", opacity: 0.6 }}>
            You haven't listed any products yet.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 20,
            }}
          >
            {products.map((p) => (
              <a
                key={p.id}
                href={`/products/${p.slug}`}
                target="_blank"
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid #e5e7eb",
                  padding: 12,
                  display: "block",
                  textDecoration: "none",
                }}
              >
                <img
                  src={p.thumbnail_url}
                  style={{
                    width: "100%",
                    height: 160,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                />

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 4,
                    color: "#111",
                  }}
                >
                  {p.name}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: "#4b5563",
                    fontWeight: 500,
                  }}
                >
                  ${p.price}
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
