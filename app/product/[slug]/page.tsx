// app/product/[slug]/page.tsx
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { supabaseServer } from "@/lib/supabaseServer";
import ProductClient from "./ProductClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await supabaseServer();

  // -------------------------------
  // PRODUCT
  // -------------------------------
const { data: bySlug, error: bySlugErr } = await supabase
  .from("products")
.select(`
  id,
  name,
  slug,
  status,
  price,
  original_price,
  description,
  thumbnail_url,
  gallery_urls,
  vendor_id,
  vendors (
  id,
  slug,
  store_name,
  store_logo,
  created_at,
  rating,
  reviews,
  sold
)
`)
  .eq("slug", slug)
  .maybeSingle();
  
let product = bySlug
  ? {
      ...bySlug,
      vendor: bySlug.vendors?.[0] ?? null,
      vendor_name: bySlug.vendors?.[0]?.store_name ?? null,
      main_image: bySlug.thumbnail_url || null,
    }
  : null;

if (!product) {
const { data: byId } = await supabase
  .from("products")
  .select(`
    id,
    name,
    slug,
    status,
    price,
    original_price,
    description,
    thumbnail_url,
    gallery_urls,
    vendor_id,
    vendors (
  id,
  slug,
  store_name,
  store_logo,
  created_at,
  rating,
  reviews,
  sold
)
  `)
  .eq("id", slug)
  .maybeSingle();

  if (byId) {
    product = {
      ...byId,
      vendor: byId.vendors?.[0] ?? null,
      vendor_name: byId.vendors?.[0]?.store_name ?? null,
      main_image: byId.thumbnail_url || null,
      gallery_urls: (byId as any).gallery_urls || [],
    };
  }
}

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-[50vh] flex items-center justify-center">
          <h1>Product not found</h1>
        </main>
        <Footer />
      </>
    );
  }

  // -------------------------------
  // REVIEWS
  // -------------------------------
const { data: reviews } = await supabase
  .from("reviews")
  .select(`id, product_id, user_id, rating, title, content, created_at`)
    .eq("product_id", product.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // -------------------------------
  // RECOMMENDED
  // -------------------------------
  const { data: recommendedProducts } = await supabase
    .from("products")
    .select(`id, name, slug, price, thumbnail_url`)
    .neq("id", product.id)
    .limit(10);

  // -------------------------------
  // VARIATIONS
  // -------------------------------
  const { data: variations } = await supabase
    .from("product_variations")
    .select("*")
    .eq("product_id", product.id)
    .eq("enabled", true);

  // -------------------------------
  // PRICE RANGE (for SEO & listing only)
  // -------------------------------
  let minPrice = product.price;
  let maxPrice = product.price;

  if (variations && variations.length > 0) {
    const prices = variations
      .map((v) => v.sale_price ?? v.regular_price)
      .filter((p) => p != null) as number[];

    if (prices.length) {
      minPrice = Math.min(...prices);
      maxPrice = Math.max(...prices);
    }
  }

  // -------------------------------
  // ATTRIBUTE MAP
  // -------------------------------
  const attributeMap: Record<string, string[]> = {};

  (variations || []).forEach((variation) => {
    let attrs = variation.attributes;

    if (typeof attrs === "string") {
      try {
        attrs = JSON.parse(attrs);
      } catch {
        attrs = {};
      }
    }

    Object.entries(attrs || {}).forEach(([key, value]) => {
      const k = key.trim();
      const v = String(value).trim();
      if (!attributeMap[k]) attributeMap[k] = [];
      if (!attributeMap[k].includes(v)) attributeMap[k].push(v);
    });
  });

  // -------------------------------
  // SERVER DATA
  // -------------------------------
  const serverData = {
    product,
    regularPrice: product.original_price ?? null,
    salePrice: product.price ?? null,
    mainImage: product.main_image,
    gallery: product.gallery_urls ?? [],
    variations: variations || [],
    attributeMap,
    minPrice,
    maxPrice,
    reviews: reviews || [],
    recommended: recommendedProducts || [],
  };

  return (
    <>
      <Header />
<ProductClient serverData={serverData} />
      <Footer />
    </>
  );
}
