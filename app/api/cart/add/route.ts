import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const body = await req.json();

    const productId = body.productId ?? body.product_id;
    const variantId = body.variantId ?? body.variant_id ?? null;
    const quantity = Number(body.quantity ?? 1);

    if (!productId || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid product or quantity" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cookieCartId = cookieStore.get("cart_id")?.value ?? null;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log("📦 ADD TO CART REQUEST");
    console.log("➡️ product:", productId, "| qty:", quantity);
    console.log("🧁 cookie cart_id =", cookieCartId);
    console.log("👤 user id =", user?.id ?? null);

    let cartId: string | null = null;

    // =========================================================
    // LOGGED-IN USER — ALWAYS USE ACCOUNT CART
    // =========================================================
    if (user) {
      console.log("🔐 logged in — using USER cart");

      const { data: userCart, error } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) console.error("USER CART FETCH ERROR:", error);

      if (userCart) {
        console.log("📦 existing user cart:", userCart.id);
        cartId = userCart.id;
      } else {
        console.log("🆕 creating NEW user cart");

        const newId = randomUUID();

        const { error: createError } = await supabase.from("carts").insert({
          id: newId,
          user_id: user.id,
          shipping_method: "standard",
          shipping_cost: 8,
          discount_amount: 0,
          region: "metro",
        });

        if (createError) console.error("CREATE USER CART ERROR:", createError);

        cartId = newId;
        console.log("✅ created user cart:", cartId);
      }
    }

    // =========================================================
    // GUEST — USE COOKIE CART
    // =========================================================
    if (!user) {
      console.log("🧑‍🦲 guest — resolving COOKIE cart");

      if (cookieCartId) {
        console.log("📦 existing guest cart:", cookieCartId);
        cartId = cookieCartId;
      } else {
        console.log("🆕 creating NEW guest cart");

        const newId = randomUUID();

        const { error: guestError } = await supabase.from("carts").insert({
          id: newId,
          user_id: null,
          shipping_method: "standard",
          shipping_cost: 8,
          discount_amount: 0,
          region: "metro",
        });

        if (guestError) console.error("CREATE GUEST CART ERROR:", guestError);

        cookieStore.set("cart_id", newId, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          secure: process.env.NODE_ENV === "production",
        });

        cartId = newId;
        console.log("🍪 new guest cart created + cookie set:", cartId);
      }
    }

    console.log("🎯 FINAL cartId =", cartId);

    // =========================================================
    // FIND EXISTING CART ITEM (NULL-SAFE VARIANT MATCH)
    // =========================================================
    let existing = null;
    let findError = null;

    if (variantId) {
      ({ data: existing, error: findError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", productId)
        .eq("variant_id", variantId)
        .maybeSingle());
    } else {
      ({ data: existing, error: findError } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cartId)
        .eq("product_id", productId)
        .is("variant_id", null)
        .maybeSingle());
    }

    if (findError) console.error("FIND CART ITEM ERROR:", findError);

    // =========================================================
    // UPSERT CART ITEM
    // =========================================================
    if (existing) {
      console.log("📝 updating quantity:", existing.id);

      const updateRes = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id)
        .select("*");

      console.log("UPDATE RESULT:", updateRes);

      if (updateRes.error) {
        console.error("❌ UPDATE BLOCKED (RLS?):", updateRes.error);
        return NextResponse.json(
          { error: updateRes.error.message },
          { status: 403 }
        );
      }
    } else {
      console.log("➕ inserting NEW item into cart:", cartId);

      const insertRes = await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: productId,
          variant_id: variantId,
          quantity,
        })
        .select("*");

      console.log("INSERT RESULT:", insertRes);

      if (insertRes.error) {
        console.error("❌ INSERT BLOCKED (RLS?):", insertRes.error);
        return NextResponse.json(
          { error: insertRes.error.message },
          { status: 403 }
        );
      }
    }

console.log("✅ ADD TO CART COMPLETE");

// =========================================================
// GET UPDATED CART COUNT
// =========================================================

const { data: countRows, error: countError } = await supabase
  .from("cart_items")
  .select("quantity")
  .eq("cart_id", cartId);

if (countError) console.error("COUNT ERROR:", countError);

const cartCount =
  countRows?.reduce((sum, item) => sum + (item.quantity ?? 0), 0) ?? 0;

console.log("🧮 CART COUNT =", cartCount);

// =========================================================
// RETURN UPDATED COUNT
// =========================================================

return NextResponse.json({
  success: true,
  cartCount,
});

  } catch (err: any) {
    console.error("🚨 ADD TO CART ERROR:", err);
    return NextResponse.json(
      { error: err.message ?? "Add to cart failed" },
      { status: 500 }
    );
  }
}
