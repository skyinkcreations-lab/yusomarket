import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

export async function GET() {
  try {

    const supabase = await supabaseServer();
    const cookieStore = await cookies();

    const cookieCartId = cookieStore.get("cart_id")?.value ?? null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let cartId: string | null = null;

    // Logged-in cart
    if (user) {
      const { data: userCart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userCart) cartId = userCart.id;
    }

    // Guest cart
    if (!cartId && cookieCartId) {
      cartId = cookieCartId;
    }

    // No cart exists
    if (!cartId) {
      return NextResponse.json({
        cart: null,
        cartCount: 0,
      });
    }

const { data: cart } = await supabase
  .from("carts")
  .select(`
    id,
    user_id,
    shipping_method,
    shipping_cost,
    discount_code,
    discount_amount,
    address_json,
    region,
    cart_items(
      id,
      quantity,
      product:products(
        id,
        vendor_id,
        name,
        price,
        thumbnail_url,
        weight_grams,
        shipping_profile_id,
        shipping_profile:shipping_profiles(
          id,
          name,
          region,
          standard_cost,
          express_cost,
          free_shipping_threshold
        )
      )
    )
  `)
  .eq("id", cartId)
  .maybeSingle();

    if (!cart) {
      return NextResponse.json({
        cart: null,
        cartCount: 0,
      });
    }

    const cartCount =
      cart.cart_items?.reduce(
        (sum: number, item: any) => sum + (item.quantity ?? 0),
        0
      ) ?? 0;

    return NextResponse.json({
      cart,
      cartCount,
    });

  } catch (err: any) {

    console.error("CART GET ERROR:", err);

    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}