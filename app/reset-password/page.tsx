import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: "center" }}>Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}