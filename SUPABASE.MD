# Documentation Base de Données Supabase - 000-CADO

## Informations Générales

- **Nom du projet** : 000-CADO
- **URL** : supabase.com/dashboard/project/jregkxiwrmquslbootcz
- **Région** : [À compléter]
- **Version PostgreSQL** : 15.1 (Ubuntu)
- **Nombre de tables** : 46 tables (30 tables métier + 16 tables auth)
- **Dernière mise à jour doc** : 12 juin 2025

## Architecture des Tables

### Table `users`

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  instance_id UUID,
  email VARCHAR(255) UNIQUE NOT NULL,
  entreprise_id BIGINT REFERENCES entreprises(identreprise),
  aud VARCHAR(255),
  role VARCHAR(255),
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  -- Champs auth Supabase
  encrypted_password VARCHAR(255),
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  phone TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_anonymous BOOLEAN DEFAULT false
);
```

**Description** : Utilisateurs de la plateforme (coaches, administrateurs)
**Relations** :

- `entreprises` : Many-to-One (users.entreprise_id = entreprises.identreprise)
- `user_enterprises` : Many-to-Many avec entreprises
- `user_roles` : One-to-Many pour les rôles
- `quiz_responses` : One-to-Many pour les réponses quiz

### Table `entreprises`

```sql
CREATE TABLE entreprises (
  identreprise BIGINT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  nomentreprise TEXT,
  logo TEXT,
  domaine TEXT
);
```

**Description** : Entreprises clientes de la plateforme
**Relations** :

- `users` : One-to-Many (entreprises.identreprise = users.entreprise_id)
- `conseillers` : One-to-Many
- `entreprise_call` : Many-to-Many avec calls
- `entreprise_domaines` : Many-to-Many avec domaines
- `entreprise_pratiques` : Many-to-Many avec pratiques

### Table `conseillers`

```sql
CREATE TABLE conseillers (
  idconseiller INTEGER PRIMARY KEY,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  entreprise INTEGER REFERENCES entreprises(identreprise) ON DELETE CASCADE,
  pseudo TEXT,
  idavatar INTEGER REFERENCES avatars(idavatar),
  estanonyme BOOLEAN DEFAULT false
);
```

**Description** : Conseillers/coaches rattachés aux entreprises
**Relations** :

- `entreprises` : Many-to-One avec CASCADE DELETE
- `avatars` : Many-to-One pour l'avatar
- `activitesconseillers` : One-to-Many pour les activités
- `quiz_responses` : One-to-Many pour les réponses

### Table `call`

```sql
CREATE TABLE call (
  callid INTEGER PRIMARY KEY,
  audiourl TEXT,
  filename TEXT,
  filepath TEXT,
  transcription JSONB, -- Transcription automatique pour évaluation
  description TEXT,
  upload BOOLEAN DEFAULT false,
  archived BOOLEAN,
  is_tagging_call BOOLEAN DEFAULT false, -- Appel en cours d'évaluation
  origine TEXT,
  preparedfortranscript BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'non_supervisé', -- Statut évaluation qualité
  duree NUMERIC -- Calculé automatiquement par trigger
);
```

**Description** : Appels enregistrés soumis à évaluation qualité
**Relations** :

- `transcript` : One-to-Many pour transcriptions détaillées
- `entreprise_call` : Many-to-Many avec entreprises
- `callactivityrelation` : Many-to-Many avec sessions de coaching
- `turntagged` : One-to-Many pour affectation critères qualité
- `quiz` : One-to-Many pour quiz d'évaluation générés
- `roleplaydata` : One-to-Many pour sessions de jeu de rôle

**Triggers** :

- `trigger_update_duree` : Calcule automatiquement la durée depuis la transcription JSON

### Table `pratiques`

```sql
CREATE TABLE pratiques (
  idpratique INTEGER PRIMARY KEY,
  nompratique VARCHAR(255) NOT NULL, -- Compétence/technique de relation client
  description TEXT,
  valeurnumérique INTEGER DEFAULT 1, -- Pondération dans évaluation
  idcategoriepratique INTEGER REFERENCES categoriespratiques(idcategoriepratique),
  fiche_conseiller_json JSONB, -- Guide pour le conseiller
  fiche_coach_json JSONB, -- Guide pour le coach
  jeuderole JSONB, -- Scénarios de re-simulation des passages
  geste TEXT -- Action corrective recommandée
);
```

**Description** : Compétences/techniques évaluées dans les appels (écoute active, gestion objections, etc.)
**Relations** :

- `categoriespratiques` : Many-to-One pour catégorisation
- `exercices` : One-to-Many pour exercices correctifs
- `activitesconseillers` : Many-to-Many avec sessions de coaching
- `entreprise_pratiques` : Many-to-Many avec entreprises (grilles spécifiques)
- `sujetspratiques` : Many-to-Many avec sujets d'appels

### Table `exercices`

```sql
CREATE TABLE exercices (
  idexercice INTEGER PRIMARY KEY,
  idpratique INTEGER NOT NULL REFERENCES pratiques(idpratique),
  nomexercice VARCHAR(255) NOT NULL, -- Exercice correctif spécifique
  description TEXT,
  nudges JSONB -- Recommandations d'entraînement
);
```

**Description** : Exercices correctifs liés aux pratiques défaillantes identifiées
**Relations** :

- `pratiques` : Many-to-One (exercices.idpratique = pratiques.idpratique)
- `activitesconseillers` : Many-to-Many avec sessions de coaching
- `exercices_nudges` : Many-to-Many avec système de nudges
- `avisexercicesnudges` : One-to-Many pour évaluation efficacité

### Table `activitesconseillers`

```sql
CREATE TABLE activitesconseillers (
  idactivite INTEGER PRIMARY KEY,
  idconseiller INTEGER REFERENCES conseillers(idconseiller),
  idexercice INTEGER REFERENCES exercices(idexercice),
  idpratique INTEGER REFERENCES pratiques(idpratique), -- Pratique travaillée
  idsujet INTEGER REFERENCES sujets(idsujet), -- Contexte de l'appel
  sidebar_phase TEXT, -- Phase du coaching (évaluation, jeu de rôle, plan)
  sidebar_statut TEXT -- Statut de la session
  -- Autres colonnes de suivi
);
```

**Description** : Sessions de coaching individuelles avec suivi progression
**Relations** :

- `conseillers` : Many-to-One
- `exercices` : Many-to-One (exercice travaillé)
- `pratiques` : Many-to-One (compétence ciblée)
- `sujets` : Many-to-One (contexte métier)
- `callactivityrelation` : Many-to-Many avec appels évalués
- `avisexercicesnudges` : One-to-Many pour feedback
- `customnudges` : One-to-Many pour plan d'entraînement personnalisé

**Index spécialisés** :

- `idx_activitesconseillers_sidebar_conseiller` : (idconseiller, sidebar_phase)
- `idx_activitesconseillers_sidebar_phase` : (sidebar_phase) - pour filtres interface
- `idx_activitesconseillers_sidebar_statut` : (sidebar_statut) - pour suivi progression

## Relations et Contraintes

### Relations Principales

**Architecture en étoile autour des Activités :**

```
entreprises → conseillers → activitesconseillers ← exercices ← pratiques
     ↓              ↓              ↓                ↓         ↓
   users         avatars        calls           nudges    sujets
