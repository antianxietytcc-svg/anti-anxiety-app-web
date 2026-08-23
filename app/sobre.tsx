import { ScrollView, Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { COLORS } from "../src/constants/theme";

interface Tecnologia {
  nome: string;
  funcao: string;
}

const tecnologias: Tecnologia[] = [
  { nome: "React Native", funcao: "Frontend mobile" },
  { nome: "TypeScript", funcao: "Linguagem" },
  { nome: "Expo", funcao: "Toolchain / build" },
  { nome: "NativeWind", funcao: "Estilização" },
  { nome: "Firebase", funcao: "Banco de dados e autenticação" },
];

export default function Sobre() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white px-4 py-8">
      <Pressable
        onPress={() => router.back()}
        className="mb-6 flex-row items-center gap-2"
      >
        <ArrowLeft size={20} color={COLORS.sky600} />
        <Text className="text-sky-600">Voltar</Text>
      </Pressable>

      <View className="mb-10 items-center">
        <Text className="mb-2 text-center text-3xl font-bold text-blue-600">
          Sobre o Projeto
        </Text>
        <Text className="text-center text-lg italic text-gray-600">
          Trabalho de Conclusão de Curso (TCC)
        </Text>
      </View>

      <View className="gap-8">
        <View className="rounded-lg bg-white p-6 shadow-md">
          <Text className="mb-3 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900">
            O que é o projeto?
          </Text>
          <Text className="leading-relaxed text-gray-700">
            Percebe-se que muitas pessoas que experienciam crises de ansiedade
            ou ataques de pânico enfrentam dificuldades para reconhecer os
            sintomas e compreender o que está acontecendo durante os
            episódios. Em muitos casos, os sintomas físicos são confundidos
            com emergências médicas graves, levando indivíduos a procurarem
            atendimento acreditando estar sofrendo um infarto, acidente
            vascular cerebral ou outra condição clínica severa.{"\n\n"}
            Com base nessa perspectiva, o nosso trabalho propõe o
            desenvolvimento de um projeto voltado ao auxílio no manejo de
            crises de ansiedade e ataques de pânico por meio de recursos
            tecnológicos.
          </Text>
        </View>

        <View className="rounded-lg bg-white p-6 shadow-md">
          <Text className="mb-3 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900">
            Tecnologias Utilizadas
          </Text>
          <View className="mt-4 flex-row flex-wrap gap-4">
            {tecnologias.map((tec) => (
              <View
                key={tec.nome}
                className="min-w-[45%] flex-1 rounded-lg border border-sky-100 bg-sky-50 p-4"
              >
                <Text className="mb-1 text-lg text-sky-700">{tec.nome}</Text>
                <Text className="text-sm text-gray-600">{tec.funcao}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="rounded-lg bg-white p-6 shadow-md">
          <Text className="mb-3 border-b border-gray-200 pb-2 text-xl font-semibold text-gray-900">
            Desenvolvido por:
          </Text>
          <View className="flex-row flex-wrap justify-center gap-6 p-2">
            <View className="items-center">
              <Text className="mb-2 text-gray-700">Eduardo Prates</Text>
              <Image
                source={require("../assets/images/eduardo.png")}
                style={{ width: 200, height: 200, borderRadius: 16 }}
                contentFit="cover"
              />
            </View>
            <View className="items-center">
              <Text className="mb-2 text-gray-700">Gustavo Santos</Text>
              <Image
                source={require("../assets/images/gustavo.png")}
                style={{ width: 200, height: 200, borderRadius: 16 }}
                contentFit="cover"
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
