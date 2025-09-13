# Whiteboard - Plateforme d'Évaluation et Formation Collaborative

## 📋 Description du Projet

**Plateforme avancée d'évaluation et de formation** développée avec Next.js 14+, spécialisée dans l'analyse d'appels téléphoniques, l'évaluation de conseillers, et la formation collaborative. Cette application combine tableau blanc interactif, intelligence artificielle, transcription audio, et outils d'évaluation pour créer un écosystème complet de formation professionnelle.

## 🚀 Fonctionnalités Principales

### **🎯 Évaluation et Formation**

- **Évaluation d'appels** : Analyse et notation d'appels téléphoniques
- **Module admin** : Gestion des entreprises, grilles de qualité, pondération
- **Four Zones** : Méthodologie d'évaluation en 4 zones avec IA
- **Post-its collaboratifs** : Système d'annotation et de feedback
- **Entraînement et suivi** : Parcours de formation personnalisés

### **🤖 Intelligence Artificielle**

- **Transcription automatique** : Conversion speech-to-text des appels
- **IA d'amélioration** : Suggestions d'amélioration automatiques
- **Text-to-Speech (TTS)** : Génération audio à partir de texte
- **Analyse conversationnelle** : Évaluation automatique des échanges

### **💾 Intégration Cloud**

- **Zoho WorkDrive** : Stockage et synchronisation cloud
- **Upload audio/vidéo** : Gestion complète des fichiers multimédias
- **Partage d'évaluations** : Sessions collaboratives en temps réel

### **📊 Whiteboard Collaboratif**

- **Canvas interactif** : Dessin et annotation collaborative
- **Sessions partagées** : Évaluation en temps réel multi-utilisateurs
- **Navigation par phases** : Structure organisée par étapes

## 🛠️ Stack Technique

- **Frontend** : Next.js 14+ (App Router), React 18+, TypeScript
- **IA & Audio** : Transcription automatique, TTS, Speech-to-Text
- **Storage** : Zoho WorkDrive, Supabase
- **Styling** : Tailwind CSS, CSS Modules
- **Déploiement** : Vercel + Netlify (42 environnements actifs)

## 📁 Architecture Complète du Projet

