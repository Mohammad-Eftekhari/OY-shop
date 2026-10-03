CREATE SEQUENCE "public"."order_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 10000 CACHE 1;--> statement-breakpoint
CREATE TABLE "address" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"receiver_name" text NOT NULL,
	"mobile" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"address_line" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "address_receiver_name_check" CHECK (char_length("address"."receiver_name") > 0),
	CONSTRAINT "address_mobile_check" CHECK ("address"."mobile" ~ '^09[0-9]{9}$'),
	CONSTRAINT "address_province_check" CHECK (char_length("address"."province") > 0),
	CONSTRAINT "address_city_check" CHECK (char_length("address"."city") > 0),
	CONSTRAINT "address_postal_code_check" CHECK ("address"."postal_code" ~ '^[0-9]{10}$'),
	CONSTRAINT "address_line_check" CHECK (char_length("address"."address_line") > 0)
);
--> statement-breakpoint
CREATE TABLE "cart" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "cart_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cart_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cart_item_cart_variant_unique" UNIQUE("cart_id","variant_id"),
	CONSTRAINT "cart_item_quantity_check" CHECK ("cart_item"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "color" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_fa" text NOT NULL,
	"name_en" text NOT NULL,
	"hex" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "color_name_fa_unique" UNIQUE("name_fa"),
	CONSTRAINT "color_name_en_unique" UNIQUE("name_en"),
	CONSTRAINT "color_hex_check" CHECK ("color"."hex" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "color_name_fa_check" CHECK (char_length("color"."name_fa") > 0),
	CONSTRAINT "color_name_en_check" CHECK (char_length("color"."name_en") > 0)
);
--> statement-breakpoint
CREATE TABLE "customer_order" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text DEFAULT ('OY-' || nextval('order_number_seq')) NOT NULL,
	"user_id" text NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"subtotal_toman" integer NOT NULL,
	"shipping_toman" integer NOT NULL,
	"discount_toman" integer DEFAULT 0 NOT NULL,
	"total_toman" integer NOT NULL,
	"shipping_method_id" uuid,
	"shipping_name_fa" text NOT NULL,
	"shipping_name_en" text NOT NULL,
	"address_id" uuid,
	"receiver_name" text NOT NULL,
	"mobile" text NOT NULL,
	"province" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"address_line" text NOT NULL,
	"payment_expires_at" timestamp with time zone NOT NULL,
	"tracking_code" text,
	"paid_at" timestamp with time zone,
	"shipped_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_order_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "customer_order_status_check" CHECK ("customer_order"."status" in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed')),
	CONSTRAINT "customer_order_total_check" CHECK ("customer_order"."subtotal_toman" >= 0 and "customer_order"."shipping_toman" >= 0 and "customer_order"."discount_toman" >= 0 and "customer_order"."total_toman" >= 0 and "customer_order"."total_toman" = "customer_order"."subtotal_toman" + "customer_order"."shipping_toman" - "customer_order"."discount_toman"),
	CONSTRAINT "customer_order_shipping_name_fa_check" CHECK (char_length("customer_order"."shipping_name_fa") > 0),
	CONSTRAINT "customer_order_shipping_name_en_check" CHECK (char_length("customer_order"."shipping_name_en") > 0),
	CONSTRAINT "customer_order_receiver_name_check" CHECK (char_length("customer_order"."receiver_name") > 0),
	CONSTRAINT "customer_order_mobile_check" CHECK ("customer_order"."mobile" ~ '^09[0-9]{9}$'),
	CONSTRAINT "customer_order_province_check" CHECK (char_length("customer_order"."province") > 0),
	CONSTRAINT "customer_order_city_check" CHECK (char_length("customer_order"."city") > 0),
	CONSTRAINT "customer_order_postal_code_check" CHECK ("customer_order"."postal_code" ~ '^[0-9]{10}$'),
	CONSTRAINT "customer_order_address_line_check" CHECK (char_length("customer_order"."address_line") > 0)
);
--> statement-breakpoint
CREATE TABLE "order_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"variant_id" uuid NOT NULL,
	"product_title_fa" text NOT NULL,
	"product_title_en" text NOT NULL,
	"product_type" text NOT NULL,
	"color_name_fa" text NOT NULL,
	"color_name_en" text NOT NULL,
	"color_hex" text NOT NULL,
	"size_code" text NOT NULL,
	"sku" text NOT NULL,
	"unit_price_toman" integer NOT NULL,
	"quantity" integer NOT NULL,
	"line_total_toman" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_item_product_type_check" CHECK ("order_item"."product_type" in ('tshirt', 'hoodie')),
	CONSTRAINT "order_item_title_fa_check" CHECK (char_length("order_item"."product_title_fa") > 0),
	CONSTRAINT "order_item_title_en_check" CHECK (char_length("order_item"."product_title_en") > 0),
	CONSTRAINT "order_item_color_name_fa_check" CHECK (char_length("order_item"."color_name_fa") > 0),
	CONSTRAINT "order_item_color_name_en_check" CHECK (char_length("order_item"."color_name_en") > 0),
	CONSTRAINT "order_item_color_hex_check" CHECK ("order_item"."color_hex" ~ '^#[0-9A-Fa-f]{6}$'),
	CONSTRAINT "order_item_size_code_check" CHECK (char_length("order_item"."size_code") > 0),
	CONSTRAINT "order_item_sku_check" CHECK (char_length("order_item"."sku") > 0),
	CONSTRAINT "order_item_line_total_check" CHECK ("order_item"."quantity" > 0 and "order_item"."unit_price_toman" >= 0 and "order_item"."line_total_toman" = "order_item"."unit_price_toman" * "order_item"."quantity")
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"amount_toman" integer NOT NULL,
	"provider" text NOT NULL,
	"authority" text,
	"reference_id" text,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_status_check" CHECK ("payment"."status" in ('pending', 'succeeded', 'failed')),
	CONSTRAINT "payment_amount_check" CHECK ("payment"."amount_toman" >= 0),
	CONSTRAINT "payment_provider_check" CHECK (char_length("payment"."provider") > 0)
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"slug" text NOT NULL,
	"title_fa" text NOT NULL,
	"title_en" text NOT NULL,
	"description_fa" text DEFAULT '' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"price_toman" integer NOT NULL,
	"compare_at_price_toman" integer,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_slug_unique" UNIQUE("slug"),
	CONSTRAINT "product_type_check" CHECK ("product"."type" in ('tshirt', 'hoodie')),
	CONSTRAINT "product_slug_check" CHECK (char_length("product"."slug") > 0),
	CONSTRAINT "product_title_fa_check" CHECK (char_length("product"."title_fa") > 0),
	CONSTRAINT "product_title_en_check" CHECK (char_length("product"."title_en") > 0),
	CONSTRAINT "product_price_check" CHECK ("product"."price_toman" >= 0),
	CONSTRAINT "product_compare_at_price_check" CHECK ("product"."compare_at_price_toman" is null or "product"."compare_at_price_toman" > "product"."price_toman")
);
--> statement-breakpoint
CREATE TABLE "product_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"color_id" uuid,
	"url" text NOT NULL,
	"alt_fa" text DEFAULT '' NOT NULL,
	"alt_en" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_image_url_check" CHECK (char_length("product_image"."url") > 0)
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"color_id" uuid NOT NULL,
	"size_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"stock_quantity" integer NOT NULL,
	"price_toman" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_variant_sku_unique" UNIQUE("sku"),
	CONSTRAINT "product_variant_product_color_size_unique" UNIQUE("product_id","color_id","size_id"),
	CONSTRAINT "product_variant_sku_check" CHECK (char_length("product_variant"."sku") > 0),
	CONSTRAINT "product_variant_stock_check" CHECK ("product_variant"."stock_quantity" >= 0),
	CONSTRAINT "product_variant_price_check" CHECK ("product_variant"."price_toman" is null or "product_variant"."price_toman" >= 0)
);
--> statement-breakpoint
CREATE TABLE "shipping_method" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_fa" text NOT NULL,
	"name_en" text NOT NULL,
	"price_toman" integer NOT NULL,
	"estimated_days_min" integer NOT NULL,
	"estimated_days_max" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipping_method_name_fa_check" CHECK (char_length("shipping_method"."name_fa") > 0),
	CONSTRAINT "shipping_method_name_en_check" CHECK (char_length("shipping_method"."name_en") > 0),
	CONSTRAINT "shipping_method_price_check" CHECK ("shipping_method"."price_toman" >= 0),
	CONSTRAINT "shipping_method_days_check" CHECK ("shipping_method"."estimated_days_min" >= 0 and "shipping_method"."estimated_days_max" >= "shipping_method"."estimated_days_min")
);
--> statement-breakpoint
CREATE TABLE "size" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"label_fa" text NOT NULL,
	"label_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "size_code_unique" UNIQUE("code"),
	CONSTRAINT "size_code_check" CHECK (char_length("size"."code") > 0),
	CONSTRAINT "size_label_fa_check" CHECK (char_length("size"."label_fa") > 0),
	CONSTRAINT "size_label_en_check" CHECK (char_length("size"."label_en") > 0)
);
--> statement-breakpoint
ALTER TABLE "address" ADD CONSTRAINT "address_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cart_id_cart_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_shipping_method_id_shipping_method_id_fk" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."shipping_method"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_order" ADD CONSTRAINT "customer_order_address_id_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_order_id_customer_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."customer_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_variant_id_product_variant_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_order_id_customer_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."customer_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_color_id_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."color"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_color_id_color_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."color"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_size_id_size_id_fk" FOREIGN KEY ("size_id") REFERENCES "public"."size"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "address_user_id_idx" ON "address" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "address_one_default_per_user" ON "address" USING btree ("user_id") WHERE "address"."is_default" = true;--> statement-breakpoint
CREATE INDEX "cart_item_variant_id_idx" ON "cart_item" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "customer_order_user_id_idx" ON "customer_order" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "customer_order_status_idx" ON "customer_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_item_order_id_idx" ON "order_item" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_item_variant_id_idx" ON "order_item" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "payment_order_id_idx" ON "payment" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_authority_unique" ON "payment" USING btree ("authority") WHERE "payment"."authority" is not null;--> statement-breakpoint
CREATE INDEX "product_type_published_idx" ON "product" USING btree ("type","is_published");--> statement-breakpoint
CREATE INDEX "product_image_product_id_idx" ON "product_image" USING btree ("product_id");