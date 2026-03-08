"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

/* ===============================
   Helpers
================================ */

function formatAUD(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(n);
}

/* ===============================
   Types
================================ */

type Product = {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  thumbnail_url: string | null;
  slug: string;
  stock_qty: number;
  vendor_name: string | null;
free_shipping: boolean;
};

/* ===============================
   Page
================================ */

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = typeof params.slug === "string" ? params.slug : "";
  const tag = searchParams.get("tag");

  const [tagName, setTagName] = useState<string | null>(null);


  const supabase = supabaseBrowser();


  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

const [search, setSearch] = useState("");
const [brandSearch, setBrandSearch] = useState("");
const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
const [maxPrice, setMaxPrice] = useState(5000);
const [inStock, setInStock] = useState(false);


  const categoryName = slug
  ? slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
  : "";


  /* ===============================
     Fetch
  ================================ */

useEffect(() => {
  const run = async () => {
    setLoading(true);
    setTagName(null);

    const { data: category } = await supabase
      .from("vendor_categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!category) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let productIds: string[] = [];

    if (tag) {
      // TAG-DRIVEN VIEW (Option B)
      const { data: tagRow } = await supabase
        .from("vendor_tags")
        .select("id, name")
        .eq("slug", tag)
        .single();

      if (!tagRow) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setTagName(tagRow.name);

      const { data: tagLinks } = await supabase
        .from("product_tag_links")
        .select("product_id")
        .eq("tag_id", tagRow.id);

      productIds = tagLinks?.map(l => l.product_id) || [];
    } else {
      // CATEGORY VIEW
      const { data: categoryLinks } = await supabase
        .from("product_category_links")
        .select("product_id")
        .eq("category_id", category.id);

      productIds = categoryLinks?.map(l => l.product_id) || [];
    }

    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("products")
      .select(
        "id,name,price,original_price,thumbnail_url,slug,stock_qty,vendors(store_name, free_shipping)"
      )
      .eq("status", "published")
      .in("id", productIds);

    const mapped =
      data?.map((p: any) => ({
        ...p,
        vendor_name: p.vendors?.store_name || null,
        free_shipping: p.vendors?.free_shipping || false,
      })) || [];

    setProducts(mapped);
    setLoading(false);
  };

  run();
}, [slug, tag]);




  /* ===============================
     Filters
  ================================ */

const filtered = useMemo(() => {
  return products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
      return false;

    if (p.price > maxPrice) return false;

    if (inStock && p.stock_qty <= 0) return false;

    if (
      selectedBrands.length > 0 &&
      !selectedBrands.includes(p.vendor_name || "")
    )
      return false;

    return true;
  });
}, [products, search, maxPrice, inStock, selectedBrands]);


  const brands = useMemo(() => {
  const set = new Set<string>();
  products.forEach(p => {
    if (p.vendor_name) set.add(p.vendor_name);
  });
  return Array.from(set).sort();
}, [products]);

