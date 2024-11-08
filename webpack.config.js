let path = require("path");

let webpackConfig = {
  mode: "development",
  entry: {
    lineAreaOverlap: "./src/visualizations/line-area-overlap.ts",
    ganttD3: "./src/visualizations/gantt-d3.ts",
    floatingBars: "./src/visualizations/floating-bars.ts",
  },
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js", ".scss", ".css",  ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.js|jsx$/,
        exclude: /node_modules\/(?!highcharts|highcharts-more)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      { test: /\.ts$/, use: "ts-loader" },
      { test: /\.css$/, use: ["to-string-loader", "css-loader"] },
    ],
  },
  devServer: {
    compress: true,
    port: 8080,
    server: {
      type: 'https'
    },
  },
};

module.exports = webpackConfig;