```

### Clés Étrangères Importantes

**Relations CASCADE (suppression en cascade) :**

- `conseillers.entreprise → entreprises.identreprise` (CASCADE DELETE/UPDATE)
- `transcript.callid → call.callid` (CASCADE DELETE)
- `turntagged.call_id → call.callid` (CASCADE DELETE)
- `word.transcriptid → transcript.transcriptid` (CASCADE DELETE)
- `roleplaydata.call_id → call.callid` (CASCADE DELETE)

**Relations NO ACTION (protection) :**

- `activitesconseillers.idconseiller → conseillers.idconseiller`
- `activitesconseillers.idexercice → exercices.idexercice`
- `exercices.idpratique → pratiques.idpratique`
- `users.entreprise_id → entreprises.identreprise`

### Contraintes CHECK

```sql
-- Contraintes NOT NULL automatiques
call: callid IS NOT NULL
conseillers: idconseiller IS NOT NULL, nom IS NOT NULL, prenom IS NOT NULL
entreprises: identreprise IS NOT NULL, created_at IS NOT NULL
users: id IS NOT NULL, email IS NOT NULL
```

## Row Level Security (RLS)

### Politiques actives

```sql
-- Users peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = user_id);

-- Users peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = user_id);
```

## Fonctions et Triggers

### Fonctions Métier

#### `update_duree()` - Calcul automatique durée des appels

```sql
CREATE OR REPLACE FUNCTION update_duree()
RETURNS TRIGGER AS $
BEGIN
  -- Calculer et arrondir la durée maximale à la seconde
  NEW.duree = (
    SELECT ROUND(MAX((word->>'endTime')::NUMERIC))
    FROM jsonb_array_elements(NEW.transcription->'words') AS word
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql;
```

**Trigger associé :**

```sql
CREATE TRIGGER trigger_update_duree
  BEFORE INSERT OR UPDATE ON call
  FOR EACH ROW EXECUTE FUNCTION update_duree();
```

#### `get_jwt_claims()` - Extraction des claims JWT

```sql
CREATE OR REPLACE FUNCTION get_jwt_claims()
RETURNS RECORD AS $
  SELECT
    current_setting('request.jwt.claim.role', true) AS jwt_role,
    current_setting('request.jwt.claim.email', true) AS jwt_email;
$ LANGUAGE sql;
```

#### `get_tag_families()` - Statistiques des familles de tags

```sql
CREATE OR REPLACE FUNCTION get_tag_families()
RETURNS RECORD AS $
  select
    family,
    count(label) as count
  from lpltag
  group by family;
$ LANGUAGE sql;
```

#### `get_tag_usage_data()` - Données d'usage des tags

```sql
CREATE OR REPLACE FUNCTION get_tag_usage_data()
RETURNS RECORD AS $
SELECT
    lpltag.label AS tag_label,
    lpltag.family AS tag_family,
    lpltag.color AS tag_color,
    call.filename AS call_filename,
    call.description AS call_description,
    call.origine AS call_origine
FROM lpltag
LEFT JOIN turntagged ON lpltag.label = turntagged.tag
LEFT JOIN call ON turntagged.call_id = call.callid
ORDER BY lpltag.label, call.filename;
$ LANGUAGE sql;
```

#### `log_user_logout()` - Logging des déconnexions

```sql
CREATE OR REPLACE FUNCTION log_user_logout()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO user_sessions (user_id, event_type)
  VALUES (OLD.id, 'logout');
  RETURN OLD;
END;
$ LANGUAGE plpgsql;
```

### Fonctions de Gestion de Domaines (Mailing)

- `bulk_import_domain_references()` : Import en masse des références de domaines
- `bulk_replace_domain_references()` : Remplacement complet des références
- `bulk_upsert_domain_references()` : Upsert des références avec conflit resolution
- `update_domain_reference()` : Mise à jour unitaire d'une référence

## Types de Données et Formats JSON

### Champs JSONB Principaux

#### `call.transcription` - Transcription avec timestamps

Structure pour affectation précise des critères :

```json
{
  "words": [
    {
      "word": "Bonjour",
      "startTime": 0.5,
      "endTime": 1.2,
      "confidence": 0.95,
      "speaker": "conseiller"
    }
  ],
  "segments": [
    {
      "start": 0.5,
      "end": 15.2,
      "text": "Bonjour, merci d'appeler notre service...",
      "speaker": "conseiller"
    }
  ],
  "metadata": {
    "duration": 120.5,
    "language": "fr",
    "speakers": ["conseiller", "client"]
  }
}
```

#### `pratiques.jeuderole` - Scénarios de Re-simulation

Configurations pour rejouer les passages problématiques :

```json
{
  "scenario": "Gestion objection prix",
  "context": "Client trouve le produit trop cher",
  "alternative_approaches": [
    "Argumentation valeur",
    "Comparaison concurrence",
    "Proposition alternative"
  ],
  "ai_prompts": [
    "Reformule cette phrase pour valoriser le ROI",
    "Propose 3 alternatives moins directes"
  ],
  "success_criteria": ["Objection traitée", "Client réceptif"]
}
```

#### `pratiques.fiche_conseiller_json` & `fiche_coach_json`

Guides différenciés selon le rôle :

```json
{
  "conseiller": {
    "definition": "L'écoute active consiste à...",
    "bonnes_pratiques": ["Reformuler", "Poser questions ouvertes"],
    "erreurs_frequentes": ["Couper la parole", "Réponse trop rapide"]
  },
  "coach": {
    "points_observation": ["Temps de silence", "Reformulations"],
    "questions_debrief": ["Comment vous êtes-vous senti ?"],
    "exercices_recommandes": [1, 3, 7]
  }
}
```

#### `exercices.nudges` - Recommandations d'Entraînement

Plans d'action personnalisés :

```json
{
  "frequency": "2x/jour pendant 3 jours",
  "reminders": [
    {
      "time": "09:00",
      "message": "Exercice écoute active : 5 min de pratique"
    }
  ],
  "micro_learning": [
    "Vidéo 2 min : Techniques de reformulation",
    "Quiz : Identifier les signaux client"
  ],
  "self_assessment": {
    "questions": ["Ai-je laissé le client finir ?"],
    "scale": "1-5"
  }
}
```

#### `users.raw_app_meta_data` & `raw_user_meta_data`

Métadonnées Supabase Auth standards

### Statuts et Énumérations

#### `call.status` - Statuts d'Évaluation

- `'non_supervisé'` (défaut) : Appel en attente d'évaluation
- `'en_cours'` : Évaluation en cours
- `'évalué'` : Évaluation terminée
- `'coaching_planifié'` : Session de coaching programmée
- `'terminé'` : Cycle complet évaluation → coaching → plan d'entraînement

#### `activitesconseillers.sidebar_phase` - Phases du Coaching

- `'évaluation'` : Analyse de l'appel et affectation critères
- `'jeu_de_role'` : Re-simulation des passages avec IA
- `'plan_entrainement'` : Définition exercices et nudges
- `'suivi'` : Monitoring progression sur plusieurs jours

#### `activitesconseillers.sidebar_statut` - Statuts de Session

- `'planifié'` : Session programmée
- `'en_cours'` : Session active (whiteboard temps réel)
- `'terminé'` : Session finalisée
- `'reporté'` : Session reportée

## Tables Spécialisées Évaluation Qualité

### Système d'Évaluation et Tagging

#### `lpltag` - Grille de Critères Qualité

Tags organisés par famille avec couleurs pour l'évaluation

```sql
SELECT family, count(label) as count
FROM lpltag GROUP BY family;
-- Familles possibles : "Écoute", "Argumentation", "Gestion objections", etc.
```

#### `turntagged` - Affectation Critères aux Passages

Association entre critères qualité et segments temporels des appels

- Relation : `turntagged.call_id → call.callid` (CASCADE DELETE)
- Relation : `turntagged.tag → lpltag.label` (SET NULL, CASCADE UPDATE)

#### `word` & `transcript` - Analyse Granulaire

Transcription mot par mot pour affectation précise des critères

- `word.transcriptid → transcript.transcriptid` (CASCADE DELETE)
- Permet l'affectation de critères à des phrases/mots spécifiques

### Système de Jeu de Rôle et Re-simulation

#### `roleplaydata` - Sessions de Jeu de Rôle

Données des sessions où conseiller/coach refont les passages problématiques

- Relation : `roleplaydata.call_id → call.callid` (CASCADE DELETE)
- Relation : `roleplaydata.postit_id → postit.id` (CASCADE DELETE)
- Stocke les tentatives de reformulation avec IA

#### `postit` - Whiteboard Collaboratif

Éléments partagés en temps réel lors des évaluations

- Support du whiteboard pour partage coach/conseiller
- Synchronisation temps réel des évaluations

### Système de Nudges et Plans d'Entraînement

#### `nudge` & `customnudges` - Recommandations Personnalisées

- `nudge` : Nudges standards par exercice
- `customnudges` : Plans d'entraînement personnalisés post-coaching
- Relation : `customnudges.idactivite → activitesconseillers.idactivite`
- Relation : `customnudges.idnudgeoriginal → nudge.id`

#### `avisexercicesnudges` - Évaluation Efficacité

Feedback sur l'efficacité des exercices et nudges

- Permet d'ajuster les recommandations selon résultats
- Relation : `avisexercicesnudges.idactivite → activitesconseillers.idactivite`

### Tables de Référence Métier

#### `sujets` & `domaines` - Contexte des Appels

Catégorisation des types d'appels pour évaluation contextuelle

- `sujets.iddomaine → domaines.iddomaine`
- `sujets.idcategoriesujet → categoriessujets.idcategoriesujet`

#### `ponderation_sujets` - Poids dans l'Évaluation

Pondération des sujets selon leur importance business

- Relation : `ponderation_sujets.idsujet → sujets.idsujet`

#### `quiz` & `quiz_responses` - Évaluation Continue

Quiz générés automatiquement à partir des appels évalués

- `quiz.callid → call.callid` : Quiz basé sur appel spécifique
- `quiz_responses.conseillerid → conseillers.idconseiller` : Réponses conseiller
- Permet mesure progression post-coaching

### Tables d'Audit et Historique

#### `tag_history` & `tag_modifications`

Historique des modifications de critères d'évaluation

- Traçabilité des changements de grilles qualité
- Audit des évaluations pour conformité

#### `user_sessions` & `logs`

Suivi des connexions et actions utilisateurs

- `user_sessions` : Sessions coach/conseiller
- `logs` : Actions système et business

## Storage et Buckets

### Buckets configurés

- **avatars** : Images de profil (2MB max, formats: jpg, png, webp)
- **documents** : Fichiers utilisateur (10MB max, formats: pdf, doc, txt)

### Politiques Storage

```sql
-- Bucket avatars : users peuvent upload leur avatar
CREATE POLICY "Avatar uploads" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
);
```

## API et Endpoints Particuliers

### Edge Functions déployées

- `send-email` : Envoi d'emails de notification
- `process-payment` : Traitement des paiements
- `generate-report` : Génération de rapports PDF

### API REST customisée

```sql
-- Vue exposée via API
CREATE VIEW api_public_posts AS
SELECT id, title, content, created_at, author_name
FROM posts
WHERE status = 'published';
```

## Authentification et Sécurité

### Schema Auth Supabase

Le projet utilise le système d'authentification standard Supabase avec 16 tables dans le schema `auth` :

**Tables principales :**

- `auth.users` : Utilisateurs authentifiés
- `auth.sessions` : Sessions actives
- `auth.refresh_tokens` : Tokens de rafraîchissement
- `auth.identities` : Identités liées (OAuth, etc.)

### Gestion des Rôles

- `user_roles` : Rôles personnalisés par utilisateur
- `users.role` : Rôle principal dans l'application

### Fonctions de Sécurité

```sql
-- Extraction des claims JWT pour autorisation
SELECT get_jwt_claims();
```

### Multi-tenant par Entreprise

- Les données sont segmentées par `entreprise_id`
- Relation `user_enterprises` permet multi-appartenance
- CASCADE DELETE sur `conseillers.entreprise` protège l'intégrité

## Migrations et Seed Data

### Scripts de migration importants

```sql
-- Migration v1.2 : Ajout colonne plan
ALTER TABLE users ADD COLUMN plan TEXT DEFAULT 'free';

