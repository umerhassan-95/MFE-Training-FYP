const createMfConfig = require('../../tools/webpack/createMfConfig');

module.exports = createMfConfig({
  appDir: __dirname,
  name: 'cart',
  port: 4202,
  exposes: {
    './App': './src/App.tsx'
  }
});
