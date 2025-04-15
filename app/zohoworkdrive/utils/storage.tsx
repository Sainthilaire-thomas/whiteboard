"use client";

import { ZohoAuthToken } from "../types/zoho";

// Fonction pour sauvegarder le token dans le localStorage côté client
export const saveToken = (token: ZohoAuthToken): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("zohoToken", JSON.stringify(token));
  }
};

// Fonction pour récupérer le token du localStorage côté client
export const getToken = (): ZohoAuthToken | null => {
  if (typeof window !== "undefined") {
    const tokenStr = localStorage.getItem("zohoToken");
    if (tokenStr) {
      return JSON.parse(tokenStr);
    }
  }
  return null;
};

// Fonction pour supprimer le token du localStorage côté client
export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("zohoToken");
  }
};

// Fonction pour vérifier si le token est expiré
export const isTokenExpired = (token: ZohoAuthToken): boolean => {
  return Date.now() > token.expires_at;
};
