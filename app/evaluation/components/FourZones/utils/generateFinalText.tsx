// utils/generateFinalText.ts - Version enrichie avec métadonnées de zones
import { PostitType } from "../types/types";
import { ZONES } from "../constants/zone";

// ✅ NOUVEAUX TYPES pour les segments enrichis
export interface ZoneAwareTextSegment {
  id: string;
  content: string;
  type: "zone" | "sentence" | "paragraph";

  // Métadonnées d'origine
  sourceZone?: string; // Clé de la zone (VOUS_AVEZ_FAIT, JE_FAIS, etc.)
  zoneName?: string; // Nom affiché de la zone
  zoneOrder?: number; // Ordre dans la séquence (1, 2, 3, 4)
  zoneColor?: string; // Couleur associée à la zone
  isFromRework?: boolean; // Vrai si provient d'un post-it retravaillé
  postitIds?: string[]; // IDs des post-its sources
}

export interface ZoneComposition {
  segments: ZoneAwareTextSegment[];
  fullText: string;
  hasReworkedContent: boolean;
  originalText?: string;
  stats: {
    totalSegments: number;
    reworkedSegments: number;
    originalLength: number;
    finalLength: number;
    proactivityPercentage: number; // ✅ NOUVEAU
  };
}

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
 * Calcule le pourcentage de proactivité basé sur les zones d'action vs contexte
 * Zones proactives : VOUS_AVEZ_FAIT, JE_FAIS, VOUS_FEREZ
 * Zones contextuelles : ENTREPRISE_FAIT
 */
const calculateProactivityPercentage = (
  segments: ZoneAwareTextSegment[]
): number => {
  if (!segments || segments.length === 0) {
    return 0;
  }

  // Zones considérées comme proactives (action orientée client)
  const proactiveZones = [
    ZONES.VOUS_AVEZ_FAIT, // Reconnaissance
    ZONES.JE_FAIS, // Actions conseiller
    ZONES.VOUS_FEREZ, // Prochaines étapes client
  ];

  let totalLength = 0;
  let proactiveLength = 0;

  segments.forEach((segment, index) => {
    const segmentLength = segment.content?.length || 0;
    totalLength += segmentLength;

    if (segment.sourceZone && proactiveZones.includes(segment.sourceZone)) {
      proactiveLength += segmentLength;
    } else {
      console.log(`❌ Zone non-proactive ou undefined: ${segment.sourceZone}`);
    }
  });

  if (totalLength === 0) {
    return 0;
  }

  const percentage = Math.round((proactiveLength / totalLength) * 100);

  return percentage;
};

// ✅ FONCTION PRINCIPALE - Génération de composition enrichie
export const generateZoneAwareComposition = (
  postits: PostitType[],
  zoneColors: Record<string, string>,
  originalText?: string
): ZoneComposition => {
  // Filtrer uniquement les post-its retravaillés
  const improvedPostits = postits.filter((postit) => !postit.isOriginal);

  // Configuration des zones dans l'ordre logique
  const orderedZones = [
    {
      key: ZONES.VOUS_AVEZ_FAIT,
      name: "Reconnaissance",
      order: 1,
      description: "Ce que vous avez fait",
    },
    {
      key: ZONES.JE_FAIS,
      name: "Actions conseiller",
      order: 2,
      description: "Ce que je fais pour vous",
    },
    {
      key: ZONES.ENTREPRISE_FAIT,
      name: "Contexte entreprise",
      order: 3,
      description: "Notre organisation",
    },
    {
      key: ZONES.VOUS_FEREZ,
      name: "Prochaines étapes",
      order: 4,
      description: "Vos prochaines étapes",
    },
  ];

  const segments: ZoneAwareTextSegment[] = [];
  const textParts: string[] = [];

  // Traitement zone par zone
  orderedZones.forEach((zone) => {
    const zonePostits = improvedPostits.filter((p) => p.zone === zone.key);

    if (zonePostits.length > 0) {
      // Concaténer et formater le contenu de la zone
      const elements = zonePostits
        .map((p) => formatContentForTTS(p.content.trim()))
        .filter((content) => content.length > 0);

      if (elements.length > 0) {
        const content = elements.join(", ");

        // Créer le segment enrichi
        const segment: ZoneAwareTextSegment = {
          id: `zone-${zone.key}`,
          content,
          type: "zone",
          sourceZone: zone.key,
          zoneName: zone.name,
          zoneOrder: zone.order,
          zoneColor: zoneColors[zone.key],
          isFromRework: true,
          postitIds: zonePostits.map(
            (p) => p.id?.toString() || `postit-${Date.now()}`
          ),
        };

        segments.push(segment);
        textParts.push(content);
      }
    }
  });

  // Texte final assemblé
  const fullText = textParts.length > 0 ? textParts.join(". ") + "." : "";

  // Calcul du pourcentage de proactivité avec logs explicites

  let proactivityPercentage = 0;

  try {
    proactivityPercentage = calculateProactivityPercentage(segments);
  } catch (error) {
    console.error("❌ Erreur dans calculateProactivityPercentage:", error);
    proactivityPercentage = 0;
  }

  // Statistiques avec le calcul de proactivité
  const stats = {
    totalSegments: segments.length,
    reworkedSegments: segments.filter((s) => s.isFromRework).length,
    originalLength: originalText?.length || 0,
    finalLength: fullText.length,
    proactivityPercentage, // ✅ Maintenant inclus !
  };

  const result = {
    segments,
    fullText,
    hasReworkedContent: segments.length > 0,
    originalText,
    stats,
  };

  return result;
};

