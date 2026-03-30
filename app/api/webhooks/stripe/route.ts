import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe, STRIPE_PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

/*
======================================
TYPES
======================================
*/

type CartProduct = {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
};

type CartItem = {
  id: string;
  quantity: number;
  product: CartProduct;
};

type Cart = {
  id: string;
  user_id: string;
  discount_amount?: number | null;
  cart_items: CartItem[];
};

type VendorRow = {
  id: string;
  stripe_account_id: string | null;
};

function roundMoney(n: number) {
  return Number(n.toFixed(2));
}

function toCents(amount: number) {
  return Math.round(amount * 100);
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("WEBHOOK SIGNATURE ERROR:", err.message);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  /*
  ======================================
  EVENT IDEMPOTENCY CHECK
  ======================================
  */

  const { data: existingEvent, error: existingEventError } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existingEventError) {
    console.error("STRIPE EVENT LOOKUP ERROR:", existingEventError);
    return NextResponse.json({ received: true });
  }

  if (existingEvent) {
    return NextResponse.json({ received: true });
  }

  try {
    /*
    ======================================
    STRIPE CONNECT ACCOUNT STATUS SYNC
    ======================================
    */

    if (event.type === "account.updated") {
      const account = event.data.object as any;

      const { error } = await supabase
        .from("vendors")
        .update({
          stripe_charges_enabled: account.charges_enabled ?? false,
          stripe_payouts_enabled: account.payouts_enabled ?? false,
          stripe_details_submitted: account.details_submitted ?? false,
          stripe_onboarded_at: account.details_submitted
            ? new Date().toISOString()
            : null,
        })
        .eq("stripe_account_id", account.id);

      if (error) {
        console.error("VENDOR STRIPE SYNC ERROR:", error);
      }

      await supabase.from("stripe_events").insert({
        id: event.id,
        type: event.type,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ received: true });
    }

    /*
    ======================================
    VENDOR DISCONNECTED
    ======================================
    */

    if (event.type === "account.application.deauthorized") {
      const account = event.data.object as any;

      const { error } = await supabase
        .from("vendors")
        .update({
          stripe_account_id: null,
          stripe_charges_enabled: false,
          stripe_payouts_enabled: false,
          stripe_details_submitted: false,
          stripe_onboarded_at: null,
        })
        .eq("stripe_account_id", account.id);

      if (error) {
        console.error("VENDOR DISCONNECT ERROR:", error);
      }

      await supabase.from("stripe_events").insert({
        id: event.id,
        type: event.type,
        created_at: new Date().toISOString(),
      });

      return NextResponse.json({ received: true });
    }

    /*
    ======================================
    ORDER CREATION FOR SUCCESSFUL CHECKOUT
    ======================================
    */

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      if (session.payment_status !== "paid") {
        await supabase.from("stripe_events").insert({
          id: event.id,
          type: event.type,
          created_at: new Date().toISOString(),
        });

        return NextResponse.json({ received: true });
      }

      const cartId = session.metadata?.cart_id;

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (!cartId || !paymentIntentId) {
        console.error("Missing required checkout metadata:", session.metadata);

        await supabase.from("stripe_events").insert({
          id: event.id,
          type: event.type,
          created_at: new Date().toISOString(),
        });

        return NextResponse.json({ received: true });
      }

      /*
      ======================================
      FETCH CART
      ======================================
      */

      const { data: cart, error: cartError } = await supabase
        .from("carts")
        .select(`
          id,
          user_id,
          discount_amount,
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
        .maybeSingle<Cart>();

      if (cartError) {
        console.error("CART QUERY ERROR:", cartError);
        return NextResponse.json({ received: true });
      }

      if (!cart) {
        console.warn("Cart not found:", cartId);
        return NextResponse.json({ received: true });
      }

      if (!cart.cart_items || cart.cart_items.length === 0) {
        console.error("Cart has no items");
        return NextResponse.json({ received: true });
      }

      /*
      ======================================
      GROUP ITEMS BY VENDOR
      ======================================
      */

      const vendorGroups: Record<string, CartItem[]> = {};

      for (const item of cart.cart_items) {
        const vendorId = item.product?.vendor_id;

        if (!vendorId) {
          console.error("Missing product vendor_id on cart item:", item.id);
          continue;
        }

        if (!vendorGroups[vendorId]) {
          vendorGroups[vendorId] = [];
        }

        vendorGroups[vendorId].push(item);
      }

      const vendorIds = Object.keys(vendorGroups);

      if (vendorIds.length === 0) {
        console.error("No valid vendor groups found in cart");
        return NextResponse.json({ received: true });
      }

      /*
      ======================================
      LOAD VENDORS FOR PAYOUTS
      ======================================
      */

      const { data: vendors, error: vendorsError } = await supabase
        .from("vendors")
        .select("id, stripe_account_id")
        .in("id", vendorIds);

      if (vendorsError || !vendors) {
        console.error("VENDOR LOOKUP ERROR:", vendorsError);
        return NextResponse.json({ received: true });
      }

      const vendorMap = new Map<string, VendorRow>(
        (vendors as VendorRow[]).map((v) => [v.id, v])
      );

      /*
      ======================================
      LOAD PAYMENT INTENT + CHARGE
      ======================================
      */

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        { expand: ["latest_charge"] }
      );

      const chargeId =
        typeof paymentIntent.latest_charge === "string"
          ? paymentIntent.latest_charge
          : paymentIntent.latest_charge?.id;

      if (!chargeId) {
        console.error("Missing charge ID for payment intent:", paymentIntentId);
        return NextResponse.json({ received: true });
      }

      /*
      ======================================
      SHARED TOTALS
      ======================================
      */

      const shippingMethod = session.metadata?.shipping_method ?? "standard";
      const baseShippingCost = shippingMethod === "express" ? 15 : 8;

      const cartSubtotal = cart.cart_items.reduce((sum, item) => {
        const price = Number(item.product?.price ?? 0);
        return sum + price * Number(item.quantity ?? 0);
      }, 0);

      const cartDiscountAmount = Math.max(0, Number(cart.discount_amount ?? 0));

      if (cartSubtotal <= 0) {
        console.error("Invalid cart subtotal:", cartSubtotal);
        return NextResponse.json({ received: true });
      }

      /*
      ======================================
      CREATE ONE ORDER PER VENDOR
      ======================================
      */

      for (const vendorId of vendorIds) {
        const items = vendorGroups[vendorId];
        if (!items || items.length === 0) continue;

        /*
        --------------------------------------
        PER-VENDOR ORDER IDEMPOTENCY
        --------------------------------------
        */

        const { data: existingVendorOrder, error: existingVendorOrderError } =
          await supabase
            .from("orders")
            .select("id")
            .eq("stripe_payment_intent", paymentIntentId)
            .eq("vendor_id", vendorId)
            .maybeSingle();

        if (existingVendorOrderError) {
          console.error("EXISTING VENDOR ORDER LOOKUP ERROR:", {
            vendorId,
            error: existingVendorOrderError,
          });
          continue;
        }

        if (existingVendorOrder) {
          continue;
        }

        const vendor = vendorMap.get(vendorId);

        if (!vendor?.stripe_account_id) {
          console.error("Vendor missing stripe_account_id:", vendorId);
          continue;
        }

        const subtotal = roundMoney(
          items.reduce((sum, item) => {
            const price = Number(item.product?.price ?? 0);
            return sum + price * Number(item.quantity ?? 0);
          }, 0)
        );

        const vendorRatio = cartSubtotal > 0 ? subtotal / cartSubtotal : 0;

        const shippingCost = roundMoney(baseShippingCost * vendorRatio);
        const tax = roundMoney(subtotal * 0.1);
        const discountAmount = roundMoney(cartDiscountAmount * vendorRatio);

        const totalAmount = roundMoney(
          subtotal + shippingCost + tax - discountAmount
        );

        const orderNumber = `YM-${paymentIntentId.slice(-8)}-${vendorId.slice(0, 4)}`;

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number: orderNumber,
            user_id: cart.user_id,
            vendor_id: vendorId,
            total_amount: totalAmount,
            subtotal_amount: subtotal,
            status: "pending",
            stripe_payment_intent: paymentIntentId,
            shipping_method: shippingMethod,
            shipping_cost: shippingCost,
            discount_amount: discountAmount,
            tax_amount: tax,
            customer_name: session.customer_details?.name ?? null,
            customer_email:
              session.customer_details?.email ??
              session.customer_email ??
              null,
            shipping_address_json: session.customer_details?.address ?? null,
          })
          .select("id")
          .single();

        if (orderError || !order) {
          console.error("ORDER CREATION ERROR:", {
            vendorId,
            error: orderError,
          });
          continue;
        }

        /*
        --------------------------------------
        CREATE ORDER ITEMS
        --------------------------------------
        */

        const orderItems = items.map((item) => {
          const unitPrice = Number(item.product.price ?? 0);
          const quantity = Number(item.quantity ?? 1);

          return {
            order_id: order.id,
            product_id: item.product.id,
            quantity,
            unit_price: unitPrice,
            total_price: roundMoney(unitPrice * quantity),
            product_name: item.product.name ?? null,
          };
        });

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItems);

        if (itemsError) {
          console.error("ORDER ITEMS INSERT ERROR:", {
            vendorId,
            orderId: order.id,
            error: itemsError,
          });
          continue;
        }

        /*
        --------------------------------------
        CREATE STRIPE TRANSFER TO VENDOR
        --------------------------------------
        */

const grossCents = toCents(totalAmount);

const platformFeeCents = Math.round(
  grossCents * (STRIPE_PLATFORM_FEE_PERCENT / 100)
);

const transferAmountCents = Math.max(
  0,
  grossCents - platformFeeCents
);

try {

const transfer = await stripe.transfers.create(
{
  amount: transferAmountCents,
  currency: "aud",
  destination: vendor.stripe_account_id,
  source_transaction: chargeId,
  metadata: {
    order_id: order.id,
    vendor_id: vendorId,
    stripe_payment_intent: paymentIntentId,
  },
},
{
  idempotencyKey: `transfer_${order.id}`
});

  await supabase
    .from("orders")
    .update({
      stripe_transfer_id: transfer.id
    })
    .eq("id", order.id);

} catch (transferError: any) {
  console.error("STRIPE TRANSFER ERROR:", {
    vendorId,
    orderId: order.id,
    error: transferError?.message ?? transferError,
  });
}
      }

      /*
      ======================================
      CLEAR CART
      ======================================
      */

      const cartItemIds = cart.cart_items.map((i) => i.id);

      if (cartItemIds.length > 0) {
        const { error: clearCartError } = await supabase
          .from("cart_items")
          .delete()
          .in("id", cartItemIds);

        if (clearCartError) {
          console.error("CLEAR CART ERROR:", clearCartError);
        }
      }

      /*
      ======================================
      MARK EVENT AS SUCCESSFULLY PROCESSED
      ======================================
      */

      const { error: eventInsertError } = await supabase
        .from("stripe_events")
        .insert({
          id: event.id,
          type: event.type,
          created_at: new Date().toISOString(),
        });

      if (eventInsertError) {
        console.error("FINAL STRIPE EVENT INSERT ERROR:", eventInsertError);
      }

return NextResponse.json({ received: true });
}


/*
======================================
HANDLE REFUNDS (TRANSFER REVERSALS)
======================================
*/

if (event.type === "charge.refunded") {

  const charge = event.data.object as any;
  const paymentIntentId = charge.payment_intent;

  if (!paymentIntentId) {
    return NextResponse.json({ received: true });
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, stripe_transfer_id, vendor_id")
    .eq("stripe_payment_intent", paymentIntentId);

  if (error || !orders) {
    console.error("REFUND ORDER LOOKUP ERROR:", error);
    return NextResponse.json({ received: true });
  }

  for (const order of orders) {

    if (!order.stripe_transfer_id) continue;

    try {

      await stripe.transfers.createReversal(
        order.stripe_transfer_id,
        {
          metadata: {
            order_id: order.id,
            reason: "customer_refund"
          }
        }
      );

      await supabase
        .from("orders")
        .update({
          status: "refunded"
        })
        .eq("id", order.id);

    } catch (err: any) {

      console.error("TRANSFER REVERSAL FAILED", {
        orderId: order.id,
        error: err.message
      });

    }

  }

  await supabase.from("stripe_events").insert({
    id: event.id,
    type: event.type,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ received: true });

}

    /*
    ======================================
    DEFAULT SUCCESS FOR UNUSED EVENTS
    ======================================
    */

    const { error: finalEventInsertError } = await supabase
      .from("stripe_events")
      .insert({
        id: event.id,
        type: event.type,
        created_at: new Date().toISOString(),
      });

    if (finalEventInsertError) {
      console.error("FINAL DEFAULT STRIPE EVENT INSERT ERROR:", finalEventInsertError);
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