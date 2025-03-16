"use server";

import { getSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const supabase = await getSupabaseServer();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Veuillez entrer un email et un mot de passe.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Erreur de connexion :", error.message);
    throw new Error("Identifiants incorrects. Veuillez réessayer.");
  }

  // ✅ Redirection après succès
  redirect("/whiteboard");
}
