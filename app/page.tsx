// app/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";
import HomeClient from "./HomeClient";
import {
  CategoryPill,
  Product,
  VendorCardData,
  BrandChip,
} from "./pageData";

type ProductRow = {
  id: string;
  name: string;
  slug: string | null;
  price: number;
  original_price: number | null;
  thumbnail_url: string | null;
  created_at: string;
  vendor: {
    id: string;
    store_name: string;
    slug: string | null;
  } | null;
  variants?: {
  id: string;
  title: string;
  regular_price: number;
  sale_price: number | null;
}[];
};


type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type VendorRow = {
  id: string;
  store_name: string;
  slug: string | null;
  logo_url: string | null;
  bio: string | null;
  status: string | null;
};

function mapProductRow(p: ProductRow): Product {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    thumbnailUrl: p.thumbnail_url,
    price: Number(p.price),
    originalPrice:
      p.original_price !== null ? Number(p.original_price) : null,
    vendorName: p.vendor?.store_name ?? null,
    vendorSlug: p.vendor?.slug ?? null,
    created_at: p.created_at,

    variants: p.variants?.map(v => ({
  id: v.id,
  label: v.title,
  price: Number(v.sale_price ?? v.regular_price),
  originalPrice:
    v.sale_price !== null ? Number(v.regular_price) : null,
})) ?? [],
  };
}


export default async function MarketplaceHome() {
  const supabase = await supabaseServer();

  // Categories
  const { data: catRowsRaw } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const catRows = (catRowsRaw ?? []) as CategoryRow[];

const categories: CategoryPill[] = [
  ...catRows.map((c) => ({
    id: c.id,
    label: c.name,
    slug: c.slug, // ✅ REQUIRED
    href: `/category/${c.slug}`,
  })),
  {
    id: "vendors",
    label: "Shop Vendors",
    href: "/vendors",
    variant: "vendors" as const,
  },
];

  // Products
const { data: productRowsRaw, error } = await supabase
  .from("products")
  .select(`
  id,
  name,
  slug,
  price,
  original_price,
  thumbnail_url,
  created_at,
    vendor:vendors (
      id,
      store_name,
      slug
    ),
    variants:product_variations (
  id,
  title,
  regular_price,
  sale_price
)
  `)
  .eq("status", "published")
  .order("created_at", { ascending: false })
  .limit(70);


if (error) {
  console.error("PRODUCT FETCH ERROR:", error);
}

  const productRows = (productRowsRaw ?? []) as ProductRow[];

  const mappedProducts: Product[] = productRows.map(mapProductRow);

  const latestProducts = mappedProducts;

  // Best sellers – random slice from all published for now
  const shuffled = [...mappedProducts].sort(() => Math.random() - 0.5);
  const bestSellerProducts = shuffled.slice(0, 12);

  // Vendors
  const { data: vendorRowsRaw } = await supabase
    .from("vendors")
    .select("id, store_name, slug, logo_url, bio, status")
    .eq("status", "active")
    .limit(12);

  const vendorRows = (vendorRowsRaw ?? []) as VendorRow[];

  const topVendors: VendorCardData[] = vendorRows.map((v) => ({
    id: v.id,
    storeName: v.store_name,
    slug: v.slug,
    logoUrl: v.logo_url,
    tagline: v.bio,
  }));

  // Popular brands = top vendors
  const brandChips: BrandChip[] = topVendors.slice(0, 8).map((v) => ({
    label: v.storeName,
    slug: v.slug,
  }));

  return (
    <HomeClient
      categories={categories}
      latestProducts={latestProducts}
      bestSellerProducts={bestSellerProducts}
      topVendors={topVendors}
      brandChips={brandChips}
    />
  );
}
