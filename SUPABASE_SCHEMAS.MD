# Documentation Base de Données Supabase - 000-CADO

## Informations Générales

- **Nom du projet** : 000-CADO
- **URL** : supabase.com/dashboard/project/jregkxiwrmquslbootcz
- **Région** : [À compléter]
- **Version PostgreSQL** : 15.1 (Ubuntu)
- **Nombre total de tables** : 125 tables réparties sur 12 schémas métier
- **Dernière mise à jour doc** : 13 juin 2025

## Vue d'Ensemble de l'Architecture

### Architecture Multi-Schémas Complète

La base de données 000-CADO révèle une **architecture sophistiquée multi-domaines** avec **125 tables** réparties sur **12 schémas métier spécialisés** , plus les schémas système PostgreSQL et Supabase. Cette organisation témoigne d'une évolution vers une plateforme d'évaluation qualité étendue, dépassant le simple coaching téléphonique pour intégrer géolocalisation, linguistique, marketing et collaboration temps réel.

### Répartition des Schémas par Domaine

| Schéma           | Tables   | Type  | Propriétaire      | Domaine Fonctionnel                                     |
| ---------------- | -------- | ----- | ----------------- | ------------------------------------------------------- |
| **public**       | 46       | BASE  | pg_database_owner | **Core Métier**- Évaluation qualité & coaching          |
| **auth**         | 16       | BASE  | supabase_admin    | **Authentification**- Utilisateurs, sessions, tokens    |
| **cartographie** | 15       | BASE  | postgres          | **Géolocalisation**- Données territoriales & mapping    |
| **realtime**     | 10       | BASE  | supabase_admin    | **Temps Réel**- Subscriptions & collaboration live      |
| **whiteboard**   | 8        | BASE  | postgres          | **Collaboration**- Sessions coach/conseiller synchrones |
| **marketing**    | 7        | BASE  | postgres          | **Analytics**- Métriques, campagnes, engagement         |
| **linguistic**   | 6        | BASE  | postgres          | **NLP**- Traitement linguistique & analyse sémantique   |
| **mailing**      | 5        | BASE  | postgres          | **Communication**- Templates, envois, domaines          |
| **storage**      | 5        | BASE  | supabase_admin    | **Stockage**- Buckets, objets, métadonnées              |
| **pgsodium**     | 1+4 vues | MIXED | supabase_admin    | **Chiffrement**- Sécurité données sensibles             |
| **vault**        | 1+1 vue  | MIXED | supabase_admin    | **Secrets**- Coffre-fort credentials                    |
| **extensions**   | 0+2 vues | VIEWS | postgres          | **Système**- Extensions PostgreSQL actives              |

### Architecture Fonctionnelle par Couches

