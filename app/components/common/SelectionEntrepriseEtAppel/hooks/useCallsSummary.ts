// hooks/useCallsSummary.ts
import { useQuery } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabaseClient";

export type CallsFilters = {
  identreprise?: number | null; // null = toutes entreprises
  onlyUnassigned?: boolean; // true = appels sans entreprise
  archived?: boolean | null; // null=tous, false=actifs, true=archivés
  limit?: number;
  offset?: number;
};

export function useCallsSummary(filters: CallsFilters) {
  const {
    identreprise = null,
    onlyUnassigned = false,
    archived = null,
    limit = 50,
    offset = 0,
  } = filters;
  return useQuery({
    queryKey: [
      "calls",
      "summary",
      { identreprise, onlyUnassigned, archived, limit, offset },
    ],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Version RPC (reco). Remplace par .from("call_summary") si tu n’as pas encore la RPC.
      const { data, error } = await supabaseClient.rpc("get_calls_summary", {
        p_identreprise: identreprise,
        p_only_unassigned: onlyUnassigned,
        p_archived: archived,
        p_limit: limit,
        p_offset: offset,
      });
      if (error) throw error;
      return data ?? [];
    },
  });
}
