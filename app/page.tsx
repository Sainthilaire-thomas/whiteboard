"use client"; // Utiliser le composant côté client

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabaseClient"; // Importer le client Supabase
import {
  Button,
  Tooltip,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Image from "next/image"; // Utilisation du composant Image de Next.js pour optimiser les images
import { useRouter } from "next/navigation"; // Pour gérer les redirections

interface CustomTooltipProps {
  title: string;
  body: string;
  subTitle: string;
  subBody: string;
  isValid: boolean;
}

// Composant CustomTooltip pour les Tooltips
const CustomTooltip = ({
  title,
  body,
  subTitle,
  subBody,
  isValid,
}: CustomTooltipProps) => (
  <Box sx={{ maxWidth: 280, p: 1, border: isValid ? "none" : "2px solid red" }}>
    <Typography color="info.main" variant="subtitle1" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ mb: 1 }}>
      {body}
    </Typography>
    <Typography color="secondary.light" variant="subtitle2" gutterBottom>
      {subTitle}
    </Typography>
    <Typography variant="body2">{subBody}</Typography>
  </Box>
);

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // Vérifier si le composant est monté côté client
  const router = useRouter(); // Hook pour la redirection du App Router

  // Vérification de la session avec Supabase
  useEffect(() => {
    setIsClient(true); // Le composant est maintenant monté côté client
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();
      if (error) {
        console.error("Erreur Supabase :", error.message);
      }
      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        router.push("/whiteboard"); // Si l'utilisateur est déjà connecté, rediriger vers /whiteboard
      } else {
        setIsAuthenticated(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLoginRedirect = () => {
    router.push("/login"); // Redirige vers la page de login
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "primary.main",
          backgroundColor: "#121212",
        }}
      >
        <CircularProgress />
      </Box>
    ); // Afficher un spinner pendant le chargement
  }

  if (!isClient) {
    return null; // Ne pas rendre le composant avant que le client soit monté
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100vh",
        backgroundImage: "url('/page_login.png')", // Accès à l'image via le chemin relatif depuis public
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "background.default",
      }}
    >
      {/* Logo et contenu de la page */}
      <Box
        sx={{
          position: "absolute",
          bottom: 60,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Image
          src="/logosonear.png"
          alt="SoNear Logo"
          width={120}
          height={120}
        />
      </Box>

      {/* Affichage du contenu selon l'état d'authentification */}
      {isAuthenticated ? (
        <Box
          sx={{
            position: "absolute",
            bottom: 40,
            right: 20,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontSize: "1.5rem" }}>
            Bienvenue !
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {user?.email}
          </Typography>
          <Button variant="contained" color="secondary">
            Se déconnecter
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            position: "absolute",
            bottom: 40,
            right: 20,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            color="textPrimary"
            gutterBottom
            sx={{ fontSize: "1.2rem" }}
          >
            Vous n'êtes pas encore connecté.
          </Typography>
          {/* Bouton "Se connecter" qui redirige vers la page de login */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleLoginRedirect}
          >
            Se connecter
          </Button>
        </Box>
      )}

      {/* Tooltips */}
      <Tooltip
        title={
          <CustomTooltip
            title="Répondez à ce que dit le client"
            body="Faites une cartographie..."
            subTitle="Bénéfices"
            subBody="Vous simplifierez vos parcours clients."
            isValid={true}
          />
        }
        placement="top"
        arrow
      >
        <IconButton
          sx={{
            position: "absolute",
            top: "25%",
            left: "30%",
            animation: "pulse 2s infinite",
          }}
        >
          <HelpOutlineIcon color="info" />
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          <CustomTooltip
            title="Entraînez le conseiller"
            body="Identifiez les gestes..."
            subTitle="Bénéfices"
            subBody="Entraînez vos conseillers à ancrer..."
            isValid={true}
          />
        }
        placement="top"
        arrow
      >
        <IconButton
          sx={{
            position: "absolute",
            top: "24%",
            left: "80%",
            animation: "pulse 2s infinite",
          }}
        >
          <HelpOutlineIcon color="info" />
        </IconButton>
      </Tooltip>

      <Tooltip
        title={
          <CustomTooltip
            title="Raccordez vos évaluations"
            body="Simplifiez vos calibrages..."
            subTitle="Bénéfices"
            subBody="Vous gagnerez du temps..."
            isValid={true}
          />
        }
        placement="top"
        arrow
      >
        <IconButton
          sx={{
            position: "absolute",
            top: "80%",
            left: "60%",
            animation: "pulse 2s infinite",
          }}
        >
          <HelpOutlineIcon color="info" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Home;
