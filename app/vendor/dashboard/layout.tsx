export default function VendorDashboardLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <main style={{ width: "100%", margin: "0 auto" }}>{children}</main>
    </div>
  );
}
