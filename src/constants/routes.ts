export const EAppRoutes = {
  home: "/",
  products: "/products",
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  profile: "/profile",
  cart: "/cart",
  checkout: "/checkout",
  addresses: "/addresses",
  orders: "/orders",
  apiDocs: "/api-docs",
} as const;

export function productPath(slug: string) {
  return `${EAppRoutes.products}/${encodeURIComponent(slug)}`;
}

export function orderPath(orderNumber: string) {
  return `${EAppRoutes.orders}/${encodeURIComponent(orderNumber)}`;
}

export function cartItemPath(variantId: string) {
  return `/api/cart/items/${encodeURIComponent(variantId)}`;
}

export function orderApiPath(orderNumber: string) {
  return `/api/orders/${encodeURIComponent(orderNumber)}`;
}

export const EApiRoutes = {
  health: "/api/health",
  me: "/api/me",
  profile: "/api/profile",
  adminStatus: "/api/admin/status",
  openapi: "/api/openapi",
  products: "/api/products",
  product: "/api/products/:slug",
  shippingMethods: "/api/shipping-methods",
  cart: "/api/cart",
  cartItems: "/api/cart/items",
  cartItem: "/api/cart/items/:variantId",
  addresses: "/api/addresses",
  address: "/api/addresses/:addressId",
  orders: "/api/orders",
  order: "/api/orders/:orderNumber",
  adminColors: "/api/admin/shop/colors",
  adminColor: "/api/admin/shop/colors/:colorId",
  adminSizes: "/api/admin/shop/sizes",
  adminSize: "/api/admin/shop/sizes/:sizeId",
  adminProducts: "/api/admin/shop/products",
  adminProduct: "/api/admin/shop/products/:productId",
  adminProductImages: "/api/admin/shop/products/:productId/images",
  adminImage: "/api/admin/shop/images/:imageId",
  adminProductVariants: "/api/admin/shop/products/:productId/variants",
  adminVariant: "/api/admin/shop/variants/:variantId",
  adminShippingMethods: "/api/admin/shop/shipping-methods",
  adminShippingMethod: "/api/admin/shop/shipping-methods/:shippingMethodId",
  adminOrder: "/api/admin/shop/orders/:orderNumber",
  adminOrderPayment: "/api/admin/shop/orders/:orderNumber/payment",
} as const;

export type TAppRoute = (typeof EAppRoutes)[keyof typeof EAppRoutes];
export type TApiRoute = (typeof EApiRoutes)[keyof typeof EApiRoutes];
