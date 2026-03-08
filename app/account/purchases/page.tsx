"use client";

import Link from "next/link";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";

export default function PurchasesPage() {
  return (
    <>
      <Header />

      <div style={{ padding: "40px 16px", maxWidth: 1180, margin: "0 auto" }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>
          Purchases & Tracking
        </h2>
        <p style={{ color: "#666", marginBottom: 30 }}>
          Track deliveries and manage purchased items.
        </p>

        <div
          style={{
            border: "1px solid #eee",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: 600,
          }}
        >
          <div>
            <p style={{ fontWeight: 600 }}>Monstera Plant</p>
            <p style={{ fontSize: 13 }}>Est. delivery: Nov 28</p>
            <p style={{ fontSize: 13 }}>
              Tracking: <span style={{ fontWeight: 600 }}>In transit</span>
            </p>
          </div>

          <Link href="/account/purchases/987">
            <button
              style={{
                background: "#111",
                color: "#fff",
                borderRadius: 6,
                padding: "8px 14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Track
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
