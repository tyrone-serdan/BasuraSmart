import type { Route, Reminder, PickupSchedule, WasteType, Reward, Announcement } from "./types";

export const COLORS = {
  primary: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
    950: "#022c22",
  },
  background: "#ecfdf5",
  card: "#ffffff",
  text: "#022c22",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  error: "#ef4444",
  warning: "#f59e0b",
  success: "#22c55e",
  biodegradable: "#10b981",
  nonBiodegradable: "#6b7280",
  recyclables: "#3b82f6",
} as const;

export const PUROK_LIST = [
  "Purok 1",
  "Purok 2",
  "Purok 3",
  "Purok 4",
  "Purok 5",
  "Purok 6",
  "Purok 7",
  "Purok 8",
  "Purok 9",
  "Purok 10",
  "Purok 10-A",
  "Purok 11",
  "Purok 12",
  "Purok 12-A",
] as const;

export const USER_TYPES = [
  { value: "resident", label: "Resident" },
  { value: "collector", label: "Garbage Collector" },
] as const;

export const WASTE_TYPES: Record<WasteType, { label: string; color: string }> = {
  biodegradable: {
    label: "Biodegradable",
    color: "#10b981",
  },
  "non-biodegradable": {
    label: "Non-biodegradable",
    color: "#6b7280",
  },
  recyclables: {
    label: "Recyclables",
    color: "#3b82f6",
  },
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
] as const;

export const MOCK_PICKUP_SCHEDULE: PickupSchedule[] = [
  { id: "1", date: "2026-04-01", wasteType: "biodegradable", purok: "Purok 1", status: "completed" },
  { id: "2", date: "2026-04-03", wasteType: "non-biodegradable", purok: "Purok 1", status: "completed" },
  { id: "3", date: "2026-04-05", wasteType: "recyclables", purok: "Purok 1", status: "completed" },
  { id: "4", date: "2026-04-08", wasteType: "biodegradable", purok: "Purok 1", status: "pending" },
  { id: "5", date: "2026-04-10", wasteType: "non-biodegradable", purok: "Purok 1", status: "pending" },
  { id: "6", date: "2026-04-12", wasteType: "recyclables", purok: "Purok 1", status: "pending" },
  { id: "7", date: "2026-04-15", wasteType: "biodegradable", purok: "Purok 1", status: "pending" },
];

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: "1",
    title: "Pickup Reminder",
    message: "Don't forget to segregate your garbage!",
    pickupTime: "08:00 AM",
    date: "2026-04-16",
    wasteType: "biodegradable",
  },
];

// Map configuration
export const MAP_CONFIG = {
  tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap contributors",
  defaultRegion: {
    latitude: 8.962216,
    longitude: 125.535944,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  },
  zoomLevel: 15,
};

