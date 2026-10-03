import { sizeSchema, sizeWriteSchema } from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { createSize } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const body: unknown = await request.json().catch(() => null);
    const input = sizeWriteSchema.parse(body);
    const saved = await createSize(input);

    return jsonSuccess(sizeSchema.parse(saved), 201);
  });
}
