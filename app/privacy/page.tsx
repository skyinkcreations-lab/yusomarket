"use client";

import Header from "../_components/Header";
import Footer from "../_components/Footer";

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>

        <p
          style={{
            fontSize: 18,
            color: "#6b7280",
            marginBottom: 50,
            maxWidth: 720,
          }}
        >
          This Privacy Policy explains how YusoMarket collects, uses, and protects
          your personal information.
        </p>

        <section style={{ lineHeight: 1.7, color: "#374151", fontSize: 15 }}>
          <h3>1. Information We Collect</h3>
          <p>
            We collect information you provide directly to us, including your
            name, email address, shipping address, payment details, and account
            information. We also collect data about how you use our platform.
          </p>

          <h3>2. How We Use Your Information</h3>
          <p>
            Your information is used to process orders, manage your account,
            provide customer support, prevent fraud, and improve our services.
          </p>

          <h3>3. Payments</h3>
          <p>
            Payment information is processed by secure third-party payment
            providers. YusoMarket does not store full credit card numbers.
          </p>

          <h3>4. Data Sharing</h3>
          <p>
            We may share your information with vendors, payment processors,
            shipping partners, and service providers necessary to operate the
            marketplace.
          </p>

          <h3>5. Cookies & Tracking</h3>
          <p>
            We use cookies and similar technologies to improve site
            functionality, track performance, and personalize your experience.
          </p>

          <h3>6. Data Security</h3>
          <p>
            We implement reasonable technical and organizational measures to
            protect your personal data from unauthorized access or misuse.
          </p>

          <h3>7. Your Rights</h3>
          <p>
            You may request access, correction, or deletion of your personal
            data. You may also opt out of marketing communications at any time.
          </p>

          <h3>8. International Users</h3>
          <p>
            If you access YusoMarket from outside our operating country, your
            data may be transferred and processed in other jurisdictions.
          </p>

          <h3>9. Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. Continued use of
            the platform means you accept the updated policy.
          </p>

          <h3>10. Contact Us</h3>
          <p>
            For privacy-related questions, please contact YusoMarket through our
            official support channels.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}
