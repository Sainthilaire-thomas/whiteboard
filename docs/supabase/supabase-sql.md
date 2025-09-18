# Description Exhaustive de la Base de Données - Plateforme de Coaching et Formation

## Vue d'ensemble

Cette base de données PostgreSQL supporte une plateforme de coaching et de formation axée sur l'analyse d'appels téléphoniques, l'évaluation de pratiques commerciales, et le développement de compétences. Elle utilise Supabase pour l'authentification et le stockage.

## Architecture générale

La base est organisée en 5 schémas principaux :

- **public** : Cœur métier (utilisateurs, activités, évaluations)
- **auth** : Authentification Supabase
- **storage** : Gestion des fichiers
- **cartographie** : Visualisation et analyse des parcours clients
- **whiteboard** : Sessions collaboratives et évaluations temps réel

---

## SCHÉMA PUBLIC - Cœur Métier

### Gestion des Entreprises et Utilisateurs

#### `entreprises`

Table centrale des organisations clientes

- `identreprise` : BIGINT, clé primaire auto-générée (IDENTITY)
- `created_at` : TIMESTAMP WITH TIME ZONE, date de création (défaut: now())
- `nomentreprise` : TEXT, nom de l'entreprise
- `logo` : TEXT, URL ou chemin du logo
- `domaine` : TEXT, domaine d'activité

#### `conseillers`

Profils des conseillers commerciaux évalués

- `idconseiller` : INTEGER, clé primaire auto-incrémentée
- `nom` : VARCHAR, nom de famille (NOT NULL)
- `prenom` : VARCHAR, prénom (NOT NULL)
- `email` : VARCHAR, adresse email (UNIQUE)
- `entreprise` : INTEGER, FK vers entreprises
- `pseudo` : TEXT, nom d'affichage
- `idavatar` : INTEGER, FK vers avatars pour personnalisation
- `estanonyme` : BOOLEAN, mode anonyme (défaut: false)

#### `users`

Utilisateurs système (intégration avec auth Supabase)

- `id` : INTEGER, clé primaire auto-incrémentée
- `email` : VARCHAR, identifiant unique (NOT NULL UNIQUE)
- `entreprise_id` : BIGINT, FK vers entreprises
- `created_at` : TIMESTAMP, date de création (défaut: now())
- `refresh_token` : TEXT, token de rafraîchissement
- `zoho_refresh_token` : TEXT, token d'intégration CRM Zoho

#### `avatars`

Avatars pour la personnalisation des profils

- `idavatar` : INTEGER, clé primaire auto-incrémentée
- `nom` : TEXT, nom de l'avatar (NOT NULL)
- `url` : TEXT, URL de l'image (NOT NULL)
- `categorie` : TEXT, catégorie d'avatar
- `anonyme` : BOOLEAN, avatar pour mode anonyme (défaut: false)
- `filename` : TEXT, nom du fichier source

#### Tables de liaison et gestion

- `user_enterprises` : Relations many-to-many utilisateurs/entreprises
  - `id` : INTEGER PK, `user_id` : INTEGER FK, `entreprise_id` : INTEGER FK
- `user_roles` : Système de rôles
  - `id` : INTEGER PK, `user_id` : INTEGER FK, `role` : VARCHAR (NOT NULL), `created_at` : TIMESTAMP
- `user_sessions` : Historique des connexions
  - `id` : INTEGER PK, `user_id` : TEXT (NOT NULL), `event_type` : TEXT (NOT NULL)
  - `event_timestamp` : TIMESTAMP (défaut: now()), `sign_out_at` : TIMESTAMP

### Référentiel Métier - Grilles d'Analyse Qualité

#### `domaines`

Domaines d'analyse qualité (grilles d'évaluation)

- `iddomaine` : INTEGER, clé primaire auto-incrémentée
- `nomdomaine` : TEXT, nom du domaine d'analyse (NOT NULL)
- `description` : TEXT, description détaillée du domaine

#### `sujets`

Critères d'évaluation dans chaque domaine d'analyse

- `idsujet` : INTEGER, clé primaire auto-incrémentée
- `iddomaine` : INTEGER, FK vers domaines (NOT NULL)
- `nomsujet` : TEXT, nom du critère d'évaluation (NOT NULL)
- `description` : TEXT, description détaillée
- `valeurnumérique` : INTEGER, poids dans l'évaluation (défaut: 1)
- `idcategoriesujet` : INTEGER, FK vers categoriessujets

#### `categoriessujets`

Catégorisation des sujets d'évaluation

- `idcategoriesujet` : INTEGER, clé primaire auto-incrémentée
- `nomcategorie` : VARCHAR, nom de la catégorie (NOT NULL)
- `couleur` : VARCHAR, code couleur pour l'interface (NOT NULL)
- `description` : TEXT, description de la catégorie

#### `pratiques`

Techniques et comportements commerciaux évalués

- `idpratique` : INTEGER, clé primaire auto-incrémentée
- `nompratique` : VARCHAR, nom de la pratique (NOT NULL)
- `description` : TEXT, description détaillée
- `valeurnumérique` : INTEGER, poids d'importance (défaut: 1)
- `idcategoriepratique` : INTEGER, FK vers categoriespratiques
- `fiche_conseiller_json` : JSONB, contenu pédagogique pour conseillers
- `fiche_coach_json` : JSONB, contenu pédagogique pour coachs
- `jeuderole` : JSONB, scénarios d'entraînement
- `geste` : TEXT, description comportementale

#### `categoriespratiques`

