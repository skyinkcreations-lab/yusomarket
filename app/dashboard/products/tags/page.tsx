"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/getSupabaseBrowser";

// Inline slugify — no missing file, no errors
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Tag = {
  id: string | number;
  name: string;
  slug?: string;
};

export default function TagsPage() {
  const supabase = getSupabaseBrowser();

  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTagName, setNewTagName] = useState("");
  const [adding, setAdding] = useState(false);

  const [toast, setToast] = useState<null | { type: "success" | "error"; message: string }>(
    null
  );

  // Load tags on mount
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, slug")
        .order("name");

      if (!error && data) setTags(data as Tag[]);
      setLoading(false);
    };

    load();
  }, []);

  async function handleAddTag() {
    const name = newTagName.trim();
    if (!name) return;

    setAdding(true);

    try {
      const { data, error } = await supabase
        .from("tags")
        .insert({ name, slug: slugify(name) })
        .select("id, name, slug")
        .single();

      if (error) throw error;

      setTags((prev) => [...prev, data as Tag]);
      setToast({ type: "success", message: "Tag added successfully." });
      setNewTagName("");
    } catch (err: any) {
      console.error(err);
      setToast({ type: "error", message: "Could not add tag." });
    } finally {
      setAdding(false);
    }
  }

  return (
    <div style={{ padding: "32px 40px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "22px" }}>
        Product Tags
      </h1>

      {/* Toast */}
      {toast && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            borderRadius: "4px",
            fontSize: "13px",
            border:
              toast.type === "success"
                ? "1px solid #22c55e"
                : "1px solid #ef4444",
            background:
              toast.type === "success" ? "#dcfce7" : "rgba(254,226,226,0.9)",
            color: toast.type === "success" ? "#166534" : "#991b1b",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Add New Tag */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          background: "#fff",
          border: "1px solid #dcdcde",
          padding: "12px",
          borderRadius: "4px",
          maxWidth: "480px",
        }}
      >
        <input
          type="text"
          placeholder="Tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            border: "1px solid #d1d5db",
            borderRadius: "4px",
            fontSize: "13px",
          }}
        />
        <button
          onClick={handleAddTag}
          disabled={adding || !newTagName.trim()}
          style={{
            padding: "8px 14px",
            background: "#2271b1",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: 600,
            cursor:
              adding || !newTagName.trim() ? "not-allowed" : "pointer",
            opacity: adding ? 0.6 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {adding ? "Adding…" : "Add Tag"}
        </button>
      </div>

      {/* Tags Table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #dcdcde",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}
        >
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th
                style={{
                  padding: "10px",
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                  width: "40%",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "10px",
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Slug
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td style={{ padding: "12px" }}>Loading…</td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td style={{ padding: "12px" }}>No tags found.</td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id}>
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #f1f1f1",
                    }}
                  >
                    {tag.name}
                  </td>
                  <td
                    style={{
                      padding: "10px",
                      borderBottom: "1px solid #f1f1f1",
                      color: "#6b7280",
                    }}
                  >
                    {tag.slug}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
