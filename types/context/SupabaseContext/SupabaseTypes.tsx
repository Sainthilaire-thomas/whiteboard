import { SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseContextType {
  supabase: SupabaseClient;
  isSupabaseReady: boolean;
  setIsSupabaseReady: (ready: boolean) => void;
  handleSupabaseLogout: (redirectTo?: string) => Promise<void>;
}