-- Migration v1.3 : Index performance
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

### Données de test

```sql
-- Seed users de test
INSERT INTO users (email, full_name) VALUES
('test@example.com', 'Test User'),
('admin@example.com', 'Admin User');
```

## Architecture Applicative

### Contexte Métier

**000-CADO** est une plateforme d'évaluation qualité et de coaching pour centres d'appels qui propose :

- **Évaluation des appels** selon des grilles de critères qualité
- **Affectation de critères** à des passages spécifiques des appels
- **Coaching par jeu de rôle** pour refaire les passages problématiques
- **Tests IA de formulations** alternatives jusqu'à satisfaction
- **Plans d'entraînement** personnalisés post-coaching
- **Whiteboard collaboratif** pour partage d'évaluations en temps réel

### Flux de Données Principaux

#### 1. Évaluation Qualité des Appels

```
call (enregistrement) → transcription automatique
     ↓
transcript → word (analyse mot par mot)
     ↓
turntagged (affectation critères qualité à passages)
     ↓
lpltag (grille de critères organisée par famille)
```

#### 2. Coaching et Jeu de Rôle

```
passages problématiques identifiés → roleplaydata
     ↓
pratiques (compétences ciblées) → exercices
     ↓
jeuderole (scénarios de re-simulation)
     ↓
tests IA de formulations alternatives
```

