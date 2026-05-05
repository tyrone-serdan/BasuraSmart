import { create } from "zustand";
import { supabase } from "./supabase";
import { api } from "./api";
import type { User, AuthState, Route, CalendarDay, PickupSchedule, Report, ReportStatus, PointsTransaction, Reward, Announcement, CollectorIssue } from "./types";

interface AuthStore extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setOtpSentTo: (phone: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
  addPoints: (points: number) => void;
  deductPoints: (points: number) => void;
  refreshUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  setupAuthListener: () => () => void;
}

interface AppStore {
  currentRoute: Route | null;
  setCurrentRoute: (route: Route | null) => void;
  completeStop: (stopId: string) => void;
  completePickup: () => void;

  selectedDate: Date;
  currentMonth: number;
  currentYear: number;
  calendarDays: CalendarDay[];
  schedules: PickupSchedule[];
  setSelectedDate: (date: Date) => void;
  setMonth: (month: number, year: number) => void;
  generateCalendarDays: (schedules?: PickupSchedule[]) => void;
  getScheduleForDate: (date: Date) => PickupSchedule | undefined;

  isMenuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;

  currentGuideIndex: number;
  setGuideIndex: (index: number) => void;

  reports: Report[];
  addReport: (report: Report) => void;
  updateReportStatus: (reportId: string, status: ReportStatus) => void;
  setReports: (reports: Report[]) => void;

  collectorIssues: CollectorIssue[];
  addCollectorIssue: (issue: CollectorIssue) => void;

  latestAnnouncement: Announcement | null;
  setLatestAnnouncement: (announcement: Announcement | null) => void;
  dismissAnnouncement: () => void;

  loadAnnouncements: () => Promise<void>;
  loadSchedule: (purok?: string) => Promise<void>;
  loadReports: (userId?: string, isAdmin?: boolean) => Promise<void>;
}

const generateCalendarDaysForMonth = (month: number, year: number, schedules: PickupSchedule[] = []): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  
  const startDayOfWeek = firstDay.getDay();
  
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({
      date: 0,
      month,
      year,
      isToday: false,
      isSelected: false,
    });
  }
  
  for (let date = 1; date <= lastDay.getDate(); date++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const schedule = schedules.find(s => s.date === dateStr);
    
    days.push({
      date,
      month,
      year,
      wasteType: schedule?.wasteType as CalendarDay['wasteType'],
      isToday: 
        date === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear(),
      isSelected: false,
    });
  }
  
  return days;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  otpSentTo: null,

  login: (user: User) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: async () => {
    console.log('[Store] logout: Starting...');
    await api.logoutUser();
    console.log('[Store] logout: Cleared state');
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      otpSentTo: null,
    });
    console.log('[Store] logout: Complete');
  },

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setOtpSentTo: (phone: string | null) =>
    set({ otpSentTo: phone }),

  updateUser: (updates: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  addPoints: (points: number) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          points: state.user.points + points,
        },
      };
    }),

  deductPoints: (points: number) =>
    set((state) => {
      if (!state.user) return state;
      return {
        user: {
          ...state.user,
          points: Math.max(0, state.user.points - points),
        },
      };
    }),

  refreshUser: async () => {
    const { user } = get();
    if (user?.id) {
      const response = await api.getUserDetails(user.id);
      if (response.success && response.data) {
        set({ user: response.data });
      }
    }
  },

  initializeAuth: async () => {
    console.log('[Store] initializeAuth: Starting...');
    
    const { user: existingUser, isAuthenticated: wasAuthenticated } = get();
    if (existingUser && wasAuthenticated) {
      console.log('[Store] initializeAuth: User already logged in, skipping...');
      set({ isLoading: false });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[Store] initializeAuth: Session check:', session ? 'Session exists' : 'No session');
      
      if (session?.user) {
        console.log('[Store] initializeAuth: Found user in session, fetching profile...');
        const response = await api.getUserDetails(session.user.id);
        console.log('[Store] initializeAuth: Profile response:', response.success ? 'Success' : 'Failed');
        
        if (response.success && response.data) {
          console.log('[Store] initializeAuth: Setting user and authenticated');
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.log('[Store] initializeAuth: Failed to get profile');
          set({ isLoading: false });
        }
      } else {
        console.log('[Store] initializeAuth: No session, not authenticated');
        set({ isLoading: false });
      }
    } catch (error) {
      console.log('[Store] initializeAuth: Error:', error);
      set({ isLoading: false });
    }
  },
  setupAuthListener: () => {
    console.log('[Store] setupAuthListener: Setting up...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Store] Auth event:', event);
      
      if (event === 'SIGNED_OUT') {
        console.log('[Store] User signed out, clearing state');
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('[Store] Token refreshed, syncing profile...');
        const response = await api.getUserDetails(session.user.id);
        if (response.success && response.data) {
          set({
            user: response.data,
            isAuthenticated: true,
          });
        }
      }
    });
    
    return () => {
      console.log('[Store] cleanupAuthListener: Unsubscribing...');
      subscription.unsubscribe();
    };
  },
}));

