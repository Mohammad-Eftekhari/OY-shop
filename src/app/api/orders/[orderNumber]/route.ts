import { z } from "zod";

import { orderSchema } from "@/features/order/schemas/order.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/server";
import { getOwnOrder } from "@/server/services/order/order-service";

export const dynamic = "force-dynamic";

type TOrderRoute = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(_request: Request, context: TOrderRoute) {
  return handleRoute(async () => {
    const session = await requireAuth();
    const { orderNumber } = z
      .object({ orderNumber: z.string().trim().min(1) })
      .parse(await context.params);
    const order = await getOwnOrder(session.user.id, orderNumber);

    return jsonSuccess(orderSchema.parse(order));
  });
}
