import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email?.toLowerCase().trim();

    if (!email) {
      return Response.json(
        { success: false, error: "Email required" },
        { status: 400 }
      );
    }

    // Generate reset link from Supabase
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${siteUrl}/reset-password`,
      },
    });

    // Prevent email enumeration attacks
    if (error || !data?.properties?.action_link) {
      return Response.json({ success: true });
    }

    const resetLink = data.properties.action_link;

    // Send reset email via Resend
    await resend.emails.send({
      from: "YusoMarket <support@yusomarket.com>",
      to: email,
      subject: "Reset your YusoMarket password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">

          <h2 style="color:#111;">Reset your password</h2>

          <p>You requested a password reset for your YusoMarket account.</p>

          <p>Click the button below to set a new password.</p>

          <a 
            href="${resetLink}"
            style="
              display:inline-block;
              margin-top:20px;
              padding:12px 18px;
              background:#fc8700;
              color:#fff;
              border-radius:6px;
              text-decoration:none;
              font-weight:bold;
            "
          >
            Reset Password
          </a>

          <p style="margin-top:25px;font-size:13px;color:#666;">
            If you didn't request this, you can safely ignore this email.
          </p>

        </div>
      `,
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("Password reset error:", error);

    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}