Catégorisation des pratiques commerciales

- `idcategoriepratique` : INTEGER, clé primaire auto-incrémentée
- `nomcategorie` : VARCHAR, nom de la catégorie (NOT NULL)
- `couleur` : VARCHAR, code couleur pour l'interface (NOT NULL)

#### `sujetspratiques`

Liaison entre sujets et pratiques avec pondération

- `idsujet` : INTEGER, FK vers sujets (PK composite)
- `idpratique` : INTEGER, FK vers pratiques (PK composite)
- `importance` : INTEGER, niveau d'importance de la liaison

#### `entreprise_domaines`

Domaines d'analyse assignés par entreprise

- `identreprise` : BIGINT, FK vers entreprises (PK composite)
- `iddomaine` : INTEGER, FK vers domaines (PK composite)

#### `entreprise_pratiques`

Pratiques personnalisées par entreprise

- `id` : INTEGER, clé primaire auto-incrémentée
- `identreprise` : BIGINT, FK vers entreprises (NOT NULL)
- `idpratique` : INTEGER, FK vers pratiques (NOT NULL)
- `fiche_conseiller_json` : JSONB, contenu personnalisé conseiller
- `fiche_coach_json` : JSONB, contenu personnalisé coach

### Activités et Exercices de Formation

#### `activitesconseillers`

Activités de formation et d'évaluation des conseillers

- `idactivite` : INTEGER, clé primaire auto-incrémentée
- `idconseiller` : INTEGER, FK vers conseillers (NOT NULL)
- `idsujet` : INTEGER, FK vers sujets
- `idpratique` : INTEGER, FK vers pratiques
- `idexercice` : INTEGER, FK vers exercices
- `dateactivite` : TIMESTAMP, date/heure de l'activité (défaut: CURRENT_TIMESTAMP, NOT NULL)
- `duree` : INTEGER, durée en minutes
- `customnudges_ids` : ARRAY, IDs des nudges personnalisés
- `statut` : TEXT, statut général de l'activité
- `commentaires` : TEXT, commentaires généraux
- `objectifs` : TEXT, objectifs définis
- `nature` : TEXT, nature de l'activité
- `sidebar_phase` : VARCHAR, phase du coaching (CHECK: 'selection', 'evaluation', 'coaching', 'suivi', 'feedback', 'admin')
- `sidebar_statut` : VARCHAR, statut sidebar (défaut: 'à faire', CHECK: 'à faire', 'en cours', 'réalisé')
- `sidebar_objectifs` : TEXT, objectifs spécifiques sidebar
- `sidebar_commentaires` : TEXT, commentaires sidebar
- `sidebar_date_modif` : TIMESTAMP WITH TIME ZONE, dernière modification (défaut: now())

#### `activitesconseillers_pratiques`

Pratiques travaillées par activité

- `idactivitepratique` : INTEGER, clé primaire auto-incrémentée
- `idactivite` : INTEGER, FK vers activitesconseillers (NOT NULL)
- `idpratique` : INTEGER, FK vers pratiques (NOT NULL)
- `travaille` : BOOLEAN, pratique effectivement travaillée (défaut: true, NOT NULL)

#### `activitesconseillers_sujets`

Sujets évalués par activité avec notes de conformité

- `idactivitesujet` : INTEGER, clé primaire auto-incrémentée
- `idactivite` : INTEGER, FK vers activitesconseillers (NOT NULL)
- `idsujet` : INTEGER, FK vers sujets (NOT NULL)
- `travaille` : BOOLEAN, sujet effectivement évalué (défaut: true, NOT NULL)
- `note_conformite` : TEXT, évaluation de conformité

#### `exercices`

Bibliothèque d'exercices pédagogiques

- `idexercice` : INTEGER, clé primaire auto-incrémentée
- `idpratique` : INTEGER, FK vers pratiques (NOT NULL)
- `nomexercice` : VARCHAR, nom de l'exercice (NOT NULL)
- `description` : TEXT, description détaillée
- `nudges` : JSONB, suggestions d'amélioration associées

#### `ponderation_sujets`

Barème de notation pour l'évaluation des sujets

- `id_ponderation` : INTEGER, clé primaire auto-incrémentée
- `idsujet` : INTEGER, FK vers sujets (UNIQUE)
- `conforme` : INTEGER, points pour "conforme" (défaut: 10, NOT NULL)
- `partiellement_conforme` : INTEGER, points pour "partiellement conforme" (défaut: 5, NOT NULL)
- `non_conforme` : INTEGER, points pour "non conforme" (défaut: 0, NOT NULL)
- `permet_partiellement_conforme` : BOOLEAN, autorise la note intermédiaire (défaut: true)

### Analyse d'Appels Téléphoniques

#### `call`

Enregistrements d'appels commerciaux

- `callid` : INTEGER, clé primaire auto-incrémentée
- `audiourl` : TEXT, URL du fichier audio
- `filename` : TEXT, nom du fichier audio
- `filepath` : TEXT, chemin du fichier
- `transcription` : JSONB, transcription complète de l'appel
- `description` : TEXT, description de l'appel
- `upload` : BOOLEAN, statut d'upload (défaut: false)
- `archived` : BOOLEAN, appel archivé
- `is_tagging_call` : BOOLEAN, marqué pour analyse de tags (défaut: false)
- `origine` : TEXT, origine de l'appel
- `preparedfortranscript` : BOOLEAN, préparé pour transcription (défaut: false)
- `status` : VARCHAR, statut de supervision (défaut: 'non_supervisé')
- `duree` : NUMERIC, durée de l'appel

