"use client";

import { useState } from "react";
import {
  FaStore,
  FaCreditCard,
  FaShippingFast,
  FaUserShield,
  FaIdCard,
} from "react-icons/fa";

type SettingsTab = "general" | "payments" | "shipping" | "account" | "store";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div style={{ padding: "30px" }}>
      {/* PAGE HEADER */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            Store settings
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", maxWidth: 480 }}>
            Control how your YusoMarket vendor account behaves – store info,
            payments, shipping, and account preferences.
          </p>
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            fontSize: "12px",
            color: "#4b5563",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "999px",
              background: "#22c55e",
            }}
          />
          Vendor account · Live
        </div>
      </div>

      {/* TABS (Style A – horizontal pills) */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          padding: "6px",
          borderRadius: "999px",
          background: "#f3f4f6",
          marginBottom: "20px",
        }}
      >
        {tabButton("general", "General", activeTab, setActiveTab)}
        {tabButton("payments", "Payments", activeTab, setActiveTab)}
        {tabButton("shipping", "Shipping", activeTab, setActiveTab)}
        {tabButton("account", "Account & privacy", activeTab, setActiveTab)}
        {tabButton("store", "Store details", activeTab, setActiveTab)}
      </div>

      {/* ACTIVE TAB CONTENT */}
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {activeTab === "general" && <GeneralSettings />}
        {activeTab === "payments" && <PaymentSettings />}
        {activeTab === "shipping" && <ShippingSettings />}
        {activeTab === "account" && <AccountSettings />}
        {activeTab === "store" && <StoreSettings />}
      </div>
    </div>
  );
}

/* TAB BUTTON HELPER (style A) */
function tabButton(
  key: SettingsTab,
  label: string,
  activeTab: SettingsTab,
  setActiveTab: (tab: SettingsTab) => void
) {
  const isActive = activeTab === key;

  return (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      style={{
        padding: "6px 14px",
        borderRadius: "999px",
        fontSize: "13px",
        border: isActive ? "1px solid #111827" : "1px solid transparent",
        background: isActive ? "#ffffff" : "transparent",
        color: isActive ? "#111827" : "#4b5563",
        fontWeight: isActive ? 600 : 500,
        cursor: "pointer",
        boxShadow: isActive ? "0 4px 10px rgba(15,23,42,0.08)" : "none",
        transition:
          "background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
      }}
    >
      {label}
    </button>
  );
}

/* =============== GENERAL SETTINGS =============== */

