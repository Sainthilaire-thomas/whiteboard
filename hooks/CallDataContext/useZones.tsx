// hooks/CallDataContext/useZones.ts
import { useState, useCallback } from "react";
import { ZoneTexts, UseZonesResult } from "@/types/types";

/**
 * Gère les textes des zones avec sélection et mise à jour.
 */
export function useZones(): UseZonesResult {
  const [zoneTexts, setZoneTexts] = useState<ZoneTexts>({
    zone1: "",
    zone2: "",
    zone3: "",
    zone4: "",
    zone5: "",
  });

  /**
   * Met à jour le texte d'une zone spécifique.
   * @param text Texte à insérer dans la zone
   * @param zone Nom de la zone à modifier
   */
  const selectTextForZone = useCallback(
    (text: string, zone: keyof ZoneTexts) => {
      setZoneTexts((prev) => ({ ...prev, [zone]: text }));
    },
    []
  );

  return { zoneTexts, selectTextForZone };
}
