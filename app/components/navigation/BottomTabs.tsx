import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Home, LucideIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Theme } from "../../theme/theme";
import BottomTabItem from "./BottomTabItem";

export interface BottomTabDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BottomTabsProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  /** When omitted, shows a single Home tab (legacy default). */
  tabs?: BottomTabDefinition[];
}

const DEFAULT_TABS: BottomTabDefinition[] = [{ id: "home", label: "Home", icon: Home }];

export default function BottomTabs({ activeTab, onTabPress, tabs }: BottomTabsProps) {
  const insets = useSafeAreaInsets();
  const tabList = tabs && tabs.length > 0 ? tabs : DEFAULT_TABS;
  const singleTab = tabList.length === 1;

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.content, singleTab && styles.contentSingleTab]}>
        {tabList.map((tab) => (
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
    paddingTop: 20,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    backgroundColor: Theme.bg,
    borderRadius: 28,
    height: 68,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    overflow: "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
      },
    }),
    borderWidth: 1.5,
    borderColor: Theme.yellow,
  },
  contentSingleTab: {
    alignSelf: "center",
    width: "52%",
    maxWidth: 200,
    minWidth: 140,
    justifyContent: "center",
  },
});
