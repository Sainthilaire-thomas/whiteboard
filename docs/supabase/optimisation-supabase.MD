## Problèmes de performance identifiés

### 1. **Tables volumineuses sans partitioning**

sql

```sql
-- Tables critiques qui vont exploser en volume
public.word -- Millions de lignes (mots de transcription)
public.postit -- Centaines de milliers de lignes
public.turntagged -- Données de tagging volumineuses
whiteboard.participant_evaluations -- Sessions collaboratives
```

**Optimisation recommandée :**

sql

```sql
-- Partitioning par date pour les tables volumineuses
CREATETABLEpublic.word_2024 PARTITIONOFpublic.word
FORVALUESFROM('2024-01-01')TO('2025-01-01');

-- Partitioning par entreprise pour isoler les données
CREATETABLEpublic.postit_entreprise_1 PARTITIONOFpublic.postit
FORVALUESIN(1,2,3);
```

### 2. **Indexes manquants critiques**

sql

```sql
-- Indexes manquants pour les requêtes fréquentes
CREATEINDEX CONCURRENTLY idx_word_transcript_time ONpublic.word(transcriptid, starttime);
CREATEINDEX CONCURRENTLY idx_postit_call_timestamp ONpublic.postit(callid,timestamp);
CREATEINDEX CONCURRENTLY idx_activitesconseillers_sidebar ONpublic.activitesconseillers(sidebar_phase, sidebar_statut);
CREATEINDEX CONCURRENTLY idx_shared_sessions_active_coach ON whiteboard.shared_evaluation_sessions(is_active, coach_user_id);

-- Index composite pour les jointures complexes
CREATEINDEX CONCURRENTLY idx_participant_eval_session_call ON whiteboard.participant_evaluations(session_id, call_id, audio_timestamp);
```

### 3. **Dénormalisation stratégique**

sql

```sql
-- Ajouter des champs calculés pour éviter les jointures coûteuses
ALTERTABLEpublic.callADDCOLUMN word_count INTEGER;
ALTERTABLEpublic.callADDCOLUMN duration_seconds NUMERIC;
ALTERTABLEpublic.postit ADDCOLUMN entreprise_id INTEGER;-- Éviter JOIN via callid

-- Materialized view pour les statistiques fréquentes
CREATE MATERIALIZED VIEW mv_entreprise_stats AS
SELECT
  e.identreprise,
COUNT(c.callid)as total_calls,
COUNT(p.id)as total_postits,
AVG(CASEWHEN p.idsujet ISNOTNULLTHEN1ELSE0END)as completion_rate
FROM entreprises e
LEFTJOIN entreprise_call ec ON e.identreprise = ec.identreprise
LEFTJOINcall c ON ec.callid = c.callid
LEFTJOIN postit p ON c.callid = p.callid
GROUPBY e.identreprise;

-- Rafraîchissement automatique
CREATEORREPLACEFUNCTION refresh_entreprise_stats()
RETURNSTRIGGERAS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_entreprise_stats;
RETURNNULL;
END;
$$ LANGUAGE plpgsql;
```

### 4. **Problèmes de normalisation**

**Sur-normalisation problématique :**

sql

```sql
-- Trop de tables pour les nudges (4 tables différentes!)
public.nudge,public.nudges,public.custom_nudges,public.customnudges

-- Simplification recommandée
CREATETABLEpublic.nudges_unified (
  id SERIALPRIMARYKEY,
typeVARCHAR(20)NOTNULL,-- 'template', 'custom', 'override'
  source_id INTEGER,-- Référence selon le type
  activite_id INTEGERREFERENCES activitesconseillers(idactivite),
  pratique_id INTEGERREFERENCES pratiques(idpratique),
  content JSONB NOTNULL,-- Contenu flexible
  scheduled_dates JSONB,-- Dates de planification
  created_at TIMESTAMPDEFAULTNOW()
);
```

**Sous-normalisation problématique :**

sql

```sql
-- Données dupliquées dans postit
ALTERTABLEpublic.postit DROPCOLUMN sujet;-- Redondant avec idsujet
ALTERTABLEpublic.postit DROPCOLUMN pratique;-- Redondant avec idpratique
```

### 5. **Contraintes manquantes**

sql

```sql
-- Contraintes métier importantes
ALTERTABLEpublic.activitesconseillers
ADDCONSTRAINT valid_sidebar_progression
CHECK(
(sidebar_phase ='selection'AND sidebar_statut IN('à faire','en cours','réalisé'))OR
(sidebar_phase ='evaluation'AND sidebar_statut IN('à faire','en cours','réalisé'))
);

-- Contrainte d'unicité manquante
ALTERTABLEpublic.ponderation_sujets
ADDCONSTRAINT unique_sujet_ponderation UNIQUE(idsujet);

-- Contraintes de cohérence temporelle
ALTERTABLE whiteboard.participant_evaluations
ADDCONSTRAINT valid_audio_position
CHECK(audio_timestamp >=0);
```

## Optimisations par charge de travail

### **Charge de lecture (90% des requêtes)**

sql

```sql
-- Connection pooling optimisé
ALTER SYSTEM SET max_connections =200;
ALTER SYSTEM SET shared_buffers ='256MB';

-- Cache des requêtes fréquentes
CREATE EXTENSION IFNOTEXISTS pg_stat_statements;

-- Réplication read-only pour les rapports
-- (Configuration Supabase Pro nécessaire)
```

### **Charge d'écriture (PostIts en temps réel)**

sql

```sql
-- Optimisation pour les insertions fréquentes
ALTERTABLEpublic.postit SET(fillfactor=90);-- Laisse de l'espace pour updates
ALTERTABLE whiteboard.postits SET(fillfactor=85);

-- Batch processing pour les imports Zoho
CREATEORREPLACEFUNCTION bulk_insert_words(word_data JSONB[])
RETURNSINTEGERAS $$
DECLARE
  inserted_count INTEGER;
BEGIN
INSERTINTOpublic.word (transcriptid,text, starttime, endtime, turn)
SELECT
(wd->>'transcriptid')::INTEGER,
    wd->>'text',
(wd->>'starttime')::NUMERIC,
(wd->>'endtime')::NUMERIC,
    wd->>'turn'
FROM unnest(word_data) wd;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;
```

### **Requêtes complexes optimisées**

sql

```sql
-- Vue optimisée pour le dashboard d'évaluation
CREATEVIEW v_evaluation_dashboard AS
SELECT
  ac.idactivite,
  ac.idconseiller,
  c.nom,
COUNT(p.id)as nb_postits,
COUNT(DISTINCT p.idsujet)as nb_sujets_abordes,
  ac.sidebar_phase,
  ac.sidebar_statut,
CASE
WHENCOUNT(p.id)>10THEN'Riche'
WHENCOUNT(p.id)>5THEN'Moyen'
ELSE'Faible'
ENDas richesse_evaluation
FROM activitesconseillers ac
JOIN conseillers c ON ac.idconseiller = c.idconseiller
JOIN callactivityrelation car ON ac.idactivite = car.activityid
LEFTJOIN postit p ON car.callid = p.callid
WHERE ac.nature ='evaluation'
GROUPBY ac.idactivite, ac.idconseiller, c.nom, ac.sidebar_phase, ac.sidebar_statut;
```

## Monitoring et maintenance

### **Surveillance des performances**

sql

```sql
-- Query pour identifier les requêtes lentes
SELECT
  query,
  calls,
  total_time,
  mean_time,
rows
FROM pg_stat_statements
WHERE mean_time >100-- Plus de 100ms
ORDERBY total_time DESC;

-- Surveillance de la croissance des tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))as size,
  pg_total_relation_size(schemaname||'.'||tablename)as bytes
FROM pg_tables
WHERE schemaname IN('public','whiteboard')
ORDERBY bytes DESC;
```

### **Maintenance automatique**

sql

```sql
-- Archivage automatique des anciennes données
CREATEORREPLACEFUNCTION archive_old_sessions()
RETURNSINTEGERAS $$
DECLARE
  archived_count INTEGER;
BEGIN
-- Archiver les sessions de plus de 6 mois
WITH archived AS(
DELETEFROM whiteboard.shared_evaluation_sessions
WHERE created_at <NOW()-INTERVAL'6 months'
AND is_active =false
RETURNING*
)
INSERTINTO whiteboard.archived_sessions SELECT*FROM archived;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Planification avec pg_cron (si disponible)
SELECT cron.schedule('archive-sessions','0 2 * * 0','SELECT archive_old_sessions();');
```

## Recommandations prioritaires

**Phase 1 (Critique - 2 semaines) :**

1. Ajouter les indexes manquants sur `word` et `postit`
2. Contraintes d'unicité sur `ponderation_sujets`
3. Monitoring des requêtes lentes

**Phase 2 (Important - 4 semaines) :**

1. Dénormalisation stratégique (champs calculés)
2. Materialized views pour les statistiques
3. Unification des tables nudges

**Phase 3 (Performance - 6 semaines) :**

1. Partitioning des tables volumineuses
2. Archivage automatique
3. Optimisation des requêtes complexes

Ces optimisations devraient significativement améliorer les performances sans casser l'existant.
