import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { PRODUCT_TYPES } from "@/constants/shop";

import { sqlStringList, timestampColumns } from "./sql";

export const color = pgTable(
  "color",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nameFa: text("name_fa").notNull().unique(),
    nameEn: text("name_en").notNull().unique(),
    hex: text("hex").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [
    check("color_hex_check", sql`${table.hex} ~ '^#[0-9A-Fa-f]{6}$'`),
    check("color_name_fa_check", sql`char_length(${table.nameFa}) > 0`),
    check("color_name_en_check", sql`char_length(${table.nameEn}) > 0`),
  ],
);

export const size = pgTable(
  "size",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull().unique(),
    labelFa: text("label_fa").notNull(),
    labelEn: text("label_en").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [
    check("size_code_check", sql`char_length(${table.code}) > 0`),
    check("size_label_fa_check", sql`char_length(${table.labelFa}) > 0`),
    check("size_label_en_check", sql`char_length(${table.labelEn}) > 0`),
  ],
);

export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    slug: text("slug").notNull().unique(),
    titleFa: text("title_fa").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionFa: text("description_fa").notNull().default(""),
    descriptionEn: text("description_en").notNull().default(""),
    priceToman: integer("price_toman").notNull(),
    compareAtPriceToman: integer("compare_at_price_toman"),
    isPublished: boolean("is_published").notNull().default(false),
    ...timestampColumns(),
  },
  (table) => [
    index("product_type_published_idx").on(table.type, table.isPublished),
    check("product_type_check", sql`${table.type} in (${sqlStringList(PRODUCT_TYPES)})`),
    check("product_slug_check", sql`char_length(${table.slug}) > 0`),
    check("product_title_fa_check", sql`char_length(${table.titleFa}) > 0`),
    check("product_title_en_check", sql`char_length(${table.titleEn}) > 0`),
    check("product_price_check", sql`${table.priceToman} >= 0`),
    check(
      "product_compare_at_price_check",
      sql`${table.compareAtPriceToman} is null or ${table.compareAtPriceToman} > ${table.priceToman}`,
    ),
  ],
);

export const productImage = pgTable(
  "product_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    colorId: uuid("color_id").references(() => color.id, { onDelete: "restrict" }),
    url: text("url").notNull(),
    altFa: text("alt_fa").notNull().default(""),
    altEn: text("alt_en").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("product_image_product_id_idx").on(table.productId),
    check("product_image_url_check", sql`char_length(${table.url}) > 0`),
  ],
);

export const productVariant = pgTable(
  "product_variant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    colorId: uuid("color_id")
      .notNull()
      .references(() => color.id, { onDelete: "restrict" }),
    sizeId: uuid("size_id")
      .notNull()
      .references(() => size.id, { onDelete: "restrict" }),
    sku: text("sku").notNull().unique(),
    stockQuantity: integer("stock_quantity").notNull(),
    priceToman: integer("price_toman"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestampColumns(),
  },
  (table) => [
    unique("product_variant_product_color_size_unique").on(
      table.productId,
      table.colorId,
      table.sizeId,
    ),
    check("product_variant_sku_check", sql`char_length(${table.sku}) > 0`),
    check("product_variant_stock_check", sql`${table.stockQuantity} >= 0`),
    check(
      "product_variant_price_check",
      sql`${table.priceToman} is null or ${table.priceToman} >= 0`,
    ),
  ],
);

export const colorRelations = relations(color, ({ many }) => ({
  variants: many(productVariant),
  images: many(productImage),
}));

export const sizeRelations = relations(size, ({ many }) => ({
  variants: many(productVariant),
}));

export const productRelations = relations(product, ({ many }) => ({
  images: many(productImage),
  variants: many(productVariant),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, {
    fields: [productImage.productId],
    references: [product.id],
  }),
  color: one(color, {
    fields: [productImage.colorId],
    references: [color.id],
  }),
}));

export const productVariantRelations = relations(productVariant, ({ one }) => ({
  product: one(product, {
    fields: [productVariant.productId],
    references: [product.id],
  }),
  color: one(color, {
    fields: [productVariant.colorId],
    references: [color.id],
  }),
  size: one(size, {
    fields: [productVariant.sizeId],
    references: [size.id],
  }),
}));
