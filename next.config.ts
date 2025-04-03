import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["formidable", "node-fetch", "form-data"],
  },
  // Augmenter la taille maximale des corps de requête si nécessaire
  api: {
    responseLimit: "8mb",
    bodyParser: {
      sizeLimit: "8mb",
    },
  },
};

module.exports = nextConfig;
