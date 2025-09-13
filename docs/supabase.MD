# Architecture Base de Données Supabase - Whiteboard

> Document de référence pour l'architecture de données de l'application Whiteboard

## Vue d'ensemble des modules

### Modules identifiés

1. **Module Administratif** - Gestion des grilles d'évaluation et configuration
2. **Module ZohoWorkdrive** - Import et gestion des appels
3. **Module Whiteboard** - Sessions collaboratives temps réel
4. **Module Evaluation** - Workflow d'évaluation en 5 phases
5. **Module Utilisateurs** - Gestion des utilisateurs et entreprises

## Architecture modulaire basée sur la vraie structure DB

### Module 1: Administration (Schema `public`)

**Tables** : `entreprises`, `domaines`, `sujets`, `pratiques`, `categories*`, `ponderation_sujets`

```sql
-- Référentiels métier
entreprises (identreprise, nomentreprise, logo, domaine)
domaines (iddomaine, nomdomaine, description)
sujets (idsujet, nomsujet, iddomaine, idcategoriesujet, valeurnumerique)
pratiques (idpratique, nompratique, idcategoriepratique, fiche_*_json)
categoriessujets (idcategoriesujet, nomcategorie, couleur)
categoriespratiques (idcategoriepratique, nomcategorie, couleur)
ponderation_sujets (id_ponderation, idsujet, conforme, non_conforme)
sujetspratiques (idsujet, idpratique, importance)
```

### Module 2: ZohoWorkdrive (Schema `public`)

**Tables** : `call`, `transcript`, `word`, `entreprise_call`

```sql
-- Gestion des appels audio
call (callid, filename, filepath, audiourl, description, upload)
transcript (transcriptid, callid)
word (wordid, transcriptid, text, startTime, endTime, turn)
entreprise_call (identreprise, callid) -- Association entreprise-appel
```

### Module 3: Evaluation - Workflow 5 phases (Schema `public`)

```sql
-- Phase 1: Activités et workflow
activitesconseillers (
  idactivite, idconseiller, nature, statut,
  sidebar_phase, sidebar_statut -- Gestion du workflow
)

-- Phase 2: Analyse et évaluation
postit (id, callid, wordid, text, timestamp, sujet, pratique, idsujet, idpratique)
activitesconseillers_sujets (idactivite, idsujet, travaille, note_conformite)
activitesconseillers_pratiques (idactivite, idpratique, travaille)

-- Phase 3: Coaching et jeu de rôle
roleplaydata (id, call_id, postit_id, note, type) -- note = PostIts FourZones
deroule_coaching (id, ouverture_*, ecoute_*, atout_*, levier_*, jeuderole_*)

-- Phase 4: Entraînement
exercices (idexercice, idpratique, nomexercice, description, nudges)
nudge (id, nudge1, nudge2, nudge3, nudge4, nudge5, nudge6)
custom_nudges (id, id_activite, id_pratique, custom_nudge1-6, custom_nudge1-6_date)
customnudges (idcustomnudge, idactivite, idnudgeoriginal, modifications)

-- Phase 5: Feedback et évaluation
avisexercicesnudges (idavis, avis, idpratique, userlike, typeavis)
motifs_afpa (id, callid, avancement_*, promotion_reseau, commentaire)
```

### Module 4: Whiteboard - Collaboration (Schema `whiteboard`)

```sql
-- Sessions collaboratives
shared_evaluation_sessions (
  id, coach_user_id, call_id, session_name,
  audio_position, session_mode, is_active,
  show_participant_tops, anonymous_mode,
  view_mode, current_word_index, highlight_*
)

-- Participants et PostIts collaboratifs
sessions (id, idavatar, nom, url, joined_at)
postits (id, content, x, y, color) -- PostIts whiteboard
participant_evaluations (
  id, session_id, call_id, audio_timestamp,
  assigned_sujet_id, assigned_pratique_id, comment
)

-- Système de sondages
survey_settings (id, question_open, question_closed, closed_options)
survey_responses (id, participant_id, survey_id, rating, feedback)
whiteboard_question (id, question)
current_view (id, view_name, updated_at)
```

### Module 5: Users/Auth (Schema `auth` + `public`)

```sql
-- Authentification Supabase (standard)
auth.users (id, email, encrypted_password, raw_user_meta_data)
auth.sessions (id, user_id, created_at, updated_at)
auth.identities (id, user_id, provider, identity_data)

-- Extension métier dans public
users (id, email, entreprise_id, refresh_token, zoho_refresh_token)
conseillers (idconseiller, nom, prenom, email, entreprise, idavatar, estanonyme)
user_roles (id, user_id, role)
user_enterprises (id, user_id, entreprise_id)
avatars (idavatar, nom, url, categorie, anonyme)
```

### Module 6: Storage (Schema `storage`)

```sql
-- Stockage fichiers Supabase (standard)
storage.buckets (id, name, public, allowed_mime_types)
storage.objects (id, bucket_id, name, owner, metadata)
```

## Les 3 types de PostIts distincts

