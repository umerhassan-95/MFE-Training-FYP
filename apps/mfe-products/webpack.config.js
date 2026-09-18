const createMfConfig = require('../../tools/webpack/createMfConfig');

module.exports = createMfConfig({
  appDir: __dirname,
  name: 'products',
  port: 4201,
  exposes: {
    './App': './src/App.tsx'
  }
});
