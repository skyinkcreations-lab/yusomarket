"use client";

import { useState, useEffect } from "react";
import Header from "../_components/Header";
import Footer from "../_components/Footer";

export default function SellForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [showTerms, setShowTerms] = useState(false);
const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] =
    useState<"checking" | "taken" | "free" | null>(null);

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  useEffect(() => {
    if (!slug) {
      setSlugStatus(null);
      return;
    }

    setSlugStatus("checking");

    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/vendor/check-slug?slug=${slug}`);
      const data = await res.json();
      setSlugStatus(data.available ? "free" : "taken");
    }, 400);

    return () => clearTimeout(timeout);
  }, [slug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (slugStatus === "taken") {
      setError("Store name is already taken.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("slug", slug);

    const res = await fetch("/api/vendor/register", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }

    window.location.href = data.redirectTo;
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="vendor-hero">
        <div className="vendor-hero-inner">
          <h1>Start selling on YusoMarket</h1>
          <p>
            Create your storefront and launch your brand in minutes.
          </p>
        </div>
      </section>

      {/* FORM AREA */}
      <section className="vendor-section">
        <div className="vendor-container">

          <div className="vendor-card">

            {error && <div className="vendor-error">{error}</div>}

            <form onSubmit={handleSubmit}>

              {/* Store Name */}
              <div className="field">
                <label>Store name</label>
                <input
                  type="text"
                  name="store_name"
                  required
                  value={storeName}
                  onChange={(e) => {
                    const text = e.target.value;
                    setStoreName(text);
                    setSlug(generateSlug(text));
                  }}
                />
              </div>

              {/* Slug */}
              {slug && (
                <div className="slug-row">
                  yusomarket.com/vendors/<strong>{slug}</strong>

                  {slugStatus === "checking" && (
                    <span className="slug-checking">Checking…</span>
                  )}

                  {slugStatus === "free" && (
                    <span className="slug-free">Available</span>
                  )}

                  {slugStatus === "taken" && (
                    <span className="slug-taken">Taken</span>
                  )}
                </div>
              )}

              <div className="field">
                <label>Support email</label>
                <input
                  type="email"
                  name="support_email"
                  required
                />
              </div>

              <div className="field">
                <label>Store description</label>
                <textarea
                  name="store_description"
                  required
                  rows={4}
                />
              </div>

              <div className="field">
                <label>Store logo</label>
                <input
                  type="file"
                  name="store_logo"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setLogoPreview(URL.createObjectURL(file));
                  }}
                />
              </div>

              {logoPreview && (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Preview" />
                </div>
              )}

<button
  type="button"
  className="vendor-btn"
  onClick={() => setShowTerms(true)}
>
  Create Vendor Account
</button>

            </form>
          </div>
        </div>
      </section>

{showTerms && (
  <div className="terms-overlay">

    <div className="terms-modal">

      <h3>Vendor Terms & Conditions</h3>

<div className="terms-content">

<p>
By creating a vendor account on YusoMarket you acknowledge and agree to the
following vendor obligations and platform policies:
</p>
<br></br>
<ul>

<li>
You are solely responsible for the legality, safety, and authenticity of all
products listed for sale on YusoMarket.
</li>
<br></br>
<li>
All products must comply with applicable international, national, and local
laws and regulations, including consumer protection laws, product safety
standards, and import/export regulations.
</li>
<br></br>
<li>
Vendors must not list, advertise, or sell illegal, counterfeit, stolen,
restricted, or prohibited products including but not limited to weapons,
controlled substances, counterfeit goods, or any items that violate
intellectual property rights.
</li>
<br></br>
<li>
Product descriptions, pricing, images, and specifications must be accurate,
truthful, and not misleading to customers.
</li>
<br></br>
<li>
Vendors must fulfil orders within their stated handling time and provide
appropriate customer support and dispute resolution when required.
</li>
<br></br>
<li>
Vendors are responsible for complying with all applicable tax obligations,
duties, and regulatory requirements in the jurisdictions where they operate.
</li>
<br></br>
<li>
YusoMarket reserves the right to remove listings, suspend vendor accounts,
withhold payouts, or permanently terminate access to the platform where a
vendor violates platform policies or applicable laws.
</li>
<br></br>
<li>
In cases involving illegal activity, fraud, counterfeit products, or consumer
harm, YusoMarket may cooperate with law enforcement authorities and provide
relevant account information where legally required.
</li>

</ul>
<br></br>
<p>
By continuing, you confirm that you understand and accept these responsibilities
and agree to operate your vendor account in compliance with all applicable
laws and YusoMarket marketplace policies.
</p>

</div>

      <label className="terms-check">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e)=>setAcceptedTerms(e.target.checked)}
        />
        I agree to the vendor Terms & Conditions
      </label>

      <div className="terms-actions">

        <button
          className="terms-cancel"
          onClick={()=>setShowTerms(false)}
        >
          Cancel
        </button>

        <button
          className="terms-accept"
          disabled={!acceptedTerms}
          onClick={()=>{
            const form = document.querySelector("form");
            if(form) form.requestSubmit();
          }}
        >
          Accept & Continue
        </button>

      </div>

    </div>

  </div>
)}
      <Footer />

      {/* STYLES */}
      <style jsx>{`

        .vendor-hero {
          background: #385fa2;
          color: white;
          padding: 60px 20px 50px;
          text-align: center;
        }

        .vendor-hero-inner {
          max-width: 720px;
          margin: 0 auto;
        }

        .vendor-hero h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .vendor-hero p {
          font-size: 14px;
          opacity: 0.85;
        }

        .vendor-section {
          background: #f5f5f7;
          padding: 50px 20px 80px;
        }

        .vendor-container {
          max-width: 720px;
          margin: 0 auto;
        }

        .vendor-card {
          background: white;
          border-radius: 20px;
          padding: 32px;
          border: 1px solid rgba(0,0,0,0.06);
        }

        .vendor-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          padding: 12px 14px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .field input,
        .field textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid rgba(15,23,42,0.12);
          font-size: 14px;
          transition: border 0.2s ease;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #385fa2;
          outline: none;
        }

        .slug-row {
          font-size: 13px;
          margin-bottom: 18px;
        }

        .slug-checking {
          margin-left: 8px;
          color: #64748b;
        }

        .slug-free {
          margin-left: 8px;
          color: #15803d;
          font-weight: 600;
        }

        .slug-taken {
          margin-left: 8px;
          color: #b91c1c;
          font-weight: 600;
        }

        .logo-preview {
          margin-bottom: 20px;
        }

        .logo-preview img {
          width: 90px;
          height: 90px;
          border-radius: 14px;
          object-fit: cover;
          border: 1px solid #e5e7eb;
        }

        .vendor-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: #385fa2;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .vendor-btn:hover {
          background: #2e4e86;
        }

        @media (max-width: 640px) {
          .vendor-card {
            padding: 24px;
          }

          .vendor-hero {
            padding: 50px 20px 40px;
          }
        }

        .terms-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.5);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:2000;
}

.terms-modal{
  background:white;
  width:500px;
  max-width:90%;
  border-radius:16px;
  padding:26px;
}

.terms-modal h3{
  margin-bottom:14px;
}

.terms-content{
  font-size:14px;
  color:#555;
  max-height:220px;
  overflow:auto;
  margin-bottom:16px;
}

.terms-check{
  display:flex;
  gap:8px;
  font-size:13px;
  margin-bottom:20px;
}

.terms-actions{
  display:flex;
  justify-content:flex-end;
  gap:10px;
}

.terms-cancel{
  background:#eee;
  border:none;
  padding:10px 14px;
  border-radius:8px;
  cursor:pointer;
}

.terms-accept{
  background:#385fa2;
  color:white;
  border:none;
  padding:10px 16px;
  border-radius:8px;
  font-weight:600;
  cursor:pointer;
}

.terms-accept:disabled{
  opacity:0.5;
  cursor:not-allowed;
}

      `}</style>
    </>
  );
}