### 1. PostIts d'évaluation (Module Evaluation - Phase 2)

```sql
-- Table: public.postit
-- Usage: Analyse et notation des appels
postit (
  id, callid, wordid, word, text, timestamp,
  sujet, pratique, idsujet, idpratique, iddomaine
)
```

### 2. PostIts FourZones (Module Evaluation - Phase 3)

```sql
-- Table: public.roleplaydata.note (JSONB)
-- Usage: Coaching et jeu de rôle
{
  "postits": [
    {
      "id": "uuid",
      "content": "text",
      "zone": "VOUS_AVEZ_FAIT|JE_FAIS|ENTREPRISE_FAIT|VOUS_FEREZ",
      "color": "#color",
      "isOriginal": boolean
    }
  ],
  "clientText": "string",
  "conseillerText": "string"
}
```

### 3. PostIts Whiteboard (Module Whiteboard)

```sql
-- Table: whiteboard.postits
-- Usage: Collaboration temps réel
postits (
  id, content, x, y, color,
  created_at, updated_at
)
```

## Relations clés entre modules

### Workflow d'évaluation

```
call → transcript → words → postit → roleplaydata → exercices
```

### Collaboration

```
auth.users → shared_evaluation_sessions → participant_evaluations
```

### Administration

```
entreprises → domaines → sujets ←→ pratiques (sujetspratiques)
```

### Utilisateurs complexes

```
auth.users ←→ public.users ←→ conseillers ←→ entreprises
```

## Optimisations par module recommandées

### Module Administration

- **Cache intelligent** des référentiels (domaines, sujets, pratiques)
- **Lazy loading** des configurations par entreprise
- **Optimistic updates** pour les modifications admin

### Module ZohoWorkdrive

- **Service Worker** pour le cache des fichiers audio
- **Streaming** pour les gros fichiers
- **Queue system** pour les imports en batch

### Module Evaluation

- **State machine** pour le workflow des 5 phases
- **Debouncing** pour les sauvegardes de PostIts
- **Virtualisation** pour les longues listes de transcriptions

### Module Whiteboard

- **WebSocket optimisé** avec conflit resolution
- **Event sourcing** pour la synchronisation
- **Throttling** des mises à jour de position

### Module Users/Auth

- **RLS (Row Level Security)** par entreprise
- **Session pooling** pour les performances
- **Cache distributed** des permissions

## Contraintes d'intégrité métier

```sql
-- Un appel ne peut avoir qu'une transcription
ALTER TABLE transcript ADD CONSTRAINT unique_call_transcript UNIQUE (callid);

-- Les activités sont liées à une entreprise via le conseiller
-- (Contraint par activitesconseillers.idconseiller → conseillers.entreprise)

-- Les sessions collaboratives nécessitent un appel et un coach
ALTER TABLE whiteboard.shared_evaluation_sessions
ADD CONSTRAINT require_call_and_coach
CHECK (call_id IS NOT NULL AND coach_user_id IS NOT NULL);

-- Les évaluations participatives doivent référencer des éléments valides
ALTER TABLE whiteboard.participant_evaluations
ADD CONSTRAINT valid_word_range
CHECK (word_start_id <= word_end_id);
```

## Politiques RLS par module

```sql
-- Module Administration: Admins seulement
CREATE POLICY "Admin only" ON domaines FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles ur
           WHERE ur.user_id = auth.uid()::int
           AND ur.role = 'admin')
);

-- Module Evaluation: Par entreprise du conseiller
CREATE POLICY "Company data only" ON call FOR ALL USING (
  callid IN (
    SELECT ec.callid FROM entreprise_call ec
    JOIN conseillers c ON c.entreprise = ec.identreprise
    WHERE c.email = auth.email()
  )
);

-- Module Whiteboard: Sessions partagées
CREATE POLICY "Session access" ON whiteboard.shared_evaluation_sessions
FOR SELECT USING (
  coach_user_id = auth.uid() OR
  id IN (SELECT session_id FROM whiteboard.participant_evaluations
         WHERE participant_session_id IN (
           SELECT id FROM whiteboard.sessions
           -- Logique d'accès participant
         ))
);
```

## Plan de migration et rationalisation

### Phase 1: Stabilisation des types (2 semaines)

1. **Audit des 3 types de PostIts** - Identifier tous les usages
2. **Création des types TypeScript clarifiés** par module
3. **Documentation des flux de données** entre modules

### Phase 2: Extraction modulaire (6 semaines)

1. **Séparation du module Administration** (2 semaines)
2. **Isolation du module Whiteboard** (2 semaines)
3. **Restructuration du module Evaluation** (2 semaines)

### Phase 3: Optimisations (4 semaines)

1. **Cache et performance** par module
2. **Tests de charge** sur les goulots identifiés
3. **Monitoring** et métriques en production

### Phase 4: Architecture avancée (optionnel)

1. **Event sourcing** pour la collaboration
2. **CQRS** pour séparer lecture/écriture
3. **Microservices** si nécessaire à l'échelle

---

_Architecture basée sur l'analyse complète des 4 schémas Supabase réels_