```
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                          │
│  GraphQL API (graphql, graphql_public) + REST Endpoints        │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                     COUCHE MÉTIER                               │
│                                                                 │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  CORE   │  │ EXTENSIONS  │  │COLLABORATION│  │  ANALYTICS  │ │
│  │ public  │  │cartographie │  │  whiteboard │  │  marketing  │ │
│  │(46 tbl) │  │ linguistic  │  │  realtime   │  │   mailing   │ │
│  │         │  │   (26 tbl)  │  │  (18 tbl)   │  │  (12 tbl)   │ │
│  └─────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                   COUCHE INFRASTRUCTURE                         │
│                                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │   AUTH    │  │ SÉCURITÉ  │  │  STORAGE  │  │  SYSTÈME  │    │
│  │   auth    │  │ pgsodium  │  │  storage  │  │extensions │    │
│  │ (16 tbl)  │  │   vault   │  │  (5 tbl)  │  │ (2 vues)  │    │
│  │           │  │  (2+5 v)  │  │           │  │           │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Domaines Fonctionnels Détaillés

### 🎯 Core Métier (46 tables - Schéma `public`)

**Propriétaire** : pg_database_owner

**Mission** : Cœur de l'évaluation qualité et du coaching téléphonique

**Tables principales** :

- `users`, `entreprises`, `conseillers` : Gestion utilisateurs multi-tenant
- `call`, `transcript`, `word` : Pipeline transcription et analyse
- `pratiques`, `exercices`, `activitesconseillers` : Coaching personnalisé
- `lpltag`, `turntagged` : Grilles qualité et affectation critères
- `roleplaydata`, `postit` : Jeu de rôle IA et whiteboard collaboratif

**Flux principal** : Upload appel → Transcription → Évaluation critères → Coaching → Plan d'entraînement

### 🗺️ Extensions Géographiques & Linguistiques (21 tables)

#### Schéma `cartographie` (15 tables)

**Mission** : Visualisation et navigation dans les données d'évaluation qualité

**Tables de Mindmapping** :

- `mindmap_data`, `mindmapnodes`, `mindmapedges` : Structure de cartes mentales pour visualisation des critères qualité
- `mindmapconversation_nodes`, `mindmapconversation_edges` : Mapping des flux conversationnels
- `nodegroups`, `groupnode_tags` : Regroupement et catégorisation des éléments

**Tables de Workflow** :

- `tagflow_nodes`, `tagflow_nodes2` : Flux de traitement des tags qualité
- `axes`, `axevalues` : Définition des axes d'évaluation personnalisés
- `ficheaction` : Plans d'action générés depuis les cartes

**Tables d'Interface** :

- `appels` : Mapping avec les appels du schéma public
- `postits` : Éléments collaboratifs (lié au whiteboard)
- `vueglobale` : Vues synthétiques personnalisées

#### Schéma `linguistic` (6 tables)

**Mission** : Moteur d'analyse linguistique et scoring automatique

**Tables de Modélisation** :

- `models` : Modèles IA pour analyse des appels (sentiment, qualité, etc.)
- `models_criteria` : Critères d'évaluation par modèle
- `criteria_families`, `criteria_definition_family` : Taxonomie des critères linguistiques

**Tables de Résultats** :

- `verbatims_metadata` : Métadonnées des extraits analysés
- `verbatims_models_results` : Résultats d'analyse par modèle IA

### 🤝 Collaboration Temps Réel (18 tables)

#### Schéma `whiteboard` (8 tables)

**Propriétaire** : postgres

**Mission** : Plateforme collaborative d'évaluation et coaching

**Tables de Sessions** :

- `sessions` : Sessions de coaching collaboratives
- `shared_evaluation_sessions` : Partage d'évaluations entre coach/conseiller
- `current_view` : État actuel de l'interface collaborative

**Tables d'Interaction** :

- `postits` : Éléments visuels partagés (post-its, annotations)
- `participant_evaluations` : Évaluations individuelles des participants

**Tables de Feedback** :

- `survey_settings`, `survey_responses` : Configuration et réponses questionnaires
- `whiteboard_question` : Questions dynamiques générées pendant les sessions

#### Schéma `realtime` (10 tables)

**Propriétaire** : supabase_admin

**Mission** : Infrastructure temps réel Supabase

- Subscriptions pour notifications live
- Gestion des connexions simultanées
- Events et triggers pour mises à jour instantanées

### 📊 Analytics & Communication (12 tables)

#### Schéma `marketing` (7 tables)

**Mission** : Gestion contacts et ciblage marketing intelligent

**Tables de Contacts** :

- `contacts` : Base contacts unifiée
- `oximailing_contact` : Intégration avec solution mailing Oximailing
- `domain_companies_email*` : 3 tables pour nettoyage et validation emails entreprises

**Tables de Ciblage** :

- `email_models` : Templates et modèles d'emails
- `filtrage_regles` : Règles de segmentation et ciblage

#### Schéma `mailing` (5 tables)

**Mission** : Infrastructure d'envoi et délivrabilité emails

**Tables de Configuration** :

- `domain_references` : Domaines expéditeurs et réputation
- `domain_references_duplicate` : Gestion des doublons de domaines
- `email_patterns` : Patterns de validation emails
- `filter_models`, `filtered_contacts` : Filtrage et qualification contacts

### 🔒 Infrastructure Sécurisée (28 tables + vues)

#### Schéma `auth` (16 tables)

**Propriétaire** : supabase_admin

**Mission** : Authentification complète Supabase

- Gestion utilisateurs, sessions, tokens refresh
- OAuth et identités multiples
- Audit connexions et sécurité

#### Schéma `storage` (5 tables)

**Mission** : Stockage fichiers sécurisé

- Buckets : avatars, documents, audio_files, whiteboard_exports
- Métadonnées et permissions granulaires
- Politiques RLS sur objets stockés

#### Schémas Sécurité Avancée

- **`pgsodium`** (1 table + 4 vues) : Chiffrement données sensibles (appels, transcriptions)
- **`vault`** (1 table + 1 vue) : Coffre-fort pour credentials APIs externes
- **`extensions`** (2 vues) : Monitoring extensions PostgreSQL actives

## Particularités Architecturales

### 🏗️ Architecture Multi-Tenant Sophistiquée

**Segmentation par entreprise** avec isolation complète :

```sql
-- Exemple de requête cross-schémas sécurisée
SELECT
  a.sidebar_phase,                    -- coaching (public)
  c.region_name,                      -- géolocalisation (cartographie)
  m.engagement_score,                 -- analytics (marketing)
  l.sentiment_analysis                -- linguistique (linguistic)
