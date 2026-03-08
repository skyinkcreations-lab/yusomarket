"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FaSearch, FaEye } from "react-icons/fa";

/* ------------------------------- DATA ------------------------------- */
type Customer = {
  id: number;
  name: string;
  email: string;
  phone: string;
  code: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  status: "active" | "inactive";
};

const CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: "Jordan Lee",
    email: "jordan@example.com",
    phone: "+62 812-4455-9911",
    code: "CUST-001",
    totalOrders: 12,
    totalSpent: 2450000,
    lastOrder: "2025-11-23 14:21",
    status: "active",
  },
  {
    id: 2,
    name: "Rina Setiawan",
    email: "rina@example.com",
    phone: "+62 812-8899-4412",
    code: "CUST-002",
    totalOrders: 6,
    totalSpent: 760000,
    lastOrder: "2025-11-22 19:40",
    status: "active",
  },
  {
    id: 3,
    name: "Adi Pratama",
    email: "adi@example.com",
    phone: "+62 813-7722-5588",
    code: "CUST-003",
    totalOrders: 0,
    totalSpent: 0,
    lastOrder: "-",
    status: "inactive",
  },
];

function formatRP(amount: number) {
  return "Rp" + amount.toLocaleString("id-ID");
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* ==================================================================== */

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return CUSTOMERS.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "all" ? true : c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const paginated = filtered.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <div style={{ padding: "30px" }}>
      {/* HEADER */}
      <h1 style={{ fontSize: 26, fontWeight: 600 }}>Customers</h1>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
        View and manage your loyal buyers and new shoppers.
      </p>

      {/* FILTERS */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", width: "280px", flexGrow: 1 }}>
          <FaSearch
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 11,
              color: "#9ca3af",
            }}
          />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search customers…"
            style={{
              width: "100%",
              height: 38,
              padding: "6px 10px 6px 26px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "active", "inactive"] as const).map((item) => {
            const active = statusFilter === item;
            return (
              <button
                key={item}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(item);
                }}
                style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  borderRadius: 999,
                  border: active
                    ? "1px solid #111827"
                    : "1px solid #d1d5db",
                  background: active ? "#111827" : "#fff",
                  color: active ? "#fff" : "#374151",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* TABLE WRAPPER */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          background: "#fff",
          overflow: "hidden",
        }}
      >
        {/* DESKTOP TABLE */}
        <div className="desktop-table">
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "44px 260px 230px 150px 110px 130px 110px 90px",
              padding: "10px 16px",
              background: "#f9fafb",
              borderBottom: "1px solid #e5e7eb",
              fontSize: 12,
              fontWeight: 600,
              color: "#4b5563",
            }}
          >
            <div>
              <input type="checkbox" />
            </div>
            <div>Customer</div>
            <div>Email</div>
            <div>Phone</div>
            <div>Total Orders</div>
            <div>Total Spent</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {/* Rows */}
          {paginated.map((c, i) => (
            <div
              key={c.id}
              className="customer-row"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "44px 260px 230px 150px 110px 130px 110px 90px",
                padding: "10px 16px",
                fontSize: 13,
                background: i % 2 === 0 ? "#fff" : "#f9fafb",
                borderBottom: "1px solid #f3f4f6",
                alignItems: "center",
              }}
            >
              <div>
                <input type="checkbox" />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "999px",
                    background: "#eef2ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {getInitials(c.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    ID: {c.code}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12 }}>{c.email}</div>
              <div style={{ fontSize: 12 }}>{c.phone}</div>

              <div>{c.totalOrders}</div>
              <div>{formatRP(c.totalSpent)}</div>

              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 500,
                    background:
                      c.status === "active" ? "#ecfdf3" : "#f3f4f6",
                    color:
                      c.status === "active" ? "#166534" : "#4b5563",
                    border:
                      c.status === "active"
                        ? "1px solid #bbf7d0"
                        : "1px solid #e5e7eb",
                  }}
                >
                  {c.status === "active" ? "Active" : "Inactive"}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <Link href={`/dashboard/customers/${c.id}`}>
                  <FaEye
                    style={{
                      fontSize: 15,
                      cursor: "pointer",
                      color: "#4f46e5",
                    }}
                    title="View details"
                  />
                </Link>
              </div>
            </div>
          ))}

          {paginated.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              No customers match your filters.
            </div>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="mobile-cards">
          {paginated.map((c) => (
            <div
              key={c.id}
              style={{
                padding: 16,
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "999px",
                    background: "#eef2ff",
                    color: "#4f46e5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {getInitials(c.name)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    ID: {c.code}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13 }}>📧 {c.email}</div>
              <div style={{ fontSize: 13 }}>📞 {c.phone}</div>

              <div style={{ fontSize: 13 }}>
                Orders: <strong>{c.totalOrders}</strong>
              </div>

              <div style={{ fontSize: 13 }}>
                Spent: <strong>{formatRP(c.totalSpent)}</strong>
              </div>

              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Last order: {c.lastOrder === "-" ? "—" : c.lastOrder}
              </div>

              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 500,
                    background:
                      c.status === "active" ? "#ecfdf3" : "#f3f4f6",
                    color:
                      c.status === "active" ? "#166534" : "#4b5563",
                    border:
                      c.status === "active"
                        ? "1px solid #bbf7d0"
                        : "1px solid #e5e7eb",
                  }}
                >
                  {c.status === "active" ? "Active" : "Inactive"}
                </span>

                <Link
                  href={`/dashboard/customers/${c.id}`}
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    fontSize: 13,
                    borderRadius: 6,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                  }}
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}

          {paginated.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              No customers match your filters.
            </div>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 13,
        }}
      >
        <div>
          Showing{" "}
          <strong>
            {filtered.length === 0
              ? 0
              : (page - 1) * rowsPerPage + 1}
            –
            {Math.min(page * rowsPerPage, filtered.length)}
          </strong>{" "}
          of <strong>{filtered.length}</strong>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: page === 1 ? "not-allowed" : "pointer",
              minWidth: 70,
            }}
          >
            Prev
          </button>

          <button
            onClick={() => page < totalPages && setPage(page + 1)}
            disabled={page === totalPages}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              minWidth: 70,
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* RESPONSIVE + ROW HOVER STYLES */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; }
        }

        @media (min-width: 769px) {
          .desktop-table { display: block; }
          .mobile-cards { display: none; }
        }

        .customer-row:hover {
          background: #f3f4ff !important;
        }
      `}</style>
    </div>
  );
}
