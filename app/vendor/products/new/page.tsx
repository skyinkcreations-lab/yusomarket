// app/vendor/products/new/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { Loader2, Upload } from "lucide-react";

/* -------------------------------------------------------
   TYPES
------------------------------------------------------- */
type Status = "draft" | "published";

type ProductDataTab = "general" | "inventory" | "variations" | "shipping";
type SlugStatus = "idle" | "checking" | "available" | "taken";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };
type Brand = { id: string; name: string };
type ShippingProfile = {
  id: number;   // bigint from DB
  name: string;
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

/* -------------------------------------------------------
   HELPERS
------------------------------------------------------- */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function randomSlugSuffix(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
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

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */
export default function NewProductPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();

  /* BASIC STATE */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ProductDataTab>("general");

  /* VENDOR */
  const [vendorId, setVendorId] = useState<string | null>(null);

  /* PRODUCT CORE FIELDS */
  const [status, setStatus] = useState<Status>("draft");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stockQty, setStockQty] = useState("");

  /* MEDIA */
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  /* TAXONOMIES DATA (VENDOR-SCOPED) */
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [shippingProfiles, setShippingProfiles] = useState<ShippingProfile[]>(
    []
  );

  /* SELECTED TAXONOMIES */
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedShippingProfileId, setSelectedShippingProfileId] = useState<
  number | null
>(null);

const [showShippingModal, setShowShippingModal] = useState(false);

