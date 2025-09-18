// app/evaluation/components/NewTranscript/components/Timeline/hooks/useResizeObserver.ts

import { useEffect, useState, RefObject } from "react";

/**
 * Hook pour observer les changements de taille d'un élément
 * Utile pour recalculer les positions des événements sur la timeline
 */
export function useResizeObserver(ref: RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fonction pour mettre à jour la taille
    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: rect.width,
        height: rect.height,
      });
    };

    // Initialiser la taille
    updateSize();

    // Vérifier si ResizeObserver est supporté
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        updateSize();
      });

      resizeObserver.observe(element);

      // Cleanup
      return () => {
        resizeObserver.unobserve(element);
      };
    } else {
      // Fallback pour les navigateurs qui ne supportent pas ResizeObserver
      window.addEventListener("resize", updateSize);

      return () => {
        window.removeEventListener("resize", updateSize);
      };
    }
  }, [ref]);

  return size;
}

/**
 * Hook simplifié pour observer uniquement la largeur
 * Version optimisée pour la timeline
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(800); // Valeur par défaut raisonnable

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fonction pour mettre à jour la largeur
    const updateWidth = () => {
      const rect = element.getBoundingClientRect();
      setWidth(rect.width);
    };

    // Initialiser la largeur
    updateWidth();

    // Observer les redimensionnements
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(() => {
        updateWidth();
      });

      resizeObserver.observe(element);

      return () => {
        resizeObserver.unobserve(element);
      };
    } else {
      // Fallback
      window.addEventListener("resize", updateWidth);

      return () => {
        window.removeEventListener("resize", updateWidth);
      };
    }
  }, []);

  return width;
}

/**
 * Hook pour détecter les changements de largeur avec un debounce
 * Utile pour éviter trop de recalculs lors du redimensionnement
 */
export function useDebouncedWidth(
  ref: RefObject<HTMLElement>,
  delay: number = 100
): number {
  const { width } = useResizeObserver(ref);
  const [debouncedWidth, setDebouncedWidth] = useState(width);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedWidth(width);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [width, delay]);

  return debouncedWidth;
}

/**
 * Hook pour observer plusieurs dimensions avec callbacks
 */
export function useAdvancedResizeObserver<T extends HTMLElement>(
  ref: RefObject<T>,
  callbacks?: {
    onWidthChange?: (width: number) => void;
    onHeightChange?: (height: number) => void;
    onSizeChange?: (size: { width: number; height: number }) => void;
  }
) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [prevSize, setPrevSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      const newSize = { width: rect.width, height: rect.height };

      setSize(newSize);

      // Déclencher les callbacks si les dimensions ont changé
      if (callbacks) {
        if (newSize.width !== prevSize.width && callbacks.onWidthChange) {
          callbacks.onWidthChange(newSize.width);
        }
        if (newSize.height !== prevSize.height && callbacks.onHeightChange) {
          callbacks.onHeightChange(newSize.height);
        }
        if (
          (newSize.width !== prevSize.width ||
            newSize.height !== prevSize.height) &&
          callbacks.onSizeChange
        ) {
          callbacks.onSizeChange(newSize);
        }
      }

      setPrevSize(newSize);
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(element);

      return () => {
        resizeObserver.unobserve(element);
      };
    } else {
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, [ref, callbacks, prevSize.width, prevSize.height]);

  return size;
}
