import { z } from "zod";

import {
  addressSchema,
  addressUpdateSchema,
  deletedAddressSchema,
} from "@/features/address/schemas/address.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/server";
import { removeAddress, saveAddress } from "@/server/services/address/address-service";

export const dynamic = "force-dynamic";

type TAddressRoute = {
  params: Promise<{ addressId: string }>;
};

async function readAddressId(context: TAddressRoute) {
  const params = await context.params;
  return z.object({ addressId: z.uuid() }).parse(params).addressId;
}

export async function PATCH(request: Request, context: TAddressRoute) {
  return handleRoute(async () => {
    const session = await requireAuth();
    const addressId = await readAddressId(context);
    const body: unknown = await request.json().catch(() => null);
    const input = addressUpdateSchema.parse(body);
    const saved = await saveAddress(session.user.id, addressId, input);

    return jsonSuccess(addressSchema.parse(saved));
  });
}

export async function DELETE(_request: Request, context: TAddressRoute) {
  return handleRoute(async () => {
    const session = await requireAuth();
    const addressId = await readAddressId(context);
    const removed = await removeAddress(session.user.id, addressId);

    return jsonSuccess(deletedAddressSchema.parse(removed));
  });
}
