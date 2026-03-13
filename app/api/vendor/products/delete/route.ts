import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId" },
        { status: 400 }
      );
    }

    // -------------------------------
    // AUTH CHECK
    // -------------------------------

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // -------------------------------
    // VERIFY VENDOR
    // -------------------------------

    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 403 }
      );
    }

    // -------------------------------
    // VERIFY PRODUCT OWNERSHIP
    // -------------------------------

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("vendor_id", vendor.id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found or not owned by vendor" },
        { status: 404 }
      );
    }

    // -------------------------------
    // DELETE DEPENDENT RECORDS
    // -------------------------------

    // remove cart items referencing this product
    await supabase
      .from("cart_items")
      .delete()
      .eq("product_id", productId);

    // remove product variations
    await supabase
      .from("product_variations")
      .delete()
      .eq("product_id", productId);

    // remove category links
    await supabase
      .from("product_category_links")
      .delete()
      .eq("product_id", productId);

    // remove tag links
    await supabase
      .from("product_tag_links")
      .delete()
      .eq("product_id", productId);

    // -------------------------------
    // DELETE PRODUCT
    // -------------------------------

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (err: any) {
    console.error("Delete product error:", err);

    return NextResponse.json(
      {
        error: err.message || "Failed deleting product",
      },
      { status: 500 }
    );
  }
}