# Data Model: Shop Catalog and Checkout

Money columns are integers in toman. Shopper-facing names are stored in Persian and English. Account tables from the foundation (`user`, `session`, `account`, `verification`, `profile`) are unchanged.

## Color (`color`)

Reusable swatch. A design references a color through its variants and, optionally, through its photos.

| Field     | Rules                                                |
| --------- | ---------------------------------------------------- |
| id        | Primary key, UUID                                    |
| nameFa    | Required Persian name, unique                        |
| nameEn    | Required English name, unique                        |
| hex       | Required text matching `#` plus 6 hex digits         |
| sortOrder | Required integer, default 0                          |
| createdAt | Timestamp with time zone, default now                |
| updatedAt | Timestamp with time zone, default now, set on update |

## Size (`size`)

Shared scale for both garment types. A design that does not offer a size has no variant for it.

| Field     | Rules                                                |
| --------- | ---------------------------------------------------- |
| id        | Primary key, UUID                                    |
| code      | Required text, unique, such as `S`, `M`, `L`, `XL`   |
| labelFa   | Required Persian label                               |
| labelEn   | Required English label                               |
| sortOrder | Required integer, default 0                          |
| createdAt | Timestamp with time zone, default now                |
| updatedAt | Timestamp with time zone, default now, set on update |

## Product (`product`)

One design. The type is the garment.

| Field               | Rules                                                                |
| ------------------- | -------------------------------------------------------------------- |
| id                  | Primary key, UUID                                                    |
| type                | Required text. Allowed values: `tshirt`, `hoodie`                    |
| slug                | Required text, unique, non-empty                                     |
| titleFa, titleEn    | Required text, non-empty                                             |
| descriptionFa       | Required text, empty string allowed                                  |
| descriptionEn       | Required text, empty string allowed                                  |
| priceToman          | Required integer, greater than or equal to 0                         |
| compareAtPriceToman | Optional integer. When present, it must be greater than `priceToman` |
| isPublished         | Required boolean, default false                                      |
| createdAt           | Timestamp with time zone, default now                                |
| updatedAt           | Timestamp with time zone, default now, set on update                 |

## Product image (`product_image`)

| Field     | Rules                                                |
| --------- | ---------------------------------------------------- |
| id        | Primary key, UUID                                    |
| productId | Required foreign key to `product.id`, cascade delete |
| colorId   | Optional foreign key to `color.id`, restrict delete  |
| url       | Required text, non-empty                             |
| altFa     | Required text, empty string allowed                  |
| altEn     | Required text, empty string allowed                  |
| sortOrder | Required integer, default 0                          |
| createdAt | Timestamp with time zone, default now                |

A null `colorId` means the photo shows the design in general. A set `colorId` means the photo shows that color.

## Product variant (`product_variant`)

The sellable unit: one design, one color, and one size.

| Field         | Rules                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| id            | Primary key, UUID                                                         |
| productId     | Required foreign key to `product.id`, cascade delete                      |
| colorId       | Required foreign key to `color.id`, restrict delete                       |
| sizeId        | Required foreign key to `size.id`, restrict delete                        |
| sku           | Required text, unique, non-empty                                          |
| stockQuantity | Required integer, greater than or equal to 0                              |
| priceToman    | Optional integer, greater than or equal to 0. Null uses the product price |
| isActive      | Required boolean, default true                                            |
| createdAt     | Timestamp with time zone, default now                                     |
| updatedAt     | Timestamp with time zone, default now, set on update                      |

The combination of `productId`, `colorId`, and `sizeId` is unique.

## Shipping method (`shipping_method`)

Flat price for this version. City-based rates are a later table.

| Field            | Rules                                                         |
| ---------------- | ------------------------------------------------------------- |
| id               | Primary key, UUID                                             |
| nameFa, nameEn   | Required text, non-empty                                      |
| priceToman       | Required integer, greater than or equal to 0                  |
| estimatedDaysMin | Required integer, greater than or equal to 0                  |
| estimatedDaysMax | Required integer, greater than or equal to `estimatedDaysMin` |
| isActive         | Required boolean, default true                                |
| sortOrder        | Required integer, default 0                                   |
| createdAt        | Timestamp with time zone, default now                         |
| updatedAt        | Timestamp with time zone, default now, set on update          |

## Address (`address`)

A saved Iranian delivery address for one account.