function GeneralSettings() {
  return (
    <div style={cardContainer}>
      <SectionHeader
        icon={<FaStore />}
        title="General"
        subtitle="Basic information that appears to customers across your YusoMarket storefront."
      />

      <div style={twoColumnGrid}>
        {/* Store name */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Store name</label>
          <input
            type="text"
            defaultValue="YusoMarket Vendor"
            style={inputStyle}
          />
          <p style={helpTextStyle}>
            This is shown on product pages, order emails, and your storefront.
          </p>
        </div>

        {/* Public URL */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Storefront URL</label>
          <div style={{ display: "flex", gap: "6px" }}>
            <span
              style={{
                alignSelf: "center",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              yusomarket.com/store/
            </span>
            <input
              type="text"
              defaultValue="your-brand"
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <p style={helpTextStyle}>Keep this short and brand-friendly.</p>
        </div>

        {/* Support email */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Support email</label>
          <input
            type="email"
            defaultValue="support@yourbrand.id"
            style={inputStyle}
          />
          <p style={helpTextStyle}>
            Customers will use this email to contact your store.
          </p>
        </div>

        {/* Support phone */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Support phone (optional)</label>
          <input
            type="tel"
            placeholder="+62 ..."
            style={inputStyle}
          />
          <p style={helpTextStyle}>
            Add WhatsApp or business phone for faster support.
          </p>
        </div>
      </div>

      <div style={footerRow}>
        <button style={primaryBtn}>Save general settings</button>
        <span style={mutedText}>Changes apply instantly to your storefront.</span>
      </div>
    </div>
  );
}

/* =============== PAYMENT SETTINGS =============== */

function PaymentSettings() {
  return (
    <div style={cardContainer}>
      <SectionHeader
        icon={<FaCreditCard />}
        title="Payments"
        subtitle="Manage how you get paid for orders placed through YusoMarket."
      />

      {/* STRIPE CONNECT CARD */}
      <div style={innerCard}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "3px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
                marginBottom: "8px",
              }}
            >
              Stripe Connect · Payouts
            </div>
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 600,
                marginBottom: "4px",
              }}
            >
              Connect Stripe for vendor payouts
            </h3>
            <p style={helpTextStyle}>
              We use Stripe Connect to route customer payments to your bank
              account securely. You&apos;ll be redirected to Stripe to verify
              your identity and business details.
            </p>

            <ul
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#4b5563",
                paddingLeft: "18px",
              }}
            >
              <li>Secure onboarding, compliant with local regulations.</li>
              <li>Automatic payouts to your bank account.</li>
              <li>Support for major cards and wallets.</li>
            </ul>
          </div>

          {/* STATUS PILL */}
          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                background: "#fef2f2",
                color: "#b91c1c",
                border: "1px solid #fecaca",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "999px",
                  background: "#ef4444",
                }}
              />
              Not connected
            </div>
            <p style={{ color: "#6b7280" }}>No payouts can be made yet.</p>
          </div>
        </div>

        <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
          <button style={primaryBtn}>Connect Stripe</button>
          <button style={ghostBtn}>Learn more</button>
        </div>
      </div>

      {/* PAYMENT PREFERENCES */}
      <div style={{ ...innerCard, marginTop: "14px" }}>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          Payment preferences
        </h3>

        <div style={twoColumnGrid}>
          <div style={fieldBlock}>
            <label style={labelStyle}>Payout schedule</label>
            <select defaultValue="weekly" style={inputStyle}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly (recommended)</option>
              <option value="monthly">Monthly</option>
            </select>
            <p style={helpTextStyle}>
              Actual payout timing depends on Stripe and your bank.
            </p>
          </div>

          <div style={fieldBlock}>
            <label style={labelStyle}>Default currency</label>
            <select defaultValue="idr" style={inputStyle}>
              <option value="idr">IDR – Indonesian Rupiah</option>
            </select>
            <p style={helpTextStyle}>
              Orders on YusoMarket are charged in this currency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============== SHIPPING SETTINGS =============== */

