"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  ChangeEvent,
} from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  original_price: number | null;
  thumbnail_url: string | null;
};

type CartItem = {
  id: string;
  quantity: number;
  product: Product | null;
};

type CartFromServer =
  | {
      id: string;
      shipping_method: "standard" | "express" | null;
      discount_code: string | null;
      cart_items: CartItem[];
    }
  | null;

type Props = {
  cartFromServer: CartFromServer;
};

function formatMoney(n: number) {
  return `A$${n.toFixed(2)}`;
}

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ccc",
  fontSize: 13,
};

const shipRowBase: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  padding: "8px 0",
  fontSize: 13,
  borderBottom: "1px solid #eee",
  alignItems: "center",
};

const totalRowBase: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 13,
};

export default function CartClient({ cartFromServer }: Props) {

  const isServerCart = Boolean(cartFromServer?.id);

  /** ALWAYS RELIABLE cart id */
  const cartIdRef = useRef<string | null>(cartFromServer?.id ?? null);

  const [cartItems, setCartItems] = useState<CartItem[]>(
    cartFromServer?.cart_items ?? []
  );

  const [shippingMethod, setShippingMethod] = useState<
    "standard" | "express"
  >((cartFromServer?.shipping_method as any) || "standard");

  const [discountInput, setDiscountInput] = useState(
    cartFromServer?.discount_code ?? ""
  );
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [address, setAddress] = useState({
    email: "",
    country: "Australia",
    firstName: "",
    lastName: "",
    line1: "",
    city: "",
    state: "",
    postcode: "",
  });

  // hydrate from server only
  useEffect(() => {
    if (!isServerCart || !cartFromServer) return;
    cartIdRef.current = cartFromServer.id;
    setCartItems(cartFromServer.cart_items ?? []);
    setShippingMethod((cartFromServer.shipping_method as any) || "standard");
    setDiscountInput(cartFromServer.discount_code ?? "");
  }, [isServerCart, cartFromServer?.id]);


  const subtotal = useMemo(
    () =>
      cartItems.reduce((sum, ci) => {
        const price = ci.product?.price ?? 0;
        return sum + price * ci.quantity;
      }, 0),
    [cartItems]
  );

  const shippingCost = useMemo(
    () => (shippingMethod === "express" ? 15 : 8),
    [shippingMethod]
  );

  const tax = useMemo(
    () => Math.round(subtotal * 0.1 * 100) / 100,
    [subtotal]
  );

  const total = useMemo(
    () => Math.max(0, subtotal + shippingCost + tax - appliedDiscount),
    [subtotal, shippingCost, tax, appliedDiscount]
  );

  const hasItems = cartItems.length > 0;

  /**
   * --- SERVER SYNC ---
   * Always uses the REAL cart_id and refreshes cart state from DB
   */
  async function syncCart(payload: any) {
  if (!cartIdRef.current) return null;

  try {
    setSaving(true);

    const res = await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({
        ...payload,
        cart_id: cartIdRef.current,
      }),
    });

    // ---- read raw body FIRST ----
    const text = await res.text();
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      console.error("Cart sync failed:", {
        status: res.status,
        statusText: res.statusText,
        data,
      });
      return null;
    }

    if (data?.cart) {
      cartIdRef.current = data.cart.id;
      setCartItems(data.cart.cart_items || []);
      setShippingMethod(data.cart.shipping_method || "standard");
    }

    return data;
  } catch (err) {
    console.error("Cart sync crashed:", err);
    return null;
  } finally {
    setSaving(false);
  }
}

  /* SHIPPING */
  const handleShippingChange = async (value: "standard" | "express") => {
    await syncCart({ type: "shipping", shipping_method: value });
  };

  /* QUANTITY */
  const handleQuantityChange = async (itemId: string, delta: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQty = Math.max(1, item.quantity + delta);

    await syncCart({
      type: "quantity",
      cart_item_id: itemId,
      quantity: newQty,
    });
  };

  /* DELETE */
  const handleDelete = async (itemId: string) => {
    await syncCart({ type: "remove_item", cart_item_id: itemId });
  };

  /* DISCOUNT */
  const handleDiscountInput = (e: ChangeEvent<HTMLInputElement>) => {
    setDiscountInput(e.target.value);
    setDiscountError(null);
  };

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) {
      setDiscountError("Enter a code first.");
      return;
    }

    const data = await syncCart({
      type: "discount",
      code: discountInput.trim(),
    });

    if (data?.error) {
      setAppliedDiscount(0);
      setDiscountError(data.error);
      return;
    }

    setAppliedDiscount(data?.cart?.discount_amount || 0);
  };

  const validateAddress = () => {
  if (!address.email.trim()) return false;
  if (!address.firstName.trim()) return false;
  if (!address.lastName.trim()) return false;
  if (!address.line1.trim()) return false;
  if (!address.city.trim()) return false;
  if (!address.state.trim()) return false;
  if (!address.postcode.trim()) return false;

  return true;
};

