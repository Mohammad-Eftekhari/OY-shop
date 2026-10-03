import { colorSchema, colorWriteSchema } from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { createColor } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const body: unknown = await request.json().catch(() => null);
    const input = colorWriteSchema.parse(body);
    const saved = await createColor(input);

    return jsonSuccess(colorSchema.parse(saved), 201);
  });
}
