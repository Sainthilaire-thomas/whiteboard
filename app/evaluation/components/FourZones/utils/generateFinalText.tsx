// utils/generateFinalText.ts
import { PostitType } from "../types/types";
import { ZONES } from "../constants/zone";

/**
 * Génère le texte final du conseiller UNIQUEMENT à partir des post-its retravaillés
 * VERSION TTS-READY : Optimisé pour la synthèse vocale avec ponctuation et pauses
 */
export const generateFinalConseillerText = (postits: PostitType[]): string => {
  // FILTRER UNIQUEMENT les post-its retravaillés (non-originaux)
  const improvedPostits = postits.filter((postit) => !postit.isOriginal);

  // Organiser les post-its retravaillés par zone dans l'ordre logique de présentation
  const orderedZones = [
    ZONES.VOUS_AVEZ_FAIT, // 1. Reconnaissance
    ZONES.JE_FAIS, // 2. Actions conseiller
    ZONES.ENTREPRISE_FAIT, // 3. Contexte entreprise
    ZONES.VOUS_FEREZ, // 4. Prochaines étapes
  ];

  const zoneSections: string[] = [];

  orderedZones.forEach((zone) => {
    const zonePostits = improvedPostits.filter((p) => p.zone === zone);

    if (zonePostits.length > 0) {
      const elements = zonePostits
        .map((p) => p.content.trim())
        .filter((content) => content.length > 0)
        .map((content) => formatContentForTTS(content));

      if (elements.length > 0) {
        // Joindre les éléments de la même zone avec des virgules pour des pauses courtes
        const zoneText = elements.join(", ");
        zoneSections.push(zoneText);
      }
    }
  });

  if (zoneSections.length === 0) {
    return "";
  }

  // Joindre les sections de zones avec des points pour des pauses plus longues
  const finalText = zoneSections.join(". ");

  // S'assurer que le texte se termine par un point
  const cleanedText = finalText.replace(/[.]{2,}/g, ".").replace(/[,.]$/, "");

  return cleanedText + ".";
};

/**
 * Formate un contenu de post-it pour optimiser la lecture TTS
 */
