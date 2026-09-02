import { useCallback, useContext, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { GradientBackground } from "../../src/components/GradientBackground";
import { ModalChatEmergencia } from "../../src/components/ModalChatEmergencia";
import { LayoutContext } from "../../src/contexts/LayoutContext";
import { useSom } from "../../src/hooks/useSom";
import { useKonami } from "../../src/hooks/useKonami";
import { GRADIENTS, COLORS } from "../../src/constants/theme";

export default function Emergency() {
  const router = useRouter();
  const { sonSelecionado, secretosDesbloqueados, desbloquearSecretos } =
    useContext(LayoutContext);

  const [chatAberto, setChatAberto] = useState(false);
  const [modalKonami, setModalKonami] = useState(false);

  const { tocar } = useSom(sonSelecionado);
  const { tocar: tocarSecret } = useSom("Secret");

  const handleKonami = useCallback(() => {
    tocarSecret();
    if (!secretosDesbloqueados) {
      desbloquearSecretos();
    }
    setModalKonami(true);
  }, [secretosDesbloqueados, tocarSecret, desbloquearSecretos]);

  useKonami(handleKonami);

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
          <Pressable
            onPress={() => {
              tocar();
              setChatAberto(true);
            }}
          >
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
                    transition={{ type: "timing", duration: 1500, loop: true, repeatReverse: true }}
                  />

                  {/* Brilho interno */}
                  <MotiView
                    className="absolute inset-8 rounded-full bg-white/30"
                    from={{ scale: 1 }}
                    animate={{ scale: 1.1 }}
                    transition={{ type: "timing", duration: 1250, loop: true, repeatReverse: true }}
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

      {/* Modal Konami */}
      <Modal
        visible={modalKonami}
        transparent
        animationType="fade"
        onRequestClose={() => setModalKonami(false)}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 340,
              borderRadius: 24,
              backgroundColor: "#fff",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#bae6fd",
            }}
          >
            <LinearGradient
              colors={GRADIENTS.emergencyButton}
              style={{ paddingVertical: 20, alignItems: "center" }}
            >
              <Text style={{ fontSize: 36 }}>🎮</Text>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 6 }}>
                Código Konami!
              </Text>
            </LinearGradient>

            <View style={{ padding: 24, alignItems: "center" }}>
              <Text
                style={{
                  color: COLORS.sky800,
                  fontSize: 15,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Você desbloqueou sons secretos! 🔓{"\n"}Acesse{" "}
                <Text style={{ color: COLORS.sky500, fontWeight: "600" }}>
                  Perfil → Sons
                </Text>{" "}
                para escolher.
              </Text>
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
              <Pressable
                onPress={() => setModalKonami(false)}
                style={{
                  backgroundColor: COLORS.sky400,
                  borderRadius: 14,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
                  Entendido!
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}
