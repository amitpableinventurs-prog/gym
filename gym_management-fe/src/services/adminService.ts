import apiClient from "./apiClient";
import {
  Membership,
  MembershipPlan,
  MembershipSummary,
  Payment,
  PaymentMethod,
  Visit,
} from "./membershipService";

interface PersonName {
  _id?: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PageQuery {
  page: number;
  limit: number;
}

export interface AdminOverview {
  metrics: {
    totalUsers: number;
    coaches: number;
    clients: number;
    totalWorkouts: number;
    totalTestimonials: number;
    activeMembers: number;
    pendingRequests: number;
    expiringSoon: number;
    checkInsToday: number;
    insideNow: number;
    revenueThisMonth: number;
  };
  revenueByMonth: Array<{ month: string; total: number }>;
  expiringMemberships: AdminMembership[];
  recentUsers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    isCoach: boolean;
    createdAt?: string;
  }>;
  recentWorkouts: AdminBooking[];
}

export interface AdminMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isCoach: boolean;
  isSuspended?: boolean;
  suspensionReason?: string;
  createdAt?: string;
  membership: Membership | null;
  openVisitId: string | null;
}

export interface AdminMemberProfile {
  user: Omit<AdminMember, "membership" | "openVisitId"> & { target: string; activity: string };
  memberships: MembershipSummary;
  payments: Payment[];
  visits: Visit[];
  sessions: number;
}

export interface AdminMembership extends Membership {
  member: { id: string; firstName: string; lastName: string; email: string } | null;
}

export interface AdminPayment extends Omit<Payment, "userId"> {
  userId: PersonName | null;
}

export interface AdminVisit extends Visit {
  userId: (PersonName & { isCoach: boolean }) | null;
}

export interface AdminBooking {
  _id: string;
  userId: PersonName | null;
  coachId: PersonName | null;
  date: string;
  time: string;
  activity: string;
  status: string;
}

export interface AdminReview {
  coachId: string;
  coachName: string | null;
  firstName: string;
  lastName: string;
  date: string;
  rating: number;
  testimonial: string;
  workoutId: string;
  isCoach: boolean;
}

export interface PaymentDetails {
  amount?: number;
  method: PaymentMethod;
  reference?: string;
  note?: string;
}

export type PlanInput = Omit<MembershipPlan, "_id">;

const get = async <T>(url: string, params?: object): Promise<T> =>
  (await apiClient.get(url, { params })).data;

const post = async <T = unknown>(url: string, body: object = {}): Promise<T> =>
  (await apiClient.post(url, body)).data;

export const getAdminOverview = () => get<AdminOverview>("/admin/overview");

export const getMembers = (query: PageQuery & { search?: string; role?: string; membership?: string }) =>
  get<Paged<AdminMember>>("/admin/members", query);

export const getMemberProfile = (userId: string) =>
  get<AdminMemberProfile>(`/admin/members/${userId}`);

export const setMemberSuspension = async (userId: string, suspended: boolean, reason?: string) =>
  (await apiClient.patch(`/admin/members/${userId}/suspension`, { suspended, reason })).data;

export const getAdminPlans = () => get<MembershipPlan[]>("/admin/plans");

export const createPlan = (plan: PlanInput) => post<MembershipPlan>("/admin/plans", plan);

export const updatePlan = async (planId: string, plan: PlanInput): Promise<MembershipPlan> =>
  (await apiClient.put(`/admin/plans/${planId}`, plan)).data;

export const getMemberships = (query: PageQuery & { status?: string }) =>
  get<Paged<AdminMembership>>("/admin/memberships", query);

export const assignMembership = (userId: string, planId: string, payment: PaymentDetails) =>
  post("/admin/memberships", { userId, planId, ...payment });

export const activateMembership = (membershipId: string, payment: PaymentDetails) =>
  post(`/admin/memberships/${membershipId}/activate`, payment);

export const freezeMembership = (membershipId: string) =>
  post<{ cancelledSessions: number }>(`/admin/memberships/${membershipId}/freeze`);

export const unfreezeMembership = (membershipId: string) =>
  post(`/admin/memberships/${membershipId}/unfreeze`);

export const cancelMembership = (membershipId: string, reason: string) =>
  post<{ cancelledSessions: number }>(`/admin/memberships/${membershipId}/cancel`, { reason });

export const getPayments = (query: PageQuery & { status?: string }) =>
  get<Paged<AdminPayment>>("/admin/payments", query);

export const refundPayment = (paymentId: string, reason: string) =>
  post(`/admin/payments/${paymentId}/refund`, { reason });

export const getAttendance = (query: PageQuery & { date?: string }) =>
  get<Paged<AdminVisit> & { inside: number }>("/admin/attendance", query);

export const checkInMember = (userId: string) => post("/admin/attendance/check-in", { userId });

export const checkOutVisit = (attendanceId: string) =>
  post(`/admin/attendance/${attendanceId}/check-out`);

export const getBookings = (query: PageQuery & { status?: string }) =>
  get<Paged<AdminBooking>>("/admin/bookings", query);

export const cancelBooking = (workoutId: string) => post(`/admin/bookings/${workoutId}/cancel`);

export const getReviews = () => get<{ items: AdminReview[]; total: number }>("/admin/testimonials");

export const deleteReview = async (coachId: string, workoutId: string) =>
  (await apiClient.delete(`/admin/testimonials/${coachId}/${workoutId}`)).data;
