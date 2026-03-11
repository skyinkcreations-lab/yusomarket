"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

function parseHashParams(hash: string) {
  const out: Record<string, string> = {};
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  params.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = supabaseBrowser();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [status, setStatus] = useState<
    "booting" | "ready" | "saving" | "done"
  >("booting");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const strength = useMemo(() => {
    if (password.length < 8) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  }, [password]);

  // 1) Establish a recovery session from URL (code OR hash tokens)
  useEffect(() => {
    let cancelled = false;

    async function establishSession() {
      setError("");
      setInfo("");
      setStatus("booting");

      try {
        // A) PKCE style: /reset-password?code=...
        const code = searchParams.get("code");
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(
            code
          );

          if (cancelled) return;

          if (exErr) {
            setError(exErr.message);
            setStatus("ready"); // still render actions like “request new link”
            return;
          }

          // IMPORTANT: only strip the code AFTER exchange succeeds
          router.replace("/reset-password", { scroll: false });
          setStatus("ready");
          return;
        }

        // B) Implicit style: /reset-password#access_token=...&refresh_token=...&type=recovery
        if (typeof window !== "undefined" && window.location.hash) {
          const hash = parseHashParams(window.location.hash);

          if (
            hash.type === "recovery" &&
            hash.access_token &&
            hash.refresh_token
          ) {
            const { error: sessErr } = await supabase.auth.setSession({
              access_token: hash.access_token,
              refresh_token: hash.refresh_token,
            });

            if (cancelled) return;

            if (sessErr) {
              setError(sessErr.message);
              setStatus("ready");
              return;
            }

            // Strip hash after session is set
            router.replace("/reset-password");
            setStatus("ready");
            return;
          }
        }

// C) If no code/hash, maybe session already exists (user refreshed)
const { data } = await supabase.auth.getSession();
if (cancelled) return;

if (!data.session) {
  setError(
    "Missing reset token. Please request a new password reset link."
  );
  setStatus("ready");
  return;
}

// Only allow recovery sessions
const isRecovery = !!data.session?.user?.recovery_sent_at;

if (!isRecovery) {
  await supabase.auth.signOut({ scope: "local" });

  setError(
    "Invalid or expired reset link. Please request a new password reset email."
  );
  setStatus("ready");
  return;
}

setStatus("ready");
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message ?? "Something went wrong.");
        setStatus("ready");
      }
    }

    establishSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, router]);

  async function handleUpdatePassword() {
    setError("");
    setInfo("");

if (password.length < 8) {
  setError("Password must be at least 8 characters.");
  return;
}
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setStatus("saving");

const { data: sessionData } = await supabase.auth.getSession();

if (!sessionData.session) {
  setStatus("ready");
  setError("No active recovery session. Request a new reset link.");
  return;
}

const isRecovery = !!sessionData.session.user?.recovery_sent_at;

if (!isRecovery) {
  await supabase.auth.signOut();
  setStatus("ready");
  setError("Invalid reset session. Please request a new reset link.");
  return;
}

    const { error: updErr } = await supabase.auth.updateUser({
  password,
});

    if (updErr) {
      setStatus("ready");
      setError(updErr.message);
      return;
    }

    setStatus("done");
    setInfo("Password updated. You can now log in with your new password.");

    // Optional: sign out to force clean login
    await supabase.auth.signOut();

router.replace("/login");
  }

  return (
    <>
      <Header />

      <div className="auth-page">
        <div className="auth-wrapper">
          <h1>Set a new password</h1>
          <p className="auth-sub">
            Choose a strong password to secure your account.
          </p>

          {error && <div className="auth-error">{error}</div>}
          {info && <div className="auth-info">{info}</div>}

          <div className="auth-fields">
            <input
              type="password"
              placeholder="New password"
              value={password}
              disabled={status !== "ready"}
              onChange={(e) => setPassword(e.target.value)}
              className={`auth-input ${
                password.length === 0
                  ? ""
                  : strength === "weak"
                  ? "invalid"
                  : "valid"
              }`}
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              disabled={status !== "ready"}
              onChange={(e) => setConfirm(e.target.value)}
              className="auth-input"
            />

            {password.length > 0 && (
              <div className="auth-hint">
                Password strength:{" "}
                <strong>
                  {strength.charAt(0).toUpperCase() + strength.slice(1)}
                </strong>
              </div>
            )}

            <button
              onClick={handleUpdatePassword}
              disabled={status !== "ready"}
              className="auth-button"
              style={{ opacity: status === "ready" ? 1 : 0.55 }}
            >
              {status === "saving" ? "Updating…" : "Update password"}
            </button>
          </div>

          <div className="auth-links-row">
            <button
              className="auth-link"
              onClick={() => router.push("/login")}
              type="button"
            >
              Back to login
            </button>

            <button
              className="auth-link"
              onClick={() => router.push("/forgot-password")}
              type="button"
            >
              Request new link
            </button>
          </div>
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
          background: #385fa2;
        }

        .auth-wrapper {
          width: 100%;
          max-width: 560px;
          text-align: center;
          color: #fff;
        }

        .auth-wrapper h1 {
          font-size: clamp(28px, 3.2vw, 40px);
          font-weight: 900;
          letter-spacing: -0.9px;
          margin-bottom: 6px;
        }

        .auth-sub {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.78);
          margin-bottom: 22px;
          font-weight: 400;
        }

        .auth-error {
          background: rgba(254, 226, 226, 0.95);
          border: 1px solid rgba(252, 165, 165, 0.6);
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin: 0 auto 14px;
          max-width: 520px;
          text-align: left;
        }

        .auth-info {
          background: rgba(220, 252, 231, 0.95);
          border: 1px solid rgba(134, 239, 172, 0.5);
          color: #166534;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin: 0 auto 14px;
          max-width: 520px;
          text-align: left;
        }

        .auth-fields {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-width: 520px;
          margin: 0 auto;
        }

        .auth-input {
          height: 46px;
          padding: 0 16px;
          border-radius: 999px;
          border: none;
          font-size: 14.5px;
          font-weight: 500;
          outline: none;
          transition: all 0.2s ease;
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

        .auth-hint {
          margin-top: -6px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          text-align: left;
          padding: 0 6px;
        }

        .auth-button {
          height: 46px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #fc8700, #e67600);
          color: #fff;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.2px;
          cursor: pointer;
          transition: all 0.25s ease;
          margin-top: 6px;
        }

        .auth-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(252, 135, 0, 0.45);
        }

        .auth-links-row {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }

        .auth-link {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.9);
          font-size: 14px;
          text-decoration: underline;
          cursor: pointer;
          padding: 8px 0;
        }

        .auth-link:hover {
          color: #fff;
        }

        @media (max-width: 640px) {
          .auth-page {
            padding: 60px 16px;
          }
          .auth-links-row {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}