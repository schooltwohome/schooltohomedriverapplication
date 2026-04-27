import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bus, Users, Wrench, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { Theme } from '../../_theme/theme';
import { BusItem, BusStatus } from './types';

interface Props {
  onNext: (bus: BusItem) => void;
  buses: BusItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Shown under the subtitle (e.g. driver tip after re-login). */
  extraHint?: string;
  /** Overrides the default "Step 1 of 4" label (e.g. helper flow uses 2 steps). */
  stepLabel?: string;
  /** When true, hides the step line (e.g. parent wizard shows step + progress). */
  hideStepLabel?: boolean;
}

export default function SelectBusStep({
  onNext,
  buses,
  loading = false,
  error = null,
  onRetry,
  extraHint,
  stepLabel = "Step 1 of 4",
  hideStepLabel = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const scrollBottomPad = Math.max(insets.bottom, 20);
  const getStatusColor = (status: BusStatus) => {
    switch (status) {
      case 'Available': return '#10B981'; // Emerald 500
      case 'In Use': return '#F59E0B'; // Amber 500
      case 'Maintenance': return '#EF4444'; // Red 500
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: BusStatus) => {
    switch (status) {
      case 'Available': return <CheckCircle2 size={16} color="#10B981" />;
      case 'In Use': return <AlertCircle size={16} color="#F59E0B" />;
      case 'Maintenance': return <Wrench size={16} color="#EF4444" />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, hideStepLabel && styles.headerCompact]}>
        {!hideStepLabel ? <Text style={styles.stepText}>{stepLabel}</Text> : null}
        <Text style={styles.title}>{hideStepLabel ? "Select bus" : "Select Bus"}</Text>
        <Text style={styles.subtitle}>
          {hideStepLabel
            ? "Choose the bus you are supporting today"
            : "Select the bus assigned for your trip today"}
        </Text>
        {extraHint ? <Text style={styles.extraHint}>{extraHint}</Text> : null}
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
            <Text style={styles.loadingHint}>Loading buses…</Text>
          </View>
        ) : null}

        {!loading && !error && buses.length === 0 ? (
          <Text style={styles.emptyText}>No buses are registered for your school yet.</Text>
        ) : null}

        {!loading && buses.map((bus) => {
          const isAvailable = bus.status === 'Available';
          return (
            <TouchableOpacity 
              key={bus.id}
              style={[styles.busCard, !isAvailable && styles.busCardDisabled]}
              disabled={!isAvailable}
              activeOpacity={0.7}
              onPress={() => onNext(bus)}
            >
              <View style={styles.busIconContainer}>
                <Bus size={24} color={isAvailable ? Theme.yellowDark : Theme.textMuted} />
              </View>
              
              <View style={styles.busDetails}>
                <Text style={styles.busName}>{bus.name}</Text>
                <Text style={styles.licensePlate}>{bus.licensePlate}</Text>
                <View style={styles.seatsContainer}>
                  <Users size={14} color={Theme.textMuted} />
                  <Text style={styles.seatsText}>{bus.seats} seats</Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(bus.status)}15` }]}>
                  {getStatusIcon(bus.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(bus.status) }]}>
                    {bus.status}
                  </Text>
                </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Theme.textSecondary,
    lineHeight: 22,
  },
  extraHint: {
    marginTop: 10,
    fontSize: 13,
    color: Theme.textMuted,
    lineHeight: 18,
    fontWeight: "600",
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
  busCard: {
    backgroundColor: Theme.bg,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  busCardDisabled: {
    backgroundColor: Theme.bgMuted,
    opacity: 0.65,
  },
  busIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Theme.yellowSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  busDetails: {
    flex: 1,
  },
  busName: {
    fontSize: 17,
    fontWeight: '800',
    color: Theme.text,
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 13,
    color: Theme.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seatsText: {
    fontSize: 13,
    color: Theme.textMuted,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
