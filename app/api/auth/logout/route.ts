// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    redirect: "/login",
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value;
          },
          set(name, value, options) {
            response.cookies.set(name, value, options);
          },
          remove(name, options) {
            response.cookies.set(name, "", {
              ...options,
              maxAge: 0,
            });
          },
        },
      }
    );

    await supabase.auth.signOut();

    // 🚨 kill Supabase auth cookie
    response.cookies.set(
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split(".")[0].split("//")[1]}-auth-token`,
      "",
      { path: "/", maxAge: 0 }
    );

    // 🚨 kill cart cookie so guest gets a NEW cart
    response.cookies.set("cart_id", "", {
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    console.error("Logout failed:", err);
    return response;
  }
}
