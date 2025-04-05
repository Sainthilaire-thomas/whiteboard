// SharedContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Call } from "@/types/types"; // Ajustez selon vos besoins

interface SharedContextType {
  // Données liées aux appels
  selectedCall: Call | null;
  setSelectedCall: (call: Call | null) => void;
  idCallActivite: number | null;
  setIdCallActivite: (id: number | null) => void;

  // Données d'entreprise
  selectedEntreprise: number | null;
  setSelectedEntreprise: (id: number | null) => void;
}

const SharedContext = createContext<SharedContextType | undefined>(undefined);

export const useSharedContext = () => {
  const context = useContext(SharedContext);
  if (!context) {
    throw new Error(
      "useSharedContext doit être utilisé à l'intérieur d'un SharedProvider"
    );
  }
  return context;
};

interface SharedProviderProps {
  children: ReactNode;
}

export const SharedProvider = ({ children }: SharedProviderProps) => {
  // États partagés
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [idCallActivite, setIdCallActivite] = useState<number | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState<number | null>(
    null
  );

  const value = {
    selectedCall,
    setSelectedCall,
    idCallActivite,
    setIdCallActivite,
    selectedEntreprise,
    setSelectedEntreprise,
  };

  return (
    <SharedContext.Provider value={value}>{children}</SharedContext.Provider>
  );
};
