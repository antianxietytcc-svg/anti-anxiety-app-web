import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { GRADIENTS } from "../constants/theme";

interface GradientBackgroundProps {
  children: ReactNode;
}

/**
 * Equivalente nativo do `bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100`
 * usado em (quase) todas as telas do site. RN não suporta gradiente via className,
 * então centralizamos aqui pra não repetir <LinearGradient> em cada tela.
 */
export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <LinearGradient
      colors={GRADIENTS.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {children}
    </LinearGradient>
  );
}