#### 3. Plan d'Entraînement Post-Coaching

```
activitesconseillers (sessions de coaching)
     ↓
exercices → nudges (recommandations d'entraînement)
     ↓
customnudges (plan personnalisé conseiller)
     ↓
suivi progression sur plusieurs jours
```

#### 4. Collaboration Temps Réel (Whiteboard)

```
call évalué → partage whiteboard
     ↓
postit (éléments partagés en temps réel)
     ↓
roleplaydata (synchronisation coach/conseiller)
```

### Points d'Intégration

#### Évaluation Qualité des Appels

- Les appels sont transcrits automatiquement (`call.transcription`)
- Analyse mot par mot stockée dans `transcript` → `word`
- Affectation de critères qualité via `turntagged` → `lpltag`
- Trigger `update_duree()` calcule la durée depuis les timestamps de transcription

#### Jeu de Rôle et Re-simulation IA

- Passages problématiques identifiés → `roleplaydata`
- Tests de formulations alternatives avec IA
- Scénarios stockés dans `pratiques.jeuderole` (JSON)
- Synchronisation temps réel coach/conseiller via `postit`

#### Plans d'Entraînement Post-Coaching

- Session de coaching → `activitesconseillers`
- Exercices correctifs → `exercices` → `nudges`
- Plan personnalisé → `customnudges`
- Suivi progression sur plusieurs jours

