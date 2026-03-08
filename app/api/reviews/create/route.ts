import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {

  const supabase = await supabaseServer();

  const body = await req.json();

  const { product_id, rating, title, content } = body;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Login required" },
      { status: 401 }
    );
  }

  const { error } = await supabase
    .from("reviews")
    .insert({
      product_id,
      user_id: user.id,
      rating,
      title,
      content
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}