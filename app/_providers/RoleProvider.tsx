"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type RoleContextType = {
  role: "admin" | "vendor" | "customer" | null;
  isLoggedIn: boolean;
  avatarLetter: string | null;
  loading: boolean;
  refreshRole: () => Promise<void>;
};

const RoleContext = createContext<RoleContextType>({
  role: null,
  isLoggedIn: false,
  avatarLetter: null,
  loading: true,
  refreshRole: async () => {},
});

export const useRole = () => useContext(RoleContext);

export default function RoleProvider({ children }: { children: React.ReactNode }) {
  const supabase = supabaseBrowser();

  const [role, setRole] = useState<"admin" | "vendor" | "customer" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [avatarLetter, setAvatarLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /** ==================================================
   * LOAD USER + ROLE (profiles table)
   * ================================================== */
  const loadUser = async () => {
    setLoading(true);

    // Pull session
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
      setIsLoggedIn(false);
      setRole(null);
      setAvatarLetter(null);
      setLoading(false);
      return;
    }

    const user = session.user;

    setIsLoggedIn(true);
    setAvatarLetter(user.email?.charAt(0).toUpperCase() || "U");

    // Pull ROLE from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // final fallback
    const r =
      profile?.role === "admin"
        ? "admin"
        : profile?.role === "vendor"
        ? "vendor"
        : "customer";

    setRole(r);
    setLoading(false);
  };

  /** Allow external components/APIs to refresh role */
  const refreshRole = async () => {
    await loadUser();
  };

  /** ==================================================
   * INITIAL LOAD
   * ================================================== */
  useEffect(() => {
    loadUser();
  }, []);

  /** ==================================================
   * REALTIME AUTH LISTENER
   * login / logout / refresh token / tab change
   * ================================================== */
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async () => {
        await loadUser();
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        isLoggedIn,
        avatarLetter,
        loading,
        refreshRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}
