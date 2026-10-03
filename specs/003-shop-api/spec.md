# Feature Specification: Shop HTTP API

**Feature Branch**: `003-shop-api`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Create the backend API services for the shop database: public catalog, signed-in cart and checkout, and admin catalog and order updates. No storefront and no payment gateway."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Browse published designs (Priority: P1)

A shopper lists published T-shirt and hoodie designs and opens one design by its slug. Each design includes its photos and the active color and size combinations that can be bought.

**Why this priority**: Nothing else in the shop can be shown until the catalog can be read.

**Independent Test**: Publish one hoodie with two active variants and one inactive variant. List products and open the slug. Confirm only the active variants are returned, and an unknown slug is rejected.

**Acceptance Scenarios**:

1. **Given** published and unpublished designs, **When** a caller lists products, **Then** only published designs are returned, with paging.
2. **Given** a published design, **When** a caller opens its slug, **Then** the response includes Persian and English names, price in toman, images, and active variants.
3. **Given** an unknown or unpublished slug, **When** a caller opens it, **Then** the response is not found.

---

### User Story 2 - Keep a cart and an Iranian address (Priority: P1)

A signed-in customer adds a color and size to one cart, saves a delivery address, and reads active shipping methods. Another customer cannot read or change those records.

**Why this priority**: Checkout needs a cart, an address, and a shipping method before an order exists.

**Independent Test**: Sign in, add the same variant twice, save a default address, and confirm a second account cannot read that cart or address.

**Acceptance Scenarios**:

1. **Given** a signed-in customer, **When** they add a variant that is already in the cart, **Then** the line quantity increases and still cannot exceed stock.
2. **Given** a cart line, **When** they send quantity 0 or delete the line, **Then** the line is removed.
3. **Given** a signed-out caller, **When** they read or change a cart or address, **Then** the response is unauthenticated.
4. **Given** a saved address marked default, **When** another address for that account is marked default, **Then** only the new one stays the default.

---

### User Story 3 - Place an online-payment order (Priority: P1)

A signed-in customer checks out the cart to one of their addresses and an active shipping method. Stock drops in the same transaction as the order. The customer can read only their own orders.

**Why this priority**: This is the purchase the data model was built to record.

**Independent Test**: Place an order for a variant with stock 2. Confirm stock is 1, the cart is empty, the total is subtotal plus shipping, and another account cannot read the order number.

**Acceptance Scenarios**:

1. **Given** a cart, an address, and an active shipping method, **When** the customer places an order, **Then** the order is `pending_payment`, a pending payment is stored with provider `unassigned`, and the payment window is 30 minutes.
2. **Given** a line that is inactive, unpublished, or short on stock, **When** the customer places an order, **Then** nothing is stored and stock does not change.
3. **Given** an order number that belongs to someone else, **When** the customer reads it, **Then** the response is not found.

---

### User Story 4 - Administer the catalog and the order (Priority: P2)

An administrator creates and updates colors, sizes, designs, photos, variants, and shipping methods, moves an order through fulfillment, and records a payment result. A customer cannot call these operations.

**Why this priority**: The shop cannot be stocked or fulfilled without an administrator path, and no payment gateway is selected yet.

**Independent Test**: Call an admin route as a customer and confirm it is forbidden. As an administrator, record a failed payment and confirm stock returns.

**Acceptance Scenarios**:

1. **Given** a signed-in customer who is not an administrator, **When** they call an admin shop route, **Then** the response is forbidden.
2. **Given** a duplicate slug, sku, color name, or size code, **When** an administrator saves it, **Then** the response is a conflict.
3. **Given** a variant that appears on an order, **When** an administrator deletes it, **Then** the response is a conflict.
4. **Given** a `pending_payment` order, **When** an administrator records success, **Then** the order becomes `paid`.
5. **Given** a `pending_payment` order, **When** an administrator records failure, **Then** the order becomes `payment_failed` and stock is restored.
6. **Given** a paid order, **When** an administrator marks it shipped without a tracking code, **Then** the response is invalid.

### Edge Cases

- The cart is empty at checkout: the order is rejected.
- Quantity added to a cart line would exceed stock: the line is unchanged.
- The payment window has expired: an administrator cannot record success and can record failure, which restores stock.
- Cancelling an order that still holds stock restores that stock. Cancelling is refused after the order is shipped, delivered, or already failed.
- A second default address for one account is rejected by the database if the clear-and-set steps are not in one transaction. The API performs those steps in one transaction.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Published products and active shipping methods MUST be readable without a session.
- **FR-002**: Cart, address, and order routes MUST require a session and MUST use the session account id.
- **FR-003**: Admin shop routes MUST require the `admin` role.
- **FR-004**: Placing an order MUST decrement stock, insert the order, insert the line snapshots, insert a pending payment, and clear the cart in one database transaction.
- **FR-005**: A failed payment and a cancellation of an order that still holds stock MUST restore stock in one database transaction.
- **FR-006**: Money in requests and responses MUST be integers in toman.
- **FR-007**: Responses MUST use `{ success: true, data }` and the existing error codes.
- **FR-008**: This version MUST NOT call a payment gateway and MUST NOT add shop pages.

### Key Entities

The entities are the tables in `specs/002-shop-catalog/data-model.md`. This specification adds HTTP access to them.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A caller can list published products and open one slug without signing in.
- **SC-002**: A signed-in customer can add a variant, save an address, place an order, and read that order back.
- **SC-003**: A non-administrator receives forbidden on every admin shop route.
- **SC-004**: After a recorded payment failure, variant stock matches the stock from before checkout.

## Assumptions

- The payment provider name on a new order is `unassigned`.
- The payment window is 30 minutes from placement. No background job expires orders; an administrator records the result.
- Discount amount stays 0.
- Shopper-facing records return both Persian and English fields. Error messages stay in English, matching the foundation API.
- Route paths live on `EApiRoutes`. Dynamic segments use a colon placeholder such as `/api/products/:slug`.
