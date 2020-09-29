const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    circularSlider: "./src/circular-slider.js",
  },
  devServer: {
    contentBase: "./dist",
    writeToDisk: true,
    inline: true,
    hot: true,
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "My circular slider",
      template: "assets/index.html",
    }),
  ],
};
