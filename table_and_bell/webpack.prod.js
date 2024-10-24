const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    // table: "./src/customVis.js",
    bell: "./src/bell.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      { test: /\.(js|jsx)$/i, use: "babel-loader" },
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },
    ],
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
    "styled-components": "styled",
    "react-table": "ReactTable",
  },
};
