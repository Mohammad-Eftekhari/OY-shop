import "server-only";

import { EOrderStatus, EPaymentStatus, PAYMENT_WINDOW_MINUTES } from "@/constants/shop";
import { db } from "@/db";
import type { TOrder, TFulfillment, TPaymentResult } from "@/features/order/schemas/order.schema";
import { AppError } from "@/lib/api/errors";
import type { TListQuery } from "@/lib/api/pagination";
import { findAddressForUser } from "@/server/repositories/address/address-repository";
import {
  clearCart,
  countOrdersForUser,
  decrementStock,
  findOrderForUser,
  findOrderWithDetails,
  insertOrder,
  insertOrderItems,
  insertPendingPayment,
  listOrderItems,
  listOrdersForUser,
  lockCartLines,
  lockOrder,
  lockPendingPayment,
  restoreStock,
  saveOrderStatus,
  savePaymentStatus,
} from "@/server/repositories/order/order-repository";
import { findShippingMethodById } from "@/server/repositories/shipping/shipping-repository";

const STOCK_HOLDING_STATUSES = new Set<string>([
  EOrderStatus.pendingPayment,
  EOrderStatus.paid,
  EOrderStatus.processing,
]);

const FULFILLMENT_TRANSITIONS: Record<string, readonly string[]> = {
  [EOrderStatus.pendingPayment]: [EOrderStatus.cancelled],
  [EOrderStatus.paid]: [EOrderStatus.processing, EOrderStatus.cancelled],
  [EOrderStatus.processing]: [EOrderStatus.shipped, EOrderStatus.cancelled],
  [EOrderStatus.shipped]: [EOrderStatus.delivered],
};

type TOrderRow = NonNullable<Awaited<ReturnType<typeof findOrderForUser>>>;

function iso(value: Date | null) {
  return value ? value.toISOString() : null;
}

function toOrder(row: TOrderRow): TOrder {
  return {
    orderNumber: row.orderNumber,
    status: row.status as TOrder["status"],
    subtotalToman: row.subtotalToman,
    shippingToman: row.shippingToman,
    discountToman: row.discountToman,
    totalToman: row.totalToman,
    shippingNameFa: row.shippingNameFa,
    shippingNameEn: row.shippingNameEn,
    receiverName: row.receiverName,
    mobile: row.mobile,
    province: row.province,
    city: row.city,
    postalCode: row.postalCode,
    addressLine: row.addressLine,
    paymentExpiresAt: row.paymentExpiresAt.toISOString(),
    trackingCode: row.trackingCode,
    paidAt: iso(row.paidAt),
    shippedAt: iso(row.shippedAt),
    deliveredAt: iso(row.deliveredAt),
    cancelledAt: iso(row.cancelledAt),
    createdAt: row.createdAt.toISOString(),
    items: row.items.map((item) => ({
      id: item.id,
      variantId: item.variantId,
      productTitleFa: item.productTitleFa,
      productTitleEn: item.productTitleEn,
      productType: item.productType as TOrder["items"][number]["productType"],
      colorNameFa: item.colorNameFa,
      colorNameEn: item.colorNameEn,
      colorHex: item.colorHex,
      sizeCode: item.sizeCode,
      sku: item.sku,
      unitPriceToman: item.unitPriceToman,
      quantity: item.quantity,
      lineTotalToman: item.lineTotalToman,
    })),
    payments: row.payments.map((attempt) => ({
      id: attempt.id,
      status: attempt.status as TOrder["payments"][number]["status"],
      amountToman: attempt.amountToman,
      provider: attempt.provider,
      paidAt: iso(attempt.paidAt),
    })),
  };
}

async function requireOrder(orderNumber: string) {
  const row = await findOrderWithDetails(db, orderNumber);

  if (!row) {
    throw new AppError("NOT_FOUND", "Order was not found");
  }

  return toOrder(row);
}

