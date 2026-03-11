"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../_components/Header";
import Footer from "../_components/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    [email]
  );

  async function handleSendLink() {
    setError("");
    setInfo("");

    if (!email || !isValidEmail) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to send reset email.");
        setLoading(false);
        return;
      }

      setInfo("Reset link sent. Check your inbox (and spam).");
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  }

  return (
    <>
      <Header />

      <div className="fp-page">
        <div className="fp-wrapper">
          <h1>Forgot your password?</h1>
          <p className="fp-sub">
            Enter your email and we’ll send you a secure reset link.
          </p>

          {error && <div className="fp-error">{error}</div>}
          {info && <div className="fp-info">{info}</div>}

          <div className="fp-fields">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className={`fp-input ${
                email.length === 0 ? "" : isValidEmail ? "valid" : "invalid"
              }`}
            />

            <button
              onClick={handleSendLink}
              disabled={loading}
              className="fp-button"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "Sending…" : "Send reset link"}
            </button>

            <div className="fp-links">
              <button
                type="button"
                className="fp-link"
                onClick={() => router.push("/login")}
                disabled={loading}
              >
                Back to login
              </button>

              <button
                type="button"
                className="fp-link"
                onClick={() => router.push("/signup")}
                disabled={loading}
              >
                Create account
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .fp-page {
          flex: 1;
          min-height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: #385fa2;
        }

        .fp-wrapper {
          width: 100%;
          max-width: 460px;
          text-align: center;
          color: #ffffff;
        }

        .fp-wrapper h1 {
          font-size: clamp(28px, 3vw, 34px);
          font-weight: 900;
          letter-spacing: -0.8px;
          margin-bottom: 6px;
        }

        .fp-sub {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 26px;
          font-weight: 400;
        }

        .fp-error {
          background: rgba(254, 226, 226, 0.95);
          border: 1px solid rgba(252, 165, 165, 0.6);
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 14px;
          text-align: left;
        }

        .fp-info {
          background: rgba(220, 252, 231, 0.95);
          border: 1px solid rgba(134, 239, 172, 0.55);
          color: #166534;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 14px;
          text-align: left;
        }

        .fp-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .fp-input {
          height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          border: none;
          font-size: 14.5px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }

        .fp-input:focus {
          box-shadow: 0 0 0 3px rgba(252, 135, 0, 0.35);
        }

        .fp-input.valid {
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
        }

        .fp-input.invalid {
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
        }

        .fp-button {
          height: 46px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #fc8700, #e67600);
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.2px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .fp-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(252, 135, 0, 0.45);
        }

        .fp-links {
          margin-top: 6px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }

        .fp-link {
          background: transparent;
          border: none;
          padding: 0;
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.82);
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s ease;
        }

        .fp-link:hover {
          color: #fc8700;
        }

        @media (max-width: 640px) {
          .fp-page {
            padding: 60px 16px;
          }
          .fp-links {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}