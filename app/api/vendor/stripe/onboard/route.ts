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
      .select("id, store_name, support_email, stripe_account_id")
      .eq("user_id", user.id)
      .single();

    if (error || !vendor) {
      return NextResponse.json(
        { error: "Vendor account not found" },
        { status: 404 }
      );
    }

    let stripeAccountId = vendor.stripe_account_id ?? null;
    let account: any = null;

    /*
    ----------------------------------------
    VALIDATE EXISTING ACCOUNT
    ----------------------------------------
    */

    if (stripeAccountId) {
      try {

        account = await stripe.accounts.retrieve(stripeAccountId);

        if (account.type !== "express") {

          await supabase
            .from("vendors")
            .update({ stripe_account_id: null })
            .eq("id", vendor.id);

          stripeAccountId = null;
          account = null;
        }

      } catch {

        await supabase
          .from("vendors")
          .update({ stripe_account_id: null })
          .eq("id", vendor.id);

        stripeAccountId = null;
        account = null;
      }
    }

    /*
    ----------------------------------------
    CREATE CONNECTED ACCOUNT
    ----------------------------------------
    */

    if (!stripeAccountId) {

      account = await stripe.accounts.create({
        type: "express",

        email: vendor.support_email ?? user.email ?? undefined,

        business_profile: {
          name: vendor.store_name ?? undefined,
        },

        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },

        metadata: {
          vendor_id: vendor.id,
          user_id: user.id,
        },
      });

      stripeAccountId = account.id;

      await supabase
        .from("vendors")
        .update({
          stripe_account_id: stripeAccountId,
        })
        .eq("id", vendor.id);
    }

    /*
    ----------------------------------------
    SYNC ACCOUNT STATUS
    ----------------------------------------
    */

    account = account ?? await stripe.accounts.retrieve(stripeAccountId);

    await supabase
      .from("vendors")
      .update({
        stripe_charges_enabled: account.charges_enabled ?? false,
        stripe_payouts_enabled: account.payouts_enabled ?? false,
        stripe_details_submitted: account.details_submitted ?? false,
        stripe_onboarded_at:
          account.details_submitted
            ? new Date().toISOString()
            : null,
      })
      .eq("id", vendor.id);

    /*
    ----------------------------------------
    IF FULLY CONNECTED
    ----------------------------------------
    */

    if (
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled
    ) {
      return NextResponse.json({
        message: "Stripe already connected",
        accountId: stripeAccountId,
      });
    }

    /*
    ----------------------------------------
    CREATE ONBOARDING LINK
    ----------------------------------------
    */

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/vendor/settings`,
      return_url: `${siteUrl}/vendor/dashboard?stripe=connected`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      url: accountLink.url,
      accountId: stripeAccountId,
    });

  } catch (error: any) {

    console.error("STRIPE ONBOARD ERROR:", error);

    return NextResponse.json(
      { error: error.message ?? "Stripe onboarding failed" },
      { status: 500 }
    );
  }
}