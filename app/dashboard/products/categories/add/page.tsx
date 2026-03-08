"use client";

import { useState } from "react";
import { FaArrowLeft, FaSave, FaTag } from "react-icons/fa";
import Link from "next/link";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  return (
    <div style={{ padding: "30px", maxWidth: "800px" }}>
      {/* Back Button */}
      <Link
        href="/dashboard/products/categories"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "14px",
          color: "#4b5563",
          marginBottom: "20px",
        }}
      >
        <FaArrowLeft /> Back to categories
      </Link>

      {/* Header */}
      <h1 style={{ fontSize: "26px", fontWeight: 600, marginBottom: "10px" }}>
        Add New Category
      </h1>
      <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "25px" }}>
        Create a new category to organise your products.
      </p>

      {/* FORM */}
      <div
        style={{
          background: "#fff",
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Name */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Category Name</label>
          <input
            type="text"
            placeholder="e.g. Electronics"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSlug(generateSlug(e.target.value));
            }}
            style={inputStyle}
          />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Slug</label>
          <input
            type="text"
            placeholder="auto-generated"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            style={inputStyle}
          />
          <p style={helpTextStyle}>
            URL-friendly version of the name (e.g. electronics).
          </p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Description</label>
          <textarea
            placeholder="Optional description of this category…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              ...inputStyle,
              height: "100px",
              resize: "vertical",
            }}
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: "22px" }}>
          <label style={labelStyle}>Status</label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              ...inputStyle,
              height: "40px",
            }}
          >
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {/* Save Button */}
        <button style={saveBtnStyle}>
          <FaSave /> Save Category
        </button>
      </div>

      {/* Mobile spacing */}
      <div style={{ height: "50px" }}></div>
    </div>
  );
}

/* Styles */
const labelStyle: any = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
  display: "block",
};

const helpTextStyle: any = {
  fontSize: "11px",
  color: "#6b7280",
  marginTop: "4px",
};

const inputStyle: any = {
  width: "100%",
  padding: "10px",
  fontSize: "14px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
};

const saveBtnStyle: any = {
  marginTop: "10px",
  background: "#111827",
  color: "white",
  padding: "10px 18px",
  fontSize: "15px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};
