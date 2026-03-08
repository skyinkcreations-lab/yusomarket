// Protect vendor routes

import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function VendorLayout({ children }) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "vendor") {
    redirect("/sell");
  }

  return <div>{children}</div>;
}
