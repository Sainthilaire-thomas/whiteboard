"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabaseClient } from "@lib/supabaseClient";

type CurrentViewContextType = {
  currentView: string;
  changeView: (view: string) => void;
};

const CurrentViewContext = createContext<CurrentViewContextType | undefined>(
  undefined
);

export const CurrentViewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentView, setCurrentView] = useState<string>("Transcript");

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
        setCurrentView(data.view_name);
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
          setCurrentView(payload.new.view_name); // Met à jour en temps réel
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel); // Nettoyage
    };
  }, []);

  // 🚀 Change la vue côté coach
  const changeView = useCallback(async (view: string) => {
    setCurrentView(view); // Mise à jour immédiate côté client
    const { error } = await supabaseClient
      .schema("whiteboard")
      .from("current_view")
      .update({ view_name: view })
      .eq("id", 1); // Remplace par l'ID correct si nécessaire

    if (error) console.error("❌ Erreur mise à jour vue :", error);
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
