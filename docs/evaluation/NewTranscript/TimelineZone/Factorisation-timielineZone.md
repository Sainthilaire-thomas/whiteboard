Voici un **plan de migration complet** pour factoriser `TimelineZone` en composants clairs, testables et évolutifs, avec toutes les tâches et squelettes nécessaires.

# Objectifs

- Séparer les responsabilités (entête, règle/curseur, couches, rendu d’événements).
- Garder la compatibilité avec l’API actuelle de `TimelineZone`.
- Offrir des **profils d’affichage** (compact/détaillé/expanded) sans dupliquer la logique.
- Préparer l’ajout de nouveaux types d’événements (post-its, sélections, etc.) via des “markers” spécialisés.

# Structure cible (proposée)

<pre class="overflow-visible!" data-start="570" data-end="1873"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>app/evaluation/components/NewTranscript/components/Timeline
├─ TimelineZone/                </span><span># Conteneur (orchestration + state)</span><span>
│  └─ index.tsx
├─ Header/
│  └─ TimelineHeader.tsx        </span><span># Titre, chips, toggles par couche, info temps</span><span>
├─ Progress/
│  ├─ ProgressBar.tsx           </span><span># Règle/gradations + seek au clic</span><span>
│  └─ TimelineCursor.tsx        </span><span># Curseur global</span><span>
├─ Layers/
│  ├─ LayerStack.tsx            </span><span># Agrège events → couches (via config)</span><span>
│  ├─ TimelineLayer.tsx         </span><span># Layout anti-collision (greedy + profils)</span><span>
│  ├─ EventMarker.tsx           </span><span># Marker générique (focus/hover/tooltip)</span><span>
│  └─ markers/
│     ├─ TagMarker.tsx          </span><span># Spécifique tags (pilule + couleur)</span><span>
│     └─ PostitMarker.tsx       </span><span># Spécifique post-its (icône, couleur)</span><span>
├─ hooks/
│  ├─ useTimelineSync.ts        </span><span># active/next/previous</span><span>
│  ├─ useResizeObserver.ts      </span><span># width conteneur</span><span>
│  └─ useLayerLayout.ts         </span><span># calcule rangées (pur + mémo)</span><span>
├─ utils/
│  ├─ time.ts                   </span><span># timeToPosition, positionToTime, formatTime</span><span>
│  ├─ grouping.ts               </span><span># groupEventsByLayer (pur, testable)</span><span>
│  └─ layout.ts                 </span><span># constantes + algo greedy</span><span>
├─ types.ts                     </span><span># TemporalEvent, TimelineLayer, Profiles…</span><span>
└─ profiles.ts                  </span><span># mapping timelineMode → profil (maxRows, dense…)</span><span>
</span></span></code></div></div></pre>

---

# Découpage en étapes (petits PRs conseillés)

## PR1 — Extraction Progress & Cursor (sans changement visuel)

**Tâches**

- Déplacer le code de `ProgressBar` et `TimelineCursor` dans `Progress/`.
- Exporter depuis `TimelineZone/index.tsx` pour conserver les imports internes existants (si besoin).
- Remplacer les usages in-file par `import { ProgressBar } from "../Progress/ProgressBar"` etc.

**Definition of Done**

- La timeline joue/pause/seek comme avant.
- Aucune régression dans les logs/handlers.

---

## PR2 — TimelineHeader isolé

**Tâches**

- Créer `Header/TimelineHeader.tsx` avec les props :
  <pre class="overflow-visible!" data-start="2486" data-end="2707"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>type</span><span></span><span>TimelineHeaderProps</span><span> = {
    </span><span>totalEvents</span><span>: </span><span>number</span><span>;
    </span><span>totalLayers</span><span>: </span><span>number</span><span>;
    </span><span>currentTime</span><span>: </span><span>number</span><span>;
    </span><span>duration</span><span>: </span><span>number</span><span>;
    onToggleLayer?: </span><span>(layerId: string</span><span>) => </span><span>void</span><span>; </span><span>// optionnel (future légende)</span><span>
  };
  </span></span></code></div></div></pre>
- Déplacer l’en-tête actuel (chips + temps) dans ce composant.

**Definition of Done**

- L’entête s’affiche comme avant.
- Optionnel : suppression du doublon de chips côté `TimelineZone`.

---

## PR3 — Utils & types purs

**Tâches**

