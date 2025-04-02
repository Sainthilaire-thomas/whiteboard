// utils/postitUtils.ts
import { ZONES } from "../constants/zone";

export const generateId = (): string =>
  `postit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const getZoneColors = (mode: string): Record<string, string> => {
  return mode === "dark"
    ? {
        [ZONES.CLIENT]: "#2c3e50", // Bleu foncé pour le mode sombre
        [ZONES.CONSEILLER]: "#34495e", // Gris-bleu foncé pour le mode sombre
        [ZONES.VOUS_AVEZ_FAIT]: "#27ae60", // Vert foncé pour le mode sombre
        [ZONES.JE_FAIS]: "#2ecc71", // Vert moyen pour le mode sombre
        [ZONES.VOUS_FEREZ]: "#16a085", // Vert-bleu pour le mode sombre
        [ZONES.ENTREPRISE_FAIT]: "#c0392b", // Rouge foncé pour le mode sombre
      }
    : {
        [ZONES.CLIENT]: "#d7e4f4", // Bleu clair pour le mode clair
        [ZONES.CONSEILLER]: "#e0e7ed", // Gris-bleu clair pour le mode clair
        [ZONES.VOUS_AVEZ_FAIT]: "#d4efdf", // Vert très clair pour le mode clair
        [ZONES.JE_FAIS]: "#abebc6", // Vert clair pour le mode clair
        [ZONES.VOUS_FEREZ]: "#a2d9ce", // Vert-bleu clair pour le mode clair
        [ZONES.ENTREPRISE_FAIT]: "#f5b7b1", // Rouge clair pour le mode clair
      };
};
