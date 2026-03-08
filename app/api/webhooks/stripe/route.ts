import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("WEBHOOK SIGNATURE ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const cartId = session.metadata?.cart_id;
      const vendorId = session.metadata?.vendor_id;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (!cartId || !vendorId || !paymentIntentId) {
        throw new Error("Missing required checkout metadata");
      }

      const supabase = await supabaseServer();

      // Prevent duplicate order creation
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("stripe_payment_intent", paymentIntentId)
        .maybeSingle();

      if (existingOrder) {
        return NextResponse.json({ received: true });
      }

      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select(`
          id,
          user_id,
          cart_items(
            id,
            quantity,
            product:products(
              id,
              vendor_id,
              name,
              price
            )
          )
        `)
        .eq("id", cartId)
        .maybeSingle();

      if (cartError) throw cartError;
      if (!cart) throw new Error("Cart not found");

      const subtotal = cart.cart_items.reduce((sum: number, item: any) => {
        const price = Number(item.product?.price ?? 0);
        return sum + price * Number(item.quantity ?? 0);
      }, 0);

      const shippingMethod =
        session.payment_intent_data?.metadata?.shipping_method ??
        session.metadata?.shipping_method ??
        "standard";

      const shippingCost = shippingMethod === "express" ? 15 : 8;
      const tax = Math.round(subtotal * 0.1 * 100) / 100;
      const totalAmount = Number((session.amount_total ?? 0) / 100);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: cart.user_id,
          customer_email: session.customer_details?.email ?? session.customer_email,
          total_amount: totalAmount,
          stripe_payment_intent: paymentIntentId,
          status: "paid",
          shipping_method: shippingMethod,
          shipping_cost: shippingCost,
          tax_amount: tax,
          shipping_address_json: session.customer_details?.address ?? null,
          vendor_id: vendorId,
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.cart_items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product?.id,
        vendor_id: item.product?.vendor_id,
        price: Number(item.product?.price ?? 0),
        quantity: Number(item.quantity ?? 1),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Optional: clear the cart after successful payment
      const cartItemIds = cart.cart_items.map((i: any) => i.id);
      if (cartItemIds.length > 0) {
        await supabase.from("cart_items").delete().in("id", cartItemIds);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("WEBHOOK HANDLER ERROR:", error);
    return NextResponse.json(
      { error: error.message ?? "Webhook handler failed" },
      { status: 500 }
    );
  }
}