import { supabase } from './supabase';
import type { User, ApiResponse, LoginCredentials, RegisterData, UserDetails, CreateReportInput, Report, ReportStatus, PickupSchedule, Route, Announcement, Reward, PointsTransaction, CollectorIssue } from './types';

function mapProfileToUser(profile: Record<string, unknown>): User {
  return {
    id: profile.id as string,
    name: profile.name as string,
    email: profile.email as string,
    phone: profile.phone as string,
    purok: profile.purok as string,
    userType: profile.user_type as User['userType'],
    avatar: profile.avatar_url as string | undefined,
    points: profile.points as number,
  };
}

export async function registerUser(data: RegisterData): Promise<ApiResponse<{ user: User; session: any }>> {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        phone: data.phone
      }
    }
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      purok: '',
      user_type: 'resident',
      points: 0
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }
  }

  return {
    success: true,
    data: { user: authData.user!, session: authData.session } as unknown as { user: User; session: unknown },
    message: 'Registration successful'
  };
}

export async function loginUser(credentials: LoginCredentials): Promise<ApiResponse<User>> {
  console.log('[API] loginUser: Starting login for', credentials.identifier);
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: credentials.identifier,
    password: credentials.password
  });

  if (authError) {
    console.log('[API] loginUser: Auth error', authError.message);
    return { success: false, error: 'Invalid email or password' };
  }

  if (!authData.user) {
    console.log('[API] loginUser: No user data returned');
    return { success: false, error: 'User not found' };
  }

  console.log('[API] loginUser: Auth success, fetching profile for', authData.user.id);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) {
    console.log('[API] loginUser: Profile fetch error', profileError.message);
    return { success: false, error: 'Failed to fetch profile' };
  }

  console.log('[API] loginUser: Success! Profile:', profile);
  return {
    success: true,
    data: mapProfileToUser(profile),
    message: 'Login successful'
  };
}

export async function logoutUser(): Promise<ApiResponse<boolean>> {
  console.log('[API] logoutUser: Starting logout...');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.log('[API] logoutUser: Error:', error.message);
    return { success: false, error: error.message };
  }
  console.log('[API] logoutUser: Success');
  return { success: true, data: true };
}

export async function saveUserDetails(userId: string, details: UserDetails): Promise<ApiResponse<User>> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      purok: details.purok,
      user_type: details.userType,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: mapProfileToUser(data), message: 'User details saved successfully' };
}

export async function getUserDetails(userId: string): Promise<ApiResponse<User>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: mapProfileToUser(data) };
}

export async function getCurrentUser(): Promise<ApiResponse<User>> {
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    return { success: false, error: 'No authenticated user' };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: mapProfileToUser(profile) };
}

export async function getPickupSchedule(userPurok?: string): Promise<ApiResponse<PickupSchedule[]>> {
  console.log('[API] getPickupSchedule: Fetching for purok:', userPurok || 'all');
  let query = supabase
    .from('pickup_schedules')
    .select('*')
    .order('date', { ascending: true });

  if (userPurok) {
    query = query.eq('purok', userPurok);
  }

  const { data, error } = await query;

  if (error) {
    console.log('[API] getPickupSchedule: Error:', error.message);
    return { success: false, error: error.message };
  }

  console.log('[API] getPickupSchedule: Success, found', data?.length || 0, 'schedules');
  return { success: true, data: data as PickupSchedule[] };
}

export async function getScheduleForDate(date: string, purok?: string): Promise<ApiResponse<PickupSchedule | null>> {
  let query = supabase
    .from('pickup_schedules')
    .select('*')
    .eq('date', date);

  if (purok) {
    query = query.eq('purok', purok);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { success: true, data: null };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data: data as PickupSchedule };
}

export async function completePickup(scheduleId: string, collectorId: string): Promise<ApiResponse<boolean>> {
  const { data, error } = await supabase
    .from('pickup_schedules')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', scheduleId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const profile = await getUserDetails(collectorId);
  if (profile.success && profile.data) {
    const newPoints = profile.data.points + 10;
    await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', collectorId);

    await supabase.from('points_transactions').insert({
      user_id: collectorId,
      amount: 10,
      type: 'earned',
      description: 'Completed pickup',
      schedule_id: scheduleId
    });
  }

  return { success: true, data: true, message: 'Pickup completed successfully' };
}

export async function createReport(input: CreateReportInput, userId: string): Promise<ApiResponse<Report>> {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      user_id: userId,
      purok: input.purok,
      description: input.description,
      photo_url: input.photoUri || null,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Report, message: 'Report submitted successfully' };
}

export async function getUserReports(userId: string): Promise<ApiResponse<Report[]>> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Report[] };
}

export async function getAllReports(): Promise<ApiResponse<Report[]>> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Report[] };
}

export async function updateReportStatus(reportId: string, status: ReportStatus): Promise<ApiResponse<Report>> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('reports')
    .update({
      status,
      resolved_by: user?.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Report, message: 'Report status updated' };
}

export async function getAnnouncements(): Promise<ApiResponse<Announcement[]>> {
  console.log('[API] getAnnouncements: Fetching...');
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.log('[API] getAnnouncements: Error:', error.message);
    return { success: false, error: error.message };
  }

  console.log('[API] getAnnouncements: Success, found', data?.length || 0, 'announcements');
  return { success: true, data: data as Announcement[] };
}

export async function getRewards(): Promise<ApiResponse<Reward[]>> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_cost', { ascending: true });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Reward[] };
}

export async function getPointsHistory(userId: string): Promise<ApiResponse<PointsTransaction[]>> {
  const { data, error } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as PointsTransaction[] };
}

