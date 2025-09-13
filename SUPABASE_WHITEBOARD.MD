# Documentation Schéma Whiteboard - 000-CADO

## Vue d'Ensemble

Le schéma `whiteboard` constitue le **système de collaboration temps réel** de 000-CADO avec **8 tables** orchestrant les sessions d'évaluation collaborative synchrone entre coaches et conseillers. Il permet l'évaluation granulaire (mot-par-mot), la synchronisation temps réel, et la collecte de feedback collaboratif.

### Statistiques Générales

- **8 tables** spécialisées collaboration temps réel
- **6 colonnes UUID** pour identifiants distribués
- **1 colonne JSONB** pour configuration flexible
- **3 relations intra-schéma** + 9 relations cross-schémas
- **4 séquences** pour auto-incrémentation
- **Propriétaire** : postgres (schéma métier custom)

## Architecture du Système Collaboratif

### 🎯 **Workflow de Collaboration Temps Réel**

```
Coach lance session → shared_evaluation_sessions (état partagé)
            ↓
Participants rejoignent → sessions (tracking participants)
            ↓
Évaluation collaborative → participant_evaluations (granularité mot-par-mot)
            ↓
Interface synchronisée → current_view (état interface partagé)
            ↓
Annotations visuelles → postits (éléments collaboratifs)
            ↓
Feedback collecté → survey_settings → survey_responses
            ↓
Questions dynamiques → whiteboard_question (contenu adaptatif)
```

## Tables par Domaine Fonctionnel

### 🎮 **1. Gestion des Sessions Collaboratives** (2 tables)

#### **Table `shared_evaluation_sessions` - Hub Central des Sessions**

**Cœur du système collaboratif** avec synchronisation fine :

```sql
-- Identifiants et contexte
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
coach_user_id UUID → auth.users.id (NO ACTION),
call_id INTEGER → public.call.callid (NO ACTION),
session_name VARCHAR(255),

-- État de la session temps réel
audio_position NUMERIC DEFAULT 0,         -- Position audio synchronisée
session_mode VARCHAR(20) DEFAULT 'paused', -- 'paused', 'playing', 'reviewing'
is_active BOOLEAN DEFAULT true,

-- Configuration d'affichage collaborative
show_participant_tops BOOLEAN DEFAULT false,  -- Afficher classement participants
show_tops_realtime BOOLEAN DEFAULT false,     -- Mise à jour classement temps réel
anonymous_mode BOOLEAN DEFAULT true,          -- Mode anonyme pour évaluations

-- Navigation granulaire dans le contenu
view_mode VARCHAR(20) DEFAULT 'word',         -- 'word', 'sentence', 'paragraph'
current_word_index INTEGER DEFAULT 0,         -- Mot actuellement visualisé
current_paragraph_index INTEGER DEFAULT 0,    -- Paragraphe actuellement visualisé

-- Préférences d'affichage
highlight_turn_one BOOLEAN DEFAULT false,     -- Surligner premier tour
highlight_speakers BOOLEAN DEFAULT true,      -- Différencier les interlocuteurs

-- Audit temporel
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now()
```

**Fonctionnalités révélées** :

- **Synchronisation audio** : Position partagée entre tous les participants
- **Navigation granulaire** : Mot par mot, phrase par phrase, ou paragraphe
- **Mode anonyme** : Évaluations collaboratives sans révéler l'identité
- **Affichage adaptatif** : Configuration interface selon préférences

#### **Table `sessions` - Tracking des Participants**

```sql
-- Identification participant
id INTEGER PRIMARY KEY,
idavatar INTEGER → public.avatars.idavatar (CASCADE DELETE),
nom TEXT NOT NULL,
url TEXT NOT NULL,
joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

**Relations CASCADE** :

- Suppression avatar → suppression session (cohérence données)

### 📊 **2. Évaluations Collaboratives Granulaires** (1 table)

#### **Table `participant_evaluations` - Évaluations Ultra-Précises**

**Innovation majeure** : Évaluation collaborative au niveau du mot

```sql
-- Identifiants collaboratifs
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
session_id UUID → shared_evaluation_sessions.id (NO ACTION),
participant_session_id INTEGER → sessions.id (NO ACTION),

