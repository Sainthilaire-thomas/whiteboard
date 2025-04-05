import AudioCacheService from "./AudioCacheService";
import { supabaseClient } from "@/lib/supabaseClient";

/**
 * Service qui gère toutes les opérations liées à l'audio,
 * y compris l'obtention des URLs signées et la mise en cache.
 */
export const AudioService = {
  /**
   * Crée une URL pour un fichier audio, en vérifiant d'abord le cache
   * @param filepath Chemin du fichier sur le serveur
   * @param callId ID de l'appel (optionnel)
   */
  async getAudioUrl(filepath: string, callId?: number): Promise<string | null> {
    try {
      if (!filepath) {
        console.warn("⚠️ Aucun chemin de fichier fourni");
        return null;
      }

      // Si l'ID d'appel est fourni, vérifier d'abord le cache
      if (callId) {
        if (await AudioCacheService.isAudioCached(callId)) {
          console.log(
            "📦 Utilisation de l'audio en cache pour callId:",
            callId
          );
          return await AudioCacheService.getAudio(callId);
        }
      } else {
        // Tenter d'extraire l'ID de l'appel du chemin du fichier
        const callIdMatch = filepath.match(/(\d+)\.mp3$/);
        callId = callIdMatch ? parseInt(callIdMatch[1]) : undefined;

        if (callId && (await AudioCacheService.isAudioCached(callId))) {
          console.log("📦 Utilisation de l'audio en cache (ID extrait)");
          return await AudioCacheService.getAudio(callId);
        }
      }

      // Si pas en cache, obtenir une URL signée
      console.log("🔄 Génération d'une URL audio signée pour:", filepath);
      const signedUrl = await this.createDirectSignedUrl(filepath);

      if (!signedUrl) {
        throw new Error("Impossible d'obtenir une URL signée");
      }

      // Si nous avons un ID d'appel, télécharger et mettre en cache
      if (callId) {
        return await AudioCacheService.downloadAndCacheAudio(
          callId,
          filepath,
          signedUrl
        );
      }

      return signedUrl;
    } catch (error) {
      console.error("🔴 Erreur lors de la création de l'URL audio:", error);
      return null;
    }
  },

  /**
   * Génère une URL signée directement via Supabase
   * @param filePath Chemin du fichier audio (peut inclure déjà le préfixe 'audio/')
   */
  async createDirectSignedUrl(filePath: string): Promise<string | null> {
    try {
      // Ajouter le préfixe 'audio/' si absent
      if (!filePath.startsWith("audio/")) {
        filePath = `audio/${filePath}`;
      }

      const { data, error } = await supabaseClient.storage
        .from("Calls")
        .createSignedUrls([filePath], 60);

      if (error) {
        console.error("🔴 Erreur directe Supabase:", error);
        return null;
      }

      // Retourne la première URL signée du tableau
      return data.signedUrls[0] || null;
    } catch (error) {
      console.error("🔴 Erreur lors de la génération directe d'URL:", error);
      return null;
    }
  },

  /**
   * Vérifie si un fichier audio est en cache
   * @param callId ID de l'appel
   */
  async isAudioInCache(callId: number): Promise<boolean> {
    return AudioCacheService.isAudioCached(callId);
  },

  /**
   * Nettoie le cache audio
   */
  async clearCache(): Promise<void> {
    return AudioCacheService.clearCache();
  },
};

export default AudioService;