function ShippingSettings() {
  return (
    <div style={cardContainer}>
      <SectionHeader
        icon={<FaShippingFast />}
        title="Shipping"
        subtitle="Control where you ship from and which courier options you offer."
      />

      <div style={twoColumnGrid}>
        {/* Ship from address */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Ship-from city</label>
          <input
            type="text"
            placeholder="Jakarta, Bandung, Surabaya…"
            defaultValue="Jakarta"
            style={inputStyle}
          />
          <p style={helpTextStyle}>
            Used to calculate estimated delivery time and cost.
          </p>
        </div>

        {/* Handling time */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Handling time</label>
          <select defaultValue="2" style={inputStyle}>
            <option value="1">Ships within 1 business day</option>
            <option value="2">Ships within 2 business days</option>
            <option value="3">Ships within 3–5 business days</option>
          </select>
          <p style={helpTextStyle}>
            Shown on product pages and order confirmation.
          </p>
        </div>

        {/* Default courier */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Default courier</label>
          <select defaultValue="jne" style={inputStyle}>
            <option value="jne">JNE</option>
            <option value="jnt">J&amp;T Express</option>
            <option value="sicepat">SiCepat</option>
            <option value="pos">POS Indonesia</option>
          </select>
          <p style={helpTextStyle}>
            Customers can choose other options if enabled at marketplace level.
          </p>
        </div>

        {/* Free shipping threshold */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Free shipping threshold</label>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#6b7280" }}>Rp</span>
            <input
              type="number"
              defaultValue={150000}
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <p style={helpTextStyle}>
            Set to 0 to disable free shipping for your store.
          </p>
        </div>
      </div>

      <div style={footerRow}>
        <button style={primaryBtn}>Save shipping settings</button>
      </div>
    </div>
  );
}

/* =============== ACCOUNT & PRIVACY =============== */

function AccountSettings() {
  return (
    <div style={cardContainer}>
      <SectionHeader
        icon={<FaUserShield />}
        title="Account & privacy"
        subtitle="Manage your login details and security preferences as a vendor."
      />

      <div style={twoColumnGrid}>
        {/* Login email */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Login email</label>
          <input
            type="email"
            defaultValue="vendor@yourbrand.id"
            style={inputStyle}
          />
          <p style={helpTextStyle}>
            Used to sign in and receive important account notifications.
          </p>
        </div>

        {/* Display name */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Display name</label>
          <input
            type="text"
            defaultValue="Your Brand Official"
            style={inputStyle}
          />
          <p style={helpTextStyle}>
            Shown inside the dashboard and on support tickets.
          </p>
        </div>

        {/* 2FA toggle */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Two-factor authentication</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "4px",
            }}
          >
            <button style={pillToggle(false)}>Off</button>
            <button style={pillToggle(true)}>On</button>
          </div>
          <p style={helpTextStyle}>
            We strongly recommend enabling 2FA to protect your earnings.
          </p>
        </div>

        {/* Data export */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Export data</label>
          <button style={ghostBtn}>Download account data (.zip)</button>
          <p style={helpTextStyle}>
            Export basic account + store configuration for your records.
          </p>
        </div>
      </div>

      <div style={footerRow}>
        <button style={primaryDangerBtn}>Close vendor account</button>
        <span style={mutedText}>
          Contact support before closing if you have pending payouts or orders.
        </span>
      </div>
    </div>
  );
}

/* =============== STORE DETAILS =============== */

function StoreSettings() {
  return (
    <div style={cardContainer}>
      <SectionHeader
        icon={<FaIdCard />}
        title="Store details"
        subtitle="Legal and business information used for invoices, tax, and compliance."
      />

      <div style={twoColumnGrid}>
        {/* Legal name */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Legal business name</label>
          <input
            type="text"
            placeholder="PT / CV / Personal name"
            style={inputStyle}
          />
          <p style={helpTextStyle}>
            This may appear on invoices and payout reports.
          </p>
        </div>

        {/* Tax ID */}
        <div style={fieldBlock}>
          <label style={labelStyle}>Tax ID / NPWP (optional)</label>
          <input type="text" placeholder="NPWP number" style={inputStyle} />
          <p style={helpTextStyle}>
            Required only if you need tax-compliant invoices.
          </p>
        </div>

        {/* Business address */}
        <div style={fieldBlockFull}>
          <label style={labelStyle}>Business address</label>
          <textarea
            rows={3}
            placeholder="Street, district, city, province, postal code"
            style={{ ...inputStyle, resize: "vertical", paddingTop: "8px" }}
          />
          <p style={helpTextStyle}>
            Used for invoices, compliance, and some shipping calculations.
          </p>
        </div>
      </div>

      <div style={footerRow}>
        <button style={primaryBtn}>Save store details</button>
      </div>
    </div>
  );
}

/* =============== REUSABLE UI PIECES =============== */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "999px",
          background: "#eef2ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4f46e5",
          fontSize: "14px",
        }}
      >
        {icon}
      </div>
      <div>
        <h2
          style={{
            fontSize: "17px",
            fontWeight: 600,
            marginBottom: "2px",
          }}
        >
          {title}
        </h2>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>{subtitle}</p>
      </div>
    </div>
  );
}

/* =============== STYLES =============== */

const cardContainer: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 16,
  padding: "18px 18px 16px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 14px 30px rgba(15,23,42,0.06)",
};

const innerCard: React.CSSProperties = {
  background: "#f9fafb",
  borderRadius: 12,
  padding: "14px 14px 14px",
  border: "1px solid #e5e7eb",
};

const twoColumnGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const fieldBlock: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const fieldBlockFull: React.CSSProperties = {
  gridColumn: "1 / -1",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#4b5563",
};

const inputStyle: React.CSSProperties = {
  height: "34px",
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: "13px",
  outline: "none",
  background: "#ffffff",
};

const helpTextStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#6b7280",
};

const footerRow: React.CSSProperties = {
  marginTop: 16,
  display: "flex",
  gap: 12,
  alignItems: "center",
  justifyContent: "flex-start",
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "none",
  background: "#111827",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryDangerBtn: React.CSSProperties = {
  ...primaryBtn,
  background: "#b91c1c",
};

const ghostBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#111827",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};

const mutedText: React.CSSProperties = {
  fontSize: "11px",
  color: "#9ca3af",
};

function pillToggle(on: boolean): React.CSSProperties {
  return {
    padding: "5px 12px",
    borderRadius: 999,
    border: on ? "1px solid #16a34a" : "1px solid #d1d5db",
    background: on ? "#dcfce7" : "#ffffff",
    fontSize: "12px",
    cursor: "pointer",
    color: on ? "#166534" : "#4b5563",
    fontWeight: on ? 600 : 500,
  };
}