#### Whiteboard Collaboratif Temps Réel

- Partage d'évaluations en cours via `postit`
- Synchronisation coach/conseiller pendant évaluation
- Support de l'interface whiteboard pour annotation collaborative

#### Grilles Qualité Configurables

- Critères organisés par famille dans `lpltag`
- Configuration spécifique par entreprise via `entreprise_pratiques`
- Pondération des sujets dans `ponderation_sujets`
- Historique modifications dans `tag_history`

#### Multi-entreprise avec Grilles Spécifiques

- Segmentation par `entreprise_id`
- Configuration domaines/pratiques par entreprise
- Conseillers rattachés avec CASCADE DELETE
- Grilles qualité adaptées au métier de chaque entreprise

## Index et Performance

### Index Principaux

**Tables Utilisateurs :**

- `users_pkey` : PRIMARY KEY (id)
- `users_email_key` : UNIQUE (email)

**Tables Entreprises/Conseillers :**

- `entreprise_pkey` : PRIMARY KEY (identreprise)
- `conseillers_pkey` : PRIMARY KEY (idconseiller)
- `conseillers_email_key` : UNIQUE (email)

**Tables Appels :**

- `call_pkey` : PRIMARY KEY (callid)

**Tables Pratiques/Exercices :**

- `pratiques_pkey` : PRIMARY KEY (idpratique)
- `exercices_pkey` : PRIMARY KEY (idexercice)

