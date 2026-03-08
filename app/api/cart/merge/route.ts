import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const { guest_cart_id, user_cart_id } = await req.json();

  // get logged-in user so merge can re-apply discounts correctly
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.rpc("merge_guest_cart_into_user_cart", {
    guest_cart_id,
    user_cart_id,
    p_user_id: user?.id ?? null,
  });

  // clear guest cookie cart after merge
  cookieStore.set("cart_id", "", {
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