export async function redeemReward(userId: string, reward: Reward): Promise<ApiResponse<boolean>> {
  const profile = await getUserDetails(userId);

  if (!profile.success || !profile.data) {
    return { success: false, error: 'User not found' };
  }

  if (profile.data.points < reward.pointsCost) {
    return { success: false, error: 'Insufficient points' };
  }

  const newPoints = profile.data.points - reward.pointsCost;

  await supabase
    .from('profiles')
    .update({ points: newPoints })
    .eq('id', userId);

  await supabase.from('points_transactions').insert({
    user_id: userId,
    amount: -reward.pointsCost,
    type: 'redeemed',
    description: `Redeemed ${reward.network} ${reward.amount}`,
    reward_id: reward.id
  });

  await supabase.from('user_rewards').insert({
    user_id: userId,
    reward_id: reward.id,
    points_spent: reward.pointsCost,
    status: 'pending'
  });

  return { success: true, data: true, message: 'Reward redeemed successfully' };
}

export async function getRoutes(collectorId?: string): Promise<ApiResponse<Route[]>> {
  let query = supabase
    .from('routes')
    .select('*')
    .order('date', { ascending: false });

  if (collectorId) {
    query = query.eq('collector_id', collectorId);
  }

  const { data, error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  const routes = data || [];

  const routesWithStops: Route[] = await Promise.all(
    routes.map(async (route) => {
      const { data: stops } = await supabase
        .from('route_stops')
        .select('*')
        .eq('route_id', route.id)
        .order('created_at', { ascending: true });

      return {
        id: route.id,
        name: route.name,
        date: route.date,
        totalStops: route.total_stops,
        completedStops: route.completed_stops,
        stops: (stops || []).map(stop => ({
          id: stop.id,
          purok: stop.purok,
          address: stop.address,
          latitude: stop.latitude,
          longitude: stop.longitude,
          status: stop.status,
          wasteType: stop.waste_type
        }))
      };
    })
  );

  return { success: true, data: routesWithStops };
}

export async function getRouteById(routeId: string): Promise<ApiResponse<Route | null>> {
  const { data: route, error } = await supabase
    .from('routes')
    .select('*')
    .eq('id', routeId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: stops } = await supabase
    .from('route_stops')
    .select('*')
    .eq('route_id', routeId)
    .order('created_at', { ascending: true });

  return {
    success: true,
    data: {
      id: route.id,
      name: route.name,
      date: route.date,
      totalStops: route.total_stops,
      completedStops: route.completed_stops,
      stops: (stops || []).map(stop => ({
        id: stop.id,
        purok: stop.purok,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        status: stop.status,
        wasteType: stop.waste_type
      }))
    } as Route
  };
}

export async function updateRouteStop(stopId: string, status: string): Promise<ApiResponse<boolean>> {
  const { error } = await supabase
    .from('route_stops')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null
    })
    .eq('id', stopId);

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: stop } = await supabase
    .from('route_stops')
    .select('route_id')
    .eq('id', stopId)
    .single();

  if (stop) {
    const { data: stops } = await supabase
      .from('route_stops')
      .select('status')
      .eq('route_id', stop.route_id);

    const completedCount = stops?.filter(s => s.status === 'completed').length || 0;

    await supabase
      .from('routes')
      .update({
        completed_stops: completedCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', stop.route_id);
  }

  return { success: true, data: true };
}

export async function createCollectorIssue(collectorId: string, issue: Omit<CollectorIssue, 'id' | 'createdAt'>): Promise<ApiResponse<CollectorIssue>> {
  const { data, error } = await supabase
    .from('collector_issues')
    .insert({
      collector_id: collectorId,
      purok: issue.purok,
      issue_type: issue.issueType,
      description: issue.description,
      photo_url: issue.photoUri || null,
      latitude: issue.latitude || null,
      longitude: issue.longitude || null,
      route_id: issue.routeId || null,
      status: 'open'
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as CollectorIssue };
}

const otpCodes = new Map<string, { code: string; expiresAt: number }>();

export async function sendEmailOtp(email: string): Promise<ApiResponse<{ expiresIn: number }>> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpCodes.set(email, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  console.log('[API] Email OTP for', email, ':', code);
  return { success: true, data: { expiresIn: 300 }, message: 'OTP sent to email' };
}

export async function verifyEmailOtp(email: string, code: string): Promise<ApiResponse<boolean>> {
  const stored = otpCodes.get(email);
  if (!stored) {
    return { success: false, error: 'No OTP sent to this email' };
  }
  if (Date.now() > stored.expiresAt) {
    otpCodes.delete(email);
    return { success: false, error: 'OTP expired' };
  }
  if (stored.code !== code) {
    return { success: false, error: 'Invalid OTP code' };
  }
  otpCodes.delete(email);
  return { success: true, data: true, message: 'OTP verified' };
}

export async function getCollectorIssues(collectorId: string): Promise<ApiResponse<CollectorIssue[]>> {
  const { data, error } = await supabase
    .from('collector_issues')
    .select('*')
    .eq('collector_id', collectorId)
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as CollectorIssue[] };
}

export const api = {
  registerUser,
  loginUser,
  logoutUser,
  saveUserDetails,
  getUserDetails,
  getCurrentUser,
  getPickupSchedule,
  getScheduleForDate,
  completePickup,
  createReport,
  getUserReports,
  getAllReports,
  updateReportStatus,
  getAnnouncements,
  getRewards,
  getPointsHistory,
  redeemReward,
  getRoutes,
  getRouteById,
  updateRouteStop,
  createCollectorIssue,
  getCollectorIssues,
  sendEmailOtp,
  verifyEmailOtp
};

export default api;