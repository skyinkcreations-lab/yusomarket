"use client";

type Props = {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  growth: string;
  color: string;
};

export default function StatCard({ icon, title, value, growth, color }: Props) {
  return (
    <div
      style={{
        background: color,
        borderRadius: 18,
        padding: "26px 28px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        transition: "0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0px) scale(1)";
      }}
    >
      <div style={{ marginBottom: 10 }}>{icon}</div>

      <div style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          marginTop: 6,
          marginBottom: 4,
          letterSpacing: "-0.7px",
        }}
      >
        {value}
      </div>

      <div style={{ fontSize: 13, opacity: 0.7 }}>{growth}</div>
    </div>
  );
}
