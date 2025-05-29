// Constantes et configurations pour le composant Postit

import React from "react";
import {
  ContexteStep,
  SujetStep,
  PratiqueStep,
  SummaryPanel,
} from "./PostitSteps";
import { Step } from "./types";

// Configuration des étapes du Postit
export const POSTIT_STEPS_CONFIG = {
  TOTAL_STEPS: 4,
  LABELS: [
    "Contexte du passage",
    "Critère qualité",
    "Pratique d'amélioration",
    "Synthèse",
  ],
  ICONS: ["🟢", "🧭", "🛠️", "✓"],
};

// Messages et libellés
export const POSTIT_MESSAGES = {
  SUBJECT_SELECTION_PROMPT:
    "Sélectionnez le critère qualité en défaut dans la grille ci-dessous.",
  PRACTICE_SELECTION_PROMPT:
    "Quelle pratique le conseiller peut-il travailler pour s'améliorer ?",
  NO_SUBJECT_ERROR: "Veuillez sélectionner un sujet avant de continuer.",
  COMPLETION_SUCCESS:
    "Ce passage a été affecté au critère {subject} avec la pratique {practice} à améliorer.",
};

// Configuration des étapes dynamiques
export const createPostItSteps = (
  selectedPostit: any,
  activeStep: number,
  isCompleted: boolean,
  hasValidSubject: (postit: any) => boolean,
  componentsProps: any
): Step[] => {
  const {
    selectedPostit: postit,
    selectedDomain, // ✅ Récupérer selectedDomain
    categoriesSujets,
    sujetsData,
    columnConfigSujets,
    sujetsDeLActivite,
    handleSujetClick,
    categoriesPratiques,
    pratiques,
    columnConfigPratiques,
    pratiquesDeLActivite,
    handlePratiqueClick,
    theme,
    stepBoxStyle,
  } = componentsProps;

  return [
    {
      label: POSTIT_STEPS_CONFIG.LABELS[0],
      icon: POSTIT_STEPS_CONFIG.ICONS[0],
      content: (
        <ContexteStep
          selectedPostit={postit}
          setSelectedPostit={componentsProps.setSelectedPostit}
          selectedDomain={selectedDomain}
          showTabs={componentsProps.showTabs}
          setShowTabs={componentsProps.setShowTabs}
          filteredDomains={componentsProps.filteredDomains}
          selectDomain={componentsProps.selectDomain}
          theme={theme}
          stepBoxStyle={stepBoxStyle}
          styles={componentsProps.styles}
        />
      ),
      completed: activeStep > 0,
      optional: false,
    },
    {
      label: POSTIT_STEPS_CONFIG.LABELS[1],
      icon: POSTIT_STEPS_CONFIG.ICONS[1],
      content: (
        <SujetStep
          selectedPostit={postit}
          selectedDomain={selectedDomain} // ✅ Passer selectedDomain
          categoriesSujets={categoriesSujets}
          sujetsData={sujetsData}
          columnConfigSujets={columnConfigSujets}
          sujetsDeLActivite={sujetsDeLActivite}
          handleSujetClick={handleSujetClick}
          stepBoxStyle={stepBoxStyle}
          onBack={() => {}}
          onNext={() => {}}
        />
      ),
      completed: activeStep > 1 && hasValidSubject(postit),
      additionalInfo:
        hasValidSubject(postit) && activeStep !== 1 ? postit.sujet : null,
      optional: false,
    },
    {
      label: POSTIT_STEPS_CONFIG.LABELS[2],
      icon: POSTIT_STEPS_CONFIG.ICONS[2],
      content: (
        <PratiqueStep
          selectedPostit={postit}
          selectedDomain={selectedDomain} // ✅ Passer selectedDomain si nécessaire
          categoriesPratiques={categoriesPratiques}
          pratiques={pratiques}
          columnConfigPratiques={columnConfigPratiques}
          pratiquesDeLActivite={pratiquesDeLActivite}
          handlePratiqueClick={handlePratiqueClick}
          stepBoxStyle={stepBoxStyle}
          onBack={() => {}}
          onSave={() => {}}
        />
      ),
      completed: hasValidSubject(postit),
      additionalInfo:
        hasValidSubject(postit) && activeStep !== 2 ? postit.pratique : null,
      optional: false,
    },
    {
      label: POSTIT_STEPS_CONFIG.LABELS[3],
      icon: POSTIT_STEPS_CONFIG.ICONS[3],
      content: (
        <SummaryPanel
          selectedPostit={postit}
          theme={theme}
          stepBoxStyle={stepBoxStyle}
          onClose={() => {}}
          onEdit={() => {}}
        />
      ),
      completed: isCompleted,
      additionalInfo: null,
      optional: false,
    },
  ];
};
