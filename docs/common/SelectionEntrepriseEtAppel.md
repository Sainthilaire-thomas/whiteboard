# 📘 SelectionEntrepriseEtAppel — Documentation

## Rôle

Composant d’orchestration qui affiche :

1. la liste déroulante des **entreprises**
2. la **liste d’appels** filtrée par l’entreprise sélectionnée, avec actions (évaluer, archiver, supprimer, créer/dissocier une activité).

Il compose deux sous-composants : `EntrepriseSelection` et `CallSelection`.

---

## API & dépendances

### SelectionEntrepriseEtAppel

- **Props** : _aucune_ .
- **Contexte** : lit `selectedEntreprise` depuis `AppContext`, puis la passe à `CallSelection`.

### EntrepriseSelection

- **Affichage** : `<Select>` listant les entreprises.
- **Contexte** : `useAppContext()` pour `entreprises`, `selectedEntreprise`, `setSelectedEntreprise`, états de chargement/erreur.
- **Comportement** :
- Affiche un chargement/erreur si besoin.
- Permet de remettre “Aucune sélection”.
- Met à jour `selectedEntreprise` (number | null).

### CallSelection

- **Props** : `selectedEntreprise: number | null` (obligatoire).
- **Contextes** :
- `useCallData()` : `calls`, `fetchCalls(selectedEntreprise)`, `isLoadingCalls`, `createActivityForCall`, `archiveCall`, `deleteCall`, `removeActivityForCall`, `selectCall`.
- `useConseiller()` : gestion du conseiller ciblé (réel ou avatar), chargement et avatars.
- **Effets** :
- `useEffect` recharge les appels quand `selectedEntreprise` change.
- **UI** :
- Liste d’appels en cartes.
- Boutons _Évaluer_ , _Archiver_ , _Supprimer_ , _Dissocier_ .
- **Dialog** de création d’activité : choix _Évaluation/Coaching_ + choix du _conseiller_ (ou avatar ⇒ création à la volée d’un conseiller anonyme via Supabase).
- Après création/dissociation, relance `fetchCalls(selectedEntreprise)`.

---

## États & flux principaux

1. **Sélection d’entreprise** → met à jour `selectedEntreprise` dans le contexte.
2. **Chargement des appels** → `CallSelection` appelle `fetchCalls(selectedEntreprise)` à chaque changement d’entreprise.
3. **Création d’activité** (Évaluation/Coaching)
   - Si avatar choisi, création d’un **conseiller anonyme** en base avant l’appel à `createActivityForCall`.
   - Rafraîchit la liste des appels.
4. **Actions sur appel** : évaluer (sélectionne l’appel dans le contexte), archiver, supprimer, dissocier activité.

---

## Bonnes pratiques & points d’attention

- **Prop drilling minimal** : seule `selectedEntreprise` est forwardée à `CallSelection`; tout le reste vient des contextes → simple et lisible.
- **Idempotence/refresh** : après `createActivityForCall` et `removeActivityForCall`, on relance `fetchCalls` pour garder l’UI à jour.
- **Accessibilité** : `InputLabel` + `Select` OK; conserver des `Typography` clairs pour l’état “Aucune activité associée”.
- **Erreurs Supabase** : actuellement logguées dans la console lors de la création d’un conseiller anonyme; envisager un Snackbar/toast pour l’utilisateur.

---

## Exemple d’utilisation

<pre class="overflow-visible!" data-start="3483" data-end="3712"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>// Dans une page ou un panneau latéral</span><span>
</span><span>import</span><span></span><span>SelectionEntrepriseEtAppel</span><span></span><span>from</span><span></span><span>"@/app/components/common/SelectionEntrepriseEtAppel"</span><span>;

</span><span>export</span><span></span><span>default</span><span></span><span>function</span><span></span><span>EvaluationPage</span><span>(</span><span></span><span>) {
  </span><span>return</span><span></span><span><span class="language-xml"><SelectionEntrepriseEtAppel</span></span><span> />;
}
</span></span></code></div></div></pre>

Le composant s’auto-alimente via les contextes et ne requiert pas d’autres props.
