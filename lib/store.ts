import { create } from "zustand";
import type { User, AuthState, Route, CalendarDay, PickupSchedule, Report, ReportStatus } from "./types";
import { MOCK_ROUTE, MOCK_PICKUP_SCHEDULE } from "./constants";

interface AuthStore extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setOtpSentTo: (phone: string | null) => void;
  updateUser: (updates: Partial<User>) => void;
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
  setSelectedDate: (date: Date) => void;
  setMonth: (month: number, year: number) => void;
  generateCalendarDays: () => void;
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
}

const generateCalendarDaysForMonth = (month: number, year: number): CalendarDay[] => {
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
    const schedule = MOCK_PICKUP_SCHEDULE.find(s => s.date === dateStr);
    
    days.push({
      date,
      month,
      year,
      wasteType: schedule?.wasteType,
      isToday: 
        date === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear(),
      isSelected: false,
    });
  }
  
  return days;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  otpSentTo: null,

  login: (user: User) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      otpSentTo: null,
    }),

  setLoading: (loading: boolean) =>
    set({ isLoading: loading }),

  setOtpSentTo: (phone: string | null) =>
    set({ otpSentTo: phone }),

  updateUser: (updates: Partial<User>) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}));

export const useAppStore = create<AppStore>((set, get) => ({
  currentRoute: MOCK_ROUTE,
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

  setSelectedDate: (date: Date) => set({ selectedDate: date }),

  setMonth: (month: number, year: number) => {
    set({ currentMonth: month, currentYear: year });
    get().generateCalendarDays();
  },

  generateCalendarDays: () => {
    const { currentMonth, currentYear } = get();
    const days = generateCalendarDaysForMonth(currentMonth, currentYear);
    set({ calendarDays: days });
  },

  getScheduleForDate: (date: Date): PickupSchedule | undefined => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return MOCK_PICKUP_SCHEDULE.find(s => s.date === dateStr);
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
}));

useAppStore.getState().generateCalendarDays();