-- Référencement précis du contenu évalué
call_id INTEGER → public.call.callid (NO ACTION),
audio_timestamp NUMERIC,                    -- Position exacte dans l'audio
transcription_segment TEXT,                 -- Segment de transcription évalué
word_start_id INTEGER → public.word.wordid (NO ACTION),  -- Mot de début
word_end_id INTEGER → public.word.wordid (NO ACTION),    -- Mot de fin

-- Évaluation métier
comment TEXT,                              -- Commentaire de l'évaluateur
assigned_sujet_id INTEGER → public.sujets.idsujet (NO ACTION),      -- Contexte métier
assigned_pratique_id INTEGER → public.pratiques.idpratique (NO ACTION), -- Compétence évaluée

-- Audit
created_at TIMESTAMP DEFAULT now()
```

**Particularités techniques** :

- **Granularité mot-par-mot** : `word_start_id` et `word_end_id` pour sélection précise
- **Double synchronisation** : Session globale + session participant
- **Références croisées** : Call, sujet, pratique pour contexte complet
- **Timestamp audio** : Synchronisation avec lecteur audio partagé

### 🎨 **3. Interface Collaborative Visuelle** (2 tables)

#### **Table `postits` - Annotations Visuelles Partagées**

```sql
-- Contenu et positionnement
content TEXT NOT NULL,                     -- Texte du post-it
x DOUBLE PRECISION DEFAULT 0,             -- Position X sur whiteboard
y DOUBLE PRECISION DEFAULT 0,             -- Position Y sur whiteboard
color TEXT DEFAULT 'yellow',              -- Couleur du post-it

-- Identifiant et audit
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

**Fonctionnalités** :

- **Positionnement libre** : Coordonnées X,Y sur whiteboard infini
- **Personnalisation visuelle** : Couleurs pour catégorisation
- **UUID distribué** : Identifiants uniques pour synchronisation temps réel

#### **Table `current_view` - État Interface Partagé**

```sql
-- État de l'interface partagée
id INTEGER PRIMARY KEY,
view_name TEXT NOT NULL,                   -- Vue actuellement active
updated_at TIMESTAMP DEFAULT now()        -- Dernière synchronisation
```

**Usage** : Synchronisation de l'état d'interface entre participants

### 📋 **4. Système de Feedback Collaboratif** (3 tables)

#### **Architecture Feedback Dynamique**

```
survey_settings (configuration) → survey_responses (réponses) ← whiteboard_question (questions adaptatives)
```

#### **Table `survey_settings` - Configuration Enquêtes**

```sql
-- Questions configurables
id INTEGER PRIMARY KEY,
question_open TEXT NOT NULL,              -- Question ouverte obligatoire
question_closed TEXT,                     -- Question fermée optionnelle
closed_options JSONB,                     -- Options de réponse (structure flexible)

-- Configuration et audit
email TEXT,                               -- Email de configuration
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now()
```

**Structure JSONB `closed_options`** :

```json
{
  "type": "multiple_choice",
  "options": [
    { "value": "excellent", "label": "Excellent" },
    { "value": "good", "label": "Bien" },
    { "value": "average", "label": "Moyen" },
    { "value": "poor", "label": "À améliorer" }
  ],
  "allow_multiple": false,
  "required": true
}
```

#### **Table `survey_responses` - Réponses Collaboratives**

```sql
-- Identification répondant
id INTEGER PRIMARY KEY,
participant_id UUID → auth.users.id (SET NULL),
survey_id INTEGER → survey_settings.id (CASCADE DELETE),

-- Réponses structurées
rating INTEGER,                           -- Note numérique
feedback TEXT,                           -- Commentaire libre
closed_answer TEXT,                      -- Réponse question fermée
email TEXT,                              -- Email répondant (optionnel)

-- Audit
created_at TIMESTAMP DEFAULT now()
```

**Relations** :

- **CASCADE DELETE** : Suppression enquête → suppression réponses
- **SET NULL** : Suppression utilisateur → préservation réponse anonymisée

#### **Table `whiteboard_question` - Questions Dynamiques**

```sql
-- Questions générées dynamiquement
id INTEGER PRIMARY KEY,
question TEXT NOT NULL                    -- Question adaptée au contexte
```

**Usage probable** : Questions générées par IA selon le contexte de l'évaluation

