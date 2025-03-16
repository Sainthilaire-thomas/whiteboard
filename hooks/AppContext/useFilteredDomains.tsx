import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAppContext } from "@/context/AppContext";
import { Domaine } from "@/types/types";

export function useFilteredDomains(selectedEntreprise: string | number | null) {
  const { domains } = useAppContext();
  const [filteredDomains, setFilteredDomains] = useState<Domaine[]>([]);

  useEffect(() => {
    const fetchFilteredDomains = async () => {
      if (selectedEntreprise) {
        const { data, error } = await supabaseClient
          .from("entreprise_domaines")
          .select("iddomaine")
          .eq("identreprise", selectedEntreprise);

        if (error) {
          console.error(
            "Erreur lors de la récupération des domaines associés à l'entreprise",
            error
          );
          return;
        }

        const domainIds = data.map((entry) => entry.iddomaine);
        const filtered = domains.filter((domain) =>
          domainIds.includes(domain.iddomaine)
        );

        setFilteredDomains(filtered);
      } else {
        setFilteredDomains(
          domains.filter((domain) =>
            ["escda", "satisfaction"].includes(domain.nomdomaine)
          )
        );
      }
    };

    fetchFilteredDomains();
  }, [domains, selectedEntreprise]);

  return { filteredDomains };
}
