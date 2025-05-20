// utils/auth0TokenStorage.ts

import Cookies from "js-cookie";

// Durée de vie des cookies en jours
const TOKEN_EXPIRY = 1; // 1 jour, ajustez selon la durée de validité de vos tokens

// Stocke le token JWT Auth0 dans les cookies pour qu'il soit accessible côté serveur
export const storeAuth0Token = (token: string): void => {
  // Utiliser les cookies pour que le token soit accessible par le middleware et les API routes
  Cookies.set("auth0_token", token, {
    expires: TOKEN_EXPIRY,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Également stocker dans localStorage pour les opérations côté client
  localStorage.setItem("auth0_token", token);
};

// Récupère le token JWT Auth0
export const getAuth0Token = (): string | null => {
  // Préférer la version des cookies, qui est partagée avec le serveur
  return Cookies.get("auth0_token") || localStorage.getItem("auth0_token");
};

// Supprime le token JWT Auth0 lors de la déconnexion
export const removeAuth0Token = (): void => {
  Cookies.remove("auth0_token");
  localStorage.removeItem("auth0_token");
};
