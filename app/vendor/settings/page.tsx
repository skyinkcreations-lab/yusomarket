"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Header from "../../_components/Header";
import Footer from "../../_components/Footer";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function VendorSettingsPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);

  // Storefront
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  // Auth
  const [loginEmail, setLoginEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Logo ONLY
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Stripe
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);

  const [stripeChargesEnabled, setStripeChargesEnabled] = useState(false);
const [stripePayoutsEnabled, setStripePayoutsEnabled] = useState(false);
const [stripeDetailsSubmitted, setStripeDetailsSubmitted] = useState(false);
const [disconnectLoading, setDisconnectLoading] = useState(false);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  /* -------------------------------------------
     LOAD USER + VENDOR
  ------------------------------------------- */
useEffect(() => {
  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setLoginEmail(user.email || "");

    /*
    IMPORTANT: Sync Stripe status first
    */
    await fetch("/api/vendor/stripe/onboard", {
      method: "POST",
    });

    /*
    Now load vendor with fresh data
    */
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select(`
        *,
        stripe_charges_enabled,
        stripe_payouts_enabled,
        stripe_details_submitted
      `)
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      router.push("/sell");
      return;
    }

    setStoreName(vendor.store_name || "");
    setStoreDescription(vendor.store_description || "");
    setSupportEmail(vendor.support_email || "");
    setLogoPreview(vendor.store_logo || null);

    setStripeAccountId(vendor.stripe_account_id || null);
    setStripeChargesEnabled(vendor.stripe_charges_enabled ?? false);
    setStripePayoutsEnabled(vendor.stripe_payouts_enabled ?? false);
    setStripeDetailsSubmitted(vendor.stripe_details_submitted ?? false);

    setLoading(false);
  }

  loadData();
}, [router, supabase]);

  /* -------------------------------------------
     LOGO HANDLERS
  ------------------------------------------- */
  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);

    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  function removeLogo() {
    setLogoFile(null);
    setLogoPreview(null);
  }

  /* -------------------------------------------
     STRIPE CONNECT
  ------------------------------------------- */
