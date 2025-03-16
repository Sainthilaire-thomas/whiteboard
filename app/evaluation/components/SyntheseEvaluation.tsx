import React from "react";
import { EvaluationProps } from "@/app/evaluation/types/EvaluationTypes";
export default function SyntheseEvaluation({
  darkMode,
  setDarkMode,
}: EvaluationProps) {
  return (
    <div>
      <p>Mode actuel : {darkMode ? "Sombre" : "Clair"}</p>
      <button onClick={() => setDarkMode(!darkMode)}>Changer de mode</button>
    </div>
  );
}
