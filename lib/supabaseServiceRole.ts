// lib/supabaseServiceRole.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec Service Role Key
 * À utiliser UNIQUEMENT côté serveur pour :
 * - Opérations admin (bypass RLS)
 * - Actions pour utilisateurs non-authentifiés
 * - Opérations systèmes
 *
 * ⚠️ ATTENTION : Ne jamais exposer côté client !
 */
export const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Fonction helper pour les opérations sur le schéma whiteboard
 * avec Service Role (accès complet)
 */
export const getWhiteboardServiceRole = () => {
  return supabaseServiceRole.schema("whiteboard");
};

/**
 * Fonction helper pour vérifier si le Service Role fonctionne
 */
export const testServiceRoleConnection = async () => {
  try {
    const { data, error } = await supabaseServiceRole
      .schema("whiteboard")
      .from("shared_evaluation_sessions")
      .select("count")
      .limit(1);

    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