```
whiteboard/
├── app/                           # Next.js App Router principal
│   ├── api/                       # Routes API backend
│   │   ├── ai/improve/           # IA - Amélioration de texte
│   │   ├── calls/create-from-zoho/ # Création d'appels depuis Zoho
│   │   ├── evaluation-sharing/    # API partage d'évaluations temps réel
│   │   │   ├── active-sessions/   # Sessions actives
│   │   │   ├── check-session/     # Vérification sessions
│   │   │   ├── create-session/    # Création sessions
│   │   │   ├── stop-session/      # Arrêt sessions
│   │   │   ├── update-controls/   # Contrôles interface
│   │   │   ├── update-mode/       # Modes d'évaluation
│   │   │   └── update-position/   # Position timeline
│   │   ├── getAudioUrl/          # URLs des fichiers audio
│   │   ├── ponderation-sujets/   # Pondération des sujets
│   │   ├── send-training-email/  # Envoi emails formation
│   │   ├── transcribe/           # Transcription audio
│   │   ├── transcription/get/    # Récupération transcriptions
│   │   ├── tts/                  # Text-to-Speech
│   │   └── zoho/                 # Intégration Zoho
│   │       ├── auth/             # Authentification Zoho
│   │       ├── callback/         # Callback OAuth
│   │       └── workdrive/        # API WorkDrive
│   │
│   ├── components/               # Composants réutilisables
│   │   ├── common/              # Composants génériques
│   │   │   ├── ActivityIndicator.tsx
│   │   │   ├── AuthStatus.tsx
│   │   │   ├── CallSelection.tsx
│   │   │   ├── EntrepriseSelection.tsx
│   │   │   ├── GlobalNavBar.tsx
│   │   │   ├── NewCallUploader.tsx
│   │   │   ├── PreserveRouteOnRefresh.tsx
│   │   │   ├── SelectionConseiller.tsx
│   │   │   ├── SelectionEntrepriseEtAppel.tsx
│   │   │   └── Theme/ThemeProvider.tsx
│   │   └── navigation/          # Navigation avancée
│   │       └── ActivitySidebar/ # Sidebar avec phases d'activité
│   │           ├── components/  # Navigation, phases, étapes
│   │           ├── constants/   # Constantes navigation
│   │           ├── hooks/       # Hooks navigation (phases, stats, data)
│   │           └── types/       # Types navigation
│   │
│   ├── evaluation/              # Module d'évaluation complet
│   │   ├── admin/              # Interface administrateur
│   │   │   ├── components/     # Interface admin (sélecteurs, toolbar)
│   │   │   │   └── sections/   # Sections admin (catégories, entreprises, grilles)
│   │   │   │       ├── dialogs/ # Dialogs d'association
│   │   │   │       └── forms/   # Formulaires admin avec validation
│   │   │   ├── hooks/          # Hooks admin (form, state, validation)
│   │   │   ├── services/       # Services données admin
│   │   │   ├── types/          # Types admin et formulaires
│   │   │   └── utils/          # Utilitaires admin
│   │   ├── components/         # Composants d'évaluation
│   │   │   ├── EntrainementSuivi/ # Module d'entraînement
│   │   │   │   ├── components/ # Navigation, preview, ressources
│   │   │   │   └── styles/     # Thèmes d'entraînement
│   │   │   ├── FourZones/      # Méthodologie 4 zones
│   │   │   │   ├── components/ # Zones de drop, navigation, suggestions
│   │   │   │   │   ├── DroppableZone/ # Zones interactives avec IA
│   │   │   │   │   └── FinalReviewStep/ # Étape finale avec TTS
│   │   │   │   │       ├── components/ # Segments, composer, TTS
│   │   │   │   │       ├── extensions/ # Agent conversationnel, contrôles
│   │   │   │   │       ├── hooks/      # Hook TTS
│   │   │   │   │       ├── types/      # Types TTS et texte
│   │   │   │   │       └── utils/      # Utilitaires TTS
│   │   │   │   ├── constants/  # Étapes et zones
│   │   │   │   ├── hooks/      # Drag&Drop, notifications, post-its
│   │   │   │   ├── types/      # Types Four Zones
│   │   │   │   └── utils/      # IA, génération texte, roleplay
│   │   │   ├── Postit/         # Système de post-its
│   │   │   │   ├── components/ # Navigation des étapes
│   │   │   │   ├── hooks/      # Actions, navigation, styles post-its
│   │   │   │   └── PostitSteps/ # Étapes (contexte, pratique, sujet)
│   │   │   ├── ShareEvaluationButton/ # Partage d'évaluations
│   │   │   ├── SyntheseEvaluation/ # Synthèse et radar
│   │   │   │   ├── components/ # Cards d'évaluation
│   │   │   │   ├── RadarEvaluation/ # Graphiques radar
│   │   │   │   └── utils/      # Filtres et formatage
│   │   │   └── UnifiedHeader/  # En-tête unifié
│   │   │       └── shared/     # Actions, sélecteurs, infos appels
│   │   └── hooks/              # Hooks évaluation temps réel
│   │
│   ├── login/                  # Authentification
│   │   ├── Login.tsx
│   │   └── page.tsx
│   │
│   ├── whiteboard/             # Module tableau blanc principal
│   │   ├── components/         # Composants whiteboard
│   │   │   ├── Avatar/         # Sélection d'avatars
│   │   │   ├── CoachingFourZone/ # Coaching avec méthodologie 4 zones
│   │   │   │   ├── AudioList.tsx
│   │   │   │   ├── AudioUploadModal.tsx
│   │   │   │   ├── audioUploadUtils.tsx
│   │   │   │   ├── AuthButton.tsx
│   │   │   │   ├── CallListUnprepared.tsx
│   │   │   │   ├── CallUploader.tsx
│   │   │   │   ├── CoachingFourZones.tsx
│   │   │   │   ├── FilterInput.tsx
│   │   │   │   ├── FolderTreeView.tsx
│   │   │   │   ├── FourZoneNode.tsx
│   │   │   │   ├── RemoveCallUpload.tsx
│   │   │   │   ├── SelectionConseiller.tsx
│   │   │   │   ├── SnackbarManager.tsx
│   │   │   │   ├── supabaseUtils.tsx
│   │   │   │   ├── Transcript.tsx
│   │   │   │   ├── types.ts
│   │   │   │   └── WorkDriveUtils.tsx
│   │   │   ├── Navigation/      # Navigation tableau blanc
│   │   │   ├── Postits/        # Post-its interactifs
│   │   │   ├── SharedEvaluation/ # Évaluations partagées temps réel
│   │   │   │   ├── SessionSelector.tsx
│   │   │   │   ├── SessionStatusBadge.tsx
│   │   │   │   ├── SharedEvaluationContent.tsx
│   │   │   │   ├── SharedEvaluationHeader.tsx
│   │   │   │   ├── SharedEvaluationViewer.tsx
│   │   │   │   └── SynchronizedTranscript.tsx
│   │   │   └── Sondage/        # Système de sondages
│   │   │       ├── CoachSurveySettings.tsx
│   │   │       ├── QuestionCoach.tsx
│   │   │       └── Sondage.tsx
│   │   ├── hooks/              # Hooks whiteboard
│   │   │   ├── useRealtimeEvaluationSync.tsx
│   │   │   ├── useSharedEvaluation.tsx
│   │   │   └── useSpectatorTranscriptions.tsx
│   │   ├── README.MD           # Documentation phases
│   │   ├── README4.MD          # Documentation v4
│   │   ├── README5.MD          # Documentation v5
│   │   ├── README6.MD          # Documentation v6
│   │   ├── README_PHASE3.MD    # Documentation Phase 3
│   │   └── Whiteboard.tsx      # Composant principal
│   │
│   ├── zohoworkdrive/          # Intégration Zoho WorkDrive
│   │   ├── components/         # Interface Zoho
│   │   │   ├── EnterpriseCallsList.tsx
│   │   │   ├── FileItem.tsx
│   │   │   ├── FileList.tsx
│   │   │   ├── Icons.tsx
│   │   │   └── WorkdriveExplorer.tsx
│   │   ├── lib/               # Bibliothèques Zoho
│   │   │   ├── audioUploadUtils.tsx
│   │   │   ├── removeCallUpload.tsx
│   │   │   ├── serverUtils.tsx
│   │   │   ├── supabaseUtils.tsx
│   │   │   └── zohoworkdrive/  # API et auth Zoho
│   │   ├── types/             # Types Zoho
│   │   └── utils/             # Utilitaires storage et formatage
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── config/                     # Configuration application
├── context/                    # Contextes React globaux
├── hooks/                      # Hooks personnalisés globaux
├── lib/                        # Bibliothèques utilitaires
├── public/                     # Assets statiques
├── services/                   # Services métier
├── tmp/                        # Fichiers temporaires
├── types/                      # Définitions TypeScript globales
├── utils/                      # Fonctions utilitaires globales
│
├── .env.local                  # Variables d'environnement
├── erreurs_groupees.txt        # Log centralisé des erreurs
├── eslint.config.mjs          # Configuration ESLint
├── middleware.tsx             # Middleware Next.js
├── next.config.ts             # Configuration Next.js
├── package.json               # Dépendances et scripts
├── SUPABASE.MD               # Documentation Supabase
└── tsconfig.json             # Configuration TypeScript
```

