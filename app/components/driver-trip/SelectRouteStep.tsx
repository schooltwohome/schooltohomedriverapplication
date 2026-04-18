import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Map, Clock, Users, ChevronRight, Bus } from 'lucide-react-native';
import { Theme } from '../../theme/theme';
import { BusItem, RouteItem } from './types';

interface Props {
  selectedBus: BusItem | null;
  onNext: (route: RouteItem) => void;
  /** Overrides the default "Step 2 of 4" label (e.g. helper flow uses 2 steps). */
  stepLabel?: string;
  hideStepLabel?: boolean;
}

const routes: RouteItem[] = [
  { id: 'R1', name: 'North Zone - Morning', stopsCount: 12, duration: '1h 15min', studentsCount: 28 },
  { id: 'R2', name: 'South Zone - Morning', stopsCount: 10, duration: '1h 05min', studentsCount: 24 },
  { id: 'R3', name: 'East Zone - Morning', stopsCount: 8, duration: '55min', studentsCount: 20 },
];

export default function SelectRouteStep({
  selectedBus,
  onNext,
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

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContainer, { paddingBottom: scrollBottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        {routes.map((route) => (
          <TouchableOpacity 
            key={route.id}
            style={styles.routeCard}
            activeOpacity={0.7}
            onPress={() => onNext(route)}
          >
            <View style={styles.routeHeader}>
              <View style={styles.routeIconContainer}>
                <Map size={24} color={Theme.yellowDark} />
              </View>
              <View style={styles.routeHeaderDetails}>
                <Text style={styles.routeName}>{route.name}</Text>
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
              <Text style={styles.viewStopsText}>View Stops</Text>
              <ChevronRight size={16} color={Theme.yellowDark} />
            </View>
          </TouchableOpacity>
        ))}
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
});
