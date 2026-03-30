import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabaseServer";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

function traceId() {
  return Math.random().toString(36).slice(2, 10);
}

// ADMIN CLIENT — bypasses RLS for reloading the order
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  const tid = traceId();
  console.log(`[${tid}] ORDER UPDATE START`);

  try {
    const supabase = await supabaseServer();
    const body = await req.json();

    const { orderId, patch, action } = body as {
      orderId?: string;
      patch?: any;
      action?:
        | "processing"
        | "shipped"
        | "delivered"
        | "cancel"
        | "refund"
        | "tracking"
        | "notes";
    };

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId", tid }, { status: 400 });
    }

    // -------------------------------------------
    // AUTH
    // -------------------------------------------
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Not authenticated", tid }, { status: 401 });
    }

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found", tid }, { status: 403 });
    }

    // -------------------------------------------
    // LOAD ORDER (vendor scoped)
    // -------------------------------------------
    const { data: existing, error: loadErr } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderId)
      .eq("vendor_id", vendor.id)
      .maybeSingle();

    if (loadErr || !existing) {
      return NextResponse.json({ error: "Order not found", tid }, { status: 404 });
    }

    // -------------------------------------------
    // BUILD UPDATE
    // -------------------------------------------
    const now = new Date().toISOString();
    const update: Record<string, any> = {};

    if (patch) {
      if ("tracking_number" in patch) update.tracking_number = patch.tracking_number || null;
      if ("vendor_notes" in patch) update.vendor_notes = patch.vendor_notes || null;
      if ("customer_notes" in patch) update.customer_notes = patch.customer_notes || null;
      if ("cancellation_reason" in patch)
        update.cancellation_reason = patch.cancellation_reason || null;
    }

    // Status actions
    switch (action) {
      case "processing":
        update.status = "processing";
        update.processing_at = now;
        break;
      case "shipped":
        update.status = "shipped";
        update.shipped_at = now;
        break;
      case "delivered":
        update.status = "delivered";
        update.delivered_at = now;
        break;
      case "cancel":
        update.status = "cancelled";
        update.cancelled_at = now;
        break;
      case "refund":
        update.status = "refunded";
        update.refunded_at = now;
        break;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update", tid }, { status: 400 });
    }

// -------------------------------------------
// WRITE (vendor scoped)
// -------------------------------------------

// 🔍 DEBUG — CHECK WHAT ROW EXISTS
const { data: debugRow } = await supabase
  .from("orders")
  .select("order_number, vendor_id")
  .eq("order_number", orderId)
  .maybeSingle();

console.log(`[${tid}] DEBUG ROW:`, debugRow);
console.log(`[${tid}] DEBUG VENDOR:`, vendor.id);

const { data: updatedRows, error: updateErr } = await supabase
  .from("orders")
  .update(update)
  .eq("order_number", orderId)
  .eq("vendor_id", vendor.id)
  .select("id, status");

console.log(`[${tid}] UPDATE PAYLOAD:`, update);

if (updateErr) {
  console.error(`[${tid}] UPDATE ERROR`, updateErr);
  return NextResponse.json({ error: updateErr.message, tid }, { status: 500 });
}

if (!updatedRows || updatedRows.length === 0) {
  console.error(`[${tid}] NO ROWS UPDATED`, {
    orderId,
    vendorId: vendor.id,
    update,
  });
  return NextResponse.json({ error: "No rows updated", tid }, { status: 400 });
}

console.log(`[${tid}] UPDATED ROWS:`, updatedRows);

    // -------------------------------------------
    // RELOAD USING ADMIN (bypass RLS)
    // -------------------------------------------
    const { data: updated, error: reloadErr } = await supabaseAdmin
      .from("orders")
.select(`
  *,
  vendor:vendors (
    store_name,
    support_email
  ),
  order_items (
    id,
    quantity,
    unit_price,
    total_price,
    products (
      name,
      thumbnail_url
    )
  )
`)
      .eq("order_number", orderId)
      .maybeSingle();

    if (reloadErr || !updated) {
      console.error(`[${tid}] RELOAD ERROR`, reloadErr);
      return NextResponse.json(
        { error: "Failed to reload updated order", tid },
        { status: 500 }
      );
    }

    console.log(`[${tid}] RELOADED STATUS:`, updated.status);

    console.log(`[${tid}] ORDER UPDATE COMPLETE`);

const formatted = {
  ...updated,
  vendor: updated.vendor || {},
  order_items: updated.order_items?.map((i: any) => ({
    ...i,
    product_name: i.products?.name,
    thumbnail_url: i.products?.thumbnail_url,
  })),
};

return NextResponse.json({ success: true, order: formatted, tid });
  } catch (err: any) {
    console.error(`[FATAL ${tid}]`, err);
    return NextResponse.json({ error: err.message || "Server error", tid }, { status: 500 });
  }
}
