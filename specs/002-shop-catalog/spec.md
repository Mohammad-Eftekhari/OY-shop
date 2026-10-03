# Feature Specification: Shop Catalog and Checkout Data

**Feature Branch**: `002-shop-catalog`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "A first-version online shop that sells T-shirt and hoodie designs. Each design is its own product. The shopper picks a color and a size. Checkout is for signed-in customers and online payment only, following the usual Persian fashion-store path of cart, Iranian address, shipping, and payment."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Store a design as a product (Priority: P1)

A merchandiser records one design as either a T-shirt or a hoodie, with Persian and English names, a price in toman, optional compare-at price, photos, and the colors and sizes that design is actually sold in. Stock is kept on each color and size combination, not on the design as a whole.

**Why this priority**: Nothing can be sold until a design, its options, and its stock exist as stored records.

**Independent Test**: Insert a published hoodie design with two colors and two sizes and confirm the database accepts only those four sellable combinations, each with its own stock.

**Acceptance Scenarios**:

1. **Given** a new design, **When** it is stored as a T-shirt or a hoodie with a unique slug and bilingual title, **Then** the record is kept with a price in whole toman.
2. **Given** a design, **When** a color and size combination is added, **Then** that combination has its own sku and stock count, and the same color and size cannot be added twice for that design.
3. **Given** a design that is not offered in a size, **When** the catalog is stored, **Then** that size has no variant row for that design.
4. **Given** a photo that belongs to one color, **When** it is stored, **Then** it stays attached to that color. A photo with no color stays a general photo of the design.

---

### User Story 2 - Keep a cart for a signed-in customer (Priority: P1)

A signed-in customer has one open cart. Adding the same color and size again increases the quantity instead of creating a second line.

**Why this priority**: The Persian fashion checkout path starts from a saved cart before address and payment.

**Independent Test**: Add a variant twice for one account and confirm a single cart line whose quantity is the sum.

**Acceptance Scenarios**:

1. **Given** a signed-in customer, **When** they have a cart, **Then** they have at most one cart.
2. **Given** a cart that already contains a variant, **When** that variant is added again, **Then** the existing line quantity increases.
3. **Given** a cart line, **When** its quantity is stored, **Then** the quantity is at least 1.

---

### User Story 3 - Place an online-payment order (Priority: P1)

A signed-in customer checks out to a saved Iranian address and a shipping method. The order copies the address, shipping name, and the design, color, size, sku, and unit price onto the order so later catalog edits do not rewrite history. Payment is online only. Stock is reduced when the order is placed and restored if payment fails or expires.

**Why this priority**: This is the purchase record the rest of the shop will read.

**Independent Test**: Place an order for a variant with stock 2, confirm stock becomes 1 and the order total equals subtotal plus shipping, then mark the payment failed and confirm the documented restore rule applies to that order's quantities.

**Acceptance Scenarios**:

1. **Given** a signed-in customer with a saved address and an active shipping method, **When** an order is placed, **Then** the order stores a human order number, the address snapshot, the shipping snapshot, and a pending payment.
2. **Given** an order, **When** its money columns are stored, **Then** the total equals subtotal plus shipping minus discount, and discount is 0 until a later feature adds codes.
3. **Given** a successful payment, **When** it is recorded, **Then** the order can move to paid and then through processing, shipped, and delivered.
4. **Given** a failed or expired payment, **When** the order is closed as payment failed or cancelled, **Then** the sold quantities are available to restore to stock.
5. **Given** an account that already has an order, **When** deletion of that account is attempted, **Then** the database rejects the deletion.

---

### Edge Cases

- A second variant with the same product, color, and size is rejected.
- A second sku is rejected.
- Stock, prices, and totals cannot be negative. Cart and order quantities cannot be zero.
- A compare-at price is stored only when it is higher than the selling price.
- A color hex value must be a 6-digit RGB color. A postal code must be 10 digits. A mobile number must be an Iranian mobile in `09#########` form.
- Two default addresses for the same account are rejected. Other saved addresses for that account are allowed.
- A variant that appears on an order cannot be deleted. It is retired by marking it inactive.
- Deleting a variant that is only in a cart removes that cart line.
- Guest checkout, cash on delivery, discount codes, and city-based shipping rates are not stored in this version.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The catalog MUST store each design as one product whose type is `tshirt` or `hoodie`.
- **FR-002**: A product MUST have a unique slug, Persian and English titles, Persian and English descriptions, and a non-negative price in whole toman.
- **FR-003**: Colors and sizes MUST be reusable records. A sellable variant MUST be one product, one color, and one size, with a unique sku and a non-negative stock count.
- **FR-004**: Product photos MUST be orderable and MAY belong to one color.
- **FR-005**: A customer MUST have at most one cart, and a cart line MUST be unique per variant.
- **FR-006**: A customer MUST be able to save Iranian shipping addresses, with at most one default address.
- **FR-007**: Shipping methods MUST store a bilingual name, a flat toman price, and an estimated day range.
- **FR-008**: An order MUST belong to a signed-in account, MUST snapshot address and line items, and MUST use online payment only.
- **FR-009**: Order numbers MUST be unique and allocated from a database sequence.
- **FR-010**: An order MUST be able to record more than one payment attempt. Gateway details MUST stay provider-neutral: provider name, authority, and reference id.
- **FR-011**: Money MUST be stored as integers in toman. The order total MUST equal subtotal plus shipping minus discount.
- **FR-012**: Accounts, sessions, and profiles from the foundation MUST remain unchanged.

### Key Entities

- **Color**: A reusable swatch with Persian and English names and a hex value.
- **Size**: A shared size code such as `S` or `XL`, with Persian and English labels.
- **Product**: One design, either a T-shirt or a hoodie.
- **Product image**: A photo of a product, optionally tied to a color.
- **Product variant**: The sellable color and size of a product, with sku and stock.
- **Shipping method**: A flat-price delivery option.
- **Address**: A customer's saved Iranian delivery address.
- **Cart** and **Cart item**: The single open cart for an account.
- **Customer order** and **Order item**: The placed order and its immutable line snapshots.
- **Payment**: One online payment attempt for an order.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A committed migration creates the catalog, cart, address, shipping, order, and payment tables without changing the foundation account tables.
- **SC-002**: The database rejects duplicate slugs, duplicate skus, duplicate color-size pairs, a second cart for one account, a second default address, negative money, and negative stock.
- **SC-003**: An order row can be read after the related address or shipping method is removed, because the snapshot columns remain.
- **SC-004**: Deleting an account that has an order is rejected by the foreign key.

## Assumptions

- Shoppers already sign in with email and password. This version does not add guest checkout or mobile login.
- Prices are displayed and stored in toman. One toman is ten rials. Rials are not stored.
- The first version uses a flat shipping price per method. Rates that change by city can be added later.
- Discount codes are not a table yet. The order still has a discount amount so the total formula does not change later. That amount stays 0.
- No payment provider is selected yet. The payment columns match the usual Iranian redirect flow.
- Persian and English copy are both stored on catalog and shipping records because the application already switches language.
- This version stores the schema only. It does not add pages, route handlers, or seed products.
