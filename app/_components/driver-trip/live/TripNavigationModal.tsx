import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import type { TripCoords } from "../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  stopCoordinate: TripCoords;
  stopName: string;
}

function initialRegion(dest: TripCoords) {
  return {
    latitude: dest.latitude,
    longitude: dest.longitude,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };
}

export default function TripNavigationModal({ visible, onClose, stopCoordinate, stopName }: Props) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [driver, setDriver] = useState<TripCoords | null>(null);
  const [waitingGps, setWaitingGps] = useState(true);

  useEffect(() => {
    if (!visible) {
      setDriver(null);
      setWaitingGps(true);
      return;
    }

    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== "granted") {
        setWaitingGps(false);
        return;
      }
      try {
        const first = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        setDriver({
          latitude: first.coords.latitude,
          longitude: first.coords.longitude,
        });
        setWaitingGps(false);
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 12,
            timeInterval: 4000,
          },
          (loc) => {
            setDriver({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            });
          }
        );
      } catch {
        if (!cancelled) setWaitingGps(false);
      }
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [visible, stopCoordinate.latitude, stopCoordinate.longitude]);

  useEffect(() => {
    if (!visible || !mapRef.current) return;
    const pts: TripCoords[] = [stopCoordinate];
    if (driver) pts.unshift(driver);
    const pad = {
      top: insets.top + 72,
      right: 28,
      bottom: Math.max(insets.bottom, 16) + 48,
      left: 28,
    };
    requestAnimationFrame(() => {
      if (pts.length === 1) {
        mapRef.current?.animateToRegion(
          {
            latitude: pts[0].latitude,
            longitude: pts[0].longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          },
          250
        );
        return;
      }
      mapRef.current?.fitToCoordinates(pts, { edgePadding: pad, animated: true });
    });
  }, [visible, driver, stopCoordinate, insets.top, insets.bottom]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.flex}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion(stopCoordinate)}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          <Marker coordinate={stopCoordinate} title={stopName} pinColor="#0F172A" />
          {driver ? (
            <>
              <Marker
                coordinate={driver}
                title="Your location"
                pinColor="#38BDF8"
              />
              <Polyline
                coordinates={[driver, stopCoordinate]}
                strokeColor="#38BDF8"
                strokeWidth={4}
              />
            </>
          ) : null}
        </MapView>

        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topBarCard}>
            <Text style={styles.topBarLabel}>Navigating to</Text>
            <Text style={styles.topBarTitle} numberOfLines={2}>
              {stopName}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeFab}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close map"
          >
            <X size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {waitingGps && !driver ? (
          <View style={[styles.loading, { bottom: Math.max(insets.bottom, 16) + 24 }]}>
            <ActivityIndicator size="small" color="#0F172A" />
            <Text style={styles.loadingText}>Getting your location…</Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    gap: 10,
  },
  topBarCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  topBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  loading: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
});
