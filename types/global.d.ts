declare namespace NodeJS {
  interface ProcessEnv {
    API_URL: string;
    AUTH_URL: string;
    REMOTE_PRODUCTS_URL: string;
    REMOTE_CART_URL: string;
    REMOTE_ORDERS_URL: string;
    PUBLIC_URL: string;
  }
}

declare module '*.css';
