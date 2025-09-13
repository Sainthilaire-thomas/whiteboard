# Documentation Schéma Public - 000-CADO

## Vue d'Ensemble

Le schéma `public` constitue le **cœur métier** de la plateforme 000-CADO avec **46 tables** organisées en **8 domaines fonctionnels** . Il orchestre le pipeline complet : **Appel → Évaluation → Coaching → Suivi** , tout en servant de hub central pour les relations avec les 11 autres schémas spécialisés.

### Statistiques Générales

- **46 tables** réparties en 8 domaines fonctionnels
- **39 séquences** pour auto-incrémentation
- **58 index** dont 3 spécialisés pour l'interface sidebar
- **48 relations** intra-schéma + 18 relations cross-schémas
- **13 colonnes JSONB** pour structures de données complexes
- **1 trigger automatique** pour calcul de durée des appels

## Architecture par Domaines Fonctionnels

### 🏢 **1. Gestion Utilisateurs & Entreprises** (6 tables)

#### Tables Principales

- **`users`** : Utilisateurs de la plateforme (coaches, administrateurs)
- **`entreprises`** : Entreprises clientes multi-tenant
- **`conseillers`** : Conseillers/coaches rattachés aux entreprises
- **`avatars`** : Avatars pour personnalisation et anonymisation
- **`user_enterprises`** : Relation Many-to-Many utilisateurs ↔ entreprises
- **`user_roles`** : Rôles personnalisés par utilisateur

#### Relations Clés

```sql
-- Architecture multi-tenant sécurisée
users.entreprise_id → entreprises.identreprise (NO ACTION)
conseillers.entreprise → entreprises.identreprise (CASCADE DELETE)
conseillers.idavatar → avatars.idavatar (NO ACTION)
```

#### Particularités

- **Anonymisation** : `conseillers.estanonyme` + `avatars.anonyme` pour protection identité
- **Multi-appartenance** : Table `user_enterprises` pour utilisateurs multi-entreprises
- **Sécurité forte** : Email unique sur `users` et `conseillers`

### 📞 **2. Gestion des Appels & Transcriptions** (4 tables)

#### Pipeline de Transcription

```
call (enregistrement) → transcript (structure) → word (mot-par-mot) → roleplaydata (jeu de rôle)
```

#### **Table `call` - Hub Central des Appels**

```sql
-- Colonnes critiques
transcription JSONB,           -- Structure complète avec timestamps
duree NUMERIC,                -- Calculée automatiquement par trigger
status VARCHAR(20) DEFAULT 'non_supervisé',  -- Pipeline d'évaluation
is_tagging_call BOOLEAN DEFAULT false        -- Appel en cours d'évaluation
```

**Trigger Automatique** :

```sql
CREATE TRIGGER trigger_update_duree
BEFORE INSERT OR UPDATE ON call
FOR EACH ROW EXECUTE FUNCTION update_duree();
```

#### **Table `word` - Analyse Granulaire**

- **Granularité maximale** : Chaque mot avec `startTime` et `endTime`
- **Référencement précis** : Utilisé par `whiteboard` pour annotations mot-par-mot
- **Relations CASCADE** : `word.transcriptid → transcript.transcriptid`

#### **Table `roleplaydata` - Jeu de Rôle IA**

- **Intégration whiteboard** : `postit_id` pour collaboration temps réel
- **Données JSON** : `note` pour stockage des sessions de reformulation
- **Index GIN** : `idx_roleplaydata_note_gin` pour recherche dans les notes

### 🎯 **3. Système d'Évaluation Qualité** (4 tables)

#### Architecture d'Évaluation

```
lpltag (critères) → turntagged (affectation) → tag_history (audit) → tag_modifications (traçabilité)
```

#### **Table `lpltag` - Grille de Critères Qualité**

```sql
-- Structure des critères
label TEXT NOT NULL UNIQUE,     -- Nom du critère (clé métier)
family TEXT,                   -- Famille de critères (Écoute, Argumentation, etc.)
color TEXT NOT NULL,          -- Couleur pour interface
created_at TIMESTAMP         -- Audit création
```

#### **Table `turntagged` - Affectation Critères aux Passages**

- **Granularité temporelle** : `start_time` et `end_time` précis dans l'appel
- **Verbatim complet** : Texte exact du passage évalué
- **Scoring IA** : `score_auto` et `next_turn_tag_auto` pour pré-évaluation
- **Index optimisés** : 4 index pour performance temps réel

