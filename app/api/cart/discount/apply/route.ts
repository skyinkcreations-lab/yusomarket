import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { cart_id, code } = await req.json();

  if (!cart_id || !code) {
    return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.rpc("apply_discount_to_cart", {
    p_cart_id: cart_id,
    p_code: code.trim(),
    p_user_id: user?.id ?? null,
  });

  if (error) {
    console.error("APPLY DISCOUNT RPC ERROR", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }

  if (data?.error) {
    return NextResponse.json(data, { status: 400 });
  }

  // Record successful usage
  await supabase.from("discount_uses").insert({
    discount_id: data.discount_id,
    user_id: user?.id ?? null,
    cart_id,
  });

  return NextResponse.json(data);
}