- Créer `utils/time.ts` (copier `timeToPosition`, `positionToTime`, `formatTime`).
- Créer `types.ts` avec :
  <pre class="overflow-visible!" data-start="3052" data-end="3377"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>export</span><span></span><span>type</span><span></span><span>TimelineProfile</span><span> = { </span><span>maxRows</span><span>: </span><span>number</span><span>; </span><span>dense</span><span>: </span><span>boolean</span><span>; </span><span>showLabels</span><span>: </span><span>boolean</span><span> };
  </span><span>export</span><span></span><span>type</span><span></span><span>TimelineLayer</span><span> = {
    </span><span>id</span><span>: </span><span>string</span><span>; </span><span>name</span><span>: </span><span>string</span><span>; </span><span>events</span><span>: </span><span>TemporalEvent</span><span>[]; </span><span>height</span><span>: </span><span>number</span><span>;
    </span><span>color</span><span>: </span><span>string</span><span>; </span><span>visible</span><span>: </span><span>boolean</span><span>; </span><span>interactive</span><span>: </span><span>boolean</span><span>;
    render?: </span><span>'tag'</span><span> | </span><span>'postit'</span><span> | </span><span>'default'</span><span>; </span><span>// hint rendu</span><span>
  };
  </span></span></code></div></div></pre>
- Créer `profiles.ts` :
  <pre class="overflow-visible!" data-start="3404" data-end="3670"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>export</span><span></span><span>const</span><span></span><span>profiles</span><span>: </span><span>Record</span><span><</span><span>string</span><span>, </span><span>TimelineProfile</span><span>> = {
    </span><span>compact</span><span>:  { </span><span>maxRows</span><span>: </span><span>1</span><span>, </span><span>dense</span><span>: </span><span>true</span><span>,  </span><span>showLabels</span><span>: </span><span>false</span><span> },
    </span><span>detailed</span><span>: { </span><span>maxRows</span><span>: </span><span>4</span><span>, </span><span>dense</span><span>: </span><span>false</span><span>, </span><span>showLabels</span><span>: </span><span>true</span><span>  },
    </span><span>expanded</span><span>: { </span><span>maxRows</span><span>: </span><span>6</span><span>, </span><span>dense</span><span>: </span><span>false</span><span>, </span><span>showLabels</span><span>: </span><span>true</span><span>  },
  };
  </span></span></code></div></div></pre>

**Definition of Done**

- `TimelineZone` importe `time.ts` & `profiles.ts`.
- Aucun changement de comportement.

---

## PR4 — LayerStack + grouping pur

**Tâches**

- Créer `utils/grouping.ts` avec la logique **purement fonctionnelle** :
  <pre class="overflow-visible!" data-start="3910" data-end="4178"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>export</span><span></span><span>function</span><span></span><span>groupEventsByLayer</span><span>(
    events: TemporalEvent[],
    eventTypes?: </span><span>Array</span><span><{ </span><span>type</span><span>: </span><span>string</span><span>; enabled?: </span><span>boolean</span><span>; visible?: </span><span>boolean</span><span>; color?: </span><span>string</span><span>; render?: </span><span>string</span><span>; }>
  ): </span><span>TimelineLayer</span><span>[] { ... } </span><span>// renvoie un tableau (jamais vide si events>0)</span><span>
  </span></span></code></div></div></pre>
- Créer `Layers/LayerStack.tsx` :
  <pre class="overflow-visible!" data-start="4215" data-end="4556"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>export</span><span></span><span>function</span><span></span><span>LayerStack</span><span>({
    events, eventTypes, children,
  }: {
    events: TemporalEvent[];
    eventTypes?: </span><span>any</span><span>[];
    children: (layer: TimelineLayer) => React.ReactNode;
  }) {
    </span><span>const</span><span> layers = </span><span>useMemo</span><span>(</span><span>() =></span><span></span><span>groupEventsByLayer</span><span>(events, eventTypes), [events, eventTypes]);
    </span><span>return</span><span></span><span><span class="language-xml"><></span></span><span>{layers.map(children)}</span><span></></span><span>;
  }
  </span></span></code></div></div></pre>
- Dans `TimelineZone`, remplacer l’usage direct du groupement par `LayerStack`.

**Definition of Done**

- Même rendu qu’avant, mais `TimelineZone` ne connaît plus la logique de groupement.

---