## Contraintes Business et Sécurité

### 🔒 **Row Level Security (RLS) - Sécurité Collaborative Avancée**

Le schéma `whiteboard` implémente un **système RLS sophistiqué** avec **32 politiques** pour sécuriser la collaboration temps réel :

#### **Politiques Coach Spécialisées**

```sql
-- Accès privilégié coach identifié
'Allow coach to update view' ON current_view
WHERE auth.email() = 'thomassonear@gmail.com'

-- Gestion complète sessions par coach
'users_manage_own_sessions' ON shared_evaluation_sessions
WHERE coach_user_id = auth.uid()

-- Suppression globale sessions (fonction admin)
'Allow coach to delete all sessions' ON sessions
WHERE auth.email() = 'thomassonear@gmail.com'
```

#### **Politiques Participants Collaboratives**

```sql
-- Participants gèrent leurs propres évaluations
'Participants can submit responses' ON survey_responses
WHERE participant_id = auth.uid()

-- Accès lecture à ses propres réponses uniquement
'Participants can view their own responses' ON survey_responses
WHERE participant_id = auth.uid()

-- Accès sessions actives pour tous participants
'Allow public read access to active sessions' ON shared_evaluation_sessions
WHERE is_active = true
```

#### **Politiques Post-its Collaboratifs**

```sql
-- CRUD complet pour utilisateurs authentifiés
'Allow authenticated users to insert postits' WHERE auth.uid() IS NOT NULL
'Allow authenticated users to read postits' WHERE auth.uid() IS NOT NULL
'Allow authenticated users to update postits' WHERE auth.uid() IS NOT NULL
'Allow authenticated users to delete postits' WHERE auth.uid() IS NOT NULL

-- + Politiques publiques permissives pour collaboration ouverte
'Allow insert for all users', 'Allow read for all', etc.
```

### ⚖️ **Contraintes Métier**

#### **Contrainte Qualité Feedback**

```sql
-- Système de notation 1-5 obligatoire
survey_responses_rating_check: rating >= 1 AND rating <= 5
```

#### **Contraintes Référentiell Strict**

```sql
-- Champs obligatoires pour cohérence collaborative
content IS NOT NULL (postits)
x IS NOT NULL, y IS NOT NULL (positionnement postits)
question_open IS NOT NULL (survey_settings)
```

## Optimisations Performance et Volumétrie

### 📊 **Patterns d'Usage Révélés**

#### **Données Temps Réel (Usage Actuel)**

| Table                          | Lignes | Pattern          | Insight                            |
| ------------------------------ | ------ | ---------------- | ---------------------------------- |
| **shared_evaluation_sessions** | 9      | **BALANCED**     | Sessions actives + historique      |
| **sessions**                   | 5      | **INSERT_HEAVY** | Participants se connectent         |
| **survey_responses**           | 4      | **INSERT_HEAVY** | Feedback collecté                  |
| **current_view**               | 1      | **UPDATE_HEAVY** | État interface synchronisé         |
| **participant_evaluations**    | 0      | **STATIC**       | Fonctionnalité prête, pas utilisée |

#### **Insights Opérationnels**

- **Sessions actives** : 9 sessions créées, 12 mises à jour (évolution temps réel)
- **Interface synchronisée** : `current_view` mise à jour 13 fois (navigation partagée)
- **Collaboration authentique** : 5 participants, 4 feedbacks (engagement réel)
- **Potentiel inexploité** : `participant_evaluations` vide (fonctionnalité avancée prête)

### ⚡ **Index Spécialisés Performance**

#### **Index Temps Réel Optimisé**

```sql
-- Performance collaboration temps réel
CREATE INDEX idx_shared_sessions_realtime
ON shared_evaluation_sessions (id, updated_at, is_active);

-- Contrainte métier : Un coach = Une session active
CREATE UNIQUE INDEX unique_active_session_per_coach
ON shared_evaluation_sessions (coach_user_id)
WHERE is_active = true;
```

**Optimisations révélées** :

- **Requêtes temps réel** : Index composé pour synchronisation rapide
- **Règle métier** : Prévention sessions multiples simultanées par coach
- **Performance collaborative** : Index sur UUID + timestamps pour réactivité

## Relations et Intégrations

