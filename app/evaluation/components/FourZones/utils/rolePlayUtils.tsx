import { ExtendedRolePlayData } from "../types/types";

/**
 * Sauvegarde les données du jeu de rôle
 * @param rolePlayData Données du jeu de rôle à sauvegarder
 * @param postitId ID du post-it associé au jeu de rôle
 * @returns Promise avec le résultat de la sauvegarde
 */
export const saveRolePlayData = async (
  rolePlayData: ExtendedRolePlayData,
  postitId: string
): Promise<any> => {
  try {
    // Ici vous devriez implémenter la logique réelle de sauvegarde
    // qui communique avec votre API ou service de stockage

    // Exemple d'implémentation simulée:
    // const response = await fetch('/api/roleplay', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     rolePlayData,
    //     postitId
    //   }),
    // });

    // if (!response.ok) {
    //   throw new Error(`Erreur HTTP: ${response.status}`);
    // }

    // return await response.json();

    // Pour simulation, retourner simplement une promesse résolue
    return Promise.resolve({
      success: true,
      message: "Données sauvegardées avec succès",
      data: {
        rolePlayData,
        postitId,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du jeu de rôle:", error);
    throw error;
  }
};

/**
 * Vérifie si un jeu de rôle est valide pour la sauvegarde
 * @param rolePlayData Données du jeu de rôle à valider
 * @returns Booléen indiquant si les données sont valides
 */
export const isValidRolePlay = (
  rolePlayData: ExtendedRolePlayData
): boolean => {
  // Vérifier que les champs requis sont présents
  if (!rolePlayData.callId || !rolePlayData.postits) {
    return false;
  }

  // Vérifier qu'il y a au moins un post-it
  if (rolePlayData.postits.length === 0) {
    return false;
  }

  // Vérifier que les textes client et conseiller sont présents
  if (!rolePlayData.clientText || !rolePlayData.conseillerText) {
    return false;
  }

  return true;
};

/**
 * Génère un résumé du jeu de rôle
 * @param rolePlayData Données du jeu de rôle
 * @returns Objet contenant des statistiques sur le jeu de rôle
 */
export const generateRolePlaySummary = (rolePlayData: ExtendedRolePlayData) => {
  if (!rolePlayData || !rolePlayData.postits) {
    return null;
  }

  // Compter les post-its par zone
  const countByZone = rolePlayData.postits.reduce((acc, postit) => {
    acc[postit.zone] = (acc[postit.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculer le ratio de zones vertes vs rouges
  const redZoneCount = countByZone["ENTREPRISE_FAIT"] || 0;
  const greenZoneCount =
    (countByZone["JE_FAIS"] || 0) +
    (countByZone["VOUS_AVEZ_FAIT"] || 0) +
    (countByZone["VOUS_FEREZ"] || 0);

  const totalPostits = rolePlayData.postits.length;

  return {
    totalPostits,
    countByZone,
    redZoneCount,
    greenZoneCount,
    redZonePercentage:
      totalPostits > 0 ? (redZoneCount / totalPostits) * 100 : 0,
    greenZonePercentage:
      totalPostits > 0 ? (greenZoneCount / totalPostits) * 100 : 0,
    date: rolePlayData.date,
  };
};
