import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db, type TDatabase, type TTransaction } from "@/db";
import { address } from "@/db/schema";

type TExecutor = TDatabase | TTransaction;

export async function listAddressesByUserId(userId: string) {
  return db
    .select()
    .from(address)
    .where(eq(address.userId, userId))
    .orderBy(desc(address.isDefault), desc(address.createdAt));
}

export async function findAddressForUser(executor: TExecutor, userId: string, addressId: string) {
  const rows = await executor
    .select()
    .from(address)
    .where(and(eq(address.id, addressId), eq(address.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function clearDefaultAddress(executor: TExecutor, userId: string) {
  await executor
    .update(address)
    .set({ isDefault: false })
    .where(and(eq(address.userId, userId), eq(address.isDefault, true)));
}

export async function insertAddress(
  executor: TExecutor,
  input: {
    userId: string;
    receiverName: string;
    mobile: string;
    province: string;
    city: string;
    postalCode: string;
    addressLine: string;
    isDefault: boolean;
  },
) {
  const rows = await executor.insert(address).values(input).returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Address insert did not return a row");
  }

  return saved;
}

export async function updateAddress(
  executor: TExecutor,
  addressId: string,
  userId: string,
  input: Partial<{
    receiverName: string;
    mobile: string;
    province: string;
    city: string;
    postalCode: string;
    addressLine: string;
    isDefault: boolean;
  }>,
) {
  const rows = await executor
    .update(address)
    .set(input)
    .where(and(eq(address.id, addressId), eq(address.userId, userId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteAddress(userId: string, addressId: string) {
  const rows = await db
    .delete(address)
    .where(and(eq(address.id, addressId), eq(address.userId, userId)))
    .returning({ id: address.id });
  return rows[0] ?? null;
}
