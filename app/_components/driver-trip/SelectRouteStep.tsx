import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Map, Clock, Users, ChevronRight, Bus } from 'lucide-react-native';
import { Theme } from '../../_theme/theme';
import { BusItem, RouteItem } from './types';

interface Props {
  selectedBus: BusItem | null;
  onNext: (route: RouteItem) => void;
  routes: RouteItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Overrides the default "Step 2 of 4" label (e.g. helper flow uses 2 steps). */
  stepLabel?: string;
  hideStepLabel?: boolean;
}

export default function SelectRouteStep({
  selectedBus,
  onNext,
  routes,
  loading = false,
  error = null,
  onRetry,
  stepLabel = "Step 2 of 4",
  hideStepLabel = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const scrollBottomPad = Math.max(insets.bottom, 20);

  return (
    <View style={styles.container}>
      <View style={[styles.header, hideStepLabel && styles.headerCompact]}>
        {!hideStepLabel ? <Text style={styles.stepText}>{stepLabel}</Text> : null}
        <Text style={styles.title}>{hideStepLabel ? "Select route" : "Select Route"}</Text>
        
        {selectedBus && (
          <View style={styles.selectedBusCard}>
            <View style={styles.selectedBusLabel}>
              <Bus size={14} color={Theme.yellowDark} />
              <Text style={styles.selectedBusLabelText}>Selected Bus</Text>
            </View>
            <Text style={styles.selectedBusName}>{selectedBus.name}</Text>
          </View>
        )}
        
        <Text style={styles.subtitle}>
          {hideStepLabel
            ? "Pick the route for this bus"
            : "Select your assigned route for this trip"}
        </Text>
      </View>

      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
          {onRetry ? (
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} accessibilityRole="button">
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: scrollBottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Theme.yellowDark} />
            <Text style={styles.loadingHint}>Loading routes…</Text>
          </View>
        ) : null}

        {!loading && !error && routes.length === 0 ? (
          <Text style={styles.emptyText}>No routes are set up for your school yet.</Text>
        ) : null}

        {!loading && routes.map((route) => {
          const routeLocked = Boolean(route.lockedByOtherDriverTrip);
          return (
          <TouchableOpacity 
            key={route.id}
            style={[styles.routeCard, routeLocked && styles.routeCardDisabled]}
            activeOpacity={0.7}
            disabled={routeLocked}
            onPress={() => onNext(route)}
          >
            <View style={styles.routeHeader}>
              <View style={styles.routeIconContainer}>
                <Map size={24} color={routeLocked ? Theme.textMuted : Theme.yellowDark} />
              </View>
              <View style={styles.routeHeaderDetails}>
                <Text style={[styles.routeName, routeLocked && styles.routeNameMuted]}>
                  {route.name}
                </Text>
                {routeLocked ? (
                  <Text style={styles.routeLockedHint}>
                    In use by another driver — available when that trip ends or is cancelled
                  </Text>
                ) : null}
                <View style={styles.routeStats}>
                  <View style={styles.statChip}>
                    <Map size={12} color={Theme.textMuted} />
                    <Text style={styles.statText}>{route.stopsCount} stops</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Clock size={12} color={Theme.textMuted} />
                    <Text style={styles.statText}>{route.duration}</Text>
                  </View>
                  <View style={styles.statChip}>
                    <Users size={12} color={Theme.textMuted} />
                    <Text style={styles.statText}>{route.studentsCount}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.viewStopsRow}>
              <Text style={[styles.viewStopsText, routeLocked && styles.viewStopsTextMuted]}>
                {routeLocked ? "Unavailable" : "View Stops"}
              </Text>
              <ChevronRight size={16} color={routeLocked ? Theme.textMuted : Theme.yellowDark} />
            </View>
          </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerCompact: {
    marginBottom: 16,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.yellowDark,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Theme.text,
    marginBottom: 16,
  },
  selectedBusCard: {
    backgroundColor: Theme.yellowSoft,
    borderWidth: 1.5,
    borderColor: Theme.yellow,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  selectedBusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  selectedBusLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.textSecondary,
  },
  selectedBusName: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.text,
  },
  subtitle: {
    fontSize: 15,
    color: Theme.textSecondary,
    lineHeight: 22,
  },
  listContainer: {
    flexGrow: 1,
    gap: 14,
  },
  banner: {
    backgroundColor: Theme.bgMuted,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  bannerText: {
    fontSize: 14,
    color: Theme.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  retryBtn: {
    alignSelf: "flex-start",
    backgroundColor: Theme.yellowSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.yellow,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: Theme.text,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    gap: 10,
  },
  loadingHint: {
    fontSize: 14,
    color: Theme.textMuted,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 15,
    color: Theme.textSecondary,
    textAlign: "center",
    paddingVertical: 24,
    lineHeight: 22,
  },
  routeCard: {
    backgroundColor: Theme.bg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  routeCardDisabled: {
    opacity: 0.72,
    backgroundColor: Theme.bgMuted,
  },
  routeHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  routeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Theme.yellowSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  routeHeaderDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  routeName: {
    fontSize: 17,
    fontWeight: '800',
    color: Theme.text,
    marginBottom: 8,
  },
  routeNameMuted: {
    color: Theme.textMuted,
  },
  routeLockedHint: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.textMuted,
    lineHeight: 16,
    marginBottom: 8,
  },
  routeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Theme.textSecondary,
    fontWeight: '600',
  },
  viewStopsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Theme.yellowSurface,
  },
  viewStopsText: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.text,
  },
  viewStopsTextMuted: {
    color: Theme.textMuted,
  },
});
