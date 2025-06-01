import React from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

// Types pour le composant TrainingPath
interface PlanningNudge {
  nudgeNumber: number;
  content: string;
  startDate: Date;
  endDate: Date;
  dayRange: string;
}

interface TrainingPlan {
  totalDuration: number;
  nudges: PlanningNudge[];
  startDate: Date;
}

type ThemeType =
  | "default"
  | "mountain"
  | "train"
  | "roadtrip"
  | "orienteering"
  | "desert";

interface TrainingPathProps {
  trainingPlan: TrainingPlan;
  categoryColor?: string;
  theme?: ThemeType;
  onThemeChange?: (theme: ThemeType) => void;
  showThemeSelector?: boolean;
}

// Configuration des thèmes avec visuels améliorés
const THEMES = {
  default: {
    name: "🎯 Parcours Classique",
    startIcon: "🚀",
    stepIcon: (index: number) => String(index + 1),
    endIcon: "🏆",
    pathStyle: "smooth",
    background: "gradient",
    description: "Parcours moderne avec progression fluide",
    colors: {
      primary: "#3f51b5",
      secondary: "#2196f3",
      accent: "#ff9800",
    },
  },
  mountain: {
    name: "🏔️ Ascension Montagne",
    startIcon: "🏕️",
    stepIcon: (index: number) => ["🥾", "⛰️", "🏔️", "🗻", "🏔️"][index % 5],
    endIcon: "🏔️",
    pathStyle: "mountain",
    background: "mountains",
    description: "Conquérez les sommets étape par étape",
    colors: {
      primary: "#1b5e20",
      secondary: "#2e7d32",
      accent: "#4caf50",
    },
  },
  train: {
    name: "🚂 Voyage Express",
    stepIcon: (index: number) => ["🚃", "🚋", "🚎", "🚌", "🚐"][index % 5],
    startIcon: "🚉",
    endIcon: "🏁",
    pathStyle: "rails",
    background: "rails",
    description: "Un voyage confortable vers votre destination",
    colors: {
      primary: "#1976d2",
      secondary: "#2196f3",
      accent: "#ff5722",
    },
  },
  roadtrip: {
    name: "🛣️ Road Trip Aventure",
    startIcon: "🏠",
    stepIcon: (index: number) =>
      ["🏛️", "🌊", "🏖️", "🏰", "🎡", "🌋", "🏞️"][index % 7],
    endIcon: "🌅",
    pathStyle: "road",
    background: "landscape",
    description: "Découvrez des paysages extraordinaires",
    colors: {
      primary: "#f57c00",
      secondary: "#ff9800",
      accent: "#4caf50",
    },
  },
  orienteering: {
    name: "🧭 Mission Exploration",
    startIcon: "📍",
    stepIcon: (index: number) => ["🎯", "🔍", "🗺️", "📊", "⚡"][index % 5],
    endIcon: "🏅",
    pathStyle: "orienteering",
    background: "tactical",
    description: "Navigation tactique vers l'objectif",
    colors: {
      primary: "#795548",
      secondary: "#8d6e63",
      accent: "#cddc39",
    },
  },
  desert: {
    name: "🏜️ Traversée du Désert",
    startIcon: "🕌",
    stepIcon: (index: number) =>
      ["🐪", "🌴", "🏕️", "🌵", "💧", "🦎", "🏺"][index % 7],
    endIcon: "🌅",
    pathStyle: "desert",
    background: "dunes",
    description: "Épopée à travers les dunes vers l'oasis finale",
    colors: {
      primary: "#d4930a",
      secondary: "#f57c00",
      accent: "#4caf50",
    },
  },
};