## 🔧 API Routes Détaillées

### **Intelligence Artificielle**

```typescript
POST / api / ai / improve; // Amélioration de texte par IA
POST / api / transcribe; // Transcription audio
GET / api / transcription / get; // Récupération transcriptions
POST / api / tts; // Text-to-Speech
```

### **Évaluation Collaborative**

```typescript
GET / api / evaluation - sharing / active - sessions; // Sessions actives
POST / api / evaluation - sharing / create - session; // Créer session
POST / api / evaluation - sharing / check - session; // Vérifier session
POST / api / evaluation - sharing / stop - session; // Arrêter session
PUT / api / evaluation - sharing / update - controls; // Contrôles interface
PUT / api / evaluation - sharing / update - mode; // Mode d'évaluation
PUT / api / evaluation - sharing / update - position; // Position timeline
```

### **Gestion des Appels**

```typescript
POST / api / calls / create - from - zoho; // Créer appel depuis Zoho
GET / api / getAudioUrl; // URLs fichiers audio
POST / api / send - training - email; // Emails de formation
```

### **Intégration Zoho**

```typescript
GET / api / zoho / auth; // Authentification Zoho
POST / api / zoho / callback; // Callback OAuth
GET / api / zoho / workdrive; // API WorkDrive
```

### **Administration**

