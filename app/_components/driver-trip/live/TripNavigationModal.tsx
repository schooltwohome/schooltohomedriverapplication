import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Animated,
} from "react-native";
import MapView, { Marker, MarkerAnimated, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Navigation, X } from "lucide-react-native";
import type { TripCoords } from "../types";
import { useAnimatedBusMarker } from "../../../hooks/useAnimatedBusMarker";
import type { GeoPoint } from "../../../../types/tracking";
import { haversineMeters } from "../../../../lib/geo";

export type NavigationStopLeg = {
  coordinate: TripCoords;
  name: string;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  stopCoordinate: TripCoords;
  stopName: string;
  /**
   * Ordered stops from the current leg through the end of the route.
   * When set, Directions uses waypoints so the line follows roads through each stop
   * instead of only driver → current.
   */
  remainingStopsOrdered?: NavigationStopLeg[];
}

function initialRegion(dest: TripCoords) {
  return {
    latitude: dest.latitude,
    longitude: dest.longitude,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };
}

function decodePolyline(encoded: string): TripCoords[] {
  // Google's polyline algorithm (no deps).
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: TripCoords[] = [];
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return coordinates;
}

function isValidCoord(c: TripCoords): boolean {
  return (
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude) &&
    !(c.latitude === 0 && c.longitude === 0)
  );
}

function buildStopChain(
  stopCoordinate: TripCoords,
  stopName: string,
  remainingStopsOrdered: NavigationStopLeg[] | undefined
): NavigationStopLeg[] {
  const raw =
    remainingStopsOrdered && remainingStopsOrdered.length > 0
      ? remainingStopsOrdered
      : [{ coordinate: stopCoordinate, name: stopName }];
  return raw.filter((s) => isValidCoord(s.coordinate));
}

