"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

type ProductVariant = {
  id: string;
  label: string;
  price: number;
};

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
  variants?: ProductVariant[]; // <-- ADD THIS LINE
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

// Toast state + ref
const [toast, setToast] = useState<{
  show: boolean;
  message: string;
  type: "success" | "error";
}>({
  show: false,
  message: "",
  type: "success",
});

// Quick view state
const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

const selectedVariant = useMemo(() => {
  if (!quickViewProduct?.variants?.length) return null;

  return quickViewProduct.variants.find(
    (v) => v.id === selectedVariantId
  ) ?? null;
}, [quickViewProduct, selectedVariantId]);

// Ref to store timeout ID
const toastTimeout = useRef<number | null>(null);

// Show toast function
const showToast = (message: string, type: "success" | "error" = "success") => {
  setToast({ show: true, message, type });

  if (toastTimeout.current) clearTimeout(toastTimeout.current);

  toastTimeout.current = window.setTimeout(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, 2200);
};

const handleAddToCart = async (product: Product, variantId: string | null) => {
  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: product.id,
        variantId,
        quantity: 1,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      showToast(data?.error || "Failed to add item to cart", "error");
      return false;
    }

    showToast(`${product.name} added to cart`, "success");
    window.dispatchEvent(new Event("cart:updated"));

    return true;

  } catch (error) {
    showToast("Something went wrong adding to cart", "error");
    return false;
  }
};

const handleQuickView = (product: Product) => {
  setQuickViewProduct(product);

  // DEFAULT TO FIRST VARIANT (CRITICAL)
  setSelectedVariantId(product?.variants?.[0]?.id ?? null);
};

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

      productIds = tagLinks?.map((l: { product_id: string }) => l.product_id) || [];
    } else {
      // CATEGORY VIEW
      const { data: categoryLinks } = await supabase
        .from("product_category_links")
        .select("product_id")
        .eq("category_id", category.id);

      productIds = categoryLinks?.map((l: { product_id: string }) => l.product_id) || [];
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
            <span className="modern-original">{formatAUD(p.original_price)}</span>
          ) : null}
          <span className="modern-price">{formatAUD(p.price)}</span>
        </div>

<div className="modern-actions">
  {/* Quick View button */}
  <button
    className="modern-cart-btn"
    onClick={() => handleQuickView(p)}
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

  {/* Add to Cart button */}
  <button
    className="modern-cart-btn"
    aria-label="Add to cart"
    onClick={async () => await handleAddToCart(p, null)}
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
</div>
      </div>
    </div>
  ))}
</div>
      )}
     </main>
  </div>        {/* yuso-layout */}
</div>          {/* yuso-wrap */}
</div>          {/* yuso-page */}

