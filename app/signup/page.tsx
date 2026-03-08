"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../_components/Header";
import Footer from "../_components/Footer";

import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function SignupPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password strength indicator (kept)
  const getPasswordStrength = () => {
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  };

  const strength = useMemo(() => getPasswordStrength(), [password]);

  async function handleSignup() {
    setLoading(true);
    setError("");
    setInfo("");

    /** --------------------------------
     * 1️⃣ Create Supabase Auth User
     * --------------------------------*/
    const { data, error: signupErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupErr) {
      setLoading(false);
      setError(signupErr.message);
      return;
    }

    const user = data.user;

    /** --------------------------------
     * 2️⃣ Insert into profiles table
     *    (as "user" by default)
     * --------------------------------*/
    if (user) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        role: "user",
      });
    }

    setLoading(false);

    /** --------------------------------
     * 3️⃣ Show verification message
     * --------------------------------*/
    setInfo(
      "Account created! Please check your inbox and verify your email before logging in."
    );

    setEmail("");
    setPassword("");

    // Redirect to login after a delay (kept)
    setTimeout(() => {
      router.push("/login");
    }, 5000);
  }

  return (
    <>
      <Header />

      <div className="auth-page">
        <div className="auth-wrapper">
          <h1>Create your account</h1>
          <p className="auth-sub">Join YusoMarket and start shopping smarter.</p>

          {error && <div className="auth-alert error">{error}</div>}
          {info && <div className="auth-alert info">{info}</div>}

          <div className="auth-fields">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className={`auth-input ${
                email.length === 0 ? "" : isValidEmail(email) ? "valid" : "invalid"
              }`}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className={`auth-input ${
                password.length === 0
                  ? ""
                  : strength === "weak"
                  ? "invalid"
                  : strength === "medium"
                  ? "warn"
                  : "valid"
              }`}
            />

            {password.length > 0 && (
              <div className={`pw-strength ${strength}`}>
                Password strength:{" "}
                {strength.charAt(0).toUpperCase() + strength.slice(1)}
              </div>
            )}

            <button
              onClick={handleSignup}
              disabled={loading}
              className="auth-button"
              style={{ opacity: loading ? 0.55 : 1 }}
            >
              {loading ? "Creating Account…" : "Create Account"}
            </button>
          </div>

          <p className="auth-footer">
            Already have an account?
            <span onClick={() => router.push("/login")}>Sign in</span>
          </p>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .auth-page {
          flex: 1;
          min-height: 75vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;

          /* Match footer solid blue */
          background: #385fa2;
        }

        .auth-wrapper {
          width: 100%;
          max-width: 420px;
          text-align: center;
          color: #ffffff;
        }

        /* Typography */
        .auth-wrapper h1 {
          font-size: clamp(28px, 3vw, 34px);
          font-weight: 900;
          letter-spacing: -0.9px;
          margin-bottom: 6px;
          line-height: 1.08;
        }

        .auth-sub {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 28px;
          font-weight: 400;
        }

        .auth-alert {
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 18px;
          text-align: left;
        }

        .auth-alert.error {
          background: rgba(254, 226, 226, 0.95);
          border: 1px solid rgba(252, 165, 165, 0.6);
          color: #b91c1c;
        }

        .auth-alert.info {
          background: rgba(220, 252, 231, 0.95);
          border: 1px solid rgba(134, 239, 172, 0.55);
          color: #166534;
        }

        .auth-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .auth-input {
          height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          border: none;

          font-size: 14.5px;
          font-weight: 500;

          outline: none;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }

        .auth-input:focus {
          box-shadow: 0 0 0 3px rgba(252, 135, 0, 0.35);
        }

        .auth-input.valid {
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
        }

        .auth-input.invalid {
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
        }

        .auth-input.warn {
          box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.45);
        }

        .pw-strength {
          margin-top: -6px;
          margin-bottom: 2px;
          font-size: 13px;
          text-align: left;
          padding-left: 6px;
          color: rgba(255, 255, 255, 0.78);
        }

        .pw-strength.weak {
          color: rgba(254, 226, 226, 0.95);
        }

        .pw-strength.medium {
          color: rgba(255, 237, 213, 0.95);
        }

        .pw-strength.strong {
          color: rgba(220, 252, 231, 0.95);
        }

        .auth-button {
          height: 46px;
          border-radius: 999px;
          border: none;

          background: linear-gradient(135deg, #fc8700, #e67600);
          color: #ffffff;

          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.2px;

          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease,
            filter 0.25s ease;
        }

        .auth-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(252, 135, 0, 0.45);
        }

        .auth-footer {
          margin-top: 26px;
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.8);
        }

        .auth-footer span {
          margin-left: 6px;
          color: #fc8700;
          font-weight: 700;
          cursor: pointer;
        }

        .auth-footer span:hover {
          color: #ffffff;
        }

        @media (max-width: 640px) {
          .auth-page {
            padding: 60px 16px;
          }

          .auth-wrapper h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </>
  );
}