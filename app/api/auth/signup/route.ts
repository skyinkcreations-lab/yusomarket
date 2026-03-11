import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password required." },
        { status: 400 }
      );
    }

    /* --------------------------------
       1️⃣ Create auth user
    -------------------------------- */

    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: false,
      });

    if (createError) {
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 400 }
      );
    }

    const user = userData.user;

    /* --------------------------------
       2️⃣ Generate verification link
    -------------------------------- */

    const payload = {
      type: "signup",
      email: cleanEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
      },
    } as Parameters<typeof supabase.auth.admin.generateLink>[0];

    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink(payload);

    if (linkError) {
      return NextResponse.json(
        { success: false, error: linkError.message },
        { status: 400 }
      );
    }

    const verifyLink = linkData.properties.action_link;

    /* --------------------------------
       3️⃣ Send email via Resend
    -------------------------------- */

    await resend.emails.send({
      from: "YusoMarket <noreply@yusomarket.com>",
      to: cleanEmail,
      subject: "Verify your YusoMarket account",
      html: `
        <div style="font-family:Arial;padding:40px">
          <h2>Welcome to YusoMarket</h2>

          <p>Please verify your email to activate your account.</p>

          <a href="${verifyLink}"
             style="
                display:inline-block;
                margin-top:20px;
                padding:14px 24px;
                background:#ff7a00;
                color:#fff;
                border-radius:6px;
                text-decoration:none;
                font-weight:600;
             ">
             Verify Account
          </a>

          <p style="margin-top:20px;font-size:12px;color:#777">
            If you did not create this account you can safely ignore this email.
          </p>
        </div>
      `,
    });

    /* --------------------------------
       4️⃣ Create profile row
    -------------------------------- */

    await supabase.from("profiles").insert({
      id: user.id,
      email: cleanEmail,
      role: "user",
    });

    /* --------------------------------
       5️⃣ Success response
    -------------------------------- */

    return NextResponse.json({
      success: true,
      message: "Account created. Check your email to verify your account.",
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}