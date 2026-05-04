import type { Route, Reminder, PickupSchedule, WasteType } from "./types";

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