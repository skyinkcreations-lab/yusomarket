// app/vendor/products/edit/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { Loader2, Upload } from "lucide-react";

type Status = "draft" | "published";
type ProductDataTab = "general" | "inventory" | "variations" | "shipping";
type SlugStatus = "idle" | "checking" | "available" | "taken";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };
type Brand = { id: string; name: string };
type ShippingProfile = {
  id: string | number;
  name: string;
  region: string;
  standard_cost: number | null;
  express_cost: number | null;
  free_shipping_threshold: number | null;
};


type Attribute = {
  id: string;
  name: string;
  values: string[];
};

type VariantRow = {
  id: string;
  key: string;
  label: string;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stockQty: string;
  enabled: boolean;
  attributes: Record<string, string>;
};

type ToastState = { type: "success" | "error"; message: string } | null;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ⭐ NEW FUNCTION — UNIQUE SLUG GENERATOR
function generateUniqueSlug(title: string): string {
  const base = slugify(title);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${base}-${rand}`;
}

function parseMoney(value: string): number | null {
  if (!value || !value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseIntSafe(value: string, fallback = 0): number {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function variantSignature(attrs: Record<string, string>): string {
  const entries = Object.entries(attrs).sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}:${v}`).join("|");
}

function randomId(prefix = "tmp"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const supabase = supabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [activeTab, setActiveTab] = useState<ProductDataTab>("general");

  const [vendorId, setVendorId] = useState<string | null>(null);

  const [status, setStatus] = useState<Status>("draft");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugDirty, setSlugDirty] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stockQty, setStockQty] = useState("");

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [shippingProfiles, setShippingProfiles] = useState<ShippingProfile[]>([]);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedShippingProfileId, setSelectedShippingProfileId] = useState<number | null>(null);
  
  const [showShippingModal, setShowShippingModal] = useState(false);
const [creatingShipping, setCreatingShipping] = useState(false);

const [newShipping, setNewShipping] = useState({
  name: "",
  region: "metro",
  standard_cost: "",
  express_cost: "",
  free_shipping_threshold: "",
});

  const selectedShippingProfile = shippingProfiles.find(
  (p) => Number(p.id) === selectedShippingProfileId
);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [addingBrand, setAddingBrand] = useState(false);

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [newValueByAttr, setNewValueByAttr] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          router.push("/login");
          return;
        }

        const userId = auth.user.id;

        const { data: vendor } = await supabase
          .from("vendors")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (!vendor) {
          router.push("/sell");
          return;
        }

        setVendorId(vendor.id);

        const { data: product, error: prodErr } = await supabase
          .from("products")
          .select("*, product_variations(*)")
          .eq("id", productId)
          .eq("vendor_id", vendor.id)
          .maybeSingle();

        if (prodErr || !product) {
          console.error("Product load error:", prodErr);
          setToast({ type: "error", message: "Unable to load product." });
          return;
        }

        setName(product.name ?? "");
        setSlug(product.slug ?? "");
        setSlugDirty(false);
        setDescription(product.description ?? "");
        setStatus((product.status as Status) ?? "draft");

        const dbPrice = product.price !== null && product.price !== undefined ? String(product.price) : "";
        const dbOriginal =
          product.original_price !== null && product.original_price !== undefined
            ? String(product.original_price)
            : "";

        if (dbOriginal) {
          setRegularPrice(dbOriginal);
          setSalePrice(dbPrice || "");
        } else {
          setRegularPrice(dbPrice);
          setSalePrice("");
        }

        setSku(product.sku ?? "");
        setStockQty(
          product.stock_qty !== null && product.stock_qty !== undefined
            ? String(product.stock_qty)
            : ""
        );

        const mainImageUrl =
          product.thumbnail_url ||
          product.primary_image_url ||
          product.primary_image ||
          null;

        if (mainImageUrl) setThumbnailPreview(mainImageUrl);

        if (Array.isArray(product.gallery_urls)) {
          setExistingGalleryUrls(product.gallery_urls);
        } else {
          setExistingGalleryUrls([]);
        }
        setNewGalleryFiles([]);
        setNewGalleryPreviews([]);

const [{ data: pc }, { data: pt }] = await Promise.all([
  supabase
    .from("product_category_links")
    .select("category_id")
    .eq("product_id", productId),
  supabase
    .from("product_tag_links")
    .select("tag_id")
    .eq("product_id", productId),
]);


setSelectedCategoryIds(
  pc?.map((x: { category_id: string }) => x.category_id) ?? []
);

