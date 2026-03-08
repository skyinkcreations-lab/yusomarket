"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function EmbeddedCheckoutPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function createSession() {
      try {
        const cartId = window.localStorage.getItem("checkout_cart_id");
        const shippingMethod =
          window.localStorage.getItem("checkout_shipping_method") || "standard";
        const checkoutCustomer = JSON.parse(
          window.localStorage.getItem("checkout_customer") || "{}"
        );
        const checkoutShippingAddress = JSON.parse(
          window.localStorage.getItem("checkout_shipping_address") || "{}"
        );

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            cart_id: cartId,
            shipping_method: shippingMethod,
            customer: checkoutCustomer,
            shipping_address: checkoutShippingAddress,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.error || "Failed to start checkout");
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        setError(err.message || "Unexpected checkout error");
      }
    }

    createSession();
  }, []);

  const options = useMemo(() => {
    if (!clientSecret) return undefined;
    return { clientSecret };
  }, [clientSecret]);

  if (error) {
    return <div style={{ padding: 24 }}>Checkout error: {error}</div>;
  }

  if (!clientSecret || !options) {
    return <div style={{ padding: 24 }}>Loading checkout…</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}