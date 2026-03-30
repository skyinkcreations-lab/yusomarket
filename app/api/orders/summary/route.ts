import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { orderIds } = await req.json();
  const supabase = await supabaseServer();

  const { data: orders } = await supabase
    .from("orders")
.select(`
  id,
  order_number,
  status,
  created_at,
  subtotal_amount,
  total_amount,
  shipping_cost,
  discount_amount,

  vendor:vendors (
    store_name,
    support_email
  ),

  order_items (
    id,
    quantity,
    total_price,
    product:products (
      name,
      thumbnail_url
    )
  )
`)
    .in("id", orderIds);

const formatted = orders?.map((o: any) => ({
  ...o,
  vendor: o.vendor || null,

  items: o.order_items?.map((i: any) => ({
    id: i.id,
    quantity: i.quantity,
    total_price: i.total_price,
    product_name: i.product?.name,
    thumbnail_url: i.product?.thumbnail_url,
  })),
}));

  return NextResponse.json({ orders: formatted });
}
