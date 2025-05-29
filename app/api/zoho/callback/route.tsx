// app/api/zoho/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getTokenFromCode } from "@/app/zohoworkdrive/lib/zohoworkdrive/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: `Authentication failed: ${error}` },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is missing" },
      { status: 400 }
    );
  }

  try {
    // Échanger le code d'autorisation contre un token
    const token = await getTokenFromCode(code);
    console.log("Token obtenu avec succès");

    // Rediriger vers la page principale avec le token en paramètre
    const tokenParam = encodeURIComponent(JSON.stringify(token));
    return NextResponse.redirect(
      new URL(`/zohoworkdrive?token=${tokenParam}`, request.url)
    );
  } catch (error) {
    console.error("Token exchange error:", error);
    return NextResponse.json(
      {
        error: "Failed to exchange authorization code for token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
