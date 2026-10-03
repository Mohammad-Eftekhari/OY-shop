import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgSequence,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { ORDER_STATUSES, PAYMENT_STATUSES, PRODUCT_TYPES } from "@/constants/shop";

import { user } from "./auth";
import { productVariant } from "./catalog";
import { sqlStringList, timestampColumns } from "./sql";

export const orderNumberSequence = pgSequence("order_number_seq", {
  startWith: 10000,
  increment: 1,
});

export const shippingMethod = pgTable(
  "shipping_method",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nameFa: text("name_fa").notNull(),
    nameEn: text("name_en").notNull(),
    priceToman: integer("price_toman").notNull(),
    estimatedDaysMin: integer("estimated_days_min").notNull(),
    estimatedDaysMax: integer("estimated_days_max").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestampColumns(),
  },
  (table) => [
    check("shipping_method_name_fa_check", sql`char_length(${table.nameFa}) > 0`),
    check("shipping_method_name_en_check", sql`char_length(${table.nameEn}) > 0`),
    check("shipping_method_price_check", sql`${table.priceToman} >= 0`),
    check(
      "shipping_method_days_check",
      sql`${table.estimatedDaysMin} >= 0 and ${table.estimatedDaysMax} >= ${table.estimatedDaysMin}`,
    ),
  ],
);

export const address = pgTable(
  "address",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    receiverName: text("receiver_name").notNull(),
    mobile: text("mobile").notNull(),
    province: text("province").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    addressLine: text("address_line").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    ...timestampColumns(),
  },
  (table) => [
    index("address_user_id_idx").on(table.userId),
    uniqueIndex("address_one_default_per_user")
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),
    check("address_receiver_name_check", sql`char_length(${table.receiverName}) > 0`),
    check("address_mobile_check", sql`${table.mobile} ~ '^09[0-9]{9}$'`),
    check("address_province_check", sql`char_length(${table.province}) > 0`),
    check("address_city_check", sql`char_length(${table.city}) > 0`),
    check("address_postal_code_check", sql`${table.postalCode} ~ '^[0-9]{10}$'`),
    check("address_line_check", sql`char_length(${table.addressLine}) > 0`),
  ],
);

export const cart = pgTable("cart", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  ...timestampColumns(),
});

export const cartItem = pgTable(
  "cart_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => cart.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    ...timestampColumns(),
  },
  (table) => [
    unique("cart_item_cart_variant_unique").on(table.cartId, table.variantId),
    index("cart_item_variant_id_idx").on(table.variantId),
    check("cart_item_quantity_check", sql`${table.quantity} > 0`),
  ],
);

export const customerOrder = pgTable(
  "customer_order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNumber: text("order_number")
      .notNull()
      .unique()
      .default(sql`('OY-' || nextval('order_number_seq'))`),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("pending_payment"),
    subtotalToman: integer("subtotal_toman").notNull(),
    shippingToman: integer("shipping_toman").notNull(),
    discountToman: integer("discount_toman").notNull().default(0),
    totalToman: integer("total_toman").notNull(),
    shippingMethodId: uuid("shipping_method_id").references(() => shippingMethod.id, {
      onDelete: "set null",
    }),
    shippingNameFa: text("shipping_name_fa").notNull(),
    shippingNameEn: text("shipping_name_en").notNull(),
    addressId: uuid("address_id").references(() => address.id, { onDelete: "set null" }),
    receiverName: text("receiver_name").notNull(),
    mobile: text("mobile").notNull(),
    province: text("province").notNull(),
    city: text("city").notNull(),
    postalCode: text("postal_code").notNull(),
    addressLine: text("address_line").notNull(),
    paymentExpiresAt: timestamp("payment_expires_at", { withTimezone: true }).notNull(),
    trackingCode: text("tracking_code"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestampColumns(),
  },
  (table) => [
    index("customer_order_user_id_idx").on(table.userId),
    index("customer_order_status_idx").on(table.status),
    check(
      "customer_order_status_check",
      sql`${table.status} in (${sqlStringList(ORDER_STATUSES)})`,
    ),
    check(
      "customer_order_total_check",
      sql`${table.subtotalToman} >= 0 and ${table.shippingToman} >= 0 and ${table.discountToman} >= 0 and ${table.totalToman} >= 0 and ${table.totalToman} = ${table.subtotalToman} + ${table.shippingToman} - ${table.discountToman}`,
    ),
    check("customer_order_shipping_name_fa_check", sql`char_length(${table.shippingNameFa}) > 0`),
    check("customer_order_shipping_name_en_check", sql`char_length(${table.shippingNameEn}) > 0`),
    check("customer_order_receiver_name_check", sql`char_length(${table.receiverName}) > 0`),
    check("customer_order_mobile_check", sql`${table.mobile} ~ '^09[0-9]{9}$'`),
    check("customer_order_province_check", sql`char_length(${table.province}) > 0`),
    check("customer_order_city_check", sql`char_length(${table.city}) > 0`),
    check("customer_order_postal_code_check", sql`${table.postalCode} ~ '^[0-9]{10}$'`),
    check("customer_order_address_line_check", sql`char_length(${table.addressLine}) > 0`),
  ],
);