// ✅ FONCTION pour créer une composition à partir du texte original (fallback)
export const createOriginalComposition = (
  originalText: string,
  zoneColors: Record<string, string>
): ZoneComposition => {
  const segments: ZoneAwareTextSegment[] = [];

  if (originalText.trim()) {
    segments.push({
      id: "original-text",
      content: originalText,
      type: "zone",
      sourceZone: "ORIGINAL",
      zoneName: "Texte original",
      zoneOrder: 1,
      zoneColor: zoneColors.default || "#9e9e9e",
      isFromRework: false,
      postitIds: [],
    });
  }

  return {
    segments,
    fullText: originalText,
    hasReworkedContent: false,
    originalText,
    stats: {
      totalSegments: segments.length,
      reworkedSegments: 0,
      originalLength: originalText.length,
      finalLength: originalText.length,
      proactivityPercentage: 0, // ✅ Pas de calcul pour le texte original
    },
  };
};

// ✅ FONCTIONS EXISTANTES (gardées pour compatibilité)

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

// ✅ NOUVELLES FONCTIONS UTILITAIRES

/**
 * Génère les statistiques de comparaison entre texte original et retravaillé
 */
export const generateComparisonStats = (
  originalText: string,
  finalText: string,
  segments: ZoneAwareTextSegment[]
): {
  lengthDifference: number;
  percentageChange: number;
  zonesUsed: string[];
  reworkedSegments: number;
} => {
  const lengthDifference = finalText.length - originalText.length;
  const percentageChange =
    originalText.length > 0
      ? Math.round((lengthDifference / originalText.length) * 100)
      : 0;

  const zonesUsed = [
    ...new Set(
      segments
        .filter((s) => s.isFromRework)
        .map((s) => s.zoneName)
        .filter(Boolean)
    ),
  ] as string[];

  const reworkedSegments = segments.filter((s) => s.isFromRework).length;

  return {
    lengthDifference,
    percentageChange,
    zonesUsed,
    reworkedSegments,
  };
};

/**
 * Génère un ordre personnalisé des segments pour la lecture
 */
export const createCustomReadingOrder = (
  segments: ZoneAwareTextSegment[],
  customOrder?: number[]
): ZoneAwareTextSegment[] => {
  if (!customOrder || customOrder.length === 0) {
    // Ordre par défaut : par zoneOrder
    return segments.sort((a, b) => (a.zoneOrder || 0) - (b.zoneOrder || 0));
  }

  // Ordre personnalisé
  const orderedSegments: ZoneAwareTextSegment[] = [];
  customOrder.forEach((order) => {
    const segment = segments.find((s) => s.zoneOrder === order);
    if (segment) {
      orderedSegments.push(segment);
    }
  });

  return orderedSegments;
};
