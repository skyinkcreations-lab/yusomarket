"use client";

import React, { useEffect, useState } from "react";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function AccountSettingsPage() {
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    shipping: null as any,
    billing: null as any,
  });

  const [editing, setEditing] = useState<"shipping" | "billing" | null>(null);

  // password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // banners
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [profileInfo, setProfileInfo] = useState("");
  const [profileError, setProfileError] = useState("");

  /* ============================
        LOAD PROFILE
  ============================ */
  useEffect(() => {
    async function load() {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setForm({
        name: profile?.name || "",
        email: user.email || "",
        phone: profile?.phone || "",
        dob: profile?.dob || "",
        shipping: profile?.shipping_address
          ? JSON.parse(profile.shipping_address)
          : null,
        billing: profile?.billing_address
          ? JSON.parse(profile.billing_address)
          : null,
      });

      setLoading(false);
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ============================
        SAVE PROFILE
  ============================ */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileInfo("");
    setSaving(true);

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      setProfileError("User not found. Please log in again.");
      setSaving(false);
      return;
    }

    const { error: profileUpdateErr } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        shipping_address: form.shipping ? JSON.stringify(form.shipping) : null,
        billing_address: form.billing ? JSON.stringify(form.billing) : null,
      })
      .eq("id", user.id);

    if (profileUpdateErr) {
      setProfileError(profileUpdateErr.message || "Failed to update profile.");
      setSaving(false);
      return;
    }

    // Keep your behavior: update auth email too
    const { error: authEmailErr } = await supabase.auth.updateUser({
      email: form.email,
    });

    if (authEmailErr) {
      setProfileError(authEmailErr.message || "Failed to update email.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setProfileInfo("Settings updated successfully.");
  }

  /* ============================
        PASSWORD UPDATE
  ============================ */
  async function handlePasswordUpdate() {
    setError("");
    setInfo("");
    setSecuritySaving(true);

    if (!currentPassword) {
      setError("Enter your current password.");
      setSecuritySaving(false);
      return;
    }

    if (!newPassword) {
      setError("Enter a new password.");
      setSecuritySaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setSecuritySaving(false);
      return;
    }

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user?.email) {
      setError("User not found.");
      setSecuritySaving(false);
      return;
    }

    // Re-authenticate
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInErr) {
      setError("Current password is incorrect.");
      setSecuritySaving(false);
      return;
    }

    // Update password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      setError(updateErr.message);
    } else {
      setInfo("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSecuritySaving(false);
  }

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div className="ym-spinner" />
            <div style={{ marginTop: 14, color: "#64748b", fontWeight: 600 }}>
              Loading account settings…
            </div>
          </div>
        </main>
        <Footer />

        <style jsx>{`
          .ym-spinner {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            border: 3px solid rgba(56, 95, 162, 0.25);
            border-top-color: #385fa2;
            animation: spin 0.9s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="ym-hero">
        <div className="ym-hero-inner">

          <h1 className="ym-hero-title">Account Settings</h1>
          <p className="ym-hero-sub">
            Manage your details, default addresses, and account security.
          </p>

          <div className="ym-hero-actions">
            <a className="ym-ghost" href="/account">
              ← Back to account
            </a>
          </div>
        </div>
      </section>

      {/* PAGE */}
      <main className="ym-page">
        <div className="ym-layout">
          {/* LEFT: MAIN */}
          <div className="ym-main">
            {/* PROFILE */}
            <div className="ym-panel">
              <div className="ym-panel-head">
                <div>
                  <h2 className="ym-panel-title">Personal details</h2>
                  <p className="ym-panel-desc">
                    Update your name, email and contact details.
                  </p>
                </div>
                <div className="ym-pill">Profile</div>
              </div>

              {profileError && (
                <div className="ym-alert ym-alert--error">{profileError}</div>
              )}
              {profileInfo && (
                <div className="ym-alert ym-alert--success">{profileInfo}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="ym-grid">
                  <Field label="Full name" hint="Used for delivery and invoices.">
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="ym-input"
                      placeholder="Your name"
                    />
                  </Field>

                  <Field label="Email" hint="We’ll send order updates here.">
                    <input
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="ym-input"
                      placeholder="you@email.com"
                    />
                  </Field>

                  <Field label="Mobile number" hint="Optional, for delivery updates.">
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="ym-input"
                      placeholder="04xx xxx xxx"
                    />
                  </Field>

                  <Field label="Date of birth" hint="Optional (age verification).">
                    <input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      className="ym-input"
                    />
                  </Field>
                </div>

                <div className="ym-panel-footer">
                  <button className="ym-btn ym-btn--primary" type="submit" disabled={saving}>
                    {saving ? "Saving…" : "Save changes"}
                  </button>

                  <span className="ym-muted">
                    Changes apply instantly to your account.
                  </span>
                </div>
              </form>
            </div>

            {/* ADDRESSES */}
            <div className="ym-panel">
              <div className="ym-panel-head">
                <div>
                  <h2 className="ym-panel-title">Default addresses</h2>
                  <p className="ym-panel-desc">
                    Used for faster checkout and vendor shipping labels.
                  </p>
                </div>
                <div className="ym-pill">Addresses</div>
              </div>

              <div className="ym-cards">
                <AddressCard
                  title="Shipping address"
                  subtitle="Where you want orders delivered."
                  value={form.shipping}
                  onEdit={() => setEditing("shipping")}
                />

                <AddressCard
                  title="Billing address"
                  subtitle="Used for invoices and receipts."
                  value={form.billing}
                  onEdit={() => setEditing("billing")}
                />
              </div>
            </div>

            {/* SECURITY */}
            <div className="ym-panel">
              <div className="ym-panel-head">
                <div>
                  <h2 className="ym-panel-title">Security</h2>
                  <p className="ym-panel-desc">
                    Update your password to keep your account protected.
                  </p>
                </div>
                <div className="ym-pill">Security</div>
              </div>

              {error && <div className="ym-alert ym-alert--error">{error}</div>}
              {info && <div className="ym-alert ym-alert--success">{info}</div>}

              <div className="ym-security-grid">
                <Field label="Current password">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="ym-input"
                    placeholder="••••••••"
                  />
                </Field>

                <Field label="New password" hint="Use at least 8 characters.">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="ym-input"
                    placeholder="••••••••"
                  />
                </Field>

                <Field label="Confirm new password">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="ym-input"
                    placeholder="••••••••"
                  />
                </Field>
              </div>

              <div className="ym-panel-footer">
                <button
                  className="ym-btn ym-btn--primary"
                  type="button"
                  onClick={handlePasswordUpdate}
                  disabled={securitySaving}
                >
                  {securitySaving ? "Updating…" : "Update password"}
                </button>

                <span className="ym-muted">
                  You may need to re-login after changing your password.
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: SIDEBAR */}
          <aside className="ym-side">
            <div className="ym-sidecard">
              <div className="ym-sidecard-title">Tips</div>
              <div className="ym-sidecard-item">
                <strong>Keep details accurate</strong>
                <span>Shipping issues = lost money + refunds.</span>
              </div>
              <div className="ym-sidecard-item">
                <strong>Use a strong password</strong>
                <span>Don’t reuse old passwords.</span>
              </div>
              <div className="ym-sidecard-item">
                <strong>Addresses speed checkout</strong>
                <span>Less friction = more conversions.</span>
              </div>
            </div>

            <div className="ym-sidecard">
              <div className="ym-sidecard-title">Shortcuts</div>
              <a className="ym-side-link" href="/account/orders">
                View orders →
              </a>
              <a className="ym-side-link" href="/vendors">
                Browse vendors →
              </a>
              <a className="ym-side-link" href="/sell">
                Become a vendor →
              </a>
            </div>
          </aside>
        </div>
      </main>

      {editing && (
        <AddressModal
          type={editing}
          onClose={() => setEditing(null)}
          form={form}
          setForm={setForm}
        />
      )}

      <Footer />

      {/* ========================= STYLES ========================= */}
      <style jsx>{`
        .ym-hero {
          width: 100%;
          padding: 70px 18px 64px;
          background: linear-gradient(180deg, #2f4f88 0%, #385fa2 100%);
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }


        .ym-hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          text-align: left;
        }

.ym-hero-title {
  font-size: 36px;
  font-weight: 700;
          letter-spacing: -0.03em;
          margin: 0 0 4px;
          line-height: 1.05;
        }

        .ym-hero-sub {
          margin: 0;
          max-width: 640px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.82);
          line-height: 1.6;
        }

        .ym-hero-actions {
          margin-top: 18px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ym-ghost {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          text-decoration: none;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.2s ease;
        }

        .ym-ghost:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.12);
        }

        .ym-page {
          background: #f5f5f7;
          min-height: 70vh;
          padding: 34px 18px 90px;
        }

        .ym-layout {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 22px;
          align-items: start;
        }

        .ym-main {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ym-panel {
          background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
          border: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 22px;
          padding: 24px;
          box-shadow: 0 18px 55px rgba(15, 23, 42, 0.06);
        }

        .ym-panel-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 18px;
        }

        .ym-panel-title {
          margin: 0 0 6px;
  font-size: 17px;
  font-weight: 600;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .ym-panel-desc {
          margin: 0;
          color: #64748b;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .ym-pill {
          display: inline-flex;
          align-items: center;
          height: 28px;
          padding: 0 12px;
          border-radius: 999px;
          background: rgba(56, 95, 162, 0.1);
          border: 1px solid rgba(56, 95, 162, 0.18);
          color: #2f4f88;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
        }

        .ym-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .ym-security-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .ym-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.09);
          background: #ffffff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }

        .ym-input:focus {
          border-color: rgba(56, 95, 162, 0.8);
          box-shadow: 0 0 0 4px rgba(56, 95, 162, 0.14);
        }

        .ym-panel-footer {
          margin-top: 16px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 14px;
          flex-wrap: wrap;
        }

        .ym-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          padding: 0 18px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 13.5px;
          transition: all 0.2s ease;
          text-decoration: none;
          user-select: none;
        }