setSelectedTagIds(
  pt?.map((x: { tag_id: string }) => x.tag_id) ?? []
);
setSelectedBrandId(product.brand_id ?? null);
setSelectedShippingProfileId(
  product.shipping_profile_id ? Number(product.shipping_profile_id) : null
);


        const dbVariations: any[] = product.product_variations ?? [];

        if (dbVariations.length > 0) {
          const attrMap = new Map<string, Set<string>>();

          dbVariations.forEach((v) => {
            const attrs = v.attributes || {};
            Object.entries(attrs).forEach(([k, val]) => {
              if (!attrMap.has(k)) attrMap.set(k, new Set());
              attrMap.get(k)!.add(String(val));
            });
          });

          const attrArray: Attribute[] = Array.from(attrMap.entries()).map(
            ([name, set]) => ({
              id: randomId("attr"),
              name,
              values: Array.from(set),
            })
          );

          setAttributes(attrArray);

          const vs: VariantRow[] = dbVariations.map((v) => {
            const attrs = v.attributes || {};
            const key = variantSignature(attrs);
            const label =
              Object.keys(attrs).length > 0
                ? Object.entries(attrs)
                    .map(([k, val]) => `${k}: ${val}`)
                    .join(" / ")
                : v.title ?? "Variant";

            return {
              id: String(v.id),
              key,
              label,
              sku: v.sku ?? "",
              regularPrice:
                v.regular_price !== null && v.regular_price !== undefined
                  ? String(v.regular_price)
                  : "",
              salePrice:
                v.sale_price !== null && v.sale_price !== undefined
                  ? String(v.sale_price)
                  : "",
              stockQty:
                v.stock_qty !== null && v.stock_qty !== undefined
                  ? String(v.stock_qty)
                  : "",
              enabled: typeof v.enabled === "boolean" ? v.enabled : true,
              attributes: attrs,
            };
          });

          setVariants(vs);
        }

const [{ data: cat }, { data: tg }, { data: br }] = await Promise.all([
  supabase
    .from("vendor_categories")
    .select("id,name")
    .eq("vendor_id", vendor.id)
    .order("name"),
  supabase
    .from("vendor_tags")
    .select("id,name")
    .eq("vendor_id", vendor.id)
    .order("name"),
  supabase
    .from("vendor_brands")
    .select("id,name")
    .eq("vendor_id", vendor.id)
    .order("name"),
]);



        if (cat) setCategories(cat);
        if (tg) setTags(tg);
        if (br) setBrands(br);

