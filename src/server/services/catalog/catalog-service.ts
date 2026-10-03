import "server-only";

import type {
  TAdminProduct,
  TAdminVariant,
  TColor,
  TColorUpdate,
  TColorWrite,
  TProduct,
  TProductImage,
  TProductImageUpdate,
  TProductImageWrite,
  TProductUpdate,
  TProductWrite,
  TSize,
  TSizeUpdate,
  TSizeWrite,
  TVariantUpdate,
  TVariantWrite,
} from "@/features/catalog/schemas/catalog.schema";
import { AppError } from "@/lib/api/errors";
import type { TFieldError } from "@/lib/api/errors";
import type { TListQuery } from "@/lib/api/pagination";
import type { TProductType } from "@/constants/shop";
import {
  deleteVariant,
  findColorById,
  findProductById,
  findProductImageById,
  findPublishedProductBySlug,
  findSizeById,
  findVariantById,
  insertColor,
  insertProduct,
  insertProductImage,
  insertSize,
  insertVariant,
  listPublishedProducts,
  updateColor,
  updateProduct,
  updateProductImage,
  updateSize,
  updateVariant,
} from "@/server/repositories/catalog/catalog-repository";
import { postgresCode, rethrowUniqueViolation } from "@/server/postgres-error";

type TCatalogProduct = NonNullable<Awaited<ReturnType<typeof findPublishedProductBySlug>>>;

function assertCompareAtPrice(priceToman: number, compareAtPriceToman: number | null) {
  if (compareAtPriceToman !== null && compareAtPriceToman <= priceToman) {
    const details: TFieldError[] = [
      {
        field: "compareAtPriceToman",
        message: "Compare-at price must be higher than the price",
      },
    ];
    throw new AppError(
      "VALIDATION_ERROR",
      "Compare-at price must be higher than the price",
      details,
    );
  }
}

function definedFields<T extends Record<string, unknown>>(input: T) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
}

function toProduct(row: TCatalogProduct): TProduct {
  const variants = [...row.variants].sort((left, right) => {
    const sizeOrder = left.size.sortOrder - right.size.sortOrder;
    if (sizeOrder !== 0) {
      return sizeOrder;
    }

    return left.color.sortOrder - right.color.sortOrder;
  });

  return {
    id: row.id,
    type: row.type as TProduct["type"],
    slug: row.slug,
    titleFa: row.titleFa,
    titleEn: row.titleEn,
    descriptionFa: row.descriptionFa,
    descriptionEn: row.descriptionEn,
    priceToman: row.priceToman,
    compareAtPriceToman: row.compareAtPriceToman,
    images: row.images.map((image) => ({
      id: image.id,
      url: image.url,
      altFa: image.altFa,
      altEn: image.altEn,
      sortOrder: image.sortOrder,
      colorId: image.colorId,
    })),
    variants: variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      priceToman: variant.priceToman,
      color: {
        id: variant.color.id,
        nameFa: variant.color.nameFa,
        nameEn: variant.color.nameEn,
        hex: variant.color.hex,
      },
      size: {
        id: variant.size.id,
        code: variant.size.code,
        labelFa: variant.size.labelFa,
        labelEn: variant.size.labelEn,
      },
    })),
  };
}

function toColor(row: {
  id: string;
  nameFa: string;
  nameEn: string;
  hex: string;
  sortOrder: number;
}): TColor {
  return {
    id: row.id,
    nameFa: row.nameFa,
    nameEn: row.nameEn,
    hex: row.hex,
    sortOrder: row.sortOrder,
  };
}

function toSize(row: {
  id: string;
  code: string;
  labelFa: string;
  labelEn: string;
  sortOrder: number;
}): TSize {
  return {
    id: row.id,
    code: row.code,
    labelFa: row.labelFa,
    labelEn: row.labelEn,
    sortOrder: row.sortOrder,
  };
}

function toAdminProduct(row: {
  id: string;
  type: string;
  slug: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  priceToman: number;
  compareAtPriceToman: number | null;
  isPublished: boolean;
}): TAdminProduct {
  return {
    id: row.id,
    type: row.type as TAdminProduct["type"],
    slug: row.slug,
    titleFa: row.titleFa,
    titleEn: row.titleEn,
    descriptionFa: row.descriptionFa,
    descriptionEn: row.descriptionEn,
    priceToman: row.priceToman,
    compareAtPriceToman: row.compareAtPriceToman,
    isPublished: row.isPublished,
  };
}

