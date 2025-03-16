"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { supabaseClient } from "@/lib/supabaseClient"; // Vérifie le chemin correct
import { ZohoContextType } from "@/types/context/ZohoContext/ZohoContextTypes"; // Vérifie le chemin correct

// Création du contexte avec un type précis
const ZohoContext = createContext<ZohoContextType | undefined>(undefined);

export const useZoho = (): ZohoContextType => {
  const context = useContext(ZohoContext);
  if (!context) {
    throw new Error("useZoho must be used within a ZohoProvider");
  }
  return context;
};

interface ZohoProviderProps {
  children: ReactNode;
}

export const ZohoProvider = ({ children }: ZohoProviderProps) => {
  const [zohoRefreshToken, setZohoRefreshToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth0();

  /**
   * Met à jour le refresh token Zoho et l'enregistre dans Supabase.
   */
  const updateZohoRefreshToken = async (token: string) => {
    console.log("Updating Zoho refreshToken:", token);
    setZohoRefreshToken(token);

    if (!isAuthenticated || !user?.email || !user?.sub) {
      console.warn("User is not authenticated or missing data.");
      return;
    }

    console.log("Updating refresh token for user:", {
      email: user.email,
      userId: user.sub,
    });

    try {
      const { error } = await supabaseClient
        .from("users")
        .update({ refresh_token: token })
        .eq("email", user.email);

      if (error) {
        console.error(
          "Failed to save refresh token in Supabase:",
          error.message
        );
      } else {
        console.log("Refresh token successfully saved in Supabase.", token);
      }
    } catch (error) {
      console.error("Unexpected error while saving refresh token:", error);
    }
  };

  return (
    <ZohoContext.Provider
      value={{
        zohoRefreshToken,
        updateZohoRefreshToken,
        accessToken,
        setAccessToken,
      }}
    >
      {children}
    </ZohoContext.Provider>
  );
};