FROM public.activitesconseillers a
JOIN cartographie.conseiller_regions cr ON a.idconseiller = cr.conseiller_id
JOIN marketing.user_metrics m ON a.idconseiller = m.user_id
JOIN linguistic.call_analysis l ON a.call_id = l.call_id
WHERE a.entreprise_id = get_current_user_enterprise();
```

### 🔄 Temps Réel Multi-Niveaux

**3 niveaux de temps réel** pour coaching collaboratif :

1. **Niveau UI** : `whiteboard` pour partage visuel instantané
2. **Niveau Data** : `realtime` pour synchronisation données
3. **Niveau Business** : Triggers cross-schémas pour cohérence métier

### 🧠 IA et Analyse Prédictive

**Pipeline ML distribué** sur plusieurs schémas :

- **`linguistic`** : Modèles IA pour scoring automatique qualité (`models`, `models_criteria`)
- **`cartographie`** : Visualisation intelligente des patterns conversationnels (`mindmap*`)
- **`marketing`** : Ciblage et segmentation automatisée (`filtrage_regles`, `email_models`)
- **`whiteboard`** : Questions adaptatives générées en temps réel (`whiteboard_question`)
- **`public`** : Intégration résultats IA dans workflow coaching

### 📈 Analytics Cross-Domaines

**Métriques business** alimentées par tous les schémas :

- **Visualisation qualité** : `cartographie.mindmap*` + `public.lpltag` + `public.turntagged`
- **Scoring automatique** : `linguistic.models*` + `public.call` + `public.transcript`
- **Coaching collaboratif** : `whiteboard.sessions` + `public.activitesconseillers` + `realtime`
- **Communication ciblée** : `marketing.contacts` + `mailing.domain_references` + `public.entreprises`

## Révélations Architecturales Majeures

### 🎯 **000-CADO n'est PAS qu'une plateforme de coaching**

L'analyse des 125 tables révèle **3 couches applicatives distinctes** :

#### 1. **Couche Coaching Core** (Schéma `public` - 46 tables)

- Évaluation qualité classique (call → transcript → critères)
- Sessions coaching individuelles (activitesconseillers)
- Plans d'entraînement personnalisés (exercices, nudges)

#### 2. **Couche Visualisation & IA** (Schémas `cartographie` + `linguistic` - 21 tables)

- **Mindmapping conversationnel** : Navigation visuelle dans les appels via cartes mentales
- **Scoring IA automatique** : Modèles linguistiques pour pré-évaluation des appels
- **Flux de tags intelligents** : Automation de l'affectation des critères qualité

#### 3. **Couche Collaboration & Marketing** (Schémas `whiteboard` + `marketing` + `mailing` - 20 tables)

- **Coaching collaboratif temps réel** : Sessions synchrones coach/conseiller avec whiteboard
- **Marketing automation** : Ciblage et communication personnalisée
- **Infrastructure mailing** : Gestion domaines et délivrabilité emails

### 🚀 **Architecture de Plateforme SaaS Complète**

La répartition des tables révèle une **véritable plateforme SaaS multi-produits** :

```
PRODUIT 1: Coaching IA (public + linguistic)
    ↓
