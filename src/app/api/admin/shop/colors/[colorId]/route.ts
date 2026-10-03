import { z } from "zod";

import { colorSchema, colorUpdateSchema } from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { saveColor } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

type TColorRoute = {
  params: Promise<{ colorId: string }>;
};

export async function PATCH(request: Request, context: TColorRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { colorId } = z.object({ colorId: z.uuid() }).parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = colorUpdateSchema.parse(body);
    const saved = await saveColor(colorId, input);

    return jsonSuccess(colorSchema.parse(saved));
  });
}
