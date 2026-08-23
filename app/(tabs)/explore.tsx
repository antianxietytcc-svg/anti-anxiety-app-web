import { FlatList, Text, View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Heart } from "lucide-react-native";
import { Avatar } from "../../src/components/Avatar";
import { GradientBackground } from "../../src/components/GradientBackground";
import { COLORS } from "../../src/constants/theme";

interface FeedPost {
  id: number;
  author: string;
  timeAgo: string;
  story: string;
  image: string;
  likes: number;
}

const posts: FeedPost[] = [
  {
    id: 1,
    author: "Camila Rodrigues",
    timeAgo: "2h atrás",
    story:
      "Tive uma crise de pânico hoje, mas usei a técnica 5-4-3-2-1 e consegui me acalmar sozinha em 10 minutos. Estou tão orgulhosa! 💙",
    image:
      "https://images.unsplash.com/photo-1764192114257-ae9ecf97eb6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    likes: 127,
  },
  {
    id: 2,
    author: "Lucas Ferreira",
    timeAgo: "5h atrás",
    story:
      "Acordei ansioso, mas fui caminhar no parque. A natureza acalmou minha mente e voltei renovado. Pequenas vitórias importam! 🌿",
    image:
      "https://images.unsplash.com/photo-1557929878-b358f3bdbdd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    likes: 89,
  },
  {
    id: 3,
    author: "Beatriz Souza",
    timeAgo: "1 dia atrás",
    story:
      "Semana passada não conseguia sair de casa. Hoje apresentei um projeto no trabalho! Terapia e meditação mudaram tudo. ✨",
    image:
      "https://images.unsplash.com/photo-1772430431395-7395009a08b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    likes: 203,
  },
  {
    id: 4,
    author: "Rafael Santos",
    timeAgo: "1 dia atrás",
    story:
      "Escrever um diário sobre meus sentimentos me ajuda muito. Ver os pensamentos no papel mostra que muitos medos são só histórias. Recomendo! 📝",
    image:
      "https://images.unsplash.com/photo-1759754154962-f56bc4965843?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    likes: 156,
  },
  {
    id: 5,
    author: "Mariana Costa",
    timeAgo: "2 dias atrás",
    story:
      "Fiquei 6 meses sem dirigir após uma crise. Hoje dirigi até a praia sozinha! Chorei de alegria. A superação é possível! 🚗💪",
    image:
      "https://images.unsplash.com/photo-1599036629621-07f8cb665695?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    likes: 312,
  },
];

export default function Explore() {
  return (
    <GradientBackground>
      <View className="border-b border-sky-200/50 bg-white/80 px-6 py-4">
        <Text className="text-2xl text-sky-700">Explorar</Text>
        <Text className="mt-1 text-sm text-sky-600/70">
          Histórias de superação
        </Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
        renderItem={({ item }) => (
          <View className="mx-4 overflow-hidden rounded-xl bg-white/80 shadow-md">
            <View className="flex-row items-center gap-2 px-3 py-2">
              <Avatar nome={item.author} size={32} />
              <View className="flex-1">
                <Text className="text-sm text-sky-800" numberOfLines={1}>
                  {item.author}
                </Text>
                <Text className="text-xs text-sky-600/70">{item.timeAgo}</Text>
              </View>
            </View>

            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", aspectRatio: 16 / 9 }}
              contentFit="cover"
              transition={200}
            />

            <View className="px-3 py-2">
              <Text className="text-sm leading-relaxed text-sky-800">
                {item.story}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 border-t border-sky-200/30 px-3 py-2">
              <Pressable className="flex-row items-center gap-1.5">
                <Heart size={16} color={COLORS.sky600} strokeWidth={1.5} />
                <Text className="text-xs text-sky-600">{item.likes}</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </GradientBackground>
  );
}
