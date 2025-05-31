// components/FinalReviewStep/types/editableText.tsx - LOGIQUE CORRIGÉE
import {
  ZoneComposition,
  ZoneAwareTextSegment,
} from "../../../utils/generateFinalText";
import { PostitType } from "../../../types/types";

export interface EditableSubSegment {
  id: string;
  content: string;
  originalPostitId: string;
  sourceZone: string;
  zoneName: string;
  zoneColor: string;
  isMovable: boolean;
  order: number;
  originalPostit?: PostitType;
}

export interface EditableTextSegment {
  id: string;
  zoneName: string;
  zoneColor: string;
  sourceZone: string;
  subSegments: EditableSubSegment[];
}

export interface EditableComposition {
  segments: EditableTextSegment[];
  flatSegments: EditableSubSegment[];
  fullText: string;
  hasChanges: boolean;
}

// ✅ FONCTION CORRIGÉE: Traiter TOUS les post-its avec zone (pas seulement les retravaillés)
export const convertToEditableComposition = (
  composition: ZoneComposition,
  originalPostits: PostitType[]
): EditableComposition => {
  const editableSegments: EditableTextSegment[] = [];
  const flatSegments: EditableSubSegment[] = [];
  let globalOrder = 0;

  console.log(
    "🔍 Tous les post-its reçus:",
    originalPostits.map((p) => ({
      id: p.id,
      zone: p.zone,
      isOriginal: p.isOriginal,
      content: p.content?.substring(0, 50) + "...",
    }))
  );

  // ✅ CORRIGÉ: Filtrer les post-its qui ont une zone définie (pas seulement les retravaillés)
  const zonedPostits = originalPostits.filter(
    (postit) =>
      postit.zone &&
      postit.content &&
      postit.content.trim().length > 0 &&
      // Vérifier que c'est une zone valide
      ["VOUS_AVEZ_FAIT", "JE_FAIS", "ENTREPRISE_FAIT", "VOUS_FEREZ"].includes(
        postit.zone
      )
  );

  console.log(
    "📦 Post-its avec zones valides:",
    zonedPostits.map((p) => ({
      id: p.id,
      zone: p.zone,
      isOriginal: p.isOriginal,
      content: p.content.substring(0, 50) + "...",
    }))
  );

  if (zonedPostits.length === 0) {
    console.warn("⚠️ Aucun post-it avec zone trouvé");
    return {
      segments: [],
      flatSegments: [],
      fullText: "",
      hasChanges: false,
    };
  }

  // Grouper par zone pour maintenir l'organisation
  const zoneMap = new Map<string, EditableTextSegment>();

  zonedPostits.forEach((postit, index) => {
    // Trouve les infos de zone depuis la composition originale
    const zoneSegment = composition.segments.find(
      (s) => s.sourceZone === postit.zone
    );
    const zoneName = zoneSegment?.zoneName || postit.zone;
    const zoneColor = zoneSegment?.zoneColor || "#gray";

    // ✅ ID unique garanti avec plus de données
    const uniqueId = `postit-${postit.id || "noId"}-${
      postit.zone
    }-${Date.now()}-${index}-${globalOrder}`;

    // Créer un sous-segment pour chaque POST-IT
    const subSegment: EditableSubSegment = {
      id: uniqueId,
      content: postit.content.trim(),
      originalPostitId: postit.id?.toString() || `temp-${index}`,
      sourceZone: postit.zone,
      zoneName: zoneName,
      zoneColor: zoneColor,
      isMovable: true,
      order: globalOrder++,
      originalPostit: postit,
    };

    flatSegments.push(subSegment);

    // Organiser par zone pour la vue structurée
    const zoneKey = postit.zone;
    if (!zoneMap.has(zoneKey)) {
      const zoneId = `zone-${zoneKey}-${Date.now()}-${index}`;

      zoneMap.set(zoneKey, {
        id: zoneId,
        zoneName: zoneName,
        zoneColor: zoneColor,
        sourceZone: zoneKey,
        subSegments: [],
      });
    }

    zoneMap.get(zoneKey)!.subSegments.push(subSegment);
  });

  // Trier les segments par ordre de zone logique
  const orderedZones = [
    "VOUS_AVEZ_FAIT",
    "JE_FAIS",
    "ENTREPRISE_FAIT",
    "VOUS_FEREZ",
  ];
  orderedZones.forEach((zoneKey) => {
    if (zoneMap.has(zoneKey)) {
      editableSegments.push(zoneMap.get(zoneKey)!);
    }
  });

  // Trier les segments plats par leur ordre
  flatSegments.sort((a, b) => a.order - b.order);

  const fullText = flatSegments.map((seg) => seg.content).join(". ") + ".";

  console.log("✅ Segments finaux créés:", {
    totalSegments: flatSegments.length,
    zones: editableSegments.length,
    fullTextLength: fullText.length,
    segments: flatSegments.map((s) => ({
      id: s.id,
      zone: s.zoneName,
      content: s.content.substring(0, 30) + "...",
    })),
  });

  return {
    segments: editableSegments,
    flatSegments: flatSegments,
    fullText: fullText,
    hasChanges: false,
  };
};

