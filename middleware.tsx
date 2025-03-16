import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const cookieStore = cookies();

  // ✅ Vérifier si les cookies existent
  const accessToken = (await cookieStore).get("sb-access-token");
  if (!accessToken) {
    res.cookies.delete("sb-refresh-token");
    return res;
  }

  // ✅ Initialiser Supabase avec les cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name) => (await cookieStore).get(name)?.value || null,
        set: (name, value, options) => {
          res.cookies.set(name, value, options);
        },
        remove: (name, options) => {
          res.cookies.set(name, "", { ...options, maxAge: -1 });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("🛑 Utilisateur non authentifié, suppression des cookies...");
    res.cookies.delete("sb-access-token");
    res.cookies.delete("sb-refresh-token");
    return res;
  }

  return res;
}

// ✅ Appliquer le middleware uniquement sur `/whiteboard`
export const config = {
  matcher: ["/whiteboard/:path*"],
};
