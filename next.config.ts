import type { NextConfig } from "next";

const nextConfig = {
  // Déplacé de experimental.serverComponentsExternalPackages
  serverExternalPackages: ["formidable", "node-fetch", "form-data"],

  experimental: {
    // Autres options expérimentales peuvent rester ici
  },

  // Configurer correctement les limites d'API
  serverRuntimeConfig: {
    api: {
      responseLimit: "8mb",
      bodyParser: {
        sizeLimit: "8mb",
      },
    },
  },
};

module.exports = nextConfig;
