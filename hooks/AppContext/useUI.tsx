import { useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { DrawerContent, Review, AvatarText, UseUIResult } from "@/types/types";
import { useFetchAllData } from "@/hooks/AppContext/useFetchAllData";

export function useUI(): UseUIResult {
  const { data, fetchAllData, isLoading, error } = useFetchAllData();

  // 🗂️ Gestion du Drawer
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [drawerContent, setDrawerContent] = useState<DrawerContent | null>(
    null
  );

  // ✅ Ouvrir le drawer avec un contenu spécifique
  const openDrawer = useCallback((content: DrawerContent) => {
    setDrawerContent(content);
    setDrawerOpen(true);
  }, []);

  // ✅ Fermer le drawer
  const closeDrawer = useCallback(() => {
    setDrawerContent(null);
    setDrawerOpen(false);
  }, []);

  // ✅ Toggle du drawer
  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  // ✅ Définir manuellement le contenu du drawer
  const handleOpenDrawerWithContent = useCallback((content: DrawerContent) => {
    setDrawerContent(content);
    setDrawerOpen(true);
  }, []);

  // ✅ Définir des données spécifiques dans le drawer
  const handleOpenDrawerWithData = useCallback(
    async (idPratique: number, initialType: string): Promise<void> => {
      const selectedEntrepriseId = 6;
      await fetchAllData(idPratique, selectedEntrepriseId);

      if (data && data.pratiques && data.pratiques.categoriespratiques) {
        const categoryColor = data.pratiques.categoriespratiques.couleur;

        const drawerContentData: DrawerContent = {
          type: initialType,
          conseiller: data.fiche_conseiller_json,
          coach: data.fiche_coach_json,
          jeuDeRole: data.pratiques.jeuderole
            ? {
                content: data.pratiques.jeuderole,
                idpratique: data.idpratique,
                nompratique: data.pratiques.nompratique,
                couleur: categoryColor,
              }
            : null,
          categoryColor: categoryColor,
        };

        setDrawerContent(drawerContentData);
        setDrawerOpen(true);
      } else {
        console.error("Données incomplètes ou non disponibles :", data);
      }
    },
    [data, fetchAllData]
  );

  // ⭐ Gestion des avis utilisateurs
  const [reviews, setReviews] = useState<Review[]>([]);
  const [openReviewsDialog, setOpenReviewsDialog] = useState<boolean>(false);

  const fetchReviewsForPractice = useCallback(async (idPratique: number) => {
    const { data, error } = await supabaseClient
      .from("avisexercicesnudges")
      .select("avis, userlike")
      .eq("idpratique", idPratique);

    if (error) {
      console.error("Erreur lors de la récupération des avis :", error.message);
      return;
    }

    setReviews((data ?? []) as Review[]);
  }, []);

  const handleOpenReviewsDialog = async (idPratique: number) => {
    await fetchReviewsForPractice(idPratique);
    setOpenReviewsDialog(true);
  };

  const handleCloseReviewsDialog = () => setOpenReviewsDialog(false);

  // 👥 Gestion des avatars
  const [avatarTexts, setAvatarTexts] = useState<AvatarText>({});

  const updateAvatarText = (participantId: string, text: string) => {
    setAvatarTexts((prev) => ({ ...prev, [participantId]: text }));
  };

  return {
    // 🎛️ Drawer
    drawerOpen,
    drawerContent,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    setDrawerContent,
    handleOpenDrawerWithContent, // ✅ Correction ici
    handleOpenDrawerWithData, // ✅ Correction ici

    // ⭐ Avis
    reviews,
    fetchReviewsForPractice,
    openReviewsDialog,
    handleOpenReviewsDialog,
    handleCloseReviewsDialog,

    // 👥 Avatars
    avatarTexts,
    updateAvatarText,
  };
}
