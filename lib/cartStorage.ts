// lib/cartStorage.ts
export type StoredCartItem = {
  product: {
    id: string;
    name: string;
    price: number;
    thumbnail_url?: string | null;
  };
  quantity: number;
};

const KEY = "yuso_cart";

export function getCart(): StoredCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function setCart(items: StoredCartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("yuso_cart_updated"));
}

export function addToCart(product: StoredCartItem["product"], qty = 1) {
  const cart = getCart();
  const existing = cart.find(i => i.product.id === product.id);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ product, quantity: qty });
  }

  setCart(cart);
}

export function removeFromCart(productId: string) {
  setCart(getCart().filter(i => i.product.id !== productId));
}

export function updateQuantity(productId: string, qty: number) {
  if (qty <= 0) return removeFromCart(productId);

  const cart = getCart();
  const item = cart.find(i => i.product.id === productId);
  if (item) item.quantity = qty;
  setCart(cart);
}
