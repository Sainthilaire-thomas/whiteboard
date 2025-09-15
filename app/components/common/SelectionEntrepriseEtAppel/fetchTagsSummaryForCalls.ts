import { supabaseClient } from "@/lib/supabaseClient";

export type TagSummary = { call_id: number; count: number };

export async function fetchTagsSummaryForCalls(callIds: number[]) {
  if (!callIds.length) return new Map<number, TagSummary>();

  const { data, error } = await supabaseClient
    .from("turntagged")
    .select("call_id")
    .in("call_id", callIds);

  if (error) {
    console.error("Erreur fetch turntagged:", error);
    return new Map();
  }

  const map = new Map<number, TagSummary>();
  (data ?? []).forEach((row: { call_id: number }) => {
    const prev = map.get(row.call_id)?.count ?? 0;
    map.set(row.call_id, { call_id: row.call_id, count: prev + 1 });
  });

  return map;
}