```typescript
GET / POST / api / ponderation - sujets; // Pondération des sujets
```

## 🎯 Modules Principaux

### **1. Module Évaluation (`/evaluation`)**

- **Admin** : Gestion complète des entreprises, grilles de qualité, pondération
- **Four Zones** : Méthodologie d'évaluation en 4 zones avec IA
- **Post-its** : Système d'annotation collaborative
- **Entraînement** : Parcours de formation personnalisés
- **Synthèse** : Graphiques radar et synthèses d'évaluation

### **2. Module Whiteboard (`/whiteboard`)**

- **Coaching Four Zone** : Interface de coaching avec méthodologie 4 zones
- **Évaluations Partagées** : Sessions collaboratives temps réel
- **Upload Audio** : Gestion complète des fichiers audio
- **Transcriptions** : Affichage synchronisé des transcriptions

### **3. Module Zoho WorkDrive (`/zohoworkdrive`)**

- **Explorateur de fichiers** : Interface de navigation Zoho
- **Upload/Download** : Gestion des fichiers cloud
- **Authentification OAuth** : Intégration sécurisée

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+
- Supabase (base de données)
- Compte Zoho WorkDrive
- Clés API IA (transcription, TTS)

### Installation

```bash
# Cloner le repository
git clone https://github.com/Sainthilaire-thomas/whiteboard.git
cd whiteboard

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env.local
# Configurer les variables Zoho, Supabase, IA

# Démarrer en développement
npm run dev
```

### Variables d'Environnement Principales

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Zoho WorkDrive
ZOHO_CLIENT_ID=your_zoho_client_id
ZOHO_CLIENT_SECRET=your_zoho_client_secret
ZOHO_REDIRECT_URI=your_redirect_uri

# IA Services
TRANSCRIPTION_API_KEY=your_transcription_key
TTS_API_KEY=your_tts_key

# Application
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## 📚 Utilisation

### **Évaluation d'Appels**

1. **Upload audio** via Zoho WorkDrive ou upload direct
2. **Transcription automatique** avec IA
3. **Évaluation Four Zones** collaborative
4. **Post-its et annotations** en temps réel
5. **Synthèse et rapport** automatique

### **Formation et Coaching**

1. **Sélection conseiller/entreprise**
2. **Parcours d'entraînement** personnalisé
3. **Ressources et fiches** coach/conseiller
4. **Suivi progression** temps réel

### **Administration**

1. **Gestion entreprises** et utilisateurs
2. **Configuration grilles qualité**
3. **Pondération sujets** d'évaluation
4. **Statistiques et rapports**

## 🚀 Déploiements

### Environnements Actifs

- **Production** : `whiteboard-uiyt` ✅ (déployé hier)
- **Staging** : `whiteboard` ✅ (déployé hier)
- **Développement** : `whiteboard-ie6i` ✅ (déployé hier)

**Total : 42 déploiements** avec pipeline CI/CD automatisé (Vercel + Netlify)

## 🧠 **Logique Métier et Concepts Clés**

