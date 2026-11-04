import apiClient from "./apiClient";

export interface MembershipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  sessionLimit: number | null;
  features: string[];
  isActive: boolean;
}

export type MembershipStatus =
  | "PENDING"
  | "ACTIVE"
  | "UPCOMING"
  | "FROZEN"
  | "EXPIRED"
  | "CANCELLED";

export interface Membership {
  id: string;
  planId: string;
  planName: string;
  price: number;
  durationDays: number;
  status: MembershipStatus;
  startDate: string | null;
  endDate: string | null;
  frozenAt: string | null;
  frozenDays: number;
  sessionLimit: number | null;
  sessionsUsed: number;
  sessionsRemaining: number | null;
  daysRemaining: number | null;
  cancelReason: string | null;
  createdAt: string;
}

export interface MembershipSummary {
  current: Membership | null;
  pending: Membership | null;
  upcoming: Membership[];
  history: Membership[];
}

export interface Payment {
  _id: string;
  invoiceNumber: string;
  planName: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  status: "PAID" | "REFUNDED";
  paidAt: string;
  refundReason?: string;
}

export const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "BANK_TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Visit {
  _id: string;
  checkInAt: string;
  checkOutAt?: string;
  isOpen: boolean;
  autoClosed: boolean;
}

export interface MemberAttendance {
  visits: Visit[];
  visitsThisMonth: number;
  totalVisits: number;
}

export const getPlans = async (): Promise<MembershipPlan[]> =>
  (await apiClient.get("/memberships/plans")).data;

export const getMyMembership = async (): Promise<MembershipSummary> =>
  (await apiClient.get("/memberships/me")).data;

export const getMyPayments = async (): Promise<Payment[]> =>
  (await apiClient.get("/memberships/me/payments")).data;

export const getMyAttendance = async (): Promise<MemberAttendance> =>
  (await apiClient.get("/memberships/me/attendance")).data;

export const requestPlan = async (planId: string): Promise<Membership> =>
  (await apiClient.post("/memberships/request", { planId })).data;

export const withdrawRequest = async (membershipId: string): Promise<Membership> =>
  (await apiClient.post(`/memberships/${membershipId}/withdraw`)).data;
