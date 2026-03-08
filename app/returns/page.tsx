"use client";

import Header from "../_components/Header";
import Footer from "../_components/Footer";

export default function ReturnsAndRefundsPage() {
  return (
    <>
      <Header />

      <main
        style={{
          maxWidth: "900px",
          margin: "80px auto",
          padding: "0 20px",
        }}
      >
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 10 }}>
          Returns & Refunds Policy
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginBottom: 50,
            maxWidth: 720,
          }}
        >
          How returns and refunds work on YusoMarket.
        </p>

        <section style={{ lineHeight: 1.7, color: "#374151", fontSize: 15 }}>
          <h3>1. Return Window</h3>
          <p>
            Buyers may request a return within <strong>7 days</strong> of
            receiving their item. Requests submitted after this period may be
            declined.
          </p>

          <h3>2. Eligible Items</h3>
          <p>
            Items must be unused, in original packaging, and in the same
            condition as delivered. Some items such as hygiene products,
            consumables, or custom-made products may be non-returnable.
          </p>

          <h3>3. How to Request a Return</h3>
          <p>
            Returns must be initiated through the buyer’s YusoMarket account or
            by contacting support. Items sent back without approval may not be
            refunded.
          </p>

          <h3>4. Vendor Review</h3>
          <p>
            Each return is reviewed by the seller. Once approved, return
            instructions will be issued.
          </p>

          <h3>5. Return Shipping</h3>
          <p>
            Buyers are responsible for return shipping unless the product was
            defective, damaged, or incorrectly supplied.
          </p>

          <h3>6. Damaged or Incorrect Items</h3>
          <p>
            If your item arrives damaged or incorrect, you must notify support
            within 48 hours and provide photo evidence.
          </p>

          <h3>7. Refund Processing</h3>
          <p>
            Once a return is approved and received by the seller, refunds are
            processed within 5–10 business days depending on the payment
            provider.
          </p>

          <h3>8. Refund Method</h3>
          <p>
            Refunds are issued to the original payment method used at checkout.
          </p>

          <h3>9. Shipping Fees</h3>
          <p>
            Original shipping fees are non-refundable unless the item was
            defective or incorrectly supplied.
          </p>

          <h3>10. Partial Refunds</h3>
          <p>
            Items returned used, damaged, or incomplete may be eligible for a
            partial refund at the seller’s discretion.
          </p>

          <h3>11. Chargebacks</h3>
          <p>
            Filing unauthorized chargebacks may result in account suspension.
            We recommend contacting YusoMarket support before escalating to
            your payment provider.
          </p>

          <h3>12. Platform Authority</h3>
          <p>
            YusoMarket reserves the right to make the final decision on all
            returns and refunds to protect buyers, sellers, and the platform.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
