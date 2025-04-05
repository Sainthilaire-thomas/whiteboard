import { useState } from "react";
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";

/**
 * Hook personnalisé pour gérer le drag and drop
 * @param {Object} params Paramètres du hook
 * @param {Array} params.postits Liste des post-its
 * @param {Function} params.setPostits Fonction pour mettre à jour les post-its
 * @param {Object} params.zoneColors Couleurs des zones
 * @returns {Object} État et fonctions pour le drag and drop
 */
export const useDragAndDrop = ({ postits, setPostits, zoneColors }) => {
  const [activeId, setActiveId] = useState(null);

  // Configurer les sensors pour dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Gestionnaire pour le début du drag
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  // Gestionnaire pour la fin du drag
  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      setPostits((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Gestionnaire pour le survol pendant le drag
  const handleDragOver = (event) => {
    const { active, over } = event;

    if (!over) return;

    if (
      over.data.current?.type === "zone" &&
      active.data.current?.type !== "zone"
    ) {
      const zoneId = over.id;
      const postitId = active.id;

      const postitIndex = postits.findIndex((p) => p.id === postitId);
      if (postitIndex === -1) return;

      if (postits[postitIndex].zone !== zoneId) {
        const updatedPostits = [...postits];
        updatedPostits[postitIndex] = {
          ...updatedPostits[postitIndex],
          zone: zoneId,
          color: zoneColors[zoneId],
        };

        setPostits(updatedPostits);
      }
    }
  };

  // Trouver le post-it actif
  const activePostit = activeId ? postits.find((p) => p.id === activeId) : null;

  return {
    activeId,
    activePostit,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  };
};