async function handleStripeConnect() {
  try {
    setError("");
    setInfo("");
    setStripeLoading(true);

    const res = await fetch("/api/vendor/stripe/onboard", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data?.error || "Failed to start Stripe onboarding.");
      return;
    }

    /*
    IF VENDOR IS FULLY CONNECTED
    */
    if (data?.message === "Stripe already connected") {
      const dash = await fetch("/api/vendor/stripe/dashboard", {
        method: "POST",
      });

      const dashData = await dash.json();

      if (dashData?.url) {
        window.location.href = dashData.url;
        return;
      }

      setError("Failed to open Stripe dashboard.");
      return;
    }

    /*
    NORMAL ONBOARDING FLOW
    */
    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    setError("Stripe onboarding URL was not returned.");
  } catch (err) {
    console.error("STRIPE CONNECT UI ERROR:", err);
    setError("Something went wrong starting Stripe onboarding.");
  } finally {
    setStripeLoading(false);
  }
}

  async function handleStripeDashboard() {
  try {
    setStripeLoading(true);

    const res = await fetch("/api/vendor/stripe/dashboard", {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data?.error || "Failed to open Stripe dashboard.");
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    setError("Stripe dashboard URL not returned.");
  } catch (err) {
    console.error("STRIPE DASHBOARD ERROR:", err);
    setError("Something went wrong opening the Stripe dashboard.");
  } finally {
    setStripeLoading(false);
  }
}

  async function handleStripeDisconnect() {
  if (!confirm("Disconnect your Stripe account?")) return;

  try {
    setDisconnectLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("vendors")
      .update({
        stripe_account_id: null,
        stripe_charges_enabled: false,
        stripe_payouts_enabled: false,
        stripe_details_submitted: false,
      })
      .eq("user_id", user?.id);

    setStripeAccountId(null);
    setStripeChargesEnabled(false);
    setStripePayoutsEnabled(false);
    setStripeDetailsSubmitted(false);

    setInfo("Stripe disconnected.");
  } catch {
    setError("Failed to disconnect Stripe.");
  } finally {
    setDisconnectLoading(false);
  }
}

  /* -------------------------------------------
     PASSWORD UPDATE
  ------------------------------------------- */
  async function handleSecuritySave() {
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

    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: currentPassword,
    });

    if (authErr) {
      setError("Current password is incorrect.");
      setSecuritySaving(false);
      return;
    }

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

  /* -------------------------------------------
     SAVE STOREFRONT
  ------------------------------------------- */
  async function handleSave() {
    setError("");
    setInfo("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    let newLogoUrl: string | null = null;

    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      const path = `${user.id}-logo-${Date.now()}.${ext}`;

      const { data: uploadData, error } = await supabase.storage
        .from("vendors-logos")
        .upload(path, logoFile, { upsert: true });

      if (error) {
        setError("Failed to upload logo.");
        setSaving(false);
        return;
      }

      const { data: pub } = supabase.storage
        .from("vendors-logos")
        .getPublicUrl(uploadData.path);

      newLogoUrl = pub.publicUrl;
    }

    const updatePayload: {
      store_name: string;
      store_description: string;
      support_email: string;
      store_logo?: string | null;
    } = {
      store_name: storeName,
      store_description: storeDescription,
      support_email: supportEmail,
    };

    if (newLogoUrl) {
      updatePayload.store_logo = newLogoUrl;
    } else if (!logoPreview) {
      updatePayload.store_logo = null;
    }

    const { error: updateErr } = await supabase
      .from("vendors")
      .update(updatePayload)
      .eq("user_id", user.id);

    if (updateErr) {
      setError("Failed to save settings.");
      setSaving(false);
      return;
    }

    setInfo("Storefront updated successfully.");
    setSaving(false);
  }

  if (loading) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  return (
<div style={{ background: "#ffffff", minHeight: "100vh" }}>
  <Header />

      <section style={{ maxWidth: 1100, margin: "50px auto", padding: "0 20px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>
          Account Security
        </h1>

        {error && <div style={errorBox}>{error}</div>}
        {info && <div style={infoBox}>{info}</div>}

        <label style={labelStyle}>Login Email</label>
        <input value={loginEmail} disabled style={inputStyle} />

        <label style={labelStyle}>Current Password</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>New Password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleSecuritySave} style={saveButton(securitySaving)}>
          {securitySaving ? "Updating..." : "Update Password"}
        </button>

        <hr style={{ margin: "60px 0" }} />

<h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 18 }}>
  Stripe Payouts
</h1>

        <div style={cardBox}>
          <p style={{ margin: "0 0 10px", fontSize: 15, lineHeight: 1.6 }}>
            Connect your Stripe account to receive vendor payouts and process
            marketplace payments.
          </p>

          <div style={{ marginBottom: 14 }}>
            <span
              style={{
                ...statusBadge,
                background:
  stripeChargesEnabled && stripePayoutsEnabled
    ? "#e7fbe9"
    : stripeAccountId
    ? "#fff4e5"
    : "#ffe5e5",
                color:
  stripeChargesEnabled && stripePayoutsEnabled
    ? "#0a7a2b"
    : stripeAccountId
    ? "#9a5b00"
    : "#b30000",

borderColor:
  stripeChargesEnabled && stripePayoutsEnabled
    ? "#b7efc5"
    : stripeAccountId
    ? "#ffd59b"
    : "#ffb3b3",
              }}
            >
              {stripeChargesEnabled && stripePayoutsEnabled
  ? "Stripe ready for payouts"
  : stripeAccountId
  ? "Stripe onboarding incomplete"
  : "Stripe not connected"}
            </span>
          </div>

          {stripeAccountId && (
            <p style={{ fontSize: 13, color: "#555", marginBottom: 14 }}>
              Connected account ID: {stripeAccountId}
            </p>
          )}

<div style={stripeButtonRow}>

