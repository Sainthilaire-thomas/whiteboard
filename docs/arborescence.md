# 🌳 Arborescence du projet whiteboard

> Générée automatiquement le 13/09/2025 15:52:15

## 📂 Structure des fichiers

```
whiteboard/
├── 📁 .netlify/
│   ├── 📁 blobs-serve/
│   ├── 📁 functions-internal/
│   ├── 📁 plugins/
│   │   ├── 📋 package-lock.json (651 B)
│   │   └── 📋 package.json (294 B)
│   ├── 📁 v1/
│   │   └── 📁 functions/
│   └── 📋 state.json (330 B)
├── 📁 app/
│   ├── 📁 api/
│   │   ├── 📁 ai/
│   │   │   └── 📁 improve/
│   │   │       └── ⚛️ route.tsx (1.5 KB)
│   │   ├── 📁 calls/
│   │   │   └── 📁 create-from-zoho/
│   │   │       └── ⚛️ route.tsx (8.2 KB)
│   │   ├── 📁 evaluation-sharing/
│   │   │   ├── 📁 active-sessions/
│   │   │   │   └── ⚛️ route.tsx (7.7 KB)
│   │   │   ├── 📁 check-session/
│   │   │   │   └── ⚛️ route.tsx (6.6 KB)
│   │   │   ├── 📁 create-session/
│   │   │   │   └── ⚛️ route.tsx (9.5 KB)
│   │   │   ├── 📁 stop-session/
│   │   │   │   └── ⚛️ route.tsx (6.1 KB)
│   │   │   ├── 📁 update-controls/
│   │   │   │   └── ⚛️ route.tsx (3.2 KB)
│   │   │   ├── 📁 update-mode/
│   │   │   │   └── ⚛️ route.tsx (2.7 KB)
│   │   │   └── 📁 update-position/
│   │   │       └── ⚛️ route.tsx (2.8 KB)
│   │   ├── 📁 getAudioUrl/
│   │   │   └── ⚛️ route.tsx (1.6 KB)
│   │   ├── 📁 ponderation-sujets/
│   │   │   └── ⚛️ route.tsx (5.3 KB)
│   │   ├── 📁 send-training-email/
│   │   │   └── ⚛️ route.tsx (8.9 KB)
│   │   ├── 📁 transcribe/
│   │   │   └── 📜 route.js (2.8 KB)
│   │   ├── 📁 transcription/
│   │   │   └── 📁 get/
│   │   │       └── ⚛️ route.tsx (3.9 KB)
│   │   ├── 📁 tts/
│   │   │   └── ⚛️ route.tsx (6.6 KB)
│   │   └── 📁 zoho/
│   │       ├── 📁 auth/
│   │       │   └── ⚛️ route.tsx (644 B)
│   │       ├── 📁 callback/
│   │       │   └── ⚛️ route.tsx (1.3 KB)
│   │       └── 📁 workdrive/
│   │           └── ⚛️ route.tsx (4.5 KB)
│   ├── 📁 components/
│   │   ├── 📁 common/
│   │   │   ├── 📁 Theme/
│   │   │   │   └── ⚛️ ThemeProvider.tsx (2.1 KB)
│   │   │   ├── ⚛️ ActivityIndicator.tsx (14.7 KB)
│   │   │   ├── ⚛️ AuthStatus.tsx (4 KB)
│   │   │   ├── ⚛️ CallSelection.tsx (13.4 KB)
│   │   │   ├── ⚛️ EntrepriseSelection.tsx (1.5 KB)
│   │   │   ├── ⚛️ GlobalNavBar.tsx (1.6 KB)
│   │   │   ├── ⚛️ NewCallUploader.tsx (6.8 KB)
│   │   │   ├── ⚛️ PreserveRouteOnRefresh.tsx (2.2 KB)
│   │   │   ├── ⚛️ SelectionConseiller.tsx (4.8 KB)
│   │   │   └── ⚛️ SelectionEntrepriseEtAppel.tsx (545 B)
│   │   └── 📁 navigation/
│   │       └── 📁 ActivitySidebar/
│   │           ├── 📁 components/
│   │           │   ├── ⚛️ NavigationBreadcrump.tsx (1.9 KB)
│   │           │   ├── ⚛️ PhaseItem.tsx (5.1 KB)
│   │           │   ├── ⚛️ PhaseStatusChip.tsx (2 KB)
│   │           │   └── ⚛️ SubStepItem.tsx (3.2 KB)
│   │           ├── 📁 constants/
│   │           │   └── ⚛️ index.tsx (4.2 KB)
│   │           ├── 📁 hooks/
│   │           │   ├── ⚛️ useActivityPhases.tsx (5.5 KB)
│   │           │   ├── ⚛️ useActivityStats.tsx (3.1 KB)
│   │           │   ├── ⚛️ usePhaseData.tsx (6.2 KB)
│   │           │   └── ⚛️ usePhaseNavigation.tsx (17.2 KB)
│   │           ├── 📁 types/
│   │           │   └── ⚛️ index.tsx (3.1 KB)
│   │           ├── ⚛️ ActivitySidebar.tsx (4.5 KB)
│   │           └── ⚛️ index.tsx (1.2 KB)
│   ├── 📁 evaluation/
│   │   ├── 📁 admin/
│   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 sections/
│   │   │   │   │   ├── 📁 forms/
│   │   │   │   │   │   ├── 📁 shared/
│   │   │   │   │   │   │   ├── ⚛️ FormActions.tsx (0 B)
│   │   │   │   │   │   │   ├── ⚛️ FormField.tsx (0 B)
│   │   │   │   │   │   │   └── ⚛️ ValidationMessages.tsx (0 B)
│   │   │   │   │   │   ├── ⚛️ CategorieForm.tsx (12.6 KB)
│   │   │   │   │   │   ├── ⚛️ DomaineForm.tsx (0 B)
│   │   │   │   │   │   ├── ⚛️ EntrepriseForm.tsx (10 KB)
│   │   │   │   │   │   ├── ⚛️ GrilleQualiteForm.tsx (10.9 KB)
│   │   │   │   │   │   └── ⚛️ SujetForm.tsx (18.7 KB)
│   │   │   │   │   ├── ⚛️ AdminCategoriesSection.tsx (36.5 KB)
│   │   │   │   │   ├── ⚛️ AdminEntrepriseSection.tsx (13.8 KB)
│   │   │   │   │   ├── ⚛️ AdminGrillesQualiteSection.tsx (18.9 KB)
│   │   │   │   │   ├── ⚛️ AdminPonderationSection.tsx (10.8 KB)
│   │   │   │   │   ├── ⚛️ AdminSujetsSection.tsx (29 KB)
│   │   │   │   │   └── ⚛️ AdminTraducteurSection.tsx (27.4 KB)
│   │   │   │   ├── ⚛️ AdminMainPage.tsx (17.4 KB)
│   │   │   │   ├── ⚛️ AdminNavigation.tsx (3.2 KB)
│   │   │   │   ├── ⚛️ AdminSelectors.tsx (6.4 KB)
│   │   │   │   └── ⚛️ AdminToolbar.tsx (5.5 KB)
│   │   │   ├── 📁 hooks/
│   │   │   │   ├── ⚛️ useAdminForm.tsx (0 B)
│   │   │   │   ├── ⚛️ useAdminState.tsx (2.7 KB)
│   │   │   │   └── ⚛️ useAdminValidation.tsx (0 B)
│   │   │   ├── 📁 services/
│   │   │   │   ├── ⚛️ adminDataService.tsx (15.1 KB)
│   │   │   │   └── ⚛️ validationService.tsx (0 B)
│   │   │   ├── 📁 types/
│   │   │   │   ├── ⚛️ admin.tsx (7.3 KB)
│   │   │   │   └── ⚛️ form.tsx (0 B)
│   │   │   ├── 📁 utils/
│   │   │   │   ├── ⚛️ adminConstants.tsx (0 B)
│   │   │   │   └── ⚛️ adminHelpers.tsx (0 B)
│   │   │   ├── ⚛️ AdminPonderationPage.tsx (21.5 KB)
│   │   │   ├── ⚛️ page.tsx (327 B)
│   │   │   └── 📝 README.md (0 B)
│   │   ├── 📁 components/
│   │   │   ├── 📁 EntrainementSuivi/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 RessourcesPanel.tsx/
│   │   │   │   │   │   ├── ⚛️ FicheCoach.tsx (5.1 KB)
│   │   │   │   │   │   ├── ⚛️ FicheConseiller.tsx (5 KB)
│   │   │   │   │   │   ├── ⚛️ index.tsx (45 B)
│   │   │   │   │   │   └── ⚛️ ResourcesPanel.tsx (3.2 KB)
│   │   │   │   │   ├── ⚛️ index.tsx (304 B)
│   │   │   │   │   ├── ⚛️ NudgeEditCard.tsx (9.5 KB)
│   │   │   │   │   ├── ⚛️ PlanningPreview.tsx (0 B)
│   │   │   │   │   ├── ⚛️ PratiqueSelectorSection.tsx (3.2 KB)
│   │   │   │   │   ├── ⚛️ StepperNavigation.tsx (1.5 KB)
│   │   │   │   │   ├── ⚛️ TrainingFinalView.tsx (0 B)
│   │   │   │   │   └── ⚛️ TrainingPath.tsx (38.6 KB)
│   │   │   │   ├── 📁 styles/
│   │   │   │   │   └── ⚛️ themes.tsx (0 B)
│   │   │   │   ├── ⚛️ EntrainementSuivi.tsx (40.4 KB)
│   │   │   │   ├── ⚛️ hooks.tsx (8.6 KB)
│   │   │   │   ├── ⚛️ index.tsx (315 B)
│   │   │   │   ├── ⚛️ types.tsx (3.6 KB)
│   │   │   │   └── ⚛️ utils.tsx (911 B)
│   │   │   ├── 📁 FourZones/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   ├── 📁 DroppableZone/
│   │   │   │   │   │   ├── ⚛️ AiMenu.tsx (8.4 KB)
│   │   │   │   │   │   ├── ⚛️ ImprovedPostit.tsx (7.8 KB)
│   │   │   │   │   │   ├── ⚛️ index.tsx (11.7 KB)
│   │   │   │   │   │   └── ⚛️ NewPostitForm.tsx (2 KB)
│   │   │   │   │   ├── 📁 FinalReviewStep/
│   │   │   │   │   │   ├── 📁 components/
│   │   │   │   │   │   │   ├── ⚛️ DraggableSegment.tsx (6 KB)
│   │   │   │   │   │   │   ├── ⚛️ EditableTextComposer.tsx (11.8 KB)
│   │   │   │   │   │   │   ├── ⚛️ EditTextModal.tsx (12.1 KB)
│   │   │   │   │   │   │   ├── ⚛️ EnhancedClientSection.tsx (5.4 KB)
│   │   │   │   │   │   │   ├── ⚛️ EnrichedTextDisplay.tsx (6 KB)
│   │   │   │   │   │   │   ├── ⚛️ index.tsx (0 B)
│   │   │   │   │   │   │   ├── ⚛️ TextSegment.tsx (6 KB)
│   │   │   │   │   │   │   ├── ⚛️ TTSControls.tsx (4.9 KB)
│   │   │   │   │   │   │   └── ⚛️ ZoneAwareSegmentationDisplay.tsx (14.4 KB)
│   │   │   │   │   │   ├── 📁 extensions/
│   │   │   │   │   │   │   ├── ⚛️ ConversationalAgent.tsx (8.3 KB)
│   │   │   │   │   │   │   ├── ⚛️ ProsodieControls.tsx (11.9 KB)
│   │   │   │   │   │   │   ├── ⚛️ SmartTextSegmentation.tsx (13.9 KB)
│   │   │   │   │   │   │   └── ⚛️ VoiceByRole.tsx (6.7 KB)
│   │   │   │   │   │   ├── 📁 hooks/
│   │   │   │   │   │   │   └── ⚛️ useTTS.tsx (6 KB)
│   │   │   │   │   │   ├── 📁 types/
│   │   │   │   │   │   │   ├── ⚛️ editableText.tsx (7.2 KB)
│   │   │   │   │   │   │   └── ⚛️ tts.types.tsx (0 B)
│   │   │   │   │   │   ├── 📁 utils/
│   │   │   │   │   │   │   └── ⚛️ tts.utils.tsx (0 B)
│   │   │   │   │   │   ├── ⚛️ FinalReviewStep.tsx (28.9 KB)
│   │   │   │   │   │   └── ⚛️ TTSStudioPanel.tsx (17.3 KB)
│   │   │   │   │   ├── ⚛️ ClientResponseSection.tsx (19.9 KB)
│   │   │   │   │   ├── ⚛️ DynamicSpeechToTextForFourZones.tsx (1.5 KB)
│   │   │   │   │   ├── 📘 DynamicSpeechToTextForFourZones.types.ts (1.4 KB)
│   │   │   │   │   ├── ⚛️ EnhancedDropZone.tsx (10.2 KB)
│   │   │   │   │   ├── ⚛️ ImprovementSection.tsx (16.6 KB)
│   │   │   │   │   ├── ⚛️ ReadingTimeLine.tsx (12.1 KB)
│   │   │   │   │   ├── ⚛️ SortablePostit.tsx (2.4 KB)
│   │   │   │   │   ├── ⚛️ SpeechToTextForFourZones.tsx (19.5 KB)
│   │   │   │   │   ├── ⚛️ StepNavigation.tsx (1.5 KB)
│   │   │   │   │   ├── ⚛️ StepperHeader.tsx (1.9 KB)
│   │   │   │   │   ├── ⚛️ SuggestionSection.tsx (5.2 KB)
│   │   │   │   │   ├── 📘 SuggestionSection.types.ts (1.6 KB)
│   │   │   │   │   ├── ⚛️ ToolBar.tsx (3.7 KB)
│   │   │   │   │   ├── 📘 ToolBar.types.ts (1.7 KB)
│   │   │   │   │   └── ⚛️ ZoneLegend.tsx (793 B)
│   │   │   │   ├── 📁 constants/
│   │   │   │   │   ├── ⚛️ steps.tsx (2.3 KB)
│   │   │   │   │   └── ⚛️ zone.tsx (397 B)
│   │   │   │   ├── 📁 hooks/
│   │   │   │   │   ├── ⚛️ useDragAndDrop.tsx (3.8 KB)
│   │   │   │   │   ├── ⚛️ useNotifications.tsx (1.1 KB)
│   │   │   │   │   ├── ⚛️ usePostits.tsx (4.6 KB)
│   │   │   │   │   └── ⚛️ useStepNavigation.tsx (1.6 KB)
│   │   │   │   ├── 📁 types/
│   │   │   │   │   └── ⚛️ types.tsx (8.9 KB)
│   │   │   │   ├── 📁 utils/
│   │   │   │   │   ├── ⚛️ aiUtils.tsx (673 B)
│   │   │   │   │   ├── ⚛️ generateFinalText.tsx (22.7 KB)
│   │   │   │   │   ├── ⚛️ postitUtils.tsx (1.2 KB)
│   │   │   │   │   ├── ⚛️ rolePlayUtils.tsx (3.2 KB)
│   │   │   │   │   └── ⚛️ stepContentUtils.tsx (10 KB)
│   │   │   │   └── ⚛️ index.tsx (18 KB)
│   │   │   ├── 📁 Postit/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   └── ⚛️ StepNavigation.tsx (8.4 KB)
│   │   │   │   ├── 📁 hooks/
│   │   │   │   │   ├── ⚛️ index.tsx (378 B)
│   │   │   │   │   ├── ⚛️ usePostit.tsx (7.2 KB)
│   │   │   │   │   ├── ⚛️ usePostitActions.tsx (6.6 KB)
│   │   │   │   │   ├── ⚛️ usePostitNavigation.tsx (4.8 KB)
│   │   │   │   │   ├── ⚛️ usePostitStyles.tsx (2.8 KB)
│   │   │   │   │   ├── ⚛️ usePratiqueSelection.tsx (4.3 KB)
│   │   │   │   │   └── ⚛️ useSujetSelection.tsx (5.5 KB)
│   │   │   │   ├── 📁 PostitSteps/
│   │   │   │   │   ├── ⚛️ ContexteStep.tsx (4.1 KB)
│   │   │   │   │   ├── ⚛️ index.tsx (284 B)
│   │   │   │   │   ├── ⚛️ PratiqueStep.tsx (2.9 KB)
│   │   │   │   │   ├── ⚛️ StatusBadge.tsx (1.2 KB)
│   │   │   │   │   ├── ⚛️ StepNavigation.tsx (10.3 KB)
│   │   │   │   │   ├── ⚛️ SujetStep.tsx (1.8 KB)
│   │   │   │   │   └── ⚛️ SummaryPanel.tsx (6.8 KB)
│   │   │   │   ├── ⚛️ constants.tsx (4 KB)
│   │   │   │   ├── ⚛️ index.tsx (10 KB)
│   │   │   │   ├── ⚛️ types.tsx (14.2 KB)
│   │   │   │   └── ⚛️ utils.tsx (2.6 KB)
│   │   │   ├── 📁 ShareEvaluationButton/
│   │   │   │   ├── ⚛️ index.tsx (388 B)
│   │   │   │   ├── ⚛️ ShareEvaluationButton.tsx (12.5 KB)
│   │   │   │   ├── 📘 types.ts (2.2 KB)
│   │   │   │   └── ⚛️ useEvaluationSharing.tsx (21.4 KB)
│   │   │   ├── 📁 SyntheseEvaluation/
│   │   │   │   ├── 📁 components/
│   │   │   │   │   └── ⚛️ EvaluationCard.tsx (3.1 KB)
│   │   │   │   ├── 📁 RadarEvaluation/
│   │   │   │   │   └── 📝 README.MD (34.7 KB)
│   │   │   │   ├── 📁 utils/
│   │   │   │   │   ├── ⚛️ filters.tsx (2.7 KB)
│   │   │   │   │   └── ⚛️ formatters.tsx (1.2 KB)
│   │   │   │   ├── ⚛️ CritereQualiteTab.tsx (4.7 KB)
│   │   │   │   ├── ⚛️ index.tsx (12.3 KB)
│   │   │   │   ├── 📝 README.md (3.1 KB)
│   │   │   │   ├── ⚛️ SimulationCoachingTab.tsx (21.9 KB)
│   │   │   │   ├── ⚛️ syntheseEvaluation.types.tsx (9.1 KB)
│   │   │   │   └── ⚛️ SyntheseTab.tsx (36 KB)
│   │   │   ├── 📁 UnifiedHeader/
│   │   │   │   ├── 📁 shared/
│   │   │   │   │   ├── ⚛️ CallInfo.tsx (2 KB)
│   │   │   │   │   ├── ⚛️ ColorationToggle.tsx (2.2 KB)
│   │   │   │   │   ├── ⚛️ ContextualActions.tsx (4.8 KB)
│   │   │   │   │   ├── ⚛️ DisplayActions.tsx (4.1 KB)
│   │   │   │   │   ├── ⚛️ DomainSelector.tsx (1.5 KB)
│   │   │   │   │   ├── ⚛️ TitleSection.tsx (950 B)
│   │   │   │   │   ├── ⚛️ TranscriptionActions.tsx (1.3 KB)
│   │   │   │   │   └── ⚛️ ViewModeToggle.tsx (1.6 KB)
│   │   │   │   ├── ⚛️ ContextualHeader.tsx (4 KB)
│   │   │   │   ├── ⚛️ index.tsx (4 KB)
│   │   │   │   ├── ⚛️ TranscriptionHeader.tsx (6 KB)
│   │   │   │   └── 📘 unifiedHeader.types.ts (2.5 KB)
│   │   │   ├── ⚛️ AddPostitButton.tsx (5.1 KB)
│   │   │   ├── ⚛️ AudioControl.tsx (3.4 KB)
│   │   │   ├── ⚛️ AudioPlayer.tsx (5.1 KB)
│   │   │   ├── ⚛️ BandeauEval.tsx (6.3 KB)
│   │   │   ├── ⚛️ Evalcontainer.tsx (445 B)
│   │   │   ├── ⚛️ EvaluationCard.tsx (2.8 KB)
│   │   │   ├── ⚛️ EvaluationCardCompact.tsx (2.1 KB)
│   │   │   ├── ⚛️ EvaluationDrawer.tsx (1.1 KB)
│   │   │   ├── ⚛️ EvaluationPostits.tsx (3.1 KB)
│   │   │   ├── ⚛️ EvaluationSidebar.tsx (1.3 KB)
│   │   │   ├── ⚛️ EvaluationTranscript.tsx (5.5 KB)
│   │   │   ├── ⚛️ Exercices.tsx (7.8 KB)
│   │   │   ├── ⚛️ GridContainerPratiquesEval.tsx (9 KB)
│   │   │   ├── ⚛️ GridContainerSujetsEval.tsx (5.8 KB)
│   │   │   ├── ⚛️ HistoriqueEvaluation.tsx (248 B)
│   │   │   ├── ⚛️ Progression.tsx (3 KB)
│   │   │   ├── ⚛️ SimplifiedGridContainerPratiques.tsx (4.4 KB)
│   │   │   ├── ⚛️ SimplifiedGridContainerSujets.tsx (4.1 KB)
│   │   │   ├── ⚛️ TimeLineAudio.tsx (4.7 KB)
│   │   │   ├── ⚛️ TimestampInput.tsx (4.4 KB)
│   │   │   ├── ⚛️ Transcript.tsx (15.2 KB)
│   │   │   └── ⚛️ TranscriptAlternative.tsx (22 KB)
│   │   ├── 📁 hooks/
│   │   │   └── ⚛️ useRealtimeEvaluationSharing.tsx (6.2 KB)
│   │   ├── ⚛️ Evaluation.tsx (14 KB)
│   │   ├── ⚛️ evaluation.types.tsx (11.1 KB)
│   │   ├── ⚛️ EvaluationClient.tsx (478 B)
│   │   ├── ⚛️ layout.tsx (712 B)
│   │   └── ⚛️ page.tsx (711 B)
│   ├── 📁 login/
│   │   ├── ⚛️ Login.tsx (3.6 KB)
│   │   └── ⚛️ page.tsx (121 B)
│   ├── 📁 whiteboard/
│   │   ├── 📁 components/
│   │   │   ├── 📁 Avatar/
│   │   │   │   └── ⚛️ AvatarSelector.tsx (3.5 KB)
│   │   │   ├── 📁 CoachingFourZone/
│   │   │   │   ├── ⚛️ AudioList.tsx (3.8 KB)
│   │   │   │   ├── ⚛️ AudioUploadModal.tsx (2.1 KB)
│   │   │   │   ├── ⚛️ audioUploadUtils.tsx (5 KB)
│   │   │   │   ├── ⚛️ AuthButton.tsx (1.5 KB)
│   │   │   │   ├── ⚛️ CallListUnprepared.tsx (9.5 KB)
│   │   │   │   ├── ⚛️ CallUploader.tsx (8 KB)
│   │   │   │   ├── ⚛️ CoachingFourZones.tsx (4.5 KB)
│   │   │   │   ├── ⚛️ FilterInput.tsx (581 B)
│   │   │   │   ├── ⚛️ FolderTreeView.tsx (4.7 KB)
│   │   │   │   ├── ⚛️ FourZoneNode.tsx (426 B)
│   │   │   │   ├── ⚛️ RemoveCallUpload.tsx (3.3 KB)
│   │   │   │   ├── ⚛️ SelectionConseiller.tsx (4.8 KB)
│   │   │   │   ├── ⚛️ SnackbarManager.tsx (1.4 KB)
│   │   │   │   ├── ⚛️ supabaseUtils.tsx (976 B)
│   │   │   │   ├── ⚛️ Transcript.tsx (1.1 KB)
│   │   │   │   ├── 📘 types.ts (1.3 KB)
│   │   │   │   └── ⚛️ WorkDriveUtils.tsx (4.7 KB)
│   │   │   ├── 📁 Navigation/
│   │   │   │   └── ⚛️ BottomNavBar.tsx (5.5 KB)
│   │   │   ├── 📁 Postits/
│   │   │   │   └── ⚛️ PostIt.tsx (6.2 KB)
│   │   │   ├── 📁 SharedEvaluation/
│   │   │   │   ├── ⚛️ index.tsx (628 B)
│   │   │   │   ├── ⚛️ SessionSelector.tsx (5.5 KB)
│   │   │   │   ├── ⚛️ SessionStatusBadge.tsx (5.1 KB)
│   │   │   │   ├── ⚛️ SharedEvaluationContent.tsx (13.4 KB)
│   │   │   │   ├── ⚛️ SharedEvaluationHeader.tsx (5.9 KB)
│   │   │   │   ├── ⚛️ SharedEvaluationViewer.tsx (5.9 KB)
│   │   │   │   └── ⚛️ SynchronizedTranscript.tsx (9.1 KB)
│   │   │   ├── 📁 Sondage/
│   │   │   │   ├── ⚛️ CoachSurveySettings.tsx (4.7 KB)
│   │   │   │   ├── ⚛️ QuestionCoach.tsx (2.9 KB)
│   │   │   │   └── ⚛️ Sondage.tsx (6.3 KB)
│   │   │   ├── ⚛️ DebugSession.tsx (887 B)
│   │   │   └── ⚛️ Login.tsx (1.9 KB)
│   │   ├── 📁 hooks/
│   │   │   ├── ⚛️ index.tsx (215 B)
│   │   │   ├── 📘 types.ts (986 B)
│   │   │   ├── ⚛️ useRealtimeEvaluationSync.tsx (10.7 KB)
│   │   │   ├── ⚛️ useSharedEvaluation.tsx (7.9 KB)
│   │   │   └── ⚛️ useSpectatorTranscriptions.tsx (3.3 KB)
│   │   ├── ⚛️ page.tsx (422 B)
│   │   ├── 📝 README_PHASE3 copy.MD (14 KB)
│   │   ├── 📝 README_PHASE3.MD (28 KB)
│   │   ├── 📝 README.MD (18.3 KB)
│   │   ├── 📝 README4.MD (16.2 KB)
│   │   ├── 📝 README5.MD (20.3 KB)
│   │   ├── 📝 README6.MD (14.5 KB)
│   │   ├── 📝 READMEAFFECTATIONSUJETWHITEBOARD.MD (13.2 KB)
│   │   └── ⚛️ Whiteboard.tsx (7.7 KB)
│   ├── 📁 zohoworkdrive/
│   │   ├── 📁 components/
│   │   │   ├── ⚛️ EnterpriseCallsList.tsx (6.4 KB)
│   │   │   ├── ⚛️ FileItem.tsx (2.8 KB)
│   │   │   ├── ⚛️ FileList.tsx (3.9 KB)
│   │   │   ├── ⚛️ Icons.tsx (5 KB)
│   │   │   └── ⚛️ WorkdriveExplorer.tsx (19.8 KB)
│   │   ├── 📁 lib/
│   │   │   ├── 📁 zohoworkdrive/
│   │   │   │   ├── ⚛️ api.tsx (7.8 KB)
│   │   │   │   └── ⚛️ auth.tsx (2.8 KB)
│   │   │   ├── ⚛️ audioUploadUtils.tsx (7.9 KB)
│   │   │   ├── ⚛️ removeCallUpload.tsx (2.6 KB)
│   │   │   ├── ⚛️ serverUtils.tsx (269 B)
│   │   │   └── ⚛️ supabaseUtils.tsx (790 B)
│   │   ├── 📁 types/
│   │   │   ├── 📘 index.ts (3.1 KB)
│   │   │   └── 📘 zoho.ts (606 B)
│   │   ├── 📁 utils/
│   │   │   ├── ⚛️ formatters.tsx (481 B)
│   │   │   └── ⚛️ storage.tsx (995 B)
│   │   └── ⚛️ page.tsx (4.7 KB)
│   ├── 📄 favicon.ico (25.3 KB)
│   ├── 🎨 globals.css (345 B)
│   ├── ⚛️ layout.tsx (1.7 KB)
│   └── ⚛️ page.tsx (6.9 KB)
├── 📁 config/
│   └── ⚛️ gridConfig.tsx (342 B)
├── 📁 context/
│   ├── ⚛️ AppContext.tsx (7.7 KB)
│   ├── ⚛️ AudioContext.tsx (12.1 KB)
│   ├── ⚛️ AudioProvider.tsx (8.7 KB)
│   ├── ⚛️ AuthContext.tsx (2.7 KB)
│   ├── ⚛️ CallDataContext.tsx (9.4 KB)
│   ├── ⚛️ ConseillerContext.tsx (4.9 KB)
│   ├── ⚛️ RootProvider.tsx (2.2 KB)
│   ├── ⚛️ SharedContext.tsx (1.5 KB)
│   ├── ⚛️ SharedEvaluationContext.tsx (9.5 KB)
│   ├── ⚛️ SupabaseContext.tsx (2.2 KB)
│   ├── ⚛️ TaggingDataContext.tsx (7.7 KB)
│   └── ⚛️ ZohoContext.tsx (2.2 KB)
├── 📁 docs/
│   └── 📝 arborescence.md (28.8 KB)
├── 📁 hooks/
│   ├── 📁 AppContext/
│   │   ├── ⚛️ useActivities.tsx (3.9 KB)
│   │   ├── ⚛️ useAuth.tsx (936 B)
│   │   ├── ⚛️ useBandeauEvalData.tsx (880 B)
│   │   ├── ⚛️ useEntreprises.tsx (1.4 KB)
│   │   ├── ⚛️ useFetchAllData.tsx (3.7 KB)
│   │   ├── ⚛️ useFilteredDomains.tsx (1.4 KB)
│   │   ├── ⚛️ useNudges.tsx (4.2 KB)
│   │   ├── ⚛️ useSelectedPratique.tsx (534 B)
│   │   ├── ⚛️ useSelection.tsx (11.7 KB)
│   │   └── ⚛️ useUI.tsx (3.9 KB)
│   ├── 📁 CallDataContext/
│   │   ├── ⚛️ useAudio.tsx (3.7 KB)
│   │   ├── 📘 useAudio.types.ts (1 KB)
│   │   ├── ⚛️ useCallActivity.tsx (12 KB)
│   │   ├── ⚛️ useCalls.tsx (6.3 KB)
│   │   ├── ⚛️ usePostits.tsx (9.5 KB)
│   │   ├── ⚛️ useQuiz.tsx (2.7 KB)
│   │   ├── ⚛️ useQuizState.tsx (1.8 KB)
│   │   ├── ⚛️ useRolePlay.tsx (5 KB)
│   │   ├── ⚛️ useTranscriptions.tsx (2 KB)
│   │   └── ⚛️ useZones.tsx (796 B)
│   ├── 📁 Postit/
│   │   ├── ⚛️ index.tsx (689 B)
│   │   ├── 📘 types.ts (2.6 KB)
│   │   ├── ⚛️ usePostit.tsx (7.8 KB)
│   │   ├── ⚛️ usePostitActions.tsx (6.2 KB)
│   │   ├── ⚛️ useStyles.tsx (1.5 KB)
│   │   └── ⚛️ utils.tsx (4.5 KB)
│   ├── 📁 whiteboard/
│   │   ├── ⚛️ useCoach.tsx (1014 B)
│   │   ├── ⚛️ useConnectedAvatars.tsx (1.7 KB)
│   │   ├── ⚛️ useCurrentView.tsx (4.1 KB)
│   │   └── ⚛️ useSession.tsx (3.6 KB)
│   ├── ⚛️ useConseillers.tsx (2 KB)
│   ├── ⚛️ useDomains.tsx (4.1 KB)
│   ├── ⚛️ useHighlightedPractices.tsx (2.1 KB)
│   └── ⚛️ usePonderationSujets.tsx (7.4 KB)
├── 📁 lib/
│   ├── 📁 supabase/
│   ├── 📘 supabaseClient.ts (194 B)
│   ├── 📘 supabaseServer.ts (2 KB)
│   └── 📘 supabaseServiceRole.ts (1.2 KB)
├── 📁 public/
│   ├── 📁 assets/
│   ├── 🖼️ file.svg (391 B)
│   ├── 🖼️ globe.svg (1 KB)
│   ├── 🖼️ logosonear.png (11.9 KB)
│   ├── 🖼️ next.svg (1.3 KB)
│   ├── 🖼️ vercel.svg (128 B)
│   └── 🖼️ window.svg (385 B)
├── 📁 scripts/
│   ├── 📜 .eslintrc.js (454 B)
│   └── 📄 generate-tree.mjs (8.7 KB)
├── 📁 services/
│   ├── ⚛️ AudioCacheService.tsx (7.5 KB)
│   └── ⚛️ AudioService.tsx (3.9 KB)
├── 📁 tmp/
├── 📁 types/
│   ├── 📁 common/
│   ├── 📁 context/
│   │   ├── 📁 AuthContext/
│   │   │   └── ⚛️ AuthContextTypes.tsx (190 B)
│   │   ├── 📁 SupabaseContext/
│   │   │   └── ⚛️ SupabaseTypes.tsx (274 B)
│   │   └── 📁 ZohoContext/
│   │       └── ⚛️ ZohoContextTypes.tsx (274 B)
│   ├── ⚛️ evaluation.tsx (2.4 KB)
│   └── 📘 types.ts (21.5 KB)
├── 📁 utils/
│   ├── ⚛️ auth0TokenStorage.tsx (1.1 KB)
│   └── ⚛️ SpeakerUtils.tsx (6 KB)
├── 📄 erreurs_groupees.txt (0 B)
├── 📄 eslint.config.mjs (393 B)
├── ⚛️ middleware.tsx (1.1 KB)
├── 📘 next-env.d.ts (211 B)
├── 📘 next.config.ts (606 B)
├── 📋 package-lock.json (266.6 KB)
├── 📋 package.json (3.1 KB)
├── 📄 postcss.config.mjs (135 B)
├── 📝 README.md (1.4 KB)
├── 📝 SUPABASE_MAILING.MD (18.4 KB)
├── 📝 SUPABASE_PUBLIC.MD (22.4 KB)
├── 📝 SUPABASE_SCHEMAS.MD (24.2 KB)
├── 📝 SUPABASE_WHITEBOARD.MD (24.7 KB)
├── 📝 SUPABASE.MD (34.8 KB)
├── 📘 tailwind.config.ts (393 B)
├── 📋 tsconfig.json (791 B)
└── 📝 WHITEBOARD.MD (27.9 KB)

```

