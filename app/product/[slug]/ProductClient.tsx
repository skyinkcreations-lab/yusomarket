"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";

type Vendor = {
  id: string;
  slug: string;
  store_name: string;
  store_logo: string | null;
  rating: number | null;
  reviews: number | null;
  sold: number | null;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  status: string | null;
  price: number | null;
  original_price?: number | null;
  description?: string | null;
  main_image?: string | null;
  thumbnail_url?: string | null;

  /** marketplace relation */
  vendor?: Vendor | null;
};

type Review = {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string;
  content: string;
  created_at: string;
};

/** 👇 ADD: variation rows from DB */
type Variation = {
  id: string;
  product_id: string;
  regular_price: number | null;
  sale_price: number | null;
  attributes: any;
};

type ServerData = {
  product: Product;
  regularPrice: number | null;
  salePrice: number | null;
  mainImage: string | null;
  gallery: string[];
  attributeMap: Record<string, string[]>;
  reviews: Review[];

  /** 👇 ADD: real product variations */
  variations?: Variation[];
};

type Props = {
  serverData: ServerData;
};

type TabKey = "description" | "reviews";

/** 👇 helper — safely parse jsonb attributes */
function normalizeAttributes(attr: any) {
  if (!attr) return {};
  if (typeof attr === "string") {
    try {
      attr = JSON.parse(attr);
    } catch {
      return {};
    }
  }
  const obj: Record<string, string> = {};
  Object.entries(attr).forEach(([k, v]) => (obj[k.trim()] = String(v).trim()));
  return obj;
}

export default function ProductClient({ serverData }: Props) {
  const { product, regularPrice, salePrice, mainImage, gallery, attributeMap, reviews } =
  serverData;

  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [reviewRating,setReviewRating] = useState(5);
const [reviewTitle,setReviewTitle] = useState("");
const [reviewContent,setReviewContent] = useState("");
const [submittingReview,setSubmittingReview] = useState(false);
  const [qty, setQty] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const [addedToCart, setAddedToCart] = useState(false);
const [adding, setAdding] = useState(false);

  /** defaults for option selectors */
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    Object.entries(attributeMap || {}).forEach(([name, values]) => {
      if (values && values.length > 0) defaults[name] = values[0]!;
    });
    return defaults;
  });

const displayImage =
  activeImage ||
  mainImage ||
  product.main_image ||
  product.thumbnail_url ||
  "/placeholder.png";

const galleryImages = useMemo(() => {
  const images = [
    mainImage,
    product.main_image,
    product.thumbnail_url,
    ...(gallery || [])
  ];

  return Array.from(
    new Set(images.filter(Boolean))
  );
}, [gallery, mainImage, product.main_image, product.thumbnail_url]);


  const avgRating = useMemo(() => {
    if (!reviews?.length) return 0;
    return reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
  }, [reviews]);

const soldCount = useMemo(() => {
  const hash = product.id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const base = (hash % 800) + 120;

  return Math.round(base / 10) * 10;
}, [product.id]);

const [viewers, setViewers] = useState<number | null>(null);

useEffect(() => {
  setViewers(Math.floor(Math.random() * 18) + 3);
}, []);

  /** 👇 prepare variation data */
  const parsedVariations = useMemo(
    () =>
      (serverData.variations || []).map((v) => ({
        ...v,
        attributes: normalizeAttributes(v.attributes),
      })),
    [serverData.variations]
  );

  /** 👇 find matching variant for chosen options */
  const selectedVariant = useMemo(() => {
    if (!parsedVariations.length) return null;

    return parsedVariations.find((v) =>
      Object.entries(v.attributes).every(([k, val]) => selectedOptions[k] === val)
    );
  }, [parsedVariations, selectedOptions]);

  /** 👇 true price (variant > salePrice > regularPrice) */
  const effectivePrice = useMemo(() => {
    if (selectedVariant?.sale_price != null) return selectedVariant.sale_price;
    if (selectedVariant?.regular_price != null) return selectedVariant.regular_price;
    if (salePrice != null) return salePrice;
    if (regularPrice != null) return regularPrice;
    if (product.price != null) return product.price;
    return null;
  }, [selectedVariant, salePrice, regularPrice, product.price]);

  /** 👇 original vs sale compare */
  const originalForBadge = useMemo(() => {
    if (selectedVariant?.regular_price && selectedVariant?.sale_price)
      return selectedVariant.regular_price;
    return regularPrice ?? product.original_price ?? null;
  }, [selectedVariant, regularPrice, product.original_price]);

  function handleQty(delta: number) {
    setQty((prev) => Math.max(1, Math.min(prev + delta, 99)));
  }