### **Méthodologie "Four Zones"**

La méthodologie Four Zones est au cœur de l'application et permet de rejouer le passage :

- **Zone 1** : Refleter ce qu'a fait le client
- **Zone 2** : Décrire ce que je fais
- **Zone 3** : Décrire ce que fait l'entreprise
- **Zone 4** : Décrire ce que fera le client

**Workflow** : Upload audio → Transcription IA → Analyse Four Zones → Post-its collaboratifs → Synthèse finale

### **Système d'Évaluation**

- **Grilles de qualité** personnalisables par entreprise
- **Pondération dynamique** des sujets d'évaluation
- **Sessions partagées** : Évaluateur + Spectateurs en temps réel
- **Post-its colorés** par zone avec suggestions IA
- **Radar d'évaluation** automatique

### **Workflow Complet**

```
1. Sélection Entreprise/Conseiller →
2. Upload Audio (Zoho/Direct) →
3. Transcription IA automatique →
4. Évaluation Four Zones collaborative →
5. Post-its et améliorations IA →
6. Synthèse et rapport final →
7. Envoi email formation
```

## 🔧 **Hooks et Services Spécialisés**

### **Hooks Métier Critiques**

```typescript
// Synchronisation évaluation temps réel
useRealtimeEvaluationSharing(); // Sessions collaboratives
useRealtimeEvaluationSync(); // Sync données évaluation
useSharedEvaluation(); // Partage multi-utilisateurs
useSpectatorTranscriptions(); // Transcriptions pour spectateurs

// Navigation phases d'activité
useActivityPhases(); // Gestion phases métier
useActivityStats(); // Statistiques activité
usePhaseNavigation(); // Navigation entre phases
usePhaseData(); // Données par phase

// Post-its et annotations
usePostit(); // CRUD post-its
usePostitActions(); // Actions post-its (créer, modifier, supprimer)
usePostitNavigation(); // Navigation entre post-its
useDragAndDrop(); // Drag & drop post-its entre zones

// IA et TTS
useTTS(); // Text-to-Speech avec contrôles prosodiques
useNotifications(); // Notifications système
```

### **Services Backend Clés**

```typescript
// Services admin
adminDataService.tsx; // CRUD données admin
validationService.tsx; // Validation formulaires

// Utilitaires métier
audioUploadUtils.tsx; // Upload et traitement audio
supabaseUtils.tsx; // Interface Supabase
WorkDriveUtils.tsx; // Interface Zoho WorkDrive
aiUtils.tsx; // Intégration IA (transcription, amélioration)
generateFinalText.tsx; // Génération texte final évaluation
rolePlayUtils.tsx; // Simulation conversations
```

## 🎯 **États et Flux de Données**

### **États Globaux Critiques**

- **Sessions d'évaluation** : État partagé temps réel
- **Position timeline** : Synchronisation lecture audio
- **Mode évaluation** : Évaluateur vs Spectateur
- **Contrôles interface** : Play/pause, vitesse lecture
- **Cache Zoho** : Tokens OAuth et fichiers

### **Flux Temps Réel**

```typescript
// WebSocket/Temps réel via Supabase
Session Creation → Real-time Sync →
Position Updates → Control Sync →
Postit Changes → Final Evaluation
```

## 📊 **Structure des Données**

### **Entités Principales**

```typescript
// Entreprises et utilisateurs
Enterprise {
  id, name, grilles_qualite[],
  conseillers[], domaines[]
}

// Appels et évaluations
Call {
  id, audio_url, transcript,
  entreprise_id, conseiller_id,
  four_zones_data, postits[]
}

// Sessions collaboratives
EvaluationSession {
  id, call_id, evaluator_id,
  spectators[], controls, mode,
  timeline_position, status
}

// Grilles de qualité
QualityGrid {
  id, entreprise_id, categories[],
  sujets[], ponderation_rules
}
```

## 🚨 **Points d'Attention Techniques**

### **Gestion des Erreurs Spécifiques**

