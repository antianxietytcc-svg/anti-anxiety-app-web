import { useCallback, useEffect, useRef } from "react";
import { Audio } from "expo-av";
import type { NomeSom } from "../contexts/LayoutContext";

// Map de nome → require estático (necessário para bundlers como Metro e webpack)
const SOUND_MAP: Record<NomeSom, ReturnType<typeof require>> = {
  Default:  require("../../assets/sounds/Default.mp3"),
  Minecraft: require("../../assets/sounds/Minecraft.mp3"),
  Splash:   require("../../assets/sounds/Splash.mp3"),
  Secret:   require("../../assets/sounds/Secret.mp3"),
  Secret2:  require("../../assets/sounds/Secret2.mp3"),
  Secret3:  require("../../assets/sounds/Secret3.mp3"),
  Secret4:  require("../../assets/sounds/Secret4.mp3"),
  Secret5:  require("../../assets/sounds/Secret5.mp3"),
  Secret6:  require("../../assets/sounds/Secret6.mp3"),
  Secret7:  require("../../assets/sounds/Secret7.mp3"),
  Secret8:  require("../../assets/sounds/Secret8.mp3"),
  Secret9:  require("../../assets/sounds/Secret9.mp3"),
};

export function useSom(nomeSom: NomeSom) {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Pre-carrega quando o nome muda
  useEffect(() => {
    let mounted = true;

    async function carregar() {
      // descarrega o anterior
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      try {
        const { sound } = await Audio.Sound.createAsync(SOUND_MAP[nomeSom], {
          shouldPlay: false,
        });
        if (mounted) soundRef.current = sound;
      } catch {
        // Silencioso — em alguns ambientes (SSR/web sem permissão) pode falhar
      }
    }

    carregar();

    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
  }, [nomeSom]);

  const tocar = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      }
    } catch {}
  }, []);

  return { tocar };
}