### 🔗 **Relations Intra-Schéma** (3 relations)

#### **Workflow de Session**

```sql
-- Participants rejoignent sessions d'évaluation
participant_evaluations.session_id → shared_evaluation_sessions.id (NO ACTION)
participant_evaluations.participant_session_id → sessions.id (NO ACTION)

-- Enquêtes et réponses liées
survey_responses.survey_id → survey_settings.id (CASCADE DELETE)
```

### 🌐 **Relations Cross-Schémas** (9 relations)

#### **Vers Schéma `public` (Métier Core)** - 7 relations

```sql
-- Références précises au contenu métier
participant_evaluations.call_id → public.call.callid (NO ACTION)
participant_evaluations.word_start_id → public.word.wordid (NO ACTION)
participant_evaluations.word_end_id → public.word.wordid (NO ACTION)
participant_evaluations.assigned_sujet_id → public.sujets.idsujet (NO ACTION)
participant_evaluations.assigned_pratique_id → public.pratiques.idpratique (NO ACTION)

-- Gestion sessions et avatars
sessions.idavatar → public.avatars.idavatar (CASCADE DELETE)
shared_evaluation_sessions.call_id → public.call.callid (NO ACTION)
```

#### **Vers Schéma `auth` (Utilisateurs)** - 2 relations

```sql
-- Identification utilisateurs collaboratifs
shared_evaluation_sessions.coach_user_id → auth.users.id (NO ACTION)
survey_responses.participant_id → auth.users.id (SET NULL)
```

### 🛡️ **Stratégies de Protection**

#### **NO ACTION (Protection Données Métier)**

- **Préservation contenu** : Suppression appel/mot n'affecte pas évaluations collaboratives
- **Historique évaluations** : Sessions préservées même si participants supprimés
- **Intégrité référentielle** : Évaluations restent cohérentes

#### **CASCADE DELETE (Cohérence Collaborative)**

- **Sessions liées aux avatars** : Suppression avatar → suppression session
- **Enquêtes et réponses** : Suppression enquête → suppression réponses

#### **SET NULL (Anonymisation)**

- **RGPD compliance** : Suppression utilisateur → anonymisation réponses

## Patterns de Collaboration Temps Réel

### 🔄 **Synchronisation Multi-Niveaux**

#### **1. Synchronisation Audio/Contenu**

```sql
-- Position audio partagée
shared_evaluation_sessions.audio_position NUMERIC DEFAULT 0
shared_evaluation_sessions.current_word_index INTEGER DEFAULT 0

-- Navigation coordonnée
participant_evaluations.audio_timestamp → synchronisé avec audio_position
participant_evaluations.word_start_id → synchronisé avec current_word_index
```

#### **2. Synchronisation Interface**

```sql
-- État interface partagé
current_view.view_name → vue active synchronisée
shared_evaluation_sessions.view_mode → 'word', 'sentence', 'paragraph'

-- Paramètres d'affichage collaboratifs
show_participant_tops BOOLEAN → affichage classement temps réel
highlight_speakers BOOLEAN → mise en évidence interlocuteurs
```

#### **3. Synchronisation Évaluations**

```sql
-- Mode anonyme configurable
shared_evaluation_sessions.anonymous_mode BOOLEAN DEFAULT true

-- Affichage temps réel des évaluations
show_tops_realtime BOOLEAN DEFAULT false
```

### 🎭 **Modes de Collaboration**

#### **Mode Session (`session_mode`)**

- **`'paused'`** : Session en pause, navigation libre
- **`'playing'`** : Lecture synchronisée, évaluations temps réel
- **`'reviewing'`** : Révision collaborative des évaluations

#### **Mode Vue (`view_mode`)**

- **`'word'`** : Navigation mot par mot (granularité maximale)
- **`'sentence'`** : Navigation phrase par phrase
- **`'paragraph'`** : Navigation paragraphe par paragraphe

#### **Mode Affichage**

- **Mode anonyme** : Évaluations sans révéler l'identité
- **Classement temps réel** : Comparaison performance participants
- **Surlignage adaptatif** : Mise en évidence selon préférences

## Innovations Techniques

### 🚀 **Granularité Ultra-Fine**

