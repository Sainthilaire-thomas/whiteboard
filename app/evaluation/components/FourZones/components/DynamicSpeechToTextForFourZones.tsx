"use client";

import dynamic from "next/dynamic";
import type {
  DynamicSpeechToTextForFourZonesProps,
  LoadingComponentProps,
  LoadingComponentStyles,
} from "./DynamicSpeechToTextForFourZones.types";

/**
 * Composant de chargement avec styles conditionnels
 */
const LoadingComponent: React.FC<LoadingComponentProps> = ({
  isContextual = false,
}) => {
  const styles: LoadingComponentStyles = {
    padding: isContextual ? "8px" : "16px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    margin: isContextual ? "8px 0" : "16px 0",
    fontSize: isContextual ? "0.875rem" : "1rem",
    backgroundColor: "#f9f9f9",
    textAlign: "center",
    color: "#666",
    transition: "all 0.2s ease-in-out",
  };

  return (
    <div style={styles}>
      🎤 Chargement du module de reconnaissance vocale...
    </div>
  );
};

/**
 * Composant wrapper qui gère le chargement conditionnel
 */
const DynamicSpeechToTextForFourZonesWrapper: React.FC<
  DynamicSpeechToTextForFourZonesProps
> = (props) => {
  const DynamicComponent = dynamic<DynamicSpeechToTextForFourZonesProps>(
    () => import("./SpeechToTextForFourZones"),
    {
      ssr: false,
      loading: () => <LoadingComponent isContextual={props.isContextual} />,
    }
  );

  return <DynamicComponent {...props} />;
};

/**
 * Export du composant principal
 */
const DynamicSpeechToTextForFourZones = DynamicSpeechToTextForFourZonesWrapper;

export default DynamicSpeechToTextForFourZones;
