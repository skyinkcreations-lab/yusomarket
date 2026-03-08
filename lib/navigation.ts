// lib/navigation.ts
export type UserRole = "guest" | "customer" | "vendor" | "admin";

export type NavPlacement = "header" | "footer" | "account" | "sidebar";

export interface NavItem {
  label: string;
  href: string;
  icon?: string; // optional icon key if you want
  placement: NavPlacement[];
  minRole: UserRole;           // minimum role required
  exact?: boolean;             // for active state matching
  external?: boolean;          // for external links
}

export const NAV_ITEMS: NavItem[] = [
  // ---------- HEADER: PUBLIC ----------
  {
    label: "Home",
    href: "/",
    placement: ["header", "footer"],
    minRole: "guest",
    exact: true,
  },
  {
    label: "Store",
    href: "/store",
    placement: ["header", "footer"],
    minRole: "guest",
  },
  {
    label: "Featured",
    href: "/featured",
    placement: ["header"],
    minRole: "guest",
  },
  {
    label: "Deals",
    href: "/deals/weekly",
    placement: ["header"],
    minRole: "guest",
  },

  // ---------- HEADER: AUTH ----------
  {
    label: "My Account",
    href: "/account",
    placement: ["header", "account"],
    minRole: "customer",
  },
  {
    label: "Vendor Dashboard",
    href: "/vendor/dashboard",
    placement: ["header", "sidebar"],
    minRole: "vendor",
  },
  {
    label: "Admin",
    href: "/admin",
    placement: ["header", "sidebar"],
    minRole: "admin",
  },

  // ---------- ACCOUNT MENU ----------
  {
    label: "Orders",
    href: "/account/orders",
    placement: ["account"],
    minRole: "customer",
  },
  {
    label: "Purchases",
    href: "/account/purchases",
    placement: ["account"],
    minRole: "customer",
  },
  {
    label: "Settings",
    href: "/account/settings",
    placement: ["account"],
    minRole: "customer",
  },

  // ---------- VENDOR SIDEBAR ----------
  {
    label: "Vendor Products",
    href: "/vendor/products",
    placement: ["sidebar"],
    minRole: "vendor",
  },
  {
    label: "New Product",
    href: "/vendor/products/new",
    placement: ["sidebar"],
    minRole: "vendor",
  },
  {
    label: "Vendor Settings",
    href: "/vendor/settings",
    placement: ["sidebar"],
    minRole: "vendor",
  },

  // ---------- ADMIN SIDEBAR ----------
  {
    label: "Admin Products",
    href: "/admin/products",
    placement: ["sidebar"],
    minRole: "admin",
  },
  {
    label: "Admin Orders",
    href: "/admin/orders",
    placement: ["sidebar"],
    minRole: "admin",
  },
  {
    label: "Vendors",
    href: "/admin/vendors",
    placement: ["sidebar"],
    minRole: "admin",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    placement: ["sidebar"],
    minRole: "admin",
  },
  {
    label: "Platform Settings",
    href: "/admin/settings",
    placement: ["sidebar"],
    minRole: "admin",
  },

  // ---------- FOOTER ONLY ----------
  {
    label: "Sell on YusoMarket",
    href: "/sell",
    placement: ["footer"],
    minRole: "guest",
  },
];

const ROLE_ORDER: UserRole[] = ["guest", "customer", "vendor", "admin"];

function roleRank(role: UserRole) {
  return ROLE_ORDER.indexOf(role);
}

/**
 * Get nav items filtered by role + placement.
 */
export function getNavItems(
  role: UserRole,
  placement: NavPlacement
): NavItem[] {
  return NAV_ITEMS.filter(
    (item) =>
      item.placement.includes(placement) &&
      roleRank(role) >= roleRank(item.minRole)
  );
}