```sql
-- Évaluation précise au mot près
participant_evaluations.word_start_id → public.word.wordid
participant_evaluations.word_end_id → public.word.wordid
participant_evaluations.audio_timestamp NUMERIC
```

**Capacités révélées** :

- **Sélection précise** : Du mot X au mot Y dans la transcription
- **Synchronisation audio** : Position exacte dans l'enregistrement
- **Évaluation contextuelle** : Sujet + pratique + commentaire sur passage précis

### 🎨 **Whiteboard Infini**

```sql
-- Positionnement libre des éléments
postits.x DOUBLE PRECISION DEFAULT 0
postits.y DOUBLE PRECISION DEFAULT 0
postits.color TEXT DEFAULT 'yellow'
```

**Fonctionnalités** :

- **Espace infini** : Coordonnées flottantes pour positionnement libre
- **Personnalisation** : Couleurs pour catégorisation visuelle
- **Persistance** : États sauvegardés avec timestamps

### 🧠 **Feedback Adaptatif**

```sql
-- Configuration flexible d'enquêtes
survey_settings.closed_options JSONB
whiteboard_question.question TEXT
```

**Système intelligent** :

- **Questions dynamiques** : Générées selon contexte d'évaluation
- **Options configurables** : Structure JSONB pour flexibilité maximale
- **Collecte multi-format** : Rating + feedback libre + réponses fermées

## Séquences et Gestion des Identifiants

### 🔢 **Architecture Hybride Identifiants**

| Type        | Tables                                                                               | Usage                         | Avantage                          |
| ----------- | ------------------------------------------------------------------------------------ | ----------------------------- | --------------------------------- |
| **UUID**    | `shared_evaluation_sessions`,`participant_evaluations`,`postits`                     | **Collaboration temps réel**  | Distribution, unicité globale     |
| **INTEGER** | `sessions`,`survey_settings`,`survey_responses`,`whiteboard_question`,`current_view` | **Configuration & référence** | Performance, relations optimisées |

#### **Séquences Configuration** (5 séquences)

```sql
-- Séquences INTEGER pour performance
current_view_id_seq, sessions_id_seq, survey_responses_id_seq,
survey_settings_id_seq, whiteboard_question_id_seq

-- Toutes : start_value=1, increment=1, max=2147483647
```

### 🎯 **Classification Fonctionnelle des Identifiants**

#### **ACTOR_ID (Utilisateurs Collaboratifs)**

- `shared_evaluation_sessions.coach_user_id` : Responsable session
- `survey_responses.participant_id` : Répondant enquête

#### **SESSION_ID (Sessions Collaboratives)**

- `participant_evaluations.session_id` : Session d'évaluation partagée
- `participant_evaluations.participant_session_id` : Session participant individuelle

#### **CONTENT_ID (Contenu Métier Référencé)**

- `participant_evaluations.call_id` : Appel évalué collaborativement
- `shared_evaluation_sessions.call_id` : Appel de la session partagée

#### **GENERAL_ID (Identifiants Techniques)**

- Tous les autres identifiants : clés primaires et références

## Architecture UUID et Performance

### ⚡ **Optimisations Temps Réel**

#### **Index Spécialisés Collaboration**

```sql
-- Performance temps réel critique
CREATE INDEX idx_shared_sessions_realtime
ON shared_evaluation_sessions (id, updated_at, is_active);

-- Contrainte métier : Un coach actif à la fois
CREATE UNIQUE INDEX unique_active_session_per_coach
ON shared_evaluation_sessions (coach_user_id)
WHERE is_active = true;
```

#### **Patterns de Requêtes Optimisées**

```sql
-- Sessions actives temps réel (utilise idx_shared_sessions_realtime)
SELECT * FROM shared_evaluation_sessions
WHERE is_active = true
ORDER BY updated_at DESC;

-- Évaluations session en cours
SELECT pe.*, ses.audio_position, ses.current_word_index
FROM participant_evaluations pe
JOIN shared_evaluation_sessions ses ON pe.session_id = ses.id
WHERE ses.is_active = true AND ses.coach_user_id = ?;
```

#### **Volumétrie Opérationnelle Actuelle**

