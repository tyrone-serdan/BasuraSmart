import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteMap } from "@/components/map";
import { Header, Card, Button, SideMenu } from "@/components/ui";
import { useAppStore, useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { COLORS, commonStyles } from "@/lib/styles";
import { WASTE_TYPES, COLLECTOR_ISSUE_TYPES, PUROK_LIST } from "@/lib/constants";
import type { CollectorIssue, CollectorIssueType } from "@/lib/types";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CollectorRouteScreen(): JSX.Element {
  const { user } = useAuthStore();
  const { currentRoute, setCurrentRoute, completePickup, completeStop, isMenuOpen, setMenuOpen, addCollectorIssue } = useAppStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [issueForm, setIssueForm] = useState({
    purok: "",
    issueType: "" as CollectorIssueType | "",
    description: "",
  });

  useEffect(() => {
    console.log('[CollectorRoute] useEffect: Loading routes, user:', user?.email);
    const loadRoutes = async () => {
      setIsLoading(true);
      try {
        console.log('[CollectorRoute] loadRoutes: Calling API...');
        const response = await api.getRoutes(user?.id);
        console.log('[CollectorRoute] loadRoutes: Response:', response.success ? 'Success' : 'Failed');
        
        if (response.success && response.data && response.data.length > 0) {
          console.log('[CollectorRoute] loadRoutes: Found', response.data.length, 'routes');
          setCurrentRoute(response.data[0]);
        } else {
          console.log('[CollectorRoute] loadRoutes: No routes found or error:', response.error);
        }
      } catch (error) {
        console.error('[CollectorRoute] loadRoutes: Error:', error);
      } finally {
        setIsLoading(false);
        console.log('[CollectorRoute] loadRoutes: Complete');
      }
    };
    
    if (user?.id) {
      loadRoutes();
    } else {
      console.log('[CollectorRoute] useEffect: No user.id, skipping load');
    }
  }, [user?.id]);

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
      if (currentRoute && user) {
        await api.completePickup(currentRoute.id, user.id);
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

  const handleReportIssue = () => {
    if (!issueForm.purok || !issueForm.issueType) {
      Alert.alert("Error", "Please select purok and issue type");
      return;
    }

    const newIssue: CollectorIssue = {
      id: "issue-" + Date.now(),
      purok: issueForm.purok,
      issueType: issueForm.issueType as CollectorIssueType,
      description: issueForm.description,
      createdAt: new Date().toISOString(),
    };

    addCollectorIssue(newIssue);
    Alert.alert("Issue Reported", "Your issue has been recorded.", [
      { text: "OK", onPress: () => setIssueForm({ purok: "", issueType: "", description: "" }) },
    ]);
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
          <Button
            title="⚠ Report Issue"
            variant="outline"
            onPress={() => setShowIssueForm(!showIssueForm)}
            style={styles.reportIssueButton}
          />

          {showIssueForm && (
            <Card variant="elevated" style={styles.issueFormCard}>
              <Text style={styles.issueFormTitle}>Report an Issue</Text>
              
              <View style={styles.formField}>
                <Text style={styles.formLabel}>Purok</Text>
                <View style={styles.purokButtons}>
                  {PUROK_LIST.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.purokButton, issueForm.purok === p && styles.purokButtonSelected]}
                      onPress={() => setIssueForm({ ...issueForm, purok: p })}
                    >
                      <Text style={[styles.purokButtonText, issueForm.purok === p && styles.purokButtonTextSelected]}>{p.replace("Purok ", "P")}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Issue Type</Text>
                <View style={styles.issueTypeButtons}>
                  {(Object.keys(COLLECTOR_ISSUE_TYPES) as CollectorIssueType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.issueTypeButton, { borderColor: COLLECTOR_ISSUE_TYPES[type].color }, issueForm.issueType === type && { backgroundColor: COLLECTOR_ISSUE_TYPES[type].color }]}
                      onPress={() => setIssueForm({ ...issueForm, issueType: type })}
                    >
                      <Text style={[styles.issueTypeButtonText, { color: COLLECTOR_ISSUE_TYPES[type].color }, issueForm.issueType === type && { color: COLORS.white }]}>
                        {COLLECTOR_ISSUE_TYPES[type].label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Button title="Submit Issue" onPress={handleReportIssue} variant="primary" />
            </Card>
          )}

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
  reportIssueButton: { marginBottom: 16 },
  issueFormCard: { marginBottom: 16 },
  issueFormTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text, marginBottom: 16 },
  formField: { marginBottom: 16 },
  formLabel: { fontSize: 14, fontWeight: "500", color: COLORS.text, marginBottom: 8 },
  purokButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  purokButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray[300] },
  purokButtonSelected: { backgroundColor: COLORS.primary[500], borderColor: COLORS.primary[500] },
  purokButtonText: { fontSize: 12, color: COLORS.text },
  purokButtonTextSelected: { color: COLORS.white },
  issueTypeButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  issueTypeButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 2 },
  issueTypeButtonText: { fontSize: 12, fontWeight: "500" },
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