const TrainingPath: React.FC<TrainingPathProps> = ({
  trainingPlan,
  categoryColor = "#3f51b5",
  theme = "default",
  onThemeChange,
  showThemeSelector = false,
}) => {
  const { nudges, totalDuration } = trainingPlan;
  const currentTheme = THEMES[theme];

  // Détection du mode sombre/clair
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const textColor = isDarkMode ? "#e0e0e0" : "#424242";
  const dateColor = isDarkMode ? "#bdbdbd" : "#666666";

  if (!nudges || nudges.length === 0) {
    return null;
  }

  // Calcul des positions pour le chemin avec marges
  const pathWidth = 700;
  const pathHeight = 200;
  const stepWidth = pathWidth / (nudges.length + 1);
  const maxElevation = 60; // Limite l'élévation

  // Générer le chemin SVG selon le thème avec plus de relief
  const generatePath = () => {
    let path = `M 50 ${pathHeight / 2}`;

    switch (currentTheme.pathStyle) {
      case "mountain":
        // Chemin montagneux avec dénivelé contrôlé
        nudges.forEach((_, index) => {
          const x = 50 + (index + 1) * stepWidth;
          const elevation = Math.min((index + 1) * 15, maxElevation); // Limite l'élévation
          const y = pathHeight / 2 - elevation + Math.sin(index * 0.3) * 8;
          const cpX1 = 50 + (index + 0.3) * stepWidth;
          const cpY1 = pathHeight / 2 - index * 12;
          const cpX2 = 50 + (index + 0.7) * stepWidth;
          const cpY2 = pathHeight / 2 - (index + 0.5) * 15;
          path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x} ${y}`;
        });
        break;

      case "rails":
        // Rails parfaitement droits
        nudges.forEach((_, index) => {
          const x = 50 + (index + 1) * stepWidth;
          const y = pathHeight / 2;
          path += ` L ${x} ${y}`;
        });
        break;

      case "road":
        // Route sinueuse réaliste
        nudges.forEach((_, index) => {
          const x = 50 + (index + 1) * stepWidth;
          const y = pathHeight / 2 + Math.sin(index * 1.2) * 40;
          if (index === 0) {
            path += ` Q ${50 + stepWidth / 2} ${pathHeight / 2 + 10} ${x} ${y}`;
          } else {
            const prevX = 50 + index * stepWidth;
            const prevY = pathHeight / 2 + Math.sin((index - 1) * 1.2) * 40;
            const cpX = (prevX + x) / 2;
            const cpY = (prevY + y) / 2 + Math.sin(index * 0.8) * 20;
            path += ` Q ${cpX} ${cpY} ${x} ${y}`;
          }
        });
        break;

      case "orienteering":
        // Lignes droites avec changements de direction
        nudges.forEach((_, index) => {
          const x = 50 + (index + 1) * stepWidth;
          const y = pathHeight / 2 + Math.sin(index * 2.1) * 50;
          path += ` L ${x} ${y}`;
        });
        break;

      case "desert":
        // Chemin ondulant comme les dunes
        nudges.forEach((_, index) => {
          const x = 50 + (index + 1) * stepWidth;
          const y =
            pathHeight / 2 +
            Math.sin(index * 1.5) * 25 +
            Math.cos(index * 0.8) * 15;
          if (index === 0) {
            path += ` Q ${50 + stepWidth / 3} ${pathHeight / 2 + 10} ${x} ${y}`;
          } else {
            const prevX = 50 + index * stepWidth;
            const prevY =
              pathHeight / 2 +
              Math.sin((index - 1) * 1.5) * 25 +
              Math.cos((index - 1) * 0.8) * 15;
            const cpX = (prevX + x) / 2;
            const cpY = (prevY + y) / 2 + Math.sin(index * 2) * 10;
            path += ` Q ${cpX} ${cpY} ${x} ${y}`;
          }
        });
        break;

      default:
        // Chemin fluide moderne
        nudges.forEach((_, index) => {
          const x = 50 + (index + 1) * stepWidth;
          const y = pathHeight / 2 + Math.sin(index * 0.8) * 15;
          if (index === 0) {
            path += ` Q ${50 + stepWidth / 2} ${pathHeight / 2} ${x} ${y}`;
          } else {
            const prevX = 50 + index * stepWidth;
            const prevY = pathHeight / 2 + Math.sin((index - 1) * 0.8) * 15;
            const cpX = (prevX + x) / 2;
            path += ` Q ${cpX} ${prevY} ${x} ${y}`;
          }
        });
    }

    return path;
  };

  // Points de passage avec variations selon le thème
  const getNodePosition = (index: number) => {
    const x = 50 + (index + 1) * stepWidth;
    let y;

    switch (currentTheme.pathStyle) {
      case "mountain":
        const elevation = Math.min((index + 1) * 15, maxElevation);
        y = pathHeight / 2 - elevation + Math.sin(index * 0.3) * 8;
        break;
      case "rails":
        y = pathHeight / 2;
        break;
      case "road":
        y = pathHeight / 2 + Math.sin(index * 1.2) * 40;
        break;
      case "orienteering":
        y = pathHeight / 2 + Math.sin(index * 2.1) * 50;
        break;
      case "desert":
        y =
          pathHeight / 2 +
          Math.sin(index * 1.5) * 25 +
          Math.cos(index * 0.8) * 15;
        break;
      default:
        y = pathHeight / 2 + Math.sin(index * 0.8) * 15;
    }

    return { x, y };
  };

  // Arrière-plans thématiques enrichis
  const renderBackground = () => {
    const themeColors = currentTheme.colors;

    switch (currentTheme.background) {
      case "mountains":
        return (
          <g>
            {/* Horizon uniforme pour tous les éléments */}
            <line
              x1="0"
              y1={pathHeight + 20}
              x2={pathWidth + 100}
              y2={pathHeight + 20}
              stroke="transparent"
              strokeWidth="1"
            />{" "}
            {/* Ligne de référence invisible */}
            {/* Montagnes lointaines (très pâles, même base) */}
            <polygon
              points={`0,${
                pathHeight + 20
              } 60,80 120,100 180,60 240,90 300,50 360,80 420,40 480,70 540,35 600,60 660,45 720,55 800,${
                pathHeight + 20
              }`}
              fill="#90a4ae"
              opacity="0.2"
            />
            {/* Montagnes moyennes (plus contrastées, même base) */}
            <polygon
              points={`0,${
                pathHeight + 20
              } 80,110 140,130 200,90 280,120 340,80 400,110 460,70 520,100 580,65 640,90 700,75 800,${
                pathHeight + 20
              }`}
              fill="#546e7a"
              opacity="0.4"
            />
            {/* Montagnes proches (bien contrastées, même base) */}
            <polygon
              points={`0,${
                pathHeight + 20
              } 100,130 160,150 220,110 300,140 380,100 440,130 500,95 560,120 620,100 680,115 740,105 800,${
                pathHeight + 20
              }`}
              fill={themeColors.primary}
              opacity="0.6"
            />
            {/* Vallées alignées */}
            <ellipse
              cx="150"
              cy={pathHeight + 15}
              rx="40"
              ry="10"
              fill="#1b5e20"
              opacity="0.3"
            />
            <ellipse
              cx="450"
              cy={pathHeight + 15}
              rx="35"
              ry="8"
              fill="#1b5e20"
              opacity="0.3"
            />
            <ellipse
              cx="650"
              cy={pathHeight + 15}
              rx="30"
              ry="6"
              fill="#1b5e20"
              opacity="0.3"
            />
            {/* Forêts avec base uniforme */}
            {Array.from({ length: 12 }, (_, i) => {
              const x = 80 + i * 55 + (Math.random() - 0.5) * 20;
              const baseY = pathHeight + 15; // Base uniforme
              const treeHeight = 15 + Math.random() * 8;
              const distance = Math.floor(i / 4); // 0=proche, 1=moyen, 2=loin
              const opacity = distance === 0 ? 0.9 : distance === 1 ? 0.6 : 0.3;
              const color =
                distance === 0
                  ? "#1b5e20"
                  : distance === 1
                  ? "#2e7d32"
                  : "#546e7a";

              return (
                <g key={`tree-${i}`} transform={`translate(${x}, ${baseY})`}>
                  {/* Tronc */}
                  <rect
                    x="-1.5"
                    y={-3}
                    width="3"
                    height="8"
                    fill="#3e2723"
                    opacity={opacity}
                  />
                  {/* Branches avec taille adaptée */}
                  <polygon
                    points={`0,-${treeHeight} -${treeHeight / 2},${
                      treeHeight / 4
                    } ${treeHeight / 2},${treeHeight / 4}`}
                    fill={color}
                    opacity={opacity}
                  />
                  <polygon
                    points={`0,-${treeHeight * 0.7} -${treeHeight / 3},${
                      treeHeight / 8
                    } ${treeHeight / 3},${treeHeight / 8}`}
                    fill={color}
                    opacity={opacity + 0.1}
                  />
                  <polygon
                    points={`0,-${treeHeight * 0.4} -${treeHeight / 4},-2 ${
                      treeHeight / 4
                    },-2`}
                    fill={color}
                    opacity={opacity + 0.2}
                  />
                </g>
              );
            })}
            {/* Cascade unique mais parfaitement continue */}
            <g>
              {/* Cascade principale - filet continu */}
              <path
                d="M 350 70 L 350 90 Q 348 110 352 130 Q 350 150 348 170 Q 352 190 350 210"
                stroke="#0277bd"
                strokeWidth="6"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M 350 70 L 350 90 Q 351 110 349 130 Q 351 150 353 170 Q 349 190 351 210"
                stroke="#4fc3f7"
                strokeWidth="4"
                fill="none"
                opacity="1"
              />
              <path
                d="M 350 70 L 350 90 L 350 110 L 350 130 L 350 150 L 350 170 L 350 190 L 350 210"
                stroke="white"
                strokeWidth="2"
                fill="none"
                opacity="0.9"
              />

              {/* Bassin au pied de la cascade */}
              <ellipse
                cx="350"
                cy={pathHeight + 18}
                rx="20"
                ry="10"
                fill="#0277bd"
                opacity="0.8"
              />
              <ellipse
                cx="348"
                cy={pathHeight + 16}
                rx="12"
                ry="5"
                fill="#81d4fa"
                opacity="1"
              />
            </g>
            {/* Lacs repositionnés */}
            <ellipse
              cx="200"
              cy={pathHeight + 10}
              rx="15"
              ry="8"
              fill="#0277bd"
              opacity="0.8"
            />
            <ellipse
              cx="520"
              cy={pathHeight + 12}
              rx="18"
              ry="9"
              fill="#0277bd"
              opacity="0.8"
            />
            {/* Reflets très lumineux */}
            <ellipse
              cx="198"
              cy={pathHeight + 8}
              rx="8"
              ry="3"
              fill="#81d4fa"
              opacity="1"
            />
            <ellipse
              cx="518"
              cy={pathHeight + 10}
              rx="10"
              ry="4"
              fill="#81d4fa"
              opacity="1"
            />
            {/* Nuages plus contrastés */}
            <g opacity="0.8">
              <circle cx="180" cy="40" r="15" fill="#eceff1" />
              <circle cx="195" cy="40" r="18" fill="white" />
              <circle cx="210" cy="42" r="12" fill="#f5f5f5" />

              <circle cx="580" cy="35" r="12" fill="#eceff1" />
              <circle cx="595" cy="35" r="15" fill="white" />
              <circle cx="608" cy="37" r="10" fill="#f5f5f5" />
            </g>
            {/* Sentiers bien visibles */}
            <path
              d={`M 50 ${pathHeight + 10} Q 120 ${pathHeight + 8} 200 ${
                pathHeight + 5
              } Q 280 ${pathHeight + 3} 360 ${
                pathHeight + 2
              } Q 440 ${pathHeight} 520 ${pathHeight + 2} Q 600 ${
                pathHeight + 5
              } 680 ${pathHeight + 8} Q 750 ${pathHeight + 10} 800 ${
                pathHeight + 12
              }`}
              stroke="#5d4037"
              strokeWidth="3"
              fill="none"
              opacity="0.8"
              strokeDasharray="6,3"
            />
          </g>
        );

      case "rails":
        return (
          <g opacity="0.2">
            {/* Rails avec traverses */}
            <line
              x1="0"
              y1={pathHeight / 2 - 6}
              x2={pathWidth + 100}
              y2={pathHeight / 2 - 6}
              stroke={themeColors.primary}
              strokeWidth="3"
            />
            <line
              x1="0"
              y1={pathHeight / 2 + 6}
              x2={pathWidth + 100}
              y2={pathHeight / 2 + 6}
              stroke={themeColors.primary}
              strokeWidth="3"
            />
            {/* Traverses */}
            {Array.from({ length: 25 }, (_, i) => (
              <rect
                key={i}
                x={i * 35 + 10}
                y={pathHeight / 2 - 10}
                width="25"
                height="20"
                fill={themeColors.secondary}
                opacity="0.6"
                rx="2"
              />
            ))}
          </g>
        );

      case "landscape":
        return (
          <g opacity="0.12">
            {/* Paysage varié */}
            <polygon
              points="0,200 100,160 200,180 300,140 400,170 500,130 600,160 700,120 800,200"
              fill={themeColors.secondary}
            />
            {/* Arbres */}
            {Array.from({ length: 8 }, (_, i) => (
              <g key={i} transform={`translate(${100 + i * 100}, 160)`}>
                <rect x="-2" y="0" width="4" height="20" fill="#8d6e63" />
                <circle
                  cx="0"
                  cy="-5"
                  r="12"
                  fill={themeColors.accent}
                  opacity="0.6"
                />
              </g>
            ))}
          </g>
        );

      case "tactical":
        return (
          <g opacity="0.1">
            {/* Grille tactique */}
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke={themeColors.primary}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Points de repère */}
            {Array.from({ length: 5 }, (_, i) => (
              <circle
                key={i}
                cx={150 + i * 150}
                cy={80 + i * 20}
                r="3"
                fill={themeColors.accent}
                opacity="0.8"
              />
            ))}
          </g>
        );

      case "dunes":
        return (
          <g opacity="0.12">
            {/* Dunes en arrière-plan */}
            <path
              d="M 0,180 Q 100,140 200,160 T 400,150 T 600,170 T 800,160 L 800,220 L 0,220 Z"
              fill={themeColors.primary}
              opacity="0.3"
            />
            <path
              d="M 0,200 Q 150,160 300,180 T 600,170 T 800,190 L 800,220 L 0,220 Z"
              fill={themeColors.secondary}
              opacity="0.2"
            />

            {/* Végétation éparse */}
            {Array.from({ length: 12 }, (_, i) => {
              const x = 80 + i * 60 + (Math.random() - 0.5) * 40;
              const y = 160 + Math.sin(i * 0.8) * 20;
              const plantType = Math.random();

              if (plantType < 0.3) {
                // Cactus
                return (
                  <g key={`plant-${i}`} transform={`translate(${x}, ${y})`}>
                    <rect
                      x="-1"
                      y="-8"
                      width="2"
                      height="16"
                      fill={themeColors.accent}
                      opacity="0.6"
                    />
                    <circle
                      cx="0"
                      cy="-8"
                      r="2"
                      fill={themeColors.accent}
                      opacity="0.4"
                    />
                  </g>
                );
              } else if (plantType < 0.6) {
                // Buisson
                return (
                  <circle
                    key={`plant-${i}`}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={themeColors.accent}
                    opacity="0.4"
                  />
                );
              } else {
                // Herbe sèche
                return (
                  <g key={`plant-${i}`} transform={`translate(${x}, ${y})`}>
                    <line
                      x1="-2"
                      y1="0"
                      x2="2"
                      y2="-6"
                      stroke={themeColors.accent}
                      strokeWidth="1"
                      opacity="0.5"
                    />
                    <line
                      x1="-1"
                      y1="0"
                      x2="1"
                      y2="-4"
                      stroke={themeColors.accent}
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  </g>
                );
              }
            })}

            {/* Soleil en arrière-plan */}
            <circle
              cx="650"
              cy="50"
              r="25"
              fill={themeColors.accent}
              opacity="0.2"
            />
            <circle
              cx="650"
              cy="50"
              r="15"
              fill={themeColors.secondary}
              opacity="0.3"
            />

            {/* Traces dans le sable */}
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse
                key={`trace-${i}`}
                cx={120 + i * 80}
                cy={pathHeight / 2 + Math.sin(i * 0.5) * 15 + 20}
                rx="3"
                ry="1.5"
                fill={themeColors.primary}
                opacity="0.2"
              />
            ))}
          </g>
        );

      case "gradient":
        return (
          <g opacity="0.08">
            <defs>
              <radialGradient id="modernGradient" cx="50%" cy="50%" r="70%">
                <stop
                  offset="0%"
                  stopColor={themeColors.primary}
                  stopOpacity="0.2"
                />
                <stop
                  offset="100%"
                  stopColor={themeColors.secondary}
                  stopOpacity="0.05"
                />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#modernGradient)" />
          </g>
        );

      default:
        return null;
    }
  };

  // Effets visuels selon le thème
  const renderPathEffects = () => {
    const themeColors = currentTheme.colors;

    switch (currentTheme.pathStyle) {
      case "mountain":
        return (
          <g>
            {/* Ombre du chemin */}
            <path
              d={generatePath()}
              stroke={themeColors.primary}
              strokeWidth="8"
              fill="none"
              opacity="0.3"
              transform="translate(2, 2)"
            />
          </g>
        );

      case "orienteering":
        return (
          <g>
            {/* Lignes de visée */}
            {nudges.map((_, index) => {
              const { x, y } = getNodePosition(index);
              const prevPos =
                index === 0
                  ? { x: 50, y: pathHeight / 2 }
                  : getNodePosition(index - 1);
              return (
                <line
                  key={index}
                  x1={prevPos.x}
                  y1={prevPos.y}
                  x2={x}
                  y2={y}
                  stroke={themeColors.accent}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />
              );
            })}
          </g>
        );

      case "desert":
        return (
          <g>
            {/* Effet de sable qui vole */}
            {nudges.map((_, index) => {
              const { x, y } = getNodePosition(index);
              return (
                <g key={index}>
                  {/* Particules de sable */}
                  {Array.from({ length: 3 }, (_, i) => (
                    <circle
                      key={i}
                      cx={x + (Math.random() - 0.5) * 20}
                      cy={y + (Math.random() - 0.5) * 20}
                      r="1"
                      fill={themeColors.primary}
                      opacity="0.3"
                    />
                  ))}
                </g>
              );
            })}

            {/* Lignes de vent dans le sable */}
            {Array.from({ length: 4 }, (_, i) => (
              <path
                key={i}
                d={`M ${i * 180 + 50} ${pathHeight / 2 + 30} Q ${
                  i * 180 + 100
                } ${pathHeight / 2 + 25} ${i * 180 + 150} ${
                  pathHeight / 2 + 35
                }`}
                stroke={themeColors.secondary}
                strokeWidth="1"
                fill="none"
                opacity="0.2"
                strokeDasharray="2,3"
              />
            ))}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: "background.default" }}>
      {/* Sélecteur de thème amélioré */}
      {showThemeSelector && onThemeChange && (
        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 250 }}>
            <InputLabel>Choisissez votre aventure</InputLabel>
            <Select
              value={theme}
              label="Choisissez votre aventure"
              onChange={(e) => onThemeChange(e.target.value as ThemeType)}
            >
              {Object.entries(THEMES).map(([key, themeConfig]) => (
                <MenuItem key={key} value={key} sx={{ py: 1 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {themeConfig.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {themeConfig.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}
      >
        {currentTheme.name} ({totalDuration} jours)
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <svg
          width={pathWidth + 100}
          height={pathHeight + 80}
          viewBox={`0 0 ${pathWidth + 100} ${pathHeight + 80}`}
        >
          {/* Dégradés améliorés */}
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor={currentTheme.colors.primary}
                stopOpacity="0.4"
              />
              <stop
                offset="50%"
                stopColor={currentTheme.colors.secondary}
                stopOpacity="0.6"
              />
              <stop
                offset="100%"
                stopColor={currentTheme.colors.accent}
                stopOpacity="0.8"
              />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Arrière-plan thématique */}
          {renderBackground()}

          {/* Effets spéciaux */}
          {renderPathEffects()}

          {/* Chemin principal avec effet lumineux */}
          <path
            d={generatePath()}
            stroke="url(#pathGradient)"
            strokeWidth={
              currentTheme.pathStyle === "rails"
                ? "8"
                : currentTheme.pathStyle === "desert"
                ? "5"
                : "6"
            }
            fill="none"
            strokeLinecap="round"
            strokeDasharray={
              currentTheme.pathStyle === "orienteering"
                ? "8,4"
                : currentTheme.pathStyle === "desert"
                ? "12,3"
                : "none"
            }
            filter="url(#glow)"
          />

          {/* Point de départ - Style adaptatif */}
          <g transform={`translate(50, ${pathHeight / 2})`}>
            {theme === "default" ? (
              <>
                <circle
                  r="18"
                  fill={currentTheme.colors.primary}
                  stroke="white"
                  strokeWidth="3"
                  filter="url(#glow)"
                />
                <text
                  x="0"
                  y="6"
                  textAnchor="middle"
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                >
                  {currentTheme.startIcon}
                </text>
              </>
            ) : (
              <text
                x="0"
                y="8"
                textAnchor="middle"
                fontSize="32"
                filter="url(#glow)"
                style={{
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                  filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
                }}
              >
                {currentTheme.startIcon}
              </text>
            )}
          </g>

          {/* Points de passage améliorés */}
          {nudges.map((nudge, index) => {
            const { x, y } = getNodePosition(index);
            const isLast = index === nudges.length - 1;

            return (
              <g key={index} transform={`translate(${x}, ${y})`}>
                {/* Style adaptatif selon le thème */}
                {theme === "default" ? (
                  <>
                    <circle
                      r="20"
                      fill={
                        isLast
                          ? currentTheme.colors.accent
                          : currentTheme.colors.secondary
                      }
                      stroke="white"
                      strokeWidth="3"
                      filter="url(#glow)"
                    />
                    <text
                      x="0"
                      y="6"
                      textAnchor="middle"
                      fill="white"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {isLast
                        ? currentTheme.endIcon
                        : currentTheme.stepIcon(index)}
                    </text>
                  </>
                ) : (
                  <>
                    {/* Ombre plus marquée pour les icônes libres */}
                    <text
                      x="3"
                      y="11"
                      textAnchor="middle"
                      fontSize="36"
                      fill="rgba(0,0,0,0.5)"
                    >
                      {isLast
                        ? currentTheme.endIcon
                        : currentTheme.stepIcon(index)}
                    </text>
                    {/* Icône principale plus grande et plus visible */}
                    <text
                      x="0"
                      y="8"
                      textAnchor="middle"
                      fontSize="36"
                      filter="url(#glow)"
                      style={{
                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
                      }}
                    >
                      {isLast
                        ? currentTheme.endIcon
                        : currentTheme.stepIcon(index)}
                    </text>
                  </>
                )}

                {/* Labels sans contour, couleurs adaptatives simples */}
                <text
                  x="0"
                  y={theme === "default" ? "38" : "45"}
                  textAnchor="middle"
                  fill={isDarkMode ? "#e0e0e0" : currentTheme.colors.primary}
                  fontSize="11"
                  fontWeight="bold"
                >
                  {nudge.dayRange}
                </text>

                <text
                  x="0"
                  y={theme === "default" ? "52" : "59"}
                  textAnchor="middle"
                  fill={isDarkMode ? "#bdbdbd" : "#666666"}
                  fontSize="9"
                  fontWeight="500"
                >
                  {nudge.startDate.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}{" "}
                  -{" "}
                  {nudge.endDate.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                  })}
                </text>
              </g>
            );
          })}

          {/* Indicateurs de progression */}
          {Array.from(
            { length: Math.ceil(totalDuration / 7) },
            (_, weekIndex) => {
              const weekX =
                50 +
                (weekIndex + 0.5) * (pathWidth / Math.ceil(totalDuration / 7));
              return (
                <g key={weekIndex}>
                  <line
                    x1={weekX}
                    y1="15"
                    x2={weekX}
                    y2={pathHeight + 40}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                    strokeDasharray="2,4"
                  />
                  <text
                    x={weekX}
                    y="12"
                    textAnchor="middle"
                    fill={isDarkMode ? "#bdbdbd" : currentTheme.colors.primary}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    S{weekIndex + 1}
                  </text>
                </g>
              );
            }
          )}
        </svg>
      </Box>

      {/* Légende thématique */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.8,
          justifyContent: "center",
          mb: 1,
        }}
      >
        {nudges.map((nudge, index) => (
          <Tooltip
            key={index}
            title={
              <Box>
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  {currentTheme.stepIcon(index)} Étape {nudge.nudgeNumber}:{" "}
                  {nudge.dayRange}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {nudge.startDate.toLocaleDateString("fr-FR")} →{" "}
                  {nudge.endDate.toLocaleDateString("fr-FR")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {nudge.content}
                </Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <Chip
              icon={
                <span style={{ fontSize: "14px" }}>
                  {currentTheme.stepIcon(index)}
                </span>
              }
              label={nudge.dayRange}
              size="small"
              sx={{
                backgroundColor: currentTheme.colors.secondary + "20",
                color: currentTheme.colors.primary,
                cursor: "help",
                fontSize: "0.75rem",
                height: 24,
                fontWeight: "bold",
              }}
            />
          </Tooltip>
        ))}
      </Box>

      {/* Statistiques avec icônes thématiques */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          textAlign: "center",
          bgcolor: currentTheme.colors.primary + "08",
          borderRadius: 1,
          p: 1,
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            color={currentTheme.colors.primary}
            sx={{ fontWeight: "bold" }}
          >
            {totalDuration}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            📅 Jours
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="subtitle2"
            color={currentTheme.colors.secondary}
            sx={{ fontWeight: "bold" }}
          >
            {nudges.length}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            🎯 Étapes
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="subtitle2"
            color={currentTheme.colors.accent}
            sx={{ fontWeight: "bold" }}
          >
            {Math.ceil(totalDuration / 7)}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            📊 Semaines
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="subtitle2"
            color={currentTheme.colors.primary}
            sx={{ fontWeight: "bold" }}
          >
            {Math.round(totalDuration / nudges.length)}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
            ⚡ J/étape
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default TrainingPath;
