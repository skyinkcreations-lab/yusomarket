// app/pageData.ts

export type CategoryPill = {
  id: string;
  label: string;
  href: string;
  slug?: string;            // ← THIS IS THE MISSING WIRE
  variant?: "vendors";
};

export type ProductVariant = {
  id: string;
  label: string;
  price: number;
  originalPrice: number | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string | null;
  thumbnailUrl: string | null;

  price: number;
  originalPrice: number | null;

  variants?: ProductVariant[];

  vendorName: string | null;
  vendorSlug: string | null;
};

export type VendorCardData = {
  id: string;
  storeName: string;
  slug: string | null;
  logoUrl: string | null;
  tagline: string | null;
};

export type BrandChip = {
  label: string;
  slug: string | null;
};

export const moreOffers = [
  {
    label: "End of season sale",
    color: "#ff4b8b",
    href: "/search?promo=sale",
  },
  {
    label: "Tech under $100",
    color: "#111827",
    href: "/search?category=electronics&max=100",
  },
  {
    label: "Home essentials",
    color: "#0ea5e9",
    href: "/search?category=home-living&tag=essential",
  },
  {
    label: "Fitness picks",
    color: "#22c55e",
    href: "/search?tag=fitness",
  },
];