// ✅ FONCTION SIMPLIFIÉE: Reconvertir en ZoneComposition
export const convertToZoneComposition = (
  editableComp: EditableComposition,
  originalComposition: ZoneComposition
): ZoneComposition => {
  if (editableComp.flatSegments.length === 0) {
    console.warn("⚠️ Aucun segment à convertir");
    return originalComposition;
  }

  // Générer le nouveau texte dans l'ordre des segments réorganisés
  const newFullText =
    editableComp.flatSegments
      .map((seg) => seg.content.trim())
      .filter((content) => content.length > 0)
      .join(". ") + ".";

  // Reconstruire les segments de zone en respectant le NOUVEL ORDRE
  const orderedZones = [
    "VOUS_AVEZ_FAIT",
    "JE_FAIS",
    "ENTREPRISE_FAIT",
    "VOUS_FEREZ",
  ];
  const newSegments: ZoneAwareTextSegment[] = [];

  // Pour chaque zone dans l'ordre logique
  orderedZones.forEach((zoneKey) => {
    // Trouver tous les segments de cette zone dans l'ordre de réorganisation
    const zoneSegments = editableComp.flatSegments.filter(
      (seg) => seg.sourceZone === zoneKey
    );

    if (zoneSegments.length > 0) {
      // Trouver le segment original de cette zone
      const originalSegment = originalComposition.segments.find(
        (s) => s.sourceZone === zoneKey
      );

      // Créer le nouveau segment de zone avec le contenu réorganisé
      const newZoneSegment: ZoneAwareTextSegment = {
        id: `zone-${zoneKey}-rebuilt-${Date.now()}`,
        content: zoneSegments.map((seg) => seg.content.trim()).join(". "),
        type: "zone",
        sourceZone: zoneKey,
        zoneName: zoneSegments[0].zoneName,
        zoneOrder:
          originalSegment?.zoneOrder || orderedZones.indexOf(zoneKey) + 1,
        zoneColor: zoneSegments[0].zoneColor,
        isFromRework: true,
        postitIds: zoneSegments
          .map((seg) => seg.originalPostitId)
          .filter((id) => id),
      };

      newSegments.push(newZoneSegment);
    }
  });

  console.log("🔄 Composition reconstruite:", {
    originalSegments: originalComposition.segments.length,
    newSegments: newSegments.length,
    newTextLength: newFullText.length,
    segments: newSegments.map((s) => ({
      zone: s.sourceZone,
      contentLength: s.content.length,
      postitIds: s.postitIds?.length || 0,
    })),
  });

  return {
    ...originalComposition,
    segments: newSegments,
    fullText: newFullText,
    stats: {
      ...originalComposition.stats,
      finalLength: newFullText.length,
      totalSegments: newSegments.length,
    },
  };
};
