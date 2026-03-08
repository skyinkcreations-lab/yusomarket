// app/api/vendor/products/update/route.ts
// UPDATED — CLEAN — MATCHES EDIT PAGE — RLS SAFE — FULLY STABLE

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import slugify from "slugify";

function trace() {
  return Math.random().toString(36).slice(2, 10);
}

export async function POST(req: NextRequest) {
  const tid = trace();
  console.log(`[${tid}] UPDATE PRODUCT — START`);

  try {
    const supabase = await supabaseServer();
    const body = await req.json();

    const { productId, product, attributes, variations } = body;

    if (!productId)
      return NextResponse.json(
        { error: "Missing productId", tid },
        { status: 400 }
      );

    /* -------------------------------------------------------
       AUTH → must be vendor
    ------------------------------------------------------- */
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user)
      return NextResponse.json(
        { error: "Not authenticated", tid },
        { status: 401 }
      );

    const userId = auth.user.id;

    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!vendor)
      return NextResponse.json(
        { error: "Vendor profile not found", tid },
        { status: 403 }
      );

    const vendorId = vendor.id;

    /* -------------------------------------------------------
       PRODUCT OWNERSHIP VALIDATION
    ------------------------------------------------------- */
    const { data: existing } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (!existing)
      return NextResponse.json(
        { error: "Product not found", tid },
        { status: 404 }
      );

    if (existing.vendor_id !== vendorId)
      return NextResponse.json(
        { error: "Unauthorized", tid },
        { status: 403 }
      );

    /* -------------------------------------------------------
       SLUG HANDLING — same logic as your Create page
    ------------------------------------------------------- */
    const rawSlug = product.slug || product.name;
    const baseSlug = slugify(rawSlug, {
      lower: true,
      strict: true,
      trim: true,
    });

    let finalSlug = baseSlug;

    // Only check for duplicates if slug changed
    if (existing.slug !== baseSlug) {
      let i = 1;
      while (true) {
        const { count } = await supabase
          .from("products")
          .select("*", { head: true, count: "exact" })
          .eq("vendor_id", vendorId)
          .eq("slug", finalSlug);

        if (!count || count === 0) break;
        finalSlug = `${baseSlug}-${i++}`;
      }
    }

    /* -------------------------------------------------------
       UPDATE PRODUCT CORE DATA
    ------------------------------------------------------- */
const hasVariants = Array.isArray(variations) && variations.length > 0;

const updatePayload: any = {
  name: product.name?.trim() || "",
  slug: finalSlug,
  description: product.description || null,
  status: product.status || "draft",

  // media
  thumbnail_url: product.thumbnail_url || null,
  gallery_urls: product.gallery_urls ?? [],

  shipping_profile_id: product.shipping_profile_id
    ? Number(product.shipping_profile_id)
    : null,
};

/**
 * Only write base inventory when NO variants exist
 */
if (!hasVariants) {
  updatePayload.sku = product.sku || null;
  updatePayload.stock_qty =
    product.stock_qty !== undefined
      ? Number(product.stock_qty)
      : 0;
}

const { error: updateErr } = await supabase
  .from("products")
  .update(updatePayload)
  .eq("id", productId);


    if (updateErr) {
      console.error(`[${tid}] PRODUCT UPDATE ERROR`, updateErr);
      return NextResponse.json(
        { error: updateErr.message, tid },
        { status: 500 }
      );
    }
/* -------------------------------------------------------
   CATEGORY & TAG LINKS (REAL SOURCE OF TRUTH)
------------------------------------------------------- */

// wipe existing links safely
await supabase
  .from("product_category_links")
  .delete()
  .eq("product_id", productId)
  .throwOnError();

await supabase
  .from("product_tag_links")
  .delete()
  .eq("product_id", productId)
  .throwOnError();

// insert category links
if (product.category_ids?.length) {
  const categoryRows = product.category_ids.map((cid: string) => ({
    product_id: productId,
    category_id: cid,
  }));

  await supabase
    .from("product_category_links")
    .insert(categoryRows)
    .throwOnError();
}

// insert tag links
if (product.tag_ids?.length) {
  const tagRows = product.tag_ids.map((tid: string) => ({
    product_id: productId,
    tag_id: tid,
  }));

  await supabase
    .from("product_tag_links")
    .insert(tagRows)
    .throwOnError();
}

/* -------------------------------------------------------
   VARIATIONS — FULL WIPE & REINSERT
------------------------------------------------------- */

// 1️⃣ Delete old variants
await supabase
  .from("product_variations")
  .delete()
  .eq("product_id", productId)
  .throwOnError();

// 2️⃣ Insert new variants
if (variations?.length) {
  const rows = variations.map((v: any) => ({
    product_id: productId,
    title: v.title || "Variant",
    sku: v.sku || null,
    regular_price:
      v.regular_price !== null && v.regular_price !== undefined
        ? Number(v.regular_price)
        : null,
    sale_price:
      v.sale_price !== null && v.sale_price !== undefined
        ? Number(v.sale_price)
        : null,
    stock_qty:
      v.stock_qty !== null && v.stock_qty !== undefined
        ? Number(v.stock_qty)
        : 0,
    enabled: v.enabled ?? true,
    attributes: v.attributes || {},
  }));

  await supabase
    .from("product_variations")
    .insert(rows)
    .throwOnError();
}

/* -------------------------------------------------------
   COMPUTE PRODUCT PRICE FROM VARIANTS
------------------------------------------------------- */

const { data: liveVariants } = await supabase
  .from("product_variations")
  .select("regular_price, sale_price")
  .eq("product_id", productId)
  .eq("enabled", true);

if (liveVariants && liveVariants.length > 0) {
  const prices = liveVariants
    .map(v => v.sale_price && v.sale_price > 0 ? v.sale_price : v.regular_price)
    .filter(p => p != null && p > 0);

  const regulars = liveVariants
    .map(v => v.regular_price)
    .filter(p => p != null && p > 0);

  if (prices.length > 0) {
    const lowest = Math.min(...prices);
    const highestRegular = regulars.length ? Math.max(...regulars) : null;

    await supabase
      .from("products")
      .update({
        price: lowest,
        original_price:
          highestRegular && highestRegular > lowest
            ? highestRegular
            : null,
      })
      .eq("id", productId)
      .throwOnError();
  }
}



    /* -------------------------------------------------------
       DONE
    ------------------------------------------------------- */
    console.log(`[${tid}] PRODUCT UPDATE — COMPLETE`);
    return NextResponse.json({ success: true, tid }, { status: 200 });

  } catch (err: any) {
    console.error(`[FATAL ${tid}]`, err);
    return NextResponse.json(
      { error: err.message || "Unexpected server error", tid },
      { status: 500 }
    );
  }
}
