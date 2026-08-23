import { Tabs } from "expo-router";
import { Home, MessageCircle, Globe, User } from "lucide-react-native";
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
      className={`items-center justify-center rounded-2xl px-6 py-2 ${
        focused ? "bg-sky-100" : ""
      }`}
    >
      <Icon
        size={26}
        color={focused ? COLORS.sky600 : COLORS.sky400}
        strokeWidth={focused ? 2 : 1.5}
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
          backgroundColor: "rgba(255,255,255,0.8)",
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
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={MessageCircle} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={Globe} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