<button
  onClick={
    stripeChargesEnabled && stripePayoutsEnabled
      ? handleStripeDashboard
      : handleStripeConnect
  }
  disabled={stripeLoading}
  style={darkButton(stripeLoading)}
>
  {stripeLoading
    ? "Redirecting..."
    : stripeChargesEnabled && stripePayoutsEnabled
    ? "Open Stripe Dashboard"
    : stripeAccountId
    ? "Finish Stripe Onboarding"
    : "Connect Stripe"}
</button>

{stripeAccountId && (
  <button
    onClick={handleStripeDisconnect}
    disabled={disconnectLoading}
    style={disconnectButton}
  >
    {disconnectLoading ? "Disconnecting..." : "Disconnect Stripe"}
  </button>
)}

</div> 

</div> 

<hr style={{ margin: "60px 0" }} />

        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>
          Storefront Settings
        </h1>

        <label style={labelStyle}>Store Name</label>
        <input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          style={inputStyle}
        />

        <label style={labelStyle}>Store Description</label>
        <textarea
          value={storeDescription}
          onChange={(e) => setStoreDescription(e.target.value)}
          style={{ ...inputStyle, height: 120 }}
        />

        <label style={labelStyle}>Support Email</label>
        <input
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          style={inputStyle}
        />

        <div style={uploadBox}>
          <p style={uploadTitle}>Store Logo</p>

          <div
            style={uploadArea}
            onClick={() => document.getElementById("logo-input")?.click()}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Store logo preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: 130,
                  objectFit: "contain",
                }}
              />
            ) : (
              <p>Upload PNG/JPG</p>
            )}
          </div>

          {logoPreview && (
            <button
              type="button"
              style={removeBtn}
              onClick={removeLogo}
            >
              Remove Logo
            </button>
          )}

          <input
            id="logo-input"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            hidden
          />
        </div>

        <button onClick={handleSave} disabled={saving} style={saveButton(saving)}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </section>

<Footer />
</div>
  );
}

/* ================= STYLES ================= */

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 14,
  marginBottom: 18,
};

const cardBox = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #eee",
  padding: 18,
  marginTop: 16,
};

const statusBadge = {
  display: "inline-block",
  padding: "8px 12px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 600,
  border: "1px solid transparent",
};

const uploadBox = {
  background: "#fff",
  borderRadius: 12,
  border: "1px solid #eee",
  padding: 14,
  marginBottom: 20,
};

const uploadTitle = {
  fontWeight: 600,
  marginBottom: 8,
};

const uploadArea = {
  border: "1px dashed #bbb",
  padding: 16,
  borderRadius: 10,
  textAlign: "center" as const,
  cursor: "pointer",
  background: "#fafafa",
};

const removeBtn = {
  marginTop: 10,
  background: "none",
  border: "none",
  fontSize: 13,
  color: "#d00",
  cursor: "pointer",
  textDecoration: "underline",
};

const saveButton = (saving: boolean) => ({
  marginTop: 20,
  padding: "12px 20px",
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  borderRadius: 8,
  border: "none",
  cursor: saving ? "not-allowed" : "pointer",
  opacity: saving ? 0.6 : 1,
});

const darkButton = (saving: boolean) => ({
  padding: "12px 20px",
  background: "#111",
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  borderRadius: 8,
  border: "none",
  cursor: saving ? "not-allowed" : "pointer",
  opacity: saving ? 0.6 : 1,
});

const errorBox = {
  background: "#ffe5e5",
  color: "#b30000",
  padding: 12,
  borderRadius: 8,
  marginBottom: 20,
};

const infoBox = {
  background: "#e7fbe9",
  color: "#0a7a2b",
  padding: 12,
  borderRadius: 8,
  marginBottom: 20,
};

const stripeButtonRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  marginTop: 10,
};

const disconnectButton: React.CSSProperties = {
  padding: "12px 20px",
  background: "#fff",
  color: "#c00",
  border: "1px solid #c00",
  borderRadius: 8,
  cursor: "pointer",
};