{quickViewProduct && (
  <div className="quickview-backdrop" onClick={() => setQuickViewProduct(null)}>
    <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>

      <button className="quickview-close" onClick={() => setQuickViewProduct(null)}>
        ✕
      </button>

      <div className="quickview-body">
        <div className="quickview-image-wrap">
          <img
            src={quickViewProduct.thumbnail_url || "/images/placeholder-product.jpg"}
            alt={quickViewProduct.name}
          />
        </div>

        <div className="quickview-info">
          <h3>{quickViewProduct.name}</h3>

          {quickViewProduct.vendor_name && (
            <p className="quickview-vendor">
              Sold by <Link href={`/vendors/${quickViewProduct.vendor_name}`}>{quickViewProduct.vendor_name}</Link>
            </p>
          )}

          <div className="quickview-price-row">
            <span className="quickview-price">
              {formatAUD(selectedVariant?.price ?? quickViewProduct.price)}
            </span>
            {(selectedVariant?.originalPrice ?? quickViewProduct.original_price) && (
              <span className="quickview-original">
                {formatAUD(selectedVariant?.originalPrice ?? quickViewProduct.original_price ?? 0)}
              </span>
            )}
          </div>

          {quickViewProduct.variants?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, display: "block", color: "#111827" }}>
                Choose option
              </label>
              <select
                value={selectedVariantId ?? ""}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                style={{ width: "100%", height: 40, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px", fontSize: 13, fontWeight: 600, background: "#fff", cursor: "pointer" }}
              >
                <option value="" disabled>Select an option</option>
                {quickViewProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="quickview-actions">
            <button
              className="quickview-add"
              disabled={(quickViewProduct.variants?.length ?? 0) > 0 && !selectedVariantId}
              onClick={async () => {
                const ok = await handleAddToCart(quickViewProduct, selectedVariantId);
                if (ok) setQuickViewProduct(null);
              }}
            >
              + Add to cart
            </button>

            <Link href={`/product/${quickViewProduct.slug}`} className="quickview-view">
              View full details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

<Footer />

{toast.show && (
  <div className={`cart-toast ${toast.type === "error" ? "error" : "success"}`}>
    {toast.message}
  </div>
)}

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
  background: #31538e;
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
  background: #31538e;
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
  background: #31538e;
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
  background: #27457a;
  transform: scale(1.05);
}

.yuso-content {
  min-height: clamp(420px, 65vh, 900px);
}

.yuso-products {
  align-items: stretch;
}

.cart-toast {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 260;
  min-width: 220px;
  max-width: 320px;
  padding: 14px 16px;
  border-radius: 14px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  box-shadow: 0 18px 40px rgba(15,23,42,0.22);
  animation: toastIn .22s ease, toastOut .22s ease 1.98s forwards;
}

.cart-toast.success {
  background: linear-gradient(135deg, #31538e, #31538e);
}

.cart-toast.error {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

@keyframes toastIn {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes toastOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to   { opacity: 0; transform: translateY(10px) scale(0.98); }
}

@media (max-width: 768px) {
  .cart-toast {
    left: 12px;
    right: 12px;
    bottom: 12px;
    max-width: none;
    min-width: 0;
  }
}
  .quickview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quickview-modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 450px;
  width: 95%;
  text-align: center;
}

.quickview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,0.42);
  backdrop-filter: blur(5px);
  z-index: 500;
  display: flex;
  padding: 18px;
  align-items: center;
  justify-content: center;
}

.quickview-modal {
  width: 100%;
  max-width: 960px;
  border-radius: 30px;
  background: #ffffff;
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.35);
  box-shadow: 0 20px 60px rgba(2,6,23,0.25), inset 0 1px 0 rgba(255,255,255,0.4);
  position: relative;
  overflow: hidden;
  animation: quickViewIn .28s ease-out;
}

.quickview-close {
  top: 10px;
  right: 10px;
  position: absolute;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  color: #020617;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 22px rgba(2,6,23,0.25);
  border: 1px solid rgba(2,6,23,0.08);
  z-index: 20;
}

.quickview-close:hover {
  transform: rotate(90deg) scale(1.05);
}

.quickview-body {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 0;
  min-height: 460px;
}

.quickview-image-wrap {
  position: relative;
  z-index: 1;
  min-height: 460px;
  padding: 0;
  overflow: hidden;
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
  background: #0f172a;
  transform: translateZ(0);
  margin-right: -1px;
}

.quickview-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
}

.quickview-info {
  background: #ffffff;
  padding: 54px 52px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quickview-info h3 {
  font-size: 26px;
  font-weight: 950;
  letter-spacing: -0.9px;
  color: #020617;
  margin-bottom: 6px;
}

.quickview-vendor {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 14px;
}

.quickview-vendor a {
  color: #31538e;
  text-decoration: none;
  font-weight: 600;
}

.quickview-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.quickview-price {
  font-size: 32px;
  font-weight: 950;
  letter-spacing: -1.2px;
  color: #020617;
}

.quickview-original {
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  text-decoration: line-through;
}

.quickview-actions {
  display: flex;
  gap: 12px;
  margin-top: 26px;
}

.quickview-add {
  height: 46px;
  padding: 0 30px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #385fa2, #2f4f88);
  color: #ffffff;
  font-size: 14.5px;
  font-weight: 750;
  cursor: pointer;
  transition: all .25s ease;
}

.quickview-add:hover {
  background: linear-gradient(135deg, #27457a, #27457a);
  transform: translateY(-1px);
}

.quickview-view {
  height: 46px;
  padding: 0 26px;
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  font-size: 14px;
  font-weight: 650;
  color: #0f172a;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  transition: all .2s ease;
}

.quickview-view:hover {
  border-color: #385fa2;
  color: #385fa2;
}

@keyframes quickViewIn {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (max-width: 768px) {
  .quickview-body {
    grid-template-columns: 1fr;
    min-height: auto;
  }
  .quickview-image-wrap {
    min-height: 240px;
    height: 340px;
    border-radius: 10px 10px 0 0;
  }
  .quickview-image-wrap img {
    border-radius: 26px 26px 0 0;
  }
  .quickview-info {
    padding: 26px 22px 30px;
    border-bottom-left-radius: 26px;
    border-bottom-right-radius: 26px;
  }
  .quickview-info h3 {
    font-size: 20px;
    letter-spacing: -0.4px;
  }
  .quickview-price {
    font-size: 26px;
  }
  .quickview-vendor {
    font-size: 12px;
  }
  .quickview-actions {
    flex-direction: column;
    gap: 10px;
    margin-top: 18px;
  }
  .quickview-add, .quickview-view {
    width: 100%;
    justify-content: center;
  }
  .quickview-add {
    height: 44px;
    font-size: 12px;
  }
  .quickview-view {
    height: 42px;
    font-size: 12px;
  }
}
`}</style>
    </>
  );
}
