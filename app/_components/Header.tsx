"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";

import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useRole } from "@/app/_providers/RoleProvider";

const DESKTOP_BREAKPOINT = 960;

/** Mega menu config */
const megaColumns = [
  {
    title: "Electronics",
    slug: "electronics",
    links: [
      { label: "Phones & tablets", tag: "phones" },
      { label: "Computers & laptops", tag: "computers" },
      { label: "Cameras & photography", tag: "cameras" },
      { label: "Gaming", tag: "gaming" },
    ],
  },
  {
    title: "Home & Living",
    slug: "home-living",
    links: [
      { label: "Furniture", tag: "furniture" },
      { label: "Bedding", tag: "bedding" },
      { label: "Kitchen & dining", tag: "kitchen" },
      { label: "Storage & organisation", tag: "storage" },
    ],
  },
  {
    title: "Fashion",
    slug: "fashion",
    links: [
      { label: "Men’s clothing", tag: "mens" },
      { label: "Women’s clothing", tag: "womens" },
      { label: "Shoes", tag: "shoes" },
      { label: "Accessories", tag: "accessories" },
    ],
  },
];

const topCategories = [
  { slug: "electronics", label: "Electronics" },
  { slug: "fashion", label: "Fashion" },
  { slug: "home-living", label: "Home & Living" },
  { slug: "beauty", label: "Beauty" },
  { slug: "sports", label: "Sports" },
  { slug: "toys", label: "Toys" },
  { slug: "pets", label: "Pets" },
  { slug: "automotive", label: "Automotive" },
];

type SearchResult = {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail_url: string;
};

export default function Header() {
  const supabase = useRef(supabaseBrowser()).current;
  const { role, avatarLetter } = useRole();

  const [authUser, setAuthUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productResults, setProductResults] = useState<SearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartPulse, setCartPulse] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  const lastScrollY = useRef(0);
  const hoverTimeoutRef = useRef<any>(null);

