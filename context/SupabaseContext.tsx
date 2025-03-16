import { createContext, useContext, useState, ReactNode } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

interface SupabaseContextType {
  supabase: typeof supabaseClient;
  isSupabaseReady: boolean;
  setIsSupabaseReady: (ready: boolean) => void;
  handleSupabaseLogout: (redirectTo?: string) => Promise<void>;
  setSupabaseSession: (token: string) => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  // Fonction pour initialiser la session
  const setSupabaseSession = async (token: string) => {
    try {
      const { error } = await supabaseClient.auth.setSession({
        access_token: token,
        refresh_token: token, // Si nécessaire, sinon supprime cette ligne
      });

      if (error) {
        console.error("Erreur de session Supabase:", error);
      } else {
        console.log("Session Supabase établie avec succès !");
        setIsSupabaseReady(true); // Met Supabase comme prêt
      }
    } catch (err) {
      console.error("Erreur lors de la création de session Supabase:", err);
    }
  };

  // Fonction de déconnexion
  const handleSupabaseLogout = async (redirectTo = "/home") => {
    try {
      await supabaseClient.auth.signOut();
      setIsSupabaseReady(false);
      window.location.href = redirectTo; // Redirection après la déconnexion
    } catch (error) {
      console.error("Erreur de déconnexion Supabase:", error);
    }
  };

  return (
    <SupabaseContext.Provider
      value={{
        supabase: supabaseClient,
        isSupabaseReady,
        setIsSupabaseReady,
        handleSupabaseLogout,
        setSupabaseSession,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};

// Hook personnalisé pour accéder au contexte
export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
