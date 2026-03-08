"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import Link from "next/link";

type Vendor = {
  id: string;
  slug: string;
  store_name: string;
  store_logo: string | null;
  store_banner: string | null;
  store_description: string | null;
  support_email: string | null;
  created_at: string;
  location: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  original_price?: number | null;
  thumbnail_url: string | null;
  stock_qty: number;
  created_at: string;
  slug: string;
variants?: {
  id: string;
  title: string | null;
  regular_price: number | null;
  sale_price: number | null;
}[];
};

export default function VendorStorefrontPage() {
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

const selectedVariant = quickViewProduct?.variants?.find(
  (v) => v.id === selectedVariantId
) ?? null;

  useEffect(() => {
    async function load() {
      try {
        const supabase = supabaseBrowser();

        const { data: vendorRow, error: vendorErr } = await supabase
          .from("vendors")
          .select("*")
          .eq("slug", decodeURIComponent(slug))
          .maybeSingle();

        if (vendorErr) throw vendorErr;
        if (!vendorRow) throw new Error("Vendor not found.");

        setVendor(vendorRow as Vendor);

        // ---- RECORD STORE VIEW (once per session per vendor) ----
        const viewedKey = `viewed_vendor_${vendorRow.id}`;

        function makeUUID() {
          return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        }

        let sessionId = sessionStorage.getItem("yuso_session");
        if (!sessionId) {
          sessionId = makeUUID();
          sessionStorage.setItem("yuso_session", sessionId);
        }

        if (!sessionStorage.getItem(viewedKey)) {
          const { error: viewErr } = await supabase.from("store_views").insert({
            vendor_id: vendorRow.id,
            session_id: sessionId,
            user_agent: navigator.userAgent,
          });

          if (!viewErr) {
            sessionStorage.setItem(viewedKey, "1");
          } else {
            console.error("Store view insert failed:", viewErr);
          }
        }
        // --------------------------------------------------------

        const { data: productRows, error: prodErr } = await supabase
          .from("products")
.select(`
  id,
  name,
  price,
  original_price,
  thumbnail_url,
  stock_qty,
  created_at,
  slug,
  variants:product_variations(
    id,
    title,
    regular_price,
    sale_price
  )
`)
          .eq("vendor_id", vendorRow.id);

        if (prodErr) throw prodErr;

        setProducts(productRows || []);
      } catch (err: any) {
        console.error("Load error:", JSON.stringify(err, null, 2));
        setError("Unable to load vendor.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [slug]);

  useEffect(() => {
  const sortParam = searchParams.get("sort");

  if (sortParam) {
    setSort(sortParam);
  } else {
    setSort("featured");
  }
}, [searchParams]);

  if (loading)
    return (
      <div>
        <Header />
        <div style={{ padding: 80, textAlign: "center" }}>Loading store…</div>
      </div>
    );

  if (error)
    return (
      <div>
        <Header />
        <div style={{ padding: 80, textAlign: "center" }}>{error}</div>
      </div>
    );

  if (!vendor)
    return (
      <div>
        <Header />
        <div style={{ padding: 80, textAlign: "center" }}>Vendor not found.</div>
      </div>
    );

  let filtered = products.filter((p) => {
    let ok = true;

    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) ok = false;
    if (minPrice && p.price < Number(minPrice)) ok = false;
    if (maxPrice && p.price > Number(maxPrice)) ok = false;
    if (inStockOnly && p.stock_qty <= 0) ok = false;

    return ok;
  });

  if (sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (sort === "newest")
    filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (sort === "best") {
  filtered.sort((a, b) => {
    if (a.stock_qty === b.stock_qty) {
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    }
    return b.stock_qty - a.stock_qty;
  });
}

  return (
    <div className="vendor-storefront" style={{ background: "#f7f7f8" }}>
      <Header />

      {/* ================================
         FULL-WIDTH VENDOR HERO
      ================================= */}
      <div className="vendor-hero">
        {/* Banner */}
        <div
          className="vendor-hero-banner"
          style={{
            backgroundImage: vendor.store_banner
              ? `url(${vendor.store_banner})`
              : "linear-gradient(135deg,#ddd,#bbb)",
          }}
        />

        {/* White info bar */}
        <div className="vendor-hero-card">
          <div className="vendor-hero-inner">
            <div
              className="vendor-hero-logo"
              style={{
                backgroundImage: vendor.store_logo
                  ? `url(${vendor.store_logo})`
                  : "url(/placeholder.png)",
              }}
            />

            <div className="vendor-hero-meta">
              <h1>{vendor.store_name}</h1>
              <span>{vendor.store_description || "Trusted vendor on YusoMarket"}</span>
            </div>

            {vendor.support_email && (
              <a href={`mailto:${vendor.support_email}`} className="vendor-hero-cta">
                Message Seller
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="vendor-hero-tabs">
          <div className="vendor-hero-inner">
            <Link href={`/vendors/${slug}`}>Store Home</Link>
            <Link href={`/vendors/${slug}?all=true`}>All Products</Link>
            <Link href={`/vendors/${slug}?sort=newest`}>New Arrivals</Link>
            <Link href={`/vendors/${slug}?sort=best`}>Popular Items</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 16px 60px" }}>
        <div className="layout">
          {/* FILTERS */}
          <aside className="filters-box">
            <h3 className="filters-title">Search & Filters</h3>

            <input
              className="filter-input"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="filter-block">
              <label>Price Range</label>

              <div className="price-row">
                <input
                  className="price-input"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>—</span>
                <input
                  className="price-input"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In stock only
            </label>

            <button
              className="clear-btn"
              onClick={() => {
                setSearch("");
                setMinPrice("");
                setMaxPrice("");
                setInStockOnly(false);
              }}
            >
              Reset Filters
            </button>
          </aside>

          {/* PRODUCTS */}
          <section className="products-box">
            <div className="top-controls">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

<div className="vendor-products-grid">

  {filtered.map((p) => (
    <div key={p.id} className="product-card modern-card">

      <div className="modern-image-wrap">

        {p.original_price && p.original_price > p.price && (
          <span className="modern-badge">
            -{Math.round((1 - p.price / p.original_price) * 100)}%
          </span>
        )}

        <Link href={`/product/${p.slug}`}>
          <img
            src={p.thumbnail_url || "/images/placeholder-product.jpg"}
            alt={p.name}
            loading="lazy"
          />
        </Link>

      </div>

      <div className="modern-content">

        <Link href={`/product/${p.slug}`} className="modern-title">
          {p.name}
        </Link>

        <div className="modern-price-stack">

          {p.original_price && p.original_price > p.price && (
            <span className="modern-original">
              A${p.original_price.toFixed(2)}
            </span>
          )}

          <span className="modern-price">
            A${p.price.toFixed(2)}
          </span>

        </div>

{p.variants?.length ? (

<button
  className="modern-cart-btn"
  onClick={(e) => {
    e.preventDefault();
    setQuickViewProduct(p);
    setSelectedVariantId(p.variants?.[0]?.id ?? null);
  }}
  type="button"
  aria-label="Quick view"
>
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
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
</button>

) : (

<button
  className="modern-cart-btn"
onClick={async (e) => {

  e.preventDefault();

  try {

    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: p.id,
        variantId: null,
        quantity: 1,
      }),
    });

    if (!res.ok) throw new Error("Add to cart failed");

    const data = await res.json();

  } catch (err) {
    console.error("Add to cart error:", err);
  }

}}

  type="button"
  aria-label="Add to cart"
>
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
</button>

)}

      </div>

    </div>
  ))}

</div>
          </section>
        </div>
      </div>

{quickViewProduct && (
  <div
    className="quickview-backdrop"
    onClick={() => setQuickViewProduct(null)}
  >
    <div
      className="quickview-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="quickview-close"
        onClick={() => setQuickViewProduct(null)}
      >
        ✕
      </button>

      <div className="quickview-body">
        <div className="quickview-image-wrap">
          <img
            src={
              quickViewProduct.thumbnail_url ||
              "/images/placeholder-product.jpg"
            }
            alt={quickViewProduct.name}
          />
        </div>

        <div className="quickview-info">
          <h3 className="quickview-title">
  {quickViewProduct.name}
</h3>

<p className="quickview-vendor">
  Sold by{" "}
  <Link href={`/vendors/${vendor.slug}`}>
    {vendor.store_name}
  </Link>
</p>

<div className="quickview-price-row">
  <span className="quickview-price">
    A${
  (
    selectedVariant?.sale_price ??
    selectedVariant?.regular_price ??
    quickViewProduct.price
  ).toFixed(2)
}
  </span>

{selectedVariant?.sale_price && selectedVariant?.regular_price && (
  <span className="quickview-original">
    A${selectedVariant.regular_price.toFixed(2)}
  </span>
)}
</div>

{quickViewProduct.variants?.length > 0 && (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 6,
        display: "block",
      }}
    >
      Choose option
    </label>

<select
  className="quickview-select"
  value={selectedVariantId ?? ""}
  onChange={(e) => setSelectedVariantId(e.target.value)}
>
      {quickViewProduct.variants.map((variant) => (
<option key={variant.id} value={variant.id}>
  {variant.title}
</option>
      ))}
    </select>
  </div>
)}

<div className="quickview-actions">

  <button
    className="quickview-add"
    disabled={quickViewProduct.variants?.length > 0 && !selectedVariantId}
onClick={async () => {

  try {

const res = await fetch("/api/cart/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    productId: quickViewProduct.id,
    variantId: selectedVariantId ?? null,
    quantity: 1,
  }),
});

const data = await res.json();

setCartCount(data.cartCount);
window.dispatchEvent(new Event("cart:updated"));

    setQuickViewProduct(null);

  } catch (err) {
    console.error("Add to cart error:", err);
  }

}}
  >
    + Add to cart
  </button>

  <Link
    href={`/product/${quickViewProduct.slug}`}
    className="quickview-view"
  >
    View full details →
  </Link>

</div>
        </div>
      </div>
    </div>
  </div>
)}