function toImage(row: {
  id: string;
  url: string;
  altFa: string;
  altEn: string;
  sortOrder: number;
  colorId: string | null;
}): TProductImage {
  return {
    id: row.id,
    url: row.url,
    altFa: row.altFa,
    altEn: row.altEn,
    sortOrder: row.sortOrder,
    colorId: row.colorId,
  };
}

function toAdminVariant(row: {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  sku: string;
  stockQuantity: number;
  priceToman: number | null;
  isActive: boolean;
}): TAdminVariant {
  return {
    id: row.id,
    productId: row.productId,
    colorId: row.colorId,
    sizeId: row.sizeId,
    sku: row.sku,
    stockQuantity: row.stockQuantity,
    priceToman: row.priceToman,
    isActive: row.isActive,
  };
}

export async function listProducts(query: TListQuery & { type?: TProductType }) {
  const page = await listPublishedProducts({
    type: query.type,
    limit: query.pageSize,
    offset: (query.page - 1) * query.pageSize,
  });

  return {
    items: page.rows.map(toProduct),
    page: query.page,
    pageSize: query.pageSize,
    total: page.total,
  };
}

export async function getPublishedProduct(slug: string): Promise<TProduct> {
  const row = await findPublishedProductBySlug(slug);

  if (!row) {
    throw new AppError("NOT_FOUND", "Product was not found");
  }

  return toProduct(row);
}

export async function createColor(input: TColorWrite): Promise<TColor> {
  try {
    const row = await insertColor({
      nameFa: input.nameFa,
      nameEn: input.nameEn,
      hex: input.hex,
      sortOrder: input.sortOrder ?? 0,
    });
    return toColor(row);
  } catch (error) {
    rethrowUniqueViolation(error);
  }
}

export async function saveColor(colorId: string, input: TColorUpdate): Promise<TColor> {
  const current = await findColorById(colorId);

  if (!current) {
    throw new AppError("NOT_FOUND", "Color was not found");
  }

  const changes = definedFields(input);

  if (Object.keys(changes).length === 0) {
    return toColor(current);
  }

  try {
    const row = await updateColor(colorId, changes);
    if (!row) {
      throw new AppError("NOT_FOUND", "Color was not found");
    }
    return toColor(row);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    rethrowUniqueViolation(error);
  }
}

export async function createSize(input: TSizeWrite): Promise<TSize> {
  try {
    const row = await insertSize({
      code: input.code,
      labelFa: input.labelFa,
      labelEn: input.labelEn,
      sortOrder: input.sortOrder ?? 0,
    });
    return toSize(row);
  } catch (error) {
    rethrowUniqueViolation(error);
  }
}

export async function saveSize(sizeId: string, input: TSizeUpdate): Promise<TSize> {
  const current = await findSizeById(sizeId);

  if (!current) {
    throw new AppError("NOT_FOUND", "Size was not found");
  }

  const changes = definedFields(input);

  if (Object.keys(changes).length === 0) {
    return toSize(current);
  }

  try {
    const row = await updateSize(sizeId, changes);
    if (!row) {
      throw new AppError("NOT_FOUND", "Size was not found");
    }
    return toSize(row);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    rethrowUniqueViolation(error);
  }
}

export async function createProduct(input: TProductWrite): Promise<TAdminProduct> {
  const compareAtPriceToman = input.compareAtPriceToman ?? null;
  assertCompareAtPrice(input.priceToman, compareAtPriceToman);

  try {
    const row = await insertProduct({
      type: input.type,
      slug: input.slug,
      titleFa: input.titleFa,
      titleEn: input.titleEn,
      descriptionFa: input.descriptionFa ?? "",
      descriptionEn: input.descriptionEn ?? "",
      priceToman: input.priceToman,
      compareAtPriceToman,
      isPublished: input.isPublished ?? false,
    });
    return toAdminProduct(row);
  } catch (error) {
    rethrowUniqueViolation(error);
  }
}

