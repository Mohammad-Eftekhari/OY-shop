import { z } from "zod";

import {
  productImageSchema,
  productImageUpdateSchema,
} from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { saveProductImage } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

type TImageRoute = {
  params: Promise<{ imageId: string }>;
};

export async function PATCH(request: Request, context: TImageRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { imageId } = z.object({ imageId: z.uuid() }).parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = productImageUpdateSchema.parse(body);
    const saved = await saveProductImage(imageId, input);

    return jsonSuccess(productImageSchema.parse(saved));
  });
}
