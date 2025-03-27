# Composant SyntheseEvaluation - Guide d'implémentation

Ce guide décrit la structure modulaire du composant SyntheseEvaluation pour Next.js avec TypeScript, spécialement optimisé pour l'onglet de simulation de coaching.

## Structure des fichiers

```
app/
├── evaluation/
│   └── components/
│       ├── SyntheseEvaluation/
│       │   ├── index.tsx                   # Composant principal
│       │   ├── SyntheseTab.tsx             # Onglet de synthèse
│       │   ├── CritereQualiteTab.tsx       # Onglet des critères
│       │   ├── SimulationCoachingTab.tsx   # Onglet de simulation
│       │   ├── components/
│       │   │   └── EvaluationCard.tsx      # Carte de passage
│       │   └── utils/
│       │       ├── formatters.ts           # Fonctions de formatage
│       │       └── filters.ts              # Fonctions de filtrage
types/
└── evaluation.ts                         # Types partagés pour la section Evaluation
```

## Étapes d'implémentation

1. **Configuration des types** : Commencez par créer le fichier `types/evaluation.ts` qui contient toutes les interfaces nécessaires.
2. **Création des utilitaires** : Implémentez les fonctions dans les fichiers `formatters.ts` et `filters.ts`.
3. **Création des composants** : Implémentez les composants dans l'ordre suivant :

   - `EvaluationCard.tsx` (composant de base)
   - `SimulationCoachingTab.tsx` (onglet coaching optimisé)
   - `CritereQualiteTab.tsx` et `SyntheseTab.tsx` (autres onglets)
   - `index.tsx` (composant principal qui gère la navigation entre onglets)

## Comment utiliser le composant

Pour utiliser ce composant dans votre application Next.js, importez-le dans votre page :

```tsx
// app/evaluation/page.tsx
import SyntheseEvaluation from "./components/SyntheseEvaluation";

export default function EvaluationPage() {
  return (
    <div className="container">
      <SyntheseEvaluation />
    </div>
  );
}
```

## Personnalisation

### Ajouter un nouveau filtre

Pour ajouter un nouveau filtre dans l'onglet de simulation coaching, modifiez `SimulationCoachingTab.tsx` :

1. Ajoutez un nouvel état pour le filtre
2. Créez une fonction pour gérer les changements
3. Ajoutez un nouveau contrôle de filtre dans l'interface
4. Mettez à jour la fonction `getFilteredPostits()`

### Ajouter une nouvelle fonctionnalité

Pour ajouter une nouvelle fonctionnalité comme l'exportation des données :

1. Créez une nouvelle fonction utilitaire dans un fichier approprié (ex: `export.ts`)
2. Importez cette fonction dans le composant concerné
3. Ajoutez un bouton ou un contrôle d'interface pour déclencher cette fonctionnalité

## Optimisations pour la demi-page

L'onglet de simulation coaching est spécialement optimisé pour s'afficher correctement dans une demi-page :

- Affichage vertical des passages pour maximiser l'espace
- Contrôles de filtrage compacts
- Mise en évidence des timecodes
- Style épuré avec une hiérarchie visuelle claire
- Gestion optimisée du défilement vertical
