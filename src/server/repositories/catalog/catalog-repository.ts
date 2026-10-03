import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import type { TProductType } from "@/constants/shop";
import { db, type TDatabase, type TTransaction } from "@/db";
import { color, product, productImage, productVariant, size } from "@/db/schema";

type TExecutor = TDatabase | TTransaction;

type TListProductsInput = {
  type?: TProductType;
  limit: number;
  offset: number;
};

export async function listPublishedProducts(input: TListProductsInput) {
  const filters = [eq(product.isPublished, true)];

  if (input.type) {
    filters.push(eq(product.type, input.type));
  }

  const where = and(...filters);
  const totalRows = await db.select({ total: count() }).from(product).where(where);
  const rows = await db.query.product.findMany({
    where,
    with: {
      images: {
        orderBy: (image, operators) => [operators.asc(image.sortOrder)],
      },
      variants: {
        where: eq(productVariant.isActive, true),
        with: {
          color: true,
          size: true,
        },
      },
    },
    orderBy: [desc(product.createdAt)],
    limit: input.limit,
    offset: input.offset,
  });

  return {
    total: Number(totalRows[0]?.total ?? 0),
    rows,
  };
}

export async function findPublishedProductBySlug(slug: string) {
  return db.query.product.findFirst({
    where: and(eq(product.slug, slug), eq(product.isPublished, true)),
    with: {
      images: {
        orderBy: (image, operators) => [operators.asc(image.sortOrder)],
      },
      variants: {
        where: eq(productVariant.isActive, true),
        with: {
          color: true,
          size: true,
        },
      },
    },
  });
}

export async function findColorById(colorId: string) {
  const rows = await db.select().from(color).where(eq(color.id, colorId)).limit(1);
  return rows[0] ?? null;
}

export async function insertColor(input: {
  nameFa: string;
  nameEn: string;
  hex: string;
  sortOrder: number;
}) {
  const rows = await db.insert(color).values(input).returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Color insert did not return a row");
  }

  return saved;
}

export async function updateColor(
  colorId: string,
  input: Partial<{ nameFa: string; nameEn: string; hex: string; sortOrder: number }>,
) {
  const rows = await db.update(color).set(input).where(eq(color.id, colorId)).returning();
  return rows[0] ?? null;
}

export async function findSizeById(sizeId: string) {
  const rows = await db.select().from(size).where(eq(size.id, sizeId)).limit(1);
  return rows[0] ?? null;
}

export async function insertSize(input: {
  code: string;
  labelFa: string;
  labelEn: string;
  sortOrder: number;
}) {
  const rows = await db.insert(size).values(input).returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Size insert did not return a row");
  }

  return saved;
}

export async function updateSize(
  sizeId: string,
  input: Partial<{ code: string; labelFa: string; labelEn: string; sortOrder: number }>,
) {
  const rows = await db.update(size).set(input).where(eq(size.id, sizeId)).returning();
  return rows[0] ?? null;
}

export async function findProductById(productId: string) {
  const rows = await db.select().from(product).where(eq(product.id, productId)).limit(1);
  return rows[0] ?? null;
}

export async function insertProduct(input: {
  type: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  priceToman: number;
  compareAtPriceToman: number | null;
  isPublished: boolean;
}) {
  const rows = await db.insert(product).values(input).returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Product insert did not return a row");
  }

  return saved;
}

export async function updateProduct(
  productId: string,
  input: Partial<{
    type: string;
    slug: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
    priceToman: number;
    compareAtPriceToman: number | null;
    isPublished: boolean;
  }>,
) {
  const rows = await db.update(product).set(input).where(eq(product.id, productId)).returning();
  return rows[0] ?? null;
}

export async function findProductImageById(imageId: string) {
  const rows = await db.select().from(productImage).where(eq(productImage.id, imageId)).limit(1);
  return rows[0] ?? null;
}

export async function insertProductImage(input: {
  productId: string;
  colorId: string | null;
  url: string;
  altFa: string;
  altEn: string;
  sortOrder: number;
}) {
  const rows = await db.insert(productImage).values(input).returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Product image insert did not return a row");
  }

  return saved;
}

export async function updateProductImage(
  imageId: string,
  input: Partial<{
    colorId: string | null;
    url: string;
    altFa: string;
    altEn: string;
    sortOrder: number;
  }>,
) {
  const rows = await db
    .update(productImage)
    .set(input)
    .where(eq(productImage.id, imageId))
    .returning();
  return rows[0] ?? null;
}

export async function findVariantById(variantId: string) {
  const rows = await db
    .select()
    .from(productVariant)
    .where(eq(productVariant.id, variantId))
    .limit(1);
  return rows[0] ?? null;
}

export async function findPurchasableVariant(executor: TExecutor, variantId: string) {
  const rows = await executor
    .select({
      id: productVariant.id,
      stockQuantity: productVariant.stockQuantity,
      isActive: productVariant.isActive,
      isPublished: product.isPublished,
    })
    .from(productVariant)
    .innerJoin(product, eq(productVariant.productId, product.id))
    .where(eq(productVariant.id, variantId))
    .limit(1)
    .for("update");

  return rows[0] ?? null;
}

export async function insertVariant(input: {
  productId: string;
  colorId: string;
  sizeId: string;
  sku: string;
  stockQuantity: number;
  priceToman: number | null;
  isActive: boolean;
}) {
  const rows = await db.insert(productVariant).values(input).returning();
  const saved = rows[0];

  if (!saved) {
    throw new Error("Variant insert did not return a row");
  }

  return saved;
}

export async function updateVariant(
  variantId: string,
  input: Partial<{
    colorId: string;
    sizeId: string;
    sku: string;
    stockQuantity: number;
    priceToman: number | null;
    isActive: boolean;
  }>,
) {
  const rows = await db
    .update(productVariant)
    .set(input)
    .where(eq(productVariant.id, variantId))
    .returning();
  return rows[0] ?? null;
}

export async function deleteVariant(variantId: string) {
  const rows = await db
    .delete(productVariant)
    .where(eq(productVariant.id, variantId))
    .returning({ id: productVariant.id });
  return rows[0] ?? null;
}
