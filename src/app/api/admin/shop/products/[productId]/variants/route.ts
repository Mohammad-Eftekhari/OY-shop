import { z } from "zod";

import { adminVariantSchema, variantWriteSchema } from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { createProductVariant } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

type TProductVariantRoute = {
  params: Promise<{ productId: string }>;
};

export async function POST(request: Request, context: TProductVariantRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { productId } = z.object({ productId: z.uuid() }).parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = variantWriteSchema.parse(body);
    const saved = await createProductVariant(productId, input);

    return jsonSuccess(adminVariantSchema.parse(saved), 201);
  });
}
