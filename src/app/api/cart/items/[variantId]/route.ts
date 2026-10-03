import { z } from "zod";

import { cartSchema } from "@/features/cart/schemas/cart.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/server";
import { removeCartItem } from "@/server/services/cart/cart-service";

export const dynamic = "force-dynamic";

type TCartItemRoute = {
  params: Promise<{ variantId: string }>;
};

export async function DELETE(_request: Request, context: TCartItemRoute) {
  return handleRoute(async () => {
    const session = await requireAuth();
    const { variantId } = z.object({ variantId: z.uuid() }).parse(await context.params);
    const cart = await removeCartItem(session.user.id, variantId);

    return jsonSuccess(cartSchema.parse(cart));
  });
}
