// lib/supabaseBrowser.ts
import { createBrowserClient } from "@supabase/ssr";

let browserClient: any = null;

export function supabaseBrowser() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            // 👇 Ensures RLS treats this as the public anon client
            "X-Client-Info": "public-browser",
          },
        },
      }
    );
  }

  return browserClient;
}
