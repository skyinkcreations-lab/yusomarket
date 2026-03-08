import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the vendor owned by this user
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id, store_name, support_email, stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (vendorError) {
      return NextResponse.json({ error: vendorError.message }, { status: 500 });
    }

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor account not found" },
        { status: 404 }
      );
    }

    let stripeAccountId = vendor.stripe_account_id as string | null;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: {
            type: "express",
          },
          fees: {
            payer: "application",
          },
          losses: {
            payments: "application",
          },
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: vendor.store_name ?? undefined,
        },
        email: vendor.support_email ?? undefined,
        metadata: {
          vendor_id: vendor.id,
          user_id: user.id,
        },
      });

      stripeAccountId = account.id;

      const { error: updateError } = await supabase
        .from("vendors")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", vendor.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/vendor/stripe/refresh`,
      return_url: `${siteUrl}/vendor/dashboard?stripe=connected`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
    });
  } catch (error: any) {
    console.error("STRIPE ONBOARD ERROR:", error);
    return NextResponse.json(
      { error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}