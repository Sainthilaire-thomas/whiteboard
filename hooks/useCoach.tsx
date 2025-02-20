"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export function useCoach() {
  const [coach, setCoach] = useState<User | null>(null);
  const router = useRouter();

  const isCoach = coach?.email === "thomassonear@gmail.com";

  const checkCoach = async () => {
    const { data } = await supabaseClient.auth.getUser();
    setCoach(data.user ?? null);
  };

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setCoach(null);
    router.push("/whiteboard");
  };

  useEffect(() => {
    checkCoach();

    const { data: listener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setCoach(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { coach, isCoach, handleLogout };
}
