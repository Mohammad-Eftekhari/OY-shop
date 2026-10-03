import { z } from "zod";

import {
  adminVariantSchema,
  deletedVariantSchema,
  variantUpdateSchema,
} from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import {
  removeProductVariant,
  saveProductVariant,
} from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

type TVariantRoute = {
  params: Promise<{ variantId: string }>;
};

async function readVariantId(context: TVariantRoute) {
  return z.object({ variantId: z.uuid() }).parse(await context.params).variantId;
}

export async function PATCH(request: Request, context: TVariantRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const variantId = await readVariantId(context);
    const body: unknown = await request.json().catch(() => null);
    const input = variantUpdateSchema.parse(body);
    const saved = await saveProductVariant(variantId, input);

    return jsonSuccess(adminVariantSchema.parse(saved));
  });
}

export async function DELETE(_request: Request, context: TVariantRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const variantId = await readVariantId(context);
    const removed = await removeProductVariant(variantId);

    return jsonSuccess(deletedVariantSchema.parse(removed));
  });
}
