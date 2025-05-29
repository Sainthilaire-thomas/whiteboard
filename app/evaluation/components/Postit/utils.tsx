// Utilitaires et fonctions helpers pour le composant Postit

import { Postit } from "@/types/types";

/**
 * Vérifie si un sujet est valide
 */
export const hasValidSubject = (postit: Postit): boolean => {
  return (
    postit?.idsujet !== null &&
    postit?.idsujet !== undefined &&
    postit?.idsujet > 0
  );
};

/**
 * Vérifie si une pratique est valide
 */
export const hasValidPractice = (postit: Postit): boolean => {
  return (
    postit?.idpratique !== null &&
    postit?.idpratique !== undefined &&
    postit?.idpratique > 0
  );
};

/**
 * Vérifie si un postit est complet
 */
export const isPostitComplete = (postit: Postit): boolean => {
  return hasValidSubject(postit) && hasValidPractice(postit);
};

/**
 * Calcule le pourcentage de complétion d'un postit
 */
export const calculatePostitCompletionPercentage = (postit: Postit): number => {
  let completionPercentage = 0;

  // Contexte (commentaire)
  if (postit?.text && postit.text.trim().length > 0) {
    completionPercentage += 25;
  }

  // Sujet
  if (hasValidSubject(postit)) {
    completionPercentage += 37.5;
  }

  // Pratique
  if (hasValidPractice(postit)) {
    completionPercentage += 37.5;
  }

  return Math.round(completionPercentage);
};

/**
 * Détermine l'étape initiale en fonction de l'état du postit
 */
export const determineInitialStep = (postit: Postit): number => {
  const hasSubject = hasValidSubject(postit);
  const hasPractice = hasValidPractice(postit);

  if (hasPractice && hasSubject) {
    return 3; // Synthèse
  }

  if (hasSubject) {
    return 2; // Pratique
  }

  return 0; // Contexte
};

/**
 * Formatte les données d'un postit pour l'API
 */
export const formatPostitForAPI = (postit: Postit) => {
  return {
    id: postit.id,
    text: postit.text || null,
    sujet: postit.sujet || null,
    idsujet: postit.idsujet || null,
    iddomaine: postit.iddomaine || null,
    pratique: postit.pratique || null,
    idpratique: postit.idpratique || null,
  };
};

/**
 * Réinitialise un postit à son état vide
 */
export const resetPostitState = (postitId: number): Partial<Postit> => {
  return {
    id: postitId,
    text: "",
    sujet: "Non Assigné",
    idsujet: null,
    iddomaine: null,
    pratique: "Non Assigné",
    idpratique: null,
  };
};

/**
 * Compare deux postits pour détecter les changements significatifs
 */
export const hasPostitChanged = (postit1: Postit, postit2: Postit): boolean => {
  return (
    postit1.idsujet !== postit2.idsujet ||
    postit1.idpratique !== postit2.idpratique ||
    postit1.text !== postit2.text
  );
};
