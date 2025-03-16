/**
 * Définit les types pour le contexte Zoho.
 */
export interface ZohoContextType {
  zohoRefreshToken: string | null;
  updateZohoRefreshToken: (token: string) => Promise<void>;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}