| Field        | Rules                                                                    |
| ------------ | ------------------------------------------------------------------------ |
| id           | Primary key, UUID                                                        |
| userId       | Required foreign key to `user.id`, cascade delete                        |
| receiverName | Required text, non-empty                                                 |
| mobile       | Required text matching `09` plus 9 digits                                |
| province     | Required text, non-empty                                                 |
| city         | Required text, non-empty                                                 |
| postalCode   | Required text, 10 digits                                                 |
| addressLine  | Required text, non-empty                                                 |
| isDefault    | Required boolean, default false. At most one default address per account |
| createdAt    | Timestamp with time zone, default now                                    |
| updatedAt    | Timestamp with time zone, default now, set on update                     |

## Cart (`cart`)

One open cart per account. There is no guest cart.

| Field     | Rules                                                      |
| --------- | ---------------------------------------------------------- |
| id        | Primary key, UUID                                          |
| userId    | Required, unique, foreign key to `user.id`, cascade delete |
| createdAt | Timestamp with time zone, default now                      |
| updatedAt | Timestamp with time zone, default now, set on update       |

## Cart item (`cart_item`)

| Field     | Rules                                                        |
| --------- | ------------------------------------------------------------ |
| id        | Primary key, UUID                                            |
| cartId    | Required foreign key to `cart.id`, cascade delete            |
| variantId | Required foreign key to `product_variant.id`, cascade delete |
| quantity  | Required integer, greater than 0                             |
| createdAt | Timestamp with time zone, default now                        |
| updatedAt | Timestamp with time zone, default now, set on update         |

The combination of `cartId` and `variantId` is unique. Adding the same variant again updates this quantity.

## Order number sequence (`order_number_seq`)

PostgreSQL sequence starting at 10000, increment 1. The first allocated number is 10000.

## Customer order (`customer_order`)

The table name avoids the reserved SQL word `order`. The row is the placed checkout, not a draft cart.

| Field            | Rules                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| id               | Primary key, UUID                                                            |
| orderNumber      | Required text, unique, default `OY-` plus the next `order_number_seq` value  |
| userId           | Required foreign key to `user.id`, restrict delete                           |
| status           | Required text, default `pending_payment`. Allowed values below               |
| subtotalToman    | Required integer, greater than or equal to 0                                 |
| shippingToman    | Required integer, greater than or equal to 0                                 |
| discountToman    | Required integer, default 0, greater than or equal to 0                      |
| totalToman       | Required integer. Must equal `subtotalToman + shippingToman - discountToman` |
| shippingMethodId | Optional foreign key to `shipping_method.id`, set null on delete             |
| shippingNameFa   | Required snapshot of the method name                                         |
| shippingNameEn   | Required snapshot of the method name                                         |
| addressId        | Optional foreign key to `address.id`, set null on delete                     |
| receiverName     | Required snapshot                                                            |
| mobile           | Required snapshot, same `09#########` rule                                   |
| province, city   | Required snapshots, non-empty                                                |
| postalCode       | Required snapshot, 10 digits                                                 |
| addressLine      | Required snapshot, non-empty                                                 |
| paymentExpiresAt | Required timestamp with time zone                                            |
| trackingCode     | Optional text                                                                |
| paidAt           | Optional timestamp with time zone                                            |
| shippedAt        | Optional timestamp with time zone                                            |
| deliveredAt      | Optional timestamp with time zone                                            |
| cancelledAt      | Optional timestamp with time zone                                            |
| createdAt        | Timestamp with time zone, default now                                        |
| updatedAt        | Timestamp with time zone, default now, set on update                         |

Allowed `status` values:

| Status          | Meaning                                                             |
| --------------- | ------------------------------------------------------------------- |
| pending_payment | Order placed, stock reduced, waiting for the gateway                |
| paid            | A payment attempt succeeded                                         |
| processing      | The shop is preparing the parcel                                    |
| shipped         | The parcel has a tracking code                                      |
| delivered       | The customer received the parcel                                    |
| cancelled       | The order was cancelled. Stock is restored when it had been reduced |
| payment_failed  | The attempt failed or the payment window expired. Stock is restored |

The database checks that the status is one of these values. Transition order is an application rule:

- `pending_payment` may become `paid`, `payment_failed`, or `cancelled`.
- `paid` may become `processing` or `cancelled`.
- `processing` may become `shipped` or `cancelled`.
- `shipped` may become `delivered`.
- `delivered`, `cancelled`, and `payment_failed` do not move further.

