"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

/* ---------------- Vendor Type ---------------- */

type Vendor = {
  id: string;
  slug: string;
  store_name: string;
  created_at: string;
  logo_url: string | null;
};

/* ---------------- Component ---------------- */

export default function VendorsPage() {
  const supabase = supabaseBrowser();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("top");

  /* -------- LOAD VENDORS -------- */

  useEffect(() => {
    async function loadVendors() {
      const { data, error } = await supabase
        .from("vendors")
        .select("id, slug, store_name, created_at, logo_url")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Vendor load error:", error);
        setVendors([]);
      } else {
        setVendors(data as Vendor[]);
      }

      setLoading(false);
    }

    loadVendors();
  }, []);

  /* -------- FILTER + SORT -------- */

  const filtered = useMemo(() => {
    let list = [...vendors];

    if (search.trim()) {
      list = list.filter(v =>
        v.store_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case "az":
        return list.sort((a, b) =>
          a.store_name.localeCompare(b.store_name)
        );
      default:
        return list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
    }
  }, [vendors, search, sort]);

  return (
    <>
      <Header />

      <main style={{ background: "#f3f4f6", minHeight: "100vh" }}>
        {/* ===== FULL WIDTH HERO ===== */}
        <section className="yuso-hero">
          <div className="yuso-hero-inner">
<h1>Vendors</h1>
<p>
  Vendors · {filtered.length} active · Verified sellers
</p>
          </div>
        </section>

        {/* ===== PAGE CONTENT ===== */}
<div
  style={{
    maxWidth: 1180,
    margin: "0 auto",
    padding: "30px 24px 160px",
    minHeight: "600px",
  }}
>
          {/* FILTER PANEL */}
          <section
            style={{
              background: "#ffffff",
              padding: 20,
              borderRadius: 14,
              boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
              marginBottom: 35,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vendors..."
                style={{
                  flex: 1,
                  minWidth: 240,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  fontSize: 14,
                }}
              />

              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={selectStyle}
              >
                <option value="top">Newest</option>
                <option value="az">Name A–Z</option>
              </select>
            </div>
          </section>

          {/* GRID */}
          {loading ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              Loading vendors…
            </p>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              No vendors found.
            </p>
          ) : (
            <div className="vendor-grid">
              {filtered.map(v => (
                <Link
                  key={v.id}
                  href={`/vendors/${v.slug}`}
                  className="vendor-card"
                >
                  <div
                    className="vendor-img"
                    style={{
                      backgroundImage: v.logo_url
                        ? `url(${v.logo_url})`
                        : "linear-gradient(135deg,#f1f5f9,#e2e8f0)",
                      backgroundSize: v.logo_url ? "contain" : "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />

                  <h3 className="vendor-name">{v.store_name}</h3>

                  <p className="vendor-products">
                    Since {new Date(v.created_at).getFullYear()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <style>{`
/* ===== HERO ===== */

.yuso-hero {
  width: 100%;
  background: #3f5f97;
  padding: 90px 20px;
  text-align: center;
  color: white;
}

.yuso-hero-inner {
  max-width: 900px;
  margin: 0 auto;
}

.yuso-hero h1 {
  font-size: 64px;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.yuso-hero p {
  font-size: 15px;
  color: rgba(255,255,255,0.8);
}

@media (max-width: 640px) {

  .yuso-hero {
    padding: 60px 20px;
  }

  .yuso-hero h1 {
    font-size: 38px;
  }

  .yuso-hero p {
    font-size: 14px;
  }

}

/* ===== GRID ===== */
.vendor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 26px;
}

/* Tablet */
@media (max-width: 1024px) {
  .vendor-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Mobile */
@media (max-width: 640px) {
  .vendor-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* ===== CARD ===== */
.vendor-card {
  background: #ffffff;
  padding: 16px;
  border-radius: 16px;
  text-decoration: none;
  color: #111827;
  box-shadow: 0 12px 28px rgba(15,23,42,0.08);
  transition: transform .2s ease, box-shadow .2s ease;
}

.vendor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 48px rgba(15,23,42,0.12);
}

.vendor-img {
  width: 100%;
  height: 150px;
  border-radius: 14px;
  margin-bottom: 12px;
}

.vendor-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.vendor-products {
  font-size: 12px;
  color: #6b7280;
}
      `}</style>
    </>
  );
}

/* Shared select style */
const selectStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: 14,
  minWidth: 140,
};
