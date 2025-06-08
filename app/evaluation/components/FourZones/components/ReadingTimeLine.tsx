import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Button,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useThemeMode } from "@/app/components/common/Theme/ThemeProvider";
import { PostitType } from "../types/types";
import { ZONES } from "../constants/zone";

// Interface pour un élément de la timeline
interface TimelineItem {
  id: string;
  postit: PostitType;
  position: number;
}

// Composant pour un post-it dans la timeline
const TimelinePostit: React.FC<{
  item: TimelineItem;
  isDragging?: boolean;
  isDarkMode?: boolean;
}> = ({ item, isDragging, isDarkMode = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  };

  // Couleur selon la zone d'origine
  const getZoneColor = (zone: string) => {
    switch (zone) {
      case ZONES.VOUS_AVEZ_FAIT:
        return "#4CAF50"; // Vert
      case ZONES.JE_FAIS:
        return "#2196F3"; // Bleu
      case ZONES.ENTREPRISE_FAIT:
        return "#FF5722"; // Rouge-orange
      case ZONES.VOUS_FEREZ:
        return "#9C27B0"; // Violet
      default:
        return "#757575";
    }
  };

  const getZoneLabel = (zone: string) => {
    switch (zone) {
      case ZONES.VOUS_AVEZ_FAIT:
        return "Client";
      case ZONES.JE_FAIS:
        return "Conseiller";
      case ZONES.ENTREPRISE_FAIT:
        return "Entreprise";
      case ZONES.VOUS_FEREZ:
        return "Client+";
      default:
        return "?";
    }
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        p: 1.5,
        minWidth: 200,
        maxWidth: 250,
        cursor: "grab",
        border: `2px solid ${getZoneColor(item.postit.zone)}`,
        backgroundColor: isDarkMode
          ? item.postit.isOriginal
            ? "#616161"
            : "#757575"
          : item.postit.isOriginal
            ? "#f5f5f5"
            : "#fff",
        color: isDarkMode ? "#fff" : "inherit",
        position: "relative",
        "&:hover": {
          boxShadow: 3,
        },
        "&:active": {
          cursor: "grabbing",
        },
      }}
      elevation={isDragging || isSortableDragging ? 4 : 1}
    >
      {/* Numéro de position */}
      <Chip
        label={item.position}
        size="small"
        sx={{
          position: "absolute",
          top: -8,
          left: -8,
          backgroundColor: getZoneColor(item.postit.zone),
          color: "white",
          fontWeight: "bold",
          width: 24,
          height: 24,
        }}
      />

      {/* Label de zone */}
      <Chip
        label={getZoneLabel(item.postit.zone)}
        size="small"
        sx={{
          position: "absolute",
          top: -8,
          right: 8,
          backgroundColor: getZoneColor(item.postit.zone),
          color: "white",
          fontSize: "0.7rem",
        }}
      />

      {/* Contenu du post-it */}
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          fontStyle: item.postit.isOriginal ? "italic" : "normal",
          fontWeight: item.postit.isOriginal ? "normal" : "500",
        }}
      >
        {item.postit.content.length > 80
          ? `${item.postit.content.substring(0, 80)}...`
          : item.postit.content}
      </Typography>

      {/* Indicateur de type */}
      {!item.postit.isOriginal && (
        <AutoAwesomeIcon
          sx={{
            position: "absolute",
            bottom: 4,
            right: 4,
            fontSize: 16,
            color: getZoneColor(item.postit.zone),
            opacity: 0.7,
          }}
        />
      )}
    </Paper>
  );
};

// Props du composant principal
interface ReadingTimelineProps {
  postits: PostitType[];
  onOrderChange: (orderedPostits: PostitType[]) => void;
  onGenerateFinalText: () => void;
}

