// Convertit une taille en octets en une chaîne lisible
export const formatFileSize = (size: string | number = 0): string => {
  const bytes =
    typeof size === "string" ? parseInt(size.replace(/[^\d]/g, ""), 10) : size;

  if (bytes === 0) return "0 Octets";

  const k = 1024;
  const sizes = ["Octets", "Ko", "Mo", "Go", "To"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