const loadCartCount = useCallback(async () => {
  try {
    const res = await fetch("/api/cart/get", {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) return;

    const data = await res.json();

    const items = Array.isArray(data?.cart?.cart_items)
      ? data.cart.cart_items
      : [];

    const totalQty = items.reduce((sum: number, item: any) => {
      return sum + Number(item.quantity || 0);
    }, 0);

    setCartCount(totalQty);
  } catch (error) {
    console.error("Failed to load cart count", error);
  }
}, []);

    useEffect(() => {
    loadCartCount();

    const handleCartUpdated = () => {
      loadCartCount();
      setCartPulse(false);
      window.setTimeout(() => setCartPulse(true), 10);
      window.setTimeout(() => setCartPulse(false), 520);
    };

    window.addEventListener("cart:updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdated);
    };
  }, [loadCartCount]);

  const loggedIn = !!authUser;

  const accountHref =
    role === "admin"
      ? "/admin"
      : role === "vendor"
      ? "/vendor/dashboard"
      : loggedIn
      ? "/account"
      : "/login";

  /** Auth sync */
useEffect(() => {
  async function load() {
    const { data } = await supabase.auth.getUser();

    const user = data?.user ?? null;

    setAuthUser(user);
  }

  load();

  const { data: listener } = supabase.auth.onAuthStateChange(() => {
    load();
  });

  return () => listener.subscription.unsubscribe();
}, []);

  /** Responsive detection */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < DESKTOP_BREAKPOINT);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** Hide on scroll */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 0) {
        setHeaderVisible(true);
        lastScrollY.current = 0;
        return;
      }

      if (Math.abs(currentScrollY - lastScrollY.current) < 6) return;

      if (currentScrollY > lastScrollY.current) {
        setHeaderVisible(false);
        setMegaOpen(false);
      } else {
        setHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Mega open/close */
  const openMega = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setMegaOpen(true);
  };

  const scheduleMegaClose = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setMegaOpen(false), 140);
  };

  /** Search results */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setProductResults([]);
      return;
    }

    const run = async () => {
      setLoadingSearch(true);

      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, thumbnail_url")
        .ilike("name", `%${searchQuery}%`)
        .limit(20);

      setProductResults((data as SearchResult[]) || []);
      setLoadingSearch(false);
    };

    run();
  }, [searchQuery, supabase]);

  const hasQuery = searchQuery.trim().length > 0;
  const showResultsBox = !isMobile && hasQuery;
  const hasResults = productResults.length > 0;

  const goSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    window.location.href = `/search?q=${encodeURIComponent(q)}`;
  };

  const HEADER_MAX = 1400;

  return (
    <>
<header
  style={{
    position: "sticky",
    top: 0,
    zIndex: 80,

    // SOLID CLEAN WHITE
    background: "#ffffff",

    // subtle professional separation
    borderBottom: "1px solid #e5e7eb",

    // remove blur completely
    backdropFilter: "none",

    transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
    transition: "transform 0.35s ease",
  }}
>
        {/* TOP ROW */}
        <div
          style={{
            maxWidth: HEADER_MAX,
            margin: "0 auto",
            padding: isMobile ? "10px 14px" : "12px 24px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr auto 1fr" : "auto 180px 1fr auto",
            alignItems: "center",
            columnGap: 18,
          }}
        >
          {/* LEFT */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FiMenu size={18} />
              </button>
            )}
          </div>

          {/* LOGO */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isMobile ? "center" : "flex-start",
              textDecoration: "none",
            }}
          >
            <Image
              src="/YUSOMARKETLOGO.png"
              alt="YusoMarket logo"
              width={isMobile ? 142 : 150}
              height={isMobile ? 50 : 48}
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>

          {/* DESKTOP SEARCH */}
          {!isMobile && (
            <div style={{ maxWidth: 720, width: "100%", position: "relative" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 999,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                }}
              >
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goSearch();
                  }}
                  placeholder="Search products…"
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 44px 0 16px",
                    borderRadius: 999,
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#0f172a",
                    background: "transparent",
                  }}
                />

                <button
                  onClick={goSearch}
                  aria-label="Search"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    cursor: "pointer",
                    color: "#475569",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiSearch size={18} />
                </button>
              </div>

              {/* SEARCH RESULTS */}
              {showResultsBox && (
                <div
                  style={{
                    position: "absolute",
                    insetInlineStart: 0,
                    width: "100%",
                    marginTop: 8,
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 18px 40px rgba(2,6,23,0.18)",
                    zIndex: 95,
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    <span>{loadingSearch ? "Searching…" : "Results"}</span>
                    {hasResults && (
                      <button
                        onClick={goSearch}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        View all
                      </button>
                    )}
                  </div>

                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      maxHeight: 480,
                      overflowY: "auto",
                    }}
                  >
                    {hasResults ? (
                      productResults.map((product) => (
                        <li key={product.id}>
                          <Link
                            href={`/product/${product.slug}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "12px 14px",
                              textDecoration: "none",
                              color: "#0f172a",
                            }}
                          >
                            <img
                              src={product.thumbnail_url}
                              alt={product.name}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                objectFit: "cover",
                                border: "1px solid rgba(0,0,0,0.08)",
                                background: "#f8fafc",
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 13.5,
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {product.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#16a34a",
                                  marginTop: 2,
                                }}
                              >
                                ${product.price}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li
                        style={{
                          padding: "18px 14px",
                          textAlign: "center",
                          color: "#64748b",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        No products found
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* RIGHT */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifySelf: "end",
            }}
          >
            <Link href={accountHref} aria-label="Account" style={{ display: "inline-flex" }}>
              {loggedIn ? (
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #ff7a00, #ff9f2f)",
                    boxShadow: "0 6px 14px rgba(0,0,0,0.16)",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                  }}
                >
                  {avatarLetter || "U"}
                </div>
              ) : (
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#0f172a",
                  }}
                >
                  <FiUser size={18} />
                </div>
              )}
            </Link>

<Link href="/cart" aria-label="Cart" style={{ display: "inline-flex", textDecoration: "none" }}>
  <div
    className={cartPulse ? "header-cart-btn cart-bump" : "header-cart-btn"}
    style={{
      width: 38,
      height: 38,
      borderRadius: 12,
      border: "1px solid rgba(0,0,0,0.08)",
      background: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#0f172a",
      position: "relative",
      boxShadow: cartCount > 0 ? "0 8px 18px rgba(37,99,235,0.14)" : "none",
      transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
    }}
  >
    <FiShoppingCart size={18} />

    {cartCount > 0 && (
      <span
        style={{
          position: "absolute",
          top: -6,
          right: -6,
          minWidth: 18,
          height: 18,
          padding: "0 5px",
          borderRadius: 999,
          background: "#2563eb",
          color: "#fff",
          fontSize: 10,
          fontWeight: 800,
          lineHeight: "18px",
          textAlign: "center",
          boxShadow: "0 6px 14px rgba(37,99,235,0.28)",
          border: "2px solid #fff",
        }}
      >
        {cartCount > 99 ? "99+" : cartCount}
      </span>
    )}
  </div>
</Link>
          </div>
        </div>

        {/* CATEGORY BAR (DESKTOP) */}
        {!isMobile && (
          <div
            style={{
              background: "#fff",
              borderTop: "1px solid rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                maxWidth: HEADER_MAX,
                margin: "0 auto",
                padding: "8px 24px",
                display: "grid",
                gridTemplateColumns: "auto 180px 1fr auto",
                alignItems: "center",
                columnGap: 18,
              }}
            >
              <div />

              {/* All Categories */}
              <div
                onMouseEnter={openMega}
                onMouseLeave={scheduleMegaClose}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  justifySelf: "start",
                  gap: 10,
                  cursor: "pointer",
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: megaOpen ? "#0f172a" : "#fff",
                  color: megaOpen ? "#fff" : "#0f172a",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: megaOpen ? "0 10px 22px rgba(2,6,23,0.18)" : "none",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                }}
              >
                <FiMenu size={16} />
                <span>All Categories</span>
              </div>

              {/* Links */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  paddingBottom: 2,
                }}
              >
                {topCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1f2937",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      position: "relative",
                      padding: "6px 2px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#0f172a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#1f2937";
                    }}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>

              <div />
            </div>
          </div>
        )}

        {/* MEGA MENU */}
        {!isMobile && megaOpen && (
          <div
            onMouseEnter={openMega}
            onMouseLeave={scheduleMegaClose}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 10,
              zIndex: 90,
            }}
          >
            <div style={{ maxWidth: HEADER_MAX, margin: "0 auto", padding: "0 24px 18px" }}>
              <div
                style={{
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.96)",
                  backdropFilter: "blur(12px)",
                  padding: "22px 24px 26px",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 34,
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 28px 70px rgba(2,6,23,0.24)",
                }}
              >
                {megaColumns.map((col) => (
                  <div key={col.slug}>
                    <Link
                      href={`/category/${col.slug}`}
                      style={{
                        fontWeight: 800,
                        fontSize: 13.5,
                        letterSpacing: "-0.01em",
                        color: "#0f172a",
                        textDecoration: "none",
                        display: "inline-block",
                        marginBottom: 10,
                      }}
                    >
                      {col.title}
                    </Link>

                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {col.links.map((item) => (
                        <li key={item.tag} style={{ marginBottom: 8 }}>
                          <Link
                            href={`/category/${col.slug}?tag=${item.tag}`}
                            style={{
                              textDecoration: "none",
                              color: "#475569",
                              fontSize: 13,
                              fontWeight: 600,
                              display: "inline-block",
                              transition: "transform 0.16s ease, color 0.16s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateX(4px)";
                              e.currentTarget.style.color = "#0f172a";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateX(0)";
                              e.currentTarget.style.color = "#475569";
                            }}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE DRAWER */}
      {isMobile && (
        <>
          {/* BACKDROP */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: mobileMenuOpen ? "rgba(2,6,23,0.45)" : "transparent",
              opacity: mobileMenuOpen ? 1 : 0,
              pointerEvents: mobileMenuOpen ? "auto" : "none",
              transition: "opacity .2s",
              zIndex: 75,
            }}
          />

          {/* DRAWER */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              width: "84%",
              maxWidth: 340,
              background: "#fff",
              transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform .25s",
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              borderRight: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {/* Drawer header */}
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 800, color: "#0f172a" }}>Browse</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: "#fff",
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Mobile search */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div
                style={{
                  position: "relative",
                  borderRadius: 999,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                }}
              >
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setMobileMenuOpen(false);
                      goSearch();
                    }
                  }}
                  placeholder="Search products…"
                  style={{
                    width: "100%",
                    height: 40,
                    padding: "0 44px 0 14px",
                    borderRadius: 999,
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                />

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    goSearch();
                  }}
                  aria-label="Search"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    cursor: "pointer",
                    color: "#475569",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiSearch size={18} />
                </button>
              </div>

              {searchQuery.trim() && productResults.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 16,
                    overflow: "hidden",
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  {productResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        textDecoration: "none",
                        color: "#0f172a",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <img
                        src={product.thumbnail_url}
                        alt={product.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          objectFit: "cover",
                          border: "1px solid rgba(0,0,0,0.08)",
                          background: "#f8fafc",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {product.name}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                          ${product.price}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 0 18px" }}>
              <div
                style={{
                  padding: "0 16px 8px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#64748b",
                }}
              >
                Categories
              </div>

              {topCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0f172a",
                    textDecoration: "none",
                  }}
                >
                  {cat.label}
                </Link>
              ))}

              <hr style={{ margin: "12px 16px", borderColor: "rgba(0,0,0,0.06)" }} />

              <div
                style={{
                  padding: "0 16px 8px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#64748b",
                }}
              >
                Account
              </div>

              {!loggedIn && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0f172a",
                    textDecoration: "none",
                  }}
                >
                  Sign in / Register
                </Link>
              )}

              {loggedIn && role === "customer" && (
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: "block",
                    padding: "10px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#0f172a",
                    textDecoration: "none",
                  }}
                >
                  My Account
                </Link>
              )}

              {loggedIn && role === "vendor" && (
                <>
                  <Link
                    href="/vendor/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0f172a",
                      textDecoration: "none",
                    }}
                  >
                    Vendor Dashboard
                  </Link>
                  <Link
                    href="/vendor/products"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0f172a",
                      textDecoration: "none",
                    }}
                  >
                    My Products
                  </Link>
                </>
              )}

              {loggedIn && role === "admin" && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0f172a",
                      textDecoration: "none",
                    }}
                  >
                    Admin Panel
                  </Link>
                  <Link
                    href="/admin/products"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: "block",
                      padding: "10px 16px",
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#0f172a",
                      textDecoration: "none",
                    }}
                  >
                    Manage Products
                  </Link>
                </>
              )}

              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#0f172a",
                  textDecoration: "none",
                }}
              >
                My Cart{cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
            </div>
          </div>
        </>
      )}
      <style>{`
        .header-cart-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(37,99,235,0.22);
        }

        .cart-bump {
          animation: headerCartBump .45s ease;
        }

        @keyframes headerCartBump {
          0% { transform: scale(1); }
          30% { transform: scale(1.12); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}