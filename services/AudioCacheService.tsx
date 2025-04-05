// src/services/AudioCacheService.ts
import localforage from "localforage";

// Configuration de localforage pour le stockage audio
const audioCache = localforage.createInstance({
  name: "audioCache",
  storeName: "audioFiles",
  description: "Cache pour les fichiers audio",
});

// Clé pour le registre des métadonnées audio
const AUDIO_REGISTRY_KEY = "audioRegistry";

// Interface pour les métadonnées d'un fichier audio en cache
interface CachedAudioMetadata {
  callId: number;
  filepath: string;
  filename: string;
  size: number;
  cachedAt: number; // timestamp
  lastAccessed: number; // timestamp
}

// Service de cache audio
export const AudioCacheService = {
  /**
   * Enregistre un fichier audio dans le cache
   * @param callId Identifiant de l'appel
   * @param filepath Chemin du fichier sur le serveur
   * @param filename Nom du fichier
   * @param audioBlob Blob contenant les données audio
   */
  async cacheAudio(
    callId: number,
    filepath: string,
    filename: string,
    audioBlob: Blob
  ): Promise<boolean> {
    try {
      // Calculer la taille du fichier en Mo
      const sizeMB = audioBlob.size / (1024 * 1024);

      // Vérifier l'espace disponible
      await this.ensureCacheSpace(sizeMB);

      // Enregistrer le blob
      const cacheKey = `audio_${callId}`;
      await audioCache.setItem(cacheKey, audioBlob);

      // Mettre à jour le registre des fichiers
      await this.updateRegistry(callId, filepath, filename, audioBlob.size);

      console.log(
        `✅ Audio mis en cache: ${filename} (${sizeMB.toFixed(2)} Mo)`
      );
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de la mise en cache audio:", error);
      return false;
    }
  },

  /**
   * Récupère un fichier audio depuis le cache
   * @param callId Identifiant de l'appel
   * @returns URL objet pour le fichier audio ou null si non trouvé
   */
  async getAudio(callId: number): Promise<string | null> {
    try {
      const cacheKey = `audio_${callId}`;
      const audioBlob = await audioCache.getItem<Blob>(cacheKey);

      if (!audioBlob) {
        return null;
      }

      // Mettre à jour le timestamp de dernier accès
      await this.updateLastAccessed(callId);

      // Créer une URL d'objet à partir du blob
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération audio depuis le cache:",
        error
      );
      return null;
    }
  },

  /**
   * Vérifie si un fichier audio est en cache
   * @param callId Identifiant de l'appel
   * @returns true si l'audio est en cache
   */
  async isAudioCached(callId: number): Promise<boolean> {
    const cacheKey = `audio_${callId}`;
    return (await audioCache.getItem(cacheKey)) !== null;
  },

  /**
   * Met à jour le registre des fichiers audio en cache
   */
  async updateRegistry(
    callId: number,
    filepath: string,
    filename: string,
    size: number
  ): Promise<void> {
    // Récupérer le registre existant
    const registry = await this.getRegistry();

    // Mettre à jour l'entrée pour ce fichier
    registry[callId] = {
      callId,
      filepath,
      filename,
      size,
      cachedAt: Date.now(),
      lastAccessed: Date.now(),
    };

    // Sauvegarder le registre mis à jour
    await localforage.setItem(AUDIO_REGISTRY_KEY, registry);
  },

  /**
   * Met à jour le timestamp de dernier accès pour un fichier audio
   */
  async updateLastAccessed(callId: number): Promise<void> {
    const registry = await this.getRegistry();

    if (registry[callId]) {
      registry[callId].lastAccessed = Date.now();
      await localforage.setItem(AUDIO_REGISTRY_KEY, registry);
    }
  },

  /**
   * Récupère le registre des fichiers audio en cache
   */
  async getRegistry(): Promise<Record<number, CachedAudioMetadata>> {
    const registry = await localforage.getItem<
      Record<number, CachedAudioMetadata>
    >(AUDIO_REGISTRY_KEY);
    return registry || {};
  },

  /**
   * S'assure qu'il y a assez d'espace dans le cache pour un nouveau fichier
   * en supprimant les fichiers les moins récemment utilisés si nécessaire
   */
  async ensureCacheSpace(newFileSizeMB: number): Promise<void> {
    // Taille maximale du cache en Mo (50 Mo par défaut)
    const MAX_CACHE_SIZE_MB = 50;

    // Récupérer le registre
    const registry = await this.getRegistry();

    // Calculer la taille actuelle du cache
    let currentCacheSize = 0;
    Object.values(registry).forEach(
      (metadata) => (currentCacheSize += metadata.size / (1024 * 1024))
    );

    // Si l'ajout du nouveau fichier dépasserait la limite, supprimer des fichiers
    if (currentCacheSize + newFileSizeMB > MAX_CACHE_SIZE_MB) {
      // Trier les fichiers par date de dernier accès (du plus ancien au plus récent)
      const sortedFiles = Object.values(registry).sort(
        (a, b) => a.lastAccessed - b.lastAccessed
      );

      // Supprimer les fichiers jusqu'à avoir assez d'espace
      for (const file of sortedFiles) {
        if (currentCacheSize + newFileSizeMB <= MAX_CACHE_SIZE_MB) {
          break;
        }

        // Supprimer le fichier du cache
        await audioCache.removeItem(`audio_${file.callId}`);
        delete registry[file.callId];

        // Mettre à jour la taille du cache
        currentCacheSize -= file.size / (1024 * 1024);

        console.log(`🗑️ Fichier audio supprimé du cache: ${file.filename}`);
      }

      // Mettre à jour le registre
      await localforage.setItem(AUDIO_REGISTRY_KEY, registry);
    }
  },

  /**
   * Télécharge un fichier audio depuis l'URL signée et le met en cache
   */
  async downloadAndCacheAudio(
    callId: number,
    filepath: string,
    signedUrl: string
  ): Promise<string | null> {
    try {
      // Extraire le nom du fichier du chemin
      const filename = filepath.split("/").pop() || `audio_${callId}.mp3`;

      // Vérifier si l'audio est déjà en cache
      if (await this.isAudioCached(callId)) {
        console.log(`🔄 Audio déjà en cache: ${filename}`);
        return await this.getAudio(callId);
      }

      console.log(`⬇️ Téléchargement de l'audio: ${filename}`);

      // Télécharger le fichier audio
      const response = await fetch(signedUrl);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Convertir la réponse en blob
      const audioBlob = await response.blob();

      // Mettre en cache
      const success = await this.cacheAudio(
        callId,
        filepath,
        filename,
        audioBlob
      );

      if (success) {
        return URL.createObjectURL(audioBlob);
      }

      return signedUrl; // Fallback sur l'URL signée si la mise en cache échoue
    } catch (error) {
      console.error(
        "❌ Erreur lors du téléchargement/mise en cache audio:",
        error
      );
      return signedUrl; // Fallback sur l'URL signée
    }
  },

  /**
   * Nettoie le cache audio
   */
  async clearCache(): Promise<void> {
    try {
      console.log("🧹 Nettoyage du cache audio...");
      await audioCache.clear();
      await localforage.removeItem(AUDIO_REGISTRY_KEY);
      console.log("✅ Cache audio nettoyé");
    } catch (error) {
      console.error("❌ Erreur lors du nettoyage du cache audio:", error);
    }
  },
};

export default AudioCacheService;
