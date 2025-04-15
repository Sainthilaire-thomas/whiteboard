"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ZohoAuthToken } from "./types/zoho";
import WorkdriveExplorer from "./components/WorkdriveExplorer";

export default function ZohoWorkdrivePage() {
  const [token, setToken] = useState<ZohoAuthToken | null>(null);
  const searchParams = useSearchParams();

  // Récupérer le token depuis les paramètres d'URL (utilisé après le callback d'authentification)
  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (tokenParam) {
      try {
        const parsedToken = JSON.parse(
          decodeURIComponent(tokenParam)
        ) as ZohoAuthToken;
        setToken(parsedToken);

        // Supprimer le token de l'URL (pour éviter qu'il reste dans l'historique)
        window.history.replaceState({}, document.title, "/zohoworkdrive");
      } catch (error) {
        console.error("Failed to parse token:", error);
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkdriveExplorer initialToken={token} />
    </div>
  );
}
