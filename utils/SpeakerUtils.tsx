// src/utils/speakerUtils.ts

/**
 * Types de locuteurs dans une transcription
 */
export enum SpeakerType {
  CONSEILLER = "conseiller",
  CLIENT = "client",
  UNKNOWN = "unknown",
}

/**
 * Toutes les valeurs possibles pour le champ 'turn' dans la table word
 */
export type TurnValue =
  | "turn1"
  | "turn2"
  | "tc"
  | "app"
  | "appelant"
  | "conseiller"
  | string;

/**
 * Détermine le type de locuteur à partir de la valeur du champ 'turn'
 * @param turn La valeur du champ 'turn' de la table word
 * @returns Le type de locuteur
 */
export function getSpeakerType(turn: TurnValue): SpeakerType {
  if (isSpeakerConseil(turn)) {
    return SpeakerType.CONSEILLER;
  } else if (isSpeakerClient(turn)) {
    return SpeakerType.CLIENT;
  }
  return SpeakerType.UNKNOWN;
}

/**
 * Vérifie si le locuteur est un conseiller
 * @param turn La valeur du champ 'turn' de la table word
 * @returns true si le locuteur est un conseiller, false sinon
 */
export function isSpeakerConseil(turn: TurnValue): boolean {
  // Normalisation de toutes les valeurs possibles pour le conseiller
  const conseillerValues = ["turn1", "tc", "conseiller"];
  return conseillerValues.includes(turn.toLowerCase());
}

/**
 * Vérifie si le locuteur est un client
 * @param turn La valeur du champ 'turn' de la table word
 * @returns true si le locuteur est un client, false sinon
 */
export function isSpeakerClient(turn: TurnValue): boolean {
  // Normalisation de toutes les valeurs possibles pour le client
  const clientValues = ["turn2", "app", "appelant"];
  return clientValues.includes(turn.toLowerCase());
}

/**
 * Normalise la valeur du champ 'turn' vers un format standard
 * @param turn La valeur du champ 'turn' de la table word
 * @returns La valeur normalisée ('conseiller' ou 'client')
 */
export function normalizeTurnValue(turn: TurnValue): string {
  if (isSpeakerConseil(turn)) {
    return "conseiller";
  } else if (isSpeakerClient(turn)) {
    return "client";
  }
  return "unknown";
}

/**
 * Renvoie le style de couleur pour un type de locuteur donné
 * @param speakerType Le type de locuteur
 * @param highlight Indique si le style doit être mis en évidence
 * @returns Un objet de style React
 */
export function getSpeakerStyle(
  speakerType: SpeakerType,
  highlight: boolean = false
) {
  if (!highlight) return {};

  switch (speakerType) {
    case SpeakerType.CONSEILLER:
      return { backgroundColor: "rgba(165, 141, 4, 0.5)" }; // Jaune transparent
    case SpeakerType.CLIENT:
      return { backgroundColor: "rgba(6, 158, 208, 0.5)" }; // Bleu transparent
    default:
      return {};
  }
}

/**
 * Renvoie le style de sélection pour un type de locuteur donné
 * @param speakerType Le type de locuteur
 * @returns Un objet de style React pour la sélection
 */
export function getSpeakerSelectionStyle(speakerType: SpeakerType) {
  switch (speakerType) {
    case SpeakerType.CONSEILLER:
      return { backgroundColor: "rgba(165, 141, 4, 0.3)" }; // Jaune plus clair
    case SpeakerType.CLIENT:
      return { backgroundColor: "rgba(6, 158, 208, 0.3)" }; // Bleu plus clair
    default:
      return {};
  }
}

/**
 * Renvoie le nom d'affichage du locuteur
 * @param speakerType Le type de locuteur
 * @returns Le nom d'affichage ('Conseiller' ou 'Client')
 */
export function getSpeakerDisplayName(speakerType: SpeakerType): string {
  switch (speakerType) {
    case SpeakerType.CONSEILLER:
      return "Conseiller";
    case SpeakerType.CLIENT:
      return "Client";
    default:
      return "Inconnu";
  }
}

/**
 * Interface pour les paragraphes regroupés par locuteur
 */
export interface SpeakerParagraph {
  speakerType: SpeakerType;
  turn: string; // Valeur originale du champ turn
  words: Word[]; // Liste des mots dans ce paragraphe
  startTime: number; // Temps de début du premier mot
  endTime: number; // Temps de fin du dernier mot
  text: string; // Texte concaténé
}

/**
 * Regroupe les mots par locuteur pour créer des paragraphes
 * @param words Liste des mots de la transcription
 * @returns Liste des paragraphes par locuteur
 */
export function groupWordsBySpeaker(words: Word[]): SpeakerParagraph[] {
  if (!words || words.length === 0) return [];

  const paragraphs: SpeakerParagraph[] = [];
  let currentParagraph: SpeakerParagraph | null = null;

  words.forEach((word, index) => {
    const speakerType = getSpeakerType(word.turn);

    // Si c'est le premier mot ou si le locuteur a changé
    if (!currentParagraph || currentParagraph.speakerType !== speakerType) {
      // Si on avait déjà un paragraphe, on le sauvegarde
      if (currentParagraph) {
        paragraphs.push(currentParagraph);
      }

      // On crée un nouveau paragraphe
      currentParagraph = {
        speakerType,
        turn: word.turn,
        words: [word],
        startTime: word.startTime,
        endTime: word.endTime || word.startTime + 1,
        text: word.text,
      };
    } else {
      // On ajoute le mot au paragraphe courant
      currentParagraph.words.push(word);
      currentParagraph.endTime = word.endTime || word.startTime + 1;
      currentParagraph.text += " " + word.text;
    }
  });

  // On n'oublie pas d'ajouter le dernier paragraphe
  if (currentParagraph) {
    paragraphs.push(currentParagraph);
  }

  return paragraphs;
}