const [newShippingName, setNewShippingName] = useState("");
const [newShippingRegion, setNewShippingRegion] = useState("metro");
const [newShippingStandard, setNewShippingStandard] = useState("");
const [newShippingExpress, setNewShippingExpress] = useState("");
const [newShippingFree, setNewShippingFree] = useState("");


  /* NEW TAXONOMY INPUTS */
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [addingBrand, setAddingBrand] = useState(false);

  /* VARIATIONS / ATTRIBUTES */
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [newValueByAttr, setNewValueByAttr] = useState<Record<string, string>>(
    {}
  );

  /* -------------------------------------------------------
     LOAD METADATA + VENDOR VALIDATION
  ------------------------------------------------------- */
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

      const { data: vendor, error: vendorErr } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (vendorErr || !vendor) {
        router.push("/sell");
        return;
      }

      setVendorId(vendor.id);

      const [{ data: cat }, { data: tg }, { data: br }, { data: shp }] =
        await Promise.all([
          supabase.from("vendor_categories").select("id,name").eq("vendor_id", vendor.id),
          supabase.from("vendor_tags").select("id,name").eq("vendor_id", vendor.id),
          supabase.from("vendor_brands").select("id,name").eq("vendor_id", vendor.id),
          supabase.from("shipping_profiles").select("id,name").eq("vendor_id", vendor.id),
        ]);

      if (cat) setCategories(cat);
      if (tg) setTags(tg);
      if (br) setBrands(br);
      if (shp?.length) {
  setShippingProfiles(shp);
  setSelectedShippingProfileId(shp[0].id);
}

    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        message: "Unexpected error loading product metadata.",
      });
    } finally {
      setLoading(false);
    }
  })();
}, []);


  /* -------------------------------------------------------
     SLUG GENERATION & AVAILABILITY
  ------------------------------------------------------- */

  // Generate slug from title on blur.
  // Always regenerates a fresh candidate with a random suffix so
  // you don't get stuck with a permanently "taken" slug.
  const generateSlugFromTitle = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setSlug("");
      setSlugStatus("idle");
      setSlugError(null);
      return;
    }

    const base = slugify(trimmed);
    if (!base) {
      setSlug("");
      setSlugStatus("idle");
      setSlugError(null);
      return;
    }

    // Always generate a new candidate when title is blurred
    const candidate = `${base}-${randomSlugSuffix(6)}`;
    setSlug(candidate);
    setSlugStatus("checking");
    setSlugError(null);
  };

  // Auto-check slug availability when slug changes (debounced)
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
        const res = await fetch(
          `/api/vendor/products/check-slug?slug=${encodeURIComponent(slug)}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
  console.warn("Slug check failed:", res.status);
  setSlugStatus("idle");
  return;
}

        const data = await res.json();
        if (cancelled) return;

        if (data?.available) {
          setSlugStatus("available");
          setSlugError(null);
        } else {
          setSlugStatus("taken");
          setSlugError(
            "This URL slug is already in use. Change the product title to generate a new one."
          );
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
  }, [slug]);

  /* -------------------------------------------------------
     MEDIA HANDLERS
  ------------------------------------------------------- */
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const combined = [...galleryFiles, ...files].slice(0, 5);
    setGalleryFiles(combined);
    setGalleryPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const handleRemoveGalleryImage = (idx: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  /* -------------------------------------------------------
     TAXONOMY HANDLERS (VENDOR-SCOPED)
  ------------------------------------------------------- */
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

    setAddingCategory(true);
    try {
      const { data, error } = await supabase
  .from("vendor_categories")
  .insert({ name: value, slug: slugify(value), vendor_id: vendorId })
  .select("id,name")
  .single();


      if (error) {
        console.error("Add category error:", error);
      } else if (data) {
        setCategories((prev) => [...prev, data]);
        setSelectedCategoryIds((prev) => [...prev, data.id]);
        setNewCategoryName("");
      }
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddTag = async () => {
    const value = newTagName.trim();
    if (!value || addingTag || !vendorId) return;

    setAddingTag(true);
    try {
      const { data, error } = await supabase
  .from("vendor_tags")
  .insert({ name: value, slug: slugify(value), vendor_id: vendorId })
  .select("id,name")
  .single();


      if (error) {
        console.error("Add tag error:", error);
      } else if (data) {
        setTags((prev) => [...prev, data]);
        setSelectedTagIds((prev) => [...prev, data.id]);
        setNewTagName("");
      }
    } finally {
      setAddingTag(false);
    }
  };

  const handleAddBrand = async () => {
    const value = newBrandName.trim();
    if (!value || addingBrand || !vendorId) return;

    setAddingBrand(true);
    try {
      const { data, error } = await supabase
  .from("vendor_brands")
  .insert({ name: value, slug: slugify(value), vendor_id: vendorId })
  .select("id,name")
  .single();


      if (error) {
        console.error("Add brand error:", error);
      } else if (data) {
        setBrands((prev) => [...prev, data]);
        setSelectedBrandId(data.id);
        setNewBrandName("");
      }
    } finally {
      setAddingBrand(false);
    }
  };

  /* -------------------------------------------------------
     ATTRIBUTES + VARIANT MATRIX
  ------------------------------------------------------- */
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
    const setVals = new Set(next[idx].values);
    setVals.add(val);
    next[idx] = {
      ...next[idx],
      values: Array.from(setVals),
    };
    setAttributes(next);
    setNewValueByAttr((prev) => ({
      ...prev,
      [attr.id]: "",
    }));
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
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  };

  /* -------------------------------------------------------
     VALIDATION
  ------------------------------------------------------- */
  const validate = (): boolean => {
    const errs: string[] = [];

    if (!name.trim()) errs.push("Product name is required.");
    if (!slug.trim()) errs.push("Slug is required.");
    if (slugStatus === "taken")
      errs.push("Slug is already taken. Change the product title.");
    if (slugStatus === "checking")
      errs.push("Please wait for the slug availability check to finish.");
    if (!regularPrice.trim()) errs.push("Regular price is required.");
    if (!sku.trim()) errs.push("SKU is required.");
    if (!stockQty.trim()) errs.push("Stock quantity is required.");
    
    if (!selectedShippingProfileId)
  errs.push("Shipping profile is required.");

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

    // 🔒 HARD GUARD: enabled variants MUST have a price
variants.forEach((v) => {
  if (!v.enabled) return;

  const reg = parseMoney(v.regularPrice || "");
  const sale = parseMoney(v.salePrice || "");

  if (!reg && !sale) {
    errs.push(`Variant "${v.label}" must have a regular or sale price.`);
  }
});

    setErrors(errs);
    return errs.length === 0;
  };

  /* -------------------------------------------------------
     CREATE HANDLER
  ------------------------------------------------------- */
  const handleCreateShippingProfile = async () => {
  if (!vendorId || !newShippingName.trim()) return;

  const { data, error } = await supabase
    .from("shipping_profiles")
    .insert({
      vendor_id: vendorId,
      name: newShippingName,
      region: newShippingRegion,
      standard_cost: Number(newShippingStandard || 0),
      express_cost: Number(newShippingExpress || 0),
      free_shipping_threshold: Number(newShippingFree || 0),
    })
    .select()
    .single();

  if (error) {
    alert("Failed to create shipping profile");
    return;
  }

  setShippingProfiles((prev) => [...prev, data]);
  setSelectedShippingProfileId(data.id);

  setNewShippingName("");
  setNewShippingStandard("");
  setNewShippingExpress("");
  setNewShippingFree("");
  setShowShippingModal(false);
};

  const handleCreate = async () => {
    setToast(null);
    
    console.log(
  "SUBMIT VARIANTS SNAPSHOT",
  variants.map((v) => ({
    label: v.label,
    regularPrice: v.regularPrice,
    salePrice: v.salePrice,
    enabled: v.enabled,
  }))
);

    if (!validate()) {
      setToast({
        type: "error",
        message: "Fix the errors before saving.",
      });
      return;
    }

    try {
      setSaving(true);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) throw new Error("You must be logged in.");
      const userId = auth.user.id;

      // upload main image if set
      let thumbnailUrl = thumbnailPreview;
      if (thumbnailFile) {
        const ext = thumbnailFile.name.split(".").pop();
        const path = `products/${userId}/thumb_${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("public-images")
          .upload(path, thumbnailFile, { upsert: true });

        if (upErr) throw new Error("Failed uploading image.");

        const { data: pub } = supabase.storage
          .from("public-images")
          .getPublicUrl(path);
        thumbnailUrl = pub.publicUrl;
      }

      // upload gallery images
      const galleryUrls: string[] = [];
      for (const file of galleryFiles) {
        const ext = file.name.split(".").pop();
        const path = `products/${userId}/gallery_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;

        const { error: gErr } = await supabase.storage
          .from("public-images")
          .upload(path, file, { upsert: true });

        if (gErr) throw new Error("Failed uploading gallery image.");

        const { data: gPub } = supabase.storage
          .from("public-images")
          .getPublicUrl(path);

        if (gPub?.publicUrl) {
          galleryUrls.push(gPub.publicUrl);
        }
      }

const hasVariants = variants.length > 0;

let basePrice: number;
let originalPrice: number | null = null;

if (hasVariants) {
  // REQUIRED: products.price is NOT NULL
  const variantPrices = variants
    .map((v) => {
      const reg = parseMoney(v.regularPrice || "");
      const sale = parseMoney(v.salePrice || "");
      if (sale && reg && sale < reg) return sale;
      return reg;
    })
    .filter((v): v is number => typeof v === "number");

  if (variantPrices.length === 0) {
    throw new Error("At least one variant must have a valid price.");
  }

  basePrice = Math.min(...variantPrices);
} else {
  const reg = parseMoney(regularPrice)!;
  const sale = parseMoney(salePrice || "");

  basePrice = sale && sale < reg ? sale : reg;
  originalPrice = sale && sale < reg ? reg : null;
}



      const variantPayload = variants.map((v) => ({
        id: null,
        title: v.label,
        sku: v.sku || null,
        regular_price: parseMoney(v.regularPrice || ""),
        sale_price: parseMoney(v.salePrice || ""),
        stock_qty: parseIntSafe(v.stockQty || "0", 0),
        enabled: v.enabled,
        attributes: v.attributes,
      }));

      const res = await fetch("/api/vendor/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: name.trim(),
            slug: slug || slugify(name),
            description: description.trim(),
            status,
price: basePrice,
original_price: originalPrice,

// Only write base inventory if NO variants exist
sku: hasVariants ? null : sku.trim(),
stock_qty: hasVariants ? null : parseIntSafe(stockQty, 0),

            thumbnail_url: thumbnailUrl,
            gallery_urls: galleryUrls,
            category_ids: selectedCategoryIds,
            tag_ids: selectedTagIds,
            brand_id: selectedBrandId,
            shipping_profile_id: selectedShippingProfileId || null,
          },
          attributes,
          variations: variantPayload,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed creating product.");
      }

      setToast({
        type: "success",
        message: "Product created.",
      });

      setTimeout(() => router.push("/vendor/products"), 800);
    } catch (err: any) {
      console.error(err);
      setToast({
        type: "error",
        message: err?.message || "Unexpected error.",
      });
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------
     SHARED INLINE STYLES
  ------------------------------------------------------- */
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

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */
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

      {/* HERO */}
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
          Create Product
        </h1>
      </div>

      <main
        style={{
          maxWidth: 1200,
          margin: "30px auto 60px",
          padding: "0 20px",
        }}
      >
        {/* STATUS + SAVE BAR */}
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
            <span style={{ fontWeight: 600 }}>New product:</span> not saved yet
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
              onClick={handleCreate}
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
              {saving ? "Saving..." : "Create product"}
            </button>
          </div>
        </div>

        {/* TOAST */}
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

        {/* ERRORS */}
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

        {/* GRID (responsive) */}
        <div className="edit-product-grid">
          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* NAME + DESCRIPTION */}
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
                onChange={(e) => setName(e.target.value)}
                onBlur={generateSlugFromTitle}
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
                      backgroundColor: "#f9fafb",
                    }}
                    value={slug}
                    readOnly
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

            {/* PRODUCT DATA */}
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

              {/* TABS */}
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

              {/* TAB CONTENT */}
              {activeTab === "general" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(160px,1fr))",
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
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(160px,1fr))",
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
                          onChange={(e) =>
                            updateAttributeName(idx, e.target.value)
                          }
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

                      {/* Values */}
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
                                onClick={() =>
                                  deleteAttributeValue(idx, vIdx)
                                }
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

                  {/* VARIANT MATRIX */}
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

    <p
      style={{
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 8,
      }}
    >
      Select a shipping profile for this product.
    </p>

    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select
        style={{
          ...inputStyle,
          maxWidth: 260,
        }}
        value={selectedShippingProfileId ?? ""}
        onChange={(e) =>
          setSelectedShippingProfileId(
            e.target.value ? Number(e.target.value) : null
          )
        }
      >
        <option value="">Select profile</option>
        {shippingProfiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setShowShippingModal(true)}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          border: "1px solid #111",
          background: "#111",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        + New
      </button>
    </div>

    {shippingProfiles.length === 0 && (
      <p
        style={{
          marginTop: 8,
          fontSize: 12,
          color: "#9ca3af",
        }}
      >
        No shipping profiles yet — create one to continue.
      </p>
    )}
  </div>
)}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* MAIN IMAGE */}
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

            {/* GALLERY */}
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

              {galleryPreviews.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 10,
                  }}
                >
                  {galleryPreviews.map((src, idx) => (
                    <div
                      key={src + idx}
                      style={{
                        position: "relative",
                      }}
                    >
                      <img
                        src={src}
                        alt={`Gallery ${idx + 1}`}
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
                        onClick={() => handleRemoveGalleryImage(idx)}
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

            {/* CATEGORIES */}
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

            {/* TAGS */}
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
                          border: active
                            ? "1px solid #111827"
                            : "1px solid #d1d5db",
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

            {/* BRAND */}
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

               {/* Mobile / desktop responsive grid */}
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
              background: "rgba(0,0,0,0.45)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                width: "100%",
                maxWidth: 420,
                padding: 20,
                boxShadow: "0 20px 40px rgba(0,0,0,.15)",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                New shipping profile
              </h3>

              <input
                style={{ ...inputStyle, marginBottom: 8 }}
                placeholder="Profile name"
                value={newShippingName}
                onChange={(e) => setNewShippingName(e.target.value)}
              />

              <select
                style={{ ...inputStyle, marginBottom: 8 }}
                value={newShippingRegion}
                onChange={(e) => setNewShippingRegion(e.target.value)}
              >
                <option value="metro">Metro</option>
                <option value="regional">Regional</option>
                <option value="international">International</option>
              </select>

              <input
                style={{ ...inputStyle, marginBottom: 8 }}
                placeholder="Standard price"
                type="number"
                value={newShippingStandard}
                onChange={(e) => setNewShippingStandard(e.target.value)}
              />

              <input
                style={{ ...inputStyle, marginBottom: 8 }}
                placeholder="Express price"
                type="number"
                value={newShippingExpress}
                onChange={(e) => setNewShippingExpress(e.target.value)}
              />

              <input
                style={{ ...inputStyle, marginBottom: 12 }}
                placeholder="Free shipping over"
                type="number"
                value={newShippingFree}
                onChange={(e) => setNewShippingFree(e.target.value)}
              />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setShowShippingModal(false)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateShippingProfile}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "#111",
                    color: "#fff",
                    fontSize: 13,
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
