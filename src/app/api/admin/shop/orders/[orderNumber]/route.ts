import { z } from "zod";

import { fulfillmentSchema, orderSchema } from "@/features/order/schemas/order.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { updateFulfillment } from "@/server/services/order/order-service";

export const dynamic = "force-dynamic";

type TAdminOrderRoute = {
  params: Promise<{ orderNumber: string }>;
};

export async function PATCH(request: Request, context: TAdminOrderRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { orderNumber } = z
      .object({ orderNumber: z.string().trim().min(1) })
      .parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = fulfillmentSchema.parse(body);
    const order = await updateFulfillment(orderNumber, input);

    return jsonSuccess(orderSchema.parse(order));
  });
}