## PR5 — TimelineLayer (layout anti-collision) + EventMarker & markers

**Tâches**

- Créer `hooks/useLayerLayout.ts` (algo greedy, pur + mémo).
  - Entrée : `events`, `width`, `duration`, `profile` (minGap, pointWidth dérivés de `dense`).
  - Sortie : `{ items: Array<{ event, row, x, w }>, rowsCount }`.
- Créer `Layers/TimelineLayer.tsx` :
  <pre class="overflow-visible!" data-start="5095" data-end="5422"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>export</span><span></span><span>function</span><span></span><span>TimelineLayer</span><span>({
    layer, width, duration, profile, renderEvent,
  }: {
    layer: TimelineLayer; width: </span><span>number</span><span>; duration: </span><span>number</span><span>;
    profile: TimelineProfile;
    renderEvent: (ev: TemporalEvent, metrics: { x: </span><span>number</span><span>; w: </span><span>number</span><span>; y: </span><span>number</span><span>; rowHeight: </span><span>number</span><span> }) => React.ReactNode;
  }) { ... }
  </span></span></code></div></div></pre>
- Créer `Layers/EventMarker.tsx` (générique) + `markers/TagMarker.tsx`, `markers/PostitMarker.tsx`.
  - `TagMarker` : barre verticale + pilule (texte tronqué), color = `event.metadata.color`.
  - `PostitMarker` : rond/ovale avec 📝, color = couche.
- Routing rendu :
  <pre class="overflow-visible!" data-start="5693" data-end="6060"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>const</span><span></span><span>renderEvent</span><span> = (</span><span>ev, metrics</span><span>) => {
    </span><span>switch</span><span> (layer.</span><span>render</span><span> ?? layer.</span><span>id</span><span>) {
      </span><span>case</span><span></span><span>'tag'</span><span>:    </span><span>return</span><span></span><span><span class="language-xml"><TagMarker</span></span><span></span><span>event</span><span>=</span><span>{ev}</span><span></span><span>metrics</span><span>=</span><span>{metrics}</span><span></span><span>onClick</span><span>=</span><span>{...}</span><span> />;
      </span><span>case</span><span></span><span>'postit'</span><span>: </span><span>return</span><span></span><span><span class="language-xml"><PostitMarker</span></span><span></span><span>event</span><span>=</span><span>{ev}</span><span></span><span>metrics</span><span>=</span><span>{metrics}</span><span></span><span>onClick</span><span>=</span><span>{...}</span><span> />;
      </span><span>default</span><span>:       </span><span>return</span><span></span><span><span class="language-xml"><EventMarker</span></span><span></span><span>event</span><span>=</span><span>{ev}</span><span></span><span>metrics</span><span>=</span><span>{metrics}</span><span></span><span>onClick</span><span>=</span><span>{...}</span><span> />;
    }
  };
  </span></span></code></div></div></pre>

**Definition of Done**

- Rendu identique (ou meilleur) en **détaillé** .
- En **compact** , une seule rangée, sans libellé (pilules/traits visibles).
- Pas de chevauchement visuel.

---

## PR6 — Intégration profils + feature flag

**Tâches**

- Dans `TimelineZone`, calculer le `profile` :
  <pre class="overflow-visible!" data-start="6351" data-end="6432"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>const</span><span> profile = profiles[config.</span><span>timelineMode</span><span>] ?? profiles.</span><span>detailed</span><span>;
  </span></span></code></div></div></pre>
- Passer `profile` à chaque `TimelineLayer`.
- Ajouter un **feature flag** (ex: `NEW_TIMELINE=true`) pour pouvoir revenir à l’ancien rendu si besoin.

**Definition of Done**

- Un switch (env/param) permet d’activer/désactiver la nouvelle Timeline.
- Les 3 modes affichent correctement.

---

# Squelettes rapides (copier-coller)

## Layers/LayerStack.tsx

<pre class="overflow-visible!" data-start="6788" data-end="7261"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>import</span><span></span><span>React</span><span>, { useMemo } </span><span>from</span><span></span><span>"react"</span><span>;
</span><span>import</span><span> { </span><span>TimelineLayer</span><span>, </span><span>TemporalEvent</span><span> } </span><span>from</span><span></span><span>"../types"</span><span>;
</span><span>import</span><span> { groupEventsByLayer } </span><span>from</span><span></span><span>"../utils/grouping"</span><span>;

