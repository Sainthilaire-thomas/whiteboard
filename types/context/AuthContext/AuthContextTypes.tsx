export interface AuthContextType {
  login: () => Promise<void>;
  handleAuth0Redirect: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
