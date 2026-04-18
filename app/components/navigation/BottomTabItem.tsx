import { LucideIcon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { StyleSheet, TouchableOpacity, View, Animated } from "react-native";

import { Theme } from "../../theme/theme";

interface BottomTabItemProps {
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function BottomTabItem({
  icon: Icon,
  label,
  isActive,
  onPress,
}: BottomTabItemProps) {
  const translateY = useRef(new Animated.Value(isActive ? -18 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(isActive ? 1.15 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: isActive ? -18 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
      Animated.spring(scaleAnim, {
        toValue: isActive ? 1.15 : 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }),
    ]).start();
  }, [isActive]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.iconWrapper,
          isActive && styles.activeIconWrapper,
          {
            transform: [
              { translateY: translateY },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <Icon
          size={22}
          color={isActive ? Theme.text : Theme.textMuted}
          strokeWidth={isActive ? 2.5 : 1.8}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.label,
          isActive && styles.activeLabel,
        ]}
      >
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    backgroundColor: "transparent",
  },
  activeIconWrapper: {
    backgroundColor: Theme.yellow,
    shadowColor: Theme.yellowDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: Theme.textMuted,
    letterSpacing: 0.3,
  },
  activeLabel: {
    color: Theme.text,
    fontWeight: "800",
  },
});
