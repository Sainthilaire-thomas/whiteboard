/**
 * Constantes pour les étapes du jeu de rôle
 */

// Définition des étapes
export const STEPS = {
  CONTEXT_SELECTION: 0,
  ROLE_PLAY: 1,
  IMPROVEMENT: 2,
  FINAL_REVIEW: 3,
};

// Labels des étapes pour l'affichage
export const STEP_LABELS = [
  "Sélection du contexte",
  "Jeu de rôle",
  "Suggestions d'amélioration",
  "Lecture finale",
];

// Description de chaque étape
export const STEP_DESCRIPTIONS = {
  [STEPS.CONTEXT_SELECTION]:
    "Sélectionnez le texte du client et préparez votre réponse initiale.",
  [STEPS.ROLE_PLAY]:
    "Utilisez les 4 zones pour structurer votre réponse au client.",
  [STEPS.IMPROVEMENT]:
    "Améliorez votre réponse en ajoutant des éléments dans les zones appropriées.",
  [STEPS.FINAL_REVIEW]: "Révisez et écoutez votre réponse finale.",
};

// Conditions requises pour passer à l'étape suivante
export const STEP_REQUIREMENTS = {
  [STEPS.CONTEXT_SELECTION]:
    "Un texte client et une réponse conseiller sont requis.",
  [STEPS.ROLE_PLAY]: "Au moins un post-it doit être créé.",
  [STEPS.IMPROVEMENT]:
    "Vous pouvez passer à l'étape suivante quand vous êtes prêt.",
  [STEPS.FINAL_REVIEW]: "Dernière étape, aucune condition requise.",
};

/**
 * Fonction utilitaire pour vérifier si une étape est accessible
 * @param step Étape à vérifier
 * @param conditions Objet contenant les données à vérifier
 * @returns Booléen indiquant si l'étape est accessible
 */
export const canAccessStep = (
  step: number,
  conditions: {
    selectedClientText: string;
    selectedConseillerText: string;
    postitsCount: number;
  }
): boolean => {
  const { selectedClientText, selectedConseillerText, postitsCount } =
    conditions;

  switch (step) {
    case STEPS.CONTEXT_SELECTION:
      // Première étape toujours accessible
      return true;
    case STEPS.ROLE_PLAY:
      // Nécessite texte client et conseiller
      return (
        selectedClientText.trim() !== "" && selectedConseillerText.trim() !== ""
      );
    case STEPS.IMPROVEMENT:
      // Nécessite au moins un post-it
      return postitsCount > 0;
    case STEPS.FINAL_REVIEW:
      // Nécessite également au moins un post-it
      return postitsCount > 0;
    default:
      return false;
  }
};
