"use client";

import { Postit, StatsData } from "@/types/evaluation";

/**
 * Filtre les postits par sujet
 * @param postits - Liste des postits
 * @param sujet - Sujet à filtrer
 * @returns Postits filtrés
 */
export const filterPostitsBySujet = (
  postits: Postit[],
  sujet?: string | null
): Postit[] => {
  if (!sujet) return postits;

  return postits.filter((postit) => postit.sujet === sujet);
};

/**
 * Filtre les postits par pratique
 * @param postits - Liste des postits
 * @param pratique - Pratique à filtrer
 * @returns Postits filtrés
 */
export const filterPostitsByPratique = (
  postits: Postit[],
  pratique?: string | null
): Postit[] => {
  if (!pratique) return postits;

  return postits.filter((postit) => postit.pratique === pratique);
};

/**
 * Type pour les critères de tri
 */
export type SortCriteria = "timestamp" | "alpha" | "pratique";

/**
 * Trie les postits selon différents critères
 * @param postits - Liste des postits
 * @param sortCriteria - Critère de tri
 * @returns Postits triés
 */
export const sortPostits = (
  postits: Postit[],
  sortCriteria: SortCriteria
): Postit[] => {
  if (!postits || !postits.length) return [];

  const sortedPostits = [...postits];

  switch (sortCriteria) {
    case "timestamp":
      return sortedPostits.sort(
        (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
      );

    case "alpha":
      return sortedPostits.sort((a, b) =>
        (a.sujet || "").localeCompare(b.sujet || "")
      );

    case "pratique":
      return sortedPostits.sort((a, b) =>
        (a.pratique || "").localeCompare(b.pratique || "")
      );

    default:
      return sortedPostits;
  }
};

/**
 * Extrait les statistiques d'un ensemble de postits
 * @param postits - Liste des postits
 * @returns Statistiques
 */
export const getPostitStatistics = (postits: Postit[]): StatsData => {
  if (!postits || !postits.length) {
    return {
      totalPostits: 0,
      uniqueSujets: 0,
      uniquePratiques: 0,
      sujetsDetails: [],
      pratiquesDetails: [],
    };
  }

  const uniqueSujets = [
    ...new Set(postits.map((p) => p.sujet).filter(Boolean)),
  ];
  const uniquePratiques = [
    ...new Set(postits.map((p) => p.pratique).filter(Boolean)),
  ];

  return {
    totalPostits: postits.length,
    uniqueSujets: uniqueSujets.length,
    uniquePratiques: uniquePratiques.length,
    sujetsDetails: uniqueSujets.map((sujet) => ({
      name: sujet as string,
      count: postits.filter((p) => p.sujet === sujet).length,
    })),
    pratiquesDetails: uniquePratiques.map((pratique) => ({
      name: pratique as string,
      count: postits.filter((p) => p.pratique === pratique).length,
    })),
  };
};
