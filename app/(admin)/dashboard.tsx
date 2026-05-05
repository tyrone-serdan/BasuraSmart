import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header, Card, Button } from "@/components/ui";
import { useAppStore, useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { COLORS, commonStyles } from "@/lib/styles";
import { USER_TYPES } from "@/lib/constants";
import type { Report, ReportStatus } from "@/lib/types";

export default function AdminDashboard(): JSX.Element {
  const { user, logout } = useAuthStore();
  const { reports, updateReportStatus, collectorIssues, loadReports, setReports } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[AdminDashboard] useEffect: Loading data...');
    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('[AdminDashboard] loadData: Calling loadReports...');
        await loadReports(undefined, true);
        console.log('[AdminDashboard] loadData: Complete');
      } catch (error) {
        console.error('[AdminDashboard] loadData: Error:', error);
      } finally {
        setIsLoading(false);
        console.log('[AdminDashboard] loadData: Finished loading');
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalReports = reports.length;
    const resolvedReports = reports.filter(r => r.status === "resolved").length;
    const pendingReports = reports.filter(r => r.status === "pending").length;
    const investigatingReports = reports.filter(r => r.status === "investigating").length;
    const collectorsOnDuty = 1;
    const dropoffPointsCollected = pendingReports * 20;

    return {
      totalReports,
      resolvedReports,
      pendingReports,
      investigatingReports,
      collectorsOnDuty,
      dropoffPointsCollected,
    };
  }, [reports]);

  const handleStatusChange = (reportId: string, status: ReportStatus) => {
    updateReportStatus(reportId, status);
    Alert.alert("Status Updated", `Report marked as ${status}`, [
      { text: "OK", onPress: () => setSelectedReport(null) },
    ]);
  };

  const openReportDetails = (report: Report) => {
    setSelectedReport(report);
  };

  const closeReportDetails = () => {
    setSelectedReport(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return COLORS.error;
      case "investigating": return COLORS.blue[500];
      case "resolved": return "#22c55e";
      default: return COLORS.textSecondary;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header title="Admin Dashboard" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeText}>
          Welcome, {user?.name}
        </Text>

        <View style={styles.statsGrid}>
          <Card variant="elevated" style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalReports}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#22c55e" }]}>
              {stats.dropoffPointsCollected}
            </Text>
            <Text style={styles.statLabel}>Dropoff Points Collected</Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.primary[600] }]}>
              {stats.collectorsOnDuty}
            </Text>
            <Text style={styles.statLabel}>Collectors on Duty</Text>
          </Card>

          <Card variant="elevated" style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#22c55e" }]}>
              {stats.resolvedReports}
            </Text>
            <Text style={styles.statLabel}>Reports Resolved</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>REPORTS</Text>

        {reports.length === 0 ? (
          <Card variant="elevated" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No reports yet</Text>
          </Card>
        ) : (
          <View style={styles.reportsList}>
            {reports.map((report) => (
              <TouchableOpacity
                key={report.id}
                onPress={() => openReportDetails(report)}
              >
                <Card variant="outlined" style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportPurok}>📍 {report.purok}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + "20" }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportDescription} numberOfLines={2}>
                    {report.description}
                  </Text>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {selectedReport && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Details</Text>
            
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Purok</Text>
              <Text style={styles.modalValue}>{selectedReport.purok}</Text>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Description</Text>
              <Text style={styles.modalValue}>{selectedReport.description}</Text>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Status</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    selectedReport.status === "pending" && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(selectedReport.id, "pending")}
                >
                  <Text style={[
                    styles.statusButtonText,
                    selectedReport.status === "pending" && styles.statusButtonTextActive,
                  ]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    selectedReport.status === "investigating" && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(selectedReport.id, "investigating")}
                >
                  <Text style={[
                    styles.statusButtonText,
                    selectedReport.status === "investigating" && styles.statusButtonTextActive,
                  ]}>Investigating</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    selectedReport.status === "resolved" && styles.statusButtonActive,
                  ]}
                  onPress={() => handleStatusChange(selectedReport.id, "resolved")}
                >
                  <Text style={[
                    styles.statusButtonText,
                    selectedReport.status === "resolved" && styles.statusButtonTextActive,
                  ]}>Resolved</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button title="Close" onPress={closeReportDetails} variant="outline" />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 32 },
  welcomeText: { fontSize: 18, fontWeight: "600", color: COLORS.text, marginBottom: 20 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: { width: "47%", padding: 16, alignItems: "center" },
  statValue: { fontSize: 32, fontWeight: "bold", color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary, marginBottom: 12 },
  emptyCard: { padding: 24, alignItems: "center" },
  emptyText: { color: COLORS.textSecondary },
  reportsList: { gap: 8 },
  reportCard: { padding: 16 },
  reportHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  reportPurok: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "500" },
  reportDescription: { fontSize: 14, color: COLORS.textSecondary },
  modalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: "600", color: COLORS.text, marginBottom: 20 },
  modalField: { marginBottom: 16 },
  modalLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  modalValue: { fontSize: 16, color: COLORS.text },
  statusButtons: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  statusButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray[300] },
  statusButtonActive: { backgroundColor: COLORS.primary[500], borderColor: COLORS.primary[500] },
  statusButtonText: { fontSize: 12, color: COLORS.textSecondary },
  statusButtonTextActive: { color: COLORS.white },
});