function handleSelectOption(group: string, value: string) {
  setSelectedOptions((prev) => ({ ...prev, [group]: value }));
}

/* ADD THIS RIGHT HERE */

async function submitReview(){

  if(submittingReview) return;

  setSubmittingReview(true);

  const res = await fetch("/api/reviews/create",{
    method:"POST",
    headers:{ "Content-Type":"application/json"},
    body: JSON.stringify({
      product_id: product.id,
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent
    })
  });

  if(res.status === 401){
    alert("You must be logged in to leave a review");
    setSubmittingReview(false);
    return;
  }

  if(!res.ok){
    alert("Failed to submit review");
    setSubmittingReview(false);
    return;
  }

  window.location.reload();
}

  /** 👇 CART REQUEST NOW INCLUDES variant_id */
async function handleAddToCart() {

  if (adding) return;

  setAdding(true);

  try {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: product.id,
        variant_id: selectedVariant?.id || null,
        quantity: qty,
        options: selectedOptions,
      }),
    });

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2500);

  } catch (err) {
    console.error("Add to cart failed", err);
  }

  setAdding(false);
}

  const hasAttributes = attributeMap && Object.keys(attributeMap).length > 0;

  return (
    <>
      {/*  EVERYTHING BELOW THIS LINE IS YOUR ORIGINAL UI — UNTOUCHED  */}
      <main className="product-shell">
        <div className="product-inner">
          {/* … UI CONTENT (UNCHANGED) … */}
          {/* ——— literally the ENTIRE rest of your file stays exactly as-is ——— */}

          {/* BREADCRUMBS */}
          <div className="breadcrumbs-row">
            <nav className="breadcrumbs">
              <Link href="/" className="crumb">
                Home
              </Link>
              <span className="crumb-sep">/</span>
              <span className="crumb-current">{product.name}</span>
            </nav>
          </div>

          {/* TOP GRID */}
          <section className="top-grid">
            {/* IMAGE SIDE */}
<div className="image-panel">
  <div className="image-card">
    <div
      className="image-wrap"
      style={{ cursor: "zoom-in" }}
      onClick={() => setIsLightboxOpen(true)}
    >
      <img
        src={displayImage}
        alt={product.name}
        className="main-image"
      />
    </div>

    {galleryImages.length > 0 && (
      <div className="gallery-row">
        {galleryImages.map((img) => {
          const isActive = img === displayImage;

          return (
            <button
              key={img}
              type="button"
              className={
                "gallery-thumb" +
                (isActive ? " gallery-thumb--active" : "")
              }
              onClick={() => {
  setActiveImage(img);
}}
            >
              <img src={img} alt="" />
            </button>
          );
        })}
      </div>
    )}
  </div>
</div>

            {/* SUMMARY / BUY SIDE */}
            <aside className="summary-panel">
              <div className="summary-card">
                <h1 className="product-title">{product.name}</h1>

                <div className="rating-row">
  <div className="stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className={i < Math.round(avgRating) ? "star star-on" : "star"}>
        ★
      </span>
    ))}
  </div>

<div className="sold-count">
  {soldCount}+ sold
</div>

  <span className="rating-score">
    {avgRating.toFixed(1)}
  </span>

  <span className="rating-count">
    ({reviews.length} reviews)
  </span>
</div>

                {product.description && (
  <p className="product-subtext">
    {product.description}
  </p>
)}


                {/* PRICE */}
                <div className="price-block">
  <div className="price-main">
    <span className="price-current">
      {effectivePrice != null ? `A$${effectivePrice.toFixed(2)}` : "-"}
    </span>

    {originalForBadge &&
      effectivePrice != null &&
      originalForBadge > effectivePrice && (
        <span className="price-original">
          A${originalForBadge.toFixed(2)}
        </span>
      )}
  </div>

  {originalForBadge &&
    effectivePrice != null &&
    originalForBadge > effectivePrice && (
      <span className="price-badge">
        Save A${(originalForBadge - effectivePrice).toFixed(2)}
      </span>
    )}
</div>

<div className="deal-row">
  <span className="deal-badge">🔥 Limited deal</span>
  <span className="deal-text">Extra 10% off today</span>
