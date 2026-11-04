import { z } from "zod";
import { PAYMENT_METHODS } from "../models/Payment";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const paymentSchema = z.object({
  amount: z.number().int().min(0).optional(),
  method: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(120).optional(),
  note: z.string().trim().max(300).optional(),
});

export const reasonSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});

export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
