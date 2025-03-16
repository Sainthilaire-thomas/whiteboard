"use client"; // Utiliser le composant côté client

import { useState, useEffect } from "react";
import { supabaseClient } from "@lib/supabaseClient"; // Importer le client Supabase
import { useRouter } from "next/navigation"; // Pour gérer les redirections
import {
  Modal,
  Button,
  Box,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material"; // Utilisation de MUI pour le modal

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // Utilisation du hook pour la redirection

  const [open, setOpen] = useState(true); // Ouvrir le modal par défaut

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabaseClient.auth.getUser();
      if (data.user) {
        router.push("/whiteboard"); // Si l'utilisateur est déjà connecté, rediriger vers le tableau blanc
      }
    };
    checkUser();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Identifiants incorrects. Veuillez réessayer.");
      setIsLoading(false);
      return;
    }

    // Si l'authentification réussie, rediriger vers /whiteboard
    router.push("/whiteboard");
    setOpen(false); // Fermer le modal après la connexion réussie
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="login-modal"
    >
      <Box
        sx={{
          width: 400,
          margin: "auto",
          padding: 2,
          backgroundColor: "white",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Connexion
        </Typography>

        {/* Affichage des erreurs si elles existent */}
        {error && (
          <Typography variant="body2" color="error" sx={{ marginBottom: 2 }}>
            {error}
          </Typography>
        )}

        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
          }}
        >
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            variant="outlined"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </Box>
    </Modal>
  );
}
