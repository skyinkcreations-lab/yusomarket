// app/HomeClient.tsx
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Header from "./_components/Header";
import Footer from "./_components/Footer";
import {
  CategoryPill,
  Product,
  VendorCardData,
  BrandChip,
  moreOffers,
} from "./pageData";

// ---------- helpers ----------

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

function useAutoScroll(ref: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    let dir = 1;
    const id = setInterval(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;

      if (container.scrollLeft >= maxScroll - 4) dir = -1;
      if (container.scrollLeft <= 4) dir = 1;

      container.scrollBy({ left: 140 * dir, behavior: "smooth" });
    }, 3500);

    return () => clearInterval(id);
  }, [ref]);
}

const navArrowStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  border: "1px solid #d1d5db",
  background: "#ffffff",
  cursor: "pointer",
  fontSize: 14,
};

const trustItemStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#4b5563",
};

// Only show these preset categories (plus the special vendors pill)
const ALLOWED_CATEGORY_SLUGS = new Set([
  "electronics",
  "fashion",
  "home-living",        // ← FIXED
  "beauty",
  "sports",             // ← FIXED
  "toys",
  "pets",
  "automotive",
  "office-business",    // ← FIXED
  "health-wellness",    // ← FIXED
  "outdoors",
  "gaming",
  "cooking-items",      // ← you missed this one
]);



// ---------- Product card ----------

type ProductCardProps = {
  p: any;
  onAddToCart: (p: any) => void;
  onQuickView: (p: any) => void;
};

function ProductCard({ p, onAddToCart, onQuickView }: ProductCardProps) {

  const productHref = `/product/${slugOrId(p.id, p.slug)}`;

  return (
    <div className="product-card modern-card">

      <div className="modern-image-wrap">

        {/* SALE BADGE */}
        {p.originalPrice && p.originalPrice > p.price ? (
          <span className="modern-badge">
            -{Math.round((1 - p.price / p.originalPrice) * 100)}%
          </span>
        ) : null}

        <Link href={productHref}>
          <img
            src={p.thumbnailUrl || "/images/placeholder-product.jpg"}
            alt={p.name}
            loading="lazy"
          />
        </Link>

      </div>

      <div className="modern-content">

        <Link href={productHref} className="modern-title">
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
  onClick={() => onAddToCart(p, null)}
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
  );
}

// ---------- Vendor card ----------

type VendorCardProps = {
  v: VendorCardData;
};

function VendorCard({ v }: VendorCardProps) {
  const href = `/vendors/${slugOrId(v.id, v.slug)}`;

  return (
<div className="product-card clean-card vendor-clean-card">
      <div className="vendor-image-spacing">
        <Link href={href} style={{ display: "block" }}>
<div className="vendor-image-wrap">
            {v.logoUrl ? (
<img
  src={v.logoUrl}
  alt={v.storeName}
/>
            ) : (
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {v.storeName.charAt(0)}
              </span>
            )}
          </div>
        </Link>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#111827",
            marginBottom: 2,
          }}
        >
          {v.storeName}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#6b7280",
          }}
        >
          {v.tagline || "Trusted local vendor"}
        </div>
      </div>

<Link href={href} className="vendor-browse-btn">
  Browse shop
</Link>
    </div>
  );
}

// ---------- Carousels ----------

type ProductCarouselProps = {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref: string;
  onAddToCart: (p: Product, variantId: string | null) => void;
  onQuickView: (p: Product) => void;
};


function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllHref,
  onAddToCart,
  onQuickView,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useAutoScroll(scrollRef);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  if (!products.length) return null;

  return (
    <section style={{ marginBottom: 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 2,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 12, color: "#6b7280" }}>{subtitle}</p>
          )}
        </div>

        <Link
          href={viewAllHref}
          style={{
            fontSize: 12,
color: "#385fa2",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          View all →
        </Link>
      </div>

<div
  style={{
    position: "relative",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 4px, black calc(100% - 4px), transparent 100%)",
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 4px, black calc(100% - 4px), transparent 100%)",
  }}
