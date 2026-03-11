import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {

  const { email } = await req.json();

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: "https://www.yusomarket.com/reset-password",
    },
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const resetLink = data.properties.action_link;

  await resend.emails.send({
    from: "YusoMarket <support@yusomarket.com>",
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Reset your password</h2>
      <p>You requested a password reset.</p>

      <a href="${resetLink}" 
         style="
         background:#fc8700;
         padding:12px 18px;
         color:white;
         border-radius:6px;
         text-decoration:none;
         display:inline-block;">
         Reset Password
      </a>

      <p>If you didn't request this, ignore this email.</p>
    `,
  });

  return Response.json({ success: true });
}