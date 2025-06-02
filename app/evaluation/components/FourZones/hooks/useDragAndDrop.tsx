import { useState } from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";

// 🔧 CORRECTION: Import des types depuis le fichier types local
import { PostitType, UseDragAndDropProps } from "../types/types";

// 🔧 HELPER: Fonction pour convertir UniqueIdentifier vers string de façon sûre
const toStringId = (id: UniqueIdentifier): string => {
  return typeof id === "string" ? id : String(id);
};

// 🔧 CORRECTION: Type de retour du hook avec types spécifiques
interface UseDragAndDropReturn {
  activeId: UniqueIdentifier | null;
  activePostit: PostitType | null;
  sensors: any; // Garde any pour les sensors dnd-kit (complexe)
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
}

/**
 * Hook personnalisé pour gérer le drag and drop
 * @param {Object} params Paramètres du hook
 * @param {Array} params.postits Liste des post-its
 * @param {Function} params.setPostits Fonction pour mettre à jour les post-its
 * @param {Object} params.zoneColors Couleurs des zones
 * @returns {Object} État et fonctions pour le drag and drop
 */
export const useDragAndDrop = ({
  postits,
  setPostits,
  zoneColors,
}: UseDragAndDropProps): UseDragAndDropReturn => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  // Configurer les sensors pour dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      setPostits((items: PostitType[]) => {
        // 🔧 CORRECTION: Conversion sûre des IDs pour comparaison
        const activeIdStr = toStringId(active.id);
        const overIdStr = toStringId(over.id);

        const oldIndex = items.findIndex(
          (item: PostitType) => item.id === activeIdStr
        );
        const newIndex = items.findIndex(
          (item: PostitType) => item.id === overIdStr
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (
      over.data.current?.type === "zone" &&
      active.data.current?.type !== "zone"
    ) {
      // 🔧 CORRECTION: Conversion sûre vers string
      const zoneId = toStringId(over.id);
      const postitId = toStringId(active.id);

      const postitIndex = postits.findIndex(
        (p: PostitType) => p.id === postitId
      );
      if (postitIndex === -1) return;

      if (postits[postitIndex].zone !== zoneId) {
        const updatedPostits = [...postits];
        updatedPostits[postitIndex] = {
          ...updatedPostits[postitIndex],
          zone: zoneId, // Maintenant c'est un string garanti
          color: zoneColors[zoneId],
        };

        setPostits(updatedPostits);
      }
    }
  };

  // 🔧 CORRECTION: Conversion sûre et gestion de undefined
  const activePostit = activeId
    ? postits.find((p: PostitType) => p.id === toStringId(activeId)) || null
    : null;

  return {
    activeId,
    activePostit,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  };
};
