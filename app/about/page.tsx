"use client";

import { useState } from "react";
import Header from "../_components/Header";
import Footer from "../_components/Footer";

const sections = [
  {
    q: "Why YusoMarket exists",
    a: "YusoMarket was built to remove the junk, fake listings, and middlemen that ruin online shopping. We connect customers directly with verified vendors so you get real products, faster delivery, and better prices."
  },
  {
    q: "What makes us different",
    a: "Unlike traditional marketplaces, every seller on YusoMarket is vetted. No dropshipping spam, no stolen product photos, and no fake brands. If it’s on YusoMarket, it’s from a real business."
  },
  {
    q: "Our verification process",
    a: "Vendors must verify their identity, business details, and payment information before selling. We also continuously monitor seller performance and customer feedback."
  },
  {
    q: "Our commitment to buyers",
    a: "Every order is backed by YusoMarket buyer protection. If something goes wrong, we step in to make it right. Your money and your experience come first."
  },
  {
    q: "Our commitment to sellers",
    a: "We give vendors the tools to grow: fast payouts, real customers, and zero platform politics. Sellers succeed when buyers trust the platform."
  },
  {
    q: "Where we’re headed",
    a: "We’re building the most trusted multi-vendor marketplace in the region — a place where shopping feels safe, fast, and fair for everyone."
  },
  {
    q: "How to get involved",
    a: "You can shop with confidence or apply to sell your products. YusoMarket is open to real businesses that care about quality and customer experience."
  }
];

export default function AboutPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <Header />

      <main
        style={{
          maxWidth: "900px",
          margin: "80px auto",
          padding: "0 20px"
        }}
      >
        {/* TITLE */}
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 10
          }}
        >
          About YusoMarket
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginBottom: 50,
            maxWidth: 700
          }}
        >
          We’re building a marketplace where customers buy with confidence and
          vendors sell with credibility — without the chaos of traditional
          platforms.
        </p>

        {/* ACCORDION */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sections.map((item, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                overflow: "hidden",
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)"
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 700
                }}
              >
                {item.q}
                <span
                  style={{
                    transform: open === i ? "rotate(45deg)" : "rotate(0)",
                    transition: "0.2s",
                    fontSize: 22
                  }}
                >
                  +
                </span>
              </button>

              <div
                style={{
                  maxHeight: open === i ? "300px" : "0",
                  overflow: "hidden",
                  transition: "0.3s ease",
                  background: "#f9fafb"
                }}
              >
                <div
                  style={{
                    padding: open === i ? "20px 24px" : "0 24px",
                    color: "#374151",
                    fontSize: 15,
                    lineHeight: 1.6
                  }}
                >
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}
