import { z } from "zod";

import {
  adminShippingMethodSchema,
  shippingMethodUpdateSchema,
} from "@/features/shipping/schemas/shipping.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { saveShippingMethod } from "@/server/services/shipping/shipping-service";

export const dynamic = "force-dynamic";

type TShippingMethodRoute = {
  params: Promise<{ shippingMethodId: string }>;
};

export async function PATCH(request: Request, context: TShippingMethodRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { shippingMethodId } = z
      .object({ shippingMethodId: z.uuid() })
      .parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = shippingMethodUpdateSchema.parse(body);
    const saved = await saveShippingMethod(shippingMethodId, input);

    return jsonSuccess(adminShippingMethodSchema.parse(saved));
  });
}
