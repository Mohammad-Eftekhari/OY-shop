export const EAppRoutes = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  profile: "/profile",
  apiDocs: "/api-docs",
} as const;

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