**Relations critiques** :

```sql
turntagged.call_id → call.callid (CASCADE DELETE)
turntagged.tag → lpltag.label (SET NULL, CASCADE UPDATE)
```

#### Audit Trail Complet

- **`tag_history`** : Historique des modifications de labels
- **`tag_modifications`** : Audit détaillé avec `previous_data` JSONB

### 🎓 **4. Coaching & Plans d'Entraînement** (4 tables)

#### **Table `activitesconseillers` - Sessions de Coaching**

**Cœur du système de coaching** avec double interface :

```sql
-- Interface métier classique
statut TEXT,
commentaires TEXT,
objectifs TEXT,
nature TEXT,

-- Interface sidebar optimisée (temps réel)
sidebar_phase VARCHAR(50),      -- 'selection', 'evaluation', 'coaching', 'suivi', 'feedback', 'admin'
sidebar_statut VARCHAR(50),     -- 'à faire', 'en cours', 'réalisé'
sidebar_objectifs TEXT,
sidebar_commentaires TEXT,
sidebar_date_modif TIMESTAMP WITH TIME ZONE DEFAULT now()
```

**Index spécialisés pour performance UI** :

```sql
-- Optimisation interface sidebar
CREATE INDEX idx_activitesconseillers_sidebar_phase ON activitesconseillers (sidebar_phase);
CREATE INDEX idx_activitesconseillers_sidebar_conseiller ON activitesconseillers (idconseiller, sidebar_phase);
CREATE INDEX idx_activitesconseillers_sidebar_statut ON activitesconseillers (sidebar_statut);
```

#### **Table `pratiques` - Compétences Évaluées**

```sql
-- Guides différenciés par rôle
fiche_conseiller_json JSONB,   -- Guide pour le conseiller
fiche_coach_json JSONB,        -- Guide pour le coach
jeuderole JSONB,              -- Scénarios de re-simulation IA
valeurnumérique INTEGER DEFAULT 1,  -- Pondération dans l'évaluation
geste TEXT                    -- Action corrective recommandée
```

#### Relations de Coaching

```sql
-- Workflow de coaching
activitesconseillers.idconseiller → conseillers.idconseiller (NO ACTION)
activitesconseillers.idpratique → pratiques.idpratique (NO ACTION)
activitesconseillers.idexercice → exercices.idexercice (NO ACTION)
exercices.idpratique → pratiques.idpratique (NO ACTION)
```

### 💡 **5. Système de Nudges & Feedback** (4 tables)

#### Pipeline de Nudges Personnalisés

```
nudge (standards) → customnudges (personnalisés) → avisexercicesnudges (feedback)
```

#### **Table `nudge` - Nudges Standards**

```sql
-- 6 nudges par entrée pour plans d'entraînement complets
nudge1 TEXT, nudge2 TEXT, nudge3 TEXT,
nudge4 TEXT, nudge5 TEXT, nudge6 TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
```

#### **Table `customnudges` - Personnalisation**

- **Modifications JSONB** : Adaptations des nudges standards par conseiller
- **Relations protégées** : Liens avec `activitesconseillers` et `nudge` (NO ACTION)

#### **Tables de Support**

- **`custom_nudges`** : Version alternative avec dates planifiées
- **`exercices_nudges`** : Association exercices ↔ nudges
- **`avisexercicesnudges`** : Feedback d'efficacité pour amélioration continue

### 📚 **6. Données de Référence** (4 tables)

#### **Table `sujets` & `domaines` - Contexte Métier**

```sql
-- Hiérarchie métier
domaines (secteur) → sujets (type d'appel) → categoriessujets (classification)
```

#### **Table `ponderation_sujets` - Scoring Business**

```sql
-- Pondération selon importance métier
conforme INTEGER DEFAULT 10,
partiellement_conforme INTEGER DEFAULT 5,
non_conforme INTEGER DEFAULT 0,
permet_partiellement_conforme BOOLEAN DEFAULT true
```

#### Relations de Référence

- **`sujetspratiques`** : Importance des pratiques par type de sujet
- Configuration flexible par entreprise via `entreprise_domaines` et `entreprise_pratiques`

### 📊 **7. Système d'Audit & Logs** (6 tables)