- **Erreurs Zoho OAuth** : Refresh tokens expirés
- **Timeouts transcription** : Fichiers audio longs
- **Sync temps réel** : Perte connexion pendant évaluation
- **Upload failures** : Fichiers audio corrompus/trop lourds
- **TTS limitations** : Limites API et quotas

### **Performance Critiques**

- **Transcription streaming** : Affichage progressif
- **Audio loading** : Préchargement et cache
- **Real-time sync** : Debouncing des mises à jour
- **Zoho API** : Rate limiting et pagination
- **Large files** : Upload chunking

### **Sécurité et Conformité**

- **RGPD** : Anonymisation données audio
- **OAuth Zoho** : Gestion tokens sécurisée
- **Sessions** : Timeout automatique
- **Data retention** : Politique de rétention audio
- **Access control** : Permissions par entreprise

## 🔄 **Intégrations Externes**

### **APIs Tierces**

```typescript
// Zoho WorkDrive
- OAuth 2.0 flow complet
- Upload/Download fichiers
- Gestion dossiers entreprise
- Webhooks synchronisation

// Services IA
- Transcription speech-to-text
- Text-to-Speech avec voix personnalisées
- Amélioration texte par IA
- Analyse sentiments (probable)

// Supabase Real-time
- WebSocket subscriptions
- Row Level Security (RLS)
- Storage fichiers audio
- Database triggers
```

### **Webhooks et Events**

- **Zoho callbacks** : Synchronisation fichiers
- **Supabase triggers** : Notifications temps réel
- **Audio processing** : Events transcription
- **Email automation** : Envoi formations

## 📋 **Conventions et Standards**

### **Naming Conventions**

```typescript
// Composants
PascalCase: EvaluationCard, FourZoneNode
Suffixes: ...Modal, ...Dialog, ...Panel, ...Form

// Hooks
camelCase: useRealtimeEvaluationSync
Prefixes: use...

// Types
PascalCase: EvaluationSession, QualityGrid
Suffixes: ...Types, ...Data, ...Config

// Utils
camelCase: audioUploadUtils, generateFinalText
```

### **Architecture Patterns**

- **Compound Components** : ActivitySidebar avec sous-composants
- **Custom Hooks** : Logique métier isolée
- **Service Layer** : Séparation API/UI
- **Type-first** : Types définis avant implémentation

## 🎓 **Domaine Métier - Formation & Évaluation**

### **Vocabulaire Spécialisé**

- **Conseiller** : Agent évalué
- **Coach** : Évaluateur/Formateur
- **Spectateur** : Observateur session
- **Pratique** : Compétence évaluée
- **Sujet** : Thème d'évaluation
- **Pondération** : Poids dans notation finale
- **Grille qualité** : Référentiel évaluation

### **Métriques et KPIs**

- **Score global** : Note finale pondérée
- **Progression** : Évolution dans le temps
- **Zones faibles** : Axes d'amélioration
- **Conformité** : Respect grille qualité

## 📄 Notes pour Claude

### Contexte Technique Réel

Cette plateforme est un **système d'évaluation et de formation avancé** pour centres d'appels avec :

- **IA intégrée** : Transcription, TTS, amélioration de texte
- **Méthodologie Four Zones** : Approche structurée d'évaluation
- **Collaboration temps réel** : Sessions partagées multi-utilisateurs
- **Intégration enterprise** : Zoho WorkDrive, Supabase
- **Administration complète** : Gestion entreprises, grilles, pondération

### Patterns Architecturaux Utilisés

- **Module-first architecture** : Chaque fonctionnalité = module complet
- **Hook-driven logic** : Logique métier dans hooks personnalisés
- **Real-time first** : Collaboration temps réel partout
- **Type-safe** : TypeScript strict sur toute l'application
- **Service layer** : Séparation claire API/UI/logique métier

### Questions Fréquentes pour Assistance

#### **🎯 Évaluation et Four Zones**

```typescript
// Comment fonctionne la méthodologie Four Zones ?
1. Upload audio → 2. Transcription IA → 3. Analyse par zones →
4. Post-its collaboratifs → 5. Synthèse finale

// Où se trouve la logique des zones ?
app/evaluation/components/FourZones/
app/whiteboard/components/CoachingFourZone/
```

#### **🔄 Temps Réel et Sessions**

```typescript
// Comment fonctionnent les sessions partagées ?
useRealtimeEvaluationSharing() // Hook principal
api/evaluation-sharing/* // APIs backend
Supabase WebSocket subscriptions // Infrastructure

// Synchronisation timeline audio
useSpectatorTranscriptions() // Sync transcriptions
update-position API // Position partagée
```

#### **🤖 IA et Transcription**

```typescript
// Pipeline de transcription
api/transcribe → api/transcription/get →
Affichage temps réel → Amélioration IA (api/ai/improve)

// Text-to-Speech
api/tts → useTTS() hook → Contrôles prosodiques
```

#### **☁️ Intégration Zoho**

```typescript
// OAuth Flow
api/zoho/auth → api/zoho/callback →
Stockage tokens → api/zoho/workdrive

// Upload/Download
WorkDriveUtils.tsx // Utilitaires
audioUploadUtils.tsx // Traitement audio
```

#### **👥 Administration Multi-Niveaux**

```typescript
// Hiérarchie
Entreprises → Grilles qualité → Catégories →
Sujets → Pondération → Conseillers

// Interface admin
app/evaluation/admin/ // Module complet
adminDataService.tsx // CRUD données
```

### Debugging et Troubleshooting

#### **🚨 Erreurs Communes**

```typescript
// Session temps réel perdue
→ Vérifier useRealtimeEvaluationSharing()
→ Contrôler connexion Supabase WebSocket

// Transcription échoue
→ Vérifier api/transcribe
→ Contrôler format/taille fichier audio

// Upload Zoho fail
→ Vérifier tokens OAuth (api/zoho/auth)
→ Contrôler permissions WorkDrive

// TTS ne fonctionne pas
→ Vérifier api/tts
→ Contrôler quotas API externes
```

#### **🔍 Logs et Monitoring**

```typescript
// Fichiers de logs
erreurs_groupees.txt // Erreurs centralisées
console.log dans hooks // Debug temps réel
Supabase dashboard // Monitoring real-time

// Points de contrôle
- Position timeline partagée
- État sessions actives
- Cache Zoho tokens
- Queue transcription
```

### Recommandations Développement

#### **🏗️ Ajout Nouvelles Fonctionnalités**

1. **Identifier le module** : Évaluation/Whiteboard/Zoho
2. **Créer hook spécialisé** : useNewFeature()
3. **Ajouter API route** : app/api/new-feature/
4. **Types TypeScript** : Définir interfaces
5. **Composants** : Suivre pattern existant
6. **Tests temps réel** : Vérifier sync multi-users

#### **🎨 UI/UX Patterns**

```typescript
// Structure composants
Feature/
├── index.tsx          // Point d'entrée
├── components/        // Sous-composants
├── hooks/            // Logique métier
├── types/            // Types TypeScript
└── utils/            // Utilitaires

// Hooks pattern
const useFeature = () => {
  const [state, setState] = useState()
  const actions = useMemo(() => ({ ... }), [])
  return { state, actions, loading, error }
}
```

#### **🔒 Sécurité et Permissions**

- **Row Level Security** Supabase par entreprise
- **OAuth tokens** stockage sécurisé
- **Anonymisation** données sensibles
- **Timeout sessions** évaluation
- **Validation** inputs utilisateur

### Ressources et Documentation

#### **📚 Docs Internes**

```
app/whiteboard/README*.MD // Documentation phases
app/evaluation/admin/README.md // Guide admin
SUPABASE.MD // Configuration base de données
```

#### **🔗 APIs Externes**

- **Zoho WorkDrive API** : Gestion fichiers
- **Services transcription** : Speech-to-text
- **APIs TTS** : Text-to-speech
- **Supabase Real-time** : WebSocket sync
