import "server-only";

import type {
  TAddress,
  TAddressUpdate,
  TAddressWrite,
} from "@/features/address/schemas/address.schema";
import { db } from "@/db";
import { AppError } from "@/lib/api/errors";
import {
  clearDefaultAddress,
  deleteAddress,
  findAddressForUser,
  insertAddress,
  listAddressesByUserId,
  updateAddress,
} from "@/server/repositories/address/address-repository";
import { rethrowUniqueViolation } from "@/server/postgres-error";

function definedFields<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function toAddress(row: {
  id: string;
  receiverName: string;
  mobile: string;
  province: string;
  city: string;
  postalCode: string;
  addressLine: string;
  isDefault: boolean;
}): TAddress {
  return {
    id: row.id,
    receiverName: row.receiverName,
    mobile: row.mobile,
    province: row.province,
    city: row.city,
    postalCode: row.postalCode,
    addressLine: row.addressLine,
    isDefault: row.isDefault,
  };
}

export async function listAddresses(userId: string) {
  const rows = await listAddressesByUserId(userId);
  return { items: rows.map(toAddress) };
}

export async function createAddress(userId: string, input: TAddressWrite): Promise<TAddress> {
  try {
    const row = await db.transaction(async (tx) => {
      const isDefault = input.isDefault ?? false;

      if (isDefault) {
        await clearDefaultAddress(tx, userId);
      }

      return insertAddress(tx, {
        userId,
        receiverName: input.receiverName,
        mobile: input.mobile,
        province: input.province,
        city: input.city,
        postalCode: input.postalCode,
        addressLine: input.addressLine,
        isDefault,
      });
    });

    return toAddress(row);
  } catch (error) {
    rethrowUniqueViolation(error);
  }
}

export async function saveAddress(
  userId: string,
  addressId: string,
  input: TAddressUpdate,
): Promise<TAddress> {
  try {
    const row = await db.transaction(async (tx) => {
      const current = await findAddressForUser(tx, userId, addressId);

      if (!current) {
        throw new AppError("NOT_FOUND", "Address was not found");
      }

      if (input.isDefault) {
        await clearDefaultAddress(tx, userId);
      }

      const changes = definedFields(input);

      if (Object.keys(changes).length === 0) {
        return current;
      }

      const saved = await updateAddress(tx, addressId, userId, changes);

      if (!saved) {
        throw new AppError("NOT_FOUND", "Address was not found");
      }

      return saved;
    });

    return toAddress(row);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    rethrowUniqueViolation(error);
  }
}

export async function removeAddress(userId: string, addressId: string) {
  const row = await deleteAddress(userId, addressId);

  if (!row) {
    throw new AppError("NOT_FOUND", "Address was not found");
  }

  return { id: row.id };
}
