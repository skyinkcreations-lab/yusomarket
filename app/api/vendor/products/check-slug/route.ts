// app/api/vendor/products/check-slug/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const productId = searchParams.get("productId"); // 🔥 new

    if (!slug) {
      return NextResponse.json(
        { available: false, error: "Missing slug" },
        { status: 200 }
      );
    }

    /** 
     * We query ALL products with the same slug.
     * Not maybeSingle() — because maybeSingle() hides duplicates and prevents exclusion.
     */
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug);

    if (error) {
      console.error("Slug check DB error:", error.message);
      return NextResponse.json(
        { available: false, error: error.message },
        { status: 200 }
      );
    }

    if (!data || data.length === 0) {
      // 🔥 No product uses this slug → available
      return NextResponse.json({ available: true, error: null }, { status: 200 });
    }

    if (data.length === 1 && productId && data[0].id === productId) {
      // 🔥 The ONLY product using this slug is the current product → available
      return NextResponse.json({ available: true, error: null }, { status: 200 });
    }

    // 🔥 Otherwise → slug is taken
    return NextResponse.json(
      { available: false, error: null },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("Slug check unexpected error:", err);

    // 🔥 Always return 200 (your UI depends on it)
    return NextResponse.json(
      {
        available: false,
        error: err?.message ?? "Unknown server error",
      },
      { status: 200 }
    );
  }
}