export default function TripNavigationModal({
  visible,
  onClose,
  stopCoordinate,
  stopName,
  remainingStopsOrdered,
}: Props) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const lastDirectionsFetchAtRef = useRef(0);
  const lastDirectionsOriginRef = useRef<GeoPoint | null>(null);

  // Driver location as a plain ref so GPS updates don't force re-renders —
  // the animated marker reads it via useAnimatedBusMarker.
  const [driverLocation, setDriverLocation] = useState<GeoPoint | null>(null);
  const [waitingGps, setWaitingGps] = useState(true);
  const [routeCoords, setRouteCoords] = useState<TripCoords[] | null>(null);

  const googleKey =
    (Constants.expoConfig?.extra as Record<string, unknown>)?.googleMapsApiKey ?? "";

  const stopChain = useMemo(
    () => buildStopChain(stopCoordinate, stopName, remainingStopsOrdered),
    [stopCoordinate, stopName, remainingStopsOrdered]
  );

  const stopChainSig = useMemo(
    () =>
      stopChain
        .map((s) => `${s.coordinate.latitude},${s.coordinate.longitude}`)
        .join(";"),
    [stopChain]
  );

  /** Google allows at most 25 intermediate waypoints between origin and destination. */
  const chainForDirections = useMemo(() => {
    if (stopChain.length <= 26) return stopChain;
    return [...stopChain.slice(0, 25), stopChain[stopChain.length - 1]!];
  }, [stopChain]);

  const prevStopChainSigRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevStopChainSigRef.current === stopChainSig) return;
    prevStopChainSigRef.current = stopChainSig;
    setRouteCoords(null);
    lastDirectionsFetchAtRef.current = 0;
    lastDirectionsOriginRef.current = null;
  }, [stopChainSig]);

  const markerState = useAnimatedBusMarker(driverLocation);

  const rotateInterpolation = markerState.rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const openTurnByTurn = async () => {
    const chain = chainForDirections.length ? chainForDirections : stopChain;
    if (chain.length === 0) return;
    const last = chain[chain.length - 1]!.coordinate;
    let url = "https://www.google.com/maps/dir/?api=1&travelmode=driving";
    if (chain.length > 1) {
      const wps = chain
        .slice(0, -1)
        .map((s) => `${s.coordinate.latitude},${s.coordinate.longitude}`)
        .join("|");
      url += `&waypoints=${encodeURIComponent(wps)}`;
    }
    url += `&destination=${encodeURIComponent(`${last.latitude},${last.longitude}`)}`;
    try {
      const ok = await Linking.canOpenURL(url);
      if (!ok) {
        Alert.alert("Navigation", "Could not open maps on this device.");
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Navigation", "Could not open maps on this device.");
    }
  };

  useEffect(() => {
    if (!visible) {
      setDriverLocation(null);
      setWaitingGps(true);
      setRouteCoords(null);
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
        setDriverLocation({
          latitude: first.coords.latitude,
          longitude: first.coords.longitude,
        });
        setWaitingGps(false);
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 12, timeInterval: 4000 },
          (loc) => {
            if (!cancelled) {
              setDriverLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }
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
  }, [visible, stopChainSig]);

  useEffect(() => {
    if (!visible || !driverLocation || !googleKey || chainForDirections.length === 0) {
      setRouteCoords(null);
      return;
    }

    const now = Date.now();
    const lastOrigin = lastDirectionsOriginRef.current;
    const movedMeters = lastOrigin ? haversineMeters(lastOrigin, driverLocation) : Infinity;
    const sinceLastFetchMs = now - lastDirectionsFetchAtRef.current;
    const shouldRefetch =
      movedMeters >= 35 || sinceLastFetchMs >= 15_000 || !routeCoords?.length;
    if (!shouldRefetch) {
      return;
    }

    const origin = `${driverLocation.latitude},${driverLocation.longitude}`;
    const lastStop = chainForDirections[chainForDirections.length - 1]!.coordinate;
    const dest = `${lastStop.latitude},${lastStop.longitude}`;
    let waypointsParam = "";
    if (chainForDirections.length > 1) {
      const wps = chainForDirections
        .slice(0, -1)
        .map((s) => `${s.coordinate.latitude},${s.coordinate.longitude}`)
        .join("|");
      waypointsParam = `&waypoints=${encodeURIComponent(wps)}`;
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(dest)}&mode=driving${waypointsParam}&key=${encodeURIComponent(
      String(googleKey)
    )}`;

    let cancelled = false;
    (async () => {
      try {
        lastDirectionsFetchAtRef.current = now;
        lastDirectionsOriginRef.current = driverLocation;
        const res = await fetch(url);
        const json = await res.json();
        const pts = json?.routes?.[0]?.overview_polyline?.points;
        if (!cancelled && typeof pts === "string" && pts.length > 0) {
          setRouteCoords(decodePolyline(pts));
        } else if (!cancelled) {
          setRouteCoords(null);
        }
      } catch {
        if (!cancelled) setRouteCoords(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    visible,
    driverLocation,
    googleKey,
    routeCoords?.length,
    stopChainSig,
    chainForDirections,
  ]);

  useEffect(() => {
    if (!visible || !mapRef.current) return;
    const chainCoords = stopChain.map((s) => s.coordinate);
    let pts: TripCoords[];
    if (routeCoords?.length) {
      pts = driverLocation ? [...routeCoords, driverLocation] : routeCoords;
    } else if (driverLocation && chainCoords.length) {
      pts = [driverLocation, ...chainCoords];
    } else {
      pts = chainCoords.length ? chainCoords : [stopCoordinate];
    }
    const pad = {
      top: insets.top + 72,
      right: 28,
      bottom: Math.max(insets.bottom, 16) + 48,
      left: 28,
    };
    requestAnimationFrame(() => {
      if (pts.length === 1) {
        mapRef.current?.animateToRegion(
          { latitude: pts[0].latitude, longitude: pts[0].longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 },
          250
        );
        return;
      }
      mapRef.current?.fitToCoordinates(pts, { edgePadding: pad, animated: true });
    });
  }, [visible, driverLocation, stopCoordinate, stopChain, routeCoords, insets.top, insets.bottom]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.flex}>
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={initialRegion(stopChain[0]?.coordinate ?? stopCoordinate)}
          showsUserLocation={false}
          showsMyLocationButton={false}
          loadingEnabled
        >
          {stopChain.map((s, i) => (
            <Marker
              key={`nav-stop-${i}-${s.coordinate.latitude}-${s.coordinate.longitude}`}
              coordinate={s.coordinate}
              title={s.name}
              pinColor={i === 0 ? "#0F172A" : "#94A3B8"}
            />
          ))}

          {/* Base route polyline — connects stops in order, always visible once the
              stop chain is known. Road-snapped line draws on top when ready. */}
          {stopChain.length >= 2 ? (
            <>
              {/* Casing so the line pops on any map background */}
              <Polyline
                coordinates={stopChain.map((s) => s.coordinate)}
                strokeColor="#1E3A5F"
                strokeWidth={7}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                coordinates={stopChain.map((s) => s.coordinate)}
                strokeColor="#93C5FD"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
                lineDashPattern={[12, 6]}
              />
            </>
          ) : null}

          {/* Road-snapped polyline — replaces the dashed base line once Directions loads */}
          {routeCoords?.length ? (
            <>
              <Polyline
                coordinates={routeCoords}
                strokeColor="#1E40AF"
                strokeWidth={7}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                coordinates={routeCoords}
                strokeColor="#38BDF8"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            </>
          ) : null}

          {driverLocation ? (
            <>
              {/* Animated rotating driver marker */}
              <MarkerAnimated
                coordinate={markerState.animatedRegion}
                title="Your location"
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <Animated.View
                  style={[
                    styles.driverMarkerWrap,
                    { transform: [{ rotate: rotateInterpolation }] },
                  ]}
                >
                  <View style={styles.driverMarkerCircle}>
                    <View style={styles.driverMarkerPointer} />
                    <View style={styles.driverMarkerDot} />
                  </View>
                </Animated.View>
              </MarkerAnimated>
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

        <View style={[styles.navCtaWrap, { bottom: Math.max(insets.bottom, 16) + 20 }]}>
          <TouchableOpacity
            style={styles.navCta}
            onPress={openTurnByTurn}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Start navigation in Google Maps"
          >
            <Navigation size={18} color="#0F172A" />
            <Text style={styles.navCtaText}>Start navigation</Text>
          </TouchableOpacity>
        </View>

        {waitingGps && !driverLocation ? (
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
  navCtaWrap: {
    position: "absolute",
    left: 16,
    right: 16,
  },
  navCta: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FDE047",
    borderWidth: 1.5,
    borderColor: "#F59E0B",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
  navCtaText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0F172A",
  },
  driverMarkerWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  driverMarkerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#38BDF8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  driverMarkerPointer: {
    position: "absolute",
    top: -7,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#38BDF8",
  },
  driverMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
});
