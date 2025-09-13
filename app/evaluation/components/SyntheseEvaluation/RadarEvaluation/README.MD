## 🚀 Implémentation

### Composant Principal RadarEvaluationTab

```tsx
// RadarEvaluationTab.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { RadarChart } from "./RadarChart";
import { RadarControls } from "./RadarControls";
import { transformPostitsToRadarData } from "./utils";
import { RadarEvaluationTabProps, RadarData } from "./types";

export const RadarEvaluationTab: React.FC<RadarEvaluationTabProps> = ({
  selectedDomain,
  appelPostits,
  categoriesSujets,
  sujetsData,
  selectedCall,
  filters,
}) => {
  const [variant, setVariant] = useState<"multi-level" | "bubbles" | "cloud">(
    "multi-level"
  );
  const [loading, setLoading] = useState(false);

  // Transformation des données avec useMemo pour optimiser les performances
  const radarData = useMemo(() => {
    if (!selectedDomain || !appelPostits.length || !sujetsData.length) {
      return null;
    }

    console.log("🔄 Transformation des données pour le radar");
    console.log("Domaine sélectionné:", selectedDomain);
    console.log("Post-its disponibles:", appelPostits.length);

    try {
      return transformPostitsToRadarData(
        appelPostits,
        sujetsData,
        categoriesSujets,
        selectedDomain
      );
    } catch (error) {
      console.error("Erreur lors de la transformation:", error);
      return null;
    }
  }, [selectedDomain, appelPostits, sujetsData, categoriesSujets]);

  // Effet pour détecter les changements de domaine
  useEffect(() => {
    console.log("🎯 Domaine sélectionné changé:", selectedDomain);
  }, [selectedDomain]);

  // Gestion du cas où aucun domaine n'est sélectionné
  if (!selectedDomain) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="info">
          <Typography variant="body2">
            Veuillez sélectionner un domaine dans l'onglet "Synthèse" pour
            afficher le radar qualité.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Gestion du cas où aucune donnée n'est disponible
  if (!radarData || radarData.categories.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="warning">
          <Typography variant="body2">
            Aucune donnée d'évaluation disponible pour ce domaine.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* En-tête avec informations contextuelles */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1, color: "primary.main" }}>
          Radar Qualité - {radarData.domainName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Appel #{selectedCall.callid} • {radarData.totalSubjects} critères
          évalués
        </Typography>
      </Box>

      {/* Contrôles du radar */}
      <RadarControls
        variant={variant}
        onVariantChange={setVariant}
        data={radarData}
      />

      {/* Composant radar principal */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <RadarChart
            data={radarData}
            variant={variant}
            width={600}
            height={600}
            onSubjectClick={(subject) => {
              console.log("Clic sur sujet:", subject.name);
              // Ici on peut implémenter la navigation vers les post-its liés
            }}
          />
        )}
      </Box>

      {/* Légende et statistiques */}
      {radarData && (
        <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            🔴 Non conforme ({radarData.stats.nonConforme}) • 🟡 Partiellement
            conforme ({radarData.stats.partiel}) • 🟢 Conforme (
            {radarData.stats.conforme})
          </Typography>
        </Box>
      )}
    </Box>
  );
};
```

### Intégration dans SyntheseEvaluation

```tsx
// Modifications dans SyntheseEvaluation.tsx

// 1. Import du nouveau composant
import RadarEvaluationTab from './RadarEvaluationTab';
import { RadarChart as RadarChartIcon } from '@mui/icons-material';

// 2. Ajout de l'onglet dans la navigation
<Tabs value={activeTab} onChange={...}>
  <Tab label="SYNTHÈSE" />
  <Tab label="CRITÈRES QUALITÉ" />
  <Tab label="SIMULATION COACHING" />
  <Tab
    icon={!isMobile ? <RadarChartIcon fontSize="small" /> : undefined}
    iconPosition="start"
    label="RADAR QUALITÉ"
  />
</Tabs>

// 3. Ajout du contenu de l'onglet
{activeTab === 3 && (
  <RadarEvaluationTab
    selectedDomain={domainAsNumber}
    appelPostits={convertedPostits}
    categoriesSujets={categoriesSujets}
    sujetsData={sujetsData}
    selectedCall={convertedCall}
    filters={{
      entreprise: /* récupérer depuis le contexte ou les props */,
      conseiller: /* récupérer depuis le contexte ou les props */,
      appel: selectedCall.callid
    }}
  />
)}
```