### Index de Performance Spécialisés

**Table `activitesconseillers` (optimisée pour les requêtes de sidebar) :**

```sql
-- Index composite pour filtrages par conseiller et phase
CREATE INDEX idx_activitesconseillers_sidebar_conseiller
ON activitesconseillers (idconseiller, sidebar_phase);

-- Index pour filtrage par phase
CREATE INDEX idx_activitesconseillers_sidebar_phase
ON activitesconseillers (sidebar_phase);

-- Index pour filtrage par statut
CREATE INDEX idx_activitesconseillers_sidebar_statut
ON activitesconseillers (sidebar_statut);
```

### Requêtes Fréquentes Optimisées

**1. Activités d'un conseiller par phase :**

```sql
-- Optimisée par idx_activitesconseillers_sidebar_conseiller
SELECT * FROM activitesconseillers
WHERE idconseiller = ? AND sidebar_phase = ?;
```

**2. Recherche d'utilisateur par email :**

```sql
-- Optimisée par users_email_key
SELECT * FROM users WHERE email = ?;
```

**3. Appels avec transcription :**

```sql
-- Utilise l'index JSON sur transcription
SELECT callid, duree FROM call
WHERE transcription IS NOT NULL;
```

## Points Techniques Importants

### Pipeline d'Évaluation Qualité

1. **Upload appel** → `call` avec `status='non_supervisé'`
2. **Transcription automatique** → `call.transcription` (JSON avec timestamps)
3. **Analyse granulaire** → `transcript` → `word` (mot par mot)
4. **Évaluation qualité** → `turntagged` (affectation critères à passages)
5. **Session coaching** → `activitesconseillers` avec `sidebar_phase='évaluation'`

### Workflow Jeu de Rôle IA

1. **Identification passages problématiques** → depuis `turntagged`
2. **Initialisation jeu de rôle** → `roleplaydata` avec `call_id`
3. **Tests formulations IA** → itérations jusqu'à satisfaction
4. **Validation coach/conseiller** → via whiteboard `postit`
5. **Passage phase suivante** → `sidebar_phase='plan_entrainement'`

### Système de Nudges Adaptatifs

- **Nudges standards** : `exercices` → `exercices_nudges` → `nudge`
- **Personnalisation** : `customnudges` basés sur `activitesconseillers`
- **Feedback loop** : `avisexercicesnudges` pour ajustement efficacité
- **Progression tracking** : suivi multi-jours via `sidebar_statut`

### Gestion des Séquences Auto-incrément

Tables avec clés primaires auto-incrémentées :

- `users_id_seq`, `call_callid_seq`, `conseillers_idconseiller_seq`
- `exercices_idexercice_seq`, `pratiques_idpratique_seq`
- `activitesconseillers_idactivite_seq` (sessions de coaching)

### Données JSON Complexes et Performance

- **Transcriptions** : Structure hiérarchique words/segments pour affectation précise
- **Scénarios IA** : Prompts et alternatives dans `pratiques.jeuderole`
- **Plans d'entraînement** : Nudges temporisés dans `exercices.nudges`
- **Index JSON** : Optimisation requêtes sur timestamps transcription

### Stratégies de Suppression et Intégrité

- **CASCADE DELETE** : `conseillers` → `entreprises` (protection données client)
- **CASCADE DELETE** : `calls` → `transcripts` → `words` → `roleplaydata`
- **NO ACTION** : Protection des `activitesconseillers` (historique coaching)
- **SET NULL** : Tags peuvent être supprimés sans casser évaluations

### Temps Réel et Collaboration

- **Whiteboard sync** : `postit` pour partage coach/conseiller temps réel
- **Session tracking** : `user_sessions` pour monitoring connexions simultanées
- **État interface** : `sidebar_phase`/`sidebar_statut` pour coordination UI
- **Notifications** : Système pour alerter coach/conseiller des changements d'état