const visibleBrands = brands.filter(b =>
  b.toLowerCase().includes(brandSearch.toLowerCase())
);

  /* ===============================
     Render
  ================================ */

  return (
    <>
      <Header />

      <div className="yuso-page">

        {/* HERO BANNER */}
        <section className="yuso-hero">
          <div className="yuso-hero-inner">
            <h1>
  {tagName ? `${tagName}` : categoryName}
</h1>
<p>
  {categoryName && (
    <span style={{ opacity: 0.7 }}>
      {categoryName}
      {tagName ? " › " : " · "}
    </span>
  )}
  {tagName && <span>{tagName} · </span>}
  {filtered.length} products · Verified vendors
</p>



          </div>
        </section>

<div className="yuso-wrap">

  <div className="yuso-breadcrumbs">
    <Link href="/">Home</Link>
    <span>›</span>
    {tagName ? (
  <>
    <Link href={`/category/${slug}`}>{categoryName}</Link>
    <span>›</span>
    <span>{tagName}</span>
  </>
) : (
  <span>{categoryName}</span>
)}

  </div>

  <div className="yuso-layout">

    <aside className="yuso-sidebar">
      {/* Search products */}
      <input
        className="yuso-input"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="yuso-slider">
        <label>Max price</label>
        <input
          type="range"
          min={0}
          max={5000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
        <span>{formatAUD(maxPrice)}</span>
      </div>

      <div className="yuso-brand">
        <input
          className="yuso-input"
          placeholder="Search brands..."
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
        />

        <div className="yuso-brand-list">
          {visibleBrands.length === 0 && (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              No brands found
            </div>
          )}

          {visibleBrands.map((b) => {
            const active = selectedBrands.includes(b);
            return (
              <button
                key={b}
                type="button"
                className={`yuso-brand-pill ${active ? "active" : ""}`}
                onClick={() =>
                  setSelectedBrands((prev) =>
                    prev.includes(b)
                      ? prev.filter((x) => x !== b)
                      : [...prev, b]
                  )
                }
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      <label className="yuso-check">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
        />
        In stock only
      </label>
    </aside>

    <main className="yuso-content">
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="yuso-grid yuso-products">
{filtered.map((p) => (
  <div key={p.id} className="product-card modern-card">
    <div className="modern-image-wrap">
      {p.original_price && p.original_price > p.price ? (
        <span className="modern-badge">
          -{Math.round((1 - p.price / p.original_price) * 100)}%
        </span>
      ) : null}

      <Link href={`/product/${p.slug}`}>
        <img
          src={p.thumbnail_url || "/images/placeholder-product.jpg"}
          alt={p.name}
        />
      </Link>
    </div>

    <div className="modern-content">
      <Link href={`/product/${p.slug}`} className="modern-title">
        {p.name}
      </Link>

      <div className="modern-price-stack">
        {p.original_price && p.original_price > p.price ? (
          <span className="modern-original">
            {formatAUD(p.original_price)}
          </span>
        ) : null}

        <span className="modern-price">
          {formatAUD(p.price)}
        </span>
      </div>

      <Link href={`/product/${p.slug}`} className="modern-cart-btn" aria-label="View product">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </Link>
    </div>
  </div>
))}
        </div>
      )}
     </main>
  </div>        {/* yuso-layout */}
</div>          {/* yuso-wrap */}
</div>          {/* yuso-page */}

<Footer />


<style>{`
/* =========================
   PAGE BASE
========================= */

.yuso-page {
  background: #f8fafc;
  min-height: 130vh;
}


/* =========================
   HERO
========================= */

.yuso-hero {
  background: #385fa2;
  padding: 80px 20px 70px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.yuso-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.04));
  pointer-events: none;
}

.yuso-hero-inner {
  max-width: 920px;
  margin: 0 auto;
}

.yuso-hero h1 {
  font-size: clamp(32px, 4vw, 52px);
  font-weight: 900;
  letter-spacing: -0.03em;
  margin-bottom: 10px;
}

.yuso-hero p {
  font-size: 14px;
  color: #cbd5f5;
}

/* =========================
   WRAP / LAYOUT
========================= */

.yuso-wrap {
  max-width: 1220px;
  margin: 0 auto;
  padding: 22px 16px 50px;
}

.yuso-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 34px;
}

@media (max-width: 900px) {
  .yuso-layout {
    grid-template-columns: 1fr;
  }
}

/* =========================
   BREADCRUMBS
========================= */

.yuso-breadcrumbs {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  margin-bottom: 26px;
  color: #64748b;
}

.yuso-breadcrumbs a {
  text-decoration: none;
  color: #0f172a;
  font-weight: 500;
}

.yuso-breadcrumbs a:hover {
  opacity: 0.6;
}

/* =========================
   SIDEBAR
========================= */

.yuso-sidebar {
  background: white;
  border-radius: 22px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}

/* Desktop only */
@media (min-width: 901px) {
  .yuso-sidebar {
    position: sticky;
    top: 90px;
  }
}

@media (max-width: 640px) {

  .yuso-sidebar {
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  }

  .yuso-input {
    font-size: 14px;
    padding: 12px 14px;
  }

}
.yuso-input {
  width: 100%;
  padding: 11px 14px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  margin-bottom: 16px;
  transition: 0.2s;
}

.yuso-input:focus {
  outline: none;
  border-color: #0f172a;
}

/* Slider */

.yuso-slider {
  margin-bottom: 18px;
}

.yuso-slider label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.yuso-slider span {
  font-size: 13px;
  font-weight: 700;
}

/* Brand */

.yuso-brand {
  margin-top: 10px;
}

.yuso-brand-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.yuso-brand-pill {
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s;
}

.yuso-brand-pill:hover {
  border-color: #0f172a;
}

.yuso-brand-pill.active {
  background: #0f172a;
  color: white;
  border-color: #0f172a;
}

/* Checkbox */

.yuso-check {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  font-size: 12px;
}

/* =========================
   GRID
========================= */

.yuso-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 1024px) {
  .yuso-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .yuso-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

.product-card {
  width: 100%;
}

.modern-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 8px 26px rgba(15,23,42,0.08);
  transition: all 0.22s ease;
  position: relative;
}

.modern-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(15,23,42,0.12);
}

.modern-image-wrap {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  background: #f3f4f6;
  aspect-ratio: 1 / 1;
}

.modern-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .35s ease;
}

.modern-card:hover img {
  transform: scale(1.05);
}

.modern-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #385fa2;
  color: white;
  font-size: 10.5px;
  font-weight: 800;
  padding: 5px 9px;
  border-radius: 999px;
  z-index: 3;
}

.modern-content {
  padding: 10px 6px 4px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
  align-items: end;
}

.modern-title {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  text-decoration: none;
  line-height: 1.35;
  grid-column: 1 / span 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modern-price-stack {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.modern-original {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
  text-decoration: line-through;
  margin-bottom: 2px;
}

.modern-price {
  font-size: 18px;
  font-weight: 800;
  color: #020617;
}

.modern-cart-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s ease;
  text-decoration: none;
}

.modern-cart-btn:hover {
  background: #1d4ed8;
  transform: scale(1.05);
}

.yuso-content {
  min-height: clamp(420px, 65vh, 900px);
}

.yuso-products {
  align-items: stretch;
}
  
`}</style>
    </>
  );
}
