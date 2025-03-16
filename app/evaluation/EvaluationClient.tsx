// 📜 app/evaluation/EvaluationClient.tsx
"use client"; // ✅ Ce fichier est un composant client

import dynamic from "next/dynamic";
import { EvaluationProps } from "@/types/types";

// ✅ Chargement dynamique du composant Evaluation
const Evaluation = dynamic(() => import("./Evaluation"));

export default function EvaluationClient({
  darkMode,
  setDarkMode,
}: EvaluationProps) {
  return <Evaluation darkMode={darkMode} setDarkMode={setDarkMode} />;
}
