import {
  orderListQuerySchema,
  orderSchema,
  paginatedOrdersSchema,
  placeOrderSchema,
} from "@/features/order/schemas/order.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/server";
import { listOrders, placeOrder } from "@/server/services/order/order-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const session = await requireAuth();
    const url = new URL(request.url);
    const query = orderListQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
    });
    const orders = await listOrders(session.user.id, query);

    return jsonSuccess(paginatedOrdersSchema.parse(orders));
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const session = await requireAuth();
    const body: unknown = await request.json().catch(() => null);
    const input = placeOrderSchema.parse(body);
    const order = await placeOrder(session.user.id, input);

    return jsonSuccess(orderSchema.parse(order), 201);
  });
}
