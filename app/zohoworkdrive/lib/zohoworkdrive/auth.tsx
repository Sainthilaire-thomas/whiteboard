// lib/zohoworkdrive/auth.ts
import { ZohoAuthToken } from "../../types/zoho";

// Constants
const ZOHO_CLIENT_ID = process.env.ZOHO_CLIENT_ID || "";
const ZOHO_CLIENT_SECRET = process.env.ZOHO_CLIENT_SECRET || "";
const ZOHO_REDIRECT_URI = process.env.ZOHO_REDIRECT_URI || "";
const ZOHO_ACCOUNTS_URL = "https://accounts.zoho.com";

// Fonction pour générer l'URL d'autorisation
export const getAuthorizationUrl = (): string => {
  // Inclure tous les scopes WorkDrive pour être sûr
  const scopes = [
    "WorkDrive.files.CREATE",
    "WorkDrive.files.READ",
    "WorkDrive.files.UPDATE",
    "WorkDrive.files.DELETE",
    "WorkDrive.team.READ",
  ];

  const scope = scopes.join(",");
  const state = Math.random().toString(36).substring(2);

  return `${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?response_type=code&client_id=${ZOHO_CLIENT_ID}&scope=${scope}&redirect_uri=${ZOHO_REDIRECT_URI}&state=${state}&access_type=offline`;
};

// Fonction pour échanger le code d'autorisation contre un token
export const getTokenFromCode = async (
  code: string
): Promise<ZohoAuthToken> => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    redirect_uri: ZOHO_REDIRECT_URI,
    code,
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to get token: ${error.error || response.statusText}`
    );
  }

  const data = await response.json();

  // Ajouter la date d'expiration
  const expiresAt = Date.now() + data.expires_in * 1000;

  return {
    ...data,
    expires_at: expiresAt,
  };
};

// Fonction pour rafraîchir un token expiré
export const refreshToken = async (
  refreshToken: string
): Promise<ZohoAuthToken> => {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: ZOHO_CLIENT_ID,
    client_secret: ZOHO_CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${ZOHO_ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to refresh token: ${error.error || response.statusText}`
    );
  }

  const data = await response.json();

  // Ajouter la date d'expiration
  const expiresAt = Date.now() + data.expires_in * 1000;

  return {
    ...data,
    refresh_token: refreshToken, // Le refresh token ne change pas, on garde celui qu'on a déjà
    expires_at: expiresAt,
  };
};