#### `transcript`

Table de liaison pour la transcription

- `transcriptid` : INTEGER, clé primaire auto-incrémentée
- `callid` : INTEGER, FK vers call

#### `word`

Transcription détaillée mot par mot

- `wordid` : INTEGER, clé primaire auto-incrémentée
- `transcriptid` : INTEGER, FK vers transcript
- `startTime` : DOUBLE PRECISION, timestamp de début du mot
- `endTime` : DOUBLE PRECISION, timestamp de fin du mot
- `text` : TEXT, contenu textuel du mot
- `turn` : TEXT, numéro du tour de parole
- `type` : TEXT, type de contenu (mot, ponctuation, etc.)

#### `turntagged`

Analyse sémantique des séquences d'échange

- `id` : INTEGER, clé primaire auto-incrémentée
- `call_id` : INTEGER, FK vers call (NOT NULL)
- `start_time` : DOUBLE PRECISION, début du segment analysé (NOT NULL)
- `end_time` : DOUBLE PRECISION, fin du segment analysé (NOT NULL)
- `tag` : TEXT, catégorie d'analyse assignée (NOT NULL, FK vers lpltag)
- `verbatim` : TEXT, extrait textuel analysé (NOT NULL)
- `date` : TIMESTAMP, date d'analyse (défaut: now(), NOT NULL)
- `next_turn_tag` : TEXT, tag du tour suivant
- `next_turn_verbatim` : TEXT, verbatim du tour suivant
- `speaker` : TEXT, identification du locuteur
- `next_turn_tag_auto` : TEXT, tag automatique du tour suivant
- `score_auto` : NUMERIC, score de confiance automatique
- `annotations` : JSONB, métadonnées d'analyse (défaut: '[]', NOT NULL)

#### `callactivityrelation`

Liaison entre appels et activités de formation

- `callid` : INTEGER, FK vers call
- `activityid` : INTEGER, FK vers activitesconseillers

#### `entreprise_call`

Attribution des appels aux entreprises

- `identreprise` : INTEGER, FK vers entreprises (PK composite)
- `callid` : INTEGER, FK vers call (PK composite)

### Système de Tags et Classification

#### `lpltag`

Tags d'analyse conversationnelle spécialisés

- `id` : INTEGER, clé primaire auto-incrémentée
- `label` : TEXT, nom unique du tag (NOT NULL UNIQUE)
- `description` : TEXT, description du tag
- `family` : TEXT, famille de tags
- `color` : TEXT, couleur d'affichage (NOT NULL)
- `created_at` : TIMESTAMP, date de création (défaut: now())
- `icon` : TEXT, icône associée
- `originespeaker` : TEXT, origine du locuteur (CHECK: 'client' ou 'conseiller')

#### `tag`

Système de tags génériques

- `tagid` : INTEGER, clé primaire auto-incrémentée
- `name` : TEXT, nom du tag (NOT NULL)
- `description` : TEXT, description

#### `word_tag`

Association tags/mots avec score de confiance

- `wordid` : INTEGER, FK vers word (PK composite)
- `tagid` : INTEGER, FK vers tag (PK composite)
- `confidence` : DOUBLE PRECISION, score de confiance

#### `tag_history`

Historique des modifications de tags

- `id` : INTEGER, clé primaire auto-incrémentée
- `old_label` : TEXT, ancien libellé (NOT NULL)
- `new_label` : TEXT, nouveau libellé (NOT NULL)
- `updated_at` : TIMESTAMP, date de modification (défaut: now(), NOT NULL)

#### `tag_modifications`

Journal détaillé des modifications de tags

- `id` : INTEGER, clé primaire auto-incrémentée
- `action` : VARCHAR, type d'action
- `old_tag` : VARCHAR, ancien tag
- `new_tag` : VARCHAR, nouveau tag
- `modified_by` : VARCHAR, auteur de la modification
- `modified_at` : TIMESTAMP, date de modification (défaut: now())
- `previous_data` : JSONB, données précédentes

#### `postit`

Annotations temporelles précises sur les appels

- `id` : INTEGER, clé primaire auto-incrémentée
- `callid` : INTEGER, FK vers call (NOT NULL)
- `wordid` : INTEGER, FK vers word (NOT NULL)
- `word` : TEXT, mot annoté (NOT NULL)
- `text` : TEXT, contenu de l'annotation
- `timestamp` : DOUBLE PRECISION, position temporelle précise (NOT NULL)
- `created_at` : TIMESTAMP, date de création (défaut: now())
- `sujet` : TEXT, sujet associé
- `pratique` : TEXT, pratique associée
- `iddomaine` : INTEGER, FK vers domaines
- `idsujet` : INTEGER, FK vers sujets
- `idpratique` : INTEGER, FK vers pratiques

### Système de Nudges (Conseils d'Amélioration)

#### `nudge`

Conseils d'amélioration standardisés

- `id` : BIGINT, clé primaire auto-générée (IDENTITY)
- `created_at` : TIMESTAMP WITH TIME ZONE, date de création (défaut: now(), NOT NULL)
- `nudge1` à `nudge6` : TEXT, 6 emplacements pour conseils

#### `customnudges`

Personnalisation des nudges par activité

- `idcustomnudge` : INTEGER, clé primaire auto-incrémentée
- `idactivite` : INTEGER, FK vers activitesconseillers (NOT NULL)
- `idnudgeoriginal` : INTEGER, FK vers nudge (NOT NULL)
- `modifications` : JSONB, adaptations personnalisées (NOT NULL)

