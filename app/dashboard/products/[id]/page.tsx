"use client";

import { useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaEye,
  FaTrash,
  FaClone,
} from "react-icons/fa";

import DeleteModal from "@/app/dashboard/_components/DeleteModal";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const products = [
    {
      id: 1,
      name: "Wireless Earbuds",
      sku: "WRL-001",
      stock: 120,
      price: "$49.99",
      category: "Electronics",
      tags: "—",
      brand: "—",
      date: "Published 2025/11/05 at 2:39 pm",
      image: "/images/earbuds.jpg",
    },
    {
      id: 2,
      name: "Smart Fitness Watch",
      sku: "FIT-002",
      stock: 52,
      price: "$89.95",
      category: "Accessories",
      tags: "—",
      brand: "—",
      date: "Published 2025/11/05 at 2:39 pm",
      image: "/images/watch.jpg",
    },
    {
      id: 3,
      name: "LED Desk Lamp",
      sku: "LAMP-003",
      stock: 0,
      price: "$29.99",
      category: "Lighting",
      tags: "—",
      brand: "—",
      date: "Published 2025/11/05 at 2:38 pm",
      image: "/images/lamp.jpg",
    },
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "600",
          marginBottom: "20px",
        }}
      >
        Products
      </h1>

      {/* ---------- TOP CONTROLS ---------- */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        {/* Add Product */}
        <button
          style={{
            background: "#2271b1",
            color: "white",
            padding: "6px 12px",
            fontSize: "13px",
            borderRadius: "3px",
            border: "1px solid #1d5f94",
            cursor: "pointer",
          }}
        >
          <FaPlus style={{ marginRight: "5px", marginBottom: "-2px" }} />
          Add New Product
        </button>

        {/* Bulk Actions */}
        <select
          style={{
            height: "32px",
            fontSize: "13px",
            padding: "3px",
            border: "1px solid #8c8f94",
          }}
        >
          <option>Bulk actions</option>
          <option>Edit</option>
          <option>Delete</option>
        </select>

        <button
          style={{
            height: "32px",
            fontSize: "13px",
            padding: "6px 12px",
            borderRadius: "3px",
            border: "1px solid #8c8f94",
            background: "#f6f7f7",
            cursor: "pointer",
          }}
        >
          Apply
        </button>

        {/* Search */}
        <input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            height: "32px",
            width: "200px",
            fontSize: "13px",
            padding: "3px 8px",
            border: "1px solid #8c8f94",
          }}
        />
      </div>

      {/* ---------- TABLE WRAPPER ---------- */}
      <div
        style={{
          border: "1px solid #dcdcde",
          borderRadius: "4px",
          background: "white",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            background: "#f0f0f1",
            borderBottom: "1px solid #dcdcde",
            padding: "12px 10px",
            fontWeight: "600",
            fontSize: "13px",
            display: "grid",
            gridTemplateColumns:
              "40px 60px 200px 100px 80px 120px 120px 120px 120px 100px",
            alignItems: "center",
          }}
        >
          <input type="checkbox" />
          <span></span>
          <span>Name</span>
          <span>SKU</span>
          <span>Stock</span>
          <span>Price</span>
          <span>Categories</span>
          <span>Tags</span>
          <span>Brands</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {/* ---------- ROWS ---------- */}
        {products.map((p, index) => (
          <div
            key={p.id} // ✅ FIXED — unique root element key
            style={{
              borderBottom: "1px solid #dcdcde",
              padding: "12px 10px",
              display: "grid",
              gridTemplateColumns:
                "40px 60px 200px 100px 80px 120px 120px 120px 120px 100px",
              fontSize: "13px",
              alignItems: "center",
              background: index % 2 === 0 ? "#fff" : "#f9f9f9",
            }}
          >
            <input type="checkbox" />

            <img
              src={p.image}
              alt={p.name}
              style={{
                width: "48px",
                height: "48px",
                objectFit: "cover",
                borderRadius: "3px",
              }}
            />

            <span>{p.name}</span>
            <span>{p.sku}</span>
            <span>{p.stock}</span>
            <span>{p.price}</span>
            <span>{p.category}</span>
            <span>{p.tags}</span>
            <span>{p.brand}</span>
            <span>{p.date}</span>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: "10px" }}>
              <FaEdit style={{ cursor: "pointer" }} />
              <FaEye style={{ cursor: "pointer" }} />
              <FaClone style={{ cursor: "pointer" }} />

              <FaTrash
                style={{ cursor: "pointer", color: "#b32d2e" }}
                onClick={() => {
                  setSelectedProduct(p);
                  setShowDelete(true);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ---------- DELETE MODAL ---------- */}
      <DeleteModal
        open={showDelete}
        itemName={selectedProduct?.name}
        onClose={() => setShowDelete(false)}
        onConfirm={() => {
          console.log("Deleting:", selectedProduct);
          setShowDelete(false);
        }}
      />
    </div>
  );
}