export const orderItem = pgTable(
  "order_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => customerOrder.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id, { onDelete: "restrict" }),
    productTitleFa: text("product_title_fa").notNull(),
    productTitleEn: text("product_title_en").notNull(),
    productType: text("product_type").notNull(),
    colorNameFa: text("color_name_fa").notNull(),
    colorNameEn: text("color_name_en").notNull(),
    colorHex: text("color_hex").notNull(),
    sizeCode: text("size_code").notNull(),
    sku: text("sku").notNull(),
    unitPriceToman: integer("unit_price_toman").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalToman: integer("line_total_toman").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("order_item_order_id_idx").on(table.orderId),
    index("order_item_variant_id_idx").on(table.variantId),
    check(
      "order_item_product_type_check",
      sql`${table.productType} in (${sqlStringList(PRODUCT_TYPES)})`,
    ),
    check("order_item_title_fa_check", sql`char_length(${table.productTitleFa}) > 0`),
    check("order_item_title_en_check", sql`char_length(${table.productTitleEn}) > 0`),
    check("order_item_color_name_fa_check", sql`char_length(${table.colorNameFa}) > 0`),
    check("order_item_color_name_en_check", sql`char_length(${table.colorNameEn}) > 0`),
    check("order_item_color_hex_check", sql`${table.colorHex} ~ '^#[0-9A-Fa-f]{6}$'`),
    check("order_item_size_code_check", sql`char_length(${table.sizeCode}) > 0`),
    check("order_item_sku_check", sql`char_length(${table.sku}) > 0`),
    check(
      "order_item_line_total_check",
      sql`${table.quantity} > 0 and ${table.unitPriceToman} >= 0 and ${table.lineTotalToman} = ${table.unitPriceToman} * ${table.quantity}`,
    ),
  ],
);

export const payment = pgTable(
  "payment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => customerOrder.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("pending"),
    amountToman: integer("amount_toman").notNull(),
    provider: text("provider").notNull(),
    authority: text("authority"),
    referenceId: text("reference_id"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestampColumns(),
  },
  (table) => [
    index("payment_order_id_idx").on(table.orderId),
    uniqueIndex("payment_authority_unique")
      .on(table.authority)
      .where(sql`${table.authority} is not null`),
    check("payment_status_check", sql`${table.status} in (${sqlStringList(PAYMENT_STATUSES)})`),
    check("payment_amount_check", sql`${table.amountToman} >= 0`),
    check("payment_provider_check", sql`char_length(${table.provider}) > 0`),
  ],
);

export const shippingMethodRelations = relations(shippingMethod, ({ many }) => ({
  orders: many(customerOrder),
}));

export const addressRelations = relations(address, ({ one, many }) => ({
  user: one(user, {
    fields: [address.userId],
    references: [user.id],
  }),
  orders: many(customerOrder),
}));

export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, {
    fields: [cart.userId],
    references: [user.id],
  }),
  items: many(cartItem),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart, {
    fields: [cartItem.cartId],
    references: [cart.id],
  }),
  variant: one(productVariant, {
    fields: [cartItem.variantId],
    references: [productVariant.id],
  }),
}));

export const customerOrderRelations = relations(customerOrder, ({ one, many }) => ({
  user: one(user, {
    fields: [customerOrder.userId],
    references: [user.id],
  }),
  shippingMethod: one(shippingMethod, {
    fields: [customerOrder.shippingMethodId],
    references: [shippingMethod.id],
  }),
  address: one(address, {
    fields: [customerOrder.addressId],
    references: [address.id],
  }),
  items: many(orderItem),
  payments: many(payment),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(customerOrder, {
    fields: [orderItem.orderId],
    references: [customerOrder.id],
  }),
  variant: one(productVariant, {
    fields: [orderItem.variantId],
    references: [productVariant.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  order: one(customerOrder, {
    fields: [payment.orderId],
    references: [customerOrder.id],
  }),
}));
