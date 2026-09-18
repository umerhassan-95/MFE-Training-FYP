import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  define: {
    'process.env.API_URL': JSON.stringify('http://localhost:3000')
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['libs/**/*.test.ts', 'libs/**/*.test.tsx', 'apps/**/*.test.ts', 'apps/**/*.test.tsx']
  },
  resolve: {
    alias: {
      '@meridian/shared-types': path.resolve(__dirname, 'libs/shared-types/src/index.ts'),
      '@meridian/shared-ui': path.resolve(__dirname, 'libs/shared-ui/src/index.ts'),
      '@meridian/state': path.resolve(__dirname, 'libs/state/src/index.ts'),
      '@meridian/events': path.resolve(__dirname, 'libs/events/src/index.ts'),
      '@meridian/utilities': path.resolve(__dirname, 'libs/utilities/src/index.ts'),
      'products/App': path.resolve(__dirname, 'apps/gateway/src/__mocks__/products-app.tsx'),
      'cart/App': path.resolve(__dirname, 'apps/gateway/src/__mocks__/cart-app.tsx'),
      'orders/App': path.resolve(__dirname, 'apps/gateway/src/__mocks__/orders-app.tsx')
    }
  }
});