// Mock route with coordinates encircling the center point
// Center: 8.962216, 125.535944 | Radius: ~0.002 degrees (~200m)
export const MOCK_ROUTE: Route = {
  id: "route-1",
  name: "Tuesday Route - Purok 1-3",
  date: "2026-04-15",
  totalStops: 12,
  completedStops: 4,
  stops: [
    // Completed stops - encircling center
    { id: "s1", purok: "Purok 1", address: "123 Centro St", latitude: 8.962216 + 0.0020, longitude: 125.535944, status: "completed", wasteType: "biodegradable" },
    { id: "s2", purok: "Purok 1", address: "125 Centro St", latitude: 8.962216 + 0.0014, longitude: 125.535944 + 0.0014, status: "completed", wasteType: "biodegradable" },
    { id: "s3", purok: "Purok 1", address: "127 Centro St", latitude: 8.962216, longitude: 125.535944 + 0.0020, status: "completed", wasteType: "biodegradable" },
    { id: "s4", purok: "Purok 1", address: "129 Centro St", latitude: 8.962216 - 0.0014, longitude: 125.535944 + 0.0014, status: "completed", wasteType: "biodegradable" },
    // Pending stops - continuing the circle
    { id: "s5", purok: "Purok 2", address: "200 Upper St", latitude: 8.962216 - 0.0020, longitude: 125.535944, status: "pending", wasteType: "non-biodegradable" },
    { id: "s6", purok: "Purok 2", address: "202 Upper St", latitude: 8.962216 - 0.0014, longitude: 125.535944 - 0.0014, status: "pending", wasteType: "non-biodegradable" },
    { id: "s7", purok: "Purok 2", address: "204 Upper St", latitude: 8.962216, longitude: 125.535944 - 0.0020, status: "pending", wasteType: "recyclables" },
    { id: "s8", purok: "Purok 3", address: "300 Lower St", latitude: 8.962216 + 0.0014, longitude: 125.535944 - 0.0014, status: "pending", wasteType: "recyclables" },
    { id: "s9", purok: "Purok 3", address: "302 Lower St", latitude: 8.962216 + 0.0025, longitude: 125.535944 - 0.0010, status: "pending" },
    { id: "s10", purok: "Purok 3", address: "304 Lower St", latitude: 8.962216 + 0.0025, longitude: 125.535944 + 0.0010, status: "pending" },
    { id: "s11", purok: "Purok 3", address: "306 Lower St", latitude: 8.962216 - 0.0025, longitude: 125.535944 - 0.0010, status: "pending" },
    { id: "s12", purok: "Purok 3", address: "308 Lower St", latitude: 8.962216 - 0.0025, longitude: 125.535944 + 0.0010, status: "pending" },
  ],
};

export const OTP_EXPIRATION_SECONDS = 60;

export const DEMO_OTP = "123456";

export const REWARDS: Reward[] = [
  { id: "globe-5", network: "GLOBE", amount: 5, pointsCost: 20 },
  { id: "globe-10", network: "GLOBE", amount: 10, pointsCost: 40 },
  { id: "globe-15", network: "GLOBE", amount: 15, pointsCost: 60 },
  { id: "globe-20", network: "GLOBE", amount: 20, pointsCost: 80 },
  { id: "smart-5", network: "SMART", amount: 5, pointsCost: 20 },
  { id: "smart-10", network: "SMART", amount: 10, pointsCost: 40 },
  { id: "smart-15", network: "SMART", amount: 15, pointsCost: 60 },
  { id: "smart-20", network: "SMART", amount: 20, pointsCost: 80 },
  { id: "tnt-5", network: "TNT", amount: 5, pointsCost: 20 },
  { id: "tnt-10", network: "TNT", amount: 10, pointsCost: 40 },
  { id: "tnt-15", network: "TNT", amount: 15, pointsCost: 60 },
  { id: "tnt-20", network: "TNT", amount: 20, pointsCost: 80 },
];

export const REWARD_NETWORKS = ["All", "GLOBE", "SMART", "TNT"] as const;

export const ANNOUNCEMENT_TYPES: Record<string, { label: string; color: string }> = {
  schedule_change: { label: "Schedule Change", color: "#f59e0b" },
  weather: { label: "Weather Alert", color: "#3b82f6" },
  general: { label: "General", color: "#6b7280" },
  report_cleared: { label: "Report Cleared", color: "#22c55e" },
};

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Your Report Has Been Addressed",
    message: "Illegal dumping at Purok 3 main road has been cleared by barangay enforcement. Thank you for helping keep our community clean!",
    type: "report_cleared",
    createdAt: "2026-05-05T08:00:00Z",
  },
  {
    id: "2",
    title: "No Pickup Tomorrow",
    message: "There will be no garbage collection tomorrow due to the local holiday. Collection will resume on Monday.",
    type: "schedule_change",
    createdAt: "2026-05-04T08:00:00Z",
  },
  {
    id: "3",
    title: "Heavy Rain Warning",
    message: "Due to expected heavy rains, garbage collection may be delayed. Please keep your trash sealed and dry.",
    type: "weather",
    createdAt: "2026-05-03T10:00:00Z",
  },
  {
    id: "4",
    title: "New Schedule Starting",
    message: "Starting next Monday, collection hours will change to 7:00 AM - 12:00 PM.",
    type: "general",
    createdAt: "2026-05-02T09:00:00Z",
  },
];