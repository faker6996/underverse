export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
    REFRESH: "/api/auth/refresh",
    CHANGE_PASSWORD: "/api/auth/change-password",
    SSO_FACEBOOK: "/api/auth/sso_facebook",
    SSO_GOOGLE: "/api/auth/sso_google",
    SSO_GOOGLE_GET_TOKEN: "https://oauth2.googleapis.com/token",
    SSO_GOOGLE_GET_INFO: "https://www.googleapis.com/oauth2/v2/userinfo",
    SSO_FACEBOOK_GET_TOKEN: "https://graph.facebook.com/v12.0/oauth/access_token",
    SSO_FACEBOOK_GET_INFO: "https://graph.facebook.com/me",
  },
  UPLOAD: {
    IMAGE: "/api/upload/image",
    PRODUCT_IMAGE: "/api/upload/product-image",
    BANK_QR: "/api/upload/bank-qr",
  },
  USERS: {
    LIST: "/api/users",
    ITEM: (id: number | string) => `/api/users/${id}`,
  },
  CART: {
    BASE: "/api/cart",
    ITEM: (id: number | string) => `/api/cart/${id}`,
    SUMMARY: "/api/cart/summary",
    VALIDATE: "/api/cart/validate",
    CLEAR: "/api/cart/clear",
    TRANSFER: "/api/cart/transfer",
  },
  ORDERS: {
    BASE: "/api/orders",
    ITEM: (id: number | string) => `/api/orders/${id}`,
  },
  PRODUCTS: {
    BASE: "/api/products",
    ITEM: (id: number | string) => `/api/products/${id}`,
    BESTSELLERS: "/api/products/bestsellers",
    NEXT_CODE: "/api/products/next-code",
  },
  CATEGORIES: {
    BASE: "/api/categories",
    ITEM: (id: number | string) => `/api/categories/${id}`,
  },
  TAGS: {
    BASE: "/api/tags",
    ITEM: (id: number | string) => `/api/tags/${id}`,
  },
  COLORS: {
    BASE: "/api/colors",
    ITEM: (id: number | string) => `/api/colors/${id}`,
  },
  VOUCHERS: {
    BASE: "/api/vouchers",
    ITEM: (id: number | string) => `/api/vouchers/${id}`,
    VALIDATE: "/api/vouchers/validate",
  },
  SHIPPING: {
    BASE: "/api/shipping",
    ITEM: (id: number | string) => `/api/shipping/${id}`,
    CALCULATE: "/api/shipping/calculate",
  },
  REVIEWS: {
    BASE: "/api/reviews",
    PRODUCT: (productId: number | string) => `/api/reviews?productId=${productId}`,
  },
  FAVORITES: {
    BASE: "/api/favorites",
    ITEM: (id: number | string) => `/api/favorites/${id}`,
    CLEAR: "/api/favorites/clear",
  },
  ME: {
    ROLE: "/api/me/role",
  },

  SEARCH: {
    USER_NAME: (user_name: string) => `/api/search/user?user_name=${user_name}`,
  },
  RESET_PASSWORD: {
    REQUEST: `/api/forgot-password`,
    RESET: "/api/reset-password",
  },

  NOTIFICATIONS: {
    LIST: "/api/notifications", // GET ?page=1&pageSize=10
    UPDATE: "/api/notifications", // PATCH { action: 'mark_all_read' | 'clear_all' }
    BROADCAST: "/api/notifications/broadcast", // POST admin only
    SEND: "/api/notifications/send", // POST send to specific user
    SENT: "/api/notifications/sent",
  },
  ADMIN: {
    PRICING: {
      BASE: "/api/admin/pricing",
      BULK: "/api/admin/pricing/bulk",
      PROMOTION: "/api/admin/pricing/promotion",
      ANALYTICS: "/api/admin/pricing/analytics",
    },
  },
  BILLING: {
    ...(typeof (undefined as any) !== "undefined" && {}), // placeholder to keep structure stable
    TOKENS: {
      BALANCE: "/api/billing/tokens/balance",
      USAGE: "/api/billing/tokens/usage",
    },
  },
  PAYMENTS: {
    CREATE: "/api/payments/create",
    LIST: "/api/payments",
    STATUS: (id: number | string) => `/api/payments/${id}/status`,
    REDIRECT: {
      BAOKIM_QR: "/api/payments/redirect/baokim-qr",
    },
  },
  ADDRESSES: {
    BASE: "/api/addresses",
    ITEM: (id: number | string) => `/api/addresses/${id}`,
  },
  PAYMENT_METHODS: {
    BASE: "/api/payment-methods",
  },
  PAYMENT_ACCOUNTS: {
    BASE: "/api/payment-accounts",
    ADMIN: {
      BASE: "/api/admin/payment-accounts",
      ITEM: (id: number | string) => `/api/admin/payment-accounts/${id}`,
    },
  },
  PROVINCES: {
    BASE: "/api/provinces",
  },
  WARDS: {
    BY_PROVINCE: (provinceId: number | string) => `/api/wards?province_id=${provinceId}`,
  },
  UTILS: {
    VERIFY_EMAIL: "/api/utils/verify-email",
  },
};