#### `custom_nudges`

Nudges entièrement personnalisés

- `id` : INTEGER, clé primaire auto-incrémentée
- `id_activite` : BIGINT, FK vers activité (UNIQUE)
- `custom_nudge1` à `custom_nudge6` : TEXT, 6 nudges personnalisés
- `custom_nudge1_date` à `custom_nudge6_date` : DATE, dates d'attribution
- `id_pratique` : BIGINT, pratique associée

#### `exercices_nudges`

Association exercices/nudges

- `idexercicenudge` : INTEGER, clé primaire auto-incrémentée
- `idexercice` : INTEGER, FK vers exercices (NOT NULL)
- `idnudge` : INTEGER, FK vers nudge (NOT NULL)

### Évaluations et Feedback

#### `avisexercicesnudges`

Retours et évaluations sur exercices et nudges

- `idavis` : INTEGER, clé primaire auto-incrémentée
- `avis` : TEXT, commentaire textuel
- `idpratique` : INTEGER, FK vers pratiques
- `userlike` : INTEGER, note de satisfaction (défaut: 4)
- `idexercice` : INTEGER, FK vers exercices
- `idnudge` : INTEGER, FK vers nudge
- `typeavis` : TEXT, catégorie de retour
- `idactivite` : INTEGER, FK vers activitesconseillers
- `nudgeindex` : INTEGER, position du nudge évalué

#### `quiz`

Système d'évaluation par questionnaires

