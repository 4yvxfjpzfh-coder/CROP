import { z } from "zod";

// Business
export const businessCategorySchema = z.enum([
  "restaurante",
  "panaderia",
  "supermercado",
  "cafeteria",
  "otro",
]);
export type BusinessCategory = z.infer<typeof businessCategorySchema>;

// DiscountCode
export const discountTypeSchema = z.enum([
  "PERCENTAGE",
  "FIXED_AMOUNT",
  "FREE_DELIVERY",
]);
export type DiscountType = z.infer<typeof discountTypeSchema>;

// Constantes
export const DEFAULT_MIN_ORDER_CENTS = 0;
