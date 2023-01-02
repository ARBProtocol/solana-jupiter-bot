const { ProvidePlugin } = require('webpack');
const path = require('node:path');

const pkg = require(path.resolve(process.cwd(), 'package.json'));
const VERSION = pkg.version;

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '#application': path.resolve(process.cwd(), './src/application/'),
      '#domain': path.resolve(process.cwd(), './src/domain/'),
      '#infrastructure': path.resolve(process.cwd(), './src/infrastructure'),
      '#utils': path.resolve(process.cwd(), './src/utils/'),
    },
  },
  resolveLoader: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  plugins: [
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  output: {
    filename: `index.js?v=${VERSION}`,
    library: {
      name: 'solana-flash-loan-sdk',
      type: 'umd',
    },
    path: path.resolve('.', 'build'),
    publicPath: '/build/',
    umdNamedDefine: true,
  },
};
