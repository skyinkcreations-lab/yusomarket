"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { FaEye, FaPen, FaTrash, FaClone } from "react-icons/fa";

type Product = {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price: string;
  date: string;
  category: string;
  brand: string;
  tags: string;
  status: "published" | "draft";
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Wireless Earbuds",
    sku: "WRL-001",
    stock: 120,
    price: "$49.99",
    date: "Published 2025/11/05 at 2:39 pm",
    category: "Electronics",
    brand: "—",
    tags: "—",
    status: "published",
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    sku: "FIT-002",
    stock: 52,
    price: "$89.95",
    date: "Published 2025/11/05 at 2:39 pm",
    category: "Accessories",
    brand: "—",
    tags: "—",
    status: "published",
  },
  {
    id: 3,
    name: "LED Desk Lamp",
    sku: "LAMP-003",
    stock: 0,
    price: "$29.99",
    date: "Published 2025/11/05 at 2:38 pm",
    category: "Lighting",
    brand: "—",
    tags: "—",
    status: "draft",
  },
];

type SortKey = "name" | "sku" | "stock" | "price" | "date";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState("none");

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [quickEditId, setQuickEditId] = useState<number | null>(null);
  const [quickEditDraft, setQuickEditDraft] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    status: "published",
  });

  const [page, setPage] = useState(1);
  const perPage = 20;

  // ----- helpers -----
  const priceNumber = (p: Product) =>
    parseFloat(p.price.replace(/[^0-9.]/g, "")) || 0;

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  );

  // ----- filtering -----
  let visible = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filterCategory !== "all") {
    visible = visible.filter((p) => p.category === filterCategory);
  }

  if (filterStock === "instock") {
    visible = visible.filter((p) => p.stock > 0);
  } else if (filterStock === "outofstock") {
    visible = visible.filter((p) => p.stock <= 0);
  }

  // ----- sorting -----
  visible.sort((a, b) => {
    let valA: number | string = "";
    let valB: number | string = "";

    switch (sortKey) {
      case "name":
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case "sku":
        valA = a.sku.toLowerCase();
        valB = b.sku.toLowerCase();
        break;
      case "stock":
        valA = a.stock;
        valB = b.stock;
        break;
      case "price":
        valA = priceNumber(a);
        valB = priceNumber(b);
        break;
      case "date":
        // crude but fine for demo – dates already sorted newest first in string
        valA = a.date;
        valB = b.date;
        break;
    }

    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // ----- pagination -----
  const totalItems = visible.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const pageItems = visible.slice(startIndex, endIndex);

  // reset page when filters/search change hard (not wired with effect, but good enough for now)
  if (pageItems.length === 0 && currentPage > 1) {
    setPage(1);
  }

  // ----- events -----
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pageItems.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleRowSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortLabel = (key: SortKey, label: string) => {
    if (sortKey !== key) return label;
    return `${label} ${sortDir === "asc" ? "▲" : "▼"}`;
  };

  const openQuickEdit = (p: Product) => {
    setQuickEditId(p.id);
    setQuickEditDraft({
      name: p.name,
      sku: p.sku,
      price: p.price.replace(/[^0-9.]/g, ""),
      stock: String(p.stock),
      status: p.status,
    });
  };

  const cancelQuickEdit = () => {
    setQuickEditId(null);
  };

  const saveQuickEdit = () => {
    if (!quickEditId) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === quickEditId
          ? {
              ...p,
              name: quickEditDraft.name || p.name,
              sku: quickEditDraft.sku || p.sku,
              price: quickEditDraft.price
                ? `$${Number(quickEditDraft.price).toFixed(2)}`
                : p.price,
              stock: quickEditDraft.stock
                ? Number(quickEditDraft.stock)
                : p.stock,
              status: quickEditDraft.status as Product["status"],
            }
          : p
      )
    );
    setQuickEditId(null);
  };

  const handleDuplicate = (p: Product) => {
    const maxId = products.reduce((m, item) => Math.max(m, item.id), 0);
    const copy: Product = {
      ...p,
      id: maxId + 1,
      name: `${p.name} (Copy)`,
      status: "draft",
    };
    setProducts((prev) => [...prev, copy]);
  };

  const handleTrash = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((pid) => pid !== id));
  };

  const handleBulkApply = () => {
    if (bulkAction === "none" || selectedIds.length === 0) return;

    if (bulkAction === "trash") {
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
    }

    if (bulkAction === "draft") {
      setProducts((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.id) ? { ...p, status: "draft" } : p
        )
      );
    }

    setBulkAction("none");
  };

  const allSelected =
    pageItems.length > 0 &&
    pageItems.every((p) => selectedIds.includes(p.id));

  return (
    <div style={{ padding: "30px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: 600, marginBottom: "20px" }}>
        Products
      </h1>

      {/* ACTION BAR (Woo-style) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "16px",
          alignItems: "center",
        }}
      >
        <Link
          href="/dashboard/products/add"
          style={{
            background: "#2271b1",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Add New
        </Link>

        <select
          value={bulkAction}
          onChange={(e) => setBulkAction(e.target.value)}
          style={{
            padding: "4px 8px",
            border: "1px solid #c3c4c7",
            borderRadius: "4px",
            background: "#fff",
            fontSize: "13px",
          }}
        >
          <option value="none">Bulk actions</option>
          <option value="trash">Move to Trash</option>
          <option value="draft">Mark as Draft</option>
        </select>

        <button
          onClick={handleBulkApply}
          style={{
            padding: "4px 10px",
            border: "1px solid #c3c4c7",
            borderRadius: "4px",
            background: "#f6f7f7",
            fontSize: "13px",
          }}
        >
          Apply
        </button>

        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "4px 8px",
            border: "1px solid #c3c4c7",
            borderRadius: "4px",
            background: "#fff",
            fontSize: "13px",
          }}
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filterStock}
          onChange={(e) => {
            setFilterStock(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "4px 8px",
            border: "1px solid #c3c4c7",
            borderRadius: "4px",
            background: "#fff",
            fontSize: "13px",
          }}
        >
          <option value="all">All stock statuses</option>
          <option value="instock">In stock</option>
          <option value="outofstock">Out of stock</option>
        </select>

        <button
          style={{
            padding: "4px 10px",
            border: "1px solid #c3c4c7",
            borderRadius: "4px",
            background: "#f6f7f7",
            fontSize: "13px",
          }}
        >
          Filter
        </button>

        <input
          placeholder="Search products"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            border: "1px solid #c3c4c7",
            borderRadius: "4px",
            padding: "4px 8px",
            flex: "1",
            maxWidth: "260px",
            fontSize: "13px",
            background: "#fff",
          }}
        />
      </div>

      {/* TABLE */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          border: "1px solid #dcdcde",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr style={{ background: "#f6f7f7" }}>
            <th style={{ ...thStyle, width: 25 }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </th>
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("name")}
            >
              {sortLabel("name", "Name")}
            </th>
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("sku")}
            >
              {sortLabel("sku", "SKU")}
            </th>
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("stock")}
            >
              {sortLabel("stock", "Stock")}
            </th>
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("price")}
            >
              {sortLabel("price", "Price")}
            </th>
            <th style={thStyle}>Categories</th>
            <th style={thStyle}>Tags</th>
            <th style={thStyle}>Brands</th>
            <th
              style={{ ...thStyle, cursor: "pointer" }}
              onClick={() => handleSort("date")}
            >
              {sortLabel("date", "Date")}
            </th>
            <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {pageItems.map((p, index) => (
            <>
              <tr
                key={p.id}
                style={{
                  background: index % 2 === 0 ? "#fff" : "#f9f9f9",
                  borderBottom: "1px solid #e2e4e7",
                }}
              >
                <td style={{ ...tdStyle, width: 25 }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => toggleRowSelection(p.id)}
                  />
                </td>

                {/* NAME + row actions (Woo style) */}
                <td style={tdStyle}>
                  <div>
                    <Link
                      href={`/dashboard/products/add?id=${p.id}`}
                      style={{
                        fontWeight: 600,
                        color: "#2271b1",
                        textDecoration: "none",
                      }}
                    >
                      {p.name}
                    </Link>
                    {p.status === "draft" && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: "11px",
                          color: "#646970",
                          fontStyle: "italic",
                        }}
                      >
                        — Draft
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: "11px",
                      color: "#2271b1",
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        (window.location.href = `/dashboard/products/add?id=${p.id}`)
                      }
                      style={linkButtonStyle}
                    >
                      Edit
                    </button>
                    <span style={{ color: "#ccc" }}>|</span>
                    <button
                      type="button"
                      onClick={() => openQuickEdit(p)}
                      style={linkButtonStyle}
                    >
                      Quick Edit
                    </button>
                    <span style={{ color: "#ccc" }}>|</span>
                    <button
                      type="button"
                      onClick={() => handleTrash(p.id)}
                      style={{ ...linkButtonStyle, color: "#d63638" }}
                    >
                      Trash
                    </button>
                    <span style={{ color: "#ccc" }}>|</span>
                    <Link
                      href={`/dashboard/products/${p.id}/view`}
                      style={linkButtonStyle}
                    >
                      View
                    </Link>
                    <span style={{ color: "#ccc" }}>|</span>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(p)}
                      style={linkButtonStyle}
                    >
                      Duplicate
                    </button>
                  </div>
                </td>

                <td style={tdStyle}>{p.sku}</td>

                <td
                  style={{
                    ...tdStyle,
                    color: p.stock > 0 ? "#008a20" : "#d63638",
                    fontWeight: 600,
                  }}
                >
                  {p.stock > 0 ? "In stock" : "Out of stock"}
                  <span style={{ color: "#646970", marginLeft: 4 }}>
                    ({p.stock})
                  </span>
                </td>

                <td style={tdStyle}>{p.price}</td>
                <td style={tdStyle}>{p.category}</td>
                <td style={tdStyle}>{p.tags}</td>
                <td style={tdStyle}>{p.brand}</td>
                <td style={tdStyle}>{p.date}</td>

                <td style={{ ...tdStyle, textAlign: "right" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <Link href={`/dashboard/products/${p.id}/view`}>
                      <FaEye
                        style={{ cursor: "pointer", color: "#2271b1" }}
                        title="View"
                      />
                    </Link>

                    <Link href={`/dashboard/products/add?id=${p.id}`}>
                      <FaPen
                        style={{ cursor: "pointer", color: "#0073aa" }}
                        title="Edit"
                      />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDuplicate(p)}
                      style={{ border: "none", background: "transparent" }}
                    >
                      <FaClone
                        style={{ cursor: "pointer", color: "#6b7280" }}
                        title="Duplicate"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTrash(p.id)}
                      style={{ border: "none", background: "transparent" }}
                    >
                      <FaTrash
                        style={{ cursor: "pointer", color: "#d63638" }}
                        title="Delete"
                      />
                    </button>
                  </div>
                </td>
              </tr>

              {/* QUICK EDIT ROW */}
              {quickEditId === p.id && (
                <tr>
                  <td colSpan={10} style={{ padding: 0, background: "#fdfdfd" }}>
                    <div
                      style={{
                        padding: "10px 10px 12px 45px",
                        borderTop: "1px solid #e2e4e7",
                        borderBottom: "1px solid #e2e4e7",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "12px 20px",
                          marginBottom: 10,
                          fontSize: 12,
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: 2,
                              color: "#50575e",
                            }}
                          >
                            Title
                          </label>
                          <input
                            type="text"
                            value={quickEditDraft.name}
                            onChange={(e) =>
                              setQuickEditDraft((d) => ({
                                ...d,
                                name: e.target.value,
                              }))
                            }
                            style={quickInputStyle}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: 2,
                              color: "#50575e",
                            }}
                          >
                            SKU
                          </label>
                          <input
                            type="text"
                            value={quickEditDraft.sku}
                            onChange={(e) =>
                              setQuickEditDraft((d) => ({
                                ...d,
                                sku: e.target.value,
                              }))
                            }
                            style={quickInputStyle}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: 2,
                              color: "#50575e",
                            }}
                          >
                            Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={quickEditDraft.price}
                            onChange={(e) =>
                              setQuickEditDraft((d) => ({
                                ...d,
                                price: e.target.value,
                              }))
                            }
                            style={quickInputStyle}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: 2,
                              color: "#50575e",
                            }}
                          >
                            Stock
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={quickEditDraft.stock}
                            onChange={(e) =>
                              setQuickEditDraft((d) => ({
                                ...d,
                                stock: e.target.value,
                              }))
                            }
                            style={quickInputStyle}
                          />
                        </div>

                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: 2,
                              color: "#50575e",
                            }}
                          >
                            Status
                          </label>
                          <select
                            value={quickEditDraft.status}
                            onChange={(e) =>
                              setQuickEditDraft((d) => ({
                                ...d,
                                status: e.target.value,
                              }))
                            }
                            style={{
                              ...quickInputStyle,
                              height: 30,
                            }}
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ fontSize: 12 }}>
                        <button
                          type="button"
                          onClick={saveQuickEdit}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            border: "1px solid #2271b1",
                            background: "#2271b1",
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: 12,
                            marginRight: 8,
                          }}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={cancelQuickEdit}
                          style={{
                            padding: "4px 10px",
                            borderRadius: 4,
                            border: "1px solid transparent",
                            background: "transparent",
                            color: "#50575e",
                            fontSize: 12,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}

          {pageItems.length === 0 && (
            <tr>
              <td colSpan={10} style={{ padding: 20, textAlign: "center" }}>
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* FOOTER / PAGINATION */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "#50575e",
        }}
      >
        <div>
          {totalItems === 0
            ? "No items"
            : totalItems === 1
            ? "1 item"
            : `${totalItems} items`}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(1)}
            style={pageButtonStyle(currentPage === 1)}
          >
            «
          </button>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={pageButtonStyle(currentPage === 1)}
          >
            ‹
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={pageButtonStyle(currentPage === totalPages)}
          >
            ›
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage(totalPages)}
            style={pageButtonStyle(currentPage === totalPages)}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}

/* Shared styles */

const thStyle: CSSProperties = {
  padding: "10px",
  fontSize: "13px",
  color: "#2c3338",
  borderBottom: "1px solid #dcdcde",
  fontWeight: 600,
  textAlign: "left",
};

const tdStyle: CSSProperties = {
  padding: "10px",
  fontSize: "13px",
  color: "#2c3338",
  verticalAlign: "top",
};

const linkButtonStyle: CSSProperties = {
  padding: 0,
  margin: 0,
  border: "none",
  background: "transparent",
  color: "#2271b1",
  cursor: "pointer",
  textDecoration: "none",
};

const quickInputStyle: CSSProperties = {
  width: 160,
  padding: "4px 6px",
  borderRadius: 3,
  border: "1px solid #c3c4c7",
  fontSize: 12,
};

const pageButtonStyle = (disabled: boolean): CSSProperties => ({
  padding: "2px 6px",
  borderRadius: 3,
  border: "1px solid #c3c4c7",
  background: disabled ? "#f6f7f7" : "#fff",
  color: disabled ? "#a7aaad" : "#2271b1",
  cursor: disabled ? "default" : "pointer",
});
