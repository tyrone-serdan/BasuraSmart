import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Header, Card, Button, Input, Dropdown, SideMenu } from "@/components/ui";
import { useAppStore, useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { COLORS, commonStyles } from "@/lib/styles";
import { PUROK_LIST } from "@/lib/constants";
import type { Report, ReportStatus } from "@/lib/types";

const purokOptions = PUROK_LIST.map((p) => ({ value: p, label: p }));

function StatusBadge({ status }: { status: ReportStatus }): JSX.Element {
  const statusConfig = {
    pending: { bg: "#fef3c7", color: "#d97706", label: "Pending" },
    investigating: { bg: COLORS.blue[500] + "20", color: COLORS.blue[500], label: "Investigating" },
    resolved: { bg: COLORS.primary[500] + "20", color: COLORS.primary[500], label: "Resolved" },
  };
  const config = statusConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function ReportCard({ report }: { report: Report }): JSX.Element {
  const formattedDate = new Date(report.createdAt).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card variant="elevated" style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportPurok}>
          <Text style={styles.reportPurokText}>{report.purok}</Text>
          <Text style={styles.reportDate}>{formattedDate}</Text>
        </View>
        <StatusBadge status={report.status} />
      </View>
      {report.description && (
        <Text style={styles.reportDescription}>{report.description}</Text>
      )}
      {report.photoUri && (
        <View style={styles.reportImageContainer}>
          <Image source={{ uri: report.photoUri }} style={styles.reportImage} />
          <View style={styles.uploadedBadge}>
            <Text style={styles.uploadedBadgeText}>Photo attached</Text>
          </View>
        </View>
      )}
      {report.latitude && report.longitude && (
        <Text style={styles.reportLocation}>
          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
        </Text>
      )}
    </Card>
  );
}

