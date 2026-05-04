export type UserType = "resident" | "collector" | "admin";

export type WasteType = "biodegradable" | "non-biodegradable" | "recyclables";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  purok: string;
  userType: UserType;
  avatar?: string;
  points: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  otpSentTo: string | null;
}

export interface CalendarDay {
  date: number;
  month: number;
  year: number;
  wasteType?: WasteType;
  isToday: boolean;
  isSelected: boolean;
}

export interface PickupSchedule {
  id: string;
  date: string;
  wasteType: WasteType;
  purok: string;
  status: "pending" | "completed" | "skipped";
}

export interface RouteStop {
  id: string;
  purok: string;
  address: string;
  latitude: number;
  longitude: number;
  status: "pending" | "completed";
  wasteType?: WasteType;
}

export interface Route {
  id: string;
  name: string;
  date: string;
  stops: RouteStop[];
  totalStops: number;
  completedStops: number;
}

export interface Reminder {
  id: string;
  title: string;
  message: string;
  pickupTime: string;
  date: string;
  wasteType: WasteType;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface OtpVerification {
  phone: string;
  code: string;
}

export interface UserDetails {
  purok: string;
  userType: UserType;
}

export type ReportStatus = "pending" | "investigating" | "resolved";

export interface Report {
  id: string;
  userId: string;
  purok: string;
  description: string;
  photoUri?: string;
  latitude?: number;
  longitude?: number;
  status: ReportStatus;
  createdAt: string;
}

export interface CreateReportInput {
  purok: string;
  description: string;
  photoUri?: string;
  latitude?: number;
  longitude?: number;
}

export type RewardNetwork = "GLOBE" | "SMART" | "TNT";

export interface Reward {
  id: string;
  network: RewardNetwork;
  amount: number;
  pointsCost: number;
}

export interface PointsTransaction {
  id: string;
  amount: number;
  type: "earned" | "redeemed";
  description: string;
  date: string;
  rewardId?: string;
}

export interface UserPoints {
  userId: string;
  points: number;
  pointsHistory: PointsTransaction[];
}

export type AnnouncementType = "schedule_change" | "weather" | "general" | "report_cleared";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  createdAt: string;
}

export type CollectorIssueType = "road_blockage" | "no_access" | "missed_stop" | "unsafe_area" | "other";

export interface CollectorIssue {
  id: string;
  purok: string;
  issueType: CollectorIssueType;
  description: string;
  photoUri?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}