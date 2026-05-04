import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteMap } from "@/components/map";
import { Header, Card, Button, SideMenu } from "@/components/ui";
import { useAppStore, useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { COLORS, commonStyles } from "@/lib/styles";
import { WASTE_TYPES } from "@/lib/constants";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CollectorRouteScreen(): JSX.Element {
  const { user } = useAuthStore();
  const { currentRoute, completePickup, completeStop, isMenuOpen, setMenuOpen } = useAppStore();
  const [isCompleting, setIsCompleting] = useState(false);

  const pendingStops = currentRoute?.stops.filter(s => s.status === "pending") || [];
  const completedStops = currentRoute?.stops.filter(s => s.status === "completed") || [];

  const handleStopComplete = (stopId: string, purok: string) => {
    Alert.alert(
      "Confirm Segregation",
      `Did residents at ${purok} properly segregate their waste?`,
      [
        { text: "No", style: "cancel", onPress: () => completeStop(stopId) },
        {
          text: "Yes",
          onPress: () => {
            completeStop(stopId);
            Alert.alert(
              "Points Awarded!",
              `+20 points have been awarded to all residents in ${purok} for proper segregation!`,
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const handleCompleteAll = async () => {
    setIsCompleting(true);
    
    try {
      if (currentRoute) {
        await api.completePickup(currentRoute.id);
      }
      
      completePickup();
      
      Alert.alert("Pickup Complete!", "All stops have been completed successfully.", [{ text: "OK" }]);
    } catch (error) {
      Alert.alert("Error", "Failed to complete pickup. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const getWasteTypeLabel = (type?: string): string => {
    if (!type) return "Mixed";
    return WASTE_TYPES[type as keyof typeof WASTE_TYPES]?.label || "Mixed";
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header title="ROUTE" showMenu onMenuPress={() => setMenuOpen(true)} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <RouteMap
            stops={currentRoute?.stops}
            height={350}
          />
          
          <View style={styles.progressContainer}>
            <View style={styles.progressDot} />
            <Text style={styles.progressText}>
              {completedStops.length} of {currentRoute?.totalStops || 0} completed
            </Text>
          </View>
        </View>

        <View style={styles.stopsContainer}>
          {pendingStops.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Stops ({pendingStops.length})</Text>
              {pendingStops.map((stop, index) => {
                const originalIndex = currentRoute?.stops.findIndex(s => s.id === stop.id) ?? 0;
                return (
                  <Card key={stop.id} variant="elevated" style={styles.stopCard} onPress={() => handleStopComplete(stop.id, stop.purok)}>
                    <View style={styles.stopContent}>
                      <View style={styles.stopNumber}>
                        <Text style={styles.stopNumberText}>{originalIndex + 1}</Text>
                      </View>
                      <View style={styles.stopInfo}>
                        <Text style={styles.stopPurok}>{stop.purok}</Text>
                        <Text style={styles.stopAddress}>{stop.address}</Text>
                        {stop.wasteType && <Text style={styles.stopWaste}>{getWasteTypeLabel(stop.wasteType)}</Text>}
                      </View>
                      <TouchableOpacity onPress={() => handleStopComplete(stop.id, stop.purok)} style={styles.doneButton}>
                        <Text style={styles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          {completedStops.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Completed ({completedStops.length})</Text>
              {completedStops.map((stop) => {
                const originalIndex = currentRoute?.stops.findIndex(s => s.id === stop.id) ?? 0;
                return (
                  <Card key={stop.id} variant="outlined" style={[styles.stopCard, styles.completedCard]}>
                    <View style={styles.stopContent}>
                      <View style={[styles.stopNumber, styles.completedNumber]}>
                        <Text style={styles.completedCheck}>✓</Text>
                      </View>
                      <View style={styles.stopInfo}>
                        <Text style={[styles.stopPurok, styles.completedText]}>{stop.purok}</Text>
                        <Text style={styles.stopAddress}>{stop.address}</Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          <Button
            title="Pick up Complete"
            onPress={handleCompleteAll}
            loading={isCompleting}
            disabled={pendingStops.length > 0}
            style={styles.completeButton}
          />
          
          {pendingStops.length > 0 && (
            <Text style={styles.hintText}>Complete all stops to finish the route</Text>
          )}
        </View>
      </ScrollView>

      <SideMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  mapContainer: { backgroundColor: "#dbeafe", alignItems: "center", paddingVertical: 16 },
  progressContainer: { marginTop: 16, backgroundColor: "#ffffff", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 12 },
  progressDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary[500] },
  progressText: { color: COLORS.primary[700], fontSize: 14, fontWeight: "500" },
  stopsContainer: { padding: 16, paddingBottom: 32 },
  section: { marginBottom: 16 },
  sectionTitle: { color: COLORS.text, fontWeight: "600", marginBottom: 12 },
  stopCard: { marginBottom: 8 },
  completedCard: { opacity: 0.7 },
  stopContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  stopNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray[200], alignItems: "center", justifyContent: "center" },
  stopNumberText: { color: COLORS.gray[600], fontWeight: "bold" },
  completedNumber: { backgroundColor: COLORS.primary[100] },
  completedCheck: { color: COLORS.primary[600] },
  stopInfo: { flex: 1 },
  stopPurok: { color: COLORS.text, fontWeight: "500" },
  completedText: { textDecorationLine: "line-through", color: COLORS.gray[500] },
  stopAddress: { color: COLORS.gray[500], fontSize: 14 },
  stopWaste: { color: COLORS.gray[400], fontSize: 12, marginTop: 2 },
  doneButton: { backgroundColor: COLORS.primary[500], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  doneButtonText: { color: COLORS.white, fontSize: 14, fontWeight: "500" },
  completeButton: { marginTop: 8, marginBottom: 16 },
  hintText: { textAlign: "center", color: COLORS.gray[500], fontSize: 14, marginBottom: 24 },
});