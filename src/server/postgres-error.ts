import "server-only";

import { AppError } from "@/lib/api/errors";

const UNIQUE_MESSAGES: Record<string, string> = {
  product_slug_unique: "A product with this slug already exists",
  product_variant_sku_unique: "A variant with this sku already exists",
  product_variant_product_color_size_unique: "This product already has that color and size",
  color_name_fa_unique: "A color with this name already exists",
  color_name_en_unique: "A color with this name already exists",
  size_code_unique: "A size with this code already exists",
  address_one_default_per_user: "This account already has a default address",
};

function readStringField(error: unknown, field: string): string | null {
  if (typeof error !== "object" || error === null || !(field in error)) {
    return null;
  }

  const value = (error as Record<string, unknown>)[field];
  return typeof value === "string" ? value : null;
}

function readDatabaseError(error: unknown): { code: string | null; constraint: string | null } {
  const code = readStringField(error, "code");
  const constraint =
    readStringField(error, "constraint_name") ?? readStringField(error, "constraint");

  if (code) {
    return { code, constraint };
  }

  if (typeof error === "object" && error !== null && "cause" in error) {
    return readDatabaseError((error as { cause: unknown }).cause);
  }

  return { code: null, constraint: null };
}

export function postgresCode(error: unknown): string | null {
  return readDatabaseError(error).code;
}

export function rethrowUniqueViolation(error: unknown): never {
  const { code, constraint } = readDatabaseError(error);

  if (code === "23505") {
    const message =
      (constraint ? UNIQUE_MESSAGES[constraint] : undefined) ?? "That record already exists";
    throw new AppError("CONFLICT", message);
  }

  throw error;
}
