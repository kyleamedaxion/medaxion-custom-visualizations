const path = require("path");
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: "development",
  entry: {
    // table: "./src/customVis.js",
    bell: "./src/bell.js",
  },
  devServer: {
    static: "./dist",
    port: 8080,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    server: {
      type: 'https',
    },
  },

  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
        exclude: /node_modules/,
        include: /src/,
        sideEffects: false,
      },
      { test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },

    ],
  },
  resolve: {
    extensions: [".jsx", ".js", ".css"],
    fallback: {
      "child_process": false,
      "worker_threads": false,
      "uglify-js": false,
      "@swc/core": false,
      "esbuild": false,
      "module": false,
      "fs": false,
      "path": require.resolve("path-browserify"),
      "util": require.resolve("util/"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
      "assert": require.resolve("assert/"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "url": require.resolve("url/"),
      "process": require.resolve("process/browser")
    },
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  devtool: "source-map",
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    "styled-components": "styled",
    "react-table": "ReactTable",
  },
};
