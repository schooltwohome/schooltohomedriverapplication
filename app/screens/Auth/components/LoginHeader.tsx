import React from "react";
import { View, Text } from "react-native";
import { Bus, MapPin, Bell, CheckCircle } from "lucide-react-native";

const features = [
  { icon: MapPin, text: "Real-time GPS tracking", color: "text-[#14B8A6]", iconColor: "#14B8A6" },
  { icon: Bell, text: "Instant notifications", color: "text-[#F59E0B]", iconColor: "#F59E0B" },
  { icon: CheckCircle, text: "Safe & secure", color: "text-[#22C55E]", iconColor: "#22C55E" },
];

export default function LoginHeader() {
  return (
    <View className="bg-[#0F172A] pt-12 pb-8 px-6 rounded-b-[32px] relative overflow-hidden">
      {/* Decorative circles */}
      <View className="absolute top-4 right-4 w-24 h-24 rounded-full bg-[#14B8A6]/10" />
      <View className="absolute top-16 right-16 w-16 h-16 rounded-full bg-[#38BDF8]/10" />

      {/* Illustration */}
      <View className="z-10 items-center justify-center mt-8 mb-4">
        <View className="w-48 h-32 relative">
          {/* Road */}
          <View className="absolute bottom-0 left-0 right-0 h-8 bg-[#1E293B] rounded-lg" />
          <View className="absolute bottom-3 left-1/4 right-1/4 h-0.5 bg-[#F59E0B] rounded-full" />

          {/* Bus */}
          <View className="absolute bottom-6 left-1/2 -ml-12 w-24 h-16 bg-[#F59E0B] rounded-lg items-center justify-center">
            <Bus size={40} color="#0F172A" />
          </View>

          {/* Location pin */}
          <View className="absolute top-0 right-6">
            <View className="w-8 h-8 bg-[#14B8A6] rounded-full items-center justify-center">
              <MapPin size={16} color="white" />
            </View>
          </View>

          {/* Signal waves */}
          <View className="absolute top-4 left-8">
            <View className="flex-row gap-0.5 items-end h-5">
              <View className="w-1 h-3 bg-[#14B8A6] rounded-full opacity-60" />
              <View className="w-1 h-5 bg-[#14B8A6] rounded-full opacity-80 mb-0" />
              <View className="w-1 h-4 bg-[#14B8A6] rounded-full mb-0" />
            </View>
          </View>
        </View>
      </View>

      <Text className="text-2xl font-bold text-white text-center">SchoolBus Tracker</Text>
      <Text className="text-[#94A3B8] text-sm text-center mt-1">Safe journeys, happy parents</Text>

      {/* Feature badges */}
      <View className="flex-row justify-center gap-2 mt-4">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <View key={idx} className="flex-row items-center bg-[#1E293B] px-3 py-1.5 rounded-full">
              <Icon size={14} color={feature.iconColor} />
              <Text className="text-[10px] text-[#94A3B8] ml-1.5">{feature.text}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
