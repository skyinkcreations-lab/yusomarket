import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import SellForm from "./SellForm";

export default async function SellPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → login
  if (!user) {
    redirect("/login");
  }

  // Check if vendor already exists
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (vendor) {
    // Already a vendor → dashboard
    redirect("/vendor/dashboard");
  }

  // NOT a vendor → show the signup form
  return <SellForm />;
}
