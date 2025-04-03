"use client";

import dynamic from "next/dynamic";
import { PostitType } from "../types/types";

// Définir le type pour les props
interface DynamicSpeechToTextForFourZonesProps {
  onAddPostits: (postits: PostitType[]) => void;
  isContextual?: boolean;
}

// Charger le composant de manière dynamique côté client uniquement
const DynamicSpeechToTextForFourZones =
  dynamic<DynamicSpeechToTextForFourZonesProps>(
    () => import("./SpeechToTextForFourZones"),
    {
      ssr: false, // Désactive le rendu côté serveur
      loading: () => (
        <div
          style={{
            padding: (isContextual) => (isContextual ? "8px" : "16px"),
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            margin: (isContextual) => (isContextual ? "8px 0" : "16px 0"),
            fontSize: (isContextual) => (isContextual ? "0.875rem" : "1rem"),
          }}
        >
          Chargement du module de reconnaissance vocale...
        </div>
      ),
    }
  );

export default DynamicSpeechToTextForFourZones;
