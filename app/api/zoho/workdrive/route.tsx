import { NextRequest, NextResponse } from "next/server";
import {
  getFiles,
  getFileDetails,
  getDownloadUrl,
} from "@/app/zohoworkdrive/lib/zohoworkdrive/api";

import { ZohoAuthToken } from "@/app/zohoworkdrive/types/zoho";

export async function GET(request: NextRequest) {
  // Récupérer le token depuis les headers
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Missing or invalid token" },
      { status: 401 }
    );
  }

  try {
    // Extraire et parser le token
    const tokenStr = authHeader.split(" ")[1];
    const token = JSON.parse(
      Buffer.from(tokenStr, "base64").toString()
    ) as ZohoAuthToken;

    // Récupérer les paramètres de la requête
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    const folderId = searchParams.get("folderId");
    const fileId = searchParams.get("fileId");

    // Action à effectuer
    switch (action) {
      case "list":
        // Récupérer la liste des fichiers d'un dossier
        const folderIdStr = folderId || "ly5m40e0e2d4ae7604a1fa0f5d42905cb94c9";

        try {
          // Utiliser le domaine API fourni par le token
          const baseUrl = token.api_domain || "https://www.zohoapis.com";
          const WORKDRIVE_API_URL = `${baseUrl}/workdrive/api/v1`;

          const endpoint = `${WORKDRIVE_API_URL}/files/${folderIdStr}/files`;

          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Authorization: `Zoho-oauthtoken ${token.access_token}`,
              "Content-Type": "application/vnd.api+json",
              Accept: "application/vnd.api+json",
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error response:", errorData);
            throw new Error(
              `Failed to retrieve files: ${JSON.stringify(errorData)}`
            );
          }

          const data = await response.json();

          // Transformer les données
          const files = (data.data || []).map((item: any) => ({
            id: item.id || "",
            name: item.attributes?.name || "Unknown",
            type:
              item.attributes?.type?.toLowerCase() === "folder"
                ? "folder"
                : "file",
            createdTime: item.attributes?.created_time_i18 || "",
            modifiedTime: item.attributes?.modified_time_i18 || "",
            size: item.attributes?.storage_info?.size || "0 bytes",
            mimeType: item.attributes?.type || "unknown",
            parentId: item.attributes?.parent_id || "",
            thumbnailUrl: item.attributes?.thumbnail_url || "",
          }));

          return NextResponse.json({
            data: files,
            nextPageToken: data.links?.next ? (1 + 1).toString() : undefined,
          });
        } catch (listError) {
          console.error("Error in list action:", listError);

          return NextResponse.json(
            {
              error: "Failed to retrieve files",
              details:
                listError instanceof Error
                  ? listError.message
                  : String(listError),
            },
            { status: 500 }
          );
        }

      case "details":
        // Récupérer les détails d'un fichier
        if (!fileId) {
          return NextResponse.json(
            { error: "File ID is required" },
            { status: 400 }
          );
        }

        const fileDetails = await getFileDetails(token, fileId);
        return NextResponse.json(fileDetails);

      case "download":
        // Récupérer l'URL de téléchargement d'un fichier
        if (!fileId) {
          return NextResponse.json(
            { error: "File ID is required" },
            { status: 400 }
          );
        }

        const downloadUrl = await getDownloadUrl(token, fileId);
        return NextResponse.json({ downloadUrl });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("WorkDrive API error:", error);

    return NextResponse.json(
      {
        error: "Failed to process the request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
