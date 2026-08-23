import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";
import { GRADIENTS } from "../constants/theme";

interface AvatarProps {
  nome: string;
  size?: number;
}

export function getIniciais(nome: string) {
  return nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function Avatar({ nome, size = 48 }: AvatarProps) {
  return (
    <LinearGradient
      colors={GRADIENTS.avatar}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        className="text-white"
        style={{ fontSize: size * 0.32 }}
      >
        {getIniciais(nome)}
      </Text>
    </LinearGradient>
  );
}
