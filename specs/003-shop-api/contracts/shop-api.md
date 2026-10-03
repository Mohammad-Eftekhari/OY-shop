# Contract: Shop API

Every success body is `{ success: true, data }`. Every error body is `{ success: false, error: { code, message, details? } }`.

Authentication uses the session cookie. Admin routes also require role `admin`. A missing session is `401 UNAUTHENTICATED`. A signed-in non-administrator on an admin route is `403 FORBIDDEN`.

List routes accept `page` (default 1) and `pageSize` (default 20, maximum 100). The data shape is `{ items, page, pageSize, total }`.

Money fields are integers in toman. Text responses include both `fa` and `en` fields. Timestamps are ISO-8601 strings.

## Public catalog

### `GET /api/products`

Authentication: none.

Query: `page`, `pageSize`, optional `type` of `tshirt` or `hoodie`.

Returns published products. Each product includes images and active variants. A variant includes its color, size, sku, stock, and optional price override.

### `GET /api/products/:slug`

Authentication: none.

Returns one published product. Unknown or unpublished slugs are `404 NOT_FOUND`.

### `GET /api/shipping-methods`

Authentication: none.

Returns active shipping methods ordered by `sortOrder`.

## Cart

Authentication: required.

### `GET /api/cart`

Returns the caller's lines. An account with no cart returns an empty item list.

### `PUT /api/cart/items`

Body: `{ variantId, quantity }`.

`quantity` greater than 0 adds that many units to the existing line, or creates the line. The resulting quantity cannot exceed stock. The variant must be active and belong to a published product. Otherwise the response is `404 NOT_FOUND` or `422 BUSINESS_RULE`.

`quantity` 0 removes the line. A missing line is `404 NOT_FOUND`.

Returns the cart.

### `DELETE /api/cart/items/:variantId`

Removes one line and returns the cart. A missing line is `404 NOT_FOUND`.

## Addresses

Authentication: required. Rows are limited to the caller.

### `GET /api/addresses`

Returns the caller's addresses.

### `POST /api/addresses`

Body: `receiverName`, `mobile` (`09` plus 9 digits), `province`, `city`, `postalCode` (10 digits), `addressLine`, optional `isDefault`.

When `isDefault` is true, the previous default for that account is cleared in the same transaction.

Returns the address with status `201`.

### `PATCH /api/addresses/:addressId`

Partial update of the caller's address. Setting `isDefault` to true clears the other default in the same transaction. Another account's address is `404 NOT_FOUND`.

### `DELETE /api/addresses/:addressId`

Deletes the caller's address. Returns `{ id }`.

## Orders

Authentication: required.

### `POST /api/orders`

Body: `{ addressId, shippingMethodId }`.

Places the caller's cart. The address must belong to the caller. The shipping method must be active. An empty cart, an unavailable line, or insufficient stock is `422 BUSINESS_RULE` and writes nothing.

On success, status `201`, the order is `pending_payment`, `discountToman` is 0, stock is reduced, the cart is empty, and one payment row is `pending` with provider `unassigned`. `paymentExpiresAt` is 30 minutes after placement.

### `GET /api/orders`

Returns the caller's orders, newest first.

### `GET /api/orders/:orderNumber`

Returns one of the caller's orders, including line snapshots and payment attempts. Another account's order number is `404 NOT_FOUND`.

## Admin catalog

Authentication: administrator.

Create routes return `201`. Update routes return `200`. Duplicate slug, sku, color name, size code, or color-size pair is `409 CONFLICT`.

- `POST /api/admin/shop/colors` and `PATCH /api/admin/shop/colors/:colorId`
- `POST /api/admin/shop/sizes` and `PATCH /api/admin/shop/sizes/:sizeId`
- `POST /api/admin/shop/products` and `PATCH /api/admin/shop/products/:productId`
- `POST /api/admin/shop/products/:productId/images` and `PATCH /api/admin/shop/images/:imageId`
- `POST /api/admin/shop/products/:productId/variants`, `PATCH /api/admin/shop/variants/:variantId`, and `DELETE /api/admin/shop/variants/:variantId`
- `POST /api/admin/shop/shipping-methods` and `PATCH /api/admin/shop/shipping-methods/:shippingMethodId`

Color body: `nameFa`, `nameEn`, `hex` (`#` plus 6 hex digits), optional `sortOrder`.

Size body: `code`, `labelFa`, `labelEn`, optional `sortOrder`.

Product body: `type`, `slug`, `titleFa`, `titleEn`, optional descriptions, `priceToman`, optional `compareAtPriceToman`, optional `isPublished`. A compare-at price must be higher than the selling price.

Image body: `url`, optional `altFa`, `altEn`, `sortOrder`, and optional `colorId`.

Variant body: `colorId`, `sizeId`, `sku`, `stockQuantity`, optional `priceToman`, optional `isActive`.

Shipping body: `nameFa`, `nameEn`, `priceToman`, `estimatedDaysMin`, `estimatedDaysMax`, optional `isActive`, optional `sortOrder`. The maximum day must be at least the minimum day.

`DELETE /api/admin/shop/variants/:variantId` returns `{ id }`. A variant referenced by an order is `409 CONFLICT`. Deactivate it with `isActive: false` instead.

Unknown ids are `404 NOT_FOUND`.

## Admin orders

### `PATCH /api/admin/shop/orders/:orderNumber`

Body: `{ status }` where status is `processing`, `delivered`, or `cancelled`, or `{ status: "shipped", trackingCode }`.

Allowed moves:

- `pending_payment`, `paid`, or `processing` may become `cancelled`.
- `paid` may become `processing`.
- `processing` may become `shipped`.
- `shipped` may become `delivered`.

Any other move is `422 BUSINESS_RULE`. Cancellation restores stock when the order still holds it (`pending_payment`, `paid`, or `processing`). Shipped without a tracking code is `400 VALIDATION_ERROR`.

### `POST /api/admin/shop/orders/:orderNumber/payment`

Body: `{ status: "succeeded" | "failed" }`.

The order must be `pending_payment`. Success after `paymentExpiresAt` is `422 BUSINESS_RULE`. Success sets the order to `paid`. Failure sets `payment_failed` and restores stock. Both writes happen in one transaction.
