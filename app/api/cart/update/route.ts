import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const body = await req.json();

    const cookieStore = await cookies();
    const cookieCartId = cookieStore.get("cart_id")?.value ?? null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Resolve cart
    let cartId: string | null = null;

    if (user) {
      const { data } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      cartId = data?.id ?? null;
    }

    if (!cartId && cookieCartId) cartId = cookieCartId;
    if (!cartId && body.cart_id) cartId = body.cart_id;

    if (!cartId)
      return NextResponse.json({ error: "Missing cart_id" }, { status: 400 });

    // Load cart
const { data: cart } = await supabase
  .from("carts")
  .select(
    `
    id,
    user_id,
    discount_code,
    discount_amount,
    cart_items(
      id,
      quantity,
      product:products(
        id,
        vendor_id,
        name,
        slug,
        price,
        original_price,
        thumbnail_url,
        shipping_profile_id,
        shipping_profile:shipping_profiles!products_shipping_profile_id_fkey(
          id,
          name,
          region,
          standard_cost,
          express_cost,
          free_shipping_threshold
        )
      )
    )
  `
  )
      .eq("id", cartId)
      .maybeSingle();

    if (!cart)
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });

    // Security guard
    if (cart.user_id && user?.id !== cart.user_id)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    /* =========================================================
        ACTIONS
    ========================================================= */
    switch (body.type) {
      case "remove_item": {
        await supabase
          .from("cart_items")
          .delete()
          .eq("id", body.cart_item_id)
          .eq("cart_id", cart.id);
        break;
      }

      case "quantity": {
        await supabase
          .from("cart_items")
          .update({ quantity: body.quantity })
          .eq("id", body.cart_item_id)
          .eq("cart_id", cart.id);
        break;
      }

      case "discount": {
        const code = (body.code || "").trim().toUpperCase();
        if (!code)
          return NextResponse.json({ error: "Enter a discount code." });

        // Lookup
        const { data: d } = await supabase
          .from("discount_codes")
          .select("*")
          .eq("code", code)
          .eq("active", true)
          .maybeSingle();

        if (!d)
          return NextResponse.json({ error: "Invalid or expired code." });

        // Expiry check
        if (d.expires_at && new Date(d.expires_at) < new Date())
          return NextResponse.json({ error: "Code has expired." });

        // Cart subtotal
        const subtotal = cart.cart_items.reduce(
          (s: number, item: any) =>
            s + item.quantity * Number(item.product.price),
          0
        );

        if (subtotal < Number(d.min_subtotal ?? 0))
          return NextResponse.json({
            error: `Minimum spend is $${Number(d.min_subtotal).toFixed(2)}.`,
          });

        // Calculate discount
        let discountAmount =
          d.type === "percent"
            ? subtotal * (Number(d.amount) / 100)
            : Number(d.amount);

        if (discountAmount > subtotal) discountAmount = subtotal;

        // Save to cart
        await supabase
          .from("carts")
          .update({
            discount_code: code,
            discount_amount: discountAmount,
          })
          .eq("id", cart.id);

        break;
      }

      case "clear_discount": {
        await supabase
          .from("carts")
          .update({
            discount_code: null,
            discount_amount: 0,
          })
          .eq("id", cart.id);
        break;
      }

      case "shipping": {
        if (!body.shipping_method)
          return NextResponse.json(
            { error: "Missing shipping_method" },
            { status: 400 }
          );

        await supabase
          .from("carts")
          .update({
            shipping_method: body.shipping_method,
          })
          .eq("id", cart.id);

        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    /* =========================================================
        RETURN UPDATED CART
    ========================================================= */
    const { data: updated } = await supabase
      .from("carts")
.select(
`
id,
discount_code,
discount_amount,
shipping_method,
cart_items(
  id,
  quantity,
  product:products(
    id,
    vendor_id,
    name,
    slug,
    price,
    original_price,
    thumbnail_url,
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
`
)
      .eq("id", cart.id)
      .maybeSingle();

    return NextResponse.json({ cart: updated });
  } catch (err: any) {
    console.error("CART UPDATE ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