const { data: shp } = await supabase
  .from("shipping_profiles")
  .select("id,name,region,standard_cost,express_cost,free_shipping_threshold")
  .eq("vendor_id", vendor.id)
  .order("name", { ascending: true });


        if (shp) setShippingProfiles(shp);
      } catch (err) {
        console.error(err);
        setToast({ type: "error", message: "Unexpected error loading product." });
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // ============================================
  // ⭐ SLUG CHECKER
  // ============================================
  useEffect(() => {
    if (!slug.trim()) {
      setSlugStatus("idle");
      setSlugError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setSlugStatus("checking");
    setSlugError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          slug: slug,
          productId: productId,
        });

        const res = await fetch(
          `/api/vendor/products/check-slug?` + params.toString(),
          { signal: controller.signal }
        );

        const data = await res.json();
        if (cancelled) return;

        if (data.available) {
          setSlugStatus("available");
          setSlugError(null);
        } else {
          setSlugStatus("taken");
          setSlugError("This URL slug is already in use (other product).");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Slug check error:", err);
        setSlugStatus("idle");
      }
    }, 400);

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [slug, productId]);

  // ============================================
  // ⭐ UPDATED NAME CHANGE → UNIQUE SLUG
  // ============================================
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    if (!slugDirty) {
      setSlug(generateUniqueSlug(value)); // <-- NEW
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = Math.max(5 - existingGalleryUrls.length, 0);
    if (remainingSlots <= 0) return;

    const incoming = files.slice(0, remainingSlots);
    const combinedFiles = [...newGalleryFiles, ...incoming];

    const maxNewAllowed = Math.max(5 - existingGalleryUrls.length, 0);
    const finalFiles = combinedFiles.slice(0, maxNewAllowed);

    setNewGalleryFiles(finalFiles);
    setNewGalleryPreviews(finalFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleRemoveExistingGalleryImage = (url: string) => {
    setExistingGalleryUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleRemoveNewGalleryImage = (idx: number) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

const handleAddCategory = async () => {
  const value = newCategoryName.trim();
  if (!value || addingCategory || !vendorId) return;

  const slug = slugify(value);
  setAddingCategory(true);

  try {
    const { data, error } = await supabase
      .from("vendor_categories")
      .insert({
        name: value,
        slug,
        vendor_id: vendorId,
      })
      .select("id,name")
      .single();

    if (error) throw error;

    setCategories((prev) => [...prev, data]);
    setSelectedCategoryIds((prev) => [...prev, data.id]);
    setNewCategoryName("");
  } catch (err: any) {
    console.error(err);
    setToast({ type: "error", message: err.message || "Failed to add category" });
  } finally {
    setAddingCategory(false);
  }
};


const handleAddBrand = async () => {
  const value = newBrandName.trim();
  if (!value || addingBrand || !vendorId) return;

  setAddingBrand(true);
  try {
    const { data, error } = await supabase
      .from("vendor_brands")
      .insert({
        name: value,
        slug: slugify(value),
        vendor_id: vendorId,
      })
      .select("id,name")
      .single();

    if (error) throw error;

    setBrands((prev) => [...prev, data]);
    setSelectedBrandId(data.id);
    setNewBrandName("");
  } catch (err: any) {
    setToast({ type: "error", message: err.message || "Failed to add brand" });
  } finally {
    setAddingBrand(false);
  }
};

const handleAddTag = async () => {
  const value = newTagName.trim();
  if (!value || addingTag || !vendorId) return;

  setAddingTag(true);
  try {
    const { data, error } = await supabase
      .from("vendor_tags")
      .insert({
        name: value,
        slug: slugify(value),
        vendor_id: vendorId,
      })
      .select("id,name")
      .single();

    if (error) throw error;

    setTags((prev) => [...prev, data]);
    setSelectedTagIds((prev) => [...prev, data.id]);
    setNewTagName("");
  } catch (err: any) {
    console.error(err);
    setToast({ type: "error", message: err.message || "Failed to add tag" });
  } finally {
    setAddingTag(false);
  }
};

  const recomputeVariants = (nextAttrs: Attribute[]) => {
    const existingMap = new Map(variants.map((v) => [v.key, v]));

    const nonEmptyAttrs = nextAttrs.filter(
      (a) => a.name.trim() && a.values.length > 0
    );

    if (nonEmptyAttrs.length === 0) {
      setVariants([]);
      return;
    }

    const combos: { attributes: Record<string, string> }[] = [];

    const dfs = (idx: number, acc: Record<string, string>) => {
      if (idx === nonEmptyAttrs.length) {
        combos.push({ attributes: { ...acc } });
        return;
      }
      const attr = nonEmptyAttrs[idx];
      for (const val of attr.values) {
        acc[attr.name] = val;
        dfs(idx + 1, acc);
      }
    };

    dfs(0, {});

    const newVariants: VariantRow[] = combos.map((c) => {
      const key = variantSignature(c.attributes);
      const existing = existingMap.get(key);

      const label = Object.entries(c.attributes)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" / ");

      if (existing) {
        return { ...existing, key, label, attributes: c.attributes };
      }

      return {
        id: randomId("var"),
        key,
        label,
        sku: "",
        regularPrice: "",
        salePrice: "",
        stockQty: "",
        enabled: true,
        attributes: c.attributes,
      };
    });

    setVariants(newVariants);
  };

  const addNewAttribute = () => {
    const next = [...attributes, { id: randomId("attr"), name: "", values: [] }];
    setAttributes(next);
  };

  const updateAttributeName = (idx: number, name: string) => {
    const next = [...attributes];
    next[idx] = { ...next[idx], name };
    setAttributes(next);
    recomputeVariants(next);
  };

  const addAttributeValue = (idx: number) => {
    const attr = attributes[idx];
    const val = (newValueByAttr[attr.id] ?? "").trim();
    if (!val) return;

    const next = [...attributes];
    const set = new Set(next[idx].values);
    set.add(val);
    next[idx] = { ...next[idx], values: Array.from(set) };
    setAttributes(next);
    setNewValueByAttr((prev) => ({ ...prev, [attr.id]: "" }));
    recomputeVariants(next);
  };

  const deleteAttributeValue = (idx: number, vIdx: number) => {
    const next = [...attributes];
    next[idx] = {
      ...next[idx],
      values: next[idx].values.filter((_, i) => i !== vIdx),
    };
    setAttributes(next);
    recomputeVariants(next);
  };

  const deleteAttribute = (idx: number) => {
    const next = attributes.filter((_, i) => i !== idx);
    setAttributes(next);
    recomputeVariants(next);
  };

  const updateVariantField = (id: string, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const validate = (): boolean => {
    const errs: string[] = [];

    if (!name.trim()) errs.push("Product name is required.");
    if (!slug.trim()) errs.push("Slug is required.");
    if (slugStatus === "taken")
      errs.push("Slug is already taken. Choose a different URL slug.");
    if (!regularPrice.trim()) errs.push("Regular price is required.");
    if (!sku.trim()) errs.push("SKU is required.");
    if (!stockQty.trim()) errs.push("Stock quantity is required.");

    const reg = parseMoney(regularPrice);
    const sale = parseMoney(salePrice || "");

    if (!reg) errs.push("Regular price must be positive.");
    if (sale && reg && sale >= reg)
      errs.push("Sale price must be lower than regular price.");

    if (reg) {
      variants.forEach((v) => {
        const variantReg = parseMoney(v.regularPrice || "") ?? reg;
        const variantSale = parseMoney(v.salePrice || "");

        if (variantSale && variantReg && variantSale >= variantReg) {
          errs.push(
            `Variant "${v.label}" sale price must be lower than its regular price.`
          );
        }
      });
    }

    setErrors(errs);
    return errs.length === 0;
  };

  const handleSave = async () => {
    setToast(null);
    if (!validate()) {
      setToast({ type: "error", message: "Fix the errors before saving." });
      return;
    }

    try {
      setSaving(true);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error("You must be logged in.");
      const userId = auth.user.id;

      let thumbnailUrl = thumbnailPreview;
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split(".").pop();
        const path = `products/${userId}/thumb_${productId}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("public-images")
          .upload(path, thumbnailFile, { upsert: true });

        if (upErr) throw new Error("Failed uploading image.");

        const { data: pub } = supabase.storage
          .from("public-images")
          .getPublicUrl(path);
        thumbnailUrl = pub.publicUrl;
      }

      let galleryUrls = [...existingGalleryUrls];

      for (const file of newGalleryFiles) {
        const ext = file.name.split(".").pop();
        const path = `products/${userId}/gallery_${productId}_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;

        const { error: gErr } = await supabase.storage
          .from("public-images")
          .upload(path, file, { upsert: true });

        if (gErr) throw new Error("Failed uploading gallery image.");

        const { data: gPub } = supabase.storage
          .from("public-images")
          .getPublicUrl(path);

        if (gPub?.publicUrl) galleryUrls.push(gPub.publicUrl);
      }


      const variantPayload = variants.map((v) => ({
        id: v.id.startsWith("var_") || v.id.startsWith("tmp_") ? null : v.id,
        title: v.label,
        sku: v.sku || null,
        regular_price: parseMoney(v.regularPrice || ""),
        sale_price: parseMoney(v.salePrice || ""),
        stock_qty: parseIntSafe(v.stockQty || "0", 0),
        enabled: v.enabled,
        attributes: v.attributes,
      }));

      const finalSlug = slug.trim() ? slug : generateUniqueSlug(name);

      const res = await fetch("/api/vendor/products/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          product: {
  name: name.trim(),
  slug: finalSlug,
  description: description.trim(),
  status,
  thumbnail_url: thumbnailUrl,
  gallery_urls: galleryUrls,
  category_ids: selectedCategoryIds,
  tag_ids: selectedTagIds,
  brand_id: selectedBrandId,
  shipping_profile_id: selectedShippingProfileId,

  // 🔥 THESE WERE MISSING
  sku: sku.trim() || null,
  stock_qty: stockQty !== "" ? Number(stockQty) : null,
},

          attributes,
          variations: variantPayload,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed updating product.");
      }

      setToast({ type: "success", message: "Product updated." });
      setTimeout(() => router.push("/vendor/products"), 800);
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: err?.message || "Unexpected error." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
  const confirmDelete = confirm(
    "Delete this product permanently? This cannot be undone."
  );

  if (!confirmDelete) return;

  try {
    setSaving(true);

    const res = await fetch("/api/vendor/products/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed deleting product");
    }

    setToast({ type: "success", message: "Product deleted." });

    setTimeout(() => {
      router.push("/vendor/products");
    }, 600);
  } catch (err: any) {
    console.error(err);
    setToast({
      type: "error",
      message: err?.message || "Delete failed.",
    });
  } finally {
    setSaving(false);
  }
};

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 14,
  };

  const sectionCard: React.CSSProperties = {
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: 18,
  };

  const tabButton = (tab: ProductDataTab, label: string) => {
    const active = activeTab === tab;
    return (
      <button
        key={tab}
        type="button"
        onClick={() => setActiveTab(tab)}
        style={{
          padding: "6px 14px",
          borderRadius: 999,
          border: active ? "1px solid #111" : "1px solid #d1d5db",
          background: active ? "#111" : "#f3f4f6",
          color: active ? "#fff" : "#111827",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {label}
      </button>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <main
          style={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader2
            style={{
              width: 28,
              height: 28,
              animation: "spin 1s linear infinite",
            }}
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div
        style={{
          background: "linear-gradient(135deg, #f9fafb, #eef2ff)",
          padding: "48px 20px",
          textAlign: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            letterSpacing: "-0.04em",
          }}
        >
          Edit Product
        </h1>
      </div>

      <main
        style={{
          maxWidth: 1200,
          margin: "30px auto 60px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            <span style={{ fontWeight: 600 }}>Product ID:</span> {productId}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              style={{
                ...inputStyle,
                width: "auto",
                minWidth: 160,
                padding: "8px 10px",
              }}
            >
              <option value="draft">Save as draft</option>
              <option value="published">Publish immediately</option>
            </select>

            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "9px 18px",
                borderRadius: 999,
                border: "none",
                background: "#111827",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Save product"}
            </button>
            <button
  onClick={handleDelete}
  disabled={saving}
  style={{
    padding: "9px 18px",
    borderRadius: 999,
    border: "1px solid #ef4444",
    background: "#ef4444",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: saving ? "not-allowed" : "pointer",
    opacity: saving ? 0.7 : 1,
  }}
>
  Delete product
</button>
          </div>
        </div>

        {toast && (
          <div
            style={{
              marginBottom: 18,
              padding: "10px 12px",
              borderRadius: 10,
              border:
                toast.type === "success"
                  ? "1px solid #22c55e"
                  : "1px solid #ef4444",
              background:
                toast.type === "success"
                  ? "rgba(34,197,94,0.06)"
                  : "rgba(248,113,113,0.06)",
              fontSize: 13,
            }}
          >
            {toast.message}
          </div>
        )}

        {errors.length > 0 && (
          <div
            style={{
              ...sectionCard,
              marginBottom: 20,
              borderColor: "#fecaca",
              background: "#fef2f2",
            }}
          >
            <strong
              style={{
                display: "block",
                marginBottom: 6,
                color: "#b91c1c",
                fontSize: 13,
              }}
            >
              You need to fix these first:
            </strong>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: 13,
                color: "#7f1d1d",
              }}
            >
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="edit-product-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <section style={sectionCard}>
              <input
                style={{
                  ...inputStyle,
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
                placeholder="Product title"
                value={name}
                onChange={handleNameChange}
              />

              <textarea
                style={{
                  ...inputStyle,
                  minHeight: 130,
                  resize: "vertical",
                  fontSize: 14,
                }}
                placeholder="Tell the story behind this product..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 10,
                  fontSize: 12,
                }}
              >
                <span style={{ minWidth: 36 }}>Slug</span>
                <div
                  style={{
                    flex: 1,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    style={{
                      ...inputStyle,
                      flex: 1,
                      padding: "6px 8px",
                      fontSize: 12,
                    }}
                    value={slug}
                    onChange={(e) => {
                      setSlugDirty(true);
                      setSlug(slugify(e.target.value));
                    }}
                  />
                  {slugStatus !== "idle" && (
                    <span
                      style={{
                        position: "absolute",
                        right: 10,
                        fontSize: 11,
                        color:
                          slugStatus === "available"
                            ? "#16a34a"
                            : slugStatus === "taken"
                            ? "#b91c1c"
                            : "#6b7280",
                      }}
                    >
                      {slugStatus === "checking"
                        ? "Checking..."
                        : slugStatus === "available"
                        ? "Available"
                        : slugStatus === "taken"
                        ? "Taken"
                        : ""}
                    </span>
                  )}
                </div>
              </div>
              {slugError && (
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: "#b91c1c",
                  }}
                >
                  {slugError}
                </p>
              )}
            </section>

            <section style={sectionCard}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  Product data
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 14,
                  flexWrap: "wrap",
                }}
              >
                {tabButton("general", "General")}
                {tabButton("inventory", "Inventory")}
                {tabButton("variations", "Variations")}
                {tabButton("shipping", "Shipping")}
              </div>

              {activeTab === "general" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                    gap: 12,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 4,
                        display: "block",
                      }}
                    >
                      Regular price (A$)
                    </label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 4,
                        display: "block",
                      }}
                    >
                      Sale price (A$)
                    </label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                    <p
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        color: "#6b7280",
                      }}
                    >
                      Leave blank if there’s no discount.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "inventory" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
                    gap: 12,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 4,
                        display: "block",
                      }}
                    >
                      SKU
                    </label>
                    <input
                      style={inputStyle}
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 4,
                        display: "block",
                      }}
                    >
                      Stock quantity
                    </label>
                    <input
                      type="number"
                      style={inputStyle}
                      value={stockQty}
                      onChange={(e) => setStockQty(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === "variations" && (
                <div style={{ paddingTop: 6 }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    Attributes (Size, Color, Flavour...)
                  </h4>

                  {attributes.map((attr, idx) => (
                    <div
                      key={attr.id}
                      style={{
                        marginBottom: 18,
                        padding: 12,
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        background: "#f9fafb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          style={inputStyle}
                          placeholder="Attribute name (Size, Color, Flavour...)"
                          value={attr.name}
                          onChange={(e) => updateAttributeName(idx, e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => deleteAttribute(idx)}
                          style={{
                            padding: "0 10px",
                            borderRadius: 8,
                            border: "none",
                            background: "#fee2e2",
                            color: "#b91c1c",
                            fontSize: 12,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      {attr.values.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 6,
                            marginBottom: 8,
                          }}
                        >
                          {attr.values.map((val, vIdx) => (
                            <div
                              key={`${val}-${vIdx}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "4px 10px",
                                borderRadius: 999,
                                border: "1px solid #d1d5db",
                                background: "#fff",
                                fontSize: 12,
                              }}
                            >
                              <span>{val}</span>
                              <button
                                type="button"
                                onClick={() => deleteAttributeValue(idx, vIdx)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                  fontSize: 14,
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          marginTop: 6,
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          style={inputStyle}
                          placeholder="Add value (e.g. Small, Red, Vanilla)"
                          value={newValueByAttr[attr.id] ?? ""}
                          onChange={(e) =>
                            setNewValueByAttr((prev) => ({
                              ...prev,
                              [attr.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() => addAttributeValue(idx)}
                          style={{
                            borderRadius: 8,
                            border: "none",
                            background: "#111827",
                            color: "#fff",
                            padding: "0 14px",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addNewAttribute}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "1px dashed #d1d5db",
                      background: "#f9fafb",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    + Add attribute
                  </button>

                  <div
                    style={{
                      marginTop: 20,
                      borderTop: "1px solid #e5e7eb",
                      paddingTop: 12,
                    }}
                  >
                    <h4
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      Variant combinations
                    </h4>

                    {variants.length === 0 ? (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                        }}
                      >
                        Add attribute values to generate variants.
                      </p>
                    ) : (
                      <div
                        style={{
                          overflowX: "auto",
                        }}
                      >
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: 13,
                            minWidth: 600,
                          }}
                        >
                          <thead>
                            <tr
                              style={{
                                background: "#f3f4f6",
                              }}
                            >
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "8px 10px",
                                  borderBottom: "1px solid #e5e7eb",
                                }}
                              >
                                Variant
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "8px 10px",
                                  borderBottom: "1px solid #e5e7eb",
                                }}
                              >
                                SKU
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "8px 10px",
                                  borderBottom: "1px solid #e5e7eb",
                                }}
                              >
                                Regular (A$)
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "8px 10px",
                                  borderBottom: "1px solid #e5e7eb",
                                }}
                              >
                                Sale (A$)
                              </th>
                              <th
                                style={{
                                  textAlign: "left",
                                  padding: "8px 10px",
                                  borderBottom: "1px solid #e5e7eb",
                                }}
                              >
                                Stock
                              </th>
                              <th
                                style={{
                                  textAlign: "center",
                                  padding: "8px 10px",
                                  borderBottom: "1px solid #e5e7eb",
                                }}
                              >
                                Enabled
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.map((v) => (
                              <tr
                                key={v.id}
                                style={{
                                  borderBottom: "1px solid #f3f4f6",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "8px 10px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {v.label}
                                </td>
                                <td
                                  style={{
                                    padding: "4px 6px",
                                  }}
                                >
                                  <input
                                    style={{
                                      ...inputStyle,
                                      padding: "6px 8px",
                                      fontSize: 12,
                                    }}
                                    value={v.sku}
                                    onChange={(e) =>
                                      updateVariantField(v.id, {
                                        sku: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td
                                  style={{
                                    padding: "4px 6px",
                                  }}
                                >
                                  <input
                                    type="number"
                                    style={{
                                      ...inputStyle,
                                      padding: "6px 8px",
                                      fontSize: 12,
                                    }}
                                    value={v.regularPrice}
                                    onChange={(e) =>
                                      updateVariantField(v.id, {
                                        regularPrice: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td
                                  style={{
                                    padding: "4px 6px",
                                  }}
                                >
                                  <input
                                    type="number"
                                    style={{
                                      ...inputStyle,
                                      padding: "6px 8px",
                                      fontSize: 12,
                                    }}
                                    value={v.salePrice}
                                    onChange={(e) =>
                                      updateVariantField(v.id, {
                                        salePrice: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td
                                  style={{
                                    padding: "4px 6px",
                                  }}
                                >
                                  <input
                                    type="number"
                                    style={{
                                      ...inputStyle,
                                      padding: "6px 8px",
                                      fontSize: 12,
                                    }}
                                    value={v.stockQty}
                                    onChange={(e) =>
                                      updateVariantField(v.id, {
                                        stockQty: e.target.value,
                                      })
                                    }
                                  />
                                </td>
                                <td
                                  style={{
                                    padding: "4px 6px",
                                    textAlign: "center",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={v.enabled}
                                    onChange={(e) =>
                                      updateVariantField(v.id, {
                                        enabled: e.target.checked,
                                      })
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

{activeTab === "shipping" && (
  <div style={{ paddingTop: 4 }}>
    <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
      Select a shipping profile for this product.
    </p>

    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select
        value={selectedShippingProfileId ?? ""}
        onChange={(e) =>
          setSelectedShippingProfileId(
            e.target.value ? Number(e.target.value) : null
          )
        }
        style={{
          flex: 1,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #d1d5db",
          fontSize: 13,
        }}
      >
        <option value="">Select profile</option>
        {shippingProfiles.map((p) => (
          <option key={String(p.id)} value={String(p.id)}>
            {p.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setShowShippingModal(true)}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #111827",
          background: "#111827",
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        + New
      </button>
    </div>

    {shippingProfiles.length === 0 && (
      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>
        No shipping profiles yet — create one to continue.
      </p>
    )}

    {selectedShippingProfile && (
      <div
        style={{
          marginTop: 12,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          fontSize: 12,
        }}
      >
        <div>
          <strong>Region:</strong> {selectedShippingProfile.region}
        </div>

        {selectedShippingProfile.standard_cost != null && (
          <div>
            <strong>Standard:</strong> ${selectedShippingProfile.standard_cost}
          </div>
        )}

        {selectedShippingProfile.express_cost != null && (
          <div>
            <strong>Express:</strong> ${selectedShippingProfile.express_cost}
          </div>
        )}

        {selectedShippingProfile.free_shipping_threshold != null && (
          <div>
            <strong>Free shipping over:</strong> $
            {selectedShippingProfile.free_shipping_threshold}
          </div>
        )}
      </div>
    )}
  </div>
)}


            </section>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <section style={sectionCard}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Product image
              </h3>
              <label
                style={{
                  border: "1px dashed #d1d5db",
                  borderRadius: 12,
                  padding: 16,
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f9fafb",
                  display: "block",
                  fontSize: 13,
                  color: "#4b5563",
                }}
              >
                <Upload
                  size={18}
                  style={{
                    marginBottom: 4,
                    display: "inline-block",
                  }}
                />
                <div>Click to upload main product image</div>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </label>

              {thumbnailPreview && (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={thumbnailPreview}
                    alt="Primary"
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      objectFit: "cover",
                      maxHeight: 260,
                    }}
                  />
                </div>
              )}
            </section>

            <section style={sectionCard}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Product gallery (up to 5 images)
              </h3>

              <label
                style={{
                  border: "1px dashed #d1d5db",
                  borderRadius: 12,
                  padding: 14,
                  textAlign: "center",
                  cursor: "pointer",
                  background: "#f9fafb",
                  display: "block",
                  fontSize: 13,
                  color: "#4b5563",
                }}
              >
                <Upload size={18} style={{ marginBottom: 4 }} />
                <div>Add gallery images</div>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                />
              </label>

              {(existingGalleryUrls.length > 0 || newGalleryPreviews.length > 0) && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {existingGalleryUrls.map((src) => (
                    <div
                      key={src}
                      style={{
                        position: "relative",
                      }}
                    >
                      <img
                        src={src}
                        alt="Gallery"
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingGalleryImage(src)}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: 18,
                          height: 18,
                          borderRadius: "999px",
                          border: "none",
                          background: "#111827",
                          color: "#fff",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {newGalleryPreviews.map((src, idx) => (
                    <div
                      key={src + idx}
                      style={{
                        position: "relative",
                      }}
                    >
                      <img
                        src={src}
                        alt={`Gallery new ${idx + 1}`}
                        style={{
                          width: 64,
                          height: 64,
                          objectFit: "cover",
                          borderRadius: 10,
                          border: "1px solid #e5e7eb",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewGalleryImage(idx)}
                        style={{
                          position: "absolute",
                          top: -6,
                          right: -6,
                          width: 18,
                          height: 18,
                          borderRadius: "999px",
                          border: "none",
                          background: "#111827",
                          color: "#fff",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={sectionCard}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Categories
              </h3>

              {categories.length === 0 ? (
                <p
                  style={{
                    fontSize: 12,
                    color: "#6b7280",
                  }}
                >
                  No categories yet.
                </p>
              ) : (
                <div
                  style={{
                    maxHeight: 160,
                    overflowY: "auto",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    padding: "6px 8px",
                    background: "#f9fafb",
                    marginBottom: 8,
                  }}
                >
                  {categories.map((cat) => {
                    const checked = selectedCategoryIds.includes(cat.id);
                    return (
                      <label
                        key={cat.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          padding: "2px 0",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCategory(cat.id)}
                        />
                        <span>{cat.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 4,
                }}
              >
                <input
                  style={{
                    ...inputStyle,
                    fontSize: 12,
                  }}
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={addingCategory || !newCategoryName.trim()}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #111827",
                    background: addingCategory ? "#e5e7eb" : "#111827",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor:
                      addingCategory || !newCategoryName.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingCategory ? "Adding..." : "Add"}
                </button>
              </div>
            </section>

            <section style={sectionCard}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Tags
              </h3>

              {tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  {tags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        style={{
                          fontSize: 11,
                          padding: "4px 9px",
                          borderRadius: 999,
                          border: active ? "1px solid #111827" : "1px solid #d1d5db",
                          background: active ? "#111827" : "#f9fafb",
                          color: active ? "#f9fafb" : "#374151",
                          cursor: "pointer",
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 6,
                }}
              >
                <input
                  style={{
                    ...inputStyle,
                    fontSize: 12,
                  }}
                  placeholder="New tag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={addingTag || !newTagName.trim()}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #111827",
                    background: addingTag ? "#e5e7eb" : "#111827",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor:
                      addingTag || !newTagName.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingTag ? "Adding..." : "Add"}
                </button>
              </div>
            </section>

            <section style={sectionCard}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Brand
              </h3>

              {brands.length > 0 && (
                <div
                  style={{
                    maxHeight: 140,
                    overflowY: "auto",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    padding: "6px 8px",
                    background: "#f9fafb",
                    marginBottom: 8,
                  }}
                >
                  {brands.map((brand) => (
                    <label
                      key={brand.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                        padding: "2px 0",
                        cursor: "pointer",
                      }}
                    >
                      <span>{brand.name}</span>
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrandId === brand.id}
                        onChange={() => setSelectedBrandId(brand.id)}
                      />
                    </label>
                  ))}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: 6,
                }}
              >
                <input
                  style={{
                    ...inputStyle,
                    fontSize: 12,
                  }}
                  placeholder="New brand name"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddBrand}
                  disabled={addingBrand || !newBrandName.trim()}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid #111827",
                    background: addingBrand ? "#e5e7eb" : "#111827",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor:
                      addingBrand || !newBrandName.trim()
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {addingBrand ? "Adding..." : "Add"}
                </button>
              </div>
            </section>
          </div>
        </div>

        <style jsx>{`
          .edit-product-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.7fr) minmax(0, 1.1fr);
            gap: 20px;
          }

          @media (max-width: 900px) {
            .edit-product-grid {
              grid-template-columns: minmax(0, 1fr);
            }
          }
        `}</style>
        {showShippingModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}
  >
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 12,
        width: "100%",
        maxWidth: 420,
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
        New shipping profile
      </h3>

      <input
        style={inputStyle}
        placeholder="Profile name"
        value={newShipping.name}
        onChange={(e) => setNewShipping({ ...newShipping, name: e.target.value })}
      />

      <select
        style={{ ...inputStyle, marginTop: 8 }}
        value={newShipping.region}
        onChange={(e) =>
          setNewShipping({ ...newShipping, region: e.target.value })
        }
      >
        <option value="metro">Metro</option>
        <option value="regional">Regional</option>
        <option value="international">International</option>
      </select>

      <input
        style={{ ...inputStyle, marginTop: 8 }}
        placeholder="Standard cost"
        type="number"
        value={newShipping.standard_cost}
        onChange={(e) =>
          setNewShipping({ ...newShipping, standard_cost: e.target.value })
        }
      />

      <input
        style={{ ...inputStyle, marginTop: 8 }}
        placeholder="Express cost"
        type="number"
        value={newShipping.express_cost}
        onChange={(e) =>
          setNewShipping({ ...newShipping, express_cost: e.target.value })
        }
      />

      <input
        style={{ ...inputStyle, marginTop: 8 }}
        placeholder="Free shipping over"
        type="number"
        value={newShipping.free_shipping_threshold}
        onChange={(e) =>
          setNewShipping({
            ...newShipping,
            free_shipping_threshold: e.target.value,
          })
        }
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setShowShippingModal(false)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#f9fafb",
          }}
        >
          Cancel
        </button>

        <button
          disabled={creatingShipping}
          onClick={async () => {
            if (!vendorId || !newShipping.name.trim()) return;

            try {
              setCreatingShipping(true);

              const { data, error } = await supabase
                .from("shipping_profiles")
                .insert({
                  vendor_id: vendorId,
                  name: newShipping.name,
                  region: newShipping.region,
                  standard_cost: Number(newShipping.standard_cost) || null,
                  express_cost: Number(newShipping.express_cost) || null,
                  free_shipping_threshold:
                    Number(newShipping.free_shipping_threshold) || null,
                })
                .select()
                .single();

              if (error) throw error;

              setShippingProfiles((prev) => [...prev, data]);
              setSelectedShippingProfileId(data.id);
              setShowShippingModal(false);
              setNewShipping({
                name: "",
                region: "metro",
                standard_cost: "",
                express_cost: "",
                free_shipping_threshold: "",
              });
            } catch (err: any) {
  console.error(err);
  alert(err.message || "Failed to create shipping profile");
}
 finally {
              setCreatingShipping(false);
            }
          }}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}

      </main>

      <Footer />
    </>
  );
}
