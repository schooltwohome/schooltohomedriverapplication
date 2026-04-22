import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { Theme } from "../../_theme/theme";
import { ClipboardCheck, Home, User } from "lucide-react-native";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { consumePendingPushIntent } from "../../../store/slices/pushSlice";
import { normalizeRole } from "../../types/roles";
import { useHelperAssignment } from "../../_context/HelperAssignmentContext";
import DriverDashboard from "./DriverDashboard";
import HomeHeader from "./HomeHeader";
import BottomTabs, { BottomTabDefinition } from "../navigation/BottomTabs";
import HelperAssignmentWizard from "../helper/HelperAssignmentWizard";
import HelperHomeTab from "../helper/HelperHomeTab";
import HelperAttendanceTab, {
  type HelperAttendanceBootstrap,
} from "../helper/HelperAttendanceTab";
import HelperProfileTab from "../helper/HelperProfileTab";

const HELPER_TABS: BottomTabDefinition[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "profile", label: "Profile", icon: User },
];

export default function HomeDashboard() {
  const dispatch = useAppDispatch();
  const me = useAppSelector((s) => s.auth.me);
  const pendingPushIntent = useAppSelector((s) => s.push.pendingPushIntent);
  const role = normalizeRole(me?.user?.role) ?? "driver";
  const { assignment, setAssignment, clearAssignment, hasAssignment } = useHelperAssignment();
  const [activeTab, setActiveTab] = useState("home");
  const [openNotificationsFromPush, setOpenNotificationsFromPush] =
    useState(false);
  const [driverLiveTrip, setDriverLiveTrip] = useState(false);
  const [attendanceBootstrap, setAttendanceBootstrap] = useState<HelperAttendanceBootstrap | null>(
    null
  );

  const handleDriverLiveChange = useCallback((live: boolean) => {
    setDriverLiveTrip(live);
  }, []);

  useEffect(() => {
    if (!pendingPushIntent) return;
    if (pendingPushIntent.kind === "tab") {
      setActiveTab(pendingPushIntent.tab);
    } else if (pendingPushIntent.kind === "notifications") {
      setOpenNotificationsFromPush(true);
    }
    dispatch(consumePendingPushIntent());
  }, [pendingPushIntent, dispatch]);

  const goToAttendance = useCallback((autoStartRfid: boolean) => {
    setAttendanceBootstrap({ autoStartRfid, id: Date.now() });
    setActiveTab("attendance");
  }, []);

  const clearAttendanceBootstrap = useCallback(() => {
    setAttendanceBootstrap(null);
  }, []);

  const helperNeedsSetup = role === "helper" && !hasAssignment;
  const hideHomeChrome = (role === "driver" && driverLiveTrip) || helperNeedsSetup;

  const showBottomTabs =
    role !== "driver" && (role !== "helper" || hasAssignment);

  const headerSubtitle =
    role === "driver"
      ? me?.user?.name
        ? `${me.user.name} · Routes & live trips`
        : "Routes, schedules, and live trips"
      : hasAssignment && assignment
        ? me?.user?.name
          ? `${me.user.name} · ${assignment.bus.name} · ${assignment.route.name}`
          : `${assignment.bus.name} · ${assignment.route.name}`
        : "Select your bus and route to begin";

  return (
    <View style={styles.root}>
      {!hideHomeChrome && (
        <HomeHeader
          greeting="Welcome back"
          userName={headerSubtitle}
          role={role}
          openNotificationsFromPush={openNotificationsFromPush}
          onNotificationsFromPushConsumed={() =>
            setOpenNotificationsFromPush(false)
          }
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
            {activeTab === "home" && (
              <HelperHomeTab
                onOpenRfidAttendance={() => goToAttendance(true)}
                onOpenManualAttendance={() => goToAttendance(false)}
                onOpenAttendanceSheet={() => goToAttendance(false)}
              />
            )}
            {activeTab === "attendance" && (
              <HelperAttendanceTab
                bootstrap={attendanceBootstrap}
                onBootstrapConsumed={clearAttendanceBootstrap}
              />
            )}
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
