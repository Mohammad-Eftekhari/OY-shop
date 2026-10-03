import "server-only";

import type { TCart, TCartItemWrite } from "@/features/cart/schemas/cart.schema";
import { db } from "@/db";
import { AppError } from "@/lib/api/errors";
import { findPurchasableVariant } from "@/server/repositories/catalog/catalog-repository";
import {
  deleteCartItem,
  findCartByUserId,
  findCartItem,
  findOrCreateCart,
  insertCartItem,
  listCartLines,
  updateCartItemQuantity,
} from "@/server/repositories/cart/cart-repository";

function unitPrice(variantPriceToman: number | null, productPriceToman: number) {
  return variantPriceToman ?? productPriceToman;
}

export async function getCart(userId: string): Promise<TCart> {
  const lines = await listCartLines(userId);

  return {
    items: lines.map((line) => {
      const price = unitPrice(line.variantPriceToman, line.productPriceToman);

      return {
        variantId: line.variantId,
        quantity: line.quantity,
        unitPriceToman: price,
        lineTotalToman: price * line.quantity,
        stockQuantity: line.stockQuantity,
        sku: line.sku,
        productSlug: line.productSlug,
        productTitleFa: line.productTitleFa,
        productTitleEn: line.productTitleEn,
        productType: line.productType as TCart["items"][number]["productType"],
        colorNameFa: line.colorNameFa,
        colorNameEn: line.colorNameEn,
        colorHex: line.colorHex,
        sizeCode: line.sizeCode,
        sizeLabelFa: line.sizeLabelFa,
        sizeLabelEn: line.sizeLabelEn,
      };
    }),
  };
}

export async function saveCartItem(userId: string, input: TCartItemWrite): Promise<TCart> {
  if (input.quantity === 0) {
    const cartRow = await findCartByUserId(db, userId);
    const removed = cartRow ? await deleteCartItem(db, cartRow.id, input.variantId) : null;

    if (!removed) {
      throw new AppError("NOT_FOUND", "Cart item was not found");
    }

    return getCart(userId);
  }

  await db.transaction(async (tx) => {
    const variant = await findPurchasableVariant(tx, input.variantId);

    if (!variant || !variant.isActive || !variant.isPublished) {
      throw new AppError("NOT_FOUND", "Variant was not found");
    }

    const cartRow = await findOrCreateCart(tx, userId);
    const existing = await findCartItem(tx, cartRow.id, input.variantId);
    const nextQuantity = (existing?.quantity ?? 0) + input.quantity;

    if (nextQuantity > variant.stockQuantity) {
      throw new AppError("BUSINESS_RULE", "Not enough stock");
    }

    if (existing) {
      await updateCartItemQuantity(tx, existing.id, nextQuantity);
      return;
    }

    await insertCartItem(tx, {
      cartId: cartRow.id,
      variantId: input.variantId,
      quantity: input.quantity,
    });
  });

  return getCart(userId);
}

export async function removeCartItem(userId: string, variantId: string): Promise<TCart> {
  const cartRow = await findCartByUserId(db, userId);
  const removed = cartRow ? await deleteCartItem(db, cartRow.id, variantId) : null;

  if (!removed) {
    throw new AppError("NOT_FOUND", "Cart item was not found");
  }

  return getCart(userId);
}
