import { cartItemWriteSchema, cartSchema } from "@/features/cart/schemas/cart.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/server";
import { saveCartItem } from "@/server/services/cart/cart-service";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  return handleRoute(async () => {
    const session = await requireAuth();
    const body: unknown = await request.json().catch(() => null);
    const input = cartItemWriteSchema.parse(body);
    const cart = await saveCartItem(session.user.id, input);

    return jsonSuccess(cartSchema.parse(cart));
  });
}
