import { z } from "zod";

import { productSchema } from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { getPublishedProduct } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

type TProductRoute = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: TProductRoute) {
  return handleRoute(async () => {
    const { slug } = z.object({ slug: z.string().trim().min(1) }).parse(await context.params);
    const product = await getPublishedProduct(slug);

    return jsonSuccess(productSchema.parse(product));
  });
}