export const useAppStore = create<AppStore>((set, get) => ({
  currentRoute: null,
  setCurrentRoute: (route: Route | null) => set({ currentRoute: route }),
  
  completeStop: (stopId: string) =>
    set((state) => {
      if (!state.currentRoute) return state;
      const updatedStops = state.currentRoute.stops.map((stop) =>
        stop.id === stopId ? { ...stop, status: "completed" as const } : stop
      );
      const completedStops = updatedStops.filter(s => s.status === "completed").length;
      return {
        currentRoute: {
          ...state.currentRoute,
          stops: updatedStops,
          completedStops,
        },
      };
    }),

  completePickup: () =>
    set((state) => {
      if (!state.currentRoute) return state;
      const updatedStops = state.currentRoute.stops.map((stop) => ({
        ...stop,
        status: "completed" as const,
      }));
      return {
        currentRoute: {
          ...state.currentRoute,
          stops: updatedStops,
          completedStops: updatedStops.length,
        },
      };
    }),

  selectedDate: new Date(),
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  calendarDays: [],
  schedules: [],

  setSelectedDate: (date: Date) => set({ selectedDate: date }),

  setMonth: (month: number, year: number) => {
    set({ currentMonth: month, currentYear: year });
    get().generateCalendarDays();
  },

  generateCalendarDays: (schedules: PickupSchedule[] = []) => {
    const { currentMonth, currentYear } = get();
    const days = generateCalendarDaysForMonth(currentMonth, currentYear, schedules);
    set({ calendarDays: days, schedules });
  },

  getScheduleForDate: (date: Date): PickupSchedule | undefined => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const { schedules } = get();
    return schedules.find(s => s.date === dateStr);
  },

  isMenuOpen: false,
  setMenuOpen: (open: boolean) => set({ isMenuOpen: open }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

  currentGuideIndex: 0,
  setGuideIndex: (index: number) => set({ currentGuideIndex: index }),

  reports: [],
  addReport: (report: Report) =>
    set((state) => ({
      reports: [report, ...state.reports],
    })),
  updateReportStatus: (reportId: string, status: ReportStatus) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === reportId ? { ...r, status } : r
      ),
    })),
  setReports: (reports: Report[]) => set({ reports }),

  collectorIssues: [],
  addCollectorIssue: (issue: CollectorIssue) =>
    set((state) => ({
      collectorIssues: [issue, ...state.collectorIssues],
    })),

  latestAnnouncement: null,
  setLatestAnnouncement: (announcement: Announcement | null) => set({ latestAnnouncement: announcement }),
  dismissAnnouncement: () => set({ latestAnnouncement: null }),

  loadAnnouncements: async () => {
    console.log('[Store] loadAnnouncements: Fetching...');
    const response = await api.getAnnouncements();
    console.log('[Store] loadAnnouncements: Result:', response.success ? `Found ${response.data?.length} announcements` : response.error);
    if (response.success && response.data && response.data.length > 0) {
      set({ latestAnnouncement: response.data[0] });
    }
  },

  loadSchedule: async (purok?: string) => {
    console.log('[Store] loadSchedule: Fetching for purok:', purok || 'all');
    const response = await api.getPickupSchedule(purok);
    console.log('[Store] loadSchedule: Result:', response.success ? `Found ${response.data?.length} schedules` : response.error);
    if (response.success && response.data) {
      get().generateCalendarDays(response.data);
    }
  },

  loadReports: async (userId?: string, isAdmin?: boolean) => {
    const response = isAdmin 
      ? await api.getAllReports()
      : userId 
        ? await api.getUserReports(userId)
        : await api.getAllReports();
    
    if (response.success && response.data) {
      set({ reports: response.data });
    }
  },
}));

useAppStore.getState().generateCalendarDays();