## Extensions et Monitoring

### Extensions PostgreSQL Activées

- **pgcrypto** : Chiffrement des données sensibles (auth, tokens)
- **uuid-ossp** : Génération UUID pour `auth.users` et clés externes
- **pg_stat_statements** : Monitoring performances requêtes (important pour temps réel)
- **pg_trgm** : Recherche floue dans transcriptions (similarity matching)

### Tables de Monitoring et Audit

#### Performance et Usage

- `logs` : Logs applicatifs avec détails sessions de coaching
- `user_sessions` : Suivi connexions coach/conseiller avec durées
- `tag_history` : Historique modifications grilles qualité (traçabilité)
- `tag_modifications` : Audit des changements critères d'évaluation

#### Métriques Business

```sql
-- Requêtes utiles pour monitoring
-- Nombre d'appels évalués par période
SELECT DATE(created_at), COUNT(*)
FROM call WHERE status != 'non_supervisé'
GROUP BY DATE(created_at);

-- Efficacité des sessions de coaching
SELECT sidebar_statut, COUNT(*)
FROM activitesconseillers
GROUP BY sidebar_statut;

-- Usage des critères qualité
SELECT lpltag.family, COUNT(turntagged.tag) as usage
FROM lpltag
LEFT JOIN turntagged ON lpltag.label = turntagged.tag
GROUP BY lpltag.family;
```

## Sécurité et Conformité

### Row Level Security (RLS)

**Important** : Le système gère des données sensibles (appels clients), RLS probablement activé sur :

```sql
-- Exemple de politiques probables (à vérifier)
-- Conseillers ne voient que leurs propres appels
CREATE POLICY "conseiller_own_calls" ON call
FOR SELECT USING (
  callid IN (
    SELECT c.callid FROM call c
    JOIN entreprise_call ec ON c.callid = ec.callid
    JOIN conseillers co ON ec.identreprise = co.entreprise
    WHERE co.idconseiller = get_current_conseiller_id()
  )
);

-- Coaches voient les appels de leur entreprise
CREATE POLICY "coach_enterprise_calls" ON call
FOR SELECT USING (
  callid IN (
    SELECT c.callid FROM call c
    JOIN entreprise_call ec ON c.callid = ec.callid
    WHERE ec.identreprise = get_user_enterprise_id()
  )
);
```

### Données Sensibles et RGPD

- **Appels enregistrés** : Données personnelles clients dans `call.audiourl`
- **Transcriptions** : Conversations complètes dans `call.transcription`
- **Soft delete** : `users.deleted_at` pour conformité suppression
- **Anonymisation** : `conseillers.estanonyme` pour protection identité

## Recommandations d'Optimisation

### Performance Requêtes Critiques

#### 1. Dashboard Conseiller (temps réel)

```sql
-- Optimiser avec index composite existant
SELECT * FROM activitesconseillers
WHERE idconseiller = ? AND sidebar_phase = 'en_cours';
-- ✅ Utilise idx_activitesconseillers_sidebar_conseiller
```

#### 2. Recherche dans Transcriptions

```sql
-- Ajouter index GIN pour recherche full-text
CREATE INDEX IF NOT EXISTS idx_call_transcription_gin
ON call USING gin ((transcription->'segments'));

-- Recherche optimisée
SELECT callid, filename FROM call
WHERE transcription->'segments' @> '[{"text": "objection"}]';
```

#### 3. Statistiques Temps Réel

```sql
-- Index pour analytics dashboard
CREATE INDEX IF NOT EXISTS idx_call_status_created
ON call (status, created_at);

-- Requête optimisée
SELECT status, COUNT(*), AVG(duree)
FROM call
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY status;
```

### Volumétrie et Archivage

#### Points d'Attention Volumétrie

- **Table `call`** : Croissance rapide avec fichiers audio + transcriptions JSON
- **Table `word`** : Explosion volumétrique (chaque mot de chaque appel)
- **Table `turntagged`** : Croissance proportionnelle aux évaluations
- **Tables audit** : `logs`, `tag_history` peuvent devenir très volumineuses

#### Stratégies d'Archivage Recommandées

```sql
-- Archivage appels anciens (> 2 ans)
UPDATE call SET archived = true
WHERE created_at < CURRENT_DATE - INTERVAL '2 years';

-- Purge logs anciens (> 6 mois)
DELETE FROM logs
WHERE created_at < CURRENT_DATE - INTERVAL '6 months';

-- Compression transcriptions anciennes
-- Déplacer call.transcription vers storage externe après 1 an
```

