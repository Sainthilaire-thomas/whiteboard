"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabaseClient } from "@lib/supabaseClient";

// ✅ Type étendu pour inclure les nouvelles vues
type ViewName =
  | "Transcript"
  | "coaching"
  | "sondage"
  | "postit"
  | "shared-evaluation";

type CurrentViewContextType = {
  currentView: ViewName;
  changeView: (view: ViewName) => void;
};

const CurrentViewContext = createContext<CurrentViewContextType | undefined>(
  undefined
);

export const CurrentViewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentView, setCurrentView] = useState<ViewName>("Transcript");

  // 🔔 Récupère la vue initiale
  useEffect(() => {
    const fetchCurrentView = async () => {
      const { data, error } = await supabaseClient
        .schema("whiteboard")
        .from("current_view")
        .select("view_name")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (data) {
        // ✅ Validation de la vue récupérée
        const validViews: ViewName[] = [
          "Transcript",
          "coaching",
          "sondage",
          "postit",
          "shared-evaluation",
        ];

        if (validViews.includes(data.view_name as ViewName)) {
          setCurrentView(data.view_name as ViewName);
        } else {
          console.warn("⚠️ Vue inconnue récupérée:", data.view_name);
          setCurrentView("Transcript"); // Fallback
        }
      } else if (error) {
        console.error("❌ Erreur récupération vue :", error);
      }
    };

    fetchCurrentView();
  }, []);

  // 🛰️ Écoute les changements en temps réel
  useEffect(() => {
    const channel = supabaseClient
      .channel("current_view_channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "whiteboard", table: "current_view" },
        (payload) => {
          console.log("🔄 Vue mise à jour :", payload.new.view_name);

          // ✅ Validation de la nouvelle vue
          const newView = payload.new.view_name;
          const validViews: ViewName[] = [
            "Transcript",
            "coaching",
            "sondage",
            "postit",
            "shared-evaluation",
          ];

          if (validViews.includes(newView as ViewName)) {
            setCurrentView(newView as ViewName);
          } else {
            console.warn("⚠️ Vue inconnue reçue:", newView);
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel); // Nettoyage
    };
  }, []);

  // 🚀 Change la vue côté coach
  const changeView = useCallback(async (view: ViewName) => {
    console.log("📡 Changement de vue vers:", view);

    setCurrentView(view); // Mise à jour immédiate côté client

    try {
      const { error } = await supabaseClient
        .schema("whiteboard")
        .from("current_view")
        .update({
          view_name: view,
          updated_at: new Date().toISOString(), // ✅ Assurer la mise à jour du timestamp
        })
        .eq("id", 1); // Remplace par l'ID correct si nécessaire

      if (error) {
        console.error("❌ Erreur mise à jour vue :", error);
        // En cas d'erreur, on peut optionnellement revenir à l'état précédent
        // ou afficher une notification à l'utilisateur
      } else {
        console.log("✅ Vue mise à jour avec succès:", view);
      }
    } catch (err) {
      console.error("💥 Erreur inattendue lors du changement de vue:", err);
    }
  }, []);

  return (
    <CurrentViewContext.Provider value={{ currentView, changeView }}>
      {children}
    </CurrentViewContext.Provider>
  );
};

export const useCurrentView = () => {
  const context = useContext(CurrentViewContext);
  if (!context)
    throw new Error(
      "useCurrentView doit être utilisé dans CurrentViewProvider"
    );
  return context;
};

// ✅ Export du type pour utilisation dans d'autres composants
export type { ViewName };
