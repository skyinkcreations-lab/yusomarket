"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/getSupabaseBrowser";

// inline slug generator
function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Attribute = {
  id: string | number;
  name: string;
  slug: string;
  values: string[] | null;
};

export default function AttributesPage() {
  const supabase = getSupabaseBrowser();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newValues, setNewValues] = useState(""); // comma-separated input
  const [adding, setAdding] = useState(false);

  const [toast, setToast] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

  // fetch attributes
  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("attributes")
      .select("id,name,slug,values")
      .order("name", { ascending: true });

    if (!error && data) {
      setAttributes(data as Attribute[]);
    } else {
      console.error("Failed to load attributes:", error);
    }

    setLoading(false);
  };

  // Add new attribute
  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;

    setAdding(true);
    try {
      const valuesArray = newValues
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0);

      const { data, error } = await supabase
        .from("attributes")
        .insert({
          name,
          slug: slugify(name),
          values: valuesArray.length > 0 ? valuesArray : null,
        })
        .select()
        .single();

      if (error) throw error;

      setAttributes((prev) => [...prev, data as Attribute]);
      setNewName("");
      setNewValues("");

      setToast({
        type: "success",
        message: "Attribute added successfully.",
      });
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        message: "Failed to add attribute.",
      });
    }

    setAdding(false);
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: "1240px", margin: "0 auto" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 14px",
            borderRadius: 4,
            fontSize: 13,
            border:
              toast.type === "success"
                ? "1px solid #22c55e"
                : "1px solid #ef4444",
            background:
              toast.type === "success"
                ? "#dcfce7"
                : "rgba(254,226,226,0.9)",
            color: toast.type === "success" ? "#166534" : "#991b1b",
          }}
        >
          {toast.message}
        </div>
      )}

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
        Product Attributes
      </h1>

      {/* Add new attribute */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #dcdcde",
          borderRadius: 4,
          marginBottom: 24,
          padding: 16,
        }}
      >
        <h3
          style={{
            fontSize: 14,
            marginBottom: 12,
            fontWeight: 600,
          }}
        >
          Add new attribute
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: 10,
          }}
        >
          <input
            placeholder="Attribute name (e.g. Color)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              fontSize: 13,
            }}
          />

          <input
            placeholder="Values (comma separated)"
            value={newValues}
            onChange={(e) => setNewValues(e.target.value)}
            style={{
              padding: "8px 10px",
              border: "1px solid #d1d5db",
              borderRadius: 4,
              fontSize: 13,
            }}
          />

          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            style={{
              background: "#2271b1",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 4,
              fontSize: 13,
              border: "none",
              fontWeight: 600,
              cursor: adding || !newName.trim() ? "not-allowed" : "pointer",
              opacity: adding ? 0.6 : 1,
              whiteSpace: "nowrap",
            }}
          >
            {adding ? "Adding…" : "Add Attribute"}
          </button>
        </div>
      </div>

      {/* Attributes table */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #dcdcde",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              <th
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: 13,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Name
              </th>
              <th
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  fontSize: 13,
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                Values
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    padding: 20,
                    textAlign: "center",
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  Loading…
                </td>
              </tr>
            ) : attributes.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    padding: 20,
                    textAlign: "center",
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  No attributes found.
                </td>
              </tr>
            ) : (
              attributes.map((attr) => (
                <tr key={attr.id}>
                  <td
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f1f1f3",
                      fontSize: 13,
                    }}
                  >
                    {attr.name}
                  </td>

                  <td
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f1f1f3",
                      fontSize: 13,
                    }}
                  >
                    {attr.values && attr.values.length > 0
                      ? attr.values.join(", ")
                      : "—"}
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
