import {
  addressListSchema,
  addressSchema,
  addressWriteSchema,
} from "@/features/address/schemas/address.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/server";
import { createAddress, listAddresses } from "@/server/services/address/address-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const session = await requireAuth();
    const addresses = await listAddresses(session.user.id);

    return jsonSuccess(addressListSchema.parse(addresses));
  });
}

export async function POST(request: Request) {
  return handleRoute(async () => {
    const session = await requireAuth();
    const body: unknown = await request.json().catch(() => null);
    const input = addressWriteSchema.parse(body);
    const saved = await createAddress(session.user.id, input);

    return jsonSuccess(addressSchema.parse(saved), 201);
  });
}
