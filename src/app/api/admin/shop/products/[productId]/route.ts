import { z } from "zod";

import { adminProductSchema, productUpdateSchema } from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { saveProduct } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

type TProductRoute = {
  params: Promise<{ productId: string }>;
};

export async function PATCH(request: Request, context: TProductRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { productId } = z.object({ productId: z.uuid() }).parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = productUpdateSchema.parse(body);
    const saved = await saveProduct(productId, input);

    return jsonSuccess(adminProductSchema.parse(saved));
  });
}
