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

  /** --------------------------------------
   * 1️⃣ Sign in the user
   * -------------------------------------*/
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  const user = data.user;
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Login failed." },
      { status: 400 }
    );
  }

  /** --------------------------------------
   * 2️⃣ Ensure profile exists
   * -------------------------------------*/
  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle(); // << safe for "no rows"

  // If no profile exists → create one automatically
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        role: "user",
      })
      .select()
      .single();

    profile = newProfile;
  }

  const role = profile.role ?? "user";

  /** --------------------------------------
   * 3️⃣ Role-based redirect
   * -------------------------------------*/
  let redirect = "/account";
  if (role === "vendor") redirect = "/vendor/dashboard";
  if (role === "admin") redirect = "/admin";

  return NextResponse.json({ success: true, redirect });
}
