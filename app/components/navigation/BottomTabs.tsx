import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Home } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomTabItem from "./BottomTabItem";

interface BottomTabsProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

export default function BottomTabs({ activeTab, onTabPress }: BottomTabsProps) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { id: "home", label: "Home", icon: Home },
  ];

  return (
    <View style={[
      styles.container, 
      { paddingBottom: Math.max(insets.bottom, 10) }
    ]}>
      <View style={styles.content}>
        {tabs.map((tab) => (
          <BottomTabItem
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            isActive={activeTab === tab.id}
            onPress={() => onTabPress(tab.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 16,
    // Extra top padding so the raised icon isn't clipped
    paddingTop: 20,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    height: 68,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    // Overflow visible so raised icon shows above the bar
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#1E293B",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
    borderWidth: 0.5,
    borderColor: "rgba(226, 232, 240, 0.5)",
  },
});
