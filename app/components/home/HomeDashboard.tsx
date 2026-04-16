import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import BusStatusCard from "./BusStatusCard";
import ChildStatusCard from "./ChildStatusCard";
import ActivityTimeline from "./ActivityTimeline";

export default function HomeDashboard() {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <BusStatusCard
        route="Route 12 - Morning Trip"
        distance="2.5 km away"
        eta="10 mins"
        onTrackPress={() => console.log("Tracking...")}
      />

      <ChildStatusCard 
        name="Alex Johnson" 
        className="Grade 4-B" 
        isOnBus={true} 
      />

      <ChildStatusCard 
        name="Sarah Johnson" 
        className="Grade 2-A" 
        isOnBus={false} 
      />

      <ActivityTimeline 
        activities={[
          { id: "1", title: "Bus departed from depot", time: "7:30 AM", type: "bus", description: "Route 12 morning trip started." },
          { id: "2", title: "Liam boarded at Stop #12", time: "7:45 AM", type: "board", description: "Checked in via student ID card." },
          { id: "3", title: "Arrived at school", time: "8:05 AM", type: "arrive", description: "Safe arrival at the main campus." },
        ]} 
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
});
