"use client";

import { useState } from "react";
import Header from "../_components/Header";
import Footer from "../_components/Footer";

const faqs = [
  {
    q: "What is YusoMarket?",
    a: "YusoMarket is a multi-vendor marketplace where you buy directly from verified sellers. No middlemen, no junk listings, just real products from real vendors."
  },
  {
    q: "Are the sellers verified?",
    a: "Yes. Every seller must complete identity, business and payment verification before they can sell on YusoMarket."
  },
  {
    q: "How fast is delivery?",
    a: "Most orders are delivered within 2–3 business days depending on location. Vendors ship locally whenever possible."
  },
  {
    q: "What happens if something goes wrong?",
    a: "All orders are protected by YusoMarket buyer protection. If a product doesn’t arrive or isn’t as described, you’ll be refunded."
  },
  {
    q: "How do returns work?",
    a: "Each vendor sets their own return policy, but YusoMarket enforces minimum standards. If a seller refuses a valid return, we step in."
  },
  {
    q: "How do I become a vendor?",
    a: "Click “Become a Vendor” anywhere on the site or visit /vendors/apply to submit your store. Most vendors are approved within 24 hours."
  },
  {
    q: "Is my payment secure?",
    a: "Yes. All payments are processed using encrypted payment gateways and industry-standard fraud protection."
  }
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

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
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 10
          }}
        >
          Frequently Asked Questions
        </h1>

        <p
          style={{
            color: "#6b7280",
            fontSize: 16,
            marginBottom: 50
          }}
        >
          Everything you need to know about shopping and selling on YusoMarket.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {faqs.map((item, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                overflow: "hidden",
                background: "#fff",
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
                    fontSize: 22,
                    lineHeight: "1"
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