export async function placeOrder(
  userId: string,
  input: { addressId: string; shippingMethodId: string },
): Promise<TOrder> {
  const orderNumber = await db.transaction(async (tx) => {
    const lines = await lockCartLines(tx, userId);

    if (lines.length === 0) {
      throw new AppError("BUSINESS_RULE", "The cart is empty");
    }

    const unavailable = lines.some(
      (line) => !line.isActive || !line.isPublished || line.quantity > line.stockQuantity,
    );

    if (unavailable) {
      throw new AppError("BUSINESS_RULE", "A cart item is no longer available");
    }

    const savedAddress = await findAddressForUser(tx, userId, input.addressId);

    if (!savedAddress) {
      throw new AppError("NOT_FOUND", "Address was not found");
    }

    const method = await findShippingMethodById(tx, input.shippingMethodId);

    if (!method || !method.isActive) {
      throw new AppError("NOT_FOUND", "Shipping method was not found");
    }

    const priced = lines.map((line) => {
      const unitPriceToman = line.variantPriceToman ?? line.productPriceToman;
      return {
        ...line,
        unitPriceToman,
        lineTotalToman: unitPriceToman * line.quantity,
      };
    });
    const subtotalToman = priced.reduce((sum, line) => sum + line.lineTotalToman, 0);
    const shippingToman = method.priceToman;
    const totalToman = subtotalToman + shippingToman;
    const paymentExpiresAt = new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000);

    const order = await insertOrder(tx, {
      userId,
      subtotalToman,
      shippingToman,
      totalToman,
      shippingMethodId: method.id,
      shippingNameFa: method.nameFa,
      shippingNameEn: method.nameEn,
      addressId: savedAddress.id,
      receiverName: savedAddress.receiverName,
      mobile: savedAddress.mobile,
      province: savedAddress.province,
      city: savedAddress.city,
      postalCode: savedAddress.postalCode,
      addressLine: savedAddress.addressLine,
      paymentExpiresAt,
    });

    await insertOrderItems(
      tx,
      priced.map((line) => ({
        orderId: order.id,
        variantId: line.variantId,
        productTitleFa: line.titleFa,
        productTitleEn: line.titleEn,
        productType: line.productType,
        colorNameFa: line.colorNameFa,
        colorNameEn: line.colorNameEn,
        colorHex: line.colorHex,
        sizeCode: line.sizeCode,
        sku: line.sku,
        unitPriceToman: line.unitPriceToman,
        quantity: line.quantity,
        lineTotalToman: line.lineTotalToman,
      })),
    );
    await insertPendingPayment(tx, { orderId: order.id, amountToman: totalToman });

    for (const line of priced) {
      const decremented = await decrementStock(tx, line.variantId, line.quantity);

      if (!decremented) {
        throw new AppError("BUSINESS_RULE", "Not enough stock");
      }
    }

    const cartId = lines[0]?.cartId;

    if (!cartId) {
      throw new AppError("BUSINESS_RULE", "The cart is empty");
    }

    await clearCart(tx, cartId);
    return order.orderNumber;
  });

  return requireOrder(orderNumber);
}

export async function listOrders(userId: string, query: TListQuery) {
  const total = await countOrdersForUser(userId);
  const rows = await listOrdersForUser(userId, query.pageSize, (query.page - 1) * query.pageSize);

  return {
    items: rows.map(toOrder),
    page: query.page,
    pageSize: query.pageSize,
    total,
  };
}

export async function getOwnOrder(userId: string, orderNumber: string): Promise<TOrder> {
  const row = await findOrderForUser(userId, orderNumber);

  if (!row) {
    throw new AppError("NOT_FOUND", "Order was not found");
  }

  return toOrder(row);
}

export async function updateFulfillment(orderNumber: string, input: TFulfillment): Promise<TOrder> {
  await db.transaction(async (tx) => {
    const order = await lockOrder(tx, orderNumber);

    if (!order) {
      throw new AppError("NOT_FOUND", "Order was not found");
    }

    const allowed = FULFILLMENT_TRANSITIONS[order.status] ?? [];

    if (!allowed.includes(input.status)) {
      throw new AppError("BUSINESS_RULE", "This order cannot move to that status");
    }

    if (input.status === EOrderStatus.cancelled && STOCK_HOLDING_STATUSES.has(order.status)) {
      const items = await listOrderItems(tx, order.id);

      for (const item of items) {
        await restoreStock(tx, item.variantId, item.quantity);
      }
    }

    const now = new Date();
    await saveOrderStatus(tx, order.id, {
      status: input.status,
      trackingCode: input.status === EOrderStatus.shipped ? input.trackingCode : undefined,
      shippedAt: input.status === EOrderStatus.shipped ? now : undefined,
      deliveredAt: input.status === EOrderStatus.delivered ? now : undefined,
      cancelledAt: input.status === EOrderStatus.cancelled ? now : undefined,
    });
  });

  return requireOrder(orderNumber);
}

export async function recordPaymentResult(
  orderNumber: string,
  input: TPaymentResult,
): Promise<TOrder> {
  await db.transaction(async (tx) => {
    const order = await lockOrder(tx, orderNumber);

    if (!order) {
      throw new AppError("NOT_FOUND", "Order was not found");
    }

    if (order.status !== EOrderStatus.pendingPayment) {
      throw new AppError("BUSINESS_RULE", "This order is not waiting for payment");
    }

    const pending = await lockPendingPayment(tx, order.id);

    if (!pending) {
      throw new AppError("BUSINESS_RULE", "This order has no pending payment");
    }

    if (
      input.status === EPaymentStatus.succeeded &&
      order.paymentExpiresAt.getTime() < Date.now()
    ) {
      throw new AppError("BUSINESS_RULE", "The payment window has expired");
    }

    const now = new Date();

    if (input.status === EPaymentStatus.succeeded) {
      await savePaymentStatus(tx, pending.id, {
        status: EPaymentStatus.succeeded,
        paidAt: now,
      });
      await saveOrderStatus(tx, order.id, {
        status: EOrderStatus.paid,
        paidAt: now,
      });
      return;
    }

    const items = await listOrderItems(tx, order.id);

    for (const item of items) {
      await restoreStock(tx, item.variantId, item.quantity);
    }

    await savePaymentStatus(tx, pending.id, { status: EPaymentStatus.failed });
    await saveOrderStatus(tx, order.id, { status: EOrderStatus.paymentFailed });
  });

  return requireOrder(orderNumber);
}