>

  <div
    ref={scrollRef}
    style={{
  display: "flex",
  gap: 10,
  overflowX: "auto",
      paddingLeft: 0,
paddingRight: 0,
scrollPaddingLeft: 0,
scrollPaddingRight: 0,
      paddingBottom: 6,
      scrollbarWidth: "none",
    }}
  >
    {products.map((p) => (
  <ProductCard
    key={p.id}
    p={p}
    onAddToCart={(product) => onAddToCart(product, null)}
    onQuickView={onQuickView}
  />
))}

  </div>
</div>

{/* NAV ARROWS — MUST BE OUTSIDE THE MASK */}
<div
  style={{
    marginTop: 10,
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  }}
>
  <button onClick={() => scrollByAmount(-260)} style={navArrowStyle}>
    ←
  </button>
  <button onClick={() => scrollByAmount(260)} style={navArrowStyle}>
    →
  </button>
</div>
    </section>
  );
}

type VendorCarouselProps = {
  title: string;
  subtitle?: string;
  vendors: VendorCardData[];
};

function VendorCarousel({ title, subtitle, vendors }: VendorCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useAutoScroll(scrollRef);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  if (!vendors.length) return null;

  return (
    <section style={{ marginBottom: 36 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#111827",
              marginBottom: 2,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 12, color: "#6b7280" }}>{subtitle}</p>
          )}
        </div>

        <Link
          href="/vendors"
          style={{
            fontSize: 12,
            color: "#2563eb",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          View all →
        </Link>
      </div>

<div
  style={{
    position: "relative",
    maskImage:
      "linear-gradient(to right, transparent 0%, black 4px, black calc(100% - 4px), transparent 100%)",
    WebkitMaskImage:
      "linear-gradient(to right, transparent 0%, black 4px, black calc(100% - 4px), transparent 100%)",
  }}
>

  <div
    ref={scrollRef}
    style={{
      display: "flex",
      gap: 10,
      overflowX: "auto",
      paddingLeft: 0,
paddingRight: 0,
scrollPaddingLeft: 0,
scrollPaddingRight: 0,
      paddingBottom: 4,
      scrollbarWidth: "none",
    }}
  >
    {vendors.map((v) => (
      <VendorCard key={v.id} v={v} />
    ))}
  </div>
</div>

<div
  style={{
    marginTop: 10,
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  }}
>
  <button onClick={() => scrollByAmount(-260)} style={navArrowStyle}>
    ←
  </button>
  <button onClick={() => scrollByAmount(260)} style={navArrowStyle}>
    →
  </button>
</div>
    </section>
  );
}

// ---------- PRODUCT FEED GRID ----------

type ProductFeedProps = {
  initialProducts: Product[];
  onAddToCart: (p: Product, variantId: string | null) => void;
  onQuickView: (p: Product) => void;
};

function ProductFeed({
  initialProducts,
  onAddToCart,
  onQuickView,
}: ProductFeedProps) {

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

const loadMore = async () => {

  if (loading) return;

  setLoading(true);

  const lastProduct = products[products.length - 1];

  const res = await fetch(
    `/api/products/feed?cursor=${lastProduct.created_at}`
  );

  const data = await res.json();

  setProducts(prev => [...prev, ...data.products]);

  setLoading(false);
};

  return (
    <section style={{ marginBottom: 36 }}>

      <div className="product-feed-grid">

        {products.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            onAddToCart={(product) => onAddToCart(product, null)}
            onQuickView={onQuickView}
          />
        ))}

      </div>

      {products.length >= 70 && (
        <div className="feed-load-more">
         <button onClick={loadMore} disabled={loading}>
  {loading ? "Loading products..." : "Load more"}
</button>
        </div>
      )}

    </section>
  );
}
// ---------- Props ----------

export type HomeClientProps = {
  categories: CategoryPill[];
  latestProducts: Product[];
  bestSellerProducts: Product[];
  topVendors: VendorCardData[];
  brandChips: BrandChip[];
};

// ---------- Main component ----------