</div>

<div className="delivery-box">
  <div className="delivery-row">
    🚚 Free shipping available
  </div>

<div className="viewer-count">
  👀 {viewers ?? 0} people viewing this now
</div>

  <div className="delivery-sub">
    Estimated delivery: 6–12 days
  </div>

  <div className="delivery-sub">
    Free returns within 30 days
  </div>
</div>
                {/* VARIATIONS */}
                <div className="options-wrap">
                  {hasAttributes ? (
                    Object.entries(attributeMap).map(([group, values]) => (
                      <div className="option-group" key={group}>
                        <div className="option-label-row">
                          <span className="option-label">{group}</span>
                          {selectedOptions[group] && (
                            <span className="option-selected">
                              {selectedOptions[group]}
                            </span>
                          )}
                        </div>
                        <div className="option-pills">
                          {values.map((v) => {
                            const isActive = selectedOptions[group] === v;
                            return (
                              <button
                                key={v}
                                type="button"
                                className={
                                  "option-pill" + (isActive ? " option-pill--active" : "")
                                }
                                onClick={() => handleSelectOption(group, v)}
                              >
                                {v}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="option-group">
                      <div className="option-label-row">
                        <span className="option-label">Variation</span>
                        <span className="option-selected">One size</span>
                      </div>
                      <div className="option-pills">
                        <button
                          type="button"
                          className="option-pill option-pill--active"
                          disabled
                        >
                          Default
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* QUANTITY + CTA */}
                <div className="buy-row">
                  <div className="qty-wrap">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => handleQty(-1)}
                    >
                      –
                    </button>
                    <span className="qty-value">{qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => handleQty(1)}
                    >
                      +
                    </button>
                  </div>

<button
  type="button"
  className="add-to-cart-btn"
  onClick={handleAddToCart}
  disabled={adding}
>
  {adding ? "Adding..." : addedToCart ? "✓ Added" : "Add to cart"}
</button>
                </div>


{/* TRUST STRIP */}
<div className="trust-strip">
  <div className="trust-pill">
    <span className="trust-dot" />
    Secure checkout
  </div>
  <div className="trust-pill">
    <span className="trust-dot" />
    Trusted vendors
  </div>
  <div className="trust-pill">
    <span className="trust-dot" />
    Quality verified
  </div>
</div>

{/* VENDOR CARD */}
{product.vendor && (
  <div className="vendor-card">

    <div className="vendor-left">

      <div
        className="vendor-avatar"
        style={{
          backgroundImage: product.vendor.store_logo
            ? `url(${product.vendor.store_logo})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {!product.vendor.store_logo &&
          product.vendor.store_name.charAt(0)}
      </div>

      <div className="vendor-info">

        <Link
          href={`/vendors/${product.vendor.slug}`}
          className="vendor-name"
        >
          {product.vendor.store_name}
        </Link>

<div className="vendor-stats">
  Trusted seller
</div>

      </div>
    </div>

    <div className="vendor-actions">

      <Link
        href={`/vendors/${product.vendor.slug}`}
        className="vendor-shop"
      >
        Shop all
      </Link>

    </div>

    <div className="vendor-foot">
      Started selling{" "}
      {Math.max(
        1,
        new Date().getFullYear() -
          new Date(product.vendor.created_at).getFullYear()
      )}{" "}
      year ago
    </div>

  </div>
)}
              </div>
            </aside>
          </section>

          {/* LOWER TABS */}
          <section className="lower-shell">
            {/* Tab switches */}
            <div className="tabs-row">
              
              <button
                type="button"
                className={
                  "tab-btn" + (activeTab === "description" ? " tab-btn--active" : "")
                }
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                type="button"
                className={
                  "tab-btn" + (activeTab === "reviews" ? " tab-btn--active" : "")
                }
                onClick={() => setActiveTab("reviews")}
              >
                Reviews {reviews.length > 0 ? `(${reviews.length})` : "(0)"}
              </button>
            </div>

            {/* Tab content (full width) */}
            <div className="tab-content-shell">
              {activeTab === "description" && (
                <div className="tab-card">
                  <h3 className="tab-card-title">Product Description</h3>
                  {product.description ? (
                    <p className="body-copy">{product.description}</p>
                  ) : (
                    <p className="tab-muted">
                      No description has been added yet. The vendor will update this
                      soon.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="tab-card">
                  <div className="reviews-header">
                    <h3 className="tab-card-title">Customer Reviews</h3>
                    {avgRating > 0 && (
                      <div className="reviews-summary">
                        <span className="reviews-score">
                          {avgRating.toFixed(1)} / 5
                        </span>
                        <div className="stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={
                                i < Math.round(avgRating) ? "star star-on" : "star"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="reviews-count">
                          {reviews.length} review{reviews.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    )}
                  </div>

{/* REVIEW FORM */}

<div className="review-form">

<h4>Leave a review</h4>

<div className="review-stars">
{[1,2,3,4,5].map((n)=>(
<button
key={n}
type="button"
className={reviewRating >= n ? "star star-on" : "star"}
onClick={()=>setReviewRating(n)}
>
★
</button>
))}
</div>

<input
placeholder="Review title"
value={reviewTitle}
onChange={(e)=>setReviewTitle(e.target.value)}
/>

<textarea
placeholder="Write your review"
value={reviewContent}
onChange={(e)=>setReviewContent(e.target.value)}
/>

<button
className="submit-review-btn"
onClick={submitReview}
>
Submit review
</button>

</div>

                  {reviews.length === 0 ? (
                    <p className="tab-muted">
                      No reviews yet. Be the first to share your experience.
                    </p>
                  ) : (
                    <div className="reviews-list">
                      {reviews.map((r) => (
                        <article key={r.id} className="review-card">
                          <div className="review-header">
                            <div className="stars small">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span
                                  key={i}
                                  className={
                                    i < r.rating ? "star star-on" : "star"
                                  }
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <h4 className="review-title">{r.title}</h4>
                          </div>
                          <p className="review-body">{r.content}</p>
                          <p className="review-meta">
                            {new Date(r.created_at).toLocaleDateString()}
                          </p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

          
            </div>
          </section>
        </div>
      </main>

{isLightboxOpen && (
  <div
    className="lightbox-overlay"
    onClick={() => setIsLightboxOpen(false)}
  >
    <div
      className="lightbox-content"
      onClick={(e) => e.stopPropagation()}
    >
      <img src={displayImage} alt={product.name} />
      <button
        className="lightbox-close"
        onClick={() => setIsLightboxOpen(false)}
      >
        ✕
      </button>
    </div>
  </div>
)}


<div className="mobile-cart-bar">

  <div className="mobile-price">
    {effectivePrice != null ? `A$${effectivePrice.toFixed(2)}` : "-"}
  </div>

<button
  className="mobile-cart-btn"
  onClick={handleAddToCart}
  disabled={adding}
>
  {adding ? "Adding..." : addedToCart ? "✓ Added" : "Add to cart"}
</button>

{addedToCart && (
  <div className="cart-toast">
    ✓ Item added to cart
  </div>
)}

</div>

      {/* SCOPED STYLES */}
      <style jsx>{`

/* ============================================
   PREMIUM FASHION PRODUCT DESIGN
   Minimal. Clean. Editorial.
   ============================================ */

.product-shell {
  background: #ffffff;
  padding: 30px 0 150px;
}

@media (max-width:768px){
  .product-shell{
    padding-bottom:150px;
  }
}

.product-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ============================================
   BREADCRUMBS
============================================ */

/* ============================================
   VENDOR CARD
============================================ */

.vendor-card{

  border:1px solid #e9e9e9;
  border-radius:10px;

  padding:18px;

  margin-top:40px;

  background:#fff;

  display:flex;
  flex-direction:column;
  gap:14px;

}

/* top row */

.vendor-left{
  display:flex;
  align-items:center;
  gap:14px;
}

/* avatar */

.vendor-avatar{

  width:52px;
  height:52px;

  border-radius:50%;

  background:#f3f3f3;

  display:flex;
  align-items:center;
  justify-content:center;

  font-weight:600;
  font-size:18px;
  color:#333;

}

/* name */

.vendor-name{
  font-size:16px;
  font-weight:600;
}

/* stats */

.vendor-stats{

  font-size:13px;
  color:#777;

  display:flex;
  gap:14px;

}

/* buttons */

.vendor-actions{

  display:flex;
  gap:10px;

}

.vendor-follow{

  border:1px solid #ddd;
  background:#fff;

  padding:8px 16px;

  border-radius:24px;

  font-size:13px;
  cursor:pointer;

}

.vendor-shop{

  border:1px solid #ddd;
  background:#fff;

  padding:8px 16px;

  border-radius:24px;

  font-size:13px;
  cursor:pointer;

}

/* bottom */

.vendor-foot{

  font-size:12px;
  color:#777;

}
.breadcrumbs-row {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumbs {
  font-size: 12px;
  color:#888;
  display: flex;
  gap: 8px;
}

.crumb {
  color: #777;
  text-decoration: none;
}

.crumb:hover {
  color: #111;
}

.crumb-current {
  color: #111;
  font-weight: 500;
}

.sold-count{
  font-size:13px;
  color:#666;
  margin-bottom:0px;
}

.rating-row {
  display:flex;
  align-items:center;
  gap:10px;
  font-size:14px;
  margin-bottom: 12px;
}

.star {
  color: #ddd;
  font-size: 14px;
}

.star-on {
  color: #f5a623;
}

.rating-score {
  font-weight: 600;
  font-size: 14px;
}

.rating-count {
  font-size: 13px;
  color:#888;
}

.shipping-box {
  background: #f7f7f7;
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 20px;
}

.shipping-row {
  font-weight: 600;
  font-size: 14px;
}

.shipping-sub {
  font-size: 13px;
  color: #777;
}

.summary-panel {
  position: sticky;
  top: 90px;
  height: fit-content;
}

.deal-row {
  display:flex;
  gap:10px;
  align-items:center;
  margin-bottom:14px;
}

.deal-badge {
  background:#ff4d4f;
  color:#fff;
  font-size:12px;
  font-weight:600;
  padding:4px 8px;
  border-radius:4px;
}

.deal-text {
  font-size:13px;
  color:#444;
}

.delivery-box{
  background:#f7f7f7;
  border-radius:6px;
  padding:14px;
  margin-bottom:18px;
}

.delivery-row{
  font-weight:600;
  font-size:14px;
}

.delivery-sub{
  font-size:13px;
  color:#666;
  margin-top:4px;
}
/* ============================================
   GRID
============================================ */

.top-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 80px;
}

/* ============================================
   IMAGE SECTION
============================================ */

.image-card {
  background: #ffffff;
  border-radius: 0;
  border: none;
  box-shadow: none;
  position: relative;
}

.image-wrap {
  background: #ffffff;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.main-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* Vertical Gallery */

.gallery-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: absolute;
  left: -90px;
  top: 0;
}

.gallery-thumb {
  width: 70px;
  height: 70px;
  border-radius: 5px;
  border: 1px solid #e5e5e5;
  background: #fff;
  overflow: hidden;
  cursor: pointer;
}
  

.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-thumb--active {
  border: 2px solid #32548f;
    border-radius: 5px
}

/* ============================================
   SUMMARY SIDE
============================================ */

.summary-card {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.product-title {
  font-size: 32px;
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: -0.01em;
  text-transform: none;
  margin-bottom: 10px;
}

.product-subtext {
  font-size: 14px;
  color: #777;
  margin-bottom: 20px;
}

.summary-panel{
  position:sticky;
  top:90px;
  height:fit-content;
}

.viewer-count{
  font-size:13px;
  color:#e5533d;
  margin-bottom:18px;
}
/* ============================================
   PRICE
============================================ */

.price-block{
  margin-bottom:24px;
  display:flex;
  flex-direction:column;
  gap:6px;
}

.price-main{
  display:flex;
  align-items:baseline;
  gap:12px;
}

.price-current{
  font-size:32px;
  font-weight:700;
  letter-spacing:-0.01em;
}

.price-original{
  font-size:16px;
  color:#888;
  text-decoration:line-through;
}

.price-badge{
  font-size:13px;
  color:#e5533d;
  font-weight:600;
}

/* ============================================
   OPTIONS
============================================ */

/* ================================
   VARIANT SELECTORS (TEMU STYLE)
================================ */

.options-wrap {
  margin-top: 20px;
  margin-bottom: 28px;
}

.option-group {
  margin-bottom: 20px;
}

.option-label-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 10px;
}

.option-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: Capaitalise;
  letter-spacing: 0.06em;
  color: #888;
}
  
.option-selected {
  font-size: 13px;
  font-weight: 600;
  color: #111;
}

.option-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* THE BOX SELECTORS */

.option-pill {
  min-width: 44px;
  height: 36px;
  padding: 0 14px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 13px;
  font-weight: 500;

  border: 1px solid #ddd;
  border-radius: 6px;

  background: #fff;
  cursor: pointer;

  transition: all .15s ease;
}

/* hover */

.option-pill:hover {
  border-color: #385fa2;
}

/* active */

.option-pill--active {
  border-color: #385fa2;
  background: #385fa2;
  color: white;
}

/* disabled state (future use) */

.option-pill--disabled {
  opacity: .4;
  cursor: not-allowed;
}

@media (max-width: 640px) {

.option-pill {
  height: 40px;
  min-width: 48px;
}

}
/* ============================================
   QUANTITY + CTA
============================================ */

.buy-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
  margin-bottom: 30px;
}

.qty-wrap {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  height: 48px;
}

.qty-btn {
  width: 42px;
  border: none;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
}

.qty-value {
  width: 42px;
  text-align: center;
}

.add-to-cart-btn {
  flex: 1;
  background: #385fa2;
  color: #fff;
  border: none;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  height: 48px;
  cursor: pointer;
  transition: background .2s ease;
}

.add-to-cart-btn:hover {
  background: #2f4f87;
}

/* ============================================
   TRUST STRIP
============================================ */

.trust-strip {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color:#555;
}

/* ============================================
   TABS SECTION
============================================ */

.lower-shell {
  margin-top: 40px;
  border-top: 1px solid #e5e5e5;
  padding-top: 30px;
}

.tabs-row {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.tab-btn {
  background: transparent;
  border: none;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  color: #777;
}

.tab-btn--active {
  color: #000;
}

.tab-card {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.tab-card-title {
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.01em;
  margin-bottom: 16px;
}

.body-copy {
  font-size: 15px;
  line-height: 1.7;
  color: #333;
}

/* ============================================
   RESPONSIVE
============================================ */

@media (max-width: 1024px) {
  .top-grid {
    grid-template-columns: 1fr;
    gap: 50px;
  }

  .gallery-row {
    position: static;
    flex-direction: row;
    margin-top: 18px;
  }
}

@media (max-width: 640px) {

  .product-inner {
    padding: 0 18px;
  }

  .image-wrap {
    min-height: 420px;
  }

  .buy-row {
    flex-direction: column;
    gap: 12px;
  }

  .qty-wrap {
    height: 44px;
  }

  .add-to-cart-btn {
    height: 44px;
    width: 100%;
    flex: none;
  }

}
.mobile-cart-bar{
  position:fixed;
  bottom:0;
  left:0;
  right:0;

  display:none;
  justify-content:space-between;
  align-items:center;

  padding:14px 18px;
  background:#fff;
  border-top:1px solid #eee;
  z-index:999;
}

.mobile-price{
  font-size:18px;
  font-weight:600;
}

.mobile-cart-btn{
  background:#385fa2;
  color:white;
  border:none;
  padding:12px 24px;
  border-radius:6px;
  font-weight:600;
}

@media(max-width:768px){
  .mobile-cart-bar{
    display:flex;
  }
}

.cart-toast{
  position:fixed;
  bottom:90px;
  left:50%;
  transform:translateX(-50%);

  background:#111;
  color:white;

  padding:10px 16px;
  border-radius:6px;

  font-size:13px;
  z-index:999;
}

/* =========================
   PRODUCT IMAGE LIGHTBOX
========================= */

.lightbox-overlay{
  position: fixed;
  inset: 0;

  background: rgba(0,0,0,0.75);

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 40px;
  z-index: 2000;
}

.lightbox-content{
  position: relative;
  max-width: 90vw;
  max-height: 90vh;

  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-content img{
  max-width: 100%;
  max-height: 90vh;

  object-fit: contain;
  border-radius: 8px;
}

.lightbox-close{
  position: absolute;
  top: -10px;
  right: -10px;

  width: 38px;
  height: 38px;

  border-radius: 50%;
  border: none;

  background: #fff;
  color: #111;

  font-size: 18px;
  cursor: pointer;
}
  
.review-form{
margin-top:30px;
margin-bottom:30px;
display:flex;
flex-direction:column;
gap:12px;
}

.review-form input,
.review-form textarea{
border:1px solid #ddd;
padding:10px;
border-radius:6px;
font-size:14px;
}

.review-stars{
display:flex;
gap:6px;
font-size:20px;
}

.submit-review-btn{
background:#385fa2;
color:white;
border:none;
padding:10px 18px;
border-radius:6px;
font-weight:600;
cursor:pointer;
}

`}</style>
    </>
  );
}
