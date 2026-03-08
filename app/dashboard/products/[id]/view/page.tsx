"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaTags,
  FaBoxes,
  FaDollarSign,
  FaBarcode,
  FaLayerGroup,
  FaCalendarAlt,
  FaCubes,
} from "react-icons/fa";

export default function ProductViewPage() {
  const { id } = useParams();

  // TEMP PRODUCT – Replace with DB later
  const product = {
    title: "Wireless Earbuds",
    slug: "wireless-earbuds",
    description:
      "Premium wireless earbuds featuring active noise cancellation, touch controls, and 24-hour battery life. Perfect for travel, fitness, and everyday listening.",
    price: "$49.99",
    salePrice: "$39.99",
    sku: "WRL-001",
    stock: 120,
    stockStatus: "In stock",
    categories: ["Electronics", "Audio"],
    tags: ["wireless", "earbuds", "audio"],
    brand: "TechCo",
    images: [
      "/images/earbuds.jpg",
      "/images/earbuds-alt1.jpg",
      "/images/earbuds-alt2.jpg",
    ],
    createdAt: "2025-11-05 2:39 PM",
    updatedAt: "2025-11-19 10:12 AM",
  };

  return (
    <div style={{ padding: "40px 40px 80px", maxWidth: "1350px" }}>
      {/* BACK BUTTON */}
      <Link href="/dashboard/products" style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "25px",
            cursor: "pointer",
            color: "#374151",
            fontSize: "14px",
          }}
        >
          <FaArrowLeft />
          Back to Products
        </div>
      </Link>

      {/* PRODUCT TITLE */}
      <h1 style={{ fontSize: "30px", fontWeight: 700, marginBottom: "8px" }}>
        {product.title}
      </h1>

      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "35px" }}>
        Product overview & details
      </p>

      <div style={{ display: "flex", gap: "40px" }}>
        {/* LEFT SIDE: GALLERY + DESCRIPTION */}
        <div style={{ flex: 2 }}>
          {/* MAIN IMAGE */}
          <div
            style={{
              width: "100%",
              height: "420px",
              borderRadius: "10px",
              overflow: "hidden",
              marginBottom: "20px",
              border: "1px solid #e5e7eb",
              background: "#fafafa",
            }}
          >
            <img
              src={product.images[0]}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* THUMBNAILS */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "35px" }}>
            {product.images.map((img, index) => (
              <img
                key={index}
                src={img}
                style={{
                  width: "110px",
                  height: "110px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              />
            ))}
          </div>

          {/* DESCRIPTION CARD */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              padding: "22px",
              borderRadius: "10px",
              marginBottom: "30px",
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              Description
            </h3>

            <p
              style={{
                fontSize: "15px",
                color: "#444",
                lineHeight: "24px",
              }}
            >
              {product.description}
            </p>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          {/* PRICING */}
          <div style={card}>
            <h3 style={cardHeader}>
              <FaDollarSign style={icon} />
              Pricing
            </h3>

            <div style={row}>
              <strong>Regular Price:</strong> {product.price}
            </div>

            {product.salePrice && (
              <div style={row}>
                <strong>Sale Price:</strong> {product.salePrice}
              </div>
            )}
          </div>

          {/* INVENTORY */}
          <div style={card}>
            <h3 style={cardHeader}>
              <FaBoxes style={icon} />
              Inventory
            </h3>

            <div style={row}>
              <FaBarcode style={tinyIcon} /> <strong>SKU:</strong> {product.sku}
            </div>

            <div style={row}>
              <FaCubes style={tinyIcon} /> <strong>Stock:</strong>{" "}
              {product.stock}
            </div>

            <div style={row}>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#16a34a", fontWeight: 600 }}>
                {product.stockStatus}
              </span>
            </div>
          </div>

          {/* CATEGORIES */}
          <div style={card}>
            <h3 style={cardHeader}>
              <FaLayerGroup style={icon} />
              Categories
            </h3>

            {product.categories.map((cat, i) => (
              <div key={i} style={row}>
                {cat}
              </div>
            ))}
          </div>

          {/* TAGS */}
          <div style={card}>
            <h3 style={cardHeader}>
              <FaTags style={icon} />
              Tags
            </h3>

            {product.tags.map((tag, i) => (
              <div key={i} style={row}>
                {tag}
              </div>
            ))}
          </div>

          {/* BRAND */}
          <div style={card}>
            <h3 style={cardHeader}>Brand</h3>
            <div style={row}>{product.brand}</div>
          </div>

          {/* METADATA */}
          <div style={card}>
            <h3 style={cardHeader}>
              <FaCalendarAlt style={icon} />
              Metadata
            </h3>

            <div style={row}>
              <strong>Created:</strong> {product.createdAt}
            </div>

            <div style={row}>
              <strong>Updated:</strong> {product.updatedAt}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  padding: "20px",
  borderRadius: "10px",
};

const cardHeader: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: 600,
  marginBottom: "15px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const icon: React.CSSProperties = {
  fontSize: "16px",
  color: "#374151",
};

const tinyIcon: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b7280",
};

const row: React.CSSProperties = {
  fontSize: "15px",
  color: "#374151",
  marginBottom: "8px",
};
