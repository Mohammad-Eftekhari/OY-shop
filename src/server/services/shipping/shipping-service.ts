import "server-only";

import type {
  TAdminShippingMethod,
  TShippingMethod,
  TShippingMethodUpdate,
  TShippingMethodWrite,
} from "@/features/shipping/schemas/shipping.schema";
import { AppError } from "@/lib/api/errors";
import type { TFieldError } from "@/lib/api/errors";
import {
  findShippingMethodById,
  insertShippingMethod,
  listActiveShippingMethods,
  updateShippingMethod,
} from "@/server/repositories/shipping/shipping-repository";
import { db } from "@/db";

function assertShippingDays(estimatedDaysMin: number, estimatedDaysMax: number) {
  if (estimatedDaysMax < estimatedDaysMin) {
    const details: TFieldError[] = [
      {
        field: "estimatedDaysMax",
        message: "Maximum days must be at least the minimum",
      },
    ];
    throw new AppError("VALIDATION_ERROR", "Shipping days are invalid", details);
  }
}

function definedFields<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

function toPublicMethod(row: {
  id: string;
  nameFa: string;
  nameEn: string;
  priceToman: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  sortOrder: number;
}): TShippingMethod {
  return {
    id: row.id,
    nameFa: row.nameFa,
    nameEn: row.nameEn,
    priceToman: row.priceToman,
    estimatedDaysMin: row.estimatedDaysMin,
    estimatedDaysMax: row.estimatedDaysMax,
    sortOrder: row.sortOrder,
  };
}

function toAdminMethod(row: {
  id: string;
  nameFa: string;
  nameEn: string;
  priceToman: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  isActive: boolean;
  sortOrder: number;
}): TAdminShippingMethod {
  return {
    ...toPublicMethod(row),
    isActive: row.isActive,
  };
}

export async function listShippingMethods() {
  const rows = await listActiveShippingMethods();
  return { items: rows.map(toPublicMethod) };
}

export async function createShippingMethod(
  input: TShippingMethodWrite,
): Promise<TAdminShippingMethod> {
  assertShippingDays(input.estimatedDaysMin, input.estimatedDaysMax);

  const row = await insertShippingMethod({
    nameFa: input.nameFa,
    nameEn: input.nameEn,
    priceToman: input.priceToman,
    estimatedDaysMin: input.estimatedDaysMin,
    estimatedDaysMax: input.estimatedDaysMax,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });

  return toAdminMethod(row);
}

export async function saveShippingMethod(
  shippingMethodId: string,
  input: TShippingMethodUpdate,
): Promise<TAdminShippingMethod> {
  const current = await findShippingMethodById(db, shippingMethodId);

  if (!current) {
    throw new AppError("NOT_FOUND", "Shipping method was not found");
  }

  const estimatedDaysMin = input.estimatedDaysMin ?? current.estimatedDaysMin;
  const estimatedDaysMax = input.estimatedDaysMax ?? current.estimatedDaysMax;
  assertShippingDays(estimatedDaysMin, estimatedDaysMax);

  const changes = definedFields(input);

  if (Object.keys(changes).length === 0) {
    return toAdminMethod(current);
  }

  const row = await updateShippingMethod(shippingMethodId, changes);

  if (!row) {
    throw new AppError("NOT_FOUND", "Shipping method was not found");
  }

  return toAdminMethod(row);
}
