"use client";

/**
 * Formatage du timecode en format MM:SS
 * @param timestamp - Temps en secondes
 * @returns Temps formaté en MM:SS
 */
export const formatTimecode = (timestamp?: number | null): string => {
  if (timestamp === undefined || timestamp === null) return "00:00";

  const minutes = Math.floor(timestamp / 60);
  const seconds = Math.floor(timestamp % 60);

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

/**
 * Formate le nom du motif pour l'affichage
 * @param motif - Motif à formater
 * @returns Motif formaté
 */
export const formatMotif = (motif?: string | null): string => {
  if (!motif) return "";

  return motif
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Tronque un texte à une certaine longueur
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale
 * @returns Texte tronqué
 */
export const truncateText = (text?: string | null, maxLength = 150): string => {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength) + "...";
};
