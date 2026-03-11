import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import crypto from "crypto";
import { stripe, STRIPE_PLATFORM_FEE_PERCENT } from "@/lib/stripe";

type CartProduct = {
  id: string;
  name: string;
  price: number;
  vendor_id: string;
  thumbnail_url?: string | null;
};

type CartItem = {
  id: string;
  quantity: number;
  product: CartProduct;
};

type Cart = {
  id: string;
  discount_amount: number | null;
  cart_items: CartItem[];
};

function toCents(amount: number) {
  return Math.round(amount * 100);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();
    const body = await req.json();

    const cartId = body.cart_id as string | undefined;

    const shippingMethod = (body.shipping_method ?? "standard") as
      | "standard"
      | "express";

    const customer = body.customer as
      | { email?: string; name?: string }
      | undefined;

    const shippingAddress = body.shipping_address as
      | {
          country?: string;
          line1?: string;
          city?: string;
          state?: string;
          postcode?: string;
        }
      | undefined;

    if (!cartId) {
      return NextResponse.json({ error: "Missing cart_id" }, { status: 400 });
    }

    /*
    =================================
    OPTIONAL: REQUIRE AUTHENTICATED USER
    =================================
    */
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be signed in to checkout." },
        { status: 401 }
      );
    }

    /*
    =================================
    LOAD CART
    =================================
    */
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select(`
        id,
        discount_amount,
        cart_items(
          id,
          quantity,
          product:products(
            id,
            name,
            price,
            vendor_id,
            thumbnail_url
          )
        )
      `)
      .eq("id", cartId)
      .maybeSingle<Cart>();

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    if (!cart || !cart.cart_items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    /*
    =================================
    VALIDATE ALL ITEMS
    =================================
    */
    const validItems = cart.cart_items.filter(
      (item) =>
        item.product &&
        item.product.id &&
        item.product.vendor_id &&
        Number(item.product.price ?? 0) > 0 &&
        Number(item.quantity ?? 0) > 0
    );

    if (validItems.length === 0) {
      return NextResponse.json(
        { error: "Cart has no valid items." },
        { status: 400 }
      );
    }

    /*
    =================================
    VALIDATE VENDORS IN CART
    =================================
    */
    const vendorIds = Array.from(
      new Set(validItems.map((item) => item.product.vendor_id))
    );

    if (vendorIds.length === 0) {
      return NextResponse.json(
        { error: "No valid vendors found in cart." },
        { status: 400 }
      );
    }

    /*
    =================================
    OPTIONAL: ENSURE ALL VENDORS ARE PAYOUT-READY
    =================================
    */
    const { data: vendors, error: vendorsError } = await supabase
      .from("vendors")
      .select(`
        id,
        stripe_account_id,
        stripe_charges_enabled,
        stripe_payouts_enabled,
        store_name
      `)
      .in("id", vendorIds);

    if (vendorsError) {
      return NextResponse.json({ error: vendorsError.message }, { status: 500 });
    }

    const vendorMap = new Map((vendors ?? []).map((v) => [v.id, v]));

    for (const vendorId of vendorIds) {
      const vendor = vendorMap.get(vendorId);

      if (
        !vendor ||
        !vendor.stripe_account_id ||
        !vendor.stripe_charges_enabled ||
        !vendor.stripe_payouts_enabled
      ) {
        return NextResponse.json(
          {
            error:
              "One or more vendors are not ready to receive payments yet.",
          },
          { status: 400 }
        );
      }
    }

    /*
    =================================
    CALCULATE TOTALS
    =================================
    */
    const shippingCost = shippingMethod === "express" ? 15 : 8;

    const subtotal = validItems.reduce((sum, item) => {
      const price = Number(item.product.price ?? 0);
      const qty = Number(item.quantity ?? 0);
      return sum + price * qty;
    }, 0);

    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const discountAmount = Math.max(0, Number(cart.discount_amount ?? 0));
    const totalBeforeDiscount = subtotal + shippingCost + tax;
    const total = Math.max(0, totalBeforeDiscount - discountAmount);

    if (total <= 0) {
      return NextResponse.json(
        { error: "Invalid cart total." },
        { status: 400 }
      );
    }

    /*
    =================================
    PLATFORM FEE
    =================================
    */
    const totalCents = toCents(total);

    const applicationFeeAmount = Math.round(
      totalCents * (STRIPE_PLATFORM_FEE_PERCENT / 100)
    );

    /*
    =================================
    STRIPE LINE ITEMS
    =================================
    */
    const line_items: any[] = validItems.map((item) => ({
      quantity: Number(item.quantity ?? 1),
      price_data: {
        currency: "aud",
        product_data: {
          name: item.product.name ?? "Product",
          images: item.product.thumbnail_url
            ? [item.product.thumbnail_url]
            : undefined,
        },
        unit_amount: toCents(Number(item.product.price ?? 0)),
      },
    }));

    // Shipping
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "aud",
        product_data: {
          name:
            shippingMethod === "express"
              ? "Express Shipping"
              : "Standard Shipping",
        },
        unit_amount: toCents(shippingCost),
      },
    });

    // GST
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "aud",
        product_data: {
          name: "GST",
        },
        unit_amount: toCents(tax),
      },
    });

    // Discount as negative line item
    if (discountAmount > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "aud",
          product_data: {
            name: "Discount",
          },
          unit_amount: -toCents(discountAmount),
        },
      });
    }

    /*
    =================================
    STRIPE CHECKOUT SESSION
    PLATFORM-CHARGE MODEL
    =================================
    */
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        ui_mode: "embedded",
        return_url: `${siteUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        customer_email: customer?.email,

        line_items,

payment_intent_data: {
  metadata: {
    cart_id: cart.id,
    shipping_method: shippingMethod,
    customer_name: customer?.name ?? "",

    shipping_country: shippingAddress?.country ?? "",
    shipping_line1: shippingAddress?.line1 ?? "",
    shipping_city: shippingAddress?.city ?? "",
    shipping_state: shippingAddress?.state ?? "",
    shipping_postcode: shippingAddress?.postcode ?? "",
  },
},

        metadata: {
          cart_id: cart.id,
          customer_user_id: user.id,
          vendor_count: String(vendorIds.length),
        },
      },
      {
        idempotencyKey: crypto.randomUUID(),
      }
    );

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("CHECKOUT ERROR:", error);

    return NextResponse.json(
      { error: error.message ?? "Unknown checkout error" },
      { status: 500 }
    );
  }
}