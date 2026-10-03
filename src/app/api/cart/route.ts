import { cartSchema } from "@/features/cart/schemas/cart.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/server";
import { getCart } from "@/server/services/cart/cart-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireAuth();
    const cart = await getCart(session.user.id);

    return jsonSuccess(cartSchema.parse(cart));
  });
}
