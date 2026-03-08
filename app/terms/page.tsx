"use client";

import Header from "../_components/Header";
import Footer from "../_components/Footer";

export default function TermsPage() {
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
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          Terms & Conditions
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginBottom: 50,
            maxWidth: 720,
          }}
 >
          These Terms govern your use of YusoMarket. By accessing or using our
          platform, you agree to be bound by these Terms.
        </p>

        <section style={{ lineHeight: 1.7, color: "#374151", fontSize: 15 }}>
          <h3>1. About YusoMarket</h3>
          <p>
            YusoMarket is a multi-vendor marketplace that connects buyers with
            independent sellers. We do not own or manufacture the products sold
            on the platform unless explicitly stated.
          </p>

          <h3>2. Accounts</h3>
          <p>
            You are responsible for maintaining the confidentiality of your
            account and all activity under it. You must provide accurate
            information and keep your account secure.
          </p>

          <h3>3. Purchases</h3>
          <p>
            When you purchase a product, you are entering into a contract with
            the vendor, not YusoMarket. Payment is processed through our secure
            checkout system.
          </p>

          <h3>4. Returns and Refunds</h3>
          <p>
            Return policies vary by seller. YusoMarket may step in to assist in
            resolving disputes but is not responsible for individual seller
            decisions.
          </p>

          <h3>5. Seller Obligations</h3>
          <p>
            Vendors must provide accurate product listings, fulfill orders in a
            timely manner, and comply with all applicable laws.
          </p>

          <h3>6. Prohibited Activity</h3>
          <p>
            You may not use YusoMarket for illegal activities, fraud, abuse, or
            any action that harms the platform, its users, or its reputation.
          </p>

          <h3>7. Payments</h3>
          <p>
            Payments are processed via approved payment providers. YusoMarket
            may hold or reverse funds if fraud, disputes, or violations are
            suspected.
          </p>

          <h3>8. Limitation of Liability</h3>
          <p>
            YusoMarket is not liable for indirect, incidental, or consequential
            damages arising from your use of the platform.
          </p>

          <h3>9. Termination</h3>
          <p>
            We may suspend or terminate accounts that violate these Terms or
            harm the marketplace.
          </p>

          <h3>10. Changes to Terms</h3>
          <p>
            We may update these Terms at any time. Continued use of the platform
            means you accept any changes.
          </p>

          <h3>11. Contact</h3>
          <p>
            For legal or support inquiries, contact us via the YusoMarket support
            channels.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
