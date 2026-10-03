import { adminProductSchema, productWriteSchema } from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { createProduct } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const body: unknown = await request.json().catch(() => null);
    const input = productWriteSchema.parse(body);
    const saved = await createProduct(input);

    return jsonSuccess(adminProductSchema.parse(saved), 201);
  });
}