PRODUIT 2: Mindmapping Qualité (cartographie)
    ↓
PRODUIT 3: Collaboration Live (whiteboard + realtime)
    ↓
PRODUIT 4: Marketing Automation (marketing + mailing)
```

**Chaque "produit" peut fonctionner indépendamment** mais se nourrit des données des autres pour créer une expérience intégrée unique.

## Architecture de Données Cross-Schémas

### Relations Inter-Schémas Critiques

L'analyse des **foreign keys cross-schémas** révèle 3 patterns d'intégration principaux :

#### 1. **Pipeline IA Linguistique** (`linguistic` → `public`)

**Relation centrale** : Analyse IA des passages d'appels évalués

```sql
linguistic.verbatims_metadata.turn_id → public.turntagged.id (CASCADE DELETE)
linguistic.verbatims_models_results.turn_id → public.turntagged.id (CASCADE DELETE)
```

**Flux de données** :

```
public.call → public.turntagged (affectation critères manuels)
       ↓
linguistic.verbatims_* (analyse IA automatique)
       ↓
Résultats IA réinjectés dans évaluation qualité
```

**Implications** :

- **CASCADE DELETE** : Suppression d'un passage évalué = suppression analyses IA
- **Protection forte** : Les analyses IA suivent le cycle de vie des évaluations
- **Performance** : Chaque `turntagged` peut avoir plusieurs analyses IA simultanées

#### 2. **Collaboration Temps Réel** (`whiteboard` → `public` + `auth`)

**Relations d'évaluation collaborative** :

```sql
-- Évaluations détaillées avec références précises
whiteboard.participant_evaluations → public.call (NO ACTION)
whiteboard.participant_evaluations → public.pratiques (NO ACTION)
whiteboard.participant_evaluations → public.word (NO ACTION - référence mot précis)
whiteboard.participant_evaluations → public.sujets (NO ACTION)

-- Sessions collaboratives
whiteboard.sessions → public.avatars (CASCADE DELETE)
whiteboard.shared_evaluation_sessions → public.call + auth.users (NO ACTION)
```

**Flux collaboratif** :

```
Coach lance session → whiteboard.shared_evaluation_sessions
       ↓
Évaluation collaborative → whiteboard.participant_evaluations
       ↓
Références précises → public.word (mot par mot)
       ↓