#### **Table `logs` - Audit Applicatif**

```sql
timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
level TEXT,                    -- Niveau de log
message TEXT,                 -- Message principal
details JSONB                 -- Détails structurés
```

#### **Sessions Utilisateurs**

- **`user_sessions`** : Sessions actuelles (user_id TEXT)
- **`user_sessions_backup`** : Audit complet (user_id UUID + session_id UUID)

#### **Quiz d'Évaluation Continue**

```sql
-- Table quiz : Questions générées depuis les appels
quiz.callid → call.callid,           -- Quiz basé sur appel spécifique
quiz.wordid → word.wordid,           -- Question sur passage précis
possibleanswers ARRAY,               -- Choix multiples
correctanswerindexes ARRAY,          -- Bonnes réponses
quizdata JSONB                       -- Données étendues

-- Table quiz_responses : Suivi progression
quiz_responses.conseillerid → conseillers.idconseiller,
answers ARRAY,                       -- Réponses données
submitted_at TIMESTAMP              -- Horodatage
```

### 🔧 **8. Tables Techniques & Support** (14 tables)

#### **Tables de Liaison**

- **`activitesconseillers_pratiques`** : Many-to-Many activités ↔ pratiques
- **`activitesconseillers_sujets`** : Many-to-Many activités ↔ sujets
- **`callactivityrelation`** : Many-to-Many appels ↔ activités
- **`entreprise_call`** : Many-to-Many entreprises ↔ appels
- **`entreprise_domaines`** : Configuration domaines par entreprise
- **`entreprise_pratiques`** : Grilles qualité spécifiques par entreprise

#### **Tables Spécialisées**

- **`postit`** : Éléments collaboratifs whiteboard (référence `word` pour précision)
- **`icon`** : Annotations visuelles sur les mots (`data` JSONB)
- **`motifs_afpa`** : Configuration spécifique client AFPA
- **`deroule_coaching`** : Templates de déroulé de session
- **`word_tag`** : Tagging manuel des mots

## Patterns et Conventions Architecturales

### 🔑 **Stratégies de Clés et Séquences**

#### Conventions de Nommage

- **Tables principales** : `idX` (ex: `idconseiller`, `idpratique`)
- **Tables de liaison** : `id` simple avec séquence dédiée
- **Tables d'audit** : `id` avec préfixe descriptif

#### Gestion des Séquences

- **39 séquences** pour auto-incrémentation
- **Type INTEGER** : Standard pour la plupart des tables
- **Type BIGINT** : `entreprises.identreprise` et `nudge.id` pour volumétrie

### 🔗 **Stratégies de Relations**

#### **CASCADE DELETE** (Protection des Données)

```sql
-- Suppression d'une entreprise = suppression de ses conseillers
conseillers.entreprise → entreprises.identreprise (CASCADE DELETE)

-- Suppression d'un appel = suppression de toutes ses analyses
transcript.callid → call.callid (CASCADE DELETE)
word.transcriptid → transcript.transcriptid (CASCADE DELETE)
turntagged.call_id → call.callid (CASCADE DELETE)
roleplaydata.call_id → call.callid (CASCADE DELETE)
```

#### **NO ACTION** (Protection de l'Historique)

```sql
-- Protection des sessions de coaching
activitesconseillers.idconseiller → conseillers.idconseiller (NO ACTION)
activitesconseillers.idexercice → exercices.idexercice (NO ACTION)

-- Protection des données de référence
pratiques.idcategoriepratique → categoriespratiques.idcategoriepratique (NO ACTION)
```

#### **SET NULL / CASCADE UPDATE** (Flexibilité)

```sql
-- Les tags peuvent être modifiés sans casser les évaluations
turntagged.tag → lpltag.label (SET NULL, CASCADE UPDATE)
```

### 📊 **Optimisations Performance**

#### **Index Spécialisés Interface**

```sql
-- Optimisation sidebar temps réel (3 index dédiés)
idx_activitesconseillers_sidebar_phase
idx_activitesconseillers_sidebar_conseiller
idx_activitesconseillers_sidebar_statut
```

#### **Index Granularité Temporelle**

```sql
-- Optimisation recherche dans les appels
idx_call_id_start_time ON turntagged (call_id, start_time)
idx_start_time, idx_end_time ON turntagged
```

