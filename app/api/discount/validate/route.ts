import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { cartTotal, code } = await req.json();
  const supabase = await supabaseServer();

  const { data: discount } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!discount) {
    return Response.json({ valid: false, message: "Invalid code" });
  }

  if (!discount.active) {
    return Response.json({ valid: false, message: "This code is no longer active" });
  }

  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return Response.json({ valid: false, message: "This code has expired" });
  }

  if (cartTotal < (discount.min_spend || 0)) {
    return Response.json({
      valid: false,
      message: `Minimum spend is $${discount.min_spend}`,
    });
  }

  // Calculate discount
  const discountAmount = discount.is_percentage
    ? cartTotal * (discount.amount / 100)
    : discount.amount;

  return Response.json({
    valid: true,
    discountAmount,
    message: "Code applied!",
  });
}
