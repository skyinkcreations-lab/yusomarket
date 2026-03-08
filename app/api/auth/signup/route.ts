import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  /** ------------------------------------------
   * 1️⃣ CREATE AUTH USER
   * -----------------------------------------*/
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  const user = data.user;

  // User must verify email before login
  if (!user) {
    return NextResponse.json(
      {
        success: true,
        message: "Signup successful. Please verify your email.",
      },
      { status: 200 }
    );
  }

  /** ------------------------------------------
   * 2️⃣ INSERT PROFILE ROW
   * -----------------------------------------*/
  const { error: profileErr } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      role: "user",
    });

  if (profileErr) {
    console.error("Profile insert failed:", profileErr);
    // still allow signup, but notify client
  }

  /** ------------------------------------------
   * 3️⃣ RETURN SUCCESS
   * -----------------------------------------*/
  return NextResponse.json(
    {
      success: true,
      message: "Account created! Please verify your email before signing in.",
    },
    { status: 200 }
  );
}