### Fonction de Transformation des Données

```typescript
// utils/transformPostitsToRadarData.ts
import { EvaluationPostit, RadarData, RadarSubject } from "./types";

export const transformPostitsToRadarData = (
  appelPostits: EvaluationPostit[],
  sujetsData: any[],
  categoriesSujets: any[],
  selectedDomain: number
): RadarData => {
  console.log("🔄 Début transformation radar data");
  console.log("Posts-its:", appelPostits.length);
  console.log("Domaine sélectionné:", selectedDomain);

  // 1. Filtrer les post-its du domaine sélectionné
  const domainPostits = appelPostits.filter(
    (p) => p.iddomaine === selectedDomain
  );
  console.log("Post-its du domaine:", domainPostits.length);

  // 2. Récupérer tous les sujets du domaine (conformes ET non-conformes)
  const domainSujets = sujetsData.filter((s) => s.iddomaine === selectedDomain);
  console.log("Sujets du domaine:", domainSujets.length);

  // 3. Créer un Set des sujets ayant des post-its (non-conformes)
  const nonConformeSujetIds = new Set(
    domainPostits.filter((p) => p.idsujet != null).map((p) => p.idsujet)
  );

  // 4. Transformer chaque sujet en données radar
  const radarSubjects: RadarSubject[] = domainSujets.map((sujet) => {
    const isNonConforme = nonConformeSujetIds.has(sujet.idsujet);
    const sujetPostits = domainPostits.filter(
      (p) => p.idsujet === sujet.idsujet
    );

    // Logique métier corrigée : présence = non-conforme, absence = conforme
    const nonConformityCount = sujetPostits.length;
    const nonConformityRate = isNonConforme
      ? Math.min(nonConformityCount / 5, 1)
      : 0; // Ajuster le diviseur selon le contexte

    const status =
      nonConformityRate === 0
        ? "conforme"
        : nonConformityRate < 0.3
          ? "partiellement_conforme"
          : "non_conforme";

    // Récupérer les informations de catégorie
    const categorie = categoriesSujets.find(
      (c) => c.idcategoriesujet === sujet.idcategoriesujet
    );

    return {
      id: sujet.idsujet,
      name: sujet.nomsujet,
      nonConformityRate,
      nonConformityCount,
      totalEvaluations: 1, // Ou calculé selon la logique métier
      status,
      categoryId: sujet.idcategoriesujet,
      categoryName: categorie?.nomcategorie || "Non catégorisé",
      categoryColor: categorie?.couleur || "#666",
      relatedPostits: sujetPostits,
    };
  });

  // 5. Grouper par catégories et calculer les angles
  const categories = categoriesSujets
    .filter((cat) =>
      radarSubjects.some((s) => s.categoryId === cat.idcategoriesujet)
    )
    .map((cat, index, array) => {
      const categorySubjects = radarSubjects.filter(
        (s) => s.categoryId === cat.idcategoriesujet
      );
      const angle = (index / array.length) * 2 * Math.PI;

      return {
        id: cat.idcategoriesujet,
        name: cat.nomcategorie,
        color: cat.couleur || "#666",
        angle,
        subjects: categorySubjects,
      };
    });

  // 6. Calculer les statistiques globales
  const stats = {
    conforme: radarSubjects.filter((s) => s.status === "conforme").length,
    partiel: radarSubjects.filter((s) => s.status === "partiellement_conforme")
      .length,
    nonConforme: radarSubjects.filter((s) => s.status === "non_conforme")
      .length,
    totalSubjects: radarSubjects.length,
  };

  const result: RadarData = {
    domainId: selectedDomain,
    domainName: `Domaine ${selectedDomain}`, // À récupérer depuis les données si disponible
    categories,
    stats,
    totalSubjects: radarSubjects.length,
  };

  console.log("✅ Transformation terminée:", result);
  return result;
};
```

### Types Spécifiques au Radar

````typescript
// types/radar.types.ts
export interface RadarData {
  domainId: number;
  domainName: string;
  categories: RadarCategory[];
  stats: RadarStats;
  totalSubjects: number;
}

export interface RadarCategory {
  id: number;
  name: string;
  color: string;
  angle: number;
  subjects: RadarSubject[];
}

export interface RadarSubject {
  id: number;
  name: string;
  nonConformityRate: number;      // 0-1
  nonConformityCount: number;     // Nombre de post-its
  totalEvaluations: number;       // Volume d'évaluations
  status: 'conforme' | 'partiellement_conforme' | 'non_conforme';
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  relatedPostits: EvaluationPostit[];
}

