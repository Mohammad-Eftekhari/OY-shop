import { z } from "zod";

const requiredText = z.string().trim().min(1);

export const shippingMethodSchema = z.object({
  id: z.uuid(),
  nameFa: requiredText,
  nameEn: requiredText,
  priceToman: z.number().int().nonnegative(),
  estimatedDaysMin: z.number().int().nonnegative(),
  estimatedDaysMax: z.number().int().nonnegative(),
  sortOrder: z.number().int(),
});

export const adminShippingMethodSchema = shippingMethodSchema.extend({
  isActive: z.boolean(),
});

export const shippingMethodWriteSchema = z.object({
  nameFa: requiredText,
  nameEn: requiredText,
  priceToman: z.number().int().nonnegative(),
  estimatedDaysMin: z.number().int().nonnegative(),
  estimatedDaysMax: z.number().int().nonnegative(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const shippingMethodUpdateSchema = shippingMethodWriteSchema.partial();

export const shippingMethodListSchema = z.object({
  items: z.array(shippingMethodSchema),
});

export type TShippingMethod = z.infer<typeof shippingMethodSchema>;
export type TAdminShippingMethod = z.infer<typeof adminShippingMethodSchema>;
export type TShippingMethodWrite = z.infer<typeof shippingMethodWriteSchema>;
export type TShippingMethodUpdate = z.infer<typeof shippingMethodUpdateSchema>;