## 📊 Statistiques du projet

- **Fichiers**: 367
- **Dossiers**: 118
- **Taille totale**: 2.5 MB

### Types de fichiers

| Extension | Nombre |
|-----------|--------|
| .tsx | 311 |
| .md | 18 |
| .ts | 18 |
| .json | 6 |
| .svg | 5 |
| .mjs | 3 |
| .js | 2 |
| .ico | 1 |
| .css | 1 |
| .txt | 1 |
| .png | 1 |

### 📦 Fichiers les plus volumineux

| Fichier | Taille |
|---------|--------|
| package-lock.json | 266.6 KB |
| app\evaluation\components\EntrainementSuivi\EntrainementSuivi.tsx | 40.4 KB |
| app\evaluation\components\EntrainementSuivi\components\TrainingPath.tsx | 38.6 KB |
| app\evaluation\admin\components\sections\AdminCategoriesSection.tsx | 36.5 KB |
| app\evaluation\components\SyntheseEvaluation\SyntheseTab.tsx | 36 KB |
| SUPABASE.MD | 34.8 KB |
| app\evaluation\components\SyntheseEvaluation\RadarEvaluation\README.MD | 34.7 KB |
| app\evaluation\admin\components\sections\AdminSujetsSection.tsx | 29 KB |
| app\evaluation\components\FourZones\components\FinalReviewStep\FinalReviewStep.tsx | 28.9 KB |
| docs\arborescence.md | 28.8 KB |

---

*Ce fichier a été généré automatiquement par le script d'arborescence. Ne pas modifier manuellement.*
