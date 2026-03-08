"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiAlertCircle,
  FiDollarSign,
  FiSettings,
  FiPieChart,
  FiLogOut,
} from "react-icons/fi";

type AdminLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  section: "overview" | "marketplace" | "system";
};

const links: AdminLink[] = [
  { href: "/admin", label: "Dashboard", icon: <FiHome />, section: "overview" },

  { href: "/admin/vendors", label: "Vendors", icon: <FiUsers />, section: "marketplace" },
  { href: "/admin/stores", label: "Stores", icon: <FiShoppingBag />, section: "marketplace" },
  { href: "/admin/products", label: "Products", icon: <FiPackage />, section: "marketplace" },
  { href: "/admin/disputes", label: "Disputes", icon: <FiAlertCircle />, section: "marketplace" },

  { href: "/admin/payouts", label: "Payouts", icon: <FiDollarSign />, section: "system" },
  { href: "/admin/analytics", label: "Platform Analytics", icon: <FiPieChart />, section: "system" },
  { href: "/admin/settings", label: "Settings", icon: <FiSettings />, section: "system" },
];

const sectionLabels = {
  overview: "OVERVIEW",
  marketplace: "MARKETPLACE",
  system: "SYSTEM",
};

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        background: "#0f172a", // Dark navy (premium)
        color: "#cbd5e1",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* BRAND */}
      <div
        style={{
          padding: "22px 24px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #38bdf8, #6366f1 55%, #0f172a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
            color: "#fff",
            boxShadow: "0 0 8px rgba(0,0,0,0.25)",
          }}
        >
          Y
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>
            YusoMarket
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            Admin Control Panel
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav
        style={{
          flex: 1,
          padding: "18px 0 28px",
          overflowY: "auto",
        }}
      >
        {Object.keys(sectionLabels).map((sectionKey) => {
          const sectionLinks = links.filter((l) => l.section === sectionKey);

          return (
            <div key={sectionKey} style={{ marginBottom: 18 }}>
              {/* SECTION TITLE */}
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                  padding: "6px 24px",
                  color: "#64748b",
                }}
              >
                {sectionLabels[sectionKey as keyof typeof sectionLabels]}
              </div>

              {/* SECTION LINKS */}
              {sectionLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/admin" && pathname.startsWith(link.href));

                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        margin: "3px 14px",
                        padding: "10px 14px",
                        borderRadius: 10,
                        fontSize: 14,
                        background: isActive
                          ? "rgba(255,255,255,0.08)"
                          : "transparent",
                        color: isActive ? "#fff" : "#cbd5e1",
                        cursor: "pointer",
                        transition: "0.18s ease",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          display: "flex",
                          alignItems: "center",
                          color: isActive ? "#38bdf8" : "#94a3b8",
                        }}
                      >
                        {link.icon}
                      </div>

                      <span>{link.label}</span>

                      {isActive && (
                        <div
                          style={{
                            marginLeft: "auto",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#38bdf8",
                          }}
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div
        style={{
          padding: "16px 20px 22px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <button
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            transition: "0.18s ease",
          }}
        >
          <FiLogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
