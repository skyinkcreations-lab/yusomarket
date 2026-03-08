// app/account/layout.tsx
import { ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <div className="max-w-6xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
}
