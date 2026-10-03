import { z } from "zod";

import { orderSchema, paymentResultSchema } from "@/features/order/schemas/order.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { EUserRole, requireRole } from "@/lib/auth/server";
import { recordPaymentResult } from "@/server/services/order/order-service";

export const dynamic = "force-dynamic";

type TAdminPaymentRoute = {
  params: Promise<{ orderNumber: string }>;
};

export async function POST(request: Request, context: TAdminPaymentRoute) {
  return handleRoute(async () => {
    await requireRole(EUserRole.admin);
    const { orderNumber } = z
      .object({ orderNumber: z.string().trim().min(1) })
      .parse(await context.params);
    const body: unknown = await request.json().catch(() => null);
    const input = paymentResultSchema.parse(body);
    const order = await recordPaymentResult(orderNumber, input);

    return jsonSuccess(orderSchema.parse(order));
  });
}
