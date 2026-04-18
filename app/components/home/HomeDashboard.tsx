import React, { useCallback, useState } from "react";
import { View, StyleSheet } from "react-native";

import { Theme } from "../../theme/theme";
import { ClipboardCheck, Home, User } from "lucide-react-native";

import { useAuth } from "../../context/AuthContext";
import { useHelperAssignment } from "../../context/HelperAssignmentContext";
import DriverDashboard from "./DriverDashboard";
import HomeHeader from "./HomeHeader";
import BottomTabs, { BottomTabDefinition } from "../navigation/BottomTabs";
import HelperAssignmentWizard from "../helper/HelperAssignmentWizard";
import HelperHomeTab from "../helper/HelperHomeTab";
import HelperAttendanceTab from "../helper/HelperAttendanceTab";
import HelperProfileTab from "../helper/HelperProfileTab";

const HELPER_TABS: BottomTabDefinition[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "profile", label: "Profile", icon: User },
];

export default function HomeDashboard() {
  const { role } = useAuth();
  const { assignment, setAssignment, clearAssignment, hasAssignment } = useHelperAssignment();
  const [activeTab, setActiveTab] = useState("home");
  const [driverLiveTrip, setDriverLiveTrip] = useState(false);

  const handleDriverLiveChange = useCallback((live: boolean) => {
    setDriverLiveTrip(live);
  }, []);

  const helperNeedsSetup = role === "helper" && !hasAssignment;
  const hideHomeChrome = (role === "driver" && driverLiveTrip) || helperNeedsSetup;

  const showBottomTabs =
    role !== "driver" && (role !== "helper" || hasAssignment);

  const headerSubtitle =
    role === "driver"
      ? "Routes, schedules, and live trips"
      : hasAssignment && assignment
        ? `${assignment.bus.name} · ${assignment.route.name}`
        : "Select your bus and route to begin";

  return (
    <View style={styles.root}>
      {!hideHomeChrome && (
        <HomeHeader
          greeting="Welcome back"
          userName={headerSubtitle}
          role={role}
        />
      )}

      <View style={[styles.main, hideHomeChrome && styles.mainLiveTrip]}>
        {role === "driver" ? (
          <DriverDashboard onLiveTripChange={handleDriverLiveChange} />
        ) : helperNeedsSetup ? (
          <HelperAssignmentWizard
            onComplete={(bus, route) => {
              setAssignment(bus, route);
              setActiveTab("home");
            }}
          />
        ) : assignment ? (
          <>
            {activeTab === "home" && <HelperHomeTab />}
            {activeTab === "attendance" && <HelperAttendanceTab />}
            {activeTab === "profile" && (
              <HelperProfileTab
                assignment={assignment}
                onChangeAssignment={() => {
                  clearAssignment();
                  setActiveTab("home");
                }}
              />
            )}
          </>
        ) : null}
      </View>

      {!hideHomeChrome && showBottomTabs && (
        <BottomTabs
          activeTab={activeTab}
          onTabPress={setActiveTab}
          tabs={role === "helper" ? HELPER_TABS : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.bg,
  },
  main: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainLiveTrip: {
    paddingHorizontal: 0,
  },
});
