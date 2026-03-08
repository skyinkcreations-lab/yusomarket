"use client";

export default function LogoutButton() {
  async function handleLogout() {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    const data = await res.json();

    if (data.redirect) {
      window.location.href = data.redirect;
    }
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "10px 18px",
        background: "#111",
        color: "#fff",
        borderRadius: 8,
        border: "none",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      Logout
    </button>
  );
}
