"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  FaArrowLeft,
  FaCopy,
  FaSave,
  FaImage,
  FaTags,
  FaBoxes,
  FaDollarSign,
} from "react-icons/fa";

// TEMP: Replace with database fetch
const SAMPLE_PRODUCT = {
  title: "Wireless Earbuds",
  description:
    "Premium wireless earbuds with noise cancellation and 24-hour battery life.",
  price: "49.99",
  salePrice: "39.99",
  sku: "WRL-001",
  stock: 120,
  categories: ["Electronics", "Audio"],
  tags: ["wireless", "earbuds"],
  brand: "TechCo",
  images: [
    "/images/earbuds.jpg",
    "/images/earbuds-alt1.jpg",
    "/images/earbuds-alt2.jpg",
  ],
};

export default function DuplicateProductPage() {
  const { id } = useParams();

  // Prefill with duplicate values
  const [title, setTitle] = useState(SAMPLE_PRODUCT.title + " (Copy)");
  const [description, setDescription] = useState(SAMPLE_PRODUCT.description);
  const [price, setPrice] = useState(SAMPLE_PRODUCT.price);
  const [salePrice, setSalePrice] = useState(SAMPLE_PRODUCT.salePrice);
  const [sku, setSku] = useState(SAMPLE_PRODUCT.sku + "-COPY");
  const [stock, setStock] = useState(SAMPLE_PRODUCT.stock);
  const [brand, setBrand] = useState(SAMPLE_PRODUCT.brand);

  const handleSave = () => {
    alert("This will save the duplicated product into the database (soon).");
  };

  return (
    <div style={{ padding: "30px", maxWidth: "1100px" }}>
      {/* Back */}
      <Link href="/dashboard/products">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "20px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <FaArrowLeft /> Back to Products
        </div>
      </Link>

      <h1 style={{ fontSize: "28px", fontWeight: 700 }}>
        Duplicate Product
      </h1>

      <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "25px" }}>
        Create a new product based on the original template.
      </p>

      <div style={{ display: "flex", gap: "30px" }}>
        {/* LEFT */}
        <div style={{ flex: 2 }}>
          {/* Product Title */}
          <label style={label}>Product Title</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description */}
          <label style={label}>Description</label>
          <textarea
            style={{ ...inputStyle, height: "180px" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Gallery Preview */}
          <label style={label}>Images</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            {SAMPLE_PRODUCT.images.map((img, i) => (
              <div
                key={i}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #ddd",
                }}
              >
                <img
                  src={img}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Pricing */}
          <div style={box}>
            <h3 style={boxHeader}>
              <FaDollarSign style={boxIcon} /> Pricing
            </h3>

            <label style={smallLabel}>Regular Price ($)</label>
            <input
              style={inputStyle}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <label style={smallLabel}>Sale Price ($)</label>
            <input
              style={inputStyle}
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
            />
          </div>

          {/* Inventory */}
          <div style={box}>
            <h3 style={boxHeader}>
              <FaBoxes style={boxIcon} /> Inventory
            </h3>

            <label style={smallLabel}>SKU</label>
            <input
              style={inputStyle}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />

            <label style={smallLabel}>Stock Quantity</label>
            <input
              style={inputStyle}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          {/* Brand */}
          <div style={box}>
            <h3 style={boxHeader}>
              <FaTags style={boxIcon} /> Brand
            </h3>
            <input
              style={inputStyle}
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            style={{
              background: "#111827",
              color: "white",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "15px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <FaSave />
            Save Duplicated Product
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Styles ---- */

const label: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 600,
  marginBottom: "6px",
  display: "block",
};

const smallLabel: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
  marginBottom: "14px",
  fontSize: "14px",
};

const box: React.CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  padding: "16px",
  borderRadius: "8px",
};

const boxHeader: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: 700,
  marginBottom: "12px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const boxIcon: React.CSSProperties = {
  fontSize: "15px",
  color: "#374151",
};
