import {
  paginatedProductsSchema,
  productListQuerySchema,
} from "@/features/catalog/schemas/catalog.schema";
import { handleRoute, jsonSuccess } from "@/lib/api/response";
import { listProducts } from "@/server/services/catalog/catalog-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const url = new URL(request.url);
    const query = productListQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      pageSize: url.searchParams.get("pageSize") ?? undefined,
      type: url.searchParams.get("type") ?? undefined,
    });
    const products = await listProducts(query);

    return jsonSuccess(paginatedProductsSchema.parse(products));
  });
}
