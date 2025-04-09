import { useState, useEffect } from "react";
import { generateId } from "../utils/postitUtils";
import {
  PostitType,
  UsePostitsProps,
  ExtendedRolePlayData,
  SelectedPostitType,
} from "../types/types";

/**
 * Hook personnalisé pour gérer les post-its
 * @param params Paramètres du hook
 * @returns État et fonctions pour gérer les post-its
 */
export const usePostits = ({
  zoneColors,
  rolePlayData,
  selectedPostitForRolePlay,
}: UsePostitsProps) => {
  // États
  const [postits, setPostits] = useState<PostitType[]>([]);
  const [selectedClientText, setSelectedClientText] = useState<string>("");
  const [selectedConseillerText, setSelectedConseillerText] =
    useState<string>("");
  const [editPostitId, setEditPostitId] = useState<string | null>(null);
  const [editPostitContent, setEditPostitContent] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [newPostitContent, setNewPostitContent] = useState<string>("");

  // Initialiser avec les données existantes
  useEffect(() => {
    if (
      rolePlayData &&
      rolePlayData.postits &&
      rolePlayData.postits.length > 0
    ) {
      setPostits(rolePlayData.postits);
      if (rolePlayData.clientText) {
        setSelectedClientText(rolePlayData.clientText);
      }
      if (rolePlayData.conseillerText) {
        setSelectedConseillerText(rolePlayData.conseillerText);
      }
    } else if (selectedPostitForRolePlay?.text) {
      setSelectedClientText(selectedPostitForRolePlay.text);
    }
  }, [rolePlayData, selectedPostitForRolePlay]);

  // Ajouter un post-it à une zone
  const addPostitToZone = (zone: string, content: string): PostitType => {
    const newPostit: PostitType = {
      id: generateId(),
      content,
      zone,
      color: zoneColors[zone],
      isOriginal: false,
    };

    setPostits([...postits, newPostit]);
    return newPostit;
  };

  // Ajouter un post-it catégorisé
  const addCategorizedText = (
    textToCategorizze: string,
    selectedCategory: string
  ): PostitType | null => {
    if (textToCategorizze.trim() === "" || !selectedCategory) return null;

    const newPostit: PostitType = {
      id: generateId(),
      content: textToCategorizze,
      zone: selectedCategory,
      color: zoneColors[selectedCategory],
      isOriginal: true,
    };

    setPostits([...postits, newPostit]);
    return newPostit;
  };

  // Supprimer un post-it
  const deletePostit = (id: string): void => {
    setPostits(postits.filter((postit) => postit.id !== id));
  };

  // Ouvrir la boîte de dialogue d'édition
  const openEditDialog = (id: string, content: string): void => {
    setEditPostitId(id);
    setEditPostitContent(content);
    setIsEditDialogOpen(true);
  };

  // Mettre à jour le contenu d'un post-it sans ouvrir la boîte de dialogue
  const updatePostitContent = (id: string, content: string): void => {
    if (id && content.trim() !== "") {
      setPostits(
        postits.map((postit) =>
          postit.id === id ? { ...postit, content: content } : postit
        )
      );
    }
  };
  // Sauvegarder l'édition d'un post-it
  const savePostitEdit = (): void => {
    if (editPostitId && editPostitContent.trim() !== "") {
      setPostits(
        postits.map((postit) =>
          postit.id === editPostitId
            ? { ...postit, content: editPostitContent }
            : postit
        )
      );
    }
    setIsEditDialogOpen(false);
    setEditPostitId(null);
    setEditPostitContent("");
  };

  // Ajouter des post-its depuis la reconnaissance vocale
  const addPostitsFromSpeech = (newPostits: PostitType[]): void => {
    setPostits([...postits, ...newPostits]);
  };

  // Filtrer les post-its par zone
  const getPostitsByZone = (zone: string): PostitType[] => {
    return postits.filter((postit) => postit.zone === zone);
  };

  // Vérifier si des post-its originaux existent
  const hasOriginalPostits = postits.some((p) => p.isOriginal);

  return {
    postits,
    setPostits,
    selectedClientText,
    setSelectedClientText,
    selectedConseillerText,
    setSelectedConseillerText,
    editPostitId,
    editPostitContent,
    isEditDialogOpen,
    setIsEditDialogOpen,
    newPostitContent,
    setNewPostitContent,
    addPostitToZone,
    addCategorizedText,
    deletePostit,
    openEditDialog,
    savePostitEdit,
    addPostitsFromSpeech,
    getPostitsByZone,
    hasOriginalPostits,
    setEditPostitContent,
    updatePostitContent,
  };
};
