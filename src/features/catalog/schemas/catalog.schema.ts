import { z } from "zod";

import { EProductType } from "@/constants/shop";
import { listQuerySchema } from "@/lib/api/pagination";

const requiredText = z.string().trim().min(1);
const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const productListQuerySchema = listQuerySchema.extend({
  type: z.enum([EProductType.tshirt, EProductType.hoodie]).optional(),
});

export const colorSchema = z.object({
  id: z.uuid(),
  nameFa: requiredText,
  nameEn: requiredText,
  hex: hexColor,
  sortOrder: z.number().int(),
});

export const colorWriteSchema = z.object({
  nameFa: requiredText,
  nameEn: requiredText,
  hex: hexColor,
  sortOrder: z.number().int().optional(),
});

export const colorUpdateSchema = colorWriteSchema.partial();

export const sizeSchema = z.object({
  id: z.uuid(),
  code: requiredText,
  labelFa: requiredText,
  labelEn: requiredText,
  sortOrder: z.number().int(),
});

export const sizeWriteSchema = z.object({
  code: requiredText,
  labelFa: requiredText,
  labelEn: requiredText,
  sortOrder: z.number().int().optional(),
});

export const sizeUpdateSchema = sizeWriteSchema.partial();

export const productImageSchema = z.object({
  id: z.uuid(),
  url: requiredText,
  altFa: z.string(),
  altEn: z.string(),
  sortOrder: z.number().int(),
  colorId: z.uuid().nullable(),
});

export const productImageWriteSchema = z.object({
  url: requiredText,
  altFa: z.string().trim().optional(),
  altEn: z.string().trim().optional(),
  sortOrder: z.number().int().optional(),
  colorId: z.uuid().nullable().optional(),
});

export const productImageUpdateSchema = productImageWriteSchema.partial();

export const embeddedColorSchema = z.object({
  id: z.uuid(),
  nameFa: requiredText,
  nameEn: requiredText,
  hex: hexColor,
});

export const embeddedSizeSchema = z.object({
  id: z.uuid(),
  code: requiredText,
  labelFa: requiredText,
  labelEn: requiredText,
});

export const productVariantSchema = z.object({
  id: z.uuid(),
  sku: requiredText,
  stockQuantity: z.number().int().nonnegative(),
  priceToman: z.number().int().nonnegative().nullable(),
  color: embeddedColorSchema,
  size: embeddedSizeSchema,
});

export const adminVariantSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  colorId: z.uuid(),
  sizeId: z.uuid(),
  sku: requiredText,
  stockQuantity: z.number().int().nonnegative(),
  priceToman: z.number().int().nonnegative().nullable(),
  isActive: z.boolean(),
});

export const variantWriteSchema = z.object({
  colorId: z.uuid(),
  sizeId: z.uuid(),
  sku: requiredText,
  stockQuantity: z.number().int().nonnegative(),
  priceToman: z.number().int().nonnegative().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const variantUpdateSchema = variantWriteSchema.partial();

export const productSchema = z.object({
  id: z.uuid(),
  type: z.enum([EProductType.tshirt, EProductType.hoodie]),
  slug: requiredText,
  titleFa: requiredText,
  titleEn: requiredText,
  descriptionFa: z.string(),
  descriptionEn: z.string(),
  priceToman: z.number().int().nonnegative(),
  compareAtPriceToman: z.number().int().nonnegative().nullable(),
  images: z.array(productImageSchema),
  variants: z.array(productVariantSchema),
});

export const adminProductSchema = productSchema.omit({ images: true, variants: true }).extend({
  isPublished: z.boolean(),
});

export const productWriteSchema = z.object({
  type: z.enum([EProductType.tshirt, EProductType.hoodie]),
  slug: requiredText,
  titleFa: requiredText,
  titleEn: requiredText,
  descriptionFa: z.string().trim().optional(),
  descriptionEn: z.string().trim().optional(),
  priceToman: z.number().int().nonnegative(),
  compareAtPriceToman: z.number().int().nonnegative().nullable().optional(),
  isPublished: z.boolean().optional(),
});

export const productUpdateSchema = productWriteSchema.partial();

export const paginatedProductsSchema = z.object({
  items: z.array(productSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const deletedVariantSchema = z.object({
  id: z.uuid(),
});

export type TColorWrite = z.infer<typeof colorWriteSchema>;
export type TColorUpdate = z.infer<typeof colorUpdateSchema>;
export type TSizeWrite = z.infer<typeof sizeWriteSchema>;
export type TSizeUpdate = z.infer<typeof sizeUpdateSchema>;
export type TProductWrite = z.infer<typeof productWriteSchema>;
export type TProductUpdate = z.infer<typeof productUpdateSchema>;
export type TProductImageWrite = z.infer<typeof productImageWriteSchema>;
export type TProductImageUpdate = z.infer<typeof productImageUpdateSchema>;
export type TVariantWrite = z.infer<typeof variantWriteSchema>;
export type TVariantUpdate = z.infer<typeof variantUpdateSchema>;
export type TProduct = z.infer<typeof productSchema>;
export type TColor = z.infer<typeof colorSchema>;
export type TSize = z.infer<typeof sizeSchema>;
export type TAdminProduct = z.infer<typeof adminProductSchema>;
export type TProductImage = z.infer<typeof productImageSchema>;
export type TAdminVariant = z.infer<typeof adminVariantSchema>;
