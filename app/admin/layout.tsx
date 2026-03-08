import React from "react";
import AdminSidebar from "../_components/AdminSidebar";
import AdminHeader from "../_components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Inter', Roboto, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: 260,
          borderRight: "1px solid #e2e8f0",
          background: "#ffffff",
          boxShadow: "0 0 20px rgba(0,0,0,0.04)",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 30,
        }}
      >
        <AdminSidebar />
      </aside>

      {/* MAIN PANEL */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        {/* STICKY HEADER */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
          }}
        >
          <AdminHeader />
        </div>

        {/* PAGE CONTENT */}
        <main
          style={{
            flex: 1,
            padding: "32px 36px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
          }}
        >
          {children}
        </main>
      </div>

      <style jsx global>{`
        /* Smooth scroll and better admin feel */
        body {
          background: #f1f5f9;
        }

        /* Scrollbar styling for admin */
        main::-webkit-scrollbar {
          width: 8px;
        }
        main::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        main::-webkit-scrollbar-track {
          background: transparent;
        }

        /* Tighten typography */
        h1,
        h2,
        h3 {
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
