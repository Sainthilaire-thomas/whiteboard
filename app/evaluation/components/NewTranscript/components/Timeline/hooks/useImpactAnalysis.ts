import { useMemo } from "react";
import { TaggedTurn, Tag } from "@/context/TaggingDataContext";

export interface AdjacentPair {
  id: string;
  conseiller: TaggedTurn;
  client: TaggedTurn;
  conseillerStrategy: "positive" | "negative" | "neutral";
  clientReaction: "positive" | "negative" | "neutral";
  isCoherent: boolean;
  timeDelta: number; // Gap réel entre fin conseiller et début client
}

export interface ImpactMetrics {
  totalPairs: number;
  positiveImpacts: number;
  negativeImpacts: number;
  neutralImpacts: number;
  coherentImpacts: number;
  efficiencyRate: number;
  avgTimeDelta: number;
}

export const useImpactAnalysis = (
  taggedTurns: TaggedTurn[],
  tags: Tag[]
): { adjacentPairs: AdjacentPair[]; metrics: ImpactMetrics } => {
  return useMemo(() => {
    console.log(
      "🎯 IMPACT ANALYSIS: Analysing",
      taggedTurns.length,
      "tagged turns with",
      tags.length,
      "tag definitions"
    );

    // 1. Filtrer tours pertinents (avec tags valides)
    const relevantTurns = filterRelevantTurns(taggedTurns, tags);
    console.log(
      "🎯 IMPACT ANALYSIS: Filtered to",
      relevantTurns.length,
      "relevant turns"
    );

    // 2. Identifier paires adjacentes conseiller → client
    const adjacentPairs = findAdjacentPairs(relevantTurns, tags);
    console.log(
      "🎯 IMPACT ANALYSIS: Found",
      adjacentPairs.length,
      "adjacent pairs"
    );

    // 3. Calculer métriques d'efficacité
    const metrics = calculateImpactMetrics(adjacentPairs);
    console.log(
      "🎯 IMPACT ANALYSIS: Efficiency rate:",
      metrics.efficiencyRate + "%"
    );

    return { adjacentPairs, metrics };
  }, [taggedTurns, tags]);
};

// Fonctions utilitaires
const filterRelevantTurns = (
  turns: TaggedTurn[],
  tags: Tag[]
): TaggedTurn[] => {
  return turns.filter((turn) => {
    // ✅ CORRECTION: Utiliser turn.tag au lieu de turn.tags
    if (!turn.tag) return false;

    // Vérifier que le tag est pertinent
    const tagDef = tags.find((t) => t.label === turn.tag || t.tag === turn.tag);

    const isRelevant = tagDef && tagDef.family !== "AUTRES";

    if (!isRelevant && turn.tag) {
      console.log(
        "🔍 FILTERING OUT:",
        turn.tag,
        "- family:",
        tagDef?.family || "not found"
      );
    }

    return isRelevant;
  });
};

const isConseillerTurn = (turn: TaggedTurn, tags: Tag[]): boolean => {
  // ✅ CORRECTION: Utiliser turn.tag au lieu de turn.tags
  if (!turn.tag) return false;

  const tagDef = tags.find((t) => t.label === turn.tag || t.tag === turn.tag);

  return (
    tagDef?.originespeaker === "conseiller" &&
    ["REFLET", "ENGAGEMENT", "OUVERTURE", "EXPLICATION"].includes(
      tagDef.family || ""
    )
  );
};

const isClientTurn = (turn: TaggedTurn, tags: Tag[]): boolean => {
  // ✅ CORRECTION: Utiliser turn.tag au lieu de turn.tags
  if (!turn.tag) return false;

  const tagDef = tags.find((t) => t.label === turn.tag || t.tag === turn.tag);

  return tagDef?.originespeaker === "client" && tagDef.family === "CLIENT";
};

const findAdjacentPairs = (
  turns: TaggedTurn[],
  tags: Tag[]
): AdjacentPair[] => {
  // Trier les tours par temps de début
  const sortedTurns = [...turns].sort((a, b) => a.start_time - b.start_time);
  const pairs: AdjacentPair[] = [];

  for (let i = 0; i < sortedTurns.length - 1; i++) {
    const current = sortedTurns[i];
    const next = sortedTurns[i + 1];

    if (isConseillerTurn(current, tags) && isClientTurn(next, tags)) {
      const conseillerStrategy = classifyConseillerStrategy(current, tags);
      const clientReaction = classifyClientReaction(next);

      // Calculer le gap réel entre fin conseiller et début client
      const timeDelta = next.start_time - current.end_time;

      const pair: AdjacentPair = {
        id: `${current.id}-${next.id}`,
        conseiller: current,
        client: next,
        conseillerStrategy,
        clientReaction,
        isCoherent:
          (conseillerStrategy === "positive" &&
            clientReaction === "positive") ||
          (conseillerStrategy === "negative" && clientReaction === "negative"),
        timeDelta: Math.max(0, timeDelta), // Gap ne peut pas être négatif
      };

      pairs.push(pair);
      console.log(
        "📊 PAIR:",
        current.tag, // ✅ CORRECTION: Utiliser current.tag
        "→",
        next.tag, // ✅ CORRECTION: Utiliser next.tag
        "|",
        conseillerStrategy,
        "→",
        clientReaction,
        "|",
        pair.isCoherent ? "✅" : "❌",
        `| gap: ${timeDelta.toFixed(1)}s`
      );
    }
  }

  return pairs;
};

const classifyConseillerStrategy = (
  turn: TaggedTurn,
  tags: Tag[]
): "positive" | "negative" | "neutral" => {
  // ✅ CORRECTION: Utiliser turn.tag au lieu de turn.tags
  if (!turn.tag) return "neutral";

  const tagDef = tags.find((t) => t.label === turn.tag || t.tag === turn.tag);

  if (!tagDef) return "neutral";

  // Règles métier selon spécifications
  if (tagDef.family === "EXPLICATION") return "negative";
  if (turn.tag === "REFLET_JE") return "negative";
  if (["ENGAGEMENT", "OUVERTURE"].includes(tagDef.family || ""))
    return "positive";
  if (turn.tag === "REFLET_VOUS") return "positive";

  return "neutral";
};

const classifyClientReaction = (
  turn: TaggedTurn
): "positive" | "negative" | "neutral" => {
  // ✅ CORRECTION: Utiliser turn.tag au lieu de turn.tags
  if (!turn.tag) return "neutral";

  if (turn.tag === "CLIENT POSITIF") return "positive";
  if (turn.tag === "CLIENT NEGATIF") return "negative";

  return "neutral";
};

const calculateImpactMetrics = (pairs: AdjacentPair[]): ImpactMetrics => {
  const totalPairs = pairs.length;
  const positiveImpacts = pairs.filter(
    (p) => p.clientReaction === "positive"
  ).length;
  const negativeImpacts = pairs.filter(
    (p) => p.clientReaction === "negative"
  ).length;
  const neutralImpacts = pairs.filter(
    (p) => p.clientReaction === "neutral"
  ).length;
  const coherentImpacts = pairs.filter((p) => p.isCoherent).length;

  return {
    totalPairs,
    positiveImpacts,
    negativeImpacts,
    neutralImpacts,
    coherentImpacts,
    efficiencyRate:
      totalPairs > 0 ? Math.round((coherentImpacts / totalPairs) * 100) : 0,
    avgTimeDelta:
      totalPairs > 0
        ? pairs.reduce((acc, p) => acc + p.timeDelta, 0) / totalPairs
        : 0,
  };
};
