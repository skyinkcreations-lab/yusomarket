"use client";

import { useState } from "react";
import { FaSearch, FaPlus, FaTrash, FaEdit } from "react-icons/fa";

type Brand = {
  id: number;
  name: string;
  products: number;
  created: string;
};

const INITIAL_BRANDS: Brand[] = [
  { id: 1, name: "Nike", products: 42, created: "2024-01-14" },
  { id: 2, name: "Adidas", products: 21, created: "2024-02-02" },
  { id: 3, name: "Sony", products: 18, created: "2024-03-10" },
  { id: 4, name: "Samsung", products: 33, created: "2024-04-05" },
];

export default function BrandsPage() {
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [search, setSearch] = useState("");

  const filtered = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div style={{ padding: "30px" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 600 }}>Brands</h1>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            Manage brands linked to your products.
          </p>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#111827",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <FaPlus /> Add Brand
        </button>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: "16px", maxWidth: "260px", position: "relative" }}>
        <FaSearch
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            fontSize: "12px",
          }}
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search brands..."
          style={{
            width: "100%",
            height: "36px",
            padding: "6px 8px 6px 26px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
          }}
        />
      </div>

      {/* TABLE */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          background: "#fff",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 140px 120px",
            padding: "10px 12px",
            background: "#f9fafb",
            fontSize: "12px",
            fontWeight: 600,
            color: "#4b5563",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div>Brand</div>
          <div>Products</div>
          <div>Created</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>

        {/* ROWS */}
        {filtered.map((brand, index) => (
          <div
            key={brand.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 140px 120px",
              padding: "12px",
              background: index % 2 === 0 ? "#fff" : "#f9fafb",
              borderBottom: "1px solid #f3f4f6",
              fontSize: "14px",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 500 }}>{brand.name}</div>
            <div>{brand.products}</div>
            <div>{brand.created}</div>

            {/* ACTIONS */}
            <div style={{ textAlign: "right", display: "flex", gap: "14px", justifyContent: "flex-end" }}>
              <FaEdit
                style={{ cursor: "pointer", color: "#1f2937", fontSize: "15px" }}
              />
              <FaTrash
                style={{ cursor: "pointer", color: "#b91c1c", fontSize: "15px" }}
              />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            No brands found.
          </div>
        )}
      </div>
    </div>
  );
}
