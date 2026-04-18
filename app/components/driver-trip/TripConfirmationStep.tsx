import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Bus, Map, Clock, CheckCircle2, ShieldAlert } from 'lucide-react-native';
import { Theme } from '../../theme/theme';
import { TripData } from './types';

interface Props {
  tripData: TripData;
  onEdit: () => void;
  onStartTrip: () => void | Promise<void>;
}

export default function TripConfirmationStep({ tripData, onEdit, onStartTrip }: Props) {
  const { bus, route, schedule } = tripData;
  const [starting, setStarting] = useState(false);

  const handleStartTrip = async () => {
    if (starting) return;
    setStarting(true);
    try {
      await onStartTrip();
    } finally {
      setStarting(false);
    }
  };

  const renderSummaryCard = (
    title: string, 
    valuePrimary: string, 
    valueSecondary: string, 
    Icon: any, 
    color: string, 
    colorLight: string
  ) => (
    <View style={styles.summaryCard}>
      <View style={[styles.iconContainer, { backgroundColor: colorLight }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.summaryDetails}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryPrimary}>{valuePrimary}</Text>
        <Text style={styles.summarySecondary}>{valueSecondary}</Text>
      </View>
      <View style={styles.statusBadge}>
        <CheckCircle2 size={16} color={Theme.success} />
        <Text style={styles.statusText}>Set</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepText}>Step 4 of 4</Text>
        <Text style={styles.title}>Ready to Start</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Trip Summary</Text>

        <View style={styles.cardsContainer}>
          {bus && renderSummaryCard(
            'Bus',
            bus.name,
            `${bus.licensePlate} • ${bus.seats} seat capacity`,
            Bus,
            Theme.yellowDark,
            Theme.yellowSoft
          )}

          {route && renderSummaryCard(
            'Route',
            route.name,
            `${route.stopsCount} stops • ${route.studentsCount} students`,
            Map,
            Theme.yellowDark,
            Theme.yellowSurface
          )}

          {schedule && renderSummaryCard(
            "Schedule",
            `${schedule.hour}:${schedule.minute} ${schedule.period}`,
            schedule.date,
            Clock,
            Theme.yellowDark,
            Theme.yellowSoft
          )}
        </View>

        <View style={styles.warningContainer}>
          <ShieldAlert size={20} color={Theme.yellowDark} style={styles.warningIcon} />
          <Text style={styles.warningText}>
            Once you start the trip, live GPS tracking will begin and parents will be able to see the bus location in real-time.
          </Text>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onEdit}
          disabled={starting}
        >
          <Text style={styles.secondaryButtonText}>Edit Details</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, starting && styles.primaryButtonDisabled]}
          onPress={handleStartTrip}
          disabled={starting}
        >
          {starting ? (
            <ActivityIndicator color={Theme.text} />
          ) : (
            <Text style={styles.primaryButtonText}>Start Trip</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
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
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Theme.text,
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Theme.bg,
    borderWidth: 1.5,
    borderColor: Theme.border,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  summaryDetails: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.textSecondary,
    marginBottom: 4,
  },
  summaryPrimary: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.text,
    marginBottom: 4,
  },
  summarySecondary: {
    fontSize: 13,
    color: Theme.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.yellowSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Theme.yellow,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: Theme.text,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: Theme.yellowSurface,
    borderWidth: 1.5,
    borderColor: Theme.yellow,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  warningIcon: {
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Theme.text,
    lineHeight: 20,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.bgMuted,
    borderWidth: 1.5,
    borderColor: Theme.border,
  },
  secondaryButtonText: {
    color: Theme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1.5,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.yellow,
    borderWidth: 1.5,
    borderColor: Theme.yellowDark,
  },
  primaryButtonDisabled: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: Theme.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
