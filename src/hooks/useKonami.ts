import { useEffect, useRef } from "react";
import { Platform } from "react-native";

// Konami: ↑ ↑ ↓ ↓ ← → ← → B A Enter
const KONAMI_SEQUENCE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
  "Enter",
];

/**
 * Escuta o Konami Code via teclado (web).
 * Chama `onSuccess` quando a sequência completa é detectada.
 */
export function useKonami(onSuccess: () => void) {
  const progressRef = useRef(0);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    function handleKey(e: KeyboardEvent) {
      const esperado = KONAMI_SEQUENCE[progressRef.current];
      if (e.key === esperado) {
        progressRef.current += 1;
        if (progressRef.current === KONAMI_SEQUENCE.length) {
          progressRef.current = 0;
          onSuccess();
        }
      } else {
        // Se o usuário pressionar a primeira tecla de novo sem errar, não reseta
        progressRef.current = e.key === KONAMI_SEQUENCE[0] ? 1 : 0;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onSuccess]);
}
