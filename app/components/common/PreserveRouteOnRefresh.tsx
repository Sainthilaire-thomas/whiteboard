"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallData } from "@/context/CallDataContext";

export default function PreserveRouteOnRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { selectedCall, selectCall, calls } = useCallData();

  useEffect(() => {
    // Cette fonction est exécutée uniquement lors du chargement initial ou du rafraîchissement
    const handleInitialLoad = async () => {
      // Si nous sommes sur la page d'évaluation
      if (pathname === "/evaluation") {
        // Vérifier si un callId est présent dans l'URL
        const callIdParam = searchParams.get("callId");

        console.log("PreserveRouteOnRefresh - callIdParam:", callIdParam);
        console.log(
          "PreserveRouteOnRefresh - calls disponibles:",
          calls.length
        );
        console.log(
          "PreserveRouteOnRefresh - selectedCall:",
          selectedCall ? selectedCall.callid : "aucun"
        );

        // Si un callId est dans l'URL et qu'aucun appel n'est actuellement sélectionné
        if (callIdParam && !selectedCall && calls && calls.length > 0) {
          console.log(
            "PreserveRouteOnRefresh - recherche de l'appel avec ID:",
            callIdParam
          );

          // Trouver l'appel correspondant
          const call = calls.find((c) => c.callid.toString() === callIdParam);

          if (call) {
            console.log(
              "PreserveRouteOnRefresh - appel trouvé, sélection en cours"
            );
            // Sélectionner cet appel - cela devrait déclencher l'autre useEffect dans Evaluation.tsx
            selectCall(call);
          } else {
            console.log(
              "PreserveRouteOnRefresh - appel non trouvé dans la liste"
            );
          }
        }

        // Si aucun paramètre view n'est présent et qu'un appel est sélectionné
        if (!searchParams.get("view") && selectedCall) {
          console.log(
            "PreserveRouteOnRefresh - aucune vue spécifiée, redirection vers synthese"
          );
          // Construire l'URL avec à la fois le view et le callId
          const newUrl = `/evaluation?view=synthese&callId=${selectedCall.callid}`;
          router.replace(newUrl, { scroll: false });
        }
      }
    };

    // Ne déclencher cette logique que si calls est chargé (pour éviter les appels prématurés)
    if (calls && calls.length > 0) {
      handleInitialLoad();
    }
  }, [pathname, searchParams, router, selectedCall, selectCall, calls]);

  return null;
}
