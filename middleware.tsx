// middleware.ts
// Version simplifiée compatible Next.js 15 - sans cookies() sync

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // ✅ Simplification : laisser les routes API gérer leur propre authentification
  if (request.nextUrl.pathname.startsWith("/api/evaluation-sharing/")) {
    console.log("🔍 Middleware - API route detected:", {
      path: request.nextUrl.pathname,
      method: request.method,
      hasAuthHeader: !!request.headers.get("authorization"),
    });

    // Juste laisser passer - chaque route API gère sa propre auth
    return res;
  }

  // Pour toutes les autres routes, comportement normal
  return res;
}

export const config = {
  matcher: [
    // Exclure les fichiers statiques et les routes internes
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Inclure spécifiquement les routes API
    "/api/(.*)",
  ],
};
