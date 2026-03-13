"use server";

import { redirect } from "next/navigation";
import Header from "../_components/Header";
import Footer from "../_components/Footer";
import { supabaseServer } from "@/lib/supabaseServer";

export async function logoutAction() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function AccountPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("SERVER USER:", user);

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: orders } = await supabase
  .from("orders")
  .select("id, order_number, total_amount, status, created_at")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(5);


  if (profile?.role === "vendor") redirect("/vendor/dashboard");

  return (
    <>
      <Header />

     {/* HERO */}
<section
  style={{
    width: "100%",
    background: "linear-gradient(135deg, #2f4f88 0%, #385fa2 100%)",
    padding: "70px 20px 90px",
    textAlign: "center",
    color: "white",
    position: "relative",
  }}
>
  {/* LOGOUT BUTTON */}
  <div style={{ position: "absolute", top: 20, right: 20 }}>
    <form action={logoutAction}>
      <button
        type="submit"
        style={{
          padding: "10px 18px",
          background: "white",
          color: "#000",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Logout
      </button>
    </form>
  </div>

  <h1
    style={{
      fontSize: 48,
      fontWeight: 900,
      letterSpacing: "-0.02em",
      marginBottom: 12,
    }}
  >
    Your Account
  </h1>

  <p
    style={{
      maxWidth: 600,
      margin: "0 auto",
      fontSize: 16,
      opacity: 0.85,
      lineHeight: "1.6",
      color: "#cbd5f5",
    }}
  >
    Manage your profile, review orders, and update your account details.
  </p>
</section>


      {/* MAIN */}
<section
  style={{
    maxWidth: 1400,
    margin: "70px auto",
    padding: "0 32px 80px",
  }}
>
        {/* PROFILE CARD — FIXED FOR MOBILE */}
<div
  style={{
    background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
    padding: "36px 36px",
    borderRadius: 26,
    border: "1px solid rgba(15, 23, 42, 0.06)",
    boxShadow:
      "0 35px 80px rgba(15,23,42,0.08), 0 12px 30px rgba(15,23,42,0.05)",
    marginBottom: 60,
    display: "flex",
    alignItems: "center",
    gap: 26,
    flexWrap: "wrap",
    minWidth: 0,
    position: "relative",
  }}
>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #385fa2 0%, #2f4f88 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              fontWeight: 700,
              color: "white",
              textTransform: "uppercase",
            }}
          >
            {(profile?.name || user.email)?.charAt(0)}
          </div>

          <div style={{ flex: 1, minWidth: 200, wordBreak: "break-word" }}>
            <div
  style={{
    fontSize: 15,
    fontWeight: 700,
    whiteSpace: "wrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}
>
  {profile?.name || user.email}
</div>


            <div style={{ color: "#555", marginTop: 4 }}>{user.email}</div>

            <div style={{ color: "#777", marginTop: 5 }}>
              Role: {profile?.role || "user"}
            </div>
          </div>
        </div>

        {/* TOOLS */}
<h2
  style={{
    fontSize: 30,
    fontWeight: 600,
    marginBottom: 36,
    letterSpacing: "-0.02em",
    color: "#0f172a",
  }}
>
          Account Tools
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 26,
          }}
        >
          <a href="/account/orders" style={premiumCard("#6b3ce9")}>
            <h3 style={cardTitle}>Your Orders</h3>
            <p style={cardDesc}>View your purchase history.</p>
          </a>

          <a href="/account/settings" style={premiumCard("#4f81ff")}>
            <h3 style={cardTitle}>Account Settings</h3>
            <p style={cardDesc}>Update your personal details.</p>
          </a>

          <a href="/sell" style={premiumCard("#00c199")}>
            <h3 style={cardTitle}>Become a Vendor</h3>
            <p style={cardDesc}>Start selling on YusoMarket.</p>
          </a>
        </div>

        {/* RECENT ORDERS */}
        <h2
          style={{
            fontSize: 30,
letterSpacing: "-0.02em",
            fontWeight: 600,
            marginTop: 60,
            marginBottom: 20,
            color: "#111",
          }}
        >
          Recent Orders
        </h2>

        <div
          style={{
background: "linear-gradient(180deg, #ffffff 0%, #fbfcff 100%)",
padding: "40px 36px",
borderRadius: 24,
border: "1px solid rgba(15, 23, 42, 0.06)",
boxShadow:
  "0 30px 70px rgba(15,23,42,0.07), 0 10px 30px rgba(15,23,42,0.05)",
          }}
        >
          {(!orders || orders.length === 0) && (
  <p style={{ color: "#777" }}>You have no recent orders.</p>
)}

{orders?.map((o) => {
  const publicId = o.order_number || o.id;

  return (
    <a
      key={o.id}
      href={`/account/orders/${publicId}`}
      style={{
        display: "block",
        padding: "18px 0",
        borderBottom: "1px solid #eee",
        textDecoration: "none",
        color: "black",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700 }}>
            Order #{publicId}
          </div>

          <div style={{ color: "#777", fontSize: 13 }}>
            {new Date(o.created_at).toLocaleString()}
          </div>

          <div style={{ marginTop: 6, fontSize: 13 }}>
            Total:{" "}
            <strong>A${Number(o.total_amount || 0).toFixed(2)}</strong>
          </div>
        </div>

        <span
          style={{
            height: 30,
            padding: "5px 12px",
background:
  o.status === "delivered"
    ? "rgba(16,185,129,0.15)"
    : "rgba(245,158,11,0.15)",
color:
  o.status === "delivered"
    ? "#047857"
    : "#b45309",
border:
  o.status === "delivered"
    ? "1px solid rgba(16,185,129,0.3)"
    : "1px solid rgba(245,158,11,0.3)",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            alignSelf: "center",
            textTransform: "capitalize",
          }}
        >
          {o.status}
        </span>
      </div>
    </a>
  );
})}
        </div>
      </section>

      <Footer />
    </>
  );
}

function premiumCard(accent: string): React.CSSProperties {
  return {
    background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
    padding: "34px 34px",
    borderRadius: 22,
    border: "1px solid rgba(15, 23, 42, 0.06)",
    boxShadow:
      "0 25px 60px rgba(15,23,42,0.06), 0 8px 20px rgba(15,23,42,0.04)",
    position: "relative",
    overflow: "hidden",
    textDecoration: "none",
    color: "#0f172a",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.25s ease",
  };
}

const cardTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  marginBottom: 10,
  letterSpacing: "-0.01em",
};

const cardDesc: React.CSSProperties = {
  fontSize: 15,
  color: "#475569",
  lineHeight: "1.6",
};