</span><span>export</span><span></span><span>function</span><span></span><span>LayerStack</span><span>({
  events, eventTypes, children,
}: {
  events: TemporalEvent[];
  eventTypes?: </span><span>any</span><span>[];
  children: (layer: TimelineLayer) => React.ReactNode;
}) {
  </span><span>const</span><span> layers = </span><span>useMemo</span><span>(</span><span>() =></span><span></span><span>groupEventsByLayer</span><span>(events, eventTypes), [events, eventTypes]);
  </span><span>return</span><span></span><span><span class="language-xml"><></span></span><span>{layers.map(children)}</span><span></></span><span>;
}
</span></span></code></div></div></pre>

## Layers/TimelineLayer.tsx (structure)

<pre class="overflow-visible!" data-start="7303" data-end="8820"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>import</span><span></span><span>React</span><span>, { useMemo } </span><span>from</span><span></span><span>"react"</span><span>;
</span><span>import</span><span> { </span><span>Box</span><span>, </span><span>Typography</span><span> } </span><span>from</span><span></span><span>"@mui/material"</span><span>;
</span><span>import</span><span> { </span><span>TimelineLayer</span><span></span><span>as</span><span></span><span>TLayer</span><span>, </span><span>TimelineProfile</span><span>, </span><span>TemporalEvent</span><span> } </span><span>from</span><span></span><span>"../types"</span><span>;
</span><span>import</span><span> { useLayerLayout } </span><span>from</span><span></span><span>"../hooks/useLayerLayout"</span><span>;

</span><span>export</span><span></span><span>function</span><span></span><span>TimelineLayer</span><span>({
  layer, width, duration, profile, renderEvent,
}: {
  layer: TLayer; width: </span><span>number</span><span>; duration: </span><span>number</span><span>;
  profile: TimelineProfile;
  renderEvent: (ev: TemporalEvent, m: { x: </span><span>number</span><span>; w: </span><span>number</span><span>; y: </span><span>number</span><span>; rowHeight: </span><span>number</span><span> }) => React.ReactNode;
}) {
  </span><span>if</span><span> (!layer.</span><span>visible</span><span> || layer.</span><span>events</span><span>.</span><span>length</span><span> === </span><span>0</span><span>) </span><span>return</span><span></span><span>null</span><span>;

  </span><span>const</span><span> { items, rowsCount, rowHeight, rowGap } = </span><span>useLayerLayout</span><span>({
    </span><span>events</span><span>: layer.</span><span>events</span><span>, width, duration, profile,
  });

  </span><span>const</span><span> dynamicHeight = </span><span>6</span><span> + rowsCount * (rowHeight + rowGap);

  </span><span>return</span><span> (
    </span><span><span class="language-xml"><Box</span></span><span></span><span>sx</span><span>=</span><span>{{</span><span>
      </span><span>position:</span><span> "</span><span>relative</span><span>", </span><span>width:</span><span> "</span><span>100</span><span>%", </span><span>height:</span><span></span><span>dynamicHeight</span><span>,
      </span><span>backgroundColor:</span><span> `${</span><span>layer.color</span><span>}</span><span>15</span><span>`, </span><span>borderRadius:</span><span></span><span>1</span><span>, </span><span>mb:</span><span></span><span>1.5</span><span>,
      </span><span>border:</span><span> `</span><span>1px</span><span></span><span>solid</span><span> ${</span><span>layer.color</span><span>}</span><span>30</span><span>`,
    }}>
      </span><span><Typography</span><span></span><span>variant</span><span>=</span><span>"caption"</span><span></span><span>sx</span><span>=</span><span>{{</span><span>
        </span><span>position:</span><span> "</span><span>absolute</span><span>", </span><span>left:</span><span></span><span>8</span><span>, </span><span>top:</span><span></span><span>4</span><span>, </span><span>fontSize:</span><span> "</span><span>0.75rem</span><span>",
        </span><span>color:</span><span></span><span>layer.color</span><span>, </span><span>fontWeight:</span><span> "</span><span>bold</span><span>", </span><span>zIndex:</span><span></span><span>5</span><span>,
        </span><span>backgroundColor:</span><span> "</span><span>rgba</span><span>(</span><span>255</span><span>,</span><span>255</span><span>,</span><span>255</span><span>,</span><span>0.88</span><span>)", </span><span>px:</span><span></span><span>1</span><span>, </span><span>borderRadius:</span><span> "</span><span>2px</span><span>",
        </span><span>border:</span><span> `</span><span>1px</span><span></span><span>solid</span><span> ${</span><span>layer.color</span><span>}</span><span>30</span><span>`,
      }}>
        {layer.name} ({layer.events.length})
      </span><span></Typography</span><span>>

      {items.map(({ event, row, x, w }, i) =>
        renderEvent(event, { x, w, y: 4 + row * (rowHeight + rowGap), rowHeight })
      )}
    </span><span></Box</span><span>>
  );
}
</span></span></code></div></div></pre>

