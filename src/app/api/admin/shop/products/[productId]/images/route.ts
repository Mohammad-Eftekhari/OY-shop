import { z } from "zod";

import {
  productImageSchema,
  productImageWriteSchema,
} from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { createProductImage } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

type TProductImageRoute = {
  params: Promise<{ productId: string }>;
};

export async function POST(request: Request, context: TProductImageRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { productId } = z.object({ productId: z.uuid() }).parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = productImageWriteSchema.parse(body);
    const saved = await createProductImage(productId, input);

    return jsonSuccess(productImageSchema.parse(saved), 201);
  });
}
