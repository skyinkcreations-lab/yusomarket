"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaSave, FaTag } from "react-icons/fa";

/**
 * For now we fake loading a category.
 * Later you’ll swap this for a fetch/Supabase call using `id`.
 */
const MOCK_CATEGORY = {
  id: 1,
  name: "Electronics",
  slug: "electronics",
  description: "Phones, laptops, accessories and other electronic devices.",
  status: "active" as "active" | "hidden",
  productsCount: 37,
  createdAt: "2025-10-02 11:34",
  updatedAt: "2025-11-20 09:12",
};

export default function EditCategoryPage() {
  const params = useParams();
  const categoryId = params?.id ?? MOCK_CATEGORY.id;

  // Local state (seeded from mock data for now)
  const [name, setName] = useState(MOCK_CATEGORY.name);
  const [slug, setSlug] = useState(MOCK_CATEGORY.slug);
  const [description, setDescription] = useState(MOCK_CATEGORY.description);
  const [status, setStatus] = useState<"active" | "hidden">(
    MOCK_CATEGORY.status
  );

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  function handleSave() {
    // TODO: Hook up to Supabase update
    console.log("Update category", {
      id: categoryId,
      name,
      slug,
      description,
      status,
    });
    alert("Category updated (mock)");
  }

  return (
    <div style={{ padding: "30px", maxWidth: "900px" }}>
      {/* Back link */}
      <Link
        href="/dashboard/products/categories"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "14px",
          color: "#4b5563",
          marginBottom: "18px",
        }}
      >
        <FaArrowLeft /> Back to categories
      </Link>

      {/* PAGE HEADER */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: "#e5e7eb",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            <FaTag style={{ fontSize: "11px" }} />
            Category ID: {categoryId}
          </div>

          <h1
            style={{
              fontSize: "26px",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            Edit Category
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280" }}>
            Update the details and visibility of this category.
          </p>
        </div>

        {/* Status badge + quick meta */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            alignItems: "flex-end",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          <span style={statusPillStyle(status)}>
            {status === "active" ? "Active" : "Hidden"}
          </span>
          <div>Products in this category: {MOCK_CATEGORY.productsCount}</div>
          <div>Created: {MOCK_CATEGORY.createdAt}</div>
          <div>Last updated: {MOCK_CATEGORY.updatedAt}</div>
        </div>
      </div>

      {/* MAIN FORM CARD */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          padding: "22px",
        }}
      >
        {/* Name + Slug (2-col on desktop) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)",
            gap: "16px",
            marginBottom: "18px",
          }}
        >
          {/* Name */}
          <div>
            <label style={labelStyle}>Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(generateSlug(e.target.value));
              }}
              placeholder="e.g. Electronics"
              style={inputStyle}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={labelStyle}>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="electronics"
              style={inputStyle}
            />
            <p style={helpTextStyle}>
              Used in URLs and filters. Keep it short and lowercase.
            </p>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "18px" }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what products belong in this category…"
            style={{
              ...inputStyle,
              minHeight: "100px",
              resize: "vertical",
            }}
          />
        </div>

        {/* Status */}
        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Status</label>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "active" | "hidden")
            }
            style={{
              ...inputStyle,
              height: "40px",
            }}
          >
            <option value="active">Active (visible in store)</option>
            <option value="hidden">Hidden (not shown to customers)</option>
          </select>
        </div>

        {/* Actions row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "12px", color: "#6b7280" }}>
            Changes won&apos;t affect existing orders — only how products are
            grouped and filtered.
          </p>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              style={{
                padding: "9px 14px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                cursor: "pointer",
              }}
              onClick={() => window.history.back()}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              style={saveBtnStyle}
            >
              <FaSave /> Update Category
            </button>
          </div>
        </div>
      </div>

      {/* Bottom spacing on mobile so it doesn’t butt up against the edge */}
      <div style={{ height: "40px" }} />
    </div>
  );
}

/* ---------- Styles ---------- */

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
  display: "block",
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#6b7280",
  marginTop: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 10px",
  fontSize: "14px",
  borderRadius: "6px",
  border: "1px solid #d1d5db",
};

const saveBtnStyle: React.CSSProperties = {
  background: "#111827",
  color: "#ffffff",
  padding: "9px 16px",
  fontSize: "14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

function statusPillStyle(
  status: "active" | "hidden"
): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "3px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 500,
    borderWidth: 1,
    borderStyle: "solid",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  if (status === "active") {
    return {
      ...base,
      background: "#dcfce7",
      borderColor: "#22c55e",
      color: "#166534",
    };
  }

  return {
    ...base,
    background: "#e5e7eb",
    borderColor: "#9ca3af",
    color: "#374151",
  };
}
