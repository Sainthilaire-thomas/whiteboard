// app/api/zoho/auth/route.ts
import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "../../../zohoworkdrive/lib/zohoworkdrive/auth"; // Assurez-vous que le chemin est correct

export async function GET() {
  try {
    // Générer l'URL d'authentification Zoho
    const authUrl = getAuthorizationUrl();

    // Rediriger l'utilisateur vers la page d'authentification Zoho
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 }
    );
  }
}
