"use client";

import { Button, Typography } from "@mui/material";

// Définition des props avec TypeScript
interface AuthButtonProps {
  onSuccess?: () => void;
}

const AuthButton = ({ onSuccess }: AuthButtonProps) => {
  // Fonction pour gérer l'authentification avec Zoho
  const handleAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_ZOHO_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      console.error("❌ Les variables d'environnement sont manquantes.");
      alert(
        "Les variables d'environnement sont manquantes. Vérifiez votre configuration."
      );
      return;
    }

    const scope =
      "WorkDrive.teamfolders.READ,WorkDrive.team.READ,WorkDrive.files.READ,ZohoFiles.files.READ,WorkDrive.files.CREATE,offline_access";
    const responseType = "code";
    const accessType = "offline";
    const prompt = "consent";

    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;

    window.location.href = authUrl;

    if (onSuccess) onSuccess();
  };

  return (
    <Button variant="contained" color="secondary" onClick={handleAuth}>
      <Typography variant="caption" sx={{ fontSize: "10px" }}>
        🔐 Authentifiez-vous avec Zoho WorkDrive
      </Typography>
    </Button>
  );
};

export default AuthButton;
