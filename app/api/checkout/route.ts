import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { stripe, STRIPE_PLATFORM_FEE_PERCENT } from "@/lib/stripe";

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
      .maybeSingle();

    if (cartError) {
      return NextResponse.json({ error: cartError.message }, { status: 500 });
    }

    if (!cart || !cart.cart_items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const vendorIds = Array.from(
      new Set(
        cart.cart_items
          .map((item: any) => item.product?.vendor_id)
          .filter(Boolean)
      )
    );

    if (vendorIds.length !== 1) {
      return NextResponse.json(
        {
          error:
            "This checkout currently supports one vendor per order only.",
        },
        { status: 400 }
      );
    }

    const vendorId = vendorIds[0];

    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id, stripe_account_id, store_name")
      .eq("id", vendorId)
      .maybeSingle();

    if (vendorError) {
      return NextResponse.json({ error: vendorError.message }, { status: 500 });
    }

    if (!vendor?.stripe_account_id) {
      return NextResponse.json(
        { error: "Vendor is not connected to Stripe yet." },
        { status: 400 }
      );
    }

    const shippingCost = shippingMethod === "express" ? 15 : 8;
    const subtotal = cart.cart_items.reduce((sum: number, item: any) => {
      const price = Number(item.product?.price ?? 0);
      return sum + price * Number(item.quantity ?? 0);
    }, 0);

    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const discountAmount = Number(cart.discount_amount ?? 0);
    const total = Math.max(0, subtotal + shippingCost + tax - discountAmount);

    if (total <= 0) {
      return NextResponse.json(
        { error: "Invalid cart total" },
        { status: 400 }
      );
    }

    const applicationFeeAmount = Math.round(
      toCents(total) * (STRIPE_PLATFORM_FEE_PERCENT / 100)
    );

    const line_items: any[] = cart.cart_items.map((item: any) => ({
      quantity: Number(item.quantity ?? 1),
      price_data: {
        currency: "aud",
        product_data: {
          name: item.product?.name ?? "Product",
          images: item.product?.thumbnail_url
            ? [item.product.thumbnail_url]
            : undefined,
        },
        unit_amount: toCents(Number(item.product?.price ?? 0)),
      },
    }));

    line_items.push({
      quantity: 1,
      price_data: {
        currency: "aud",
        product_data: {
          name: shippingMethod === "express" ? "Express Shipping" : "Standard Shipping",
        },
        unit_amount: toCents(shippingCost),
      },
    });

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded",
      return_url: `${siteUrl}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: customer?.email,
      line_items,
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: vendor.stripe_account_id,
        },
        metadata: {
          cart_id: cart.id,
          vendor_id: vendor.id,
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
        vendor_id: vendor.id,
      },
    });

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