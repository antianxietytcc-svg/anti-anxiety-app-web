import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "../../src/components/GradientBackground";
import { ModalChatEmergencia } from "../../src/components/ModalChatEmergencia";
import { GRADIENTS, COLORS } from "../../src/constants/theme";

export default function Emergency() {
  const router = useRouter();
  const [chatAberto, setChatAberto] = useState(false);

  return (
    <GradientBackground>
      <View className="flex-1">
        <View className="flex-row justify-end p-6">
          <Pressable
            onPress={() => router.push("/profile")}
            className="h-10 w-10 items-center justify-center rounded-full border border-sky-200 bg-white/60"
          >
            <User size={20} color={COLORS.sky600} strokeWidth={1.5} />
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <Pressable onPress={() => setChatAberto(true)}>
            {({ pressed }) => (
              <View
                style={{
                  transform: [{ scale: pressed ? 0.92 : 1 }],
                  width: 260,
                  height: 260,
                  borderRadius: 130,
                  overflow: "hidden",
                  elevation: 12,
                  shadowColor: COLORS.sky400,
                  shadowOpacity: 0.4,
                  shadowRadius: 30,
                }}
              >
                <LinearGradient
                  colors={GRADIENTS.emergencyButton}
                  style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
                >
                  {/* Pulso externo */}
                  <MotiView
                    className="absolute inset-0 rounded-full bg-white/20"
                    from={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 1.2, opacity: 0.8 }}
                    transition={{
                      type: "timing",
                      duration: 1500,
                      loop: true,
                      repeatReverse: true,
                    }}
                  />

                  {/* Brilho interno */}
                  <MotiView
                    className="absolute inset-8 rounded-full bg-white/30"
                    from={{ scale: 1 }}
                    animate={{ scale: 1.1 }}
                    transition={{
                      type: "timing",
                      duration: 1250,
                      loop: true,
                      repeatReverse: true,
                    }}
                  />

                  <Text className="z-10 text-3xl text-white">emergência</Text>
                </LinearGradient>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <ModalChatEmergencia
        visivel={chatAberto}
        aoFechar={() => setChatAberto(false)}
      />
    </GradientBackground>
  );
}