function FullWidthBanner() {
  return (
    <section style={{ width: "100%", margin: "10px 0 10px" }}>
      <div
        style={{
          width: "100%",
          height: 240,
          backgroundImage: `url("/images/home-banner.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </section>
  );
}

function HeroCarousel() {

  const images = [
    "/images/yusomarket-home-page-background.jpg",
    "/images/hero-marketplace.jpg",
    "/images/yusomarket-banner-image.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {

    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);

    return () => clearInterval(id);

  }, []);

  return (
    <section className="hero-carousel">

      {images.map((src, i) => (

        <div
          key={src}
          className="hero-slide"
          style={{
            backgroundImage: `url(${src})`,
            opacity: index === i ? 1 : 0,
          }}
        />

      ))}

    </section>
  );
}

export default function HomeClient({
  categories,
  latestProducts,
  bestSellerProducts,
  topVendors,
  brandChips,
}: HomeClientProps) {

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

const selectedVariant = useMemo(() => {
  if (!quickViewProduct?.variants?.length) return null;

  return (
    quickViewProduct.variants.find(
      (v) => v.id === selectedVariantId
    ) ?? null
  );
}, [quickViewProduct, selectedVariantId]);


  // Only show allowed categories + vendor pill (slug-based, safe)
  const displayCategories = useMemo(
    () =>
      categories.filter(
        (cat) =>
          cat.variant === "vendors" ||
          (cat.slug && ALLOWED_CATEGORY_SLUGS.has(cat.slug))
      ),
    [categories]
  );


  // add to cart -> real API + bubble
const handleAddToCart = async (
  product: Product,
  variantId: string | null
) => {
  try {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        productId: product.id,
        variantId: variantId ?? null,
        quantity: 1,
      }),
    });

    const data = await res.json().catch(() => ({} as any));

    if (!res.ok) {
      console.error("ADD TO CART FAILED:", data);
      return;
    }

    window.dispatchEvent(new Event("cart:updated"));

  } catch (err) {
    console.error("Failed to add to cart", err);
  }
};


const handleQuickView = (product: Product) => {
  setQuickViewProduct(product);

  // DEFAULT TO FIRST VARIANT (CRITICAL)
  setSelectedVariantId(
    (product as any)?.variants?.[0]?.id ?? null
  );
};


  const productHref = (p: Product) =>
    `/product/${slugOrId(p.id, p.slug ?? null)}`;

  const vendorHref = (p: Product) =>
    p.vendorSlug ? `/vendors/${p.vendorSlug}` : "/vendors";

return (
  <>
    <Header />


    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        overflowX: "hidden",
      }}
    >
      {/* ================================
    FULL WIDTH HERO
================================= */}
<HeroCarousel />

      {/* ================================
          BOXED CONTENT
      ================================= */}
      <div
  style={{
    maxWidth: 1180,
    margin: "0 auto",
    padding: "12px 15px 24px",
  }}
>


          {/* TRUST BAR */}
<section className="trust-bar">

  <div className="trust-row">

    <div className="trust-left">
      <span className="trust-icon">✔</span>
      <span>Why choose YusoMarket?</span>
    </div>

    <div className="trust-items">

      <div className="trust-item">
        🔒 Secure payments
      </div>

      <div className="trust-item">
        🚚 Fast delivery
      </div>

      <div className="trust-item">
        🛡 Buyer protection
      </div>

    </div>

  </div>

  <div className="trust-warning">
    ⚠ Security reminder: YusoMarket will never request payments via SMS or email links.
  </div>

</section>

          {/* SHOP BY CATEGORY */}
<section
  style={{
    marginTop: 16,
    marginBottom: 44,
  }}
>

  <h2
    style={{
      fontSize: 16,
      fontWeight: 600,
      marginBottom: 8,
      color: "#111827",
    }}
  >
    Shop by category
  </h2>

  <div className="category-carousel">
    {displayCategories.map((cat) => (
      <Link
        key={cat.id}
        href={cat.href}
        className={`category-pill ${
          cat.variant === "vendors" ? "vendors-pill" : ""
        }`}
      >
        {cat.label}
      </Link>
    ))}
  </div>

</section>


{/* LATEST PRODUCTS FEED */}

<section style={{ marginBottom: 36 }}>

  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 12,
    }}
  >
    <div>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: "#111827",
          marginBottom: 2,
        }}
      >
        Discover products
      </h2>

      <p style={{ fontSize: 12, color: "#6b7280" }}>
        Browse products from vendors across YusoMarket.
      </p>
    </div>

    <Link
      href="/search?sort=latest"
      style={{
        fontSize: 12,
        color: "#385fa2",
        textDecoration: "none",
      }}
    >
      View all →
    </Link>

  </div>

  <ProductFeed
    initialProducts={latestProducts}
    onAddToCart={handleAddToCart}
    onQuickView={handleQuickView}
  />

</section>


          {/* MORE OFFERS */}
          <section style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 6,
                color: "#111827",
              }}
            >
              More offers for you
            </h2>

            <p
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 14,
              }}
            >
              Explore curated drops and special events on YusoMarket.
            </p>

            <div
              style={{
                display: "flex",
                gap: 18,
                overflowX: "auto",
                paddingBottom: 4,
                scrollbarWidth: "none",
              }}
            >
              {moreOffers.map((offer, idx) => (
                <Link
  key={idx}
  href={offer.href}
  style={{
    minWidth: 180,
    height: 96,
    borderRadius: 10,
    background: offer.color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
    textAlign: "center",
    padding: "0 16px",
    textDecoration: "none",
    boxShadow: "0 6px 18px rgba(15,23,42,0.12)",
    transition: "transform .2s ease, box-shadow .2s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-3px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
  }}
>
  {offer.label}
</Link>
              ))}
            </div>
          </section>

{/* SHOP CTA BANNER */}
<section
  style={{
background: "#385fa2",
    borderRadius: 10,
    padding: "22px 24px",
    marginBottom: 0,
    color: "#ffffff", // ← force white text
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  }}
>
  <div style={{ maxWidth: 520 }}>
    <h2
      style={{
        fontSize: 20,
        fontWeight: 800,
        marginBottom: 6,
        color: "#ffffff", // ← explicit
      }}
    >
      Start shopping on YusoMarket
    </h2>

    <p
      style={{
        fontSize: 13,
        lineHeight: 1.5,
        color: "rgba(255,255,255,0.95)", // ← softer white for hierarchy
      }}
    >
      Discover products from independent vendors — all in one place.
    </p>
  </div>

  <Link
    href="/vendors"
    style={{
      padding: "10px 20px",
      borderRadius: 10,
      background: "#ffffff",
color: "#385fa2",
      fontSize: 14,
      fontWeight: 700,
      textDecoration: "none",
      whiteSpace: "nowrap",
    }}
  >
    Start shopping →
  </Link>
</section>

        </div>

        {/* QUICK VIEW MODAL */}
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
      selectedVariant?.originalPrice ?? quickViewProduct.originalPrice
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

      {quickViewProduct.variants.map((variant) => (
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
  disabled={quickViewProduct.variants?.length > 0 && !selectedVariantId}
  onClick={() => {
    handleAddToCart(quickViewProduct, selectedVariantId);
    setQuickViewProduct(null);
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
      </main>

      <Footer />

      {/* Styles copied from OG version */}
      <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.promo-marquee {
  width: 100%;
  height: 36px;
background: #385fa2;
  overflow: hidden;
  display: flex;
  align-items: center;
}

main {
  font-family: 'Inter', sans-serif;
}

.hero-bg {
  padding: 110px 0 60px;
}

/* Mobile */
@media (max-width: 768px) {
  .hero-bg {
    padding: 70px 0 80px;
  }
}

/* Large screens (optional) */
@media (min-width: 1400px) {
  .hero-bg {
    padding: 140px 0 100px;
  }
}



/* =========================
   TRUST BAR (TEMU STYLE)
========================= */

.trust-bar{
  margin:18px 0 26px;
  border-radius:10px;
  overflow:hidden;
  background:#ffffff;
  border:1px solid #e5e7eb;
}

/* top row */
.trust-row{
  background:#32548f;
  color:white;
  padding:10px 14px;

  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:10px;

  font-size:12px;
  font-weight:500;
}

.trust-left{
  display:flex;
  align-items:center;
  gap:8px;
}

.trust-icon{
  font-size:14px;
}

.trust-items{
  display:flex;
  gap:18px;
}

.trust-item{
  display:flex;
  align-items:center;
  gap:6px;
  white-space:nowrap;
}

/* bottom message */
.trust-warning{
  font-size:12px;
  padding:10px 14px;
  background:#f9fafb;
  color:#374151;
  border-top:1px solid #e5e7eb;
}

@media (max-width:768px){

.trust-row{
  flex-direction:column;
  align-items:flex-start;
}

.trust-items{
  gap:12px;
  flex-wrap:wrap;
}

}
.category-carousel{
  display:flex;
  flex-wrap:nowrap;
  gap:8px;
}

/* MOBILE CAROUSEL */
@media (max-width:768px){

  .category-carousel{
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
    scroll-snap-type:x mandatory;
    padding-bottom:4px;
  }

  .category-carousel::-webkit-scrollbar{
    display:none;
  }

  .category-carousel a{
    flex:0 0 auto;
    scroll-snap-align:start;
  }

}

.product-card {
  width: 100%;
}

/* =========================
   CLEAN PRODUCT CARD (UPGRADED)
========================= */

.clean-card {
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(15,23,42,0.06);
  border-radius: 22px;
  padding: 10px;
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.06),
    0 1px 0 rgba(255,255,255,0.7) inset;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  will-change: transform;
}

.clean-card:hover {
  transform: translateY(-4px);
  border-color: rgba(56,95,162,0.18);
  box-shadow:
    0 16px 46px rgba(15, 23, 42, 0.10),
    0 1px 0 rgba(255,255,255,0.75) inset;
}

/* IMAGE AREA */
.clean-image-wrap {
  position: relative;
  display: block;
  background: #f3f4f6;
  border-radius: 18px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.clean-image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
  transition: transform 0.35s ease;
}

.clean-card:hover .clean-image-wrap img {
  transform: scale(1.05);
}

/* Badge */
.clean-badge {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 3;
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  background: rgba(252,135,0,0.92);
  padding: 6px 10px;
  border-radius: 999px;
  box-shadow: 0 10px 22px rgba(252,135,0,0.22);
}

/* CONTENT */
.clean-content {
  padding: 12px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Clamp title to keep equal heights */
.clean-title {
  font-size: 13.5px;
  font-weight: 650;
  color: #0f172a;
  text-decoration: none;
  line-height: 1.35;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: calc(1.35em * 2);
}

.clean-title:hover {
  color: #385fa2;
}

/* Price row */
.clean-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.clean-price-value {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: -0.3px;
  color: #020617;
}

.clean-original {
  font-size: 12px;
  font-weight: 650;
  color: #94a3b8;
  text-decoration: line-through;
}

.clean-spacer {
  flex: 1;
}

/* BUTTON — tighter + premium */
.clean-buy-btn {
  margin-top: 2px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(56,95,162,0.18);

  background: rgba(56,95,162,0.10);
  color: #1e3a8a;

  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;

  transition: all 0.2s ease;
}

.clean-buy-btn:hover {
  background: linear-gradient(135deg, #385fa2, #2f4f88);
  color: #ffffff;
  border-color: rgba(56,95,162,0.0);
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(56,95,162,0.22);
}

.clean-buy-btn:active {
  transform: scale(0.98);
}

.promo-track {
  display: flex;
  width: max-content;
  animation: marquee 28s linear infinite;
}

.promo-set {
  display: flex;
}

.promo-set span {
  padding: 0 36px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.85);
}

/* Scroll exactly the width of one set */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

      .hero-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.category-pill {
  padding: 8px 16px;
  border-radius: 10px;

  background: #ffffff;
  border: 1px solid #e5e7eb;

  font-size: 12.5px;
  font-weight: 500;
  color: #0f172a;

  text-decoration: none;
  transition: all 0.2s ease;
}

.category-pill:hover {
  background: #385fa2;
  color: #ffffff;
  border-color: #385fa2;
}

/* Vendors pill variant */
.category-pill.vendors-pill {
  background: linear-gradient(135deg, #385fa2, #2f4f88);
  color: #ffffff;
  border: none;
  font-weight: 600;
}

.category-pill.vendors-pill:hover {
  background: linear-gradient(135deg, #fc8700, #e67600);
}

        .brand-pill:hover,
        .offer-bubble:hover {
          filter: brightness(0.9);
        }

        .hero-btn:hover {
          filter: brightness(0.9);
        }

        .add-to-cart-btn:active {
          transform: scale(0.97);
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

  z-index: 20; /* ← CRITICAL */
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

        .quickview-bullets {
          list-style: none;
          padding: 0;
          margin: 0 0 12px;
          font-size: 12px;
        }

        .quickview-bullets li {
          margin-bottom: 4px;
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

  main {
    padding: 0 !important;
  }

  /* Modal container */
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

  /* Stack layout */
  .quickview-body {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  /* Image sizing FIX */
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

  /* Content spacing FIX */
  .quickview-info {
    padding: 26px 22px 30px;
      border-bottom-left-radius: 26px;
  border-bottom-right-radius: 26px;
  }

  /* Typography scale FIX */
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

  /* Variant dropdown */
  .quickview-info select {
    height: 38px;
    font-size: 13px;
  }

  /* Buttons FIX */
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

/* Mobile animation */
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

/* =========================
   VENDOR CARD — CLEAN STYLE
========================= */

.vendor-clean-card {
  padding: 10px;
}

.vendor-image-wrap {
  height: 160px;
  border-radius: 18px;
  background: #f3f4f6;
  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;
}

.vendor-image-wrap img {
  width: 75%;
  height: 75%;
  object-fit: contain;
}

.vendor-browse-btn {
  margin-top: 10px;
  height: 36px;
  border-radius: 999px;
  border: none;

  background: linear-gradient(135deg, #385fa2, #2f4f88);
  color: #ffffff;

  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.22s ease;
}

.vendor-browse-btn:hover {
  background: linear-gradient(135deg, #fc8700, #e67600);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(252,135,0,0.35);
}
  .vendor-image-spacing {
  margin-bottom: 10px;
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
  font-size: 10.5px;  /* slightly smaller */
  font-weight: 800;
  padding: 5px 9px;
  border-radius: 999px;
  z-index: 3;
}

.modern-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 3;
}

.modern-actions button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,0.95);
  box-shadow: 0 4px 10px rgba(15,23,42,0.15);
  cursor: pointer;
  font-size: 14px;
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

  color: #ffffff;          /* explicit */
  font-size: 17px;         /* slightly cleaner */
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

/* =========================
   PRODUCT FEED GRID
========================= */

.product-feed-grid{
  display:grid;
  grid-template-columns: repeat(2,1fr);
  gap:12px;
}

/* tablet */
@media (min-width:640px){

.product-feed-grid{
  grid-template-columns: repeat(3,1fr);
}

}

/* desktop */
@media (min-width:1024px){

.product-feed-grid{
  grid-template-columns: repeat(5,1fr);
}

}

/* LOAD MORE BUTTON */

.feed-load-more{
  display:flex;
  justify-content:center;
  margin-top:24px;
}

.feed-load-more button{
  padding:10px 22px;
  border-radius:999px;
  border:none;

  background:#385fa2;
  color:white;

  font-size:13px;
  font-weight:600;
  cursor:pointer;
}

/* =========================
   PRODUCT CARD FADE-IN
========================= */

.product-feed-grid .product-card {
  opacity: 0;
  transform: translateY(12px);
  animation: productFadeIn .5s ease forwards;
}

/* stagger effect */
.product-feed-grid .product-card:nth-child(1) { animation-delay: .02s; }
.product-feed-grid .product-card:nth-child(2) { animation-delay: .04s; }
.product-feed-grid .product-card:nth-child(3) { animation-delay: .06s; }
.product-feed-grid .product-card:nth-child(4) { animation-delay: .08s; }
.product-feed-grid .product-card:nth-child(5) { animation-delay: .10s; }
.product-feed-grid .product-card:nth-child(6) { animation-delay: .12s; }
.product-feed-grid .product-card:nth-child(7) { animation-delay: .14s; }
.product-feed-grid .product-card:nth-child(8) { animation-delay: .16s; }
.product-feed-grid .product-card:nth-child(9) { animation-delay: .18s; }
.product-feed-grid .product-card:nth-child(10) { animation-delay: .20s; }

@keyframes productFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =========================
   HERO FADE CAROUSEL
========================= */

.hero-carousel{
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.hero-slide{
  position: absolute;
  inset: 0;

  background-size: cover;
  background-position: center;

  transition: opacity 1.2s ease;

  will-change: opacity;
}

/* mobile */
@media (max-width:768px){

.hero-carousel{
  height: 200px;
}

}
`}</style>
    </>
  );
}
