import { Tabs } from "expo-router";
import { Home, MessageCircle, Users, User } from "lucide-react-native";
import { View } from "react-native";
import { COLORS } from "../../src/constants/theme";

function TabIcon({
  Icon,
  focused,
}: {
  Icon: typeof Home;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: focused ? COLORS.sky100 : "transparent",
      }}
    >
      <Icon
        size={26}
        color={focused ? COLORS.sky600 : COLORS.sky400}
        strokeWidth={focused ? 2 : 1.5}
        aria-hidden
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.9)",
          borderTopColor: "rgba(186,230,253,0.5)",
          borderTopWidth: 1,
          height: 64,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Home} focused={focused} />,
          tabBarAccessibilityLabel: "Início",
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={MessageCircle} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Chat",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Users} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Rede de Apoio",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={User} focused={focused} />
          ),
          tabBarAccessibilityLabel: "Perfil",
        }}
      />
    </Tabs>
  );
}
