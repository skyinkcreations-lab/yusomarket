"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import Header from "../../../_components/Header";
import Footer from "../../../_components/Footer";
import Link from "next/link";

type Review = {
  id: string;
  rating: number;
  content: string;
  images: string[] | null;
  vendor_reply: string | null;
  created_at: string;
  user: {
    full_name: string | null;
    avatar_url: string | null;
  };
  product: {
    name: string;
    thumbnail_url: string | null;
  };
};

export default function VendorReviewsPage() {
  const params = useParams();
  const vendorId = params.id as string;

  const supabase = supabaseBrowser();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // Load review stats
      const { data: statsData } = await supabase.rpc(
        "get_vendor_rating_stats",
        { vendor_id_input: vendorId }
      );

      setStats(statsData);

      // Load reviews
      const query = supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          content,
          images,
          vendor_reply,
          created_at,
          user:user_id ( full_name, avatar_url ),
          product:product_id ( name, thumbnail_url )
        `
        )
        .eq("vendor_id", vendorId)
        .order("created_at", { ascending: false });

      if (filter) query.eq("rating", filter);

      const { data } = await query;

      setReviews(data || []);
      setLoading(false);
    })();
  }, [vendorId, filter]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: 40 }}>
          <h2>Loading reviews…</h2>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      <Header />

      <main
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "24px 16px 60px",
        }}
      >
        {/* Breadcrumb */}
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          <Link href="/">YusoMarket</Link> /{" "}
          <Link href={`/vendors/${vendorId}`}>Vendor</Link> /{" "}
          <span style={{ color: "#111827" }}>Reviews</span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>
          Store Reviews
        </h1>

        {/* Rating Summary */}
        {stats && (
          <div
            style={{
              display: "flex",
              gap: 24,
              padding: 20,
              borderRadius: 16,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              marginBottom: 24,
            }}
          >
            {/* Left — average rating */}
            <div style={{ minWidth: 140, textAlign: "center" }}>
              <div
                style={{
                  fontSize: 46,
                  fontWeight: 800,
                  color: "#1f2937",
                }}
              >
                {stats.avg.toFixed(1)}
              </div>
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                {stats.count} reviews
              </div>
            </div>

            {/* Right — rating bars */}
            <div style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((r) => {
                const percent =
                  stats[`star_${r}`] > 0
                    ? (stats[`star_${r}`] / stats.count) * 100
                    : 0;

                return (
                  <div
                    key={r}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 6,
                      gap: 8,
                    }}
                  >
                    <span style={{ width: 20 }}>{r}★</span>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        background: "#e5e7eb",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: "100%",
                          background: "#4f46e5",
                        }}
                      ></div>
                    </div>
                    <span style={{ width: 40, textAlign: "right", fontSize: 12 }}>
                      {stats[`star_${r}`]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(filter === r ? null : r)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "1px solid #d1d5db",
                background: filter === r ? "#111827" : "#ffffff",
                color: filter === r ? "#ffffff" : "#111827",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {r} ★
            </button>
          ))}
        </div>

        {/* Review list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                padding: 20,
              }}
            >
              {/* User */}
              <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#e5e7eb",
                    backgroundImage: `url(${
                      review.user.avatar_url || "/placeholder.png"
                    })`,
                    backgroundSize: "cover",
                  }}
                />

                <div>
                  <div style={{ fontWeight: 700 }}>
                    {review.user.full_name || "Anonymous"}
                  </div>

                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>

                  <div style={{ fontSize: 14, marginTop: 2 }}>
                    {"⭐".repeat(review.rating)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <p style={{ fontSize: 14, color: "#374151", marginBottom: 12 }}>
                {review.content}
              </p>

              {/* Images */}
              {(review.images?.length ?? 0) > 0 && (
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  {review.images?.map((img) => (
                    <img
                      key={img}
                      src={img}
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Vendor reply */}
              {review.vendor_reply && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    borderLeft: "3px solid #4f46e5",
                    background: "#f9fafb",
                    borderRadius: 8,
                  }}
                >
                  <strong>Vendor Reply:</strong>
                  <p style={{ marginTop: 4, fontSize: 14 }}>
                    {review.vendor_reply}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
