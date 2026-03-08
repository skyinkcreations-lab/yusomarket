import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  const body = await req.json();

  const { data, error } = await supabase
    .from("homepage_settings")
    .update({
      hero_image_url: body.hero_image_url,
      promo_banner_1: body.promo_banner_1,
      promo_banner_2: body.promo_banner_2,
      promo_banner_3: body.promo_banner_3,
      trending_title: body.trending_title,
      featured_title: body.featured_title,
      flash_title: body.flash_title
    })
    .eq("id", 1);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
