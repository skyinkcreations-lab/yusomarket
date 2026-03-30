import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const supabase = await supabaseServer();
  const { id: orderNumber } = await context.params;

  // AUTH
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // FETCH ORDER (USER SCOPED)
const { data: order, error } = await supabase
  .from("orders")
.select(`
  id,
  order_number,
  status,
  created_at,
  total_amount,
  subtotal_amount,
  shipping_cost,
  discount_amount,
  shipping_method,
  shipping_address_json,
  tracking_number,
  customer_notes,
  vendor:vendors (
    store_name,
    support_email
  ),
  order_items (
    id,
    quantity,
    unit_price,
    total_price,
    products (
      name,
      thumbnail_url
    )
  )
`)
  .eq("order_number", orderNumber)
  .eq("user_id", auth.user.id)
  .maybeSingle();

if (error) {
  console.error("Order fetch error:", error);
  return NextResponse.json({ error: error.message }, { status: 500 });
}

if (!order) {
  return NextResponse.json({ error: "Order not found" }, { status: 404 });
}

const formatted = {
  ...(order as any), // 🔥 force TS to accept it's not null

  vendor: (order as any).vendor || {},

  order_items: ((order as any).order_items || []).map((i: any) => ({
    ...i,
    product_name: i.products?.name,
    thumbnail_url: i.products?.thumbnail_url,
  })),
};

  return NextResponse.json({ order: formatted });
}