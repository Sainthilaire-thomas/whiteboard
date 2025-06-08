// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createSupabaseServer = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // L'appel `set` échoue si appelé depuis un Server Component.
            // Cela peut être ignoré si vous avez middleware qui rafraîchit les
            // sessions utilisateur.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // L'appel `remove` échoue si appelé depuis un Server Component.
            // Cela peut être ignoré si vous avez middleware qui rafraîchit les
            // sessions utilisateur.
          }
        },
      },
    }
  );
};

// Version synchrone pour les cas où vous ne pouvez pas utiliser async
export const createSupabaseServerSync = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Pour la version synchrone, on ne peut pas accéder aux cookies
          // Cette version est limitée mais fonctionne pour certains cas d'usage
          return undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Pas d'action pour la version synchrone
        },
        remove(name: string, options: CookieOptions) {
          // Pas d'action pour la version synchrone
        },
      },
    }
  );
};
