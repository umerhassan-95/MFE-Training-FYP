const createMfConfig = require('../../tools/webpack/createMfConfig');

module.exports = createMfConfig({
  appDir: __dirname,
  name: 'orders',
  port: 4203,
  exposes: {
    './App': './src/App.tsx'
  }
});
