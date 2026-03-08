import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { users } = await req.json(); 
    // `users` should be an array of user IDs (UUIDs)

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "No user IDs provided." },
        { status: 400 }
      );
    }

    // Admin Supabase client (SERVICE KEY — server-side only)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // 🔥 MUST be service role
    );

    // Loop and delete
    for (const userId of users) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.log("Deleted user:", userId);
    }

    return NextResponse.json({
      success: true,
      deleted: users.length,
    });
  } catch (error) {
    console.error("Delete users error:", error);
    return NextResponse.json(
      { error: "Failed to delete users." },
      { status: 500 }
    );
  }
}
