"use client";

type WorkDriveItemAttributes = {
  name: string;
  is_folder?: boolean;
  type?: string;
  mime_type?: string;
  size?: number;
  modified_time?: string;
  download_url?: string;
};

type WorkDriveItem = {
  id: string;
  attributes: WorkDriveItemAttributes;
};

export interface FolderNode {
  id: string;
  name: string;
  type: "folders";
  is_folder: true;
  children: (FolderNode | FileNode)[];
}

export interface FileNode {
  id: string;
  name: string;
  type: "files";
  mime_type: string;
  size: number;
  modified_time: string;
  download_link: string;
}

// Fonction utilitaire de pause
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Récupère une page de fichiers d’un dossier
const fetchFolderPage = async (
  apiProxyUrl: string,
  folderId: string,
  accessToken: string,
  offset = 0,
  limit = 50
): Promise<WorkDriveItem[]> => {
  const path = encodeURIComponent(
    `/files/${folderId}/files?page[offset]=${offset}&page[limit]=${limit}`
  );
  const url = `${apiProxyUrl}?path=${path}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erreur HTTP ${response.status} : ${response.statusText}`
      );
    }

    const result = await response.json();
    return Array.isArray(result.data) ? result.data : [];
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération de ${folderId}:`, error);
    return [];
  }
};

// Transforme les données WorkDrive en structure arborescente
const transformWorkDriveData = (
  items: WorkDriveItem[]
): (FolderNode | FileNode)[] => {
  return items.map((item) => {
    const { name = "Sans nom" } = item.attributes;
    const isFolder =
      item.attributes.is_folder || item.attributes.type === "folder";

    if (isFolder) {
      return {
        id: item.id,
        name,
        type: "folders",
        is_folder: true,
        children: [],
      } as FolderNode;
    } else {
      return {
        id: item.id,
        name,
        type: "files",
        mime_type: item.attributes.mime_type ?? "inconnu",
        size: item.attributes.size ?? 0,
        modified_time: item.attributes.modified_time ?? "non disponible",
        download_link: item.attributes.download_url ?? "",
      } as FileNode;
    }
  });
};

// Fonction récursive pour explorer tous les dossiers et sous-dossiers
export const fetchWorkDriveTree = async (
  folderId: string,
  accessToken: string,
  delay = 1000
): Promise<FolderNode | null> => {
  const API_PROXY_URL = "http://localhost:8888/.netlify/functions/zohoProxy";

  const fetchFolderContents = async (
    folderId: string,
    level = 0
  ): Promise<(FolderNode | FileNode)[]> => {
    let allItems: WorkDriveItem[] = [];
    let offset = 0;
    const limit = 50;
    let hasMore = true;

    while (hasMore) {
      const pageItems = await fetchFolderPage(
        API_PROXY_URL,
        folderId,
        accessToken,
        offset,
        limit
      );

      if (!Array.isArray(pageItems)) {
        console.warn(`⚠️ Données non valides pour le dossier ${folderId}`);
        break;
      }

      allItems = [...allItems, ...pageItems];
      console.log(
        `${" ".repeat(level * 2)}🔄 Page ${offset / limit + 1} : ${
          pageItems.length
        } éléments récupérés`
      );

      hasMore = pageItems.length === limit;
      offset += limit;

      if (hasMore) await sleep(delay); // Pause entre les appels pour éviter le throttling
    }

    const children = transformWorkDriveData(allItems);

    // Exploration récursive des sous-dossiers
    for (const child of children) {
      if (child.type === "folders" && child.is_folder) {
        console.log(
          `${" ".repeat(level * 2)}🔍 Exploration du sous-dossier : ${
            child.name
          }`
        );
        child.children = await fetchFolderContents(child.id, level + 1);
      }
    }

    return children;
  };

  console.log("🚀 Début de l'exploration de l’arborescence...");
  const children = await fetchFolderContents(folderId);

  const rootFolder: FolderNode = {
    id: folderId,
    name: `Dossier ${folderId}`,
    type: "folders",
    is_folder: true,
    children,
  };

  console.log("✅ Arborescence complète :", rootFolder);

  // Sauvegarde dans le localStorage
  localStorage.setItem("workdriveTree", JSON.stringify(rootFolder));
  console.log("📦 Arborescence enregistrée dans le localStorage.");

  return rootFolder;
};
