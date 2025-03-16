"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabaseClient.auth.getUser();
      if (data.user) {
        router.push("/whiteboard"); // ✅ Redirige vers le tableau blanc si connecté
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      return;
    }

    router.push("/whiteboard"); // ✅ Redirige après connexion réussie
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-lg font-bold">Connexion</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col space-y-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Se connecter
        </button>
      </form>
    </div>
  );
}
