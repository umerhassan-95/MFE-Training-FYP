const createMfConfig = require('../../tools/webpack/createMfConfig');

module.exports = createMfConfig({
  appDir: __dirname,
  name: 'gateway',
  port: 4200,
  remotes: (env) => ({
    products: `products@${(env.REMOTE_PRODUCTS_URL || 'http://localhost:4201').replace(/\/$/, '')}/remoteEntry.js`,
    cart: `cart@${(env.REMOTE_CART_URL || 'http://localhost:4202').replace(/\/$/, '')}/remoteEntry.js`,
    orders: `orders@${(env.REMOTE_ORDERS_URL || 'http://localhost:4203').replace(/\/$/, '')}/remoteEntry.js`
  })
});
