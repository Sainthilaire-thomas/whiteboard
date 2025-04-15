// app/zohoworkdrive/lib/serverUtils.ts
import { ZohoAuthToken } from "../types/zoho";

// Version serveur pour vérifier si le token est expiré
export const isTokenExpiredServer = (token: ZohoAuthToken): boolean => {
  return Date.now() > token.expires_at;
};