const handlePayNow = async () => {
  if (saving) return;

  if (!cartIdRef.current) {
    alert("Cart missing — refresh the page.");
    return;
  }

if (!validateAddress()) {
  alert("Please complete all delivery details before continuing.");
  return;
}

  window.localStorage.setItem("checkout_cart_id", cartIdRef.current);
  window.localStorage.setItem("checkout_shipping_method", shippingMethod);

  window.localStorage.setItem(
    "checkout_customer",
    JSON.stringify({
      email: address.email,
      name: `${address.firstName} ${address.lastName}`,
    })
  );

  window.localStorage.setItem(
    "checkout_shipping_address",
    JSON.stringify({
      country: address.country,
      line1: address.line1,
      city: address.city,
      state: address.state,
      postcode: address.postcode,
    })
  );

  window.location.href = "/checkout/embedded";
};

  if (!hasItems) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0 40px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          Your cart is empty
        </h1>

        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "10px 22px",
            borderRadius: 999,
            background: "#111",
            color: "#fff",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div style={{ width: "100%", display: "flex", gap: 30, flexWrap: "wrap" }}>
      {/* ================= FORM CARD ================= */}
      <div
        style={{
          flex: "1 1 600px",
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
          padding: "28px",
          border: "1px solid #eee",
        }}
      >
        {/* FAST CHECKOUT */}
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
          FAST CHECKOUT
        </h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            style={{
              flex: "1 1 140px",
              background: "#000",
              color: "#fff",
              padding: "12px 0",
              borderRadius: 8,
            }}
          >
            Google Pay
          </button>

          <button
            style={{
              flex: "1 1 140px",
              background: "#f4c015",
              color: "#111",
              padding: "12px 0",
              borderRadius: 8,
            }}
          >
            Fast Checkout
          </button>

          <button
            style={{
              flex: "1 1 140px",
              background: "#ffc439",
              color: "#111",
              padding: "12px 0",
              borderRadius: 8,
            }}
          >
            PayPal
          </button>
        </div>

        {/* OR */}
        <div
          style={{
            textAlign: "center",
            margin: "20px 0",
            fontSize: 12,
            color: "#888",
          }}
        >
          OR
        </div>

        {/* CONTACT */}
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
          Contact
        </h3>

        <input
          type="email"
          placeholder="Email or mobile number"
          style={inputBase}
          value={address.email}
          onChange={(e) =>
            setAddress((prev) => ({ ...prev, email: e.target.value }))
          }
        />

        

        {/* DELIVERY */}
        <h3 style={{ marginTop: 25, fontSize: 14, fontWeight: 600 }}>
          Delivery
        </h3>

        <select
          style={inputBase}
          value={address.country}
          onChange={(e) =>
            setAddress((prev) => ({ ...prev, country: e.target.value }))
          }
        >
          <option>Australia</option>
        </select>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <input
            placeholder="First name"
            style={{ ...inputBase, flex: 1 }}
            value={address.firstName}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
          <input
            placeholder="Last name"
            style={{ ...inputBase, flex: 1 }}
            value={address.lastName}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, lastName: e.target.value }))
            }
          />
        </div>

        <input
  placeholder="Street address"
  style={{ ...inputBase, marginTop: 12 }}
  value={address.line1}
  onChange={(e) =>
    setAddress((prev) => ({ ...prev, line1: e.target.value }))
  }
