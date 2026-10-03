import { z } from "zod";

import { sizeSchema, sizeUpdateSchema } from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { saveSize } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

type TSizeRoute = {
  params: Promise<{ sizeId: string }>;
};

export async function PATCH(request: Request, context: TSizeRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { sizeId } = z.object({ sizeId: z.uuid() }).parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = sizeUpdateSchema.parse(body);
    const saved = await saveSize(sizeId, input);

    return jsonSuccess(sizeSchema.parse(saved));
  });
}
