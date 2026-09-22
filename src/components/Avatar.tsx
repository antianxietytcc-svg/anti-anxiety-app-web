import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Text, View } from "react-native";
import { GRADIENTS } from "../constants/theme";

interface AvatarProps {
  nome: string;
  size?: number;
  fotoUrl?: string;
}

export function getIniciais(nome: string): string {
  return nome
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function Avatar({ nome, size = 48, fotoUrl }: AvatarProps) {
  if (fotoUrl) {
    return (
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: fotoUrl }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      </View>
    );
  }

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
