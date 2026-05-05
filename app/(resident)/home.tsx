import React, { useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Legend, SideMenu } from "@/components/ui";
import { TrashBin, Bell } from "@/components/illustrations";
import { useAppStore, useAuthStore } from "@/lib/store";
import { COLORS, commonStyles } from "@/lib/styles";
import { DAYS_OF_WEEK, MONTHS, WASTE_TYPES, ANNOUNCEMENT_TYPES } from "@/lib/constants";
import type { CalendarDay, WasteType, Announcement } from "@/lib/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CALENDAR_PADDING = 24;
const CALENDAR_GAP = 4;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - CALENDAR_PADDING * 2 - CALENDAR_GAP * 6) / 7);

function CalendarCell({ day, onPress }: { day: CalendarDay; onPress: () => void }): JSX.Element {
  const getWasteTypeColor = (type?: WasteType): string => {
    if (!type) return "";
    return WASTE_TYPES[type]?.color || COLORS.gray[500];
  };

  if (day.date === 0) {
    return <View style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!day.wasteType}
      style={[styles.cell, day.isToday && styles.cellToday]}
    >
      <Text style={[styles.cellText, day.isToday && styles.cellTextToday]}>{day.date}</Text>
      {day.wasteType && (
        <View style={[styles.cellDot, { backgroundColor: getWasteTypeColor(day.wasteType) }]} />
      )}
    </TouchableOpacity>
  );
}

export default function ResidentHomeScreen(): JSX.Element {
  console.log('[HomeScreen] Rendering!');
  const { user } = useAuthStore();
  const {
    calendarDays,
    currentMonth,
    currentYear,
    selectedDate,
    setSelectedDate,
    setMonth,
    generateCalendarDays,
    getScheduleForDate,
    isMenuOpen,
    setMenuOpen,
    latestAnnouncement,
    dismissAnnouncement,
    loadAnnouncements,
    loadSchedule,
  } = useAppStore();

  console.log('[HomeScreen] User:', user?.name);
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    console.log('[Home] useEffect: Loading data, user purok:', user?.purok);
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadAnnouncements(),
          loadSchedule(user?.purok)
        ]);
        console.log('[Home] useEffect: Data loaded successfully');
      } catch (error) {
        console.error('[Home] useEffect: Error loading home data:', error);
      } finally {
        setIsLoading(false);
        console.log('[Home] useEffect: Loading complete');
      }
    };
    loadData();
  }, [user?.purok]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, currentYear]);

  const selectedSchedule = useMemo(() => {
    return getScheduleForDate(selectedDate);
  }, [selectedDate, getScheduleForDate]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setMonth(11, currentYear - 1);
    } else {
      setMonth(currentMonth - 1, currentYear);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setMonth(0, currentYear + 1);
    } else {
      setMonth(currentMonth + 1, currentYear);
    }
  };

  const handleDayPress = (day: CalendarDay) => {
    if (day.date > 0) {
      setSelectedDate(new Date(day.year, day.month, day.date));
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header
        title={`Hello, ${user?.name?.split(" ")[0] || "User"}!`}
        showMenu
        onMenuPress={() => setMenuOpen(true)}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {latestAnnouncement && (
          <Card variant="elevated" style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={[styles.announcementBadge, { backgroundColor: ANNOUNCEMENT_TYPES[latestAnnouncement.type]?.color || "#f59e0b" }]}>
                <Text style={styles.announcementBadgeText}>{ANNOUNCEMENT_TYPES[latestAnnouncement.type]?.label || "Announcement"}</Text>
              </View>
              <TouchableOpacity onPress={dismissAnnouncement} style={styles.dismissButton}>
                <Text style={styles.dismissText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.announcementTitle}>{latestAnnouncement.title}</Text>
            <Text style={styles.announcementMessage}>{latestAnnouncement.message}</Text>
          </Card>
        )}

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{MONTHS[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calendar}>
          <View style={styles.dayHeaders}>
            {DAYS_OF_WEEK.map((day) => (
              <View key={day} style={{ width: CELL_SIZE }}>
                <Text style={styles.dayHeader}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.cellsContainer}>
            {calendarDays.map((day, index) => (
              <CalendarCell
                key={`${day.month}-${day.date}-${index}`}
                day={day}
                onPress={() => handleDayPress(day)}
              />
            ))}
          </View>
        </View>

        <Legend />

        {selectedSchedule && (
          <Card variant="primary" style={styles.reminderCard}>
            <View style={styles.reminderContent}>
              <Bell width={32} height={32} color={COLORS.error} />
              <View style={styles.reminderText}>
                <Text style={styles.reminderTitle}>Reminder</Text>
                <Text style={styles.reminderMessage}>
                  {selectedSchedule.wasteType === "biodegradable"
                    ? "Green Bin Day - Biodegradable waste"
                    : selectedSchedule.wasteType === "non-biodegradable"
                    ? "Gray Bin Day - Non-biodegradable waste"
                    : "Blue Bin Day - Recyclables"}
                </Text>
                <Text style={styles.reminderTime}>Pickup time: 08:00 AM</Text>
              </View>
            </View>
          </Card>
        )}

        <Card variant="elevated" style={styles.guideCard}>
          <View style={styles.guideContent}>
            <TrashBin width={60} height={75} color={COLORS.primary[600]} />
            <View style={styles.guideText}>
              <Text style={styles.guideTitle}>Guide for garbage segregation</Text>
              <Text style={styles.guideSubtitle}>Learn how to properly sort your waste. Tap to view the full guide.</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      <SideMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: CALENDAR_PADDING, paddingBottom: 32 },
  announcementCard: {
    marginBottom: 16,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  announcementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  announcementBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  announcementMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  navButton: { padding: 8 },
  navButtonText: { color: COLORS.primary[600], fontSize: 20 },
  monthTitle: { color: COLORS.text, fontSize: 18, fontWeight: "600" },
  calendar: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 16 },
  dayHeaders: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  dayHeader: { color: COLORS.primary[600], fontSize: 12, fontWeight: "500", textAlign: "center" },
  cellsContainer: { flexDirection: "row", flexWrap: "wrap", gap: CALENDAR_GAP },
  cell: { width: CELL_SIZE, height: CELL_SIZE, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray[200], alignItems: "center", justifyContent: "center" },
  cellToday: { borderWidth: 2, borderColor: COLORS.primary[500] },
  cellText: { fontSize: 14, color: COLORS.gray[700] },
  cellTextToday: { fontWeight: "bold", color: COLORS.primary[600] },
  cellDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  reminderCard: { marginBottom: 16 },
  reminderContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  reminderText: { flex: 1 },
  reminderTitle: { color: COLORS.white, fontWeight: "600" },
  reminderMessage: { color: COLORS.white, opacity: 0.9, fontSize: 14 },
  reminderTime: { color: COLORS.white, opacity: 0.8, fontSize: 12, marginTop: 4 },
  guideCard: { marginBottom: 32 },
  guideContent: { flexDirection: "row", alignItems: "center", gap: 16 },
  guideText: { flex: 1 },
  guideTitle: { color: COLORS.text, fontWeight: "600", marginBottom: 4 },
  guideSubtitle: { color: COLORS.textSecondary, fontSize: 14 },
});