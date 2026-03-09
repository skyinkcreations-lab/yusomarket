"use client";

import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { Product, ProductVariant } from "../pageData";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function slugOrId(base: string, slug: string | null) {
  return slug ? slug : base;
}

function formatAUD(n: number) {
  if (Number.isNaN(Number(n))) return "A$0.00";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(Number(n));
}

function normalizeSearch(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

function productHref(p: Product) {
  return `/product/${slugOrId(p.id, p.slug ?? null)}`;
}

function vendorHref(p: Product) {
  return p.vendorSlug ? `/vendors/${p.vendorSlug}` : "/vendors";
}

/* ===============================
   PRODUCT CARD (IDENTICAL TO HOME)
================================= */

type ProductCardProps = {
  p: Product;
  onAddToCart: (p: Product) => void;
  onQuickView: (p: Product) => void;
};

function ProductCard({ p, onAddToCart, onQuickView }: ProductCardProps) {

  const href = `/product/${slugOrId(p.id, p.slug)}`;

  return (
    <div className="product-card modern-card">

      <div className="modern-image-wrap">

        {p.originalPrice && p.originalPrice > p.price ? (
          <span className="modern-badge">
            -{Math.round((1 - p.price / p.originalPrice) * 100)}%
          </span>
        ) : null}

        <Link href={href}>
          <img
            src={p.thumbnailUrl || "/images/placeholder-product.jpg"}
            alt={p.name}
            loading="lazy"
          />
        </Link>

      </div>

      <div className="modern-content">

        <Link href={href} className="modern-title">
          {p.name}
        </Link>

        <div className="modern-price-stack">

          {p.originalPrice && p.originalPrice > p.price ? (
            <span className="modern-original">
              {formatAUD(p.originalPrice)}
            </span>
          ) : null}

          <span className="modern-price">
            {formatAUD(p.price)}
          </span>

        </div>

        {p.variants?.length ? (

          <button
            className="modern-cart-btn"
            onClick={() => onQuickView(p)}
            type="button"
            aria-label="Quick view"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>

        ) : (

          <button
            className="modern-cart-btn"
            onClick={() => onAddToCart(p)}
            type="button"
            aria-label="Add to cart"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="20" r="1"/>
              <circle cx="18" cy="20" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>

        )}

      </div>

    </div>
  );
}

/* ===============================
   SEARCH PAGE
================================= */

export default function SearchPage() {

  const [list, setList] = useState<any[]>([]);
  const [query, setQuery] = useState("");

const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

const toastTimeout = useRef<number | null>(null);

  const [toast, setToast] = useState<{
  show: boolean;
  message: string;
  type: "success" | "error";
}>({
  show: false,
  message: "",
  type: "success",
});

useEffect(() => {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const raw = params.get("q") ?? "";
  const q = normalizeSearch(raw);

  setQuery(q);

  async function load() {
    const { data } = await supabase.rpc("search_products", {
      search_query: q,
    });
    setList(data ?? []);
  }

  load();
}, []);

  const selectedVariant = useMemo<ProductVariant | null>(() => {

    if (!quickViewProduct?.variants?.length) return null;

    return quickViewProduct.variants.find(
  (v: ProductVariant) => v.id === selectedVariantId
) ?? null;

  }, [quickViewProduct, selectedVariantId]);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setSelectedVariantId(product?.variants?.[0]?.id ?? null);
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
  setToast({ show: true, message, type });

if (toastTimeout.current) {
  clearTimeout(toastTimeout.current);
}

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

  const hasResults = list.length > 0;

  return (
    <>
      <Header />

      <section
        style={{
          background: "#385fa2",
          color: "#fff",
          padding: "60px 0 52px",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>
            Search Results
          </h1>

          <p style={{ opacity: 0.9 }}>
            {query && `${list.length} results for "${query}"`}
          </p>
        </div>
      </section>

      <main
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "40px 24px 90px",
        }}
      >

        {hasResults ? (

          <div className="product-feed-grid">

{list.map((product) => (
  <ProductCard
    key={product.id}
    p={{
      ...product,
      thumbnailUrl: product.thumbnail_url,
      originalPrice: product.original_price,
      vendorName: product.vendor_name,
      vendorSlug: product.vendor_slug,
      variants: product.variants?.map((v: any) => ({
  ...v,
  label: v.label ?? v.title,
  originalPrice: v.original_price,
}))
    }}
    onAddToCart={(p) => handleAddToCart(p, null)}
    onQuickView={handleQuickView}
  />
))}

          </div>

        ) : (

          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <h2>No products found</h2>
          </div>

        )}

      </main>

      <Footer />
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
                      quickViewProduct.thumbnailUrl ||
                      "/images/placeholder-product.jpg"
                    }
                    alt={quickViewProduct.name}
                  />
                </div>

                <div className="quickview-info">
                  <h3>{quickViewProduct.name}</h3>

                  {quickViewProduct.vendorName && (
                    <p className="quickview-vendor">
                      Sold by{" "}
                      <Link href={vendorHref(quickViewProduct)}>
                        {quickViewProduct.vendorName}
                      </Link>
                    </p>
                  )}

                  <div className="quickview-price-row">
                    <span className="quickview-price">
                      {formatAUD(selectedVariant?.price ?? quickViewProduct.price)}
                    </span>
                    {(selectedVariant?.originalPrice ?? quickViewProduct.originalPrice) && (
<span className="quickview-original">
  {formatAUD(
    selectedVariant?.originalPrice ??
    quickViewProduct.originalPrice ??
    0
  )}
</span>
)}
                  </div>

{quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 6,
        display: "block",
        color: "#111827",
      }}
    >
      Choose option
    </label>

    <select
      value={selectedVariantId ?? ""}
      onChange={(e) => setSelectedVariantId(e.target.value)}
      style={{
        width: "100%",
        height: 40,
        borderRadius: 10,
        border: "1px solid #e5e7eb",
        padding: "0 12px",
        fontSize: 13,
        fontWeight: 600,
        background: "#ffffff",
        cursor: "pointer",
      }}
    >
      <option value="" disabled>
        Select an option
      </option>

      {quickViewProduct.variants.map((variant: ProductVariant) => (
        <option key={variant.id} value={variant.id}>
          {variant.label}
        </option>
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
    if (ok) {
      setQuickViewProduct(null);
    }
  }}
>
  + Add to cart
</button>

                    <Link
                      href={productHref(quickViewProduct)}
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

        {toast.show && (
  <div className={`cart-toast ${toast.type === "error" ? "error" : "success"}`}>
    {toast.message}
  </div>
)}
<style>{`

.product-card {
width:100%;
}

.product-feed-grid{
display:grid;
grid-template-columns:repeat(2,1fr);
gap:12px;
}

@media(min-width:640px){
.product-feed-grid{
grid-template-columns:repeat(3,1fr);
}
}

@media(min-width:1024px){
.product-feed-grid{
grid-template-columns:repeat(5,1fr);
}
}

.modern-card{
background:#fff;
border-radius:10px;
padding:10px;
box-shadow:0 8px 26px rgba(15,23,42,0.08);
transition:all .22s ease;
}

.modern-card:hover{
transform:translateY(-5px);
box-shadow:0 16px 40px rgba(15,23,42,0.12);
}

.modern-image-wrap{
position:relative;
border-radius:18px;
overflow:hidden;
background:#f3f4f6;
aspect-ratio:1/1;
}

.modern-image-wrap img{
width:100%;
height:100%;
object-fit:cover;
transition:transform .35s ease;
}

.modern-card:hover img{
transform:scale(1.05);
}

.modern-badge{
position:absolute;
top:10px;
left:10px;
background:#385fa2;
color:white;
font-size:10.5px;
font-weight:800;
padding:5px 9px;
border-radius:999px;
z-index:3;
}

.modern-content{
padding:10px 6px 4px;
display:grid;
grid-template-columns:1fr auto;
gap:6px;
align-items:end;
}

.modern-title{
font-size:13px;
font-weight:500;
color:#0f172a;
text-decoration:none;
line-height:1.35;
grid-column:1/span 2;
display:-webkit-box;
-webkit-line-clamp:2;
-webkit-box-orient:vertical;
overflow:hidden;
}

.modern-price-stack{
display:flex;
flex-direction:column;
line-height:1.1;
}

.modern-original{
font-size:11px;
color:#94a3b8;
text-decoration:line-through;
}

.modern-price{
font-size:18px;
font-weight:800;
color:#020617;
}

.modern-cart-btn{
width:38px;
height:38px;
border-radius:12px;
border:none;
background:#2563eb;
color:white;
display:flex;
align-items:center;
justify-content:center;
cursor:pointer;
}

.quickview-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2,6,23,0.42);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 190;
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
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.35);
  box-shadow:
    0 20px 60px rgba(2,6,23,0.25),
    inset 0 1px 0 rgba(255,255,255,0.4);
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
  cursor: pointer;
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

.quickview-image-wrap img:hover {
  transform: scale(1.03);
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
  color: #2563eb;
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
  box-shadow: 0 10px 24px rgba(56,95,162,0.35);
  cursor: pointer;
  transition: all .25s ease;
}

.quickview-add:hover {
  background: linear-gradient(135deg, #fc8700, #e67600);
  box-shadow: 0 14px 30px rgba(252,135,0,0.45);
  transform: translateY(-1px);
}

.quickview-add:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .quickview-backdrop {
    padding: 18px;
    align-items: center;
    justify-content: center;
  }

  .quickview-modal {
    overflow: hidden;
    border-radius: 28px;
    max-width: 100%;
    animation: quickViewMobileIn .25s ease-out;
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
  }

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
    height: 100%;
    border-radius: 26px 26px 0 0;
    object-fit: cover;
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

  .quickview-add,
  .quickview-view {
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

@keyframes quickViewMobileIn {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
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
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.cart-toast.error {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
  }
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

`}</style>

    </>
  );
}