## hooks/useLayerLayout.ts (signature)

<pre class="overflow-visible!" data-start="8861" data-end="10298"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>import</span><span> { useMemo } </span><span>from</span><span></span><span>"react"</span><span>;
</span><span>import</span><span> { </span><span>TemporalEvent</span><span>, </span><span>TimelineProfile</span><span> } </span><span>from</span><span></span><span>"../types"</span><span>;
</span><span>import</span><span> { timeToPosition } </span><span>from</span><span></span><span>"../utils/time"</span><span>;

</span><span>export</span><span></span><span>function</span><span></span><span>useLayerLayout</span><span>({
  events, width, duration, profile,
}: {
  events: TemporalEvent[];
  width: </span><span>number</span><span>;
  duration: </span><span>number</span><span>;
  profile: TimelineProfile;
}) {
  </span><span>const</span><span></span><span>MIN_GAP</span><span> = profile.</span><span>dense</span><span> ? </span><span>4</span><span> : </span><span>6</span><span>;
  </span><span>const</span><span></span><span>POINT_W</span><span> = profile.</span><span>dense</span><span> ? </span><span>10</span><span> : </span><span>14</span><span>;
  </span><span>const</span><span> rowHeight = profile.</span><span>dense</span><span> ? </span><span>12</span><span> + </span><span>4</span><span> : </span><span>20</span><span>; </span><span>// +4 marge interne</span><span>
  </span><span>const</span><span> rowGap = profile.</span><span>dense</span><span> ? </span><span>2</span><span> : </span><span>4</span><span>;

  </span><span>return</span><span></span><span>useMemo</span><span>(</span><span>() =></span><span> {
    </span><span>const</span><span> sorted = [...events].</span><span>sort</span><span>(</span><span>(a,b</span><span>) => a.</span><span>startTime</span><span> - b.</span><span>startTime</span><span>);
    </span><span>const</span><span></span><span>rowLastEnd</span><span>: </span><span>number</span><span>[] = [];
    </span><span>const</span><span> items = sorted.</span><span>map</span><span>(</span><span>event</span><span> => {
      </span><span>const</span><span> sx = </span><span>timeToPosition</span><span>(event.</span><span>startTime</span><span>, duration, width);
      </span><span>const</span><span> ex = event.</span><span>endTime</span><span> ? </span><span>timeToPosition</span><span>(event.</span><span>endTime</span><span>, duration, width) : sx + </span><span>POINT_W</span><span>;
      </span><span>const</span><span> w = </span><span>Math</span><span>.</span><span>max</span><span>(ex - sx, </span><span>POINT_W</span><span>);

      </span><span>let</span><span> row = </span><span>0</span><span>;
      </span><span>while</span><span> (row < rowLastEnd.</span><span>length</span><span> && sx <= rowLastEnd[row] + </span><span>MIN_GAP</span><span>) row++;
      </span><span>if</span><span> (row === rowLastEnd.</span><span>length</span><span>) rowLastEnd.</span><span>push</span><span>(</span><span>0</span><span>);
      </span><span>if</span><span> (row >= profile.</span><span>maxRows</span><span>) row = profile.</span><span>maxRows</span><span> - </span><span>1</span><span>;
      rowLastEnd[row] = </span><span>Math</span><span>.</span><span>max</span><span>(rowLastEnd[row], sx + w);

      </span><span>return</span><span> { event, row, </span><span>x</span><span>: sx, w };
    });

    </span><span>const</span><span> rowsCount = </span><span>Math</span><span>.</span><span>min</span><span>(rowLastEnd.</span><span>length</span><span> || </span><span>1</span><span>, profile.</span><span>maxRows</span><span>);
    </span><span>return</span><span> { items, rowsCount, rowHeight, rowGap };
  }, [events, duration, width, profile.</span><span>maxRows</span><span>, </span><span>MIN_GAP</span><span>, </span><span>POINT_W</span><span>, rowHeight, rowGap]);
}
</span></span></code></div></div></pre>

