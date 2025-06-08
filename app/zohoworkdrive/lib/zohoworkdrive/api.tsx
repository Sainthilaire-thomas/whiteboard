// lib/zohoworkdrive/api.ts
import { ZohoAuthToken, ZohoFile, ZohoWorkdriveResponse } from "../../types"; // ✅ Import depuis les types locaux autonomes
import { refreshToken } from "./auth";
import { isTokenExpiredServer } from "../serverUtils";

// Fonction pour obtenir un token valide (rafraîchit si nécessaire)
const getValidToken = async (token: ZohoAuthToken): Promise<string> => {
  if (isTokenExpiredServer(token)) {
    const newToken = await refreshToken(token.refresh_token);
    return newToken.access_token;
  }
  return token.access_token;
};

// Fonction pour récupérer la liste des fichiers d'un dossier
export const getFiles = async (
  token: ZohoAuthToken,
  folderId: string = "root",
  page: number = 1,
  limit: number = 50
): Promise<ZohoWorkdriveResponse> => {
  console.log("getFiles called for folder:", folderId);

  const accessToken = await getValidToken(token);
  console.log("Got valid access token, length:", accessToken.length);

  // ✅ Utiliser le domaine API fourni par le token (propriété maintenant définie)
  const baseUrl = token.api_domain || "https://www.zohoapis.com";
  const WORKDRIVE_API_URL = `${baseUrl}/workdrive/api/v1`;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const endpoint = `${WORKDRIVE_API_URL}/files/${folderId}/files`;

  console.log("Making request to Zoho endpoint:", endpoint);

  try {
    const response = await fetch(`${endpoint}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
    });

    console.log("API response status:", response.status, response.statusText);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(
          `Failed to get files: ${
            errorData.errors?.[0]?.title || response.statusText
          }`
        );
      } catch (parseError) {
        console.error("Could not parse error response as JSON:", parseError);
        throw new Error(`Failed to get files: ${response.statusText}`);
      }
    }

    const data = await response.json();

    // Transformation des données
    const files: ZohoFile[] = (data.data || []).map((item: any) => ({
      id: item.id || "",
      name: item.attributes?.name || "Unknown",
      type:
        item.attributes?.type?.toLowerCase() === "folder" ? "folder" : "file",
      createdTime: item.attributes?.created_time_i18 || "",
      modifiedTime: item.attributes?.modified_time_i18 || "",
      size: item.attributes?.storage_info?.size || "0 bytes", // ✅ Maintenant string
      mimeType: item.attributes?.type || "unknown",
      parentId: item.attributes?.parent_id || "",
      thumbnailUrl: item.attributes?.thumbnail_url || "",
    }));

    return {
      data: files,
      nextPageToken: data.links?.next ? (page + 1).toString() : undefined,
    };
  } catch (error) {
    console.error("Error in getFiles:", error);
    throw error;
  }
};

// Les autres fonctions (getFileDetails, getDownloadUrl) restent inchangées
export const getFileDetails = async (
  token: ZohoAuthToken,
  fileId: string
): Promise<ZohoFile> => {
  const accessToken = await getValidToken(token);

  // ✅ Utiliser le domaine API fourni par le token (propriété maintenant définie)
  const baseUrl = token.api_domain || "https://www.zohoapis.com";
  const WORKDRIVE_API_URL = `${baseUrl}/workdrive/api/v1`;

  const response = await fetch(`${WORKDRIVE_API_URL}/files/${fileId}`, {
    method: "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get file details: ${
        error.errors?.[0]?.title || response.statusText
      }`
    );
  }

  const data = await response.json();
  const item = data.data;

  return {
    id: item.id || "",
    name: item.attributes?.name || "Unknown",
    type: item.attributes?.type?.toLowerCase() === "folder" ? "folder" : "file",
    createdTime: item.attributes?.created_time_i18 || "",
    modifiedTime: item.attributes?.modified_time_i18 || "",
    size: item.attributes?.storage_info?.size || "0 bytes", // ✅ Maintenant string
    mimeType: item.attributes?.type || "unknown",
    parentId: item.attributes?.parent_id || "",
    thumbnailUrl: item.attributes?.thumbnail_url || "",
  };
};

export const getDownloadUrl = async (
  token: ZohoAuthToken,
  fileId: string
): Promise<string> => {
  const accessToken = await getValidToken(token);

  // ✅ Utiliser le domaine API fourni par le token (propriété maintenant définie)
  const baseUrl = token.api_domain || "https://www.zohoapis.com";
  const WORKDRIVE_API_URL = `${baseUrl}/workdrive/api/v1`;

  const response = await fetch(
    `${WORKDRIVE_API_URL}/files/${fileId}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get download URL: ${
        error.errors?.[0]?.title || response.statusText
      }`
    );
  }

  // L'API retourne directement l'URL ou redirige
  const downloadUrl = response.url;
  return downloadUrl;
};

// Fonctions côté client pour interagir avec les API Next.js
export const clientGetFiles = async (
  token: ZohoAuthToken,
  folderId: string = "ly5m40e0e2d4ae7604a1fa0f5d42905cb94c9",
  page: number = 1,
  limit: number = 50
): Promise<ZohoWorkdriveResponse> => {
  // Encoder le token pour l'envoyer dans l'en-tête Authorization
  const tokenStr = Buffer.from(JSON.stringify(token)).toString("base64");

  const response = await fetch(
    `/api/zoho/workdrive?action=list&folderId=${folderId}&page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${tokenStr}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Full error response:", errorText);

    throw new Error(`Failed to get files: ${errorText}`);
  }

  return await response.json();
};

// Les autres fonctions côté client restent inchangées
export const clientGetFileDetails = async (
  token: ZohoAuthToken,
  fileId: string
): Promise<ZohoFile> => {
  const tokenStr = Buffer.from(JSON.stringify(token)).toString("base64");

  const response = await fetch(
    `/api/zoho/workdrive?action=details&fileId=${fileId}`,
    {
      headers: {
        Authorization: `Bearer ${tokenStr}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get file details: ${error.message || response.statusText}`
    );
  }

  return await response.json();
};

export const clientGetDownloadUrl = async (
  token: ZohoAuthToken,
  fileId: string
): Promise<string> => {
  const tokenStr = Buffer.from(JSON.stringify(token)).toString("base64");

  const response = await fetch(
    `/api/zoho/workdrive?action=download&fileId=${fileId}`,
    {
      headers: {
        Authorization: `Bearer ${tokenStr}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get download URL: ${error.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.downloadUrl;
};
