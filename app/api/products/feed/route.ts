import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  const supabase = await supabaseServer();

  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      original_price,
      thumbnail_url,
      created_at,
      vendor:vendors (
        id,
        store_name,
        slug
      ),
      variants:product_variations (
        id,
        title,
        regular_price,
        sale_price
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(70);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message });
  }

  return NextResponse.json({
    products: data ?? [],
  });

}