export async function saveProduct(
  productId: string,
  input: TProductUpdate,
): Promise<TAdminProduct> {
  const current = await findProductById(productId);

  if (!current) {
    throw new AppError("NOT_FOUND", "Product was not found");
  }

  const priceToman = input.priceToman ?? current.priceToman;
  const compareAtPriceToman =
    input.compareAtPriceToman === undefined
      ? current.compareAtPriceToman
      : input.compareAtPriceToman;
  assertCompareAtPrice(priceToman, compareAtPriceToman);

  const changes = definedFields({
    ...input,
    compareAtPriceToman: input.compareAtPriceToman,
  });

  if (Object.keys(changes).length === 0) {
    return toAdminProduct(current);
  }

  try {
    const row = await updateProduct(productId, changes);
    if (!row) {
      throw new AppError("NOT_FOUND", "Product was not found");
    }
    return toAdminProduct(row);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    rethrowUniqueViolation(error);
  }
}

async function requireColor(colorId: string) {
  const row = await findColorById(colorId);

  if (!row) {
    throw new AppError("NOT_FOUND", "Color was not found");
  }
}

async function requireSize(sizeId: string) {
  const row = await findSizeById(sizeId);

  if (!row) {
    throw new AppError("NOT_FOUND", "Size was not found");
  }
}

export async function createProductImage(
  productId: string,
  input: TProductImageWrite,
): Promise<TProductImage> {
  const current = await findProductById(productId);

  if (!current) {
    throw new AppError("NOT_FOUND", "Product was not found");
  }

  if (input.colorId) {
    await requireColor(input.colorId);
  }

  const row = await insertProductImage({
    productId,
    colorId: input.colorId ?? null,
    url: input.url,
    altFa: input.altFa ?? "",
    altEn: input.altEn ?? "",
    sortOrder: input.sortOrder ?? 0,
  });

  return toImage(row);
}

export async function saveProductImage(
  imageId: string,
  input: TProductImageUpdate,
): Promise<TProductImage> {
  const current = await findProductImageById(imageId);

  if (!current) {
    throw new AppError("NOT_FOUND", "Image was not found");
  }

  if (input.colorId) {
    await requireColor(input.colorId);
  }

  const changes = definedFields(input);

  if (Object.keys(changes).length === 0) {
    return toImage(current);
  }

  const row = await updateProductImage(imageId, changes);

  if (!row) {
    throw new AppError("NOT_FOUND", "Image was not found");
  }

  return toImage(row);
}

export async function createProductVariant(
  productId: string,
  input: TVariantWrite,
): Promise<TAdminVariant> {
  const current = await findProductById(productId);

  if (!current) {
    throw new AppError("NOT_FOUND", "Product was not found");
  }

  await requireColor(input.colorId);
  await requireSize(input.sizeId);

  try {
    const row = await insertVariant({
      productId,
      colorId: input.colorId,
      sizeId: input.sizeId,
      sku: input.sku,
      stockQuantity: input.stockQuantity,
      priceToman: input.priceToman ?? null,
      isActive: input.isActive ?? true,
    });
    return toAdminVariant(row);
  } catch (error) {
    rethrowUniqueViolation(error);
  }
}

export async function saveProductVariant(
  variantId: string,
  input: TVariantUpdate,
): Promise<TAdminVariant> {
  const current = await findVariantById(variantId);

  if (!current) {
    throw new AppError("NOT_FOUND", "Variant was not found");
  }

  if (input.colorId) {
    await requireColor(input.colorId);
  }

  if (input.sizeId) {
    await requireSize(input.sizeId);
  }

  const changes = definedFields(input);

  if (Object.keys(changes).length === 0) {
    return toAdminVariant(current);
  }

  try {
    const row = await updateVariant(variantId, changes);
    if (!row) {
      throw new AppError("NOT_FOUND", "Variant was not found");
    }
    return toAdminVariant(row);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    rethrowUniqueViolation(error);
  }
}

export async function removeProductVariant(variantId: string) {
  try {
    const row = await deleteVariant(variantId);

    if (!row) {
      throw new AppError("NOT_FOUND", "Variant was not found");
    }

    return { id: row.id };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (postgresCode(error) === "23503") {
      throw new AppError("CONFLICT", "Deactivate this variant instead of deleting it");
    }

    throw error;
  }
}
