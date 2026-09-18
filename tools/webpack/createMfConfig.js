const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');

const { ModuleFederationPlugin } = webpack.container;
const rootDir = path.resolve(__dirname, '../..');

function loadEnv(appDir) {
  const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
  const merged = {};
  for (const file of ['.env', `.env.${mode}`]) {
    const full = path.join(appDir, file);
    if (fs.existsSync(full)) {
      Object.assign(merged, dotenv.parse(fs.readFileSync(full)));
    }
  }
  return { ...merged, ...process.env };
}

function createMfConfig({ appDir, name, port, remotes, exposes }) {
  const env = loadEnv(appDir);
  const isProd = process.env.NODE_ENV === 'production';
  const publicPath = env.PUBLIC_URL || `http://localhost:${port}/`;
  const remoteMap = typeof remotes === 'function' ? remotes(env) : remotes || {};

  return {
    context: appDir,
    entry: path.join(appDir, 'src/index.ts'),
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : 'cheap-module-source-map',
    output: {
      uniqueName: name,
      publicPath,
      path: path.join(appDir, 'dist'),
      filename: isProd ? '[name].[contenthash].js' : '[name].js',
      clean: true
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@meridian/shared-types': path.join(rootDir, 'libs/shared-types/src/index.ts'),
        '@meridian/shared-ui': path.join(rootDir, 'libs/shared-ui/src/index.ts'),
        '@meridian/state': path.join(rootDir, 'libs/state/src/index.ts'),
        '@meridian/events': path.join(rootDir, 'libs/events/src/index.ts'),
        '@meridian/utilities': path.join(rootDir, 'libs/utilities/src/index.ts')
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          include: [path.join(appDir, 'src'), path.join(rootDir, 'libs')],
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: 'esnext',
                jsx: 'react-jsx',
                sourceMap: true
              }
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    devServer: {
      port,
      hot: true,
      historyApiFallback: !exposes,
      headers: { 'Access-Control-Allow-Origin': '*' },
      static: path.join(appDir, 'public'),
      client: { overlay: true }
    },
    plugins: [
      new ModuleFederationPlugin({
        name,
        filename: 'remoteEntry.js',
        remotes: remoteMap,
        exposes: exposes || {},
        shared: {
          react: { singleton: true, requiredVersion: false },
          'react-dom': { singleton: true, requiredVersion: false },
          'react-router-dom': { singleton: true, requiredVersion: false },
          zustand: { singleton: true, requiredVersion: false }
        }
      }),
      new HtmlWebpackPlugin({
        template: path.join(appDir, 'public/index.html'),
        title: 'Meridian Market'
      }),
      new webpack.DefinePlugin({
        'process.env.API_URL': JSON.stringify(env.API_URL || 'http://localhost:3000'),
        'process.env.AUTH_URL': JSON.stringify(env.AUTH_URL || env.API_URL || 'http://localhost:3000'),
        'process.env.REMOTE_PRODUCTS_URL': JSON.stringify(env.REMOTE_PRODUCTS_URL || 'http://localhost:4201'),
        'process.env.REMOTE_CART_URL': JSON.stringify(env.REMOTE_CART_URL || 'http://localhost:4202'),
        'process.env.REMOTE_ORDERS_URL': JSON.stringify(env.REMOTE_ORDERS_URL || 'http://localhost:4203'),
        'process.env.PUBLIC_URL': JSON.stringify(publicPath)
      })
    ]
  };
}

module.exports = createMfConfig;
