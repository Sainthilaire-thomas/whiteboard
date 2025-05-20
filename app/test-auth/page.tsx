// app/test-auth/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseClient } from "@/lib/supabaseClient";

export default function TestAuth() {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookies] = useState([]);

  useEffect(() => {
    async function checkSession() {
      try {
        // Récupérer les informations de session
        const { data, error } = await supabaseClient.auth.getSession();
        console.log("Session data:", data);
        console.log("Session error:", error);
        setSessionInfo(data);

        // Essayer de lister les cookies disponibles
        if (typeof document !== "undefined") {
          setCookies(document.cookie.split(";").map((c) => c.trim()));
        }
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  const handleSignIn = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { error } = await supabase.auth.signInWithPassword({
      email: "test@example.com",
      password: "password",
    });

    if (error) {
      console.error("Erreur de connexion:", error);
    } else {
      window.location.reload();
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Test d'authentification</h1>

      <div style={{ marginBottom: 20 }}>
        <h2>État de session:</h2>
        <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h2>Cookies disponibles:</h2>
        <ul>
          {cookies.map((cookie, i) => (
            <li key={i}>{cookie}</li>
          ))}
        </ul>
      </div>

      <div>
        {sessionInfo?.session ? (
          <button onClick={handleSignOut}>Déconnexion</button>
        ) : (
          <button onClick={handleSignIn}>Connexion</button>
        )}
      </div>
    </div>
  );
}
