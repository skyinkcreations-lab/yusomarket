"use client";

import React from "react";
import { FiBell } from "react-icons/fi";

export default function AdminHeader() {
  return (
    <header
      style={{
        height: 70,
        background: "#ffffff",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* LEFT — TITLE + SUBTITLE */}
      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.3px",
          }}
        >
          Admin Dashboard
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
          Full control of vendors, stores & marketplace health.
        </div>
      </div>

      {/* RIGHT SIDE BLOCK */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>

        {/* STATUS PILL */}
        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: "rgba(16,185,129,0.12)",
            border: "1px solid rgba(16,185,129,0.32)",
            fontSize: 12,
            color: "#059669",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 6px rgba(16,185,129,0.6)",
            }}
          />
          All systems normal
        </div>

        {/* NOTIFICATIONS */}
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#475569",
          }}
        >
          <FiBell size={18} />
        </button>

        {/* USER PROFILE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px 9px 6px 14px",
            borderRadius: 999,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#0f172a",
                lineHeight: 1.2,
              }}
            >
              Jordan (Owner)
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              yuso-admin@market.com
            </div>
          </div>

          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #6366f1 0%, #3b82f6 40%, #0ea5e9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            J
          </div>
        </div>
      </div>
    </header>
  );
}