## Order item (`order_item`)

Immutable snapshot of one variant at purchase time.

| Field          | Rules                                                         |
| -------------- | ------------------------------------------------------------- |
| id             | Primary key, UUID                                             |
| orderId        | Required foreign key to `customer_order.id`, cascade delete   |
| variantId      | Required foreign key to `product_variant.id`, restrict delete |
| productTitleFa | Required snapshot                                             |
| productTitleEn | Required snapshot                                             |
| productType    | Required snapshot, `tshirt` or `hoodie`                       |
| colorNameFa    | Required snapshot                                             |
| colorNameEn    | Required snapshot                                             |
| colorHex       | Required snapshot, `#` plus 6 hex digits                      |
| sizeCode       | Required snapshot                                             |
| sku            | Required snapshot                                             |
| unitPriceToman | Required integer, greater than or equal to 0                  |
| quantity       | Required integer, greater than 0                              |
| lineTotalToman | Required integer. Must equal `unitPriceToman * quantity`      |
| createdAt      | Timestamp with time zone, default now                         |

Do not delete a variant that an order item references. Set `isActive` to false instead.

## Payment (`payment`)

One row per online payment attempt. An order may have several attempts. No provider is chosen in this version.

| Field       | Rules                                                                              |
| ----------- | ---------------------------------------------------------------------------------- |
| id          | Primary key, UUID                                                                  |
| orderId     | Required foreign key to `customer_order.id`, cascade delete                        |
| status      | Required text, default `pending`. Allowed values: `pending`, `succeeded`, `failed` |
| amountToman | Required integer, greater than or equal to 0                                       |
| provider    | Required text, non-empty provider name                                             |
| authority   | Optional gateway token. Unique when present                                        |
| referenceId | Optional bank reference after success                                              |
| paidAt      | Optional timestamp with time zone                                                  |
| createdAt   | Timestamp with time zone, default now                                              |
| updatedAt   | Timestamp with time zone, default now, set on update                               |

## Relationships

- A product has many images and many variants.
- A color and a size are each used by many variants.
- An account has many addresses, at most one cart, and many orders.
- A cart has many items. A variant has many cart items.
- An order has many items and many payment attempts.
- An order may point at the address and shipping method that were used. Those links are optional so the snapshot survives if the address or method is removed.
- Deleting an account deletes its cart and addresses. Deleting an account that has an order is rejected.
- Deleting a product deletes its images and variants, unless an order item still references a variant.
- Deleting a variant deletes cart lines for that variant and is rejected when an order item references it.

## Invariants enforced in the database

- Unique product slug, unique sku, unique size code, unique color names
- Unique product, color, and size combination
- Unique order number
- Unique cart per account
- Unique cart line per variant
- At most one default address per account
- Unique payment authority when an authority is present
- Foreign keys with the delete behaviors listed above
- Product type and order-item type are `tshirt` or `hoodie`
- Order status and payment status are members of the closed sets above
- Non-negative prices, stock, shipping, and totals
- Positive cart and order quantities
- Compare-at price is either absent or higher than the product price
- Order total equals subtotal plus shipping minus discount
- Line total equals unit price times quantity
- Color hex, postal code, and Iranian mobile format
- Shipping maximum days are at least the minimum days

## Invariants enforced in application code

These rules are not implemented in this version. Later checkout code must follow them.

- Only a signed-in account can own a cart, an address, or an order. There is no guest cart.
- Placing an order runs in one database transaction. The transaction checks that each variant is active and has enough stock, inserts the order and items, decrements `stockQuantity` by the ordered quantity, and inserts a pending payment.
- The unit price copied onto an order item is the variant price when set, otherwise the product price.
- A failed payment, an expired `paymentExpiresAt`, or a cancellation of an order that still holds stock restores `stockQuantity` from the order items in one transaction.
- A succeeded payment sets the order to `paid` and sets `paidAt`.
- `discountToman` stays 0 until a later specification adds discount codes.
- Variant rows that appear on orders are deactivated, not deleted.
- Address and shipping snapshots are written at checkout and are not rewritten when the customer later edits the saved address or the shop edits the shipping method.

## Transactions

Use `db.transaction` for placing an order, restoring stock after a failed or expired payment, and any other change that writes the order, its items, its payment, and stock together. A single catalog insert does not need a transaction. Do not wrap read-only queries.
