export default function AdminDashboardPage() {
  const cardBase: React.CSSProperties = {
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    padding: "16px 18px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
  };

  const statLabel: React.CSSProperties = {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  };

  const statValue: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  };

  const statMeta: React.CSSProperties = {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Top stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <div style={cardBase}>
          <div style={statLabel}>Total Vendors</div>
          <div style={statValue}>3</div>
          <div style={statMeta}>+8 new this week</div>
        </div>

        <div style={cardBase}>
          <div style={statLabel}>Approved Vendors</div>
          <div style={statValue}>1</div>
          <div style={statMeta}>Ready to sell</div>
        </div>

        <div style={cardBase}>
          <div style={statLabel}>Pending Applications</div>
          <div style={statValue}>2</div>
          <div style={statMeta}>In manual review queue</div>
        </div>

        <div style={cardBase}>
          <div style={statLabel}>Total Vendor GMV</div>
          <div style={statValue}>$18,554.23</div>
          <div style={statMeta}>+24% vs last period</div>
        </div>
      </div>

      {/* Middle quick cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <div style={cardBase}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Review pending vendors
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
            Check documents, KYC details and approve or reject applications.
          </p>
          <button
            style={{
              fontSize: 12,
              borderRadius: 999,
              border: "none",
              background: "#4f46e5",
              color: "#f9fafb",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Go to applications
          </button>
        </div>

        <div style={cardBase}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            View platform health
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
            See aggregated orders, revenue and active stores across YusoMarket.
          </p>
          <button
            style={{
              fontSize: 12,
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Open analytics
          </button>
        </div>

        <div style={cardBase}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Configure marketplace fees
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
            Adjust commission, withdrawal fees and vendor billing settings.
          </p>
          <button
            style={{
              fontSize: 12,
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Edit fees
          </button>
        </div>

        <div style={cardBase}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Manage disputes & risk
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
            Oversee escalated orders, refunds and compliance flags.
          </p>
          <button
            style={{
              fontSize: 12,
              borderRadius: 999,
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#111827",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            View disputes
          </button>
        </div>
      </div>

      {/* Bottom grid: pending vendors + side panels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2.2fr) minmax(0, 1.1fr)",
          gap: 18,
          alignItems: "flex-start",
        }}
      >
        {/* Pending vendor applications table */}
        <div style={cardBase}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Pending vendor applications
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Approve only vendors that meet your marketplace criteria.
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                padding: "4px 8px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
              }}
            >
              2 in queue
            </div>
          </div>

          <div
            style={{
              width: "100%",
              overflowX: "auto",
              marginTop: 6,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                fontSize: 12,
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    color: "#6b7280",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={{ padding: "8px 8px" }}>Store</th>
                  <th style={{ padding: "8px 8px" }}>Owner</th>
                  <th style={{ padding: "8px 8px" }}>Created</th>
                  <th style={{ padding: "8px 8px" }}>Products</th>
                  <th style={{ padding: "8px 8px" }}>Orders</th>
                  <th style={{ padding: "8px 8px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    store: "TechNest ID",
                    owner: "Rizky Pratama",
                    email: "rizky@technest.id",
                    created: "2025-11-20",
                    products: 34,
                    orders: 12,
                  },
                  {
                    store: "UrbanHome Living",
                    owner: "Maya Hadi",
                    email: "maya@urbanhome.id",
                    created: "2025-11-22",
                    products: 19,
                    orders: 4,
                  },
                ].map((row, idx) => (
                  <tr
                    key={row.store}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                    }}
                  >
                    <td style={{ padding: "8px 8px" }}>
                      <div style={{ fontWeight: 500, color: "#111827" }}>{row.store}</div>
                      <div style={{ color: "#6b7280", fontSize: 11 }}>{row.email}</div>
                    </td>
                    <td style={{ padding: "8px 8px" }}>{row.owner}</td>
                    <td style={{ padding: "8px 8px" }}>{row.created}</td>
                    <td style={{ padding: "8px 8px" }}>{row.products}</td>
                    <td style={{ padding: "8px 8px" }}>{row.orders}</td>
                    <td
                      style={{
                        padding: "8px 8px",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <button
                        style={{
                          fontSize: 11,
                          borderRadius: 999,
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          color: "#b91c1c",
                          padding: "5px 8px",
                          marginRight: 6,
                          cursor: "pointer",
                        }}
                      >
                        Reject
                      </button>
                      <button
                        style={{
                          fontSize: 11,
                          borderRadius: 999,
                          border: "1px solid #bbf7d0",
                          background: "#ecfdf5",
                          color: "#15803d",
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column widgets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={cardBase}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Vendor status overview
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 10 }}>
              Snapshot across all active vendor accounts.
            </div>

            {[
              { label: "Approved", value: 1, color: "#22c55e" },
              { label: "Pending review", value: 2, color: "#f97316" },
              { label: "Rejected / blocked", value: 0, color: "#ef4444" },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                  padding: "4px 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: row.color,
                    }}
                  />
                  <span style={{ color: "#4b5563" }}>{row.label}</span>
                </div>
                <span style={{ color: "#111827", fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={cardBase}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Recent admin activity
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>
              These are just placeholder events — pipe your audit logs here.
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                fontSize: 12,
                color: "#4b5563",
              }}
            >
              <li style={{ marginBottom: 6 }}>
                <strong>System</strong> — Daily payout reconciliation completed.
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong>You</strong> — Updated global commission to 8% for new vendors.
              </li>
              <li>
                <strong>Risk Engine</strong> — No new high-risk orders detected.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
