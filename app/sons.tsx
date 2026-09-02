import { useContext } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, Lock, Volume2 } from "lucide-react-native";
import { GradientBackground } from "../src/components/GradientBackground";
import { LayoutContext, SONS_PUBLICOS, SONS_SECRETOS } from "../src/contexts/LayoutContext";
import { useSom } from "../src/hooks/useSom";
import { COLORS } from "../src/constants/theme";
import type { NomeSom } from "../src/contexts/LayoutContext";

function ItemSom({
  id,
  label,
  selecionado,
  bloqueado,
  onPress,
}: {
  id: NomeSom;
  label: string;
  selecionado: boolean;
  bloqueado: boolean;
  onPress: () => void;
}) {
  const { tocar } = useSom(id);

  return (
    <Pressable
      onPress={() => {
        if (bloqueado) return;
        onPress();
        tocar();
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: selecionado ? "#e0f2fe" : "transparent",
        opacity: bloqueado ? 0.4 : 1,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: selecionado ? COLORS.sky500 : COLORS.sky300,
          backgroundColor: selecionado ? COLORS.sky500 : "transparent",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        {selecionado && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#fff",
            }}
          />
        )}
      </View>

      <Text
        style={{
          flex: 1,
          fontSize: 15,
          color: bloqueado ? COLORS.sky400 : COLORS.sky800,
        }}
      >
        {label}
      </Text>

      {bloqueado ? (
        <Lock size={16} color={COLORS.sky400} strokeWidth={1.5} />
      ) : (
        <Volume2 size={16} color={COLORS.sky400} strokeWidth={1.5} />
      )}
    </Pressable>
  );
}

export default function Sons() {
  const router = useRouter();
  const { sonSelecionado, setSonSelecionado, secretosDesbloqueados } =
    useContext(LayoutContext);

  return (
    <GradientBackground>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "rgba(255,255,255,0.8)",
          borderBottomWidth: 1,
          borderBottomColor: "#bae6fd",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <ChevronLeft size={26} color={COLORS.sky600} strokeWidth={1.5} />
        </Pressable>
        <Text style={{ fontSize: 20, color: COLORS.sky700 }}>
          Som do botão de emergência
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 16, gap: 16 }}>
        {/* Sons públicos */}
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 8,
              fontSize: 13,
              color: COLORS.sky500,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Disponíveis
          </Text>
          {SONS_PUBLICOS.map((s, i) => (
            <View key={s.id}>
              {i > 0 && (
                <View style={{ height: 1, backgroundColor: "#e0f2fe", marginHorizontal: 20 }} />
              )}
              <ItemSom
                id={s.id}
                label={s.label}
                selecionado={sonSelecionado === s.id}
                bloqueado={false}
                onPress={() => setSonSelecionado(s.id)}
              />
            </View>
          ))}
        </View>

        {/* Sons secretos */}
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <Text
            style={{
              paddingHorizontal: 20,
              paddingTop: 14,
              paddingBottom: 8,
              fontSize: 13,
              color: COLORS.sky500,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Secretos {!secretosDesbloqueados && "🔒"}
          </Text>
          {!secretosDesbloqueados && (
            <Text
              style={{
                paddingHorizontal: 20,
                paddingBottom: 14,
                fontSize: 13,
                color: COLORS.sky500,
              }}
            >
              Digite o Konami Code na tela de emergência para desbloquear.
            </Text>
          )}
          {SONS_SECRETOS.map((s, i) => (
            <View key={s.id}>
              {i > 0 && (
                <View style={{ height: 1, backgroundColor: "#e0f2fe", marginHorizontal: 20 }} />
              )}
              <ItemSom
                id={s.id}
                label={s.label}
                selecionado={sonSelecionado === s.id}
                bloqueado={!secretosDesbloqueados}
                onPress={() => setSonSelecionado(s.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
