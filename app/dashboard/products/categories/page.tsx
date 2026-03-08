"use client";

import { useState } from "react";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

/* --------------------------------------------
   Dummy Categories
--------------------------------------------- */
type Category = {
  id: number;
  name: string;
  slug: string;
  products: number;
  status: "active" | "hidden";
};

const CATEGORIES_DATA: Category[] = [
  { id: 1, name: "Electronics", slug: "electronics", products: 42, status: "active" },
  { id: 2, name: "Home & Living", slug: "home-living", products: 18, status: "active" },
  { id: 3, name: "Fashion", slug: "fashion", products: 33, status: "active" },
  { id: 4, name: "Toys & Kids", slug: "toys-kids", products: 9, status: "hidden" },
];

/* Status badge styling */
function statusBadge(status: "active" | "hidden") {
  return {
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    border: "1px solid",
    color: status === "active" ? "#166534" : "#7c2d12",
    background: status === "active" ? "#dcfce7" : "#ffedd5",
    borderColor: status === "active" ? "#22c55e" : "#fb923c",
  };
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(CATEGORIES_DATA);

  // modal control
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  function openDeleteModal(category: Category) {
    setSelectedCategory(category);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedCategory(null);
  }

  function confirmDelete() {
    if (!selectedCategory) return;
    setCategories(categories.filter(c => c.id !== selectedCategory.id));
    closeModal();
  }

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 600 }}>Categories</h1>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>
            Manage your product categories to keep your store organised.
          </p>
        </div>

        <Link
          href="/dashboard/products/categories/add"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "#111827",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: "6px",
            fontSize: "14px",
          }}
        >
          <FaPlus /> Add Category
        </Link>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: "16px", maxWidth: "300px", position: "relative" }}>
        <FaSearch
          style={{
            position: "absolute",
            top: "50%",
            left: 8,
            transform: "translateY(-50%)",
            fontSize: "12px",
            color: "#9ca3af",
          }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          style={{
            width: "100%",
            padding: "6px 10px 6px 28px",
            height: "34px",
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
          background: "#ffffff",
          overflow: "hidden",
        }}
      >
        {/* Desktop Header */}
        <div
          className="category-table-header"
          style={{
            display: "grid",
            gridTemplateColumns: "40px 1fr 1fr 120px 120px",
            padding: "10px 12px",
            background: "#f9fafb",
            borderBottom: "1px solid #e5e7eb",
            fontSize: "12px",
            fontWeight: 600,
            color: "#4b5563",
          }}
        >
          <div></div>
          <div>Name</div>
          <div>Slug</div>
          <div>Products</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>

        {/* Rows */}
        {filtered.map((category, i) => (
          <div
            key={category.id}
            className="category-row"
            style={{
              display: "grid",
              gridTemplateColumns: "40px 1fr 1fr 120px 120px",
              padding: "10px 12px",
              background: i % 2 === 0 ? "#ffffff" : "#f9fafb",
              borderBottom: "1px solid #f3f4f6",
              alignItems: "center",
              fontSize: "13px",
            }}
          >
            <div>
              <input type="checkbox" />
            </div>

            <div style={{ fontWeight: 500 }}>
              {category.name}
              <div style={{ marginTop: "4px" }}>
                <span style={statusBadge(category.status)}>{category.status}</span>
              </div>
            </div>

            <div style={{ fontSize: "12px", color: "#6b7280" }}>{category.slug}</div>

            <div>{category.products}</div>

            {/* Actions */}
            <div style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "14px" }}>
              <Link href={`/dashboard/products/categories/${category.id}`}>
                <FaEdit style={{ cursor: "pointer", fontSize: "15px", color: "#4b5563" }} />
              </Link>

              <FaTrash
                onClick={() => openDeleteModal(category)}
                style={{ cursor: "pointer", fontSize: "15px", color: "#b91c1c" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Category</h2>
            <p>
              Are you sure you want to delete <strong>{selectedCategory?.name}</strong>?  
              This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button className="cancel" onClick={closeModal}>Cancel</button>
              <button className="delete" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE + MODAL STYLES */}
      <style>{`
        @media (max-width: 768px) {
          .category-table-header {
            display: none !important;
          }
          .category-row {
            display: block !important;
            padding: 16px;
            border-bottom: 1px solid #eee;
          }
          .category-row > div {
            margin-bottom: 10px;
          }
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          animation: fadeIn .2s ease-in-out;
          z-index: 2000;
        }
        .modal {
          background: white;
          padding: 22px;
          width: 360px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          animation: slideUp .25s ease-out;
        }
        .modal h2 {
          margin-bottom: 10px;
          font-size: 20px;
          font-weight: 600;
        }
        .modal p {
          font-size: 14px;
          color: #555;
          margin-bottom: 20px;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .modal-actions .cancel {
          padding: 8px 12px;
          background: #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }
        .modal-actions .delete {
          padding: 8px 12px;
          background: #b91c1c;
          color: white;
          border-radius: 6px;
          font-size: 14px;
        }

        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
