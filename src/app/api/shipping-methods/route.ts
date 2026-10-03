import { shippingMethodListSchema } from "@/features/shipping/schemas/shipping.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { listShippingMethods } from "@/server/services/shipping/shipping-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const methods = await listShippingMethods();
    return jsonSuccess(shippingMethodListSchema.parse(methods));
  });
}
