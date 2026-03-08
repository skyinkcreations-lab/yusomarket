// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "YusoMarket",
  description: "Multi-vendor marketplace",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f8f8f8] text-slate-900 antialiased">
        {/* No global Header/Footer – each page owns its own layout */}
        <main>{children}</main>
      </body>
    </html>
  );
}