const formatContentForTTS = (content: string): string => {
  let formatted = content.trim();

  // Supprimer les points en fin s'il y en a (pour éviter les doublons)
  formatted = formatted.replace(/[.,;!?]+$/, "");

  // Ajouter des pauses après certains mots de liaison
  formatted = formatted.replace(
    /\b(alors|donc|ensuite|puis|également|aussi|en effet|par ailleurs|cependant|néanmoins)\b/gi,
    "$1,"
  );

  // Ajouter une pause après "Monsieur" ou "Madame"
  formatted = formatted.replace(
    /\b(Monsieur|Madame|M\.|Mme)\s+([A-Z])/g,
    "$1, $2"
  );

  // Ajouter des pauses pour les expressions temporelles
  formatted = formatted.replace(
    /\b(aujourd'hui|demain|cette semaine|la semaine prochaine|dans \d+\s+jours?)\b/gi,
    "$1,"
  );

  // Ajouter des pauses pour les formules de politesse en début
  formatted = formatted.replace(
    /^(Je vous remercie|Merci|Excusez-moi|Pardon)/i,
    "$1,"
  );

  return formatted;
};

/**
 * VERSION ALTERNATIVE : Génère le texte avec des pauses SSML pour un contrôle avancé
 * Compatible avec les moteurs TTS qui supportent SSML
 */
export const generateFinalConseillerTextSSML = (
  postits: PostitType[]
): string => {
  const improvedPostits = postits.filter((postit) => !postit.isOriginal);

  const orderedZones = [
    { zone: ZONES.VOUS_AVEZ_FAIT, pause: "0.8s" },
    { zone: ZONES.JE_FAIS, pause: "0.6s" },
    { zone: ZONES.ENTREPRISE_FAIT, pause: "0.6s" },
    { zone: ZONES.VOUS_FEREZ, pause: "0.8s" },
  ];

  const zoneSections: string[] = [];

  orderedZones.forEach(({ zone, pause }) => {
    const zonePostits = improvedPostits.filter((p) => p.zone === zone);

    if (zonePostits.length > 0) {
      const elements = zonePostits
        .map((p) => p.content.trim())
        .filter((content) => content.length > 0);

      if (elements.length > 0) {
        const zoneText = elements.join(`<break time="0.3s"/> `);
        zoneSections.push(zoneText + `<break time="${pause}"/>`);
      }
    }
  });

  if (zoneSections.length === 0) {
    return "";
  }

  return `<speak>${zoneSections.join(" ")}</speak>`;
};

/**
 * Génère le texte avec des marqueurs de pauses personnalisés
 * Utile pour les systèmes TTS qui acceptent des marqueurs spéciaux
 */
export const generateFinalConseillerTextWithPauses = (
  postits: PostitType[]
): string => {
  const improvedPostits = postits.filter((postit) => !postit.isOriginal);

  const orderedZones = [
    { zone: ZONES.VOUS_AVEZ_FAIT, pauseMarker: "[PAUSE_LONG]" },
    { zone: ZONES.JE_FAIS, pauseMarker: "[PAUSE_MOYEN]" },
    { zone: ZONES.ENTREPRISE_FAIT, pauseMarker: "[PAUSE_MOYEN]" },
    { zone: ZONES.VOUS_FEREZ, pauseMarker: "[PAUSE_LONG]" },
  ];

  const zoneSections: string[] = [];

  orderedZones.forEach(({ zone, pauseMarker }) => {
    const zonePostits = improvedPostits.filter((p) => p.zone === zone);

    if (zonePostits.length > 0) {
      const elements = zonePostits
        .map((p) => formatContentForTTS(p.content.trim()))
        .filter((content) => content.length > 0);

      if (elements.length > 0) {
        const zoneText = elements.join("[PAUSE_COURT] ");
        zoneSections.push(zoneText + " " + pauseMarker);
      }
    }
  });

  if (zoneSections.length === 0) {
    return "";
  }

  return zoneSections.join(" ").replace(/\s+/g, " ").trim() + ".";
};

/**
 * VERSION ALTERNATIVE : Génère le texte final avec séparation par zones
 * Utile si on veut maintenir une structure visible par zone
 */
export const generateFinalConseillerTextByZones = (
  postits: PostitType[]
): string => {
  const postitsParZone = {
    [ZONES.VOUS_AVEZ_FAIT]: postits.filter(
      (p) => p.zone === ZONES.VOUS_AVEZ_FAIT
    ),
    [ZONES.JE_FAIS]: postits.filter((p) => p.zone === ZONES.JE_FAIS),
    [ZONES.ENTREPRISE_FAIT]: postits.filter(
      (p) => p.zone === ZONES.ENTREPRISE_FAIT
    ),
    [ZONES.VOUS_FEREZ]: postits.filter((p) => p.zone === ZONES.VOUS_FEREZ),
  };

  const sections: string[] = [];

  // Chaque zone devient un paragraphe séparé
  Object.values(postitsParZone).forEach((zonePostits) => {
    if (zonePostits.length > 0) {
      const elements = zonePostits
        .map((p) => p.content.trim())
        .filter((content) => content.length > 0);

      if (elements.length > 0) {
        // Joindre les éléments de la même zone avec des espaces
        sections.push(elements.join(" "));
      }
    }
  });

  // Joindre les sections avec des retours à la ligne pour séparer les zones
  return sections.join("\n\n");
};

/**
 * Génère un résumé structuré des éléments par zone (pour affichage avec formatting)
 */
export const generateStructuredSummary = (postits: PostitType[]): string => {
  const postitsParZone = {
    [ZONES.VOUS_AVEZ_FAIT]: postits.filter(
      (p) => p.zone === ZONES.VOUS_AVEZ_FAIT
    ),
    [ZONES.JE_FAIS]: postits.filter((p) => p.zone === ZONES.JE_FAIS),
    [ZONES.ENTREPRISE_FAIT]: postits.filter(
      (p) => p.zone === ZONES.ENTREPRISE_FAIT
    ),
    [ZONES.VOUS_FEREZ]: postits.filter((p) => p.zone === ZONES.VOUS_FEREZ),
  };

  const sections: string[] = [];
  const zoneLabels = {
    [ZONES.VOUS_AVEZ_FAIT]: "Ce que vous avez fait",
    [ZONES.JE_FAIS]: "Ce que je fais pour vous",
    [ZONES.ENTREPRISE_FAIT]: "Notre organisation",
    [ZONES.VOUS_FEREZ]: "Vos prochaines étapes",
  };

  // Structure avec titres pour un rendu plus clair
  Object.entries(postitsParZone).forEach(([zone, zonePostits]) => {
    if (zonePostits.length > 0) {
      sections.push(`**${zoneLabels[zone]}:**`);
      zonePostits.forEach((p) => {
        sections.push(`• ${p.content.trim()}`);
      });
      sections.push(""); // Ligne vide entre les sections
    }
  });

  return sections.join("\n");
};

/**
 * Génère le texte final en préservant UNIQUEMENT les post-its retravaillés (non-originaux)
 * Utile pour avoir la version "améliorée" pure
 */
export const generateImprovedConseillerText = (
  postits: PostitType[]
): string => {
  // Filtrer uniquement les post-its retravaillés
  const improvedPostits = postits.filter((postit) => !postit.isOriginal);

  const postitsParZone = {
    [ZONES.VOUS_AVEZ_FAIT]: improvedPostits.filter(
      (p) => p.zone === ZONES.VOUS_AVEZ_FAIT
    ),
    [ZONES.JE_FAIS]: improvedPostits.filter((p) => p.zone === ZONES.JE_FAIS),
    [ZONES.ENTREPRISE_FAIT]: improvedPostits.filter(
      (p) => p.zone === ZONES.ENTREPRISE_FAIT
    ),
    [ZONES.VOUS_FEREZ]: improvedPostits.filter(
      (p) => p.zone === ZONES.VOUS_FEREZ
    ),
  };

  const sections: string[] = [];

  // Assembler tous les textes retravaillés sans mots de liaison
  Object.values(postitsParZone).forEach((zonePostits) => {
    if (zonePostits.length > 0) {
      const elements = zonePostits
        .map((p) => p.content.trim())
        .filter((content) => content.length > 0);

      if (elements.length > 0) {
        sections.push(...elements);
      }
    }
  });

  return sections.join(" ").trim();
};

/**
 * Vérifie si les post-its contiennent du contenu retravaillé (non-original)
 */
export const hasImprovedContent = (postits: PostitType[]): boolean => {
  return postits.some(
    (postit) =>
      !postit.isOriginal && // UNIQUEMENT les post-its retravaillés
      postit.zone &&
      postit.content.trim().length > 0 &&
      [
        ZONES.VOUS_AVEZ_FAIT,
        ZONES.JE_FAIS,
        ZONES.ENTREPRISE_FAIT,
        ZONES.VOUS_FEREZ,
      ].includes(postit.zone)
  );
};

/**
 * Vérifie si il y a du contenu spécifiquement retravaillé (non-original)
 */
export const hasReworkedContent = (postits: PostitType[]): boolean => {
  return postits.some(
    (postit) =>
      !postit.isOriginal &&
      postit.zone &&
      postit.content.trim().length > 0 &&
      [
        ZONES.VOUS_AVEZ_FAIT,
        ZONES.JE_FAIS,
        ZONES.ENTREPRISE_FAIT,
        ZONES.VOUS_FEREZ,
      ].includes(postit.zone)
  );
};

export const createDefaultReadingOrder = (
  postits: PostitType[]
): PostitType[] => {
  const improvedPostits = postits.filter((postit) => !postit.isOriginal);

  const zoneOrder = [
    ZONES.VOUS_AVEZ_FAIT,
    ZONES.JE_FAIS,
    ZONES.ENTREPRISE_FAIT,
    ZONES.VOUS_FEREZ,
  ];

  const orderedPostits: PostitType[] = [];

  zoneOrder.forEach((zone) => {
    const zonePostits = improvedPostits.filter((p) => p.zone === zone);
    orderedPostits.push(...zonePostits);
  });

  return orderedPostits;
};

export const generateFinalConseillerTextWithCustomOrder = (
  postits: PostitType[],
  customOrder?: PostitType[]
): string => {
  if (customOrder && customOrder.length > 0) {
    // Utiliser l'ordre personnalisé
    const elements = customOrder
      .map((p) => formatContentForTTS(p.content.trim()))
      .filter((content) => content.length > 0);

    if (elements.length === 0) return "";

    const finalText = elements.join(", ");
    const cleanedText = finalText.replace(/[.]{2,}/g, ".").replace(/[,.]$/, "");
    return cleanedText + ".";
  }

  // Sinon, utiliser la fonction existante avec ordre par défaut
  return generateFinalConseillerText(postits);
};