#### **Index JSON Avancés**

```sql
-- Recherche dans les notes de jeu de rôle
idx_roleplaydata_note_gin ON roleplaydata USING gin (note)
```

### 📝 **Structures JSONB Complexes**

#### **`call.transcription` - Structure de Transcription**

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

#### **`pratiques.jeuderole` - Scénarios IA**

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

#### **`exercices.nudges` - Plans d'Entraînement**

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

## Contraintes Business et Énumérations

### **Contraintes d'Intégrité Métier**

#### **`activitesconseillers` - Workflow de Coaching**

```sql
-- Phases de coaching constraintes
CHECK sidebar_phase IN ('selection', 'evaluation', 'coaching', 'suivi', 'feedback', 'admin')

-- Statuts de session constraintes
CHECK sidebar_statut IN ('à faire', 'en cours', 'réalisé')
```

#### **Contraintes d'Unicité Business**

```sql
-- Un conseiller ne peut avoir qu'un custom_nudge par activité
UNIQUE (id_activite) ON custom_nudges

-- Un appel ne peut avoir qu'un motif AFPA
UNIQUE (callid) ON motifs_afpa

-- Un conseiller/activité/sujet unique
UNIQUE (idactivite, idsujet) ON activitesconseillers_sujets
```

## Intégrations Cross-Schémas

### **Relations vers Autres Schémas**

#### **Vers `linguistic` (Analyse IA)**

```sql
-- Les analyses IA suivent les évaluations manuelles
linguistic.verbatims_metadata.turn_id → public.turntagged.id (CASCADE DELETE)
linguistic.verbatims_models_results.turn_id → public.turntagged.id (CASCADE DELETE)
```

#### **Vers `whiteboard` (Collaboration)**

```sql
-- Évaluations collaboratives granulaires
whiteboard.participant_evaluations.call_id → public.call.callid (NO ACTION)
whiteboard.participant_evaluations.word_start_id → public.word.wordid (NO ACTION)
whiteboard.participant_evaluations.assigned_pratique_id → public.pratiques.idpratique (NO ACTION)
```

#### **Vers `auth` (Audit)**

```sql
-- Traçabilité des connexions
public.user_sessions_backup.user_id → auth.users.id (NO ACTION)
```

## Workflow Principal et Flux de Données

### **Pipeline Complet : Appel → Coaching → Suivi**

```
┌─────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│Upload Appel │ -> │call.transcription   │ -> │trigger_update_  │
│             │    │(JSONB)              │    │duree()          │
└─────────────┘    └─────────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────────┐         │
│transcript ->    │ <- │                     │ <-------┘
│word (analyse    │    │                     │
│mot par mot)     │    │                     │
└─────────────────┘    └─────────────────────┘
        │
        v
┌─────────────────────┐    ┌─────────────────────┐
│Évaluation Manuelle: │ -> │Analyse IA:          │
│turntagged           │    │linguistic.*         │
│(affectation         │    │(verbatims_metadata, │
│critères qualité)    │    │verbatims_results)   │
└─────────────────────┘    └─────────────────────┘
        │                           │
        v                           │
┌─────────────────────┐              │
│Session Coaching:    │ <------------┘
│activitesconseillers │
│(sidebar_phase:      │
│'coaching')          │
└─────────────────────┘
        │
        v
┌─────────────────────┐    ┌─────────────────────┐
│Jeu de Rôle:         │ -> │Plan Nudges:         │
│roleplaydata         │    │customnudges         │
│(reformulation IA)   │    │(plan personnalisé)  │
└─────────────────────┘    └─────────────────────┘
        │                           │
        v                           │
┌─────────────────────┐              │
│Quiz Évaluation:     │ <------------┘
│quiz + quiz_responses│
│(mesure progression) │
└─────────────────────┘
        │
        v
┌─────────────────────┐
│Feedback:            │
│avisexercicesnudges  │
│(amélioration        │
│continue)            │
└─────────────────────┘
```

### **États de Progression**

#### **call.status**

- `'non_supervisé'` → `'en_cours'` → `'évalué'` → `'coaching_planifié'` → `'terminé'`

#### **activitesconseillers.sidebar_statut**

- `'à faire'` → `'en cours'` → `'réalisé'`

#### **activitesconseillers.sidebar_phase**

- `'selection'` → `'evaluation'` → `'coaching'` → `'suivi'` → `'feedback'`