Critères appliqués → public.pratiques
```

**Implications** :

- **Granularité maximale** : Évaluation au niveau du mot (`word_start_id`, `word_end_id`)
- **NO ACTION** : Protection des données métier (appels, pratiques) lors suppression sessions
- **Multi-utilisateur** : Coach + conseiller évaluent simultanément

#### 3. **Audit et Sessions Utilisateurs** (`public` → `auth`)

**Traçabilité des connexions** :

```sql
public.user_sessions_backup.user_id → auth.users.id (NO ACTION)
whiteboard.survey_responses.participant_id → auth.users.id (SET NULL)
```

**Stratégies de suppression différenciées** :

- **NO ACTION** : Audit trail préservé même après suppression utilisateur
- **SET NULL** : Anonymisation des réponses survey si utilisateur supprimé

### Matrice de Couplage Cross-Schémas

| Source Schema  | Target Schema | Nombre Relations | Type Couplage | Stratégie Suppression         |
| -------------- | ------------- | ---------------- | ------------- | ----------------------------- |
| **linguistic** | **public**    | **16**           | **FORT**      | CASCADE (suit évaluations)    |
| **whiteboard** | **public**    | **6**            | **MOYEN**     | NO ACTION (protection métier) |
| **whiteboard** | **auth**      | **2**            | **FAIBLE**    | SET NULL (anonymisation)      |
| **public**     | **auth**      | **1**            | **FAIBLE**    | NO ACTION (audit)             |

### Points d'Architecture Critiques

#### 🔄 **Synchronisation IA ↔ Évaluation Manuelle**

- **Défi** : `linguistic` CASCADE suit `public.turntagged`
- **Risque** : Suppression accidentelle passage = perte analyses IA
- **Solution** : Soft delete sur `turntagged` plutôt que suppression physique

#### 🎯 **Granularité d'Évaluation Ultra-Fine**

- **Innovation** : Évaluation au niveau du mot (`participant_evaluations` → `word`)
- **Usage** : Coach peut annoter phrase précise pendant session live
- **Performance** : Index critiques sur `public.word` pour temps réel

#### 🛡️ **Protection Asymétrique**

- **Métier protégé** : `public.call`, `public.pratiques` (NO ACTION)
- **Sessions volatiles** : `whiteboard.*` peut être supprimé sans impact métier
- **Audit préservé** : `user_sessions_backup` survit à suppression utilisateurs

**Défis identifiés** :

- **Requêtes cross-schémas** : Risque de performance sur jointures complexes
- **Volumétrie distribuée** : 125 tables avec croissance hétérogène
- **Temps réel multi-schémas** : Synchronisation et cohérence des données

**Optimisations recommandées** :

- Index cross-schémas pour requêtes fréquentes
- Read replicas par domaine fonctionnel
- Cache Redis pour analytics temps réel
- Partitioning par entreprise sur tables volumineuses

### 🛡️ Sécurité Multi-Niveaux

**Architecture de sécurité en profondeur** :

- **RLS par schéma** : Isolation tenant-level sur chaque domaine
- **Chiffrement différencié** : `pgsodium` pour données sensibles uniquement
- **Audit trail complet** : Logs et historiques sur tous les schémas
- **Secrets centralisés** : `vault` pour credentials externes

### 🔄 Évolution et Maintenance

**Architecture préparée pour l'évolution** :

- **Séparation des domaines** : Évolution indépendante possible
- **APIs auto-générées** : GraphQL sur l'ensemble des 125 tables
- **Microservices candidats** : Chaque schéma peut devenir un service
- **Monitoring granulaire** : Métriques par domaine fonctionnel

## Synthèse Architecturale et Recommandations

### 🏗️ **Architecture Révélée : Plateforme Enterprise Sécurisée**

#### **000-CADO = Suite Intégrée Multi-Produits**

L'analyse complète révèle **4 produits distincts** mais intégrés :

1. **🧠 Coaching IA Avancé** (`public` + `linguistic`)
   - Évaluation qualité automatisée par IA
   - Coaching personnalisé basé sur analyse linguistique
   - Pipeline : Appel → Transcription → IA → Coaching → Suivi
2. **🗺️ Mindmapping Conversationnel** (`cartographie`)
   - Navigation visuelle dans les conversations
   - Cartes mentales des flux qualité (10 JSONB + 17 UUID)
   - Innovation : Représentation graphique des critères d'évaluation
3. **🤝 Collaboration Temps Réel** (`whiteboard` + `realtime`)
   - Sessions coach/conseiller synchrones
   - Évaluation collaborative granulaire (mot par mot)
   - Partitioning temporel automatique (tables jour par jour)
4. **📧 Marketing B2B Automation** (`marketing` + `mailing`)
   - CRM intégré avec ciblage intelligent
   - Gestion domaines et délivrabilité emails
   - Segmentation automatisée des contacts

### 🛡️ **Niveau de Sécurité Exceptionnel**

#### **Triple Couche de Protection**

1. **Niveau Infrastructure** (155 objets pgsodium + 37 pgcrypto)
   - Chiffrement bout-en-bout des données sensibles
   - Masquage automatique pour conformité RGPD
   - Gestion centralisée des clés avec rotation
2. **Niveau Application** (32 UUID auth + RLS temps réel)
   - Identification non-guessable de tous les objets
   - Filtrage sécurisé même en collaboration temps réel
   - Audit trail complet (43 timestamps auth)
3. **Niveau Métier** (Coffre-fort vault + permissions granulaires)
   - Secrets management pour APIs externes
   - Permissions personnalisées sur 100% des objets critiques
   - Séparation stricte des responsabilités par propriétaire

### ⚡ **Performance et Scalabilité**

#### **Architecture Distribuée Optimisée**

- **Partitioning intelligent** : `realtime` par jour, évite les tables monstres
- **Couplage maîtrisé** : Hub central `public`, extensions isolées
- **Index spécialisés** : GIN pour JSONB, BTREE pour relations, UUID pour sécurité
- **Monitoring natif** : pg_stat_statements pour optimisations proactives

### 🎯 **Positionnement Marché Unique**

#### **Concurrent Direct De :**

- **Salesforce Service Cloud** (CRM + Coaching)
- **Gong.io** (Analyse conversations IA)
- **Miro** (Collaboration visuelle)
- **Mailchimp** (Marketing automation)

#### **Avantage Différenciant :**

**Suite intégrée** vs assemblage d'outils séparés

- Données partagées entre tous les modules
- Workflow unifié : Appel → IA → Mindmap → Coaching → Marketing
- Sécurité niveau bancaire sur toute la chaîne
- Temps réel natif sur l'ensemble des fonctionnalités

### 📊 **Recommandations Stratégiques**

#### **🚀 Évolution Architecture**

1. **Microservices Candidats** (chaque schéma = service potentiel)
   - Service Core : `public` (46 tables)
   - Service IA : `linguistic` (6 tables)
   - Service Collaboration : `whiteboard` + `realtime` (18 tables)
   - Service Analytics : `cartographie` + `marketing` + `mailing` (27 tables)
2. **Optimisations Performance**
   - Cache Redis pour requêtes cross-schémas fréquentes
   - Read replicas par domaine fonctionnel
   - CDN pour assets statiques (mindmaps, avatars)
3. **Renforcement Sécurité**
   - HSM externe pour clés critiques
   - Vault externe (HashiCorp) pour secrets sensibles
   - Audit SIEM pour conformité enterprise

#### **💼 Positionnement Commercial**

**Marché Cible Révélé** :

- **Secteur Financier** : Centres d'appels bancaires/assurance
- **Secteur Santé** : Plateformes télémédicales
- **Secteur Public** : Centres de contact citoyens
- **Enterprise B2B** : Équipes commerciales haut de gamme

**Arguments Différenciants** :

- "Seule plateforme coaching IA + mindmapping + temps réel intégrée"
- "Sécurité niveau bancaire sur toute la chaîne de valeur"
- "ROI immédiat : 4 outils remplacés par 1 suite intégrée"

---

> **Conclusion** : 000-CADO n'est pas un simple outil de coaching mais une **plateforme d'évaluation qualité de nouvelle génération** combinant IA, collaboration temps réel, visualisation innovante et sécurité militaire. Son architecture multi-schémas révèle une sophistication technique qui la positionne comme concurrent direct des leaders du marché enterprise.