/>


        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <input
            placeholder="City"
            style={{ ...inputBase, flex: 1 }}
            value={address.city}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, city: e.target.value }))
            }
          />
          <input
            placeholder="State"
            style={{ ...inputBase, flex: 1 }}
            value={address.state}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, state: e.target.value }))
            }
          />
          <input
            placeholder="Postcode"
            style={{ ...inputBase, flex: 1 }}
            value={address.postcode}
            onChange={(e) =>
              setAddress((prev) => ({ ...prev, postcode: e.target.value }))
            }
          />
        </div>

        {/* SHIPPING */}
        <h3 style={{ marginTop: 28, fontSize: 14, fontWeight: 600 }}>
          Shipping
        </h3>

        <label style={shipRowBase}>
          <div>
            <input
              type="radio"
              name="ship"
              checked={shippingMethod === "standard"}
              onChange={() => handleShippingChange("standard")}
            />{" "}
            Standard (3–5 days)
          </div>
          <strong>{formatMoney(8)}</strong>
        </label>

        <label style={shipRowBase}>
          <div>
            <input
              type="radio"
              name="ship"
              checked={shippingMethod === "express"}
              onChange={() => handleShippingChange("express")}
            />{" "}
            Express (1–2 days)
          </div>
          <strong>{formatMoney(15)}</strong>
        </label>

        {/* PAYMENT */}
        <h3 style={{ marginTop: 28, fontSize: 14, fontWeight: 600 }}>
          Payment
        </h3>

        <div
          style={{
            border: "1px dashed #ccc",
            borderRadius: 8,
            padding: "12px",
            fontSize: 12,
            background: "#fafafa",
            color: "#666",
          }}
        >
          Payment placeholder — card, Google Pay, PayPal (integrate later)
        </div>

        <button
          style={{
            width: "100%",
            marginTop: 20,
            background: "#111",
            color: "#fff",
            padding: "12px 0",
            borderRadius: 8,
            border: "none",
            fontSize: 14,
            cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}
          onClick={handlePayNow}
        >
          {saving ? "Saving..." : "Pay now"}
        </button>
      </div>

      {/* ================= ORDER SUMMARY ================= */}
      <div
        style={{
          flex: "1 1 360px",
          background: "#fafafa",
          borderRadius: 16,
          boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
          padding: "24px",
          border: "1px solid #eee",
          height: "fit-content",
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          Order summary
        </h3>

        {cartItems.map((ci) => (
          <div
            key={ci.id}
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 16,
              position: "relative",
            }}
          >
            <span
              onClick={() => handleDelete(ci.id)}
              style={{
                position: "absolute",
                right: -6,
                top: -6,
                fontSize: 14,
                cursor: "pointer",
                color: "#666",
              }}
            >
              ×
            </span>

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                background: "#ddd",
                overflow: "hidden",
              }}
            >
              {ci.product?.thumbnail_url && (
                <img
                  src={ci.product.thumbnail_url}
                  alt={ci.product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>{ci.product?.name}</p>

              <p style={{ fontSize: 11, color: "#666" }}>
                Qty:
                <button
                  type="button"
                  style={{
                    margin: "0 6px 0 8px",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    width: 22,
                    height: 22,
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#fff",
                  }}
                  onClick={() => handleQuantityChange(ci.id, -1)}
                >
                  -
                </button>
                {ci.quantity}
                <button
                  type="button"
                  style={{
                    marginLeft: 6,
                    borderRadius: 4,
                    border: "1px solid #ccc",
                    width: 22,
                    height: 22,
                    textAlign: "center",
                    cursor: "pointer",
                    background: "#fff",
                  }}
                  onClick={() => handleQuantityChange(ci.id, +1)}
                >
                  +
                </button>
              </p>

              <p style={{ fontSize: 13, fontWeight: 600 }}>
                {formatMoney((ci.product?.price ?? 0) * ci.quantity)}
              </p>
            </div>
          </div>
        ))}

        {/* COUPON */}
        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
          <input
            type="text"
            placeholder="Discount code"
            style={{ ...inputBase, flex: 1 }}
            value={discountInput}
            onChange={handleDiscountInput}
          />
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#fff",
              fontSize: 13,
              cursor: "pointer",
            }}
            type="button"
            onClick={handleApplyDiscount}
          >
            Apply
          </button>
        </div>

        {discountError && (
          <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>
            {discountError}
          </p>
        )}

        {/* TOTAL */}
        <div style={{ borderTop: "1px solid #ddd", paddingTop: 14 }}>
          <div style={totalRowBase}>
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>

          <div style={totalRowBase}>
            <span>Shipping</span>
            <span>{formatMoney(shippingCost)}</span>
          </div>

          <div style={totalRowBase}>
            <span>Estimated taxes (10%)</span>
            <span>{formatMoney(tax)}</span>
          </div>

          {appliedDiscount > 0 && (
            <div style={totalRowBase}>
              <span>Discount</span>
              <span>-{formatMoney(appliedDiscount)}</span>
            </div>
          )}

          <div
            style={{
              ...totalRowBase,
              marginTop: 12,
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            <span>Total</span>
            <span>AUD {formatMoney(total).replace("A$", "")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