export default function ReportScreen(): JSX.Element {
  const router = useRouter();
  const { user } = useAuthStore();
  const { reports, addReport, setMenuOpen, loadReports } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    purok: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<{ purok?: string; description?: string }>({});
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    console.log('[Report] useEffect: Loading reports for user:', user?.id);
    const loadUserReports = async () => {
      setIsLoading(true);
      try {
        console.log('[Report] loadUserReports: Calling loadReports...');
        await loadReports(user?.id);
        console.log('[Report] loadUserReports: Complete');
      } catch (error) {
        console.error('[Report] loadUserReports: Error:', error);
      } finally {
        setIsLoading(false);
        console.log('[Report] loadUserReports: Finished');
      }
    };
    loadUserReports();
  }, [user?.id]);

  const validateForm = () => {
    const errors: { purok?: string; description?: string } = {};
    if (!formData.purok) errors.purok = "Please select a purok";
    if (!formData.description.trim()) errors.description = "Please describe the issue";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoPick = async (useCamera: boolean = false) => {
    setIsPhotoUploading(true);
    
    try {
      if (useCamera) {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert("Permission Required", "Camera permission is needed to take photos.");
          return;
        }
        
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
          setPhotoUri(result.assets[0].uri);
        }
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Permission Required", "Photo library permission is needed.");
          return;
        }
        
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
          setPhotoUri(result.assets[0].uri);
        }
      }
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleLocationGet = async () => {
    setIsLocating(true);
    
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert("Permission Required", "Location permission is needed to tag your report location.");
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('[Report] Location error:', error);
      Alert.alert("Error", "Unable to get location. Please try again.");
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (!user?.id) {
        Alert.alert("Error", "You must be logged in to submit a report");
        return;
      }
      const response = await api.createReport({
        purok: formData.purok,
        description: formData.description.trim(),
        photoUri: photoUri || undefined,
        latitude: location?.latitude,
        longitude: location?.longitude,
      }, user.id);

      if (response.success && response.data) {
        addReport(response.data);
        Alert.alert("Success", "Your report has been submitted!", [
          { text: "OK", onPress: () => resetForm() },
        ]);
      } else {
        Alert.alert("Error", response.error || "Failed to submit report");
      }
    } catch (_error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setFormData({ purok: "", description: "" });
    setFormErrors({});
    setPhotoUri(null);
    setLocation(null);
  };

  const handleBack = () => {
    if (showForm) {
      setShowForm(false);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <Header
        title={showForm ? "New Report" : "My Reports"}
        onMenuPress={() => setMenuOpen(true)}
        showMenu
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showForm ? (
          <>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back to Reports</Text>
            </TouchableOpacity>

            <Card variant="elevated" style={styles.formCard}>
              <Text style={styles.formTitle}>Report Illegal Dumping</Text>
              <Text style={styles.formSubtitle}>
                Help keep our community clean by reporting illegal dumping activities
              </Text>

              <View style={styles.formFields}>
                <Dropdown
                  label="Select Purok"
                  placeholder="Choose the purok location"
                  value={formData.purok}
                  options={purokOptions}
                  onSelect={(value) => setFormData({ ...formData, purok: value })}
                  error={formErrors.purok}
                />

                <Input
                  label="Description"
                  placeholder="Describe what you saw (e.g., 'Old furniture dumped near the canal')"
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  error={formErrors.description}
                  multiline
                  numberOfLines={4}
                />

                <View style={styles.attachmentSection}>
                  <Text style={styles.attachmentLabel}>Attachments (Optional)</Text>

                  <View style={styles.photoButtonsRow}>
                    <TouchableOpacity
                      onPress={() => handlePhotoPick(true)}
                      disabled={isPhotoUploading}
                      style={[styles.attachmentButton, styles.photoButton]}
                    >
                      {isPhotoUploading ? (
                        <ActivityIndicator color={COLORS.primary[500]} />
                      ) : photoUri ? (
                        <View style={styles.photoPreviewContainer}>
                          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                          <View style={styles.uploadedOverlay}>
                            <Text style={styles.uploadedText}>Photo Ready</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.attachmentButtonContent}>
                          <Text style={styles.attachmentButtonText}>Take Photo</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handlePhotoPick(false)}
                      disabled={isPhotoUploading}
                      style={[styles.attachmentButton, styles.photoButton]}
                    >
                      <View style={styles.attachmentButtonContent}>
                        <Text style={styles.attachmentButtonText}>Choose Photo</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={handleLocationGet}
                    disabled={isLocating}
                    style={[styles.attachmentButton, styles.locationButton]}
                  >
                    {isLocating ? (
                      <ActivityIndicator color={COLORS.primary[500]} />
                    ) : location ? (
                      <View style={styles.locationPreview}>
                        <Text style={styles.locationText}>
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.attachmentButtonContent}>
                        <Text style={styles.attachmentButtonText}>Add Location</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title={isSubmitting ? "Submitting..." : "Submit Report"}
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.submitButton}
              />
            </Card>
          </>
        ) : (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.sectionTitle}>Your Reports</Text>
              <Button
                title="+ New Report"
                onPress={() => setShowForm(true)}
                variant="primary"
                size="sm"
              />
            </View>

            {reports.length === 0 ? (
              <Card variant="elevated" style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No Reports Yet</Text>
                <Text style={styles.emptyText}>
                  You haven't submitted any illegal dumping reports yet. Tap "New Report" to get started.
                </Text>
              </Card>
            ) : (
              <View style={styles.reportsList}>
                {reports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <SideMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: COLORS.primary[600],
    fontSize: 16,
    fontWeight: "500",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
  },
  formCard: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  formFields: {
    marginBottom: 24,
  },
  attachmentSection: {
    marginTop: 8,
  },
  photoButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  photoButton: {
    flex: 1,
  },
  attachmentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 12,
  },
  attachmentButton: {
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    borderStyle: "dashed",
  },
  attachmentButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachmentButtonText: {
    fontSize: 16,
    color: COLORS.primary[600],
    fontWeight: "500",
  },
  locationButton: {},
  photoPreviewContainer: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  photoPreview: {
    width: "100%",
    height: "100%",
  },
  uploadedOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary[500],
    paddingVertical: 4,
    alignItems: "center",
  },
  uploadedText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
  },
  locationPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
  },
  submitButton: {
    marginTop: 8,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  reportsList: {
    gap: 12,
  },
  reportCard: {
    marginBottom: 0,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reportPurok: {
    flex: 1,
  },
  reportPurokText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reportDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  reportImageContainer: {
    marginBottom: 12,
    position: "relative",
  },
  reportImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  uploadedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary[500],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  uploadedBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "600",
  },
  reportLocation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
});