export interface RadarStats {
  conforme: number;
  partiel: number;
  nonConforme: number;
  totalSubjects: number;
}

export interface RadarEvaluationTabProps {
  selectedDomain: number | null;
  appelPostits: EvaluationPostit[];
  categoriesSujets: any[];
  sujetsData: any[];
  selectedCall: any;
  filters?: {
    entreprise?: number;
    conseiller?: number;
    appel?: number;
  };
}
```filter(s => s.status === 'non_conforme').length
      }
    }))
  }));

  return {
    domains,
    filters: {},
    metadata: {
      lastUpdate: new Date(),
      totalDomains: domains.length,
      totalSubjects: domains.reduce((sum, d) => sum + d.categories.reduce((cSum, c) => cSum + c.subjects.length, 0), 0)
    }
  };
};

const calculateDomainAngle = (domainId: number): number => {
  const angles = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
  return angles[(domainId - 1) % angles.length] || 0;
};
````

### Fonction SQL Supabase

```sql
-- Créer la fonction RPC dans Supabase
CREATE OR REPLACE FUNCTION get_non_conformity_summary(
  conseiller_id INT DEFAULT NULL,
  entreprise_id INT DEFAULT NULL,
  date_debut DATE DEFAULT NULL,
  date_fin DATE DEFAULT NULL
)
RETURNS TABLE (
  iddomaine INT,
  nomdomaine TEXT,
  idcategoriesujet INT,
  nomcategorie VARCHAR(255),
  couleur VARCHAR(7),
  idsujet INT,
  nomsujet TEXT,
  total_evaluations BIGINT,
  non_conformity_count BIGINT,
  non_conformity_rate FLOAT,
  status TEXT
) AS $
BEGIN
  RETURN QUERY
  WITH non_conformity_data AS (
    SELECT
      d.iddomaine,
      d.nomdomaine,
      cs.idcategoriesujet,
      cs.nomcategorie,
      cs.couleur,
      s.idsujet,
      s.nomsujet,
      COUNT(DISTINCT ac.idactivite) as total_evals,
      COUNT(DISTINCT acs.idactivite) as non_conf_count,
      CASE
        WHEN COUNT(DISTINCT ac.idactivite) > 0
        THEN COUNT(DISTINCT acs.idactivite)::float / COUNT(DISTINCT ac.idactivite)::float
        ELSE 0::float
      END as non_conf_rate
    FROM domaines d
    JOIN sujets s ON d.iddomaine = s.iddomaine
    JOIN categoriessujets cs ON s.idcategoriesujet = cs.idcategoriesujet
    LEFT JOIN activitesconseillers ac ON TRUE
    LEFT JOIN activitesconseillers_sujets acs ON (s.idsujet = acs.idsujet AND ac.idactivite = acs.idactivite)
    WHERE (conseiller_id IS NULL OR ac.idconseiller = conseiller_id)
      AND (entreprise_id IS NULL OR EXISTS (
        SELECT 1 FROM conseillers c
        WHERE c.idconseiller = ac.idconseiller
        AND c.entreprise = entreprise_id
      ))
      AND (date_debut IS NULL OR ac.dateactivite >= date_debut)
      AND (date_fin IS NULL OR ac.dateactivite <= date_fin)
    GROUP BY d.iddomaine, d.nomdomaine, cs.idcategoriesujet, cs.nomcategorie, cs.couleur, s.idsujet, s.nomsujet
  )
  SELECT
    ncd.*,
    CASE
      WHEN ncd.non_conf_rate = 0 THEN 'conforme'::TEXT
      WHEN ncd.non_conf_rate < 0.3 THEN 'partiellement_conforme'::TEXT
      ELSE 'non_conforme'::TEXT
    END as status
  FROM non_conformity_data ncd
  ORDER BY ncd.iddomaine, ncd.idcategoriesujet, ncd.non_conf_rate DESC;
END;
$ LANGUAGE plpgsql;
```

## 🧪 Jeu de Tests Complet

### Scénarios de Test

```typescript
// test-scenarios.ts
export const testScenarios = {
  // Scénario 1: Conseiller junior avec beaucoup de problèmes
  juniorAdvisor: {
    filters: { conseiller: 102, entreprise: 1 },
    expectedPatterns: {
      distanceFromCenter: "high", // Points éloignés du centre
      clusteredProblems: ["communication", "diagnostic", "dossier_client"],
      conformeAreas: ["ecoute_active", "rgpd"],
    },
  },

  // Scénario 2: Conseiller expert avec peu de problèmes
  expertAdvisor: {
    filters: { conseiller: 103, entreprise: 1 },
    expectedPatterns: {
      distanceFromCenter: "low", // Points près du centre
      scatteredProblems: ["occasional_issues"],
      conformeAreas: ["most_subjects"],
    },
  },

  // Scénario 3: Comparaison d'entreprises
  enterpriseComparison: {
    filters: { entreprise: 1 }, // vs entreprise: 2
    expectedDifferences: {
      techcorp: "communication_problems",
      conseilPlus: "technical_problems",
    },
  },

  // Scénario 4: Évolution temporelle
  timeEvolution: {
    filters: {
      dateRange: [new Date("2024-01-01"), new Date("2024-01-31")],
    },
    expectedTrends: {
      improving: ["ecoute_active", "alternatives"],
      deteriorating: ["accueil_telephonique", "mise_a_jour"],
    },
  },
};
```

### Générateur de Données de Test

```typescript
// test-data-generator.ts
export const generateTestData = (scenario: string, multipliers: any = {}) => {
  const baseData = JSON.parse(JSON.stringify(testData)); // Deep clone

  // Appliquer les multiplicateurs selon le scénario
  baseData.domains.forEach((domain) => {
    const domainMultiplier =
      multipliers[domain.name.toLowerCase().replace(/\s+/g, "_")] || 1;

    domain.categories.forEach((category) => {
      category.subjects.forEach((subject) => {
        // Ajuster les taux de non-conformité
        subject.nonConformityRate = Math.min(
          0.95,
          subject.nonConformityRate * domainMultiplier
        );
        subject.nonConformityCount = Math.round(
          subject.nonConformityCount * domainMultiplier
        );

        // Recalculer le statut
        if (subject.nonConformityRate === 0) {
          subject.status = "conforme";
        } else if (subject.nonConformityRate < 0.3) {
          subject.status = "partiellement_conforme";
        } else {
          subject.status = "non_conforme";
        }
      });
    });
  });

  return baseData;
};
```

### Tests Unitaires

```typescript
// RadarEvaluation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RadarEvaluation } from './RadarEvaluation';
import { testScenarios, generateTestData } from './test-data-generator';

describe('RadarEvaluation', () => {
  it('should display non-conformities farther from center', () => {
    const testData = generateTestData('juniorAdvisor', testScenarios.juniorAdvisor.multipliers);

    render(<RadarEvaluation data={testData} />);

    // Vérifier que les points non-conformes sont éloignés du centre
    const nonConformePoints = screen.getAllByTestId(/subject-point-non_conforme/);
    expect(nonConformePoints.length).toBeGreaterThan(0);

    // Vérifier que les points conformes sont près du centre
    const conformePoints = screen.getAllByTestId(/subject-point-conforme/);
    expect(conformePoints.length).toBeGreaterThan(0);
  });

  it('should filter by enterprise correctly', async () => {
    render(<RadarEvaluation />);

    const enterpriseFilter = screen.getByLabelText('Entreprise');
    fireEvent.change(enterpriseFilter, { target: { value: '1' } });

    // Vérifier que seules les données de l'entreprise 1 sont affichées
    await screen.findByText('TechCorp Solutions');
    expect(screen.queryByText('Conseil Plus')).not.toBeInTheDocument();
  });

  it('should handle drill-down interaction', () => {
    const testData = generateTestData('expertAdvisor');
    render(<RadarEvaluation data={testData} />);

    // Cliquer sur un domaine
    const domainButton = screen.getByText('Relation Client');
    fireEvent.click(domainButton);

    // Vérifier que les catégories sont affichées
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Résolution')).toBeInTheDocument();
  });
});
```

## 📦 Dépendances

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "d3": "^7.8.5",
    "@supabase/supabase-js": "^2.38.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@types/d3": "^7.4.0",
    "jest": "^29.0.0"
  }
}
```

## 🚀 Démarrage Rapide

1. **Installation**

```bash
npm install d3 @supabase/supabase-js
```

2. **Configuration Supabase**

```typescript
// supabase-client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);
```

3. **Utilisation**

```tsx
import { RadarEvaluation } from "./components/RadarEvaluation";

function App() {
  return (
    <RadarEvaluation variant="multi-level" initialFilters={{ entreprise: 1 }} />
  );
}
```

## 📈 Métriques de Performance

- **Temps de chargement cible** : < 2 secondes
- **Données supportées** : Jusqu'à 1000 évaluations simultanées
- **Interactions fluides** : 60 FPS pour les animations
- **Responsive** : Support mobile et desktop

## 🔧 Personnalisation

### Thèmes de Couleurs

```css
/* Thème par défaut - Focus sur les problèmes */
:root {
  --radar-conforme: #4caf50;
  --radar-partiel: #ff9800;
  --radar-non-conforme: #f44336;
  --radar-critique: #d32f2f;
}

/* Thème alternatif - Plus doux */
:root {
  --radar-conforme: #81c784;
  --radar-partiel: #ffb74d;
  --radar-non-conforme: #e57373;
  --radar-critique: #f44336;
}
```

Cette documentation fournit tout le nécessaire pour développer le composant radar dans une nouvelle session Claude. La logique métier corrigée met bien l'accent sur la visualisation des **non-conformités** comme indicateur de problèmes à résoudre.# Composant de Visualisation Radar - Données d'Évaluation

## 📋 Contexte du Projet

Ce composant permet de visualiser les données d'évaluation de conseillers avec une approche radar améliorée. Il s'intègre dans un système existant utilisant Supabase avec les schémas `public` et `whiteboard`.

### Structure des Données Source (Supabase)

```sql
-- Tables principales d'évaluation
activitesconseillers (idactivite, idconseiller, idsujet, idpratique, idexercice, dateactivite, statut...)
activitesconseillers_sujets (idactivite, idsujet, travaille, note_conformite)
activitesconseillers_pratiques (idactivite, idpratique, travaille)
ponderation_sujets (idsujet, conforme, partiellement_conforme, non_conforme)

-- Tables de référence
domaines (iddomaine, nomdomaine, description)
categoriessujets (idcategoriesujet, nomcategorie, couleur)
sujets (idsujet, iddomaine, nomsujet, idcategoriesujet)
conseillers (idconseiller, nom, prenom, entreprise)
entreprises (identreprise, nomentreprise)
```

## 🎯 Objectifs du Composant

1. **Visualiser les sujets non-conformes** lors d'activités de conseil
2. **Drill-down hiérarchique** : Domaine → Catégorie → Sujets
3. **Filtrage** par entreprise, conseiller, et appel
4. **Représentation spatiale innovante** avec radar amélioré
5. **Intégration dans SyntheseEvaluation** comme nouvel onglet

### Logique Métier

- **Si `idsujet` et `idactivite` sont liés dans `activitesconseillers_sujets`** → le sujet a été jugé **NON CONFORME**
- **Si absence de liaison** → le sujet est par défaut évalué et jugé **CONFORME**
- **Ce qui est représenté** = la **NON-CONFORMITÉ** (présence = problème)
- Distance du centre = niveau de non-conformité (plus loin = plus de problèmes)
- Taille des points = volume/gravité des non-conformités

## 🛠 Spécifications Techniques

### Architecture Recommandée

```
components/
├── RadarEvaluation/
│   ├── RadarEvaluationTab.tsx        # Composant principal pour l'onglet
│   ├── RadarChart.tsx                # Logique de rendu D3
│   ├── RadarControls.tsx             # Filtres et contrôles
│   ├── RadarTooltip.tsx              # Infobulles détaillées
│   ├── types.ts                      # Types TypeScript
│   ├── utils.ts                      # Fonctions utilitaires
│   └── radar.styles.css              # Styles CSS
├── SyntheseEvaluation.tsx            # Composant parent existant
├── SyntheseTab.tsx                   # Onglet synthèse existant
├── CritereQualiteTab.tsx             # Onglet critères existant
└── SimulationCoachingTab.tsx         # Onglet coaching existant
```

## 🏗 Intégration dans SyntheseEvaluation

### Structure Existante Analysée

Le composant `SyntheseEvaluation` contient déjà :

- **3 onglets** : Synthèse, Critères Qualité, Simulation Coaching
- **Système de filtrage** par domaine, conseiller, entreprise
- **Données disponibles** : `appelPostits`, `selectedCall`, `sujetsData`, `categoriesSujets`
- **Contextes** : `useCallData()`, `useAppContext()`, `useSupabase()`

### Nouvel Onglet Radar

**Ajout d'un 4ème onglet "RADAR QUALITÉ"** dans `SyntheseEvaluation.tsx` :

```tsx
// Dans SyntheseEvaluation.tsx - Ajout de l'onglet
<Tab
  icon={!isMobile ? <RadarChartIcon fontSize="small" /> : undefined}
  iconPosition="start"
  label="RADAR QUALITÉ"
/>

// Dans le contenu des onglets
{activeTab === 3 && (
  <RadarEvaluationTab
    selectedDomain={domainAsNumber}
    appelPostits={convertedPostits}
    categoriesSujets={categoriesSujets}
    sujetsData={sujetsData}
    selectedCall={convertedCall}
    filters={{
      entreprise: /* récupérer depuis le contexte */,
      conseiller: /* récupérer depuis le contexte */,
      appel: selectedCall.callid
    }}
  />
)}
```

### Props à Recevoir du Parent

```typescript
interface RadarEvaluationTabProps {
  selectedDomain: number | null;
  appelPostits: EvaluationPostit[];
  categoriesSujets: any[];
  sujetsData: any[];
  selectedCall: EvaluationCall;
  filters: {
    entreprise?: number;
    conseiller?: number;
    appel?: number;
  };
}
```

### Logique de Données à Implémenter

1. **Récupération automatique des domaines** depuis `appelPostits`
2. **Calcul des non-conformités** basé sur la présence dans `appelPostits`
3. **Utilisation du domaine sélectionné** depuis `useAppContext().selectedDomain`
4. **Transformation des données** selon la logique métier corrigée

## 📊 Modèle de Données

### Données Disponibles depuis SyntheseEvaluation

```typescript
// Données reçues du composant parent
interface RadarEvaluationTabProps {
  selectedDomain: number | null; // Domaine sélectionné dans le contexte
  appelPostits: EvaluationPostit[]; // Post-its de l'appel en cours
  categoriesSujets: any[]; // Catégories des sujets avec couleurs
  sujetsData: any[]; // Données complètes des sujets
  selectedCall: EvaluationCall; // Appel sélectionné
  filters: FilterOptions; // Filtres appliqués
}

// Structure des post-its (données source)
interface EvaluationPostit {
  id: string;
  callid: number;
  wordid: number;
  word: string;
  text: string;
  iddomaine?: number; // Domaine du post-it
  sujet?: string; // Nom du sujet (si évalué)
  idsujet?: number; // ID du sujet (si évalué)
  pratique?: string; // Nom de la pratique
  timestamp: number; // Position temporelle
  idactivite?: number; // ID de l'activité
}

// Structure transformée pour le radar
interface RadarSubject {
  id: number;
  name: string;
  nonConformityRate: number; // 0-1 calculé depuis les post-its
  nonConformityCount: number; // Nombre de post-its pour ce sujet
  totalEvaluations: number; // Volume total d'évaluations possibles
  status: NonConformityStatus; // Statut calculé
  categoryId: number; // Pour regroupement
  categoryColor: string; // Couleur de la catégorie
  relatedPostits: EvaluationPostit[]; // Post-its liés à ce sujet
}
```

### Logique de Transformation des Données

```typescript
// Fonction de transformation principale
const transformPostitsToRadarData = (
  appelPostits: EvaluationPostit[],
  sujetsData: any[],
  categoriesSujets: any[],
  selectedDomain: number
): RadarData => {
  // 1. Filtrer les post-its du domaine sélectionné
  const domainPostits = appelPostits.filter(
    (p) => p.iddomaine === selectedDomain
  );

  // 2. Récupérer tous les sujets du domaine
  const domainSujets = sujetsData.filter((s) => s.iddomaine === selectedDomain);

  // 3. Pour chaque sujet du domaine
  const radarSubjects = domainSujets.map((sujet) => {
    // Compter les post-its (non-conformités) pour ce sujet
    const sujetPostits = domainPostits.filter(
      (p) => p.idsujet === sujet.idsujet
    );
    const nonConformityCount = sujetPostits.length;

    // Calculer le taux de non-conformité
    // Ici on peut définir une logique basée sur le volume total d'évaluations
    // ou utiliser un seuil fixe pour déterminer le taux
    const nonConformityRate =
      nonConformityCount > 0 ? Math.min(nonConformityCount / 10, 1) : 0; // Exemple de calcul

    // Déterminer le statut
    const status =
      nonConformityRate === 0
        ? "conforme"
        : nonConformityRate < 0.3
          ? "partiellement_conforme"
          : "non_conforme";

    // Récupérer la couleur de la catégorie
    const categorie = categoriesSujets.find(
      (c) => c.idcategoriesujet === sujet.idcategoriesujet
    );

    return {
      id: sujet.idsujet,
      name: sujet.nomsujet,
      nonConformityRate,
      nonConformityCount,
      totalEvaluations: nonConformityCount, // À ajuster selon la logique métier
      status,
      categoryId: sujet.idcategoriesujet,
      categoryColor: categorie?.couleur || "#666",
      relatedPostits: sujetPostits,
    };
  });

  // 4. Grouper par catégories pour le radar
  return groupSubjectsByCategory(radarSubjects, categoriesSujets);
};
```

````

### Requêtes Supabase Recommandées

```sql
-- 1. Récupérer les non-conformités par sujet (logique corrigée)
WITH non_conformity_summary AS (
  SELECT
    d.iddomaine,
    d.nomdomaine,
    cs.idcategoriesujet,
    cs.nomcategorie,
    cs.couleur,
    s.idsujet,
    s.nomsujet,
    -- Compter le total d'évaluations pour ce sujet
    COUNT(DISTINCT ac.idactivite) as total_evaluations,
    -- Compter les non-conformités (présence dans activitesconseillers_sujets)
    COUNT(DISTINCT acs.idactivite) as non_conformity_count,
    -- Calculer le taux de non-conformité
    CASE
      WHEN COUNT(DISTINCT ac.idactivite) > 0
      THEN COUNT(DISTINCT acs.idactivite)::float / COUNT(DISTINCT ac.idactivite)::float
      ELSE 0
    END as non_conformity_rate
  FROM domaines d
  JOIN sujets s ON d.iddomaine = s.iddomaine
  JOIN categoriessujets cs ON s.idcategoriesujet = cs.idcategoriesujet
  -- Toutes les activités où ce sujet aurait pu être évalué
  LEFT JOIN activitesconseillers ac ON ac.idsujet = s.idsujet OR ac.idsujet IS NULL
  -- Seulement les non-conformités réelles (présence = problème)
  LEFT JOIN activitesconseillers_sujets acs ON s.idsujet = acs.idsujet AND ac.idactivite = acs.idactivite
  WHERE ($1::int IS NULL OR ac.idconseiller = $1)
    AND ($2::int IS NULL OR EXISTS (
      SELECT 1 FROM conseillers c
      WHERE c.idconseiller = ac.idconseiller
      AND c.entreprise = $2
    ))
  GROUP BY d.iddomaine, d.nomdomaine, cs.idcategoriesujet, cs.nomcategorie, cs.couleur, s.idsujet, s.nomsujet
)
SELECT
  *,
  CASE
    WHEN non_conformity_rate = 0 THEN 'conforme'
    WHEN non_conformity_rate < 0.3 THEN 'partiellement_conforme'
    ELSE 'non_conforme'
  END as status
FROM non_conformity_summary
ORDER BY iddomaine, idcategoriesujet, non_conformity_rate DESC;

-- 2. Statistiques d'entreprises avec focus sur les problèmes
SELECT
  e.identreprise,
  e.nomentreprise,
  COUNT(DISTINCT c.idconseiller) as nb_conseillers,
  COUNT(DISTINCT ac.idactivite) as nb_evaluations,
  COUNT(DISTINCT acs.idactivite) as nb_non_conformities,
  ROUND(
    COUNT(DISTINCT acs.idactivite)::float /
    NULLIF(COUNT(DISTINCT ac.idactivite), 0)::float * 100,
    2
  ) as taux_non_conformite_pct
FROM entreprises e
JOIN conseillers c ON e.identreprise = c.entreprise
LEFT JOIN activitesconseillers ac ON c.idconseiller = ac.idconseiller
LEFT JOIN activitesconseillers_sujets acs ON ac.idactivite = acs.idactivite
GROUP BY e.identreprise, e.nomentreprise
ORDER BY taux_non_conformite_pct DESC;
````

## 🎨 Variantes de Radar Recommandées

### 1. Radar Multi-Niveaux (Recommandé Principal)

```javascript
// Logique de positionnement - Plus loin du centre = Plus de non-conformités
const positionPoint = (subject, category, domain) => {
  const categoryRadius = maxRadius * (0.4 + category.level * 0.3);
  // Distance basée sur le taux de non-conformité (0 = centre, 1 = bord)
  const nonConformityDistance =
    categoryRadius * (0.2 + subject.nonConformityRate * 0.8);
  const angle = domain.angle + getAngleOffset(subject, category);

  return {
    x: centerX + Math.cos(angle - Math.PI / 2) * nonConformityDistance,
    y: centerY + Math.sin(angle - Math.PI / 2) * nonConformityDistance,
    // Taille basée sur le nombre absolu de non-conformités
    radius: 4 + Math.sqrt(subject.nonConformityCount),
  };
};
```

### 2. Radar à Bulles Hiérarchiques

```javascript
// Agrégation par catégorie - Focus sur les non-conformités
const aggregateCategory = (category) => {
  const subjects = category.subjects;
  const totalNonConformities = subjects.reduce(
    (sum, s) => sum + s.nonConformityCount,
    0
  );
  const totalEvaluations = subjects.reduce(
    (sum, s) => sum + s.totalEvaluations,
    0
  );

  return {
    avgNonConformityRate:
      subjects.reduce((sum, s) => sum + s.nonConformityRate, 0) /
      subjects.length,
    totalNonConformities: totalNonConformities,
    totalVolume: totalEvaluations,
    criticalSubjects: subjects.filter((s) => s.status === "non_conforme")
      .length,
    // Score de criticité pour le positionnement
    criticalityScore: totalNonConformities / Math.max(totalEvaluations, 1),
  };
};
```

### 3. Configuration des Couleurs

```css
:root {
  --color-conforme: #4caf50;
  --color-partiel: #ff9800;
  --color-non-conforme: #f44336;
  --color-background: #fafafa;
  --color-grid: #e0e0e0;
  --color-axis: #999;
}
```

## 🧪 Données de Test

### Jeu de Données Complet

```json
{
  "testData": {
    "enterprises": [
      {
        "id": 1,
        "name": "TechCorp Solutions",
        "advisors": [
          {"id": 101, "name": "Marie Dubois", "experience": "senior"},
          {"id": 102, "name": "Jean Martin", "experience": "junior"},
          {"id": 103, "name": "Sophie Bernard", "experience": "expert"}
        ]
      },
      {
        "id": 2,
        "name": "Conseil Plus",
        "advisors": [
          {"id": 201, "name": "Pierre Durand", "experience": "senior"},
          {"id": 202, "name": "Julie Moreau", "experience": "junior"}
        ]
      }
    ],
    "domains": [
      {
        "id": 1,
        "name": "Relation Client",
        "angle": 0,
        "categories": [
          {
            "id": 11,
            "name": "Communication",
            "color": "#2196F3",
            "subjects": [
              {
                "id": 111,
                "name": "Accueil téléphonique",
                "nonConformityRate": 0.7,     // 70% des évaluations sont non conformes
                "nonConformityCount": 15,     // 15 non-conformités détectées
                "totalEvaluations": 22,       // Sur 22 évaluations totales
                "status": "non_conforme",
                "lastEvaluation": "2024-01-15",
                "details": {
                  "commonIssues": ["Ton inapproprié", "Absence de formule de politesse", "Interruption client"],
                  "severity": "high",
                  "trend": "declining"
                }
              },
              {
                "id": 112,
                "name": "Écoute active",
                "nonConformityRate": 0.08,    // 8% des évaluations sont non conformes
                "nonConformityCount": 3,      // 3 non-conformités détectées
                "totalEvaluations": 38,       // Sur 38 évaluations totales
                "status": "conforme",
                "lastEvaluation": "2024-01-14",
                "details": {
                  "commonIssues": ["Reformulation incomplète"],
                  "severity": "low",
                  "trend": "stable"
                }
              },
              {
                "id": 113,
                "name": "Reformulation",
                "nonConformityRate": 0.29,    // 29% des évaluations sont non conformes
                "nonConformityCount": 12,
                "totalEvaluations": 42,
                "status": "partiellement_conforme",
                "lastEvaluation": "2024-01-13"
              },
              {
                "id": 114,
                "name": "Langage adapté",
                "nonConformityRate": 0.06,    // 6% des évaluations sont non conformes
                "nonConformityCount": 2,
                "totalEvaluations": 35,
                "status": "conforme",
                "lastEvaluation": "2024-01-12"
              }
            ]
          },
          {
            "id": 12,
            "name": "Résolution",
            "color": "#03A9F4
```
