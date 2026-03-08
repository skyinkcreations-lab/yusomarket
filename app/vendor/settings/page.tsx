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

  // Storefront
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [supportEmail, setSupportEmail] = useState("");

  // Auth
  const [loginEmail, setLoginEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Logo ONLY (banner completely removed)
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  /* -------------------------------------------
     LOAD USER + VENDOR
  ------------------------------------------- */
  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      setLoginEmail(user.email || "");

      const { data: vendor } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!vendor) {
        router.push("/sell");
        return;
      }

      setStoreName(vendor.store_name || "");
      setStoreDescription(vendor.store_description || "");
      setSupportEmail(vendor.support_email || "");
      setLogoPreview(vendor.store_logo || null);

      setLoading(false);
    }

    loadData();
  }, []);

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
     SAVE STOREFRONT (NO BANNER)
  ------------------------------------------- */
  async function handleSave() {
    setError("");
    setInfo("");
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    let newLogoUrl = null;

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

    const { error: updateErr } = await supabase
      .from("vendors")
      .update({
        store_name: storeName,
        store_description: storeDescription,
        support_email: supportEmail,
        store_logo: newLogoUrl || undefined,
      })
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
    return <p>Loading...</p>;
  }

  return (
    <>
      <Header />

      <section style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
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

        <button
          onClick={handleSecuritySave}
          style={saveButton(securitySaving)}
        >
          {securitySaving ? "Updating..." : "Update Password"}
        </button>

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
            onClick={() =>
              document.getElementById("logo-input")?.click()
            }
          >
            {logoPreview ? (
              <img
                src={logoPreview}
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
            <button style={removeBtn} onClick={removeLogo}>
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

        <button
          onClick={handleSave}
          disabled={saving}
          style={saveButton(saving)}
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </section>

      <Footer />
    </>
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