## Layers/markers/TagMarker.tsx (ex.)

<pre class="overflow-visible!" data-start="10338" data-end="12293"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-tsx"><span><span>import</span><span> { </span><span>Box</span><span>, </span><span>Tooltip</span><span>, </span><span>Typography</span><span> } </span><span>from</span><span></span><span>"@mui/material"</span><span>;
</span><span>import</span><span></span><span>React</span><span></span><span>from</span><span></span><span>"react"</span><span>;
</span><span>import</span><span> { </span><span>TemporalEvent</span><span> } </span><span>from</span><span></span><span>"../../types"</span><span>;

</span><span>export</span><span></span><span>function</span><span></span><span>TagMarker</span><span>({
  event, metrics, showLabel = </span><span>true</span><span>, onClick, onHover,
}: {
  event: TemporalEvent;
  metrics: { x: </span><span>number</span><span>; w: </span><span>number</span><span>; y: </span><span>number</span><span>; rowHeight: </span><span>number</span><span> };
  showLabel?: </span><span>boolean</span><span>;
  onClick: (e: TemporalEvent) => </span><span>void</span><span>;
  onHover?: (e: TemporalEvent) => </span><span>void</span><span>;
}) {
  </span><span>const</span><span> { x, w, y, rowHeight } = metrics;
  </span><span>const</span><span> isPoint = !event.</span><span>endTime</span><span>;
  </span><span>const</span><span> bg = event.</span><span>metadata</span><span>?.</span><span>color</span><span> || </span><span>"#1976d2"</span><span>;
  </span><span>const</span><span> label = event.</span><span>metadata</span><span>?.</span><span>category</span><span> || event.</span><span>data</span><span>?.</span><span>text</span><span> || </span><span>"Événement"</span><span>;

  </span><span>return</span><span> (
    </span><span><span class="language-xml"><Tooltip</span></span><span></span><span>title</span><span>=</span><span>{</span><span><</span><span>Box</span><span>>
      </span><span><Typography</span><span></span><span>variant</span><span>=</span><span>"subtitle2"</span><span></span><span>sx</span><span>=</span><span>{{</span><span></span><span>fontWeight:</span><span> "</span><span>bold</span><span>" }}>{label}</span><span></Typography</span><span>>
      </span><span><Typography</span><span></span><span>variant</span><span>=</span><span>"caption"</span><span>>{/* time range */}</span><span></Typography</span><span>>
    </span><span></Box</span><span>>} arrow placement="top">
      </span><span><Box</span><span></span><span>sx</span><span>=</span><span>{{</span><span></span><span>position:</span><span> "</span><span>absolute</span><span>", </span><span>left:</span><span></span><span>x</span><span>, </span><span>top:</span><span></span><span>y</span><span>, </span><span>width:</span><span></span><span>w</span><span>, </span><span>height:</span><span></span><span>rowHeight</span><span></span><span>-</span><span></span><span>4</span><span>, </span><span>cursor:</span><span> "</span><span>pointer</span><span>", </span><span>zIndex:</span><span></span><span>12</span><span> }}
           </span><span>onClick</span><span>=</span><span>{(e)</span><span>=>{e.stopPropagation(); onClick(event);}}
           onMouseEnter={()=>onHover?.(event)}>
        </span><span><Box</span><span></span><span>sx</span><span>=</span><span>{{</span><span></span><span>position:</span><span> "</span><span>absolute</span><span>", </span><span>left:</span><span></span><span>isPoint</span><span> ? </span><span>w</span><span>/</span><span>2</span><span></span><span>-</span><span></span><span>1</span><span></span><span>:</span><span></span><span>0</span><span>, </span><span>top:</span><span></span><span>0</span><span>, </span><span>width:</span><span></span><span>isPoint</span><span> ? </span><span>2</span><span></span><span>:</span><span></span><span>w</span><span>, </span><span>height:</span><span> "</span><span>100</span><span>%", </span><span>backgroundColor:</span><span></span><span>bg</span><span>, </span><span>opacity:</span><span></span><span>isPoint</span><span> ? </span><span>.9</span><span></span><span>:</span><span></span><span>.6</span><span>, </span><span>borderRadius:</span><span></span><span>isPoint</span><span> ? </span><span>1</span><span></span><span>:</span><span></span><span>4</span><span> }} />
        {showLabel && w >= 38 && (
          </span><span><Box</span><span></span><span>sx</span><span>=</span><span>{{</span><span></span><span>position:</span><span> "</span><span>absolute</span><span>", </span><span>top:</span><span></span><span>2</span><span>, </span><span>left:</span><span> "</span><span>50</span><span>%", </span><span>transform:</span><span> "</span><span>translateX</span><span>(</span><span>-50</span><span>%)",
                     </span><span>maxWidth:</span><span></span><span>Math.max</span><span>(</span><span>38</span><span>, </span><span>w</span><span></span><span>-</span><span></span><span>6</span><span>), </span><span>px:</span><span></span><span>1</span><span>, </span><span>height:</span><span></span><span>20</span><span>, </span><span>lineHeight:</span><span> "</span><span>20px</span><span>",
                     </span><span>fontSize:</span><span> "</span><span>.72rem</span><span>", </span><span>fontWeight:</span><span></span><span>700</span><span>, </span><span>color:</span><span> "#</span><span>fff</span><span>",
                     </span><span>backgroundColor:</span><span></span><span>bg</span><span>, </span><span>border:</span><span> `</span><span>1px</span><span></span><span>solid</span><span> ${</span><span>bg</span><span>}`, </span><span>borderRadius:</span><span> "</span><span>999px</span><span>",
                     </span><span>boxShadow:</span><span> "</span><span>inset</span><span></span><span>0</span><span></span><span>0</span><span></span><span>0</span><span></span><span>2px</span><span></span><span>rgba</span><span>(</span><span>255</span><span>,</span><span>255</span><span>,</span><span>255</span><span>,</span><span>.18</span><span>), </span><span>0</span><span></span><span>2px</span><span></span><span>6px</span><span></span><span>rgba</span><span>(</span><span>0</span><span>,</span><span>0</span><span>,</span><span>0</span><span>,</span><span>.35</span><span>)",
                     </span><span>whiteSpace:</span><span> "</span><span>nowrap</span><span>", </span><span>overflow:</span><span> "</span><span>hidden</span><span>", </span><span>textOverflow:</span><span> "</span><span>ellipsis</span><span>" }}>
            {label}
          </span><span></Box</span><span>>
        )}
      </span><span></Box</span><span>>
    </span><span></Tooltip</span><span>>
  );
}
</span></span></code></div></div></pre>

