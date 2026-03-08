// app/cart/page.tsx 

import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import CartClient from "./CartClient";

import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const supabase = await supabaseServer();
  const cookieStore = await cookies();

  const guestCartId = cookieStore.get("cart_id")?.value ?? null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("DEBUG CART PAGE:", {
    guestCartId,
    userId: user?.id ?? null,
  });

  /* ============== MERGE WHEN USER LOGS IN ============== */
  if (user && guestCartId) {
    const { data: userCart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (userCart?.id) {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cart/merge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_cart_id: guestCartId,
          user_cart_id: userCart.id,
        }),
      });
    }
  }

  /* ============== LOAD CART ============== */

  async function loadCart(where: object) {
    const { data } = await supabase
      .from("carts")
      .select(
        `
        id,
        shipping_method,
        discount_code,
        cart_items (
          id,
          quantity,
          product_id,
          variant_id,
          products (
            id,
            name,
            slug,
            price,
            original_price,
            thumbnail_url
          )
        )
      `
      )
      .match(where)
      .maybeSingle();

    if (!data) return null;

    // normalize — always return item.product
    return {
      ...data,
      cart_items: data.cart_items?.map((i: any) => ({
        ...i,
        product: i.products ?? null,
      })) ?? [],
    };
  }

  let cart = null;

  if (user) {
    cart = await loadCart({ user_id: user.id });
  } else if (guestCartId) {
    cart = await loadCart({ id: guestCartId });
  }

  return (
    <>
      <Header />

      <div
        style={{
          background: "#fff",
          padding: "100px 0",
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1180px", padding: "0 16px" }}>
          <CartClient cartFromServer={cart} />
        </div>
      </div>

      <div style={{ marginTop: "-60px" }}>
        <Footer />
      </div>
    </>
  );
}
