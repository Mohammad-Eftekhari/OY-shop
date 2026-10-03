import "server-only";

import { asc, eq } from "drizzle-orm";

import { db, type TDatabase, type TTransaction } from "@/db";
import { shippingMethod } from "@/db/schema";

type TExecutor = TDatabase | TTransaction;

export async function listActiveShippingMethods() {
  return db
    .select()
    .from(shippingMethod)
    .where(eq(shippingMethod.isActive, true))
    .orderBy(asc(shippingMethod.sortOrder), asc(shippingMethod.nameEn));
}

export async function findShippingMethodById(executor: TExecutor, shippingMethodId: string) {
  const rows = await executor
    .select()
    .from(shippingMethod)
    .where(eq(shippingMethod.id, shippingMethodId))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertShippingMethod(input: {
  nameFa: string;
  nameEn: string;
  priceToman: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
  sortOrder: number;
}) {
  const rows = await db.insert(shippingMethod).values(input).returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Shipping method insert did not return a row");
  }

  return saved;
}

export async function updateShippingMethod(
  shippingMethodId: string,
  input: Partial<{
    nameFa: string;
    nameEn: string;
    priceToman: number;
    estimatedDaysMin: number;
    estimatedDaysMax: number;
    isActive: boolean;
    sortOrder: number;
  }>,
) {
  const rows = await db
    .update(shippingMethod)
    .set(input)
    .where(eq(shippingMethod.id, shippingMethodId))
    .returning();
  return rows[0] ?? null;
}