---

# Test & validation

## Unitaire (utils & hooks)

- `utils/grouping.ts` :
  - retourne 1 couche “tag” pour 58 events “tag”.
  - fallback auto si `eventTypes` vide/incohérent.
- `hooks/useLayerLayout.ts` :
  - n’attribue jamais 2 événements à la même rangée s’ils se chevauchent.
  - clamp des événements excédentaires sur la dernière rangée si `maxRows` atteint.

## Visuel (manuels)

- **Compact** : 1 rangée, traits/pilules sans label, lisibles aux mêmes temps qu’en détaillé.
- **Détaillé** : multi-rangées, labels visibles, tooltip correct.
- **Zéro event** : message de fallback “Aucun événement…”.
- **Resize** : largeur se met à jour, positions correctes.

## Perf

- `useMemo` sur grouping/layout.
- `React.memo` sur markers si besoin.
- Minimiser les `console.log` en prod.

---

# Risques & parades

- **Couleurs transparentes** → fallback `#1976d2` pour `tag`.
- **Width = 0** au premier render → `useResizeObserver` pour initialiser la width après mount.
- **Durée = 0** → garde-fous dans `timeToPosition` (déjà faits).
- **Événements ponctuels invisibles** → barre verticale + largeur min 10–14 px.
- **Double inclusion en “compact”** → unifier via profils (décrit ci-dessus).

---

# Checklist finale (Go/No-Go)

- [ ] Feature flag pour activer la nouvelle Timeline (facile retour arrière).
- [ ] Tests unitaires sur grouping & layout.
- [ ] Vérif “compact/detailed/expanded” avec un appel réel (741).
- [ ] Aucune régression : seek, hover, click d’event.
- [ ] Code commenté et fichiers < 200 lignes (sauf `index.tsx` container).
