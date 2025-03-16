import { useState, useEffect } from "react";
import { AuthUser, AuthContextType } from "@/types/types";
import { useAuth0 } from "@auth0/auth0-react";

export function useAuth(): AuthContextType {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } =
    useAuth0();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (user) {
      setAuthUser({
        id: user.sub ?? "", // Assure que l'ID ne soit jamais undefined
        email: user.email ?? null, // Remplace undefined par null
        name: user.name ?? null, // Remplace undefined par null
        avatarUrl: user.picture ?? null, // Remplace undefined par null
      });
    } else {
      setAuthUser(null);
    }
  }, [user]);

  return {
    user: authUser,
    isAuthenticated,
    isLoading,
    login: async () => loginWithRedirect(),
    logout: async () => logout(),
  };
}
