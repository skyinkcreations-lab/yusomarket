// proxy.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  // Public routes
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/auth",
    "/category",
    "/product",
    "/vendors",
    "/featured",
    "/store",
    "/deals",
  ];

  if (publicRoutes.some((p) => path.startsWith(p))) {
    return res;
  }

  // Supabase session
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session → redirect protected routes
  if (!user) {
    if (path.startsWith("/account")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/vendor")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  // Load role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "customer";

  // Admin block
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Vendor block
  if (path.startsWith("/vendor") && role !== "vendor") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/",                  // homepage
    "/admin/:path*",      // admin area
    "/vendor/:path*",     // vendor area
    "/account/:path*",    // account area
    "/checkout/:path*",   // checkout protection
  ],
};