## Recommandations et Bonnes Pratiques

### **🚀 Optimisations Performance**

#### **Requêtes Fréquentes Optimisées**

```sql
-- Dashboard conseiller (utilise index composite)
SELECT * FROM activitesconseillers
WHERE idconseiller = ? AND sidebar_phase = 'en_cours';

-- Recherche dans les évaluations (utilise index temporel)
SELECT * FROM turntagged
WHERE call_id = ? AND start_time BETWEEN ? AND ?;
```

#### **Maintenance Recommandée**

- **Archivage** : `call.archived = true` après 2 ans
- **Purge logs** : Logs > 6 mois dans table d'archive
- **Réindexation** : Index GIN sur JSONB selon volumétrie

### **🔐 Sécurité et Conformité**

#### **Données Sensibles**

- **`call.transcription`** : Conversations clients → Chiffrement via pgsodium
- **`conseillers.estanonyme`** : Anonymisation pour conformité
- **`user_sessions_backup`** : Audit complet avec UUID pour traçabilité RGPD

#### **Stratégies de Suppression**

- **Soft delete** : Utiliser `archived` plutôt que DELETE sur `call`
- **Anonymisation** : SET NULL sur `turntagged.tag` préserve les évaluations
- **Audit préservé** : NO ACTION sur `user_sessions_backup` pour conformité

---

## Conclusion

Le schéma `public` révèle une architecture métier sophistiquée qui dépasse largement le simple coaching téléphonique. Avec ses **8 domaines fonctionnels intégrés** , ses **optimisations temps réel** et ses **structures JSONB flexibles** , il constitue le socle d'une plateforme d'évaluation qualité de nouvelle génération.

L'architecture **multi-interface** (métier + sidebar), les **relations protégées** et les **automatisations intelligentes** (trigger durée, scoring IA) démontrent une maturité technique qui positionne 000-CADO comme une solution enterprise de référence dans le domaine de l'évaluation qualité et du coaching assisté par IA.

<style>#mermaid-1749792964503{font-family:sans-serif;font-size:16px;fill:#333;}#mermaid-1749792964503 .error-icon{fill:#552222;}#mermaid-1749792964503 .error-text{fill:#552222;stroke:#552222;}#mermaid-1749792964503 .edge-thickness-normal{stroke-width:2px;}#mermaid-1749792964503 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-1749792964503 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-1749792964503 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-1749792964503 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-1749792964503 .marker{fill:#333333;}#mermaid-1749792964503 .marker.cross{stroke:#333333;}#mermaid-1749792964503 svg{font-family:sans-serif;font-size:16px;}#mermaid-1749792964503 .label{font-family:sans-serif;color:#333;}#mermaid-1749792964503 .label text{fill:#333;}#mermaid-1749792964503 .node rect,#mermaid-1749792964503 .node circle,#mermaid-1749792964503 .node ellipse,#mermaid-1749792964503 .node polygon,#mermaid-1749792964503 .node path{fill:#ECECFF;stroke:#9370DB;stroke-width:1px;}#mermaid-1749792964503 .node .label{text-align:center;}#mermaid-1749792964503 .node.clickable{cursor:pointer;}#mermaid-1749792964503 .arrowheadPath{fill:#333333;}#mermaid-1749792964503 .edgePath .path{stroke:#333333;stroke-width:1.5px;}#mermaid-1749792964503 .flowchart-link{stroke:#333333;fill:none;}#mermaid-1749792964503 .edgeLabel{background-color:#e8e8e8;text-align:center;}#mermaid-1749792964503 .edgeLabel rect{opacity:0.5;background-color:#e8e8e8;fill:#e8e8e8;}#mermaid-1749792964503 .cluster rect{fill:#ffffde;stroke:#aaaa33;stroke-width:1px;}#mermaid-1749792964503 .cluster text{fill:#333;}#mermaid-1749792964503 div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:sans-serif;font-size:12px;background:hsl(80,100%,96.2745098039%);border:1px solid #aaaa33;border-radius:2px;pointer-events:none;z-index:100;}#mermaid-1749792964503:root{--mermaid-font-family:sans-serif;}#mermaid-1749792964503:root{--mermaid-alt-font-family:sans-serif;}#mermaid-1749792964503 flowchart{fill:apa;}</style>
