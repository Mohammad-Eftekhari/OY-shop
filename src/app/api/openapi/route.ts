import { readFile } from "node:fs/promises";
import path from "node:path";

import { handleRoute } from "@/lib/api/response";

export const dynamic = "force-dynamic";

export async function GET() {
  return handleRoute(async () => {
    const document = await readFile(path.join(process.cwd(), "docs/openapi.yaml"), "utf8");

    return new Response(document, {
      headers: {
        "content-type": "application/yaml; charset=utf-8",
      },
    });
  });
}
