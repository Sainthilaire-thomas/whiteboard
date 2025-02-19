"use client";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";

export default function DebugSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      console.log("Session récupérée :", data);
      setSession(data.session);
    };

    fetchSession();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Événement de session :", event, session);
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div style={{ color: "white", background: "black", padding: "10px" }}>
      <h3>Session Debug:</h3>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
