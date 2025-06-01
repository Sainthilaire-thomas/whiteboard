import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Désactiver ESLint temporairement pour le déploiement
  eslint: {
    ignoreDuringBuilds: true,
  },

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

export default nextConfig;