export const ReadingTimeline: React.FC<ReadingTimelineProps> = ({
  postits,
  onOrderChange,
  onGenerateFinalText,
}) => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === "dark";

  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fonction pour créer l'ordre par défaut
  const createDefaultOrder = useCallback(
    (allPostits: PostitType[]): TimelineItem[] => {
      const zoneOrder = [
        ZONES.VOUS_AVEZ_FAIT,
        ZONES.JE_FAIS,
        ZONES.ENTREPRISE_FAIT,
        ZONES.VOUS_FEREZ,
      ];

      const orderedPostits: PostitType[] = [];

      zoneOrder.forEach((zone) => {
        const zonePostits = allPostits
          .filter((p) => p.zone === zone)
          .sort((a, b) => {
            if (a.isOriginal && !b.isOriginal) return 1;
            if (!a.isOriginal && b.isOriginal) return -1;
            return 0;
          });

        orderedPostits.push(...zonePostits);
      });

      return orderedPostits.map((postit, index) => ({
        id: `timeline-${postit.id}`,
        postit,
        position: index + 1,
      }));
    },
    []
  );

  // Initialiser l'ordre par défaut SANS jamais appeler onOrderChange automatiquement
  useEffect(() => {
    if (postits.length > 0) {
      const defaultOrder = createDefaultOrder(postits);
      setTimelineItems(defaultOrder);

      // Marquer comme initialisé seulement après le premier setup
      if (!isInitialized) {
        setIsInitialized(true);
        // Appeler onOrderChange seulement lors de la première initialisation
        setTimeout(() => {
          onOrderChange(defaultOrder.map((item) => item.postit));
        }, 0);
      }
    } else {
      setTimelineItems([]);
    }
  }, [
    postits.map((p) => p.id).join(","),
    createDefaultOrder,
    isInitialized,
    onOrderChange,
  ]);

  // Callback pour notifier le parent lors d'actions utilisateur uniquement
  const notifyParentOfChange = useCallback(
    (items: TimelineItem[]) => {
      const newOrder = items.map((item) => item.postit);
      onOrderChange(newOrder);
    },
    [onOrderChange]
  );

  // Gestion du drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTimelineItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        const updatedItems = newItems.map((item, index) => ({
          ...item,
          position: index + 1,
        }));

        // Notifier le parent seulement lors du drag & drop
        notifyParentOfChange(updatedItems);

        return updatedItems;
      });
    }
  };

  // Reset à l'ordre par défaut
  const handleReset = () => {
    const defaultOrder = createDefaultOrder(postits);
    setTimelineItems(defaultOrder);
    notifyParentOfChange(defaultOrder);
  };

  // Génération du texte avec l'ordre actuel
  const generateOrderedText = (): string => {
    return (
      timelineItems
        .map((item) => item.postit.content.trim())
        .filter((content) => content.length > 0)
        .join(". ") + "."
    );
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderTop: `3px solid ${isDarkMode ? "#42A5F5" : "#2196F3"}`,
        backgroundColor: isDarkMode ? "#2c2c2c" : "#fafafa",
        color: isDarkMode ? "#fff" : "inherit",
      }}
      elevation={3}
    >
      {/* En-tête */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PlayArrowIcon
            sx={{ color: isDarkMode ? "#42A5F5" : "#2196F3", mr: 1 }}
          />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            📖 Ordre de lecture
          </Typography>
          <Chip
            label={`${timelineItems.length} éléments`}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Remettre l'ordre par défaut">
            <IconButton onClick={handleReset} size="small">
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={onGenerateFinalText}
            disabled={timelineItems.length === 0}
          >
            Générer le texte final
          </Button>
        </Box>
      </Box>

      {/* Timeline */}
      {timelineItems.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={timelineItems.map((item) => item.id)}
            strategy={horizontalListSortingStrategy}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                overflowX: "auto",
                pb: 1,
                "&::-webkit-scrollbar": {
                  height: 8,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: 4,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#888",
                  borderRadius: 4,
                },
              }}
            >
              {timelineItems.map((item) => (
                <TimelinePostit
                  key={item.id}
                  item={item}
                  isDarkMode={isDarkMode}
                />
              ))}
            </Box>
          </SortableContext>
        </DndContext>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: isDarkMode ? "#bbb" : "text.secondary",
          }}
        >
          <Typography variant="body1">
            Aucun post-it à organiser. Ajoutez du contenu dans les zones
            ci-dessus.
          </Typography>
        </Box>
      )}

      {/* Aperçu du texte généré */}
      {timelineItems.length > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: isDarkMode ? "#3c3c3c" : "#e3f2fd",
            borderRadius: 1,
            border: isDarkMode ? "1px solid #555" : "1px solid #bbdefb",
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            📝 Aperçu du texte final :
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              maxHeight: 100,
              overflow: "auto",
            }}
          >
            {generateOrderedText()}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