- **9 sessions** créées avec 24 mises à jour (évolution temps réel active)
- **5 participants** actifs avec sessions INSERT-heavy
- **Interface synchronisée** : 13 mises à jour `current_view` (navigation partagée)
- **Feedback authentique** : 4 réponses collectées
- **Potentiel inexploité** : `participant_evaluations` vide (fonctionnalité prête)

## Workflows de Collaboration

### 🎬 **Scénario Type : Session d'Évaluation Collaborative**

#### **1. Initialisation Session**

```sql
-- Coach lance session d'évaluation
INSERT INTO shared_evaluation_sessions (coach_user_id, call_id, session_name, session_mode)
VALUES (?, ?, 'Évaluation Call #123', 'paused');

-- Participants rejoignent
INSERT INTO sessions (idavatar, nom, url) VALUES (?, 'Conseiller A', '/avatar/1');
```

#### **2. Navigation Synchronisée**

```sql
-- Coach navigue → synchronisation participants
UPDATE shared_evaluation_sessions
SET current_word_index = 145, audio_position = 32.5, updated_at = now()
WHERE id = ? AND coach_user_id = ?;
```

#### **3. Évaluations Granulaires**

```sql
-- Participant évalue passage précis
INSERT INTO participant_evaluations (
    session_id, participant_session_id, call_id,
    word_start_id, word_end_id, audio_timestamp,
    transcription_segment, comment, assigned_pratique_id
) VALUES (?, ?, ?, 140, 150, 32.5, 'Bonjour, merci de nous appeler', 'Excellente ouverture', 3);
```

#### **4. Feedback Collaboratif**

```sql
-- Configuration enquête post-session
INSERT INTO survey_settings (question_open, closed_options)
VALUES ('Comment évaluez-vous cette session collaborative ?',
        '{"type": "rating", "scale": [1,2,3,4,5], "labels": ["Très mauvais", "Excellent"]}');

-- Collecte réponses
INSERT INTO survey_responses (participant_id, survey_id, rating, feedback)
VALUES (?, ?, 4, 'Session très productive, granularité mot-par-mot très utile');
```

## Intégration avec l'Écosystème 000-CADO

### 🔄 **Pipeline Étendu avec Collaboration**

```
Appel uploadé (public.call)
    ↓
Transcription mot-par-mot (public.word)
    ↓
Session collaborative lancée (whiteboard.shared_evaluation_sessions)
    ↓
Évaluations granulaires temps réel (whiteboard.participant_evaluations)
    ↓
    ├── Références public.word (granularité)
    ├── Assignation public.pratiques (compétences)
    └── Contexte public.sujets (métier)
    ↓
Synthèse et feedback (whiteboard.survey_responses)
    ↓
Plan d'action personnalisé (public.activitesconseillers)
```

### 🤝 **Valeur Ajoutée Collaborative**

#### **Évaluation Enrichie**

- **Multi-perspectives** : Coach + conseiller évaluent simultanément
- **Granularité inégalée** : Évaluation mot par mot impossible manuellement
- **Contexte préservé** : Timestamp audio + segment transcription

#### **Apprentissage Accéléré**

- **Temps réel** : Pas d'attente pour feedback
- **Visuel** : Post-its et annotations pour mémorisation
- **Adaptatif** : Questions générées selon contexte

#### **Traçabilité Complète**

- **Audit trail** : Qui a évalué quoi, quand, comment
- **Amélioration continue** : Feedback sur efficacité collaborative
- **RGPD compliant** : Anonymisation préservant l'utilité

---

## Conclusion

Le schéma `whiteboard` révèle une **innovation majeure** dans la collaboration temps réel pour l'évaluation qualité. Avec sa **granularité mot-par-mot** , sa **synchronisation multi-niveaux** et son **système de feedback adaptatif** , il transforme l'évaluation qualité d'un exercice solitaire en une **expérience collaborative enrichissante** .

L'architecture **UUID + INTEGER hybride** , les **relations de protection intelligentes** et l'**intégration profonde** avec le schéma `public` démontrent une sophistication technique qui positionne 000-CADO comme une solution de **nouvelle génération** dans le domaine de l'évaluation qualité collaborative assistée par IA.

Cette capacité d'évaluation collaborative temps réel, combinée à la granularité mot-par-mot, constitue un **avantage concurrentiel majeur** face aux solutions traditionnelles d'évaluation qualité.
