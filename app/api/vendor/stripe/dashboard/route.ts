import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    /*
    ----------------------------------------
    GET VENDOR
    ----------------------------------------
    */

    const { data: vendor, error } = await supabase
      .from("vendors")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!vendor?.stripe_account_id) {
      return NextResponse.json(
        { error: "Stripe not connected" },
        { status: 400 }
      );
    }

    /*
    ----------------------------------------
    CREATE EXPRESS LOGIN LINK
    ----------------------------------------
    */

    const loginLink = await stripe.accounts.createLoginLink(
      vendor.stripe_account_id
    );

    return NextResponse.json({
      url: loginLink.url,
    });

  } catch (error: any) {

    console.error("STRIPE DASHBOARD ERROR:", error);

    return NextResponse.json(
      { error: error.message ?? "Failed to open Stripe dashboard" },
      { status: 500 }
    );
  }
}