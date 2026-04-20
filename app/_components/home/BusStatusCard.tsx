import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { MapPin, Navigation } from "lucide-react-native";

interface BusStatusCardProps {
  route: string;
  distance: string;
  eta: string;
  onTrackPress?: () => void;
}

export default function BusStatusCard({ 
  route = "Route 12 - Morning Trip", 
  distance = "2.5 km away", 
  eta = "10 mins",
  onTrackPress 
}: BusStatusCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        <View style={styles.imageContainer}>
          <Image 
            source={require("../../../assets/images/school_bus.png")} 
            style={styles.busImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.routeText}>{route}</Text>
          <View style={styles.detailRow}>
            <Navigation size={14} color="#64748B" />
            <Text style={styles.detailText}>{distance}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={14} color="#64748B" />
            <Text style={styles.detailText}>ETA: {eta}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.trackButton} 
        onPress={onTrackPress}
        activeOpacity={0.8}
      >
        <MapPin size={18} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.trackButtonText}>Track Live Location</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  imageContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#FFF9E6",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  busImage: {
    width: 50,
    height: 50,
  },
  infoContainer: {
    flex: 1,
  },
  routeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  trackButton: {
    backgroundColor: "#F59E0B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
