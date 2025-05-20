"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSupabase } from "@/context/SupabaseContext";
import { AuthContextType } from "@/types/context/AuthContext/AuthContextTypes";
import { usePathname } from "next/navigation"; // Utilisez usePathname au lieu de useRouter

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    loginWithRedirect,
    isAuthenticated,
    getIdTokenClaims,
    handleRedirectCallback,
    logout,
  } = useAuth0();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname(); // Utilisez usePathname au lieu de useRouter
  const { setSupabaseSession } = useSupabase();

  useEffect(() => {
    const authenticateWithSupabase = async () => {
      if (isAuthenticated) {
        try {
          const idTokenClaims = await getIdTokenClaims();
          if (!idTokenClaims?.__raw) {
            console.error("Le token JWT est manquant.");
            return;
          }

          const token = idTokenClaims.__raw;
          setSupabaseSession(token);
        } catch (error) {
          console.error("Erreur lors de la récupération du token:", error);
        }
      }
    };

    if (isAuthenticated) {
      authenticateWithSupabase();
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, getIdTokenClaims, setSupabaseSession]);

  const login = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          redirect_uri: process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI,
        },
      });
    } catch (err) {
      console.error("Erreur lors de la redirection de connexion :", err);
    }
  };

  const handleAuth0Redirect = async () => {
    try {
      await handleRedirectCallback();
      // Au lieu d'utiliser router.push, vous pouvez utiliser window.location
      window.location.href = "/";
    } catch (err) {
      console.error("Erreur lors de la gestion de la redirection Auth0 :", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        handleAuth0Redirect,
        logout,
        isAuthenticated: !!isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
