"use client";

import Link from "next/link";

export default function VendorCard({ vendor }: any) {
  return (
    <Link
      href={`/vendors/${vendor.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        className="product-card"
        style={{
          minWidth: 220,
          maxWidth: 240,
          background: "#ffffff",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
          textDecoration: "none",
          color: "inherit",
          transition: "transform .22s ease, box-shadow .22s ease, border-color .22s ease",
        }}
      >
        {/* IMAGE */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <div
            style={{
              height: 160,
              borderRadius: 14,
              background:
                "linear-gradient(145deg, rgba(15,23,42,0.08), rgba(148,163,184,0.18))",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform .25s ease",
            }}
            className="product-card-image"
          >
            <img
              src={vendor.logo || "/placeholder.png"}
              alt={vendor.name}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* BADGE */}
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              color: "#ffffff",
              background: "#111827",
              boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
            }}
          >
            Top Seller
          </span>
        </div>

        {/* NAME */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#111827",
              lineHeight: 1.25,
              marginBottom: 4,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {vendor.name}
          </div>

          {/* PRODUCT COUNT */}
          <div
            style={{
              fontSize: 12,
              color: "#6b7280",
              marginBottom: 4,
            }}
          >
            {vendor.productCount || 0} products
          </div>

          {/* RATING */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#4b5563",
            }}
          >
            <span style={{ color: "#f59e0b" }}>★</span>
            <span>{vendor.rating?.toFixed(1) || "4.8"}</span>
            <span style={{ color: "#9ca3af" }}>
              ({vendor.ratingCount || 120})
            </span>
          </div>
        </div>
      </div>

      {/* HOVER EFFECT */}
      <style>{`
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 38px rgba(15,23,42,0.16);
          border-color: #d1d5db;
        }

        .product-card:hover .product-card-image {
          transform: scale(1.02);
        }
      `}</style>
    </Link>
  );
}
