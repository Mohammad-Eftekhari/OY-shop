import "server-only";

import { and, asc, eq } from "drizzle-orm";

import { db, type TDatabase, type TTransaction } from "@/db";
import { cart, cartItem, color, product, productVariant, size } from "@/db/schema";

type TExecutor = TDatabase | TTransaction;

export async function findCartByUserId(executor: TExecutor, userId: string) {
  const rows = await executor.select().from(cart).where(eq(cart.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function findOrCreateCart(executor: TExecutor, userId: string) {
  const existing = await findCartByUserId(executor, userId);

  if (existing) {
    return existing;
  }

  const inserted = await executor.insert(cart).values({ userId }).onConflictDoNothing().returning();

  if (inserted[0]) {
    return inserted[0];
  }

  const again = await executor.select().from(cart).where(eq(cart.userId, userId)).limit(1);
  const row = again[0];

  if (!row) {
    throw new Error("Cart could not be created");
  }

  return row;
}

export async function findCartItem(executor: TExecutor, cartId: string, variantId: string) {
  const rows = await executor
    .select()
    .from(cartItem)
    .where(and(eq(cartItem.cartId, cartId), eq(cartItem.variantId, variantId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertCartItem(
  executor: TExecutor,
  input: { cartId: string; variantId: string; quantity: number },
) {
  const rows = await executor.insert(cartItem).values(input).returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Cart item insert did not return a row");
  }

  return saved;
}

export async function updateCartItemQuantity(
  executor: TExecutor,
  cartItemId: string,
  quantity: number,
) {
  await executor.update(cartItem).set({ quantity }).where(eq(cartItem.id, cartItemId));
}

export async function deleteCartItem(executor: TExecutor, cartId: string, variantId: string) {
  const rows = await executor
    .delete(cartItem)
    .where(and(eq(cartItem.cartId, cartId), eq(cartItem.variantId, variantId)))
    .returning({ id: cartItem.id });
  return rows[0] ?? null;
}

export async function listCartLines(userId: string) {
  return db
    .select({
      variantId: productVariant.id,
      quantity: cartItem.quantity,
      stockQuantity: productVariant.stockQuantity,
      sku: productVariant.sku,
      variantPriceToman: productVariant.priceToman,
      productPriceToman: product.priceToman,
      productSlug: product.slug,
      productTitleFa: product.titleFa,
      productTitleEn: product.titleEn,
      productType: product.type,
      colorNameFa: color.nameFa,
      colorNameEn: color.nameEn,
      colorHex: color.hex,
      sizeCode: size.code,
      sizeLabelFa: size.labelFa,
      sizeLabelEn: size.labelEn,
    })
    .from(cartItem)
    .innerJoin(cart, eq(cartItem.cartId, cart.id))
    .innerJoin(productVariant, eq(cartItem.variantId, productVariant.id))
    .innerJoin(product, eq(productVariant.productId, product.id))
    .innerJoin(color, eq(productVariant.colorId, color.id))
    .innerJoin(size, eq(productVariant.sizeId, size.id))
    .where(eq(cart.userId, userId))
    .orderBy(asc(cartItem.createdAt));
}
