import "server-only";

import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm";

import { EOrderStatus, EPaymentProvider, EPaymentStatus } from "@/constants/shop";
import { db, type TDatabase, type TTransaction } from "@/db";
import {
  cart,
  cartItem,
  color,
  customerOrder,
  orderItem,
  payment,
  product,
  productVariant,
  size,
} from "@/db/schema";

type TExecutor = TDatabase | TTransaction;

export async function lockCartLines(tx: TTransaction, userId: string) {
  return tx
    .select({
      cartId: cart.id,
      quantity: cartItem.quantity,
      variantId: productVariant.id,
      stockQuantity: productVariant.stockQuantity,
      isActive: productVariant.isActive,
      variantPriceToman: productVariant.priceToman,
      sku: productVariant.sku,
      isPublished: product.isPublished,
      productPriceToman: product.priceToman,
      titleFa: product.titleFa,
      titleEn: product.titleEn,
      productType: product.type,
      colorNameFa: color.nameFa,
      colorNameEn: color.nameEn,
      colorHex: color.hex,
      sizeCode: size.code,
    })
    .from(cartItem)
    .innerJoin(cart, eq(cartItem.cartId, cart.id))
    .innerJoin(productVariant, eq(cartItem.variantId, productVariant.id))
    .innerJoin(product, eq(productVariant.productId, product.id))
    .innerJoin(color, eq(productVariant.colorId, color.id))
    .innerJoin(size, eq(productVariant.sizeId, size.id))
    .where(eq(cart.userId, userId))
    .orderBy(asc(productVariant.id))
    .for("update");
}

export async function decrementStock(tx: TTransaction, variantId: string, quantity: number) {
  const rows = await tx
    .update(productVariant)
    .set({
      stockQuantity: sql`${productVariant.stockQuantity} - ${quantity}`,
    })
    .where(and(eq(productVariant.id, variantId), gte(productVariant.stockQuantity, quantity)))
    .returning({ id: productVariant.id });

  return rows.length === 1;
}

export async function restoreStock(tx: TTransaction, variantId: string, quantity: number) {
  await tx
    .update(productVariant)
    .set({
      stockQuantity: sql`${productVariant.stockQuantity} + ${quantity}`,
    })
    .where(eq(productVariant.id, variantId));
}

export async function clearCart(tx: TTransaction, cartId: string) {
  await tx.delete(cartItem).where(eq(cartItem.cartId, cartId));
}

export async function insertOrder(
  tx: TTransaction,
  input: {
    userId: string;
    subtotalToman: number;
    shippingToman: number;
    totalToman: number;
    shippingMethodId: string;
    shippingNameFa: string;
    shippingNameEn: string;
    addressId: string;
    receiverName: string;
    mobile: string;
    province: string;
    city: string;
    postalCode: string;
    addressLine: string;
    paymentExpiresAt: Date;
  },
) {
  const rows = await tx
    .insert(customerOrder)
    .values({
      ...input,
      status: EOrderStatus.pendingPayment,
      discountToman: 0,
    })
    .returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Order insert did not return a row");
  }

  return saved;
}

export async function insertOrderItems(
  tx: TTransaction,
  items: Array<{
    orderId: string;
    variantId: string;
    productTitleFa: string;
    productTitleEn: string;
    productType: string;
    colorNameFa: string;
    colorNameEn: string;
    colorHex: string;
    sizeCode: string;
    sku: string;
    unitPriceToman: number;
    quantity: number;
    lineTotalToman: number;
  }>,
) {
  if (items.length === 0) {
    return;
  }

  await tx.insert(orderItem).values(items);
}

export async function insertPendingPayment(
  tx: TTransaction,
  input: { orderId: string; amountToman: number },
) {
  await tx.insert(payment).values({
    orderId: input.orderId,
    status: EPaymentStatus.pending,
    amountToman: input.amountToman,
    provider: EPaymentProvider.unassigned,
  });
}

export async function countOrdersForUser(userId: string) {
  const rows = await db
    .select({ total: count() })
    .from(customerOrder)
    .where(eq(customerOrder.userId, userId));
  return Number(rows[0]?.total ?? 0);
}

export async function listOrdersForUser(userId: string, limit: number, offset: number) {
  return db.query.customerOrder.findMany({
    where: eq(customerOrder.userId, userId),
    with: {
      items: true,
      payments: true,
    },
    orderBy: [desc(customerOrder.createdAt)],
    limit,
    offset,
  });
}

export async function findOrderForUser(userId: string, orderNumber: string) {
  return db.query.customerOrder.findFirst({
    where: and(eq(customerOrder.userId, userId), eq(customerOrder.orderNumber, orderNumber)),
    with: {
      items: true,
      payments: true,
    },
  });
}

export async function findOrderWithDetails(executor: TExecutor, orderNumber: string) {
  return executor.query.customerOrder.findFirst({
    where: eq(customerOrder.orderNumber, orderNumber),
    with: {
      items: true,
      payments: true,
    },
  });
}

export async function lockOrder(tx: TTransaction, orderNumber: string) {
  const rows = await tx
    .select()
    .from(customerOrder)
    .where(eq(customerOrder.orderNumber, orderNumber))
    .limit(1)
    .for("update");
  return rows[0] ?? null;
}

export async function listOrderItems(tx: TTransaction, orderId: string) {
  return tx
    .select()
    .from(orderItem)
    .where(eq(orderItem.orderId, orderId))
    .orderBy(asc(orderItem.variantId));
}

export async function lockPendingPayment(tx: TTransaction, orderId: string) {
  const rows = await tx
    .select()
    .from(payment)
    .where(and(eq(payment.orderId, orderId), eq(payment.status, EPaymentStatus.pending)))
    .limit(1)
    .for("update");
  return rows[0] ?? null;
}

export async function saveOrderStatus(
  tx: TTransaction,
  orderId: string,
  input: Partial<{
    status: string;
    trackingCode: string;
    paidAt: Date;
    shippedAt: Date;
    deliveredAt: Date;
    cancelledAt: Date;
  }>,
) {
  await tx.update(customerOrder).set(input).where(eq(customerOrder.id, orderId));
}

export async function savePaymentStatus(
  tx: TTransaction,
  paymentId: string,
  input: { status: string; paidAt?: Date },
) {
  await tx.update(payment).set(input).where(eq(payment.id, paymentId));
}