## Évolutions et Roadmap

### Améliorations Techniques Suggérées

#### 1. Recherche et IA

- **Full-text search** : Index tsvector sur transcriptions pour recherche sémantique
- **Embedding vectors** : Pour matching intelligent passage ↔ critères qualité
- **Cache Redis** : Pour dashboard temps réel et suggestions IA

#### 2. Performance et Scale

- **Partitioning** : Table `call` par entreprise ou période
- **Read replicas** : Pour analytics sans impact sur coaching temps réel
- **CDN storage** : Fichiers audio sur S3/CloudFlare pour latence

#### 3. Fonctionnalités Métier

- **Scoring automatique** : IA pour pré-évaluation avant coaching humain
- **Recommandations adaptatives** : ML sur historique pour nudges personnalisés
- **Analytics prédictives** : Détection conseillers à risque avant dégradation

### Migration et Maintenance

#### Scripts de Migration Importants

```sql
-- Migration v2.0 : Ajout scoring automatique IA
ALTER TABLE call ADD COLUMN ai_score NUMERIC;
ALTER TABLE call ADD COLUMN ai_confidence NUMERIC;

-- Migration v2.1 : Optimisation performance temps réel
CREATE INDEX CONCURRENTLY idx_activitesconseillers_realtime
ON activitesconseillers (sidebar_phase, sidebar_statut, updated_at);

-- Migration v2.2 : Support multi-langues
ALTER TABLE call ADD COLUMN detected_language VARCHAR(5);
ALTER TABLE pratiques ADD COLUMN langue VARCHAR(5) DEFAULT 'fr';
```

#### Données de Test et Seed

```sql
-- Seed entreprises de test
INSERT INTO entreprises (nomentreprise, domaine) VALUES
('Demo Center', 'Télécoms'),
('Test Bank', 'Finance'),
('Sample Support', 'E-commerce');

-- Seed critères qualité standards
INSERT INTO lpltag (label, family, color) VALUES
('Écoute active', 'Communication', '#4CAF50'),
('Gestion objection', 'Argumentation', '#FF9800'),
('Closing efficace', 'Vente', '#2196F3');

-- Seed pratiques de base
INSERT INTO pratiques (nompratique, description) VALUES
('Ouverture d''appel', 'Première impression et mise en confiance'),
('Découverte besoins', 'Questionnement et reformulation'),
('Argumentation', 'Présentation adaptée des solutions');
```

---

## Notes de Développement

### Bonnes Pratiques Identifiées

- **Séparation données/métadonnées** : Transcriptions JSON + analyse granulaire séparée
- **Audit trail complet** : Historique modifications grilles qualité
- **Soft delete** : Protection données avec `deleted_at`
- **Multi-tenant sécurisé** : Segmentation stricte par entreprise
- **Performance temps réel** : Index spécialisés pour interface collaborative

### Architecture Scalable

- **Triggers automatiques** : Calcul durée sans intervention manuelle
- **JSON flexible** : Évolution critères qualité sans migration schema
- **Relations protégées** : CASCADE/NO ACTION selon criticité business
- **Fonctions métier** : Logique complexe côté base pour cohérence

### Intégrations Externes Probables

- **APIs transcription** : Speechmatics, Google Speech, Azure Cognitive
- **Storage audio** : S3, Google Cloud Storage pour fichiers volumineux
- **IA/ML** : OpenAI, Anthropic Claude pour reformulations et suggestions
- **Notifications** : SendGrid, Slack pour alertes coaching
- **Analytics** : Export vers Metabase, Looker pour reporting avancé\*\* : Contenu différencié conseiller/coach
- **Jeux de rôle** : Scénarios et configurations

### Stratégies de Suppression

- **CASCADE DELETE** : conseillers → entreprises, calls → transcripts
- **NO ACTION** : protection des activités et exercices
- **SET NULL** : tags peuvent être supprimés sans casser les associations

### Performance et Volumétrie

- Index spécialisés sur `activitesconseillers` pour l'interface sidebar
- Tables d'audit séparées (`logs`, `user_sessions`, `tag_history`)
- Soft delete avec `deleted_at` sur les utilisateurs

## Extensions et Monitoring

### Extensions PostgreSQL Probables

- **pgcrypto** : Pour les fonctions de hachage auth
- **uuid-ossp** : Génération UUID (auth.users)
- **pg_stat_statements** : Monitoring des requêtes

### Tables de Monitoring

- `logs` : Logs applicatifs
- `user_sessions` : Suivi des connexions/déconnexions
- `tag_history` & `tag_modifications` : Historique des changements de tags
