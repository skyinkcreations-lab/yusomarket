"use client";

import Link from "next/link";

export default function DashboardCard({
  title,
  description,
  icon,
  accentColor,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        className="dashboard-card"
        style={{
          position: "relative",
          background: "#ffffff",
          padding: "28px 30px",
          borderRadius: 20,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow:
            "0 18px 45px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.04)",
          transition: "all 0.25s ease",
          cursor: "pointer",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* TOP ACCENT BAR */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: 5,
            width: "100%",
            background: accentColor,
          }}
        />

        {/* ICON WRAPPER */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: `${accentColor}15`,
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
            transition: "0.25s",
            color: accentColor,
          }}
          className="dashboard-card-icon"
        >
          {icon}
        </div>

        {/* TITLE */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 6,
            color: "#111",
          }}
        >
          {title}
        </h3>

        {/* DESCRIPTION */}
        <p
          style={{
            fontSize: 14,
            opacity: 0.75,
            lineHeight: "1.55",
          }}
        >
          {description}
        </p>

        <style>{`
          .dashboard-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 22px 50px rgba(0,0,0,0.12);
            border-color: rgba(0,0,0,0.14);
          }

          .dashboard-card:hover .dashboard-card-icon {
            transform: scale(1.06);
            background: ${accentColor}25;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
        `}</style>
      </div>
    </Link>
  );
}
