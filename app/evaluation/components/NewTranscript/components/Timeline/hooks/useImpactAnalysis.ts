import { useMemo } from "react";
import { TemporalEvent } from "../../../types";
import { Tag } from "@/context/TaggingDataContext";

export interface AdjacentPair {
  id: string;
  conseiller: TemporalEvent;
  client: TemporalEvent;
  conseillerStrategy: "positive" | "negative" | "neutral";
  clientReaction: "positive" | "negative" | "neutral";
  isCoherent: boolean; // stratégie positive → réaction positive
  timeDelta: number;
}

export interface ImpactMetrics {
  totalPairs: number;
  positiveImpacts: number;
  negativeImpacts: number;
  neutralImpacts: number;
  coherentImpacts: number;
  efficiencyRate: number; // % impacts cohérents
  avgTimeDelta: number;
}

export const useImpactAnalysis = (
  events: TemporalEvent[],
  tags: Tag[]
): { adjacentPairs: AdjacentPair[]; metrics: ImpactMetrics } => {
  return useMemo(() => {
    console.log(
      "🎯 IMPACT ANALYSIS: Analysing",
      events.length,
      "events with",
      tags.length,
      "tag definitions"
    );

    // 1. Filtrer événements pertinents (exclure famille AUTRES)
    const relevantEvents = filterRelevantEvents(events, tags);
    console.log(
      "🎯 IMPACT ANALYSIS: Filtered to",
      relevantEvents.length,
      "relevant events"
    );

    // 2. Identifier paires adjacentes conseiller → client
    const adjacentPairs = findAdjacentPairs(relevantEvents, tags);
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
  }, [events, tags]);
};

// Fonctions utilitaires
const filterRelevantEvents = (
  events: TemporalEvent[],
  tags: Tag[]
): TemporalEvent[] => {
  return events.filter((event) => {
    const tag = tags.find(
      (t) => t.label === event.data?.tag || t.tag === event.data?.tag
    );
    const isRelevant = tag && tag.family !== "AUTRES";
    if (!isRelevant && event.data?.tag) {
      console.log(
        "🔍 FILTERING OUT:",
        event.data.tag,
        "- family:",
        tag?.family || "not found"
      );
    }
    return isRelevant;
  });
};

const isConseillerEvent = (event: TemporalEvent, tags: Tag[]): boolean => {
  const tag = tags.find(
    (t) => t.label === event.data?.tag || t.tag === event.data?.tag
  );
  return (
    tag?.originespeaker === "conseiller" &&
    ["REFLET", "ENGAGEMENT", "OUVERTURE", "EXPLICATION"].includes(
      tag.family || ""
    )
  );
};

const isClientEvent = (event: TemporalEvent, tags: Tag[]): boolean => {
  const tag = tags.find(
    (t) => t.label === event.data?.tag || t.tag === event.data?.tag
  );
  return tag?.originespeaker === "client" && tag.family === "CLIENT";
};

const findAdjacentPairs = (
  events: TemporalEvent[],
  tags: Tag[]
): AdjacentPair[] => {
  const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
  const pairs: AdjacentPair[] = [];

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];

    if (isConseillerEvent(current, tags) && isClientEvent(next, tags)) {
      const conseillerStrategy = classifyConseillerStrategy(current, tags);
      const clientReaction = classifyClientReaction(next);

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
        timeDelta: next.startTime - current.startTime,
      };

      pairs.push(pair);
      console.log(
        "📊 PAIR:",
        current.data?.tag,
        "→",
        next.data?.tag,
        "|",
        conseillerStrategy,
        "→",
        clientReaction,
        "|",
        pair.isCoherent ? "✅" : "❌"
      );
    }
  }

  return pairs;
};

const classifyConseillerStrategy = (
  event: TemporalEvent,
  tags: Tag[]
): "positive" | "negative" | "neutral" => {
  const tag = tags.find(
    (t) => t.label === event.data?.tag || t.tag === event.data?.tag
  );
  if (!tag) return "neutral";

  // Règles métier selon spécifications
  if (tag.family === "EXPLICATION") return "negative";
  if (event.data?.tag === "REFLET_JE") return "negative";
  if (["ENGAGEMENT", "OUVERTURE"].includes(tag.family || "")) return "positive";
  if (event.data?.tag === "REFLET_VOUS") return "positive";

  return "neutral";
};

const classifyClientReaction = (
  event: TemporalEvent
): "positive" | "negative" | "neutral" => {
  if (event.data?.tag === "CLIENT POSITIF") return "positive";
  if (event.data?.tag === "CLIENT NEGATIF") return "negative";
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