.ym-btn--primary {
  background: #385fa2;
  color: #ffffff;
  box-shadow: none;
}

.ym-btn--primary:hover {
  background: #2f4f88;
}

        .ym-btn--primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .ym-muted {
          color: #64748b;
          font-size: 12.5px;
          font-weight: 600;
        }

        .ym-alert {
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 13.5px;
          font-weight: 650;
          margin-bottom: 16px;
          border: 1px solid transparent;
        }

        .ym-alert--error {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.25);
          color: #b91c1c;
        }

        .ym-alert--success {
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.25);
          color: #047857;
        }

        .ym-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .ym-side {
          position: sticky;
          top: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ym-sidecard {
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.06);
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.06);
        }

        .ym-sidecard-title {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }

        .ym-sidecard-item {
          display: grid;
          gap: 4px;
          padding: 10px 0;
          border-top: 1px solid rgba(15, 23, 42, 0.06);
        }

        .ym-sidecard-item:first-of-type {
          border-top: none;
          padding-top: 0;
        }

        .ym-sidecard-item strong {
          color: #0f172a;
          font-size: 13px;
        }

        .ym-sidecard-item span {
          color: #64748b;
          font-size: 12.5px;
          line-height: 1.4;
          font-weight: 600;
        }

        .ym-side-link {
          display: flex;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(15, 23, 42, 0.06);
          text-decoration: none;
          color: #2f4f88;
          font-weight: 700;
          font-size: 13px;
          background: linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%);
          transition: all 0.2s ease;
        }

        .ym-side-link:hover {
          transform: translateY(-1px);
          border-color: rgba(56, 95, 162, 0.22);
          box-shadow: 0 10px 20px rgba(56, 95, 162, 0.12);
        }

        @media (max-width: 980px) {
          .ym-layout {
            grid-template-columns: 1fr;
          }

          .ym-side {
            position: static;
          }

          .ym-grid {
            grid-template-columns: 1fr;
          }

          .ym-cards {
            grid-template-columns: 1fr;
          }

          .ym-hero-inner {
            text-align: left;
          }
        }
      `}</style>
    </>
  );
}

/* ============================
    COMPONENTS
============================ */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 7 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <label
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "#0f172a",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </label>
        {hint ? (
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function AddressCard({
  title,
  subtitle,
  value,
  onEdit,
}: {
  title: string;
  subtitle: string;
  value: any;
  onEdit: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(15,23,42,0.06)",
        background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
        padding: 18,
        boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 168,
      }}
    >
      <div style={{ display: "grid", gap: 4 }}>
        <div
          style={{
            fontSize: 14.5,
            fontWeight: 900,
            color: "#0f172a",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: "#64748b", fontWeight: 600 }}>
          {subtitle}
        </div>
      </div>

      <div
        style={{
          fontSize: 13,
          color: "#0f172a",
          lineHeight: 1.55,
          fontWeight: 650,
          opacity: value ? 1 : 0.7,
        }}
      >
        {value ? (
          <>
            {value.name}
            <br />
            {value.street}
            <br />
            {value.city} {value.state}
            <br />
            {value.postcode}
            <br />
            {value.country}
          </>
        ) : (
          "No address saved"
        )}
      </div>

      <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-start" }}>
        <button
          type="button"
          onClick={onEdit}
          style={{
            height: 38,
            padding: "0 14px",
            borderRadius: 12,
            border: "1px solid rgba(56,95,162,0.2)",
            background: "rgba(56,95,162,0.10)",
            color: "#2f4f88",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
            transition: "all .2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(56,95,162,0.16)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(56,95,162,0.10)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

/* ============================
    ADDRESS MODAL
============================ */

function AddressModal({ type, onClose, form, setForm }: any) {
  const [data, setData] = useState(
    form[type] || {
      name: "",
      street: "",
      city: "",
      state: "",
      postcode: "",
      country: "",
    }
  );

  function save() {
    setForm({ ...form, [type]: data });
    onClose();
  }

  const fields: Array<{ key: keyof typeof data; label: string; placeholder?: string }> = [
    { key: "name", label: "Full name", placeholder: "Recipient name" },
    { key: "street", label: "Street address", placeholder: "123 Example St" },
    { key: "city", label: "City", placeholder: "Brisbane" },
    { key: "state", label: "State", placeholder: "QLD" },
    { key: "postcode", label: "Postcode", placeholder: "4000" },
    { key: "country", label: "Country", placeholder: "Australia" },
  ];

  return (
    <div className="ym-modalOverlay" onClick={onClose}>
      <div className="ym-modalBox" onClick={(e) => e.stopPropagation()}>
        <div className="ym-modalHead">
          <div>
            <div className="ym-modalTitle">
              Edit {type === "shipping" ? "shipping" : "billing"} address
            </div>
            <div className="ym-modalSub">
              This will be used as your default {type} address.
            </div>
          </div>

          <button className="ym-x" onClick={onClose} type="button" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="ym-modalGrid">
          {fields.map((f) => (
            <div key={String(f.key)} style={{ display: "grid", gap: 7 }}>
              <label className="ym-modalLabel">{f.label}</label>
              <input
                value={(data as any)[f.key]}
                onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                className="ym-modalInput"
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        <div className="ym-modalActions">
          <button className="ym-modalBtn ym-modalBtnPrimary" type="button" onClick={save}>
            Save address
          </button>
          <button className="ym-modalBtn ym-modalBtnGhost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
        .ym-modalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.55);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          z-index: 999;
        }

        .ym-modalBox {
          width: 100%;
          max-width: 520px;
          border-radius: 22px;
          background: linear-gradient(180deg, #ffffff 0%, #f8faff 100%);
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 50px 120px rgba(2, 6, 23, 0.35);
          padding: 18px;
        }

        .ym-modalHead {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 4px 4px 12px;
        }

        .ym-modalTitle {
          font-size: 16px;
          font-weight: 950;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin-bottom: 4px;
        }

        .ym-modalSub {
          color: #64748b;
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.4;
        }

        .ym-x {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: #ffffff;
          cursor: pointer;
          font-weight: 700;
          color: #0f172a;
          box-shadow: 0 12px 25px rgba(2, 6, 23, 0.12);
          transition: all 0.2s ease;
        }

        .ym-x:hover {
          transform: rotate(90deg);
        }

        .ym-modalGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 10px 4px 14px;
        }

        .ym-modalLabel {
          font-size: 12.5px;
          font-weight: 700;
          color: #0f172a;
        }

        .ym-modalInput {
          width: 100%;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.09);
          background: #ffffff;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
        }

        .ym-modalInput:focus {
          border-color: rgba(56, 95, 162, 0.85);
          box-shadow: 0 0 0 4px rgba(56, 95, 162, 0.14);
        }

        .ym-modalActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 0 4px 4px;
          flex-wrap: wrap;
        }

        .ym-modalBtn {
          height: 42px;
          padding: 0 16px;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 13.5px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ym-modalBtnPrimary {
          background: linear-gradient(135deg, #2f4f88 0%, #385fa2 100%);
          color: #ffffff;
          box-shadow: 0 12px 26px rgba(56, 95, 162, 0.3);
        }

        .ym-modalBtnPrimary:hover {
          transform: translateY(-1px);
        }

        .ym-modalBtnGhost {
          background: rgba(15, 23, 42, 0.06);
          border: 1px solid rgba(15, 23, 42, 0.08);
          color: #0f172a;
        }

        .ym-modalBtnGhost:hover {
          background: rgba(15, 23, 42, 0.09);
        }

        @media (max-width: 720px) {
          .ym-modalGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}