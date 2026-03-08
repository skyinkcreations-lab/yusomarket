// app/api/vendor/products/create/route.ts
// FINAL — CORRECT — MATCHES CREATE PAGE + DB SCHEMA

import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import slugify from "slugify";

function generateTraceId() {
  return Math.random().toString(36).substring(2, 10);
}

/* ---------------------------------------------------------
   ENSURE SLUG UNIQUENESS PER VENDOR
--------------------------------------------------------- */
async function ensureUniqueSlug(supabase: any, baseSlug: string, vendorId: string) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const { count } = await supabase
      .from("products")
      .select("*", { head: true, count: "exact" })
      .eq("vendor_id", vendorId)
      .eq("slug", slug);

    if (!count || count === 0) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/* ---------------------------------------------------------
   ROUTE
--------------------------------------------------------- */
export async function POST(req: NextRequest) {
  const traceId = generateTraceId();
  console.log(`[${traceId}] Create product request received`);

  try {
    const supabase = await supabaseServer();
    const body = await req.json();

    /* -----------------------------------------------------
       USER → VENDOR VALIDATION
    ----------------------------------------------------- */
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      return NextResponse.json({ error: "Not authenticated", traceId }, { status: 401 });
    }

    const userId = auth.user.id;

    const { data: vendorRow } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!vendorRow) {
      return NextResponse.json(
        { error: "Vendor account not found.", traceId },
        { status: 400 }
      );
    }

    const vendorId = vendorRow.id;

/* -----------------------------------------------------
   VALIDATE PRODUCT INPUT
----------------------------------------------------- */

const product = body.product;

const hasVariants = Array.isArray(body.variations) && body.variations.length > 0;

if (!product) {
  return NextResponse.json(
    { error: "Missing product object.", traceId },
    { status: 400 }
  );
}

// normalize arrays AFTER we know product exists
product.category_ids = product.category_ids || [];
product.tag_ids = product.tag_ids || [];

if (!product.name?.trim()) {
  return NextResponse.json(
    { error: "Product name required.", traceId },
    { status: 400 }
  );
}

if (!hasVariants && (!product.price || Number(product.price) <= 0)) {
  return NextResponse.json(
    { error: "Product price required.", traceId },
    { status: 400 }
  );
}



    /* -----------------------------------------------------
       SLUGIFY + ENSURE UNIQUE
    ----------------------------------------------------- */
    const baseSlug = slugify(product.slug || product.name, {
      lower: true,
      strict: true,
      trim: true,
    });

   const finalSlug = await ensureUniqueSlug(supabase, baseSlug, vendorId);

    /* -----------------------------------------------------
       INSERT PRODUCT
    ----------------------------------------------------- */
    const { data: inserted, error: insertErr } = await supabase
      .from("products")
      .insert({
        vendor_id: vendorId,
        name: product.name,
        slug: finalSlug,
        description: product.description || null,
        status: product.status || "draft",

// pricing (ALWAYS REQUIRED)
price: product.price,
original_price: product.original_price ?? null,


// inventory (only if NO variants)
sku: hasVariants ? null : product.sku || null,
stock_qty: hasVariants ? null : product.stock_qty ?? 0,
manage_stock: !hasVariants,
        currency: "AUD",

        // media
        thumbnail_url: product.thumbnail_url || null,
        gallery_urls: product.gallery_urls ?? [],

       // taxonomies
brand_id: product.brand_id ?? null,
shipping_profile_id: product.shipping_profile_id
  ? Number(product.shipping_profile_id)
  : null,


        // metadata
        metadata: product.metadata ?? {},
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error(`[${traceId}] Product insert failed`, insertErr);
      return NextResponse.json(
        { error: insertErr.message, traceId },
        { status: 500 }
      );
    }

    const productId = inserted.id;

    /* -----------------------------------------------------
   INSERT CATEGORY LINKS
----------------------------------------------------- */
if (Array.isArray(product.category_ids) && product.category_ids.length > 0) {
const rows = product.category_ids.map((categoryId: string) => ({
  product_id: productId,
  category_id: categoryId,
}));


  const { error: catErr } = await supabase
    .from("product_category_links")
    .insert(rows);

  if (catErr) {
    console.error(`[${traceId}] Category link insert failed`, catErr);
    return NextResponse.json(
      { error: catErr.message, traceId },
      { status: 500 }
    );
  }
}

/* -----------------------------------------------------
   INSERT TAG LINKS
----------------------------------------------------- */
if (Array.isArray(product.tag_ids) && product.tag_ids.length > 0) {
const rows = product.tag_ids.map((tagId: string) => ({
  product_id: productId,
  tag_id: tagId,
}));


  const { error: tagErr } = await supabase
    .from("product_tag_links")
    .insert(rows);

  if (tagErr) {
    console.error(`[${traceId}] Tag link insert failed`, tagErr);
    return NextResponse.json(
      { error: tagErr.message, traceId },
      { status: 500 }
    );
  }
}

    /* -----------------------------------------------------
       INSERT VARIANTS
    ----------------------------------------------------- */
    if (Array.isArray(body.variations) && body.variations.length > 0) {
      const variantRows = body.variations.map((v: any) => ({
        product_id: productId,
        title: v.title,
        sku: v.sku || null,
        regular_price: v.regular_price ?? null,
        sale_price: v.sale_price ?? null,
        stock_qty: v.stock_qty ?? 0,
        enabled: v.enabled ?? true,
        attributes: v.attributes ?? {},  // FIXED — include the matrix
      }));

      const { error: varErr } = await supabase
        .from("product_variations")
        .insert(variantRows);

      if (varErr) {
        console.error(`[${traceId}] Variant insert failed`, varErr);
        return NextResponse.json(
          { error: varErr.message, traceId },
          { status: 500 }
        );
      }
    }

    /* -----------------------------------------------------
       SUCCESS
    ----------------------------------------------------- */
    return NextResponse.json(
      { success: true, productId, traceId },
      { status: 200 }
    );
  } catch (err: any) {
    console.error(`[${traceId}] Fatal error`, err);
    return NextResponse.json(
      { error: err.message || "Unexpected error.", traceId },
      { status: 500 }
    );
  }
}
