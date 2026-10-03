import { z } from "zod";

const requiredText = z.string().trim().min(1);

export const addressSchema = z.object({
  id: z.uuid(),
  receiverName: requiredText,
  mobile: z.string().regex(/^09\d{9}$/),
  province: requiredText,
  city: requiredText,
  postalCode: z.string().regex(/^\d{10}$/),
  addressLine: requiredText,
  isDefault: z.boolean(),
});

export const addressWriteSchema = z.object({
  receiverName: requiredText,
  mobile: z.string().regex(/^09\d{9}$/),
  province: requiredText,
  city: requiredText,
  postalCode: z.string().regex(/^\d{10}$/),
  addressLine: requiredText,
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = addressWriteSchema.partial();

export const addressListSchema = z.object({
  items: z.array(addressSchema),
});

export const deletedAddressSchema = z.object({
  id: z.uuid(),
});

export type TAddress = z.infer<typeof addressSchema>;
export type TAddressWrite = z.infer<typeof addressWriteSchema>;
export type TAddressUpdate = z.infer<typeof addressUpdateSchema>;
