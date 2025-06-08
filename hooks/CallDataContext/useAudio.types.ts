// 📁 hooks/CallDataContext/useAudio.types.ts
// Types locaux pour le hook useAudio - autonomes et compatibles

import { RefObject } from "react";

export interface Word {
  wordid: number;
  text: string;
  startTime: number;
  endTime: number;
  timestamp?: number;
  turn?: "turn1" | "turn2";
}

// Type local autonome pour useAudio
export interface UseAudioResult {
  audioSrc: string | null;
  setAudioSrc: (src: string | null) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentWordIndex: number;
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  setTime?: (time: number) => void;
  seek?: (time: number) => void;
  playAudioAtTimestamp: (timestamp: number) => void;
  updateCurrentWordIndex: (words: Word[], time: number) => void;
  // Types de refs compatibles avec useRef<HTMLAudioElement>(null)
  audioRef: RefObject<HTMLAudioElement | null>;
  playerRef?: RefObject<HTMLAudioElement | null>;
}