- `quizid` : INTEGER, clé primaire auto-incrémentée
- `callid` : INTEGER, FK vers call
- `wordid` : INTEGER, FK vers word (moment précis de l'appel)
- `question` : TEXT, question posée
- `possibleanswers` : ARRAY, réponses possibles
- `correctanswerindexes` : ARRAY, index des bonnes réponses
- `answercomments` : ARRAY, commentaires par réponse
- `timestamp` : TIMESTAMP, moment de création
- `quizdata` : JSONB, données additionnelles

#### `quiz_responses`

Réponses aux quiz par les conseillers

- `responseid` : INTEGER, clé primaire auto-incrémentée
- `quizid` : INTEGER, FK vers quiz
- `conseillerid` : INTEGER, FK vers conseillers
- `answers` : ARRAY, réponses données
- `submitted_at` : TIMESTAMP, date de soumission (défaut: now())

#### `icon`

Éléments visuels associés aux mots et quiz

- `iconid` : INTEGER, clé primaire auto-incrémentée
- `wordid` : INTEGER, FK vers word (NOT NULL)
- `type` : TEXT, type d'icône
- `data` : JSONB, données de l'icône
- `quizid` : INTEGER, FK vers quiz

### Formation et Jeux de Rôle

#### `roleplaydata`

Données des simulations commerciales

- `id` : INTEGER, clé primaire auto-incrémentée
- `call_id` : INTEGER, FK vers call (NOT NULL)
- `postit_id` : INTEGER, FK vers postit (NOT NULL)
- `note` : JSONB, observations pédagogiques (NOT NULL)
- `type` : VARCHAR, type de simulation (défaut: 'standard')
- `created_at` : TIMESTAMP WITH TIME ZONE, date de création (défaut: now())

#### `deroule_coaching`

Structure type d'une session de coaching

- `id` : INTEGER, clé primaire auto-incrémentée
- `ouverture_titre` : TEXT, titre phase d'ouverture
- `ouverture_contenu` : TEXT, contenu phase d'ouverture
- `ecoute_appel_titre` : TEXT, titre phase d'écoute
- `ecoute_appel_contenu` : TEXT, contenu phase d'écoute
- `global_titre` : TEXT, titre analyse globale
- `global_contenu` : TEXT, contenu analyse globale
- `atout_titre` : TEXT, titre phase atouts
- `atout_contenu` : TEXT, contenu phase atouts
- `levier_titre` : TEXT, titre phase leviers
- `levier_contenu` : TEXT, contenu phase leviers
- `jeuderole_titre` : TEXT, titre jeu de rôle
- `jeuderole_contenu` : TEXT, contenu jeu de rôle
- `entrainement_titre` : TEXT, titre entraînement
- `entrainement_contenu` : TEXT, contenu entraînement

### Spécialisations AFPA

#### `motifs_afpa`

Suivi spécialisé formation professionnelle AFPA

- `id` : INTEGER, clé primaire auto-incrémentée
- `motifs` : TEXT, motifs de la formation (NOT NULL)
- `avancement_formation` : BOOLEAN, suivi formation (défaut: false, NOT NULL)
- `avancement_lieu` : BOOLEAN, suivi lieu (défaut: false, NOT NULL)
- `avancement_date` : BOOLEAN, suivi dates (défaut: false, NOT NULL)
- `avancement_financement` : BOOLEAN, suivi financement (défaut: false, NOT NULL)
- `promotion_reseau` : BOOLEAN, promotion du réseau (défaut: false, NOT NULL)
- `commentaire` : TEXT, commentaires additionnels
- `action_client` : TEXT, actions côté client
- `actif` : BOOLEAN, motif actif (défaut: true, NOT NULL)
- `callid` : INTEGER, FK vers call (UNIQUE)

### Logs et Monitoring

#### `logs`

Journal système pour debugging et monitoring

- `id` : INTEGER, clé primaire auto-incrémentée
- `timestamp` : TIMESTAMP WITH TIME ZONE, horodatage (défaut: now())
- `level` : TEXT, niveau de log
- `message` : TEXT, message de log
- `details` : JSONB, détails techniques

---

## SCHÉMA AUTH - Authentification Supabase

### Tables utilisateurs

#### `users`

- `id` : UUID, identifiant unique (PK)
- `email` : VARCHAR, adresse email
- `encrypted_password` : VARCHAR, mot de passe chiffré
- `email_confirmed_at`, `last_sign_in_at` : TIMESTAMP WITH TIME ZONE
- `raw_app_meta_data`, `raw_user_meta_data` : JSONB
- `phone` : TEXT, téléphone (UNIQUE)
- `is_super_admin`, `is_sso_user`, `is_anonymous` : BOOLEAN
- `created_at`, `updated_at`, `deleted_at` : TIMESTAMP WITH TIME ZONE

#### `sessions`

- `id` : UUID PK, `user_id` : UUID FK
- `created_at`, `updated_at`, `not_after`, `refreshed_at` : TIMESTAMP
- `factor_id` : UUID, `aal` : USER-DEFINED
- `user_agent` : TEXT, `ip` : INET, `tag` : TEXT

#### `identities`

- `id` : UUID PK, `user_id` : UUID FK
- `provider_id` : TEXT, `provider` : TEXT
- `identity_data` : JSONB (NOT NULL)
- `email` : TEXT (calculé depuis identity_data)
- `last_sign_in_at`, `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE

### Authentification multi-facteurs

#### `mfa_factors`

- `id` : UUID PK, `user_id` : UUID FK (NOT NULL)
- `friendly_name` : TEXT, `factor_type` : USER-DEFINED (NOT NULL)
- `status` : USER-DEFINED (NOT NULL)
- `secret` : TEXT, `phone` : TEXT
- `web_authn_credential` : JSONB, `web_authn_aaguid` : UUID
- `last_challenged_at` : TIMESTAMP WITH TIME ZONE (UNIQUE)

#### `mfa_challenges`

- `id` : UUID PK, `factor_id` : UUID FK (NOT NULL)
- `created_at` : TIMESTAMP WITH TIME ZONE (NOT NULL)
- `verified_at` : TIMESTAMP WITH TIME ZONE
- `ip_address` : INET (NOT NULL)
- `otp_code` : TEXT, `web_authn_session_data` : JSONB

#### `mfa_amr_claims`

- `id` : UUID PK, `session_id` : UUID FK (NOT NULL)
- `authentication_method` : TEXT (NOT NULL)
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (NOT NULL)

### Tokens et flux

#### `refresh_tokens`

- `id` : BIGINT PK, `token` : VARCHAR (UNIQUE)
- `user_id` : VARCHAR, `session_id` : UUID FK
- `revoked` : BOOLEAN, `parent` : VARCHAR
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE

#### `flow_state`

- `id` : UUID PK, `user_id` : UUID
- `auth_code` : TEXT (NOT NULL)
- `code_challenge_method` : USER-DEFINED (NOT NULL)
- `code_challenge` : TEXT (NOT NULL)
- `provider_type` : TEXT (NOT NULL)
- `provider_access_token`, `provider_refresh_token` : TEXT
- `authentication_method` : TEXT (NOT NULL)
- `auth_code_issued_at`, `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE

#### `one_time_tokens`

- `id` : UUID PK, `user_id` : UUID FK (NOT NULL)
- `token_type` : USER-DEFINED (NOT NULL)
- `token_hash` : TEXT (NOT NULL, CHECK length > 0)
- `relates_to` : TEXT (NOT NULL)
- `created_at`, `updated_at` : TIMESTAMP (NOT NULL, défaut: now())

### SSO et SAML

#### `sso_providers`

- `id` : UUID PK
- `resource_id` : TEXT (CHECK null ou length > 0)
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE
- `disabled` : BOOLEAN

#### `sso_domains`

- `id` : UUID PK, `sso_provider_id` : UUID FK (NOT NULL)
- `domain` : TEXT (NOT NULL, CHECK length > 0)
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE

#### `saml_providers`

- `id` : UUID PK, `sso_provider_id` : UUID FK (NOT NULL)
- `entity_id` : TEXT (NOT NULL UNIQUE, CHECK length > 0)
- `metadata_xml` : TEXT (NOT NULL, CHECK length > 0)
- `metadata_url` : TEXT (CHECK null ou length > 0)
- `attribute_mapping` : JSONB
- `name_id_format` : TEXT
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE

#### `saml_relay_states`

- `id` : UUID PK
- `sso_provider_id` : UUID FK (NOT NULL)
- `request_id` : TEXT (NOT NULL, CHECK length > 0)
- `for_email`, `redirect_to` : TEXT
- `flow_state_id` : UUID FK
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE

### Système

#### `instances`

- `id` : UUID PK, `uuid` : UUID
- `raw_base_config` : TEXT
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE

#### `audit_log_entries`

- `id` : UUID PK, `instance_id` : UUID
- `payload` : JSON
- `created_at` : TIMESTAMP WITH TIME ZONE
- `ip_address` : VARCHAR (NOT NULL, défaut: '')

#### `schema_migrations`

- `version` : VARCHAR PK

#### `oauth_clients`

- `id` : UUID PK
- `client_id` : TEXT (NOT NULL UNIQUE)
- `client_secret_hash` : TEXT (NOT NULL)
- `registration_type` : USER-DEFINED (NOT NULL)
- `redirect_uris`, `grant_types` : TEXT (NOT NULL)
- `client_name` : TEXT (CHECK length <= 1024)
- `client_uri` : TEXT (CHECK length <= 2048)
- `logo_uri` : TEXT (CHECK length <= 2048)
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (NOT NULL, défaut: now())
- `deleted_at` : TIMESTAMP WITH TIME ZONE

---

## SCHÉMA STORAGE - Gestion de Fichiers Supabase

#### `buckets`

Conteneurs de stockage

- `id` : TEXT PK, `name` : TEXT (NOT NULL)
- `owner` : UUID, `owner_id` : TEXT
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (défaut: now())
- `public` : BOOLEAN (défaut: false)
- `avif_autodetection` : BOOLEAN (défaut: false)
- `file_size_limit` : BIGINT
- `allowed_mime_types` : ARRAY
- `type` : USER-DEFINED (NOT NULL, défaut: 'STANDARD')

#### `objects`

Fichiers stockés

- `id` : UUID (PK, défaut: gen_random_uuid())
- `bucket_id` : TEXT FK vers buckets
- `name` : TEXT, `owner` : UUID, `owner_id` : TEXT
- `created_at`, `updated_at`, `last_accessed_at` : TIMESTAMP WITH TIME ZONE (défaut: now())
- `metadata`, `user_metadata` : JSONB
- `path_tokens` : ARRAY (défaut: string_to_array(name, '/'))
- `version` : TEXT, `level` : INTEGER

#### `prefixes`

Organisation hiérarchique des fichiers

- `bucket_id` : TEXT (NOT NULL, PK composite), FK vers buckets
- `name` : TEXT (NOT NULL, PK composite)
- `level` : INTEGER (NOT NULL, PK composite, défaut: storage.get_level(name))
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (défaut: now())

#### `s3_multipart_uploads`

Gestion des uploads multipart pour gros fichiers

- `id` : TEXT PK
- `in_progress_size` : BIGINT (NOT NULL, défaut: 0)
- `upload_signature` : TEXT (NOT NULL)
- `bucket_id` : TEXT (NOT NULL), FK vers buckets
- `key` : TEXT (NOT NULL), `version` : TEXT (NOT NULL)
- `owner_id` : TEXT
- `created_at` : TIMESTAMP WITH TIME ZONE (NOT NULL, défaut: now())
- `user_metadata` : JSONB

#### `s3_multipart_uploads_parts`

Parties des uploads multipart

- `id` : UUID (PK, défaut: gen_random_uuid())
- `upload_id` : TEXT (NOT NULL), FK vers s3_multipart_uploads
- `size` : BIGINT (NOT NULL, défaut: 0)
- `part_number` : INTEGER (NOT NULL)
- `bucket_id` : TEXT (NOT NULL), FK vers buckets
- `key` : TEXT (NOT NULL), `etag` : TEXT (NOT NULL)
- `owner_id` : TEXT, `version` : TEXT (NOT NULL)
- `created_at` : TIMESTAMP WITH TIME ZONE (NOT NULL, défaut: now())

#### `migrations`

Historique des migrations de schéma

- `id` : INTEGER PK
- `name` : VARCHAR (NOT NULL UNIQUE)
- `hash` : VARCHAR (NOT NULL)
- `executed_at` : TIMESTAMP (défaut: CURRENT_TIMESTAMP)

#### `buckets_analytics`

Analytics sur les buckets de stockage

- `id` : TEXT PK
- `type` : USER-DEFINED (NOT NULL, défaut: 'ANALYTICS')
- `format` : TEXT (NOT NULL, défaut: 'ICEBERG')
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (NOT NULL, défaut: now())

---

## SCHÉMA CARTOGRAPHIE - Visualisation des Parcours Clients

### Analyse des Appels et Parcours

#### `appels`

Cartographie des appels avec analyse du potentiel

- `id` : BIGINT PK
- `created_at` : TIMESTAMP WITH TIME ZONE (NOT NULL, défaut: now())
- `durée` : TIME WITHOUT TIME ZONE
- `globalIndex` : SMALLINT
- `tagid` : INTEGER (NOT NULL, auto-incrémenté depuis séquence)
- `conseiller1` : TEXT, identification du conseiller principal
- `appelant2` : TEXT, identification de l'appelant
- `tag` : TEXT, tag d'analyse
- `description` : TEXT, description de l'appel
- `potentiel de captation` : TEXT, évaluation du potentiel
- `appel` : TEXT, contenu de l'appel
- `irritants` : TEXT, points d'irritation identifiés
- `appelant1` : TEXT, autre appelant

#### `ficheaction`

Fiches d'amélioration par tag d'analyse

- `tagid` : INTEGER PK
- `tag` : TEXT, tag d'analyse
- `passeclient` : TEXT, comportement actuel du client
- `souhaitclient` : TEXT, attentes du client
- `moncomportement` : TEXT, comportement du conseiller
- `moyensdisposition` : TEXT, moyens disponibles
- `moyensappel` : TEXT, moyens utilisés pendant l'appel
- `etapecaptation` : TEXT, étapes de captation
- `description` : TEXT, description générale
- `pointa` : TEXT, point de départ
- `pointb` : TEXT, point d'arrivée
- `indexparcoursclient` : INTEGER, index dans le parcours
- `cheminclient` : TEXT, chemin suivi par le client
- `flops` : TEXT, échecs identifiés
- `entrainement` : TEXT, préconisations d'entraînement

### Système d'Axes d'Analyse

#### `axes`

Définition des axes d'analyse multi-dimensionnels

- `id` : BIGINT PK
- `name` : TEXT (NOT NULL), nom de l'axe

#### `axevalues`

Valeurs possibles pour chaque axe

- `id` : BIGINT PK
- `axe_id` : BIGINT FK vers axes
- `button` : TEXT (NOT NULL), libellé du bouton
- `colonne` : TEXT (NOT NULL), colonne associée
- `description` : TEXT, description de la valeur
- `color` : TEXT, couleur d'affichage

### Mind Mapping et Visualisation

#### `mindmapconversation_nodes`

Nœuds des cartes mentales conversationnelles

- `id` : UUID (PK, défaut: uuid_generate_v4())
- `type` : TEXT (NOT NULL), type de nœud
- `parent_id` : UUID FK vers mindmapconversation_nodes (parent)
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (défaut: now())
- `node_data` : JSONB, données du nœud
- `subflow_id` : UUID FK vers mindmapconversation_nodes (sous-flux)

#### `mindmapconversation_edges`

Liens entre nœuds de cartes mentales

- `id` : UUID (PK, défaut: uuid_generate_v4())
- `type` : TEXT (défaut: 'default')
- `edge_data` : JSONB, données du lien
- `source` : UUID, nœud source
- `target` : UUID, nœud cible

#### `groupnode_tags`

Tags associés aux nœuds groupés

- `id` : INTEGER (PK, auto-incrémenté)
- `groupnode_id` : UUID (NOT NULL), FK vers mindmapconversation_nodes
- `tag` : VARCHAR (NOT NULL), tag associé
- `created_at`, `updated_at` : TIMESTAMP (défaut: now())

#### `mindmapnodes`

Nœuds de mind map génériques (ancien système)

- `nodeid` : UUID PK
- `label` : TEXT (NOT NULL), libellé du nœud
- `position` : JSONB (NOT NULL), position x,y
- `type` : TEXT (NOT NULL), type de nœud

#### `mindmapedges`

Liens de mind map génériques (ancien système)

- `idedge` : UUID PK
- `source` : UUID (NOT NULL), nœud source
- `target` : UUID (NOT NULL), nœud cible
- `label` : TEXT, libellé du lien

### Flux de Tags et Parcours

#### `tagflow_nodes`

Nœuds de flux de tags avec métriques

- `id` : UUID (PK, défaut: gen_random_uuid())
- `tag` : TEXT (NOT NULL), tag d'analyse
- `position_x`, `position_y` : DOUBLE PRECISION (NOT NULL), position
- `frequency` : DOUBLE PRECISION, fréquence d'apparition
- `captation` : DOUBLE PRECISION, score de captation
- `index_parcours_client` : INTEGER, position dans le parcours
- `verbatims` : JSONB, extraits associés
- `created_at`, `updated_at` : TIMESTAMP (défaut: now())

#### `tagflow_nodes2`

Nœuds de flux de tags (nouvelle version)

- `id` : UUID (PK, défaut: uuid_generate_v4())
- `type` : TEXT (NOT NULL), type de nœud
- `parent_id` : UUID, parent
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (défaut: CURRENT_TIMESTAMP)
- `node_data` : JSONB, données du nœud
- `subflow_id` : UUID, sous-flux

### Données Globales et Post-its

#### `vueglobale`

Vue d'ensemble des parcours clients

- `id` : UUID PK
- `nodes` : JSONB (NOT NULL), nœuds de la vue
- `edges` : JSONB (NOT NULL), liens de la vue
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (NOT NULL)

#### `mindmap_data`

Données de mind map complètes

- `id` : UUID PK
- `nodes` : JSONB (NOT NULL), tous les nœuds
- `edges` : JSONB (NOT NULL), tous les liens
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (NOT NULL)

#### `postits`

Post-its collaboratifs pour annotation

- `id` : BIGINT PK
- `text` : TEXT (NOT NULL), contenu du post-it
- `top`, `left` : NUMERIC (NOT NULL), position absolue
- `is_editing` : BOOLEAN (NOT NULL), en mode édition
- `background_color` : TEXT (NOT NULL), couleur de fond
- `tagid` : BIGINT (NOT NULL), tag associé
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (NOT NULL)
- `tempo_id` : TEXT (NOT NULL), identifiant temporaire

#### `nodegroups`

Groupes de nœuds avec données

- `id` : BIGINT PK
- `data` : JSONB (NOT NULL), données du groupe
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (NOT NULL)
- `tag` : TEXT (NOT NULL), tag du groupe

---

## SCHÉMA WHITEBOARD - Sessions Collaboratives

### Sessions d'Évaluation Partagées

#### `shared_evaluation_sessions`

Sessions collaboratives coach/participants

- `id` : UUID (PK, défaut: uuid_generate_v4())
- `coach_user_id` : UUID FK vers auth.users (coach animateur)
- `call_id` : INTEGER FK vers public.call (appel analysé)
- `session_name` : VARCHAR, nom de la session
- `audio_position` : NUMERIC (défaut: 0), position audio actuelle
- `session_mode` : VARCHAR (défaut: 'paused'), mode de la session
- `is_active` : BOOLEAN (défaut: true), session active
- `show_participant_tops` : BOOLEAN (défaut: false), afficher les tops participants
- `show_tops_realtime` : BOOLEAN (défaut: false), tops en temps réel
- `anonymous_mode` : BOOLEAN (défaut: true), mode anonyme
- `created_at`, `updated_at` : TIMESTAMP (défaut: now())
- `view_mode` : VARCHAR (défaut: 'word'), mode de vue (mot/paragraphe)
- `current_word_index` : INTEGER (défaut: 0), index du mot current
- `current_paragraph_index` : INTEGER (défaut: 0), index du paragraphe
- `highlight_turn_one` : BOOLEAN (défaut: false), surligner tour 1
- `highlight_speakers` : BOOLEAN (défaut: true), surligner locuteurs

#### `participant_evaluations`

Évaluations individuelles des participants

- `id` : UUID (PK, défaut: uuid_generate_v4())
- `session_id` : UUID FK vers shared_evaluation_sessions
- `participant_session_id` : INTEGER FK vers sessions (participant)
- `call_id` : INTEGER FK vers public.call
- `audio_timestamp` : NUMERIC, position temporelle précise
- `transcription_segment` : TEXT, segment de transcription évalué
- `word_start_id` : INTEGER FK vers public.word (début)
- `word_end_id` : INTEGER FK vers public.word (fin)
- `comment` : TEXT, commentaire d'évaluation
- `assigned_sujet_id` : INTEGER FK vers public.sujets
- `assigned_pratique_id` : INTEGER FK vers public.pratiques
- `created_at` : TIMESTAMP (défaut: now())

#### `sessions`

Participants aux sessions collaboratives

- `id` : INTEGER (PK, auto-incrémenté)
- `idavatar` : INTEGER (NOT NULL), FK vers public.avatars
- `nom` : TEXT (NOT NULL), nom du participant
- `url` : TEXT (NOT NULL), URL de session
- `joined_at` : TIMESTAMP WITH TIME ZONE (défaut: now())

### Outils Collaboratifs

#### `postits`

Post-its virtuels pour collaboration

- `id` : UUID (PK, défaut: uuid_generate_v4())
- `content` : TEXT (NOT NULL), contenu du post-it
- `x`, `y` : DOUBLE PRECISION (NOT NULL, défaut: 0), position
- `color` : TEXT (NOT NULL, défaut: 'yellow'), couleur
- `created_at`, `updated_at` : TIMESTAMP WITH TIME ZONE (défaut: now())

#### `current_view`

État de la vue partagée

- `id` : INTEGER (PK, auto-incrémenté)
- `view_name` : TEXT (NOT NULL), nom de la vue actuelle
- `updated_at` : TIMESTAMP (défaut: now())

### Système d'Enquêtes

#### `survey_settings`

Configuration des enquêtes de satisfaction

- `id` : INTEGER (PK, auto-incrémenté)
- `question_open` : TEXT (NOT NULL), question ouverte
- `question_closed` : TEXT, question fermée
- `closed_options` : JSONB, options de réponse fermée
- `created_at`, `updated_at` : TIMESTAMP (défaut: now())
- `email` : TEXT, contact associé

#### `survey_responses`

Réponses aux enquêtes

- `id` : INTEGER (PK, auto-incrémenté)
- `participant_id` : UUID FK vers auth.users
- `survey_id` : INTEGER FK vers survey_settings
- `rating` : INTEGER (CHECK: >= 1 AND <= 5), note de 1 à 5
- `feedback` : TEXT, commentaire libre
- `closed_answer` : TEXT, réponse fermée
- `created_at` : TIMESTAMP (défaut: now())
- `email` : TEXT, email du répondant

#### `whiteboard_question`

Questions pour le tableau collaboratif

- `id` : INTEGER (PK, auto-incrémenté)
- `question` : TEXT (NOT NULL), question posée

---

## Points Techniques Importants

### Types de données spécialisés

- **JSONB** : Métadonnées flexibles, configurations, transcriptions, données de nœuds
- **ARRAY** : Listes (tags, réponses quiz, options, mime types autorisés)
- **DOUBLE PRECISION** : Timestamps audio précis, positions graphiques
- **UUID** : Identifiants pour éléments collaboratifs et auth Supabase
- **USER-DEFINED** : Types énumérés Supabase (factor_type, aal, etc.)
- **INET** : Adresses IP pour audit et sécurité
- **NUMERIC** : Scores, durées, positions audio précises

### Contraintes métier importantes

- **CHECK constraints** : Validation des énumérations (sidebar_phase, sidebar_statut, originespeaker)
- **UNIQUE constraints** : Email utilisateurs, labels tags, tokens
- **NOT NULL** : Champs obligatoires métier
- **DEFAULT values** : Valeurs par défaut fonctionnelles (timestamps, booleans, statuts)

### Relations clés

- **Cascade implicit** : Relations auth Supabase
- **Foreign Keys strictes** : Intégrité référentielle maintenue
- **Composite Primary Keys** : Tables de liaison many-to-many
- **Self-references** : Hiérarchies (mindmap nodes, user enterprises)

### Performance et évolutivité

- **Sequences auto-incrémentées** : IDs entiers pour tables principales
- **UUID** : Distribution et réplication pour éléments collaboratifs
- **JSONB indexing** : Requêtes efficaces sur métadonnées
- **Timestamp indexing** : Tri chronologique optimisé
- **Partitioning ready** : Architecture compatible partitionnement par entreprise

### Sécurité

- **Row Level Security** : Prêt pour RLS Supabase
- **Audit trail** : Logs complets, historiques de modifications
- **Token management** : Refresh tokens, one-time tokens
- **MFA support** : Authentification multi-facteurs complète

Cette base supporte un écosystème complet de formation commerciale avec analyse comportementale fine, coaching personnalisé collaboratif, et évolutivité enterprise.