<Footer />


<style jsx global>{`
  .vendor-storefront {
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  }

  /* kill default anchor styling inside this page */
  .vendor-storefront a {
    color: inherit;
    text-decoration: none;
  }

      .top-controls {
  margin-bottom: 20px; /* creates air above cards */
}

.top-controls select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 13px;
  background: #fff;
}

.vendor-products-grid{
  display:grid;
  grid-template-columns: repeat(2,1fr);
  gap:12px;
}

@media (min-width:640px){
.vendor-products-grid{
  grid-template-columns: repeat(3,1fr);
}
}

@media (min-width:1024px){
.vendor-products-grid{
  grid-template-columns: repeat(5,1fr);
}
}
        /* =======================
           VENDOR HERO (SAFE MODE)
        ======================= */

        .vendor-hero {
          position: relative;
          margin-bottom: 40px;
          padding-top: 40px;
          background: #f7f7f8;
        }

        .vendor-hero-banner {
          display: none;
        }
          

        .vendor-hero-card {
          max-width: 1180px;
          margin: 0 auto;
          background: #ffffff;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.08);
          border-radius: 14px;
        }

        .vendor-hero-inner {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .vendor-hero-logo {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 2px solid #e5e7eb;
          flex-shrink: 0;
        }

        .vendor-hero-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .vendor-hero-meta h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.1;
        }

        .vendor-hero-meta span {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.2;
        }

.vendor-hero-cta {
  margin-left: auto;

  background: #ffffff;
  color: #020617;

  border: 1px solid #e5e7eb;

  padding: 7px 14px;
  border-radius: 999px;

  font-size: 12px;
  font-weight: 700;

  white-space: nowrap;
  text-decoration: none;

  transition: all .2s ease;
}

.vendor-hero-cta:hover {
  border-color: #385fa2;
  color: #385fa2;
}

        .vendor-hero-tabs {
          max-width: 1180px;
          margin: 10px auto 0;
          background: #ffffff;
          padding: 10px 16px;
          display: flex;
          gap: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
        }

        .vendor-hero-tabs :global(a) {
          font-size: 12px;
          font-weight: 700;
          color: #111;
          text-decoration: none;
        }

        .vendor-hero-tabs :global(a:hover) {
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .vendor-hero-card,
          .vendor-hero-tabs {
            max-width: calc(100% - 32px);
          }

          .vendor-hero-tabs {
            overflow-x: auto;
            white-space: nowrap;
          }

          .vendor-hero-logo {
            width: 44px;
            height: 44px;
          }

          .vendor-hero-meta h1 {
            font-size: 16px;
          }

          .vendor-hero-meta span {
            font-size: 11px;
          }

          .vendor-hero-cta {
            font-size: 11px;
            padding: 6px 12px;
          }
        }

        .quickview-add {
  height: 46px;
  padding: 0 30px;
  border-radius: 999px;
  border: none;

  background: linear-gradient(
    135deg,
    #385fa2,
    #2f4f88
  );

  color: #ffffff;
  font-size: 14.5px;
  font-weight: 750;

  box-shadow: 0 10px 24px rgba(56,95,162,0.35);
  cursor: pointer;

  transition: all .25s ease;
}

.quickview-add:hover {
  background: linear-gradient(
    135deg,
    #fc8700,
    #e67600
  );

  box-shadow: 0 14px 30px rgba(252,135,0,0.45);
  transform: translateY(-1px);
}

.quickview-vendor {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 14px;
}

.quickview-vendor a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
}
        /* =======================
           LAYOUT / FILTERS
        ======================= */

        .layout {
          display: flex;
          gap: 24px;
        }

        .filters-box {
          width: 250px;
          background: white;
          border: 1px solid #eee;
          padding: 18px;
          border-radius: 14px;
        }

        .filters-title {
          margin-bottom: 10px;
          font-weight: 600;
        }

        .filter-input {
          width: 100%;
          padding: 9px 12px;
          border-radius: 10px;
          border: 1px solid #ddd;
          margin-bottom: 14px;
        }

        .filter-block label {
          font-size: 13px;
          font-weight: 700;
        }

        .price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 6px 0 10px;
        }

        .price-input {
          width: 100%;
          padding: 8px 10px;
          border-radius: 10px;
          border: 1px solid #ddd;
        }

        .clear-btn {
          margin-top: 10px;
          width: 100%;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid #ddd;
          background: #fafafa;
          cursor: pointer;
        }

        .products-box {
          flex: 1;
        }

        @media (max-width: 900px) {
          .layout {
            flex-direction: column;
          }

          .filters-box {
            width: 100%;
          }
        }

/* =========================
   MODERN PRODUCT CARD
========================= */

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
  line-height: 1.05;
  gap: 2px;
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
  font-weight:700;
  color: #020617;
}

.modern-cart-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: #2563eb;
  color: #ffffff;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: all .2s ease;
}

.modern-cart-btn:hover {
  background: #1d4ed8;
  transform: scale(1.05);
}

.quickview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,0.42);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 190;
}

.quickview-modal {
  width: 100%;
  max-width: 900px;
  border-radius: 28px;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(2,6,23,0.25);
  position: relative;
}

.quickview-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: #fff;
  font-size: 18px;
  cursor: pointer;
}

.quickview-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.quickview-image-wrap {
  background: #0f172a;
  min-height: 460px;
}

.quickview-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quickview-info {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quickview-title {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #020617;
  margin: 0 0 6px 0;
}
  
.quickview-price-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.quickview-price {
  font-size: 32px;
  font-weight: 900;
}

.quickview-original {
  text-decoration: line-through;
  color: #94a3b8;
}

.quickview-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 22px;
}

.quickview-view {
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  font-weight: 700;
}

.quickview-option-label {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 6px;
  display: block;
}

.quickview-select {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 500;
  background: #ffffff;
  color: #0f172a;
}

/* =========================
   QUICKVIEW MOBILE FIX
========================= */

@media (max-width: 768px) {

.quickview-backdrop {
  padding: 18px;
  align-items: center;
  justify-content: center;
}
  
.quickview-modal {
  width: calc(100vw - 36px);
  max-width: 420px;
  margin: 0 auto;
  border-radius: 28px;
}

  .quickview-body {
    grid-template-columns: 1fr;
  }

  .quickview-image-wrap {
    min-height: 240px;
    height: 340px;
  }

  .quickview-image-wrap img {
    height: 100%;
    object-fit: cover;
  }

  .quickview-info {
    padding: 26px 22px 30px;
  }

  .quickview-title {
    font-size: 20px;
  }

  .quickview-price {
    font-size: 26px;
  }

  .quickview-vendor {
    font-size: 12px;
  }

  .quickview-select {
    height: 38px;
    font-size: 13px;
  }

  /* CRITICAL: button stack */
.quickview-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 22px;
}

  .quickview-add,
.quickview-view {
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  text-decoration: none;
  font-weight: 700;
  width: 100%;
  text-align: center;
}

  .quickview-add {
    height: 44px;
    font-size: 12px;
      position: relative;
  z-index: 2;
  }

  .quickview-view {
    height: 42px;
    font-size: 12px;
  }

  .quickview-add,
.quickview-view {
  width: 100%;
  max-width: 320px;
}
}

      `}</style>
    </div>
  );
}
