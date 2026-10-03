import { z } from "zod";

import { EOrderStatus, EPaymentStatus, EProductType } from "@/constants/shop";
import { listQuerySchema } from "@/lib/api/pagination";

const requiredText = z.string().trim().min(1);

export const orderListQuerySchema = listQuerySchema;

export const placeOrderSchema = z.object({
  addressId: z.uuid(),
  shippingMethodId: z.uuid(),
});

export const orderItemSchema = z.object({
  id: z.uuid(),
  variantId: z.uuid(),
  productTitleFa: requiredText,
  productTitleEn: requiredText,
  productType: z.enum([EProductType.tshirt, EProductType.hoodie]),
  colorNameFa: requiredText,
  colorNameEn: requiredText,
  colorHex: z.string(),
  sizeCode: requiredText,
  sku: requiredText,
  unitPriceToman: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotalToman: z.number().int().nonnegative(),
});

export const paymentSchema = z.object({
  id: z.uuid(),
  status: z.enum([EPaymentStatus.pending, EPaymentStatus.succeeded, EPaymentStatus.failed]),
  amountToman: z.number().int().nonnegative(),
  provider: requiredText,
  paidAt: z.string().nullable(),
});

export const orderSchema = z.object({
  orderNumber: requiredText,
  status: z.enum([
    EOrderStatus.pendingPayment,
    EOrderStatus.paid,
    EOrderStatus.processing,
    EOrderStatus.shipped,
    EOrderStatus.delivered,
    EOrderStatus.cancelled,
    EOrderStatus.paymentFailed,
  ]),
  subtotalToman: z.number().int().nonnegative(),
  shippingToman: z.number().int().nonnegative(),
  discountToman: z.number().int().nonnegative(),
  totalToman: z.number().int().nonnegative(),
  shippingNameFa: requiredText,
  shippingNameEn: requiredText,
  receiverName: requiredText,
  mobile: z.string(),
  province: requiredText,
  city: requiredText,
  postalCode: z.string(),
  addressLine: requiredText,
  paymentExpiresAt: z.string(),
  trackingCode: z.string().nullable(),
  paidAt: z.string().nullable(),
  shippedAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  createdAt: z.string(),
  items: z.array(orderItemSchema),
  payments: z.array(paymentSchema),
});

export const paginatedOrdersSchema = z.object({
  items: z.array(orderSchema),
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
});

export const fulfillmentSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal(EOrderStatus.processing) }),
  z.object({
    status: z.literal(EOrderStatus.shipped),
    trackingCode: requiredText,
  }),
  z.object({ status: z.literal(EOrderStatus.delivered) }),
  z.object({ status: z.literal(EOrderStatus.cancelled) }),
]);

export const paymentResultSchema = z.object({
  status: z.enum([EPaymentStatus.succeeded, EPaymentStatus.failed]),
});

export type TPlaceOrder = z.infer<typeof placeOrderSchema>;
export type TOrder = z.infer<typeof orderSchema>;
export type TFulfillment = z.infer<typeof fulfillmentSchema>;
export type TPaymentResult = z.infer<typeof paymentResultSchema>;
