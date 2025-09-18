// app/evaluation/components/NewTranscript/components/Timeline/utils/time.ts

/**
 * Convertit un temps en position X sur la timeline
 */
export const timeToPosition = (
  time: number,
  duration: number,
  width: number
): number => {
  if (duration <= 0 || width <= 0) return 0;
  return Math.max(0, Math.min(width, (time / duration) * width));
};

/**
 * Convertit une position X en temps
 */
export const positionToTime = (
  position: number,
  width: number,
  duration: number
): number => {
  if (width <= 0) return 0;
  return Math.max(0, Math.min(duration, (position / width) * duration));
};

/**
 * Formate un temps en secondes vers MM:SS
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Calcule la durée entre deux temps
 */
export const getDuration = (startTime: number, endTime: number): number => {
  return Math.max(0, endTime - startTime);
};

/**
 * Vérifie si un temps est dans une plage temporelle
 */
export const isTimeInRange = (
  time: number,
  startTime: number,
  endTime: number
): boolean => {
  return time >= startTime && time <= endTime;
};

/**
 * Trouve le temps le plus proche dans une liste
 */
export const findClosestTime = (
  targetTime: number,
  times: number[]
): number | null => {
  if (times.length === 0) return null;

  return times.reduce((closest, current) => {
    return Math.abs(current - targetTime) < Math.abs(closest - targetTime)
      ? current
      : closest;
  });
};

/**
 * Génère des graduations temporelles pour une durée donnée
 */
export const generateTimeGraduations = (
  duration: number,
  maxGraduations: number = 10
) => {
  if (duration <= 0) return [];

  const intervals = Math.min(Math.floor(duration / 30), maxGraduations);
  const step = duration / (intervals || 1);

  return Array.from({ length: intervals + 1 }, (_, i) => {
    const time = i * step;
    return {
      time,
      position: (time / duration) * 100,
      label: formatTime(time),
    };
  });
};
