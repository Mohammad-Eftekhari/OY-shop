import { z } from "zod";

import { EProductType } from "@/constants/shop";

const requiredText = z.string().trim().min(1);

export const cartItemWriteSchema = z.object({
  variantId: z.uuid(),
  quantity: z.number().int().min(0),
});

export const cartLineSchema = z.object({
  variantId: z.uuid(),
  quantity: z.number().int().positive(),
  unitPriceToman: z.number().int().nonnegative(),
  lineTotalToman: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative(),
  sku: requiredText,
  productSlug: requiredText,
  productTitleFa: requiredText,
  productTitleEn: requiredText,
  productType: z.enum([EProductType.tshirt, EProductType.hoodie]),
  colorNameFa: requiredText,
  colorNameEn: requiredText,
  colorHex: z.string(),
  sizeCode: requiredText,
  sizeLabelFa: requiredText,
  sizeLabelEn: requiredText,
});

export const cartSchema = z.object({
  items: z.array(cartLineSchema),
});

export type TCartItemWrite = z.infer<typeof cartItemWriteSchema>;
export type TCart = z.infer<typeof cartSchema>;
