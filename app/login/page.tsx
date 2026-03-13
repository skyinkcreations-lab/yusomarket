"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../_components/Header";
import Footer from "../_components/Footer";

import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRole } from "@/app/_providers/RoleProvider";

export default function LoginPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const { refreshRole } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function handleSubmit() {
    setError("");
    setLoading(true);

    const { data, error: loginErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginErr) {
      setLoading(false);
      setError(loginErr.message);
      return;
    }

    await refreshRole();

    const user = data.user;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "user";

    setLoading(false);

if (role === "vendor") {
  router.push("/vendor/dashboard");
  router.refresh();
} else if (role === "admin") {
  router.push("/admin");
  router.refresh();
} else {
  router.push("/account");
  router.refresh();
}
  }

  return (
    <>
      <Header />

      <div className="login-page">
        <div className="login-wrapper">
          <h1>Welcome back</h1>
          <p className="login-sub">Sign in to continue to YusoMarket</p>

          {error && <div className="login-error">{error}</div>}

          <div className="login-fields">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className={`login-input ${
                email.length === 0 ? "" : isValidEmail(email) ? "valid" : "invalid"
              }`}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />

            {/* Forgot password link */}
            <div className="login-forgot-row">
              <button
                type="button"
                className="login-forgot"
                onClick={() => router.push("/forgot-password")}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="login-button"
              style={{ opacity: loading ? 0.55 : 1 }}
            >
              {loading ? "Signing In…" : "Sign In"}
            </button>
          </div>

          <p className="login-footer">
            Don’t have an account?
            <span onClick={() => router.push("/signup")}>Create one</span>
          </p>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .login-page {
          flex: 1;
          min-height: 75vh; /* keeps your intended height */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          background: #385fa2;
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
          text-align: center;
          color: white;
        }

        .login-wrapper h1 {
          font-size: clamp(28px, 3vw, 34px);
          font-weight: 900;
          letter-spacing: -0.8px;
          margin-bottom: 6px;
        }

        .login-sub {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 28px;
          font-weight: 400;
        }

        .login-error {
          background: rgba(254, 226, 226, 0.95);
          border: 1px solid rgba(252, 165, 165, 0.6);
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 18px;
          text-align: left;
        }

        .login-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .login-input {
          height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          border: none;
          font-size: 14.5px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
        }

        .login-input:focus {
          box-shadow: 0 0 0 3px rgba(252, 135, 0, 0.35);
        }

        .login-input.valid {
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.4);
        }

        .login-input.invalid {
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4);
        }

        .login-forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -6px; /* tucks it closer to the password field */
          margin-bottom: 2px;
        }

        .login-forgot {
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

        .login-forgot:hover {
          color: #fc8700;
        }

        .login-button {
          height: 46px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #fc8700, #e67600);
          color: white;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.2px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .login-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(252, 135, 0, 0.45);
        }

        .login-footer {
          margin-top: 26px;
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.8);
        }

        .login-footer span {
          margin-left: 6px;
          color: #fc8700;
          font-weight: 600;
          cursor: pointer;
        }

        .login-footer span:hover {
          color: white;
        }

        @media (max-width: 640px) {
          .login-page {
            padding: 60px 16px;
          }

          .login-wrapper h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </>
  );
}