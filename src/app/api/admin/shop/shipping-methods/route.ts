import {
  adminShippingMethodSchema,
  shippingMethodWriteSchema,
} from "@/features/shipping/schemas/shipping.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { createShippingMethod } from "@/server/services/shipping/shipping-service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const body: unknown = await request.json().catch(() => null);
    const input = shippingMethodWriteSchema.parse(body);
    const saved = await createShippingMethod(input);

    return jsonSuccess(adminShippingMethodSchema.parse(saved), 201);
  });
}
