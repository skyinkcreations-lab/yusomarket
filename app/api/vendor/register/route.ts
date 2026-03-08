import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const form = await req.formData();

    const store_name = form.get("store_name") as string;
    const support_email = form.get("support_email") as string;
    const store_description = form.get("store_description") as string;
    const slug = form.get("slug") as string;

    const logoFile = form.get("store_logo") as File | null;
    const bannerFile = form.get("store_banner") as File | null;

    // AUTH
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // CHECK IF VENDOR ALREADY EXISTS
    const { data: existingVendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingVendor) {
      return NextResponse.json({
        success: true,
        redirectTo: "/vendor/dashboard",
      });
    }

    // UPGRADE PROFILE ROLE → vendor
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        role: "vendor",
      });
    } else {
      await supabase
        .from("profiles")
        .update({ role: "vendor" })
        .eq("id", user.id);
    }

    await supabase.auth.updateUser({
      data: { role: "vendor" },
    });

    // UPLOAD LOGO
    let logoUrl = null;

    if (logoFile) {
      const filePath = `logos/${user.id}-${logoFile.name}`;

      const upload = await supabase.storage
        .from("vendors-logos")
        .upload(filePath, logoFile, { upsert: true });

      if (upload.error) throw upload.error;

      const { data: publicData } = supabase.storage
        .from("vendors-logos")
        .getPublicUrl(filePath);

      logoUrl = publicData.publicUrl;
    }

    // UPLOAD BANNER
    let bannerUrl = null;

    if (bannerFile) {
      const filePath = `banners/${user.id}-${bannerFile.name}`;

      const upload = await supabase.storage
        .from("vendors-banners")
        .upload(filePath, bannerFile, { upsert: true });

      if (upload.error) throw upload.error;

      const { data: publicData } = supabase.storage
        .from("vendors-banners")
        .getPublicUrl(filePath);

      bannerUrl = publicData.publicUrl;
    }

    // INSERT VENDOR ACCOUNT
    const { error: vendorError } = await supabase.from("vendors").insert({
      user_id: user.id,
      store_name,
      support_email,
      store_description,
      slug,
      store_logo: logoUrl,
      store_banner: bannerUrl,
    });

    if (vendorError) throw vendorError;

    return NextResponse.json({
      success: true,
      redirectTo: "/vendor/dashboard",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
