import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  /**
   * ------------------------------------------------
   * Create Supabase SSR client
   * ------------------------------------------------
   */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /**
   * ------------------------------------------------
   * Get current user session
   * ------------------------------------------------
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /**
   * ------------------------------------------------
   * If no session → block protected routes
   * ------------------------------------------------
   */
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  /**
   * ------------------------------------------------
   * Read role from JWT metadata
   * (fast — no database query)
   * ------------------------------------------------
   */
  const role = user.app_metadata?.role || user.user_metadata?.role || "customer";

  /**
   * ------------------------------------------------
   * Admin protection
   * ------------------------------------------------
   */
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /**
   * ------------------------------------------------
   * Vendor protection
   * ------------------------------------------------
   */
  if (path.startsWith("/vendor") && role !== "vendor") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /**
   * ------------------------------------------------
   * Allow request
   * ------------------------------------------------
   */
  return res;
}

/**
 * ------------------------------------------------
 * Protected routes
 * ------------------------------------------------
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",
    "/account/:path*",
    "/checkout/:path*",
  ],
};