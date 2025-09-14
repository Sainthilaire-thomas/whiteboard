# Description du Module Evaluation

## Vue d'ensemble

Le module **Evaluation** est le cœur du système d'évaluation qualité des appels. Il permet d'analyser, annoter et évaluer les conversations téléphoniques selon des grilles qualité prédéfinies. Ce module suit un workflow structuré en plusieurs phases pour transformer un appel audio brut en évaluation complète avec recommandations d'amélioration.

## Architecture modulaire

### 🎯 Composant principal : `Evaluation.tsx`

- **Interface unifiée** centralisant tous les sous-modules
- **Gestion d'état centralisée** pour la navigation entre vues
- **Système de panneaux** adaptatif (transcription + contexte)
- **Modes d'affichage** : normal, plein écran transcription, plein écran contexte

### 🏗️ Structure modulaire

```
evaluation/
├── admin/               # Module d'administration des grilles
├── components/          # Composants du workflow d'évaluation
│   ├── EntrainementSuivi/   # Phase 4 - Formation
│   ├── FourZones/           # Phase 3 - Coaching
│   ├── Postit/              # Phase 2 - Annotation
│   ├── SyntheseEvaluation/  # Phase 5 - Synthèse
│   └── UnifiedHeader/       # Navigation unifiée
```

## Workflow d'évaluation en 5 phases

### Phase 1 : Sélection (SelectionEntrepriseEtAppel)

- **Sélection entreprise** et appel à évaluer
- **Chargement transcription** automatique
- **Validation grille qualité** associée

### Phase 2 : Annotation (Postit)

- **Système de post-its** sur la transcription
- **Association sujets/pratiques** selon la grille qualité
- **Navigation par étapes** : contexte → sujet → pratique → synthèse
- **Validation automatique** de la complétude

### Phase 3 : Coaching (FourZones)

- **Méthode 4 zones** pour le coaching :
  - "Vous avez fait" (points positifs)
  - "Je fais" (démonstration)
  - "L'entreprise fait" (ressources)
  - "Vous ferez" (plan d'action)
- **Studio TTS** pour générer des audio de formation
- **Édition collaborative** en temps réel

### Phase 4 : Formation (EntrainementSuivi)

- **Génération nudges** personnalisés
- **Planification formation** sur mesure
- **Suivi progression** avec indicateurs
- **Ressources pédagogiques** (fiches coach/conseiller)

### Phase 5 : Synthèse (SyntheseEvaluation)

- **Dashboard complet** de l'évaluation
- **Statistiques visuelles** (graphiques, métriques)
- **Rapports exportables** pour le management
- **Critères qualité** avec scoring automatique

## Fonctionnalités transversales

### 🎧 Gestion Audio

- **Lecteur audio intégré** avec timeline interactive
- **Synchronisation transcription** mot par mot
- **Marqueurs temporels** pour navigation rapide
- **TTS (Text-to-Speech)** pour formation audio

### 📝 Transcription intelligente

- **Affichage par mots** ou par paragraphes
- **Identification locuteurs** (client/conseiller)
- **Sélection de texte** pour annotation
- **Recherche et navigation** dans le contenu

### 🤝 Collaboration temps réel

- **Sessions partagées** pour évaluation collaborative
- **Synchronisation position** audio entre participants
- **Mode spectateur** pour observation
- **Anonymisation** configurable

### 🎨 Interface adaptive

- **Header unifié** avec navigation contextuelle
- **Panneaux redimensionnables** selon le contexte
- **Modes sombre/clair** avec persistance
- **Responsive design** pour tous écrans

## Module d'administration

### 🏢 Gestion Entreprises

- **CRUD complet** des entreprises clientes
- **Association grilles qualité** par entreprise
- **Configuration domaines** internet

### 📊 Grilles Qualité

- **Création grilles** personnalisées ou templates
- **Gestion catégories** avec codes couleur
- **Pondération critères** (conforme/non-conforme)
- **Association entreprises** multiples

### 🔄 Traducteur Sujets-Pratiques

- **Mapping intelligent** sujets ↔ pratiques
- **Niveaux d'importance** configurables
- **Interface graphique** intuitive
- **Validation cohérence** automatique

## Types et interfaces

### Types principaux

typescript

```typescript
// Appel avec métadonnées
interfaceCall{
  audiourl:string|null;
  callid:number;
  filename:string;
  description?:string;
  callactivityrelation:CallActivityRelation[];
}

// Post-it d'évaluation
interfacePostit{
  id:number;
  callid:number;
  wordid:number;
  text:string;
  sujet:string;
  pratique:string;
  timestamp:number;
}

// Statistiques d'évaluation
interfaceEvaluationStats{
  totalPostits:number;
  uniqueSujets:number;
  uniquePratiques:number;
}
```

### Architecture état

- **State centralisé** avec reducers spécialisés
- **Hooks personnalisés** pour chaque fonctionnalité
- **Context providers** pour partage données
- **Memoization optimisée** pour performance

## Intégrations

### 🗃️ Base de données (Supabase)

- **Tables relationnelles** optimisées
- **RLS (Row Level Security)** par entreprise
- **Triggers automatiques** pour cohérence
- **Réplication temps réel** pour collaboration

### 🎤 Services externes

- **Transcription audio** (API dédiée)
- **Text-to-Speech** (OpenAI/Azure)
- **Stockage fichiers** (Supabase Storage)
- **Authentification** (Auth0/Supabase Auth)

## Performance et optimisations

### ⚡ Optimisations techniques

- **Lazy loading** des composants lourds
- **Virtualisation** des listes longues
- **Cache intelligent** des transcriptions
- **Debouncing** des sauvegardes automatiques

### 📈 Métriques et monitoring

- **Analytics usage** par fonctionnalité
- **Performance tracking** temps réponse
- **Error boundary** avec reporting
- **Health checks** services externes

---

_Ce module représente le cœur métier de la plateforme, alliant analyse qualité, formation personnalisée et collaboration en temps réel pour améliorer continuellement les performances des conseillers._
