export const EProductType = {
  tshirt: "tshirt",
  hoodie: "hoodie",
} as const;

export type TProductType = (typeof EProductType)[keyof typeof EProductType];

export const PRODUCT_TYPES = [EProductType.tshirt, EProductType.hoodie] as const;

export const EOrderStatus = {
  pendingPayment: "pending_payment",
  paid: "paid",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
  paymentFailed: "payment_failed",
} as const;

export type TOrderStatus = (typeof EOrderStatus)[keyof typeof EOrderStatus];

export const ORDER_STATUSES = [
  EOrderStatus.pendingPayment,
  EOrderStatus.paid,
  EOrderStatus.processing,
  EOrderStatus.shipped,
  EOrderStatus.delivered,
  EOrderStatus.cancelled,
  EOrderStatus.paymentFailed,
] as const;

export const EPaymentStatus = {
  pending: "pending",
  succeeded: "succeeded",
  failed: "failed",
} as const;

export type TPaymentStatus = (typeof EPaymentStatus)[keyof typeof EPaymentStatus];

export const PAYMENT_STATUSES = [
  EPaymentStatus.pending,
  EPaymentStatus.succeeded,
  EPaymentStatus.failed,
] as const;

export const EPaymentProvider = {
  unassigned: "unassigned",
} as const;

export const PAYMENT_WINDOW